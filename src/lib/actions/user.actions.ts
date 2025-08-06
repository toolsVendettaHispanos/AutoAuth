

'use server';

import prisma from "../prisma/prisma";
import type { FullPropiedad, UserWithProgress } from "../types";
import { calculateStorageCapacity, calcularProduccionTotalPorSegundo } from "../formulas/room-formulas";
import { revalidatePath } from "next/cache";
import { calcularPuntosEntrenamientos, calcularPuntosHabitaciones, calcularPuntosTropas } from "../formulas/score-formulas";
import { getSessionUser } from "../auth";
import { getUserWithProgressByUsername } from "../data";
import { handleAttackMission } from "./brawl.actions"; 
import { handleEspionageMission } from "./espionage.actions";
import { ResourceCost } from "../types";
import { Prisma } from "@prisma/client/edge";
import { shouldUpdateUserState, recordUserStateUpdate } from "../cache";

interface UserSettings {
    name?: string;
    title?: string;
    avatarUrl?: string;
}

export async function actualizarEstadoCompletoDelJuego(sessionUser: UserWithProgress): Promise<UserWithProgress> {
    if (!shouldUpdateUserState(sessionUser.id)) {
        return sessionUser;
    }

    const [userAfterConstructionCheck, userAfterRecruitmentCheck, userAfterMissionCheck, userAfterTrainingCheck] = await Promise.all([
      verificarYFinalizarConstruccion(sessionUser),
      verificarYFinalizarReclutamiento(sessionUser),
      verificarYFinalizarMisiones(sessionUser),
      verificarYFinalizarEntrenamientos(sessionUser),
    ]);
    
    const combinedUser = { ...sessionUser, ...userAfterConstructionCheck, ...userAfterRecruitmentCheck, ...userAfterMissionCheck, ...userAfterTrainingCheck };
  
    const userWithUpdatedProgress = await obtenerEstadoJuegoActualizado(combinedUser);
    const finalUser = await actualizarPuntuacionUsuario(userWithUpdatedProgress);

    recordUserStateUpdate(sessionUser.id);

    return finalUser;
}

export async function updateUserSettings(settings: UserSettings) {
    const user = await getSessionUser();

    if (!user) {
        return { error: "Usuario no autenticado." };
    }

    try {
        await prisma.user.update({
            where: { id: user.id },
            data: {
                name: settings.name,
                title: settings.title,
                avatarUrl: settings.avatarUrl,
            },
        });

        revalidatePath('/settings');
        revalidatePath('/(dashboard)', 'layout');
        revalidatePath('/profile/[userId]', 'page');

        return { success: "¡Perfil actualizado correctamente!" };
    } catch (error) {
        console.error("Error al actualizar el perfil:", error);
        return { error: "Ocurrió un error al actualizar el perfil." };
    }
}

export async function updatePropertyDetails(properties: {id: string, nombre: string}[], mainPropertyId: string) {
    const user = await getSessionUser();
    if (!user) return { error: "No autenticado." };

    const propertyIds = properties.map(p => p.id);
    const userProperties = await prisma.propiedad.count({
        where: { id: { in: propertyIds }, userId: user.id }
    });

    if (userProperties !== properties.length) {
        return { error: "No tienes permiso para modificar una o más de estas propiedades." };
    }

    try {
        await prisma.$transaction(async (tx) => {
            // Set all properties to not be principal first
            await tx.propiedad.updateMany({
                where: {
                    userId: user.id,
                    nombre: 'Propiedad Principal'
                },
                data: {
                    nombre: 'Propiedad' 
                }
            });

            for (const prop of properties) {
                 const newName = prop.id === mainPropertyId ? 'Propiedad Principal' : prop.nombre;
                 await tx.propiedad.update({
                     where: { id: prop.id },
                     data: { nombre: newName }
                 });
            }
        });

        revalidatePath('/(dashboard)', 'layout');
        revalidatePath('/buildings');
        return { success: "Propiedades actualizadas correctamente." };
    } catch (error) {
        console.error("Error updating properties:", error);
        return { error: "Ocurrió un error al actualizar las propiedades." };
    }
}


