
import type { FullPropiedad } from "../types";
import { EntrenamientoUsuario, ConfiguracionEntrenamiento } from "@prisma/client";

export function calcularPuntosHabitaciones(propiedades: FullPropiedad[]): number {
  if (!propiedades || propiedades.length === 0) return 0;

  return propiedades.reduce((totalPuntos, propiedad) => {
    const puntosPropiedad = propiedad.habitaciones.reduce((subtotal, habitacion) => {
      return subtotal + (habitacion.configuracionHabitacion.puntos * habitacion.nivel);
    }, 0);
    return totalPuntos + puntosPropiedad;
  }, 0);
}

export function calcularPuntosPropiedad(propiedad: FullPropiedad): number {
    if (!propiedad) return 0;
    
    const puntosHabitaciones = propiedad.habitaciones.reduce((totalHabitaciones, habitacion) => {
        const puntos = habitacion.configuracionHabitacion.puntos * habitacion.nivel;
        return totalHabitaciones + puntos;
    }, 0);

    const puntosTropas = propiedad.TropaUsuario.reduce((totalTropas, tropa) => {
        const puntos = tropa.configuracionTropa.puntos * tropa.cantidad;
        return totalTropas + puntos;
    }, 0);
    
    const puntosSeguridad = propiedad.TropaSeguridadUsuario.reduce((totalSeguridad, tropa) => {
        const puntos = tropa.configuracionTropa.puntos * tropa.cantidad;
        return totalSeguridad + puntos;
    }, 0);

    return puntosHabitaciones + puntosTropas + puntosSeguridad;
}

export function calcularPuntosTropas(propiedades: FullPropiedad[]): number {
  if (!propiedades) return 0;
  
  return propiedades.reduce((totalPropiedades, propiedad) => {
    const puntosTropas = propiedad.TropaUsuario.reduce((totalTropas, tropa) => {
      const puntos = tropa.configuracionTropa.puntos * tropa.cantidad;
      return totalTropas + puntos;
    }, 0);
    const puntosSeguridad = propiedad.TropaSeguridadUsuario.reduce((totalSeguridad, tropa) => {
        const puntos = tropa.configuracionTropa.puntos * tropa.cantidad;
        return totalSeguridad + puntos;
    }, 0);
    return totalPropiedades + puntosTropas + puntosSeguridad;
  }, 0);
}

export function calcularPuntosEntrenamientos(entrenamientos: (EntrenamientoUsuario & { configuracionEntrenamiento: ConfiguracionEntrenamiento })[]): number {
  if (!entrenamientos) return 0;

  return entrenamientos.reduce((total, entrenamiento) => {
    const puntos = entrenamiento.configuracionEntrenamiento.puntos * entrenamiento.nivel;
    return total + puntos;
  }, 0);
}

export async function calcularPoderAtaque(totalPropiedades: number, honor: number): Promise<number> {
    if (totalPropiedades < 1) totalPropiedades = 1;
    if (honor < 0) honor = 0;

    // poderataque = 1 / (1 + (pow((Cantidad_de_Propiedades_del_user - 1), (4.5 - (NiveldeHonor / 10)))) / 10000000)
    const poder = 1 / (1 + (Math.pow((totalPropiedades - 1), (4.5 - (honor / 10)))) / 10000000);
    
    // The formula seems to return a value very close to 1. 
    // The original logic used a percentage, so let's convert it.
    // Assuming the formula result is a factor, we multiply by 100 to get a percentage-like value.
    // If it's meant to be a direct multiplier, this might need adjustment.
    // Based on the original code returning values like 100 or 29, returning a percentage seems correct.
    return poder * 100;
}
