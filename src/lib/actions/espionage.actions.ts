

'use server'

import prisma from "../prisma/prisma";
import { runBattleSimulation } from "./simulation.actions";
import { ColaMisiones, MessageCategory } from "@prisma/client";
import type { SimulationInput, BattleReport, EspionageReportDetails } from "../types/simulation.types";
import { ID_TROPA_ESPIA } from "../constants";

export async function handleEspionageMission(mision: ColaMisiones) {
    const atacante = await prisma.user.findUnique({ 
        where: { id: mision.userId },
        include: {
            propiedades: true,
            entrenamientos: true
        }
    });

    if (!atacante) {
        console.error("Atacante no encontrado para la misión de espionaje:", mision.id);
        await prisma.colaMisiones.delete({ where: { id: mision.id } });
        return;
    }

    const propiedadDefensora = await prisma.propiedad.findUnique({
        where: {
            ciudad_barrio_edificio: {
                ciudad: mision.destinoCiudad,
                barrio: mision.destinoBarrio,
                edificio: mision.destinoEdificio,
            }
        },
        include: {
            user: true,
            habitaciones: { include: { configuracionHabitacion: true }},
            TropaUsuario: { include: { configuracionTropa: true } },
            TropaSeguridadUsuario: { include: { configuracionTropa: true } }
        }
    });

    if (!propiedadDefensora || !propiedadDefensora.user) {
        // La propiedad no existe o no tiene dueño, la misión regresa.
        await prisma.colaMisiones.update({
            where: { id: mision.id },
            data: { 
                tipoMision: 'REGRESO',
                fechaRegreso: new Date(new Date().getTime() + mision.duracionViaje * 1000)
            }
        });
        return;
    }

    const defensor = await prisma.user.findUnique({
        where: { id: propiedadDefensora.userId },
        include: { entrenamientos: true, propiedades: true }
    });

    if (!defensor) {
         await prisma.colaMisiones.update({
            where: { id: mision.id },
            data: { 
                tipoMision: 'REGRESO',
                fechaRegreso: new Date(new Date().getTime() + mision.duracionViaje * 1000)
            }
        });
        return;
    }

    const attackerTroops = (mision.tropas as { id: string; cantidad: number }[]).filter(t => t.id === ID_TROPA_ESPIA);
    const defenderAllTroops = [...propiedadDefensora.TropaUsuario, ...propiedadDefensora.TropaSeguridadUsuario];

    const attackerInput: SimulationInput = {
        troops: attackerTroops.map(t => ({ id: t.id, quantity: t.cantidad })),
        trainings: atacante.entrenamientos.map(t => ({ id: t.configuracionEntrenamientoId, level: t.nivel })),
        defenses: [],
        buildingsLevel: 1, 
        propertyCount: atacante.propiedades.length,
    };

    const defenderInput: SimulationInput = {
        troops: defenderAllTroops.map(t => ({ id: t.configuracionTropa.id, quantity: t.cantidad })),
        trainings: defensor.entrenamientos.map(t => ({ id: t.configuracionEntrenamientoId, level: t.nivel })),
        defenses: [],
        buildingsLevel: 1, // Asumimos 1, podría ser más complejo
        propertyCount: defensor.propiedades?.length || 1
    };
    
    const combatReport = await runBattleSimulation(attackerInput, defenderInput);
    
    const spiesSurvived = combatReport.rounds.length > 0 && combatReport.winner === 'attacker';
    
    let intel: EspionageReportDetails['intel'] = null;
    if (spiesSurvived) {
        intel = {
            resources: {
                armas: Number(propiedadDefensora.armas),
                municion: Number(propiedadDefensora.municion),
                alcohol: Number(propiedadDefensora.alcohol),
                dolares: Number(propiedadDefensora.dolares),
            },
            buildings: propiedadDefensora.habitaciones.map(h => ({
                id: h.configuracionHabitacionId,
                name: h.configuracionHabitacion.nombre,
                level: h.nivel
            }))
        }
    }

    const bigIntReplacer = (key: any, value: any) => typeof value === 'bigint' ? value.toString() : value;
    const serializableReportDetails: EspionageReportDetails = {
        combat: JSON.parse(JSON.stringify(combatReport, bigIntReplacer)) as BattleReport,
        intel: intel
    };
    
    const survivingSpies = combatReport.rounds[combatReport.rounds.length - 1].attacker.troops.map(t => ({ id: t.id, cantidad: t.initialQuantity - t.lostQuantity })).filter(t => t.cantidad > 0);
    const nonSpyTroops = (mision.tropas as { id: string; cantidad: number }[]).filter(t => t.id !== ID_TROPA_ESPIA);
    const tropaRegreso = [...survivingSpies, ...nonSpyTroops];

    await prisma.$transaction(async (tx) => {
        const espionageReport = await tx.espionageReport.create({
            data: {
                attackerId: atacante.id,
                defenderId: defensor.id,
                details: serializableReportDetails,
            }
        });
        
        // Crear mensajes individualmente
        await tx.message.create({
            data: {
                recipientId: atacante.id,
                subject: `Informe de Espionaje en ${mision.destinoCiudad}:${mision.destinoBarrio}`,
                content: spiesSurvived ? `Tus espías han tenido éxito y han vuelto con información.` : `Tus espías han sido descubiertos y eliminados.`,
                category: MessageCategory.ESPIONAJE,
                espionageReportId: espionageReport.id,
            }
        });
        
        await tx.message.create({
            data: {
                recipientId: defensor.id,
                subject: `Actividad de espionaje detectada`,
                content: `Has detectado y combatido espías de ${atacante.name} en tu propiedad en [${mision.destinoCiudad}:${mision.destinoBarrio}].`,
                category: MessageCategory.ESPIONAJE,
                espionageReportId: espionageReport.id,
            }
        });

        // Actualizar la misión para que regrese con las tropas supervivientes.
        await tx.colaMisiones.update({
            where: { id: mision.id },
            data: {
                tipoMision: 'REGRESO',
                tropas: tropaRegreso,
                fechaRegreso: new Date(new Date().getTime() + mision.duracionViaje * 1000)
            }
        });
    });
}