async function updateUserLastSeen(userId: string): Promise<void> {
    try {
        await prisma.user.update({
            where: { id: userId },
            data: { lastSeen: new Date() },
        });
    } catch (error) {
        console.error(`Error updating lastSeen for user ${userId}:`, error);
    }
}


async function actualizarRecursosPropiedad(propiedad: FullPropiedad): Promise<FullPropiedad> {
    const ahora = new Date();
    const ultimaActualizacion = new Date(propiedad.ultimaActualizacion);
    const segundosTranscurridos = Math.max(0, Math.floor((ahora.getTime() - ultimaActualizacion.getTime()) / 1000));

    if (segundosTranscurridos <= 0) {
        return propiedad;
    }
    
    const capacidad = calculateStorageCapacity(propiedad);
    const produccionPorHora = calcularProduccionTotalPorSegundo(propiedad);

    const armasGeneradas = (produccionPorHora.armas.produccionNeta / 3600) * segundosTranscurridos;
    const municionGenerada = (produccionPorHora.municion.produccionNeta / 3600) * segundosTranscurridos;
    const alcoholGenerado = (produccionPorHora.alcohol.produccionNeta / 3600) * segundosTranscurridos;
    const dolaresGenerados = (produccionPorHora.dolares.produccionNeta / 3600) * segundosTranscurridos;

    const nuevasArmas = Math.min(capacidad.armas, Number(propiedad.armas) + armasGeneradas);
    const nuevaMunicion = Math.min(capacidad.municion, Number(propiedad.municion) + municionGenerada);
    const nuevoAlcohol = Math.min(capacidad.alcohol, Number(propiedad.alcohol) + alcoholGenerado);
    const nuevosDolares = Math.min(capacidad.dolares, Number(propiedad.dolares) + dolaresGenerados);

    try {
        const propiedadActualizada = await prisma.propiedad.update({
            where: { id: propiedad.id },
            data: {
                armas: BigInt(Math.floor(nuevasArmas)),
                municion: BigInt(Math.floor(nuevaMunicion)),
                alcohol: BigInt(Math.floor(nuevoAlcohol)),
                dolares: BigInt(Math.floor(nuevosDolares)),
                ultimaActualizacion: ahora,
            },
            include: { 
                habitaciones: { include: { configuracionHabitacion: { include: { requisitos: true } } } },
                colaConstruccion: { orderBy: { createdAt: 'asc' } }, 
                colaReclutamiento: { include: { tropaConfig: true } },
                TropaUsuario: { include: { configuracionTropa: true } },
                TropaSeguridadUsuario: { include: { configuracionTropa: true } }
            }
        });
        return propiedadActualizada as FullPropiedad;
    } catch (error) {
        console.error(`Error actualizando recursos para propiedad ${propiedad.id}:`, error);
        return propiedad;
    }
}


export async function obtenerEstadoJuegoActualizado(user: UserWithProgress): Promise<UserWithProgress> {
    await updateUserLastSeen(user.id);

    const propiedadesActualizadas = await Promise.all(
        user.propiedades.map(propiedad => actualizarRecursosPropiedad(propiedad))
    );

    const incomingAttacks = await prisma.incomingAttack.findMany({
        where: { defenderId: user.id }
    });

    return {
        ...user,
        propiedades: propiedadesActualizadas,
        incomingAttacks: incomingAttacks,
        lastSeen: new Date(),
    };
}

