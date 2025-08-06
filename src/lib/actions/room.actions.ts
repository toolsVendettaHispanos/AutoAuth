

'use server';

import { revalidatePath } from "next/cache";
import prisma from "../prisma/prisma";
import { getSessionUser } from "../auth";
import { calcularCostosNivel, calcularTiempoConstruccion } from "../formulas/room-formulas";
import { ID_OFICINA_JEFE, MAX_CONSTRUCTION_QUEUE_SIZE } from "../constants";
import type { FullConfiguracionHabitacion } from "../types";

export async function iniciarAmpliacion(propiedadId: string, habitacionId: string) {
    const user = await getSessionUser();
  
    if (!user) {
      return { error: 'Usuario no autenticado.' };
    }
    
    const propiedadActual = user.propiedades.find(p => p.id === propiedadId);
    if (!propiedadActual) {
        return { error: 'Propiedad no encontrada para este usuario.' };
    }

    const construccionesEnCola = propiedadActual.colaConstruccion;

    if (construccionesEnCola.length >= MAX_CONSTRUCTION_QUEUE_SIZE) {
        return { error: `La cola de construcción está llena (máximo ${MAX_CONSTRUCTION_QUEUE_SIZE}).` };
    }

    const habitacionUsuario = propiedadActual.habitaciones.find(h => h.configuracionHabitacionId === habitacionId);

    if (!habitacionUsuario) {
         return { error: 'Configuración de habitación de usuario no encontrada.' };
    }

    const config = habitacionUsuario.configuracionHabitacion;
    if (!config) {
        return { error: 'Configuración de la habitación no encontrada.'}
    }
    
    const nivelBase = habitacionUsuario.nivel;
    const mejorasEnCola = construccionesEnCola.filter(c => c.habitacionId === habitacionId).length;
    const nivelSiguiente = nivelBase + mejorasEnCola + 1;

    const nivelOficinaJefe = propiedadActual.habitaciones.find(h => h.configuracionHabitacionId === ID_OFICINA_JEFE)?.nivel || 1;
  
    const costos = calcularCostosNivel(nivelSiguiente, config as FullConfiguracionHabitacion);
  
    if (
      Number(propiedadActual.armas) < costos.armas ||
      Number(propiedadActual.municion) < costos.municion ||
      Number(propiedadActual.dolares) < costos.dolares
    ) {
      return { error: 'No tienes suficientes recursos para esta ampliación.' };
    }

    const duracion = calcularTiempoConstruccion(nivelSiguiente, config, nivelOficinaJefe);

    // Encontrar la fecha de finalización de la última construcción en la cola para esta propiedad
    const ultimaConstruccion = await prisma.colaConstruccion.findFirst({
        where: { propiedadId: propiedadId },
        orderBy: { fechaFinalizacion: 'desc' },
    });

    const ahora = new Date();
    let fechaInicio: Date;

    if (ultimaConstruccion && ultimaConstruccion.fechaFinalizacion) {
        // La nueva construcción empieza 1 segundo después de la anterior
        fechaInicio = new Date(ultimaConstruccion.fechaFinalizacion.getTime() + 1000);
    } else {
        // Si no hay nada en la cola, empieza ahora
        fechaInicio = ahora;
    }

    const fechaFinalizacion = new Date(fechaInicio.getTime() + duracion * 1000);
  
    try {
      await prisma.$transaction([
        prisma.propiedad.update({
          where: { id: propiedadId },
          data: {
            armas: { decrement: BigInt(costos.armas) },
            municion: { decrement: BigInt(costos.municion) },
            dolares: { decrement: BigInt(costos.dolares) },
          },
        }),
        prisma.colaConstruccion.create({
            data: {
                propiedadId: propiedadId,
                habitacionId: habitacionId,
                nivelDestino: nivelSiguiente,
                duracion: duracion,
                fechaInicio: fechaInicio,
                fechaFinalizacion: fechaFinalizacion,
            }
        })
      ]);
  
      revalidatePath('/rooms');
      revalidatePath('/overview'); 
      revalidatePath('/(dashboard)/layout', 'layout');
  
      return { success: `¡${config.nombre} añadido a la cola de construcción!` };
    } catch (error) {
      console.error('Error durante la transacci\u00f3n de ampliaci\u00f3n:', error);
      return { error: 'Ocurri\u00f3 un error en el servidor al intentar ampliar.' };
    }
}


export async function cancelarConstruccion(colaId: string) {
    const user = await getSessionUser();
    if (!user) {
        return { error: 'Usuario no autenticado.' };
    }

    const itemCola = await prisma.colaConstruccion.findUnique({
        where: { id: colaId },
        include: { 
            propiedad: {
                include: {
                    habitaciones: {
                        include: {
                            configuracionHabitacion: true,
                        }
                    }
                }
            } 
        }
    });

    if (!itemCola || itemCola.propiedad.userId !== user.id) {
        return { error: 'Elemento de la cola no encontrado o no te pertenece.' };
    }
    
    const configHabitacion = itemCola.propiedad.habitaciones.find(h => h.configuracionHabitacionId === itemCola.habitacionId)?.configuracionHabitacion;
    if (!configHabitacion) {
         return { error: 'Configuración de habitación no encontrada para el reembolso.' };
    }

    const nivelOficinaJefe = itemCola.propiedad.habitaciones.find(h => h.configuracionHabitacionId === ID_OFICINA_JEFE)?.nivel || 1;
    const costos = calcularCostosNivel(itemCola.nivelDestino, configHabitacion as FullConfiguracionHabitacion);

    try {
        await prisma.$transaction(async (tx) => {
            // Reembolsar recursos
            await tx.propiedad.update({
                where: { id: itemCola.propiedadId },
                data: {
                    armas: { increment: BigInt(costos.armas) },
                    municion: { increment: BigInt(costos.municion) },
                    dolares: { increment: BigInt(costos.dolares) },
                }
            });

            // Eliminar de la cola
            await tx.colaConstruccion.delete({
                where: { id: colaId }
            });
        });

        revalidatePath('/rooms');
        revalidatePath('/overview');
        revalidatePath('/(dashboard)/layout', 'layout');

        return { success: `La construcción de ${configHabitacion.nombre} ha sido cancelada.` };
    } catch (error) {
        console.error('Error al cancelar la construcción:', error);
        return { error: 'No se pudo cancelar la construcción.' };
    }
}
