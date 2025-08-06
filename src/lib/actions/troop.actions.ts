

'use server';

import { revalidatePath } from "next/cache";
import prisma from "../prisma/prisma";
import { getSessionUser } from "../auth";
import { getTroopConfigurations } from "../data";
import { calcularTiempoReclutamiento } from "../formulas/troop-formulas";
import { ID_CAMPO_ENTRENAMIENTO, ID_SEGURIDAD, TROOP_TYPE_DEFENSE } from "../constants";
import type { FullPropiedad, FullHabitacionUsuario } from "../types";


export async function iniciarReclutamiento(propiedadId: string, tropaId: string, cantidad: number) {
    const user = await getSessionUser();
  
    if (!user) {
      return { error: 'Usuario no autenticado.' };
    }

    if (cantidad <= 0) {
        return { error: 'La cantidad debe ser mayor que cero.' };
    }
    
    const propiedadActual = user.propiedades.find((p: FullPropiedad) => p.id === propiedadId);
    if (!propiedadActual) {
        return { error: 'Propiedad no encontrada para este usuario.' };
    }

    if (propiedadActual.colaReclutamiento) {
        return { error: 'Ya hay un reclutamiento en progreso en esta propiedad.' };
    }

    const troopConfigs = await getTroopConfigurations();
    const config = troopConfigs.find(t => t.id === tropaId);

    if (!config) {
         return { error: 'Configuración de tropa no encontrada.' };
    }

    if (config.tipo === TROOP_TYPE_DEFENSE) {
        return { error: 'Las unidades de defensa se entrenan en la sección de Seguridad.' };
    }

    const nivelCampoEntrenamiento = propiedadActual.habitaciones.find((h: FullHabitacionUsuario) => h.configuracionHabitacionId === ID_CAMPO_ENTRENAMIENTO)?.nivel || 1;

    const costoArmasTotal = Number(config.costoArmas) * cantidad;
    const costoMunicionTotal = Number(config.costoMunicion) * cantidad;
    const costoDolaresTotal = Number(config.costoDolares) * cantidad;

    const tiempoTotal = calcularTiempoReclutamiento(config, cantidad, nivelCampoEntrenamiento);
  
    if (
      Number(propiedadActual.armas) < costoArmasTotal ||
      Number(propiedadActual.municion) < costoMunicionTotal ||
      Number(propiedadActual.dolares) < costoDolaresTotal
    ) {
      return { error: 'No tienes suficientes recursos para este reclutamiento.' };
    }
  
    try {
      const fechaInicio = new Date();
      const fechaFinalizacion = new Date(fechaInicio.getTime() + tiempoTotal * 1000);

      await prisma.$transaction([
        prisma.propiedad.update({
          where: { id: propiedadId },
          data: {
            armas: { decrement: BigInt(costoArmasTotal) },
            municion: { decrement: BigInt(costoMunicionTotal) },
            dolares: { decrement: BigInt(costoDolaresTotal) },
          },
        }),
        prisma.colaReclutamiento.create({
            data: {
                propiedadId: propiedadId,
                tropaId: tropaId,
                cantidad: cantidad,
                fechaInicio: fechaInicio,
                fechaFinalizacion: fechaFinalizacion
            }
        })
      ]);
  
      revalidatePath('/recruitment');
      revalidatePath('/overview'); 
      revalidatePath('/(dashboard)/layout', 'layout');
  
      return { success: `¡El reclutamiento de ${cantidad} x ${config.nombre} ha comenzado!` };
    } catch (error) {
      console.error('Error durante la transacción de reclutamiento:', error);
      return { error: 'Ocurrió un error en el servidor al intentar reclutar.' };
    }
}