async function verificarYFinalizarConstruccionDePropiedad(propiedad: FullPropiedad): Promise<FullPropiedad> {
  const cola = [...propiedad.colaConstruccion].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  if (cola.length === 0) return propiedad;

  let seHizoUnCambio = false;

  const construccionesTerminadas = cola.filter(c => c.fechaFinalizacion && new Date() >= new Date(c.fechaFinalizacion));
  
  if (construccionesTerminadas.length > 0) {
    try {
        await prisma.$transaction(async (tx) => {
            for (const terminada of construccionesTerminadas) {
                await tx.habitacionUsuario.update({
                    where: {
                        propiedadId_configuracionHabitacionId: {
                            propiedadId: terminada.propiedadId,
                            configuracionHabitacionId: terminada.habitacionId,
                        },
                    },
                    data: {
                        nivel: terminada.nivelDestino,
                    },
                });
                await tx.colaConstruccion.delete({
                    where: { id: terminada.id },
                });
            }
        });
        seHizoUnCambio = true;
    } catch (error) {
        console.error(`Error finalizando construcciones:`, error);
    }
  }

  const propiedadPostFinalizacion = seHizoUnCambio 
    ? await prisma.propiedad.findUnique({ where: { id: propiedad.id }, include: { colaConstruccion: { orderBy: { createdAt: 'asc' } } } })
    : { ...propiedad, colaConstruccion: cola };
  
  if (!propiedadPostFinalizacion) return propiedad;

  const colaActual = propiedadPostFinalizacion.colaConstruccion;
  const construccionActiva = colaActual.find(c => c.fechaFinalizacion);
  
  if (!construccionActiva && colaActual.length > 0) {
      const proximaEnCola = colaActual[0];
      const fechaInicio = new Date();
      const fechaFinalizacion = new Date(fechaInicio.getTime() + proximaEnCola.duracion * 1000);
      await prisma.colaConstruccion.update({
          where: { id: proximaEnCola.id },
          data: { fechaInicio, fechaFinalizacion },
      });
      seHizoUnCambio = true;
  }

  if (seHizoUnCambio) {
    const propiedadRefrescada = await prisma.propiedad.findUnique({
      where: { id: propiedad.id },
      include: { 
        habitaciones: { include: { configuracionHabitacion: { include: { requisitos: true } } } },
        colaConstruccion: { orderBy: { createdAt: 'asc' } }, 
        colaReclutamiento: { include: { tropaConfig: true } },
        TropaUsuario: { include: { configuracionTropa: true } },
        TropaSeguridadUsuario: { include: { configuracionTropa: true } }
      }
    });
    return propiedadRefrescada as FullPropiedad;
  }

  return propiedad;
}

export async function verificarYFinalizarConstruccion(user: UserWithProgress): Promise<UserWithProgress> {
    const propiedadesActualizadas = await Promise.all(
        user.propiedades.map(prop => verificarYFinalizarConstruccionDePropiedad(prop))
    );
    return { ...user, propiedades: propiedadesActualizadas };
}


async function verificarYFinalizarReclutamientoDePropiedad(propiedad: FullPropiedad): Promise<FullPropiedad> {
    const reclutamientoActivo = propiedad.colaReclutamiento;

    if (!reclutamientoActivo || new Date() < new Date(reclutamientoActivo.fechaFinalizacion)) {
        return propiedad;
    }

    try {
        await prisma.$transaction(async (tx) => {
            const tropaExistente = await tx.tropaUsuario.findUnique({
                where: {
                    propiedadId_configuracionTropaId: {
                        propiedadId: propiedad.id,
                        configuracionTropaId: reclutamientoActivo.tropaId,
                    }
                }
            });

            if (tropaExistente) {
                await tx.tropaUsuario.update({
                    where: {
                        propiedadId_configuracionTropaId: {
                            propiedadId: propiedad.id,
                            configuracionTropaId: reclutamientoActivo.tropaId,
                        }
                    },
                    data: { cantidad: { increment: reclutamientoActivo.cantidad } }
                });
            } else {
                await tx.tropaUsuario.create({
                    data: {
                        propiedadId: propiedad.id,
                        configuracionTropaId: reclutamientoActivo.tropaId,
                        cantidad: reclutamientoActivo.cantidad,
                    }
                });
            }
            await tx.colaReclutamiento.delete({ where: { id: reclutamientoActivo.id } });
        });
        
        const propiedadRefrescada = await prisma.propiedad.findUnique({
             where: { id: propiedad.id },
             include: { 
                habitaciones: { include: { configuracionHabitacion: { include: { requisitos: true } } } },
                colaConstruccion: { orderBy: { createdAt: 'asc' } }, 
                colaReclutamiento: { include: { tropaConfig: true } },
                TropaUsuario: { include: { configuracionTropa: true } },
                TropaSeguridadUsuario: { include: { configuracionTropa: true } }
              }
        });
        return propiedadRefrescada as FullPropiedad;

    } catch (error) {
        console.error(`Error finalizando el reclutamiento en la propiedad ${propiedad.id}:`, error);
        return propiedad;
    }
}


