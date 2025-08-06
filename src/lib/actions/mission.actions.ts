'use server'

import { revalidatePath } from "next/cache";
import prisma from "../prisma/prisma";
import { getSessionUser } from "../auth";
import { getPropertyOwner, getTroopConfigurations } from "../data";
import { calcularDistancia, calcularVelocidadFlota, calcularDuracionViaje, convertirACoordenadasVirtuales, calcularCosteMision } from "../formulas/mission-formulas";
import { ID_TROPA_ESPIA, ID_TROPA_OCUPACION, MISSION_TYPES_NO_RETURN, TROOP_TYPE_OCCUPY, TROOP_TYPE_SPY } from "../constants";
import type { MissionInput } from "../types";
import { MessageCategory } from "@prisma/client";

export async function enviarMision(input: MissionInput) {
    const user = await getSessionUser();
    if (!user) {
        return { error: "Usuario no autenticado." };
    }

    const { origenPropiedadId, coordinates, tropas, tipo } = input;
    const origenPropiedad = user.propiedades.find(p => p.id === origenPropiedadId);

    if (!origenPropiedad) {
        return { error: "Propiedad de origen no encontrada." };
    }

    if (!coordinates.ciudad || !coordinates.barrio || !coordinates.edificio) {
        return { error: "Coordenadas incompletas." };
    }
     if (tropas.length === 0 || tropas.every(t => t.cantidad === 0)) {
        return { error: "Debes seleccionar al menos una tropa." };
    }

    const tropasPropiedadMap = new Map(origenPropiedad.TropaUsuario.map(t => [t.configuracionTropa.id, t.cantidad]));

    for (const tropa of tropas) {
        if ((tropasPropiedadMap.get(tropa.id) || 0) < tropa.cantidad) {
            return { error: `No tienes suficientes unidades de una de las tropas seleccionadas en ${origenPropiedad.nombre}.` };
        }
    }
    
    if (tipo === TROOP_TYPE_SPY) {
        const tropaEspia = tropas.find(t => t.id === ID_TROPA_ESPIA && t.cantidad > 0);
        if (!tropaEspia) {
            return { error: "Necesitas enviar al menos una tropa de Espionaje para esta misión." };
        }
    }
    
    const targetOwner = await getPropertyOwner(coordinates);

    if (tipo === TROOP_TYPE_OCCUPY) {
        const tropaOcupacion = tropas.find(t => t.id === ID_TROPA_OCUPACION && t.cantidad > 0);
        if (!tropaOcupacion) {
            return { error: "Necesitas enviar al menos una Tropa de Ocupación para esta misión." };
        }
        if (targetOwner) {
            return { error: "No puedes ocupar una propiedad que ya tiene dueño." };
        }
        
        try {
            await prisma.$transaction(async (tx) => {
                const allRoomConfigs = await tx.configuracionHabitacion.findMany();
                await tx.propiedad.create({
                    data: {
                        userId: user.id,
                        nombre: `Colonia en ${coordinates.ciudad}:${coordinates.barrio}`,
                        ciudad: coordinates.ciudad,
                        barrio: coordinates.barrio,
                        edificio: coordinates.edificio,
                        armas: 10000,
                        municion: 10000,
                        alcohol: 10000,
                        dolares: 10000,
                        habitaciones: {
                            create: allRoomConfigs.map(config => ({
                                configuracionHabitacionId: config.id,
                                nivel: 1
                            }))
                        }
                    }
                });

                await tx.tropaUsuario.update({
                    where: { propiedadId_configuracionTropaId: { propiedadId: origenPropiedadId, configuracionTropaId: 'ocupacion' } },
                    data: { cantidad: { decrement: tropaOcupacion.cantidad } }
                });
            });
            
            revalidatePath('/overview');
            revalidatePath('/map');
            return { success: `¡Has ocupado exitosamente la propiedad en ${coordinates.ciudad}:${coordinates.barrio}:${coordinates.edificio}!` };

        } catch (error) {
            console.error(error);
            return { error: "Error al crear la nueva propiedad." };
        }
    }

    const troopConfigs = await getTroopConfigurations();
    const troopConfigsMap = new Map(troopConfigs.map(t => [t.id, t]));

    const origenCoordsVirtuales = convertirACoordenadasVirtuales(origenPropiedad);
    const destinoCoordsVirtuales = convertirACoordenadasVirtuales(coordinates);
    const distancia = calcularDistancia(origenCoordsVirtuales, destinoCoordsVirtuales);
    
    const velocidadFlota = await calcularVelocidadFlota(tropas, troopConfigsMap);
    const duracionViaje = calcularDuracionViaje(distancia, velocidadFlota, tropas.map(t => t.id));
    
    const fechaInicio = new Date();
    const fechaLlegada = new Date(fechaInicio.getTime() + duracionViaje * 1000);
    const requiereRetorno = !MISSION_TYPES_NO_RETURN.includes(tipo);
    const fechaRegreso = requiereRetorno ? new Date(fechaLlegada.getTime() + duracionViaje * 1000) : null;
    
    const tropasConSalario = tropas.map((t) => {
        const config = troopConfigsMap.get(t.id);
        return {
            cantidad: t.cantidad,
            salario: config?.salario || 0
        };
    });
    const costeMision = calcularCosteMision(tropasConSalario, distancia);

    if (Number(origenPropiedad.dolares) < costeMision) {
        return { error: "No tienes suficientes dólares para pagar el coste de la misión." };
    }

    try {
        await prisma.$transaction(async (tx) => {

            // Deduct mission cost
            await tx.propiedad.update({
                where: { id: origenPropiedadId },
                data: {
                    dolares: { decrement: BigInt(costeMision) }
                }
            });

            // Deduct troops from property
            for(const tropa of tropas) {
                await tx.tropaUsuario.update({
                    where: {
                        propiedadId_configuracionTropaId: {
                            propiedadId: origenPropiedadId,
                            configuracionTropaId: tropa.id
                        }
                    },
                    data: {
                        cantidad: {
                            decrement: tropa.cantidad
                        }
                    }
                })
            }


            const newMission = await tx.colaMisiones.create({
                data: {
                    userId: user.id,
                    propiedadOrigenId: origenPropiedadId,
                    tipoMision: tipo,
                    tropas: tropas,
                    origenCiudad: origenPropiedad.ciudad,
                    origenBarrio: origenPropiedad.barrio,
                    origenEdificio: origenPropiedad.edificio,
                    destinoCiudad: coordinates.ciudad,
                    destinoBarrio: coordinates.barrio,
                    destinoEdificio: coordinates.edificio,
                    fechaInicio: fechaInicio,
                    fechaLlegada: fechaLlegada,
                    fechaRegreso: fechaRegreso,
                    velocidadFlota: Math.floor(velocidadFlota).toString(),
                    duracionViaje: duracionViaje,
                }
            });

            if (['ATAQUE', 'TRANSPORTE', 'ESPIONAJE'].includes(tipo) && targetOwner) {
                const totalTroops = tropas.reduce((sum, t) => sum + t.cantidad, 0);
                await tx.incomingAttack.create({
                    data: {
                        defenderId: targetOwner.id,
                        attackerId: user.id,
                        attackerName: user.name,
                        targetProperty: `${coordinates.ciudad}:${coordinates.barrio}:${coordinates.edificio}`,
                        totalTroops: totalTroops,
                        arrivalTime: fechaLlegada,
                        missionId: newMission.id,
                    }
                });

                let subject = '¡Alerta de Misión!';
                let content = `Una flota de ${user.name} se dirige a tu propiedad en [${coordinates.ciudad}:${coordinates.barrio}:${coordinates.edificio}].`;
                if(tipo === 'ATAQUE') {
                    subject = '¡Ataque Inminente!';
                    content = `Una flota de ataque de ${user.name} se dirige a tu propiedad en [${coordinates.ciudad}:${coordinates.barrio}:${coordinates.edificio}]. Llegará aproximadamente a las ${fechaLlegada.toLocaleTimeString('es-ES')}.`
                }
                if(tipo === 'TRANSPORTE') {
                    subject = 'Transporte Entrante';
                    content = `Un transporte de ${user.name} se dirige a tu propiedad en [${coordinates.ciudad}:${coordinates.barrio}:${coordinates.edificio}]. Llegará aproximadamente a las ${fechaLlegada.toLocaleTimeString('es-ES')}.`
                }
                 if(tipo === 'ESPIONAJE') {
                    subject = 'Actividad de Espionaje';
                    content = `Un espía de ${user.name} se dirige a tu propiedad en [${coordinates.ciudad}:${coordinates.barrio}:${coordinates.edificio}]. Llegará aproximadamente a las ${fechaLlegada.toLocaleTimeString('es-ES')}.`
                }


                await tx.message.create({
                    data: {
                        recipientId: targetOwner.id,
                        subject,
                        content,
                        category: MessageCategory.BATALLA
                    }
                })
            }
        });

    } catch (error) {
        console.error("Error al crear la misión:", error);
        return { error: "No se pudo enviar la misión." };
    }
    
    revalidatePath('/missions');
    revalidatePath('/overview');
    revalidatePath('/messages');

    return { success: `Misión de ${tipo} enviada a ${coordinates.ciudad}:${coordinates.barrio}:${coordinates.edificio}.` };
}