export async function iniciarEntrenamientoSeguridad(propiedadId: string, tropaId: string, cantidad: number) {
    const user = await getSessionUser();
  
    if (!user) {
      return { error: 'Usuario no autenticado.' };
    }

    if (cantidad <= 0) {
        return { error: 'La cantidad debe ser mayor que cero.' };
    }
    
    const propiedadActual = user.propiedades.find((p: FullPropiedad) => p.id === propiedadId);
    if (!propiedadActual) {
        return { error: 'Propiedad no encontrada para este usuario.' };
    }

    if (propiedadActual.colaReclutamiento) {
        return { error: 'Ya hay un reclutamiento en progreso en esta propiedad.' };
    }

    const troopConfigs = await getTroopConfigurations();
    const config = troopConfigs.find(t => t.id === tropaId);

    if (!config) {
         return { error: 'Configuración de tropa no encontrada.' };
    }

    if (config.tipo !== TROOP_TYPE_DEFENSE) {
        return { error: 'Esta tropa no es una unidad de defensa.' };
    }

    const nivelSeguridad = propiedadActual.habitaciones.find((h: FullHabitacionUsuario) => h.configuracionHabitacionId === ID_SEGURIDAD)?.nivel || 1;

    const costoArmasTotal = Number(config.costoArmas) * cantidad;
    const costoMunicionTotal = Number(config.costoMunicion) * cantidad;
    const costoDolaresTotal = Number(config.costoDolares) * cantidad;

    // Usamos la misma fórmula de tiempo que las tropas normales, pero con el nivel de seguridad
    const tiempoTotal = calcularTiempoReclutamiento(config, cantidad, nivelSeguridad);
  
    if (
      Number(propiedadActual.armas) < costoArmasTotal ||
      Number(propiedadActual.municion) < costoMunicionTotal ||
      Number(propiedadActual.dolares) < costoDolaresTotal
    ) {
      return { error: 'No tienes suficientes recursos para este entrenamiento.' };
    }
  
    try {
      const fechaInicio = new Date();
      const fechaFinalizacion = new Date(fechaInicio.getTime() + tiempoTotal * 1000);

      await prisma.$transaction([
        prisma.propiedad.update({
          where: { id: propiedadId },
          data: {
            armas: { decrement: BigInt(costoArmasTotal) },
            municion: { decrement: BigInt(costoMunicionTotal) },
            dolares: { decrement: BigInt(costoDolaresTotal) },
          },
        }),
        prisma.colaReclutamiento.create({
            data: {
                propiedadId: propiedadId,
                tropaId: tropaId,
                cantidad: cantidad,
                fechaInicio: fechaInicio,
                fechaFinalizacion: fechaFinalizacion
            }
        })
      ]);
  
      revalidatePath('/security');
      revalidatePath('/overview'); 
      revalidatePath('/(dashboard)/layout', 'layout');
  
      return { success: `¡El entrenamiento de ${cantidad} x ${config.nombre} ha comenzado!` };
    } catch (error) {
      console.error('Error durante la transacción de entrenamiento de seguridad:', error);
      return { error: 'Ocurrió un error en el servidor al intentar entrenar la seguridad.' };
    }
}

export async function assignTroopsToSecurity(propertyId: string, troopId: string, quantity: number) {
    const user = await getSessionUser();
    if (!user) return { error: "Usuario no autenticado." };
    
    if (quantity <= 0) return { error: "La cantidad debe ser positiva."};

    const troopInProperty = await prisma.tropaUsuario.findFirst({
        where: {
            propiedadId: propertyId,
            configuracionTropaId: troopId,
            propiedad: {
                userId: user.id
            }
        }
    });

    if (!troopInProperty || troopInProperty.cantidad < quantity) {
        return { error: "No tienes suficientes tropas disponibles." };
    }

    try {
        await prisma.$transaction(async (tx) => {
            await tx.tropaUsuario.update({
                where: { id: troopInProperty.id },
                data: { cantidad: { decrement: quantity } }
            });

            const existingSecurityTroop = await tx.tropaSeguridadUsuario.findFirst({
                where: { propiedadId: propertyId, configuracionTropaId: troopId }
            });

            if(existingSecurityTroop) {
                await tx.tropaSeguridadUsuario.update({
                    where: { id: existingSecurityTroop.id },
                    data: { cantidad: { increment: quantity } }
                });
            } else {
                await tx.tropaSeguridadUsuario.create({
                    data: {
                        propiedadId: propertyId,
                        configuracionTropaId: troopId,
                        cantidad: quantity
                    }
                });
            }
        });
        revalidatePath('/security');
        return { success: "Tropas asignadas a seguridad." };
    } catch (e) {
        console.error("Error assigning troops to security:", e);
        return { error: "Ocurrió un error al asignar las tropas." };
    }
}


export async function withdrawTroopsFromSecurity(propertyId: string, troopId: string, quantity: number) {
    const user = await getSessionUser();
    if (!user) return { error: "Usuario no autenticado." };
    
    if (quantity <= 0) return { error: "La cantidad debe ser positiva."};

    const securityTroop = await prisma.tropaSeguridadUsuario.findFirst({
        where: {
            propiedadId: propertyId,
            configuracionTropaId: troopId,
            propiedad: {
                userId: user.id
            }
        }
    });

    if (!securityTroop || securityTroop.cantidad < quantity) {
        return { error: "No tienes suficientes tropas asignadas para retirar." };
    }

    try {
        await prisma.$transaction(async (tx) => {
            await tx.tropaSeguridadUsuario.update({
                where: { id: securityTroop.id },
                data: { cantidad: { decrement: quantity } }
            });

            const existingTroop = await tx.tropaUsuario.findFirst({
                where: { propiedadId: propertyId, configuracionTropaId: troopId }
            });

            if(existingTroop) {
                await tx.tropaUsuario.update({
                    where: { id: existingTroop.id },
                    data: { cantidad: { increment: quantity } }
                });
            } else {
                 await tx.tropaUsuario.create({
                    data: {
                        propiedadId: propertyId,
                        configuracionTropaId: troopId,
                        cantidad: quantity
                    }
                });
            }
        });
        revalidatePath('/security');
        return { success: "Tropas retiradas de seguridad." };
    } catch (e) {
        console.error("Error withdrawing troops from security:", e);
        return { error: "Ocurrió un error al retirar las tropas." };
    }
}