export async function verificarYFinalizarReclutamiento(user: UserWithProgress): Promise<UserWithProgress> {
    const propiedadesActualizadas = await Promise.all(
        user.propiedades.map(prop => prop.colaReclutamiento ? verificarYFinalizarReclutamientoDePropiedad(prop) : prop)
    );
    return { ...user, propiedades: propiedadesActualizadas };
}

export async function verificarYFinalizarEntrenamientos(user: UserWithProgress): Promise<UserWithProgress> {
    if (!user.colaEntrenamientos || user.colaEntrenamientos.length === 0) return user;

    const ahora = new Date();
    let seHizoUnCambio = false;

    const entrenamientosTerminados = user.colaEntrenamientos.filter(e => ahora >= new Date(e.fechaFinalizacion));
    const idsTerminados = entrenamientosTerminados.map(e => e.id);

    if (entrenamientosTerminados.length > 0) {
        try {
            await prisma.$transaction(async (tx) => {
                // Primero, eliminar todos los registros de la cola que han terminado.
                await tx.colaEntrenamiento.deleteMany({
                    where: { id: { in: idsTerminados } }
                });
                
                // Luego, actualizar los niveles de los usuarios.
                for (const terminado of entrenamientosTerminados) {
                    await tx.entrenamientoUsuario.upsert({
                        where: {
                            userId_configuracionEntrenamientoId: {
                                userId: terminado.userId,
                                configuracionEntrenamientoId: terminado.entrenamientoId
                            }
                        },
                        update: {
                            nivel: terminado.nivelDestino,
                        },
                        create: {
                            userId: terminado.userId,
                            configuracionEntrenamientoId: terminado.entrenamientoId,
                            nivel: terminado.nivelDestino,
                        }
                    });
                }
            });
            seHizoUnCambio = true;
        } catch (error) {
            console.error("Error al finalizar entrenamientos:", error);
        }
    }

    if (seHizoUnCambio) {
        const userRefrescado = await getUserWithProgressByUsername(user.username);
        if(userRefrescado) return { ...user, colaEntrenamientos: userRefrescado.colaEntrenamientos, entrenamientos: userRefrescado.entrenamientos };
    }
    
    return user;
}


