

'use server';

import { revalidatePath } from "next/cache";
import prisma from "../prisma/prisma";
import { getSessionUser } from "../auth";
import { getTrainingConfigurations } from "../data";
import { calcularCostosEntrenamiento, calcularTiempoEntrenamiento } from "../formulas/training-formulas";
import { ID_ESCUELA_ESPECIALIZACION } from "../constants";
import type { FullPropiedad, FullHabitacionUsuario } from '../types';
import { EntrenamientoUsuario, ConfiguracionEntrenamiento } from "@prisma/client";

export async function iniciarEntrenamiento(trainingId: string, propertyId: string) {
    const user = await getSessionUser();
  
    if (!user) {
      return { error: 'Usuario no autenticado.' };
    }
    
    const propiedadActual = user.propiedades.find((p: FullPropiedad) => p.id === propertyId);
    if (!propiedadActual) {
        return { error: 'Propiedad no encontrada para este usuario.' };
    }

    const colaEntrenamientoUsuario = await prisma.colaEntrenamiento.findMany({ where: { userId: user.id } });

    if (colaEntrenamientoUsuario.some(c => c.propiedadId === propertyId)) {
        return { error: 'Ya hay un entrenamiento en curso en esta propiedad.' };
    }
    
    if (colaEntrenamientoUsuario.some(c => c.entrenamientoId === trainingId)) {
        return { error: 'Ya estás investigando este entrenamiento en otra propiedad.' };
    }

    const allTrainingConfigs = await getTrainingConfigurations();
    const config = allTrainingConfigs.find(c => c.id === trainingId);
    
    if (!config) {
        return { error: 'Configuración de entrenamiento no encontrada.'}
    }

    const userTraining = user.entrenamientos.find((t: EntrenamientoUsuario & { configuracionEntrenamiento: ConfiguracionEntrenamiento }) => t.configuracionEntrenamientoId === trainingId);
    
    const nivelActual = userTraining ? userTraining.nivel : 0;
    const nivelSiguiente = nivelActual + 1;
  
    const costos = calcularCostosEntrenamiento(nivelSiguiente, config);
  
    if (
      Number(propiedadActual.armas) < costos.armas ||
      Number(propiedadActual.municion) < costos.municion ||
      Number(propiedadActual.dolares) < costos.dolares
    ) {
      return { error: 'No tienes suficientes recursos en esta propiedad para el entrenamiento.' };
    }

    const nivelEscuela = propiedadActual.habitaciones.find((h: FullHabitacionUsuario) => h.configuracionHabitacionId === ID_ESCUELA_ESPECIALIZACION)?.nivel || 0;
    const duracion = calcularTiempoEntrenamiento(nivelSiguiente, config, nivelEscuela);

    const fechaInicio = new Date();
    const fechaFinalizacion = new Date(fechaInicio.getTime() + duracion * 1000);
  
    try {
      await prisma.$transaction(async (tx) => {
        await tx.propiedad.update({
          where: { id: propertyId },
          data: {
            armas: { decrement: BigInt(costos.armas) },
            municion: { decrement: BigInt(costos.municion) },
            dolares: { decrement: BigInt(costos.dolares) },
          },
        });

        await tx.colaEntrenamiento.create({
            data: {
                userId: user.id,
                propiedadId: propertyId,
                entrenamientoId: trainingId,
                nivelDestino: nivelSiguiente,
                fechaInicio,
                fechaFinalizacion,
            }
        });
      });
  
      revalidatePath('/training');
      revalidatePath('/overview'); 
  
      return { success: `¡El entrenamiento de ${config.nombre} a nivel ${nivelSiguiente} ha comenzado!` };
    } catch (error) {
      console.error('Error durante la transacción de entrenamiento:', error);
      return { error: 'Ocurrió un error en el servidor al intentar entrenar.' };
    }
}