export async function verificarYFinalizarMisiones(user: UserWithProgress): Promise<UserWithProgress> {
    if (!user.misiones || user.misiones.length === 0) return user;

    const ahora = new Date();
    let seHizoUnCambio = false;

    for (const mision of [...user.misiones]) { // Create a shallow copy to iterate over, as the original array might be modified
        const fechaLlegada = new Date(mision.fechaLlegada);

        if (ahora >= fechaLlegada && mision.tipoMision !== 'REGRESO') {
            seHizoUnCambio = true;
            if (mision.tipoMision === 'ATAQUE') {
                await Promise.all([
                    handleAttackMission(mision),
                    prisma.incomingAttack.deleteMany({ where: { missionId: mision.id } })
                ]);
            } else if (mision.tipoMision === 'ESPIONAJE') {
                 await Promise.all([
                    handleEspionageMission(mision),
                    prisma.incomingAttack.deleteMany({ where: { missionId: mision.id } })
                ]);
            }
        }
        
        const fechaFinal = mision.fechaRegreso;
        if (fechaFinal && ahora >= new Date(fechaFinal)) {
            seHizoUnCambio = true;
            
            const propiedadOrigen = await prisma.propiedad.findUnique({
                where: { id: mision.propiedadOrigenId },
                include: { habitaciones: { include: { configuracionHabitacion: true } } }
            });

            if (propiedadOrigen) {
                const capacidadAlmacenamiento = calculateStorageCapacity(propiedadOrigen as FullPropiedad);
                
                // Add returning resources back to the property
                if (mision.recursos) {
                    const loot = mision.recursos as ResourceCost;
                    const updatedArmas = Math.min(capacidadAlmacenamiento.armas, Number(propiedadOrigen.armas) + loot.armas);
                    const updatedMunicion = Math.min(capacidadAlmacenamiento.municion, Number(propiedadOrigen.municion) + loot.municion);
                    const updatedDolares = Math.min(capacidadAlmacenamiento.dolares, Number(propiedadOrigen.dolares) + loot.dolares);
                    const updatedAlcohol = Math.min(capacidadAlmacenamiento.alcohol, Number(propiedadOrigen.alcohol) + loot.alcohol);

                    await prisma.propiedad.update({
                        where: { id: mision.propiedadOrigenId },
                        data: {
                            armas: BigInt(Math.floor(updatedArmas)),
                            municion: BigInt(Math.floor(updatedMunicion)),
                            dolares: BigInt(Math.floor(updatedDolares)),
                            alcohol: BigInt(Math.floor(updatedAlcohol)),
                        }
                    });
                }
    
                // Add returning troops back to the property
                const tropasQueRegresan = mision.tropas as { id: string; cantidad: number }[];
                for (const tropa of tropasQueRegresan) {
                    await prisma.tropaUsuario.update({
                        where: {
                            propiedadId_configuracionTropaId: {
                                propiedadId: mision.propiedadOrigenId,
                                configuracionTropaId: tropa.id,
                            },
                        },
                        data: {
                            cantidad: { increment: tropa.cantidad },
                        },
                    });
                }
            }

            try {
                await prisma.colaMisiones.delete({ where: { id: mision.id } });
            } catch (error) {
                if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
                    // Record not found, it was likely already processed and deleted.
                    console.log(`Mission ${mision.id} already deleted, skipping.`);
                } else {
                    // Re-throw other errors
                    throw error;
                }
            }
        }
    }

    if (seHizoUnCambio) {
        const userRefrescado = await getUserWithProgressByUsername(user.username);
        if (userRefrescado) return userRefrescado;
    }

    return user;
}


export async function actualizarPuntuacionUsuario(user: UserWithProgress): Promise<UserWithProgress> {
  const puntosHabitaciones = calcularPuntosHabitaciones(user.propiedades);
  const puntosTropas = calcularPuntosTropas(user.propiedades);
  const puntosEntrenamientos = calcularPuntosEntrenamientos(user.entrenamientos);
  const puntosTotales = puntosHabitaciones + puntosTropas + puntosEntrenamientos;

  try {
    const puntuacionActualizada = await prisma.puntuacionUsuario.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        puntosHabitaciones,
        puntosTropas,
        puntosEntrenamientos,
        puntosTotales,
        updatedAt: new Date(),
      },
      update: {
        puntosHabitaciones,
        puntosTropas,
        puntosEntrenamientos,
        puntosTotales,
        updatedAt: new Date(),
      },
    });

    const updatedUser = { ...user, puntuacion: puntuacionActualizada };
    return updatedUser;
    
  } catch (error) {
    console.error("Error actualizando la puntuación del usuario:", error);
    return user;
  }
}
