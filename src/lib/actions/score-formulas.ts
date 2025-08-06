
import type { UserWithProgress } from "../data";

export function calcularPuntosHabitaciones(user: UserWithProgress): number {
  if (!user.propiedades || user.propiedades.length === 0) return 0;

  return user.propiedades.reduce((totalPropiedades, propiedad) => {
    const puntosPropiedad = propiedad.habitaciones.reduce((totalHabitaciones, habitacion) => {
      const puntos = habitacion.configuracionHabitacion.puntos * habitacion.nivel;
      return totalHabitaciones + puntos;
    }, 0);
    return totalPropiedades + puntosPropiedad;
  }, 0);
}

export function calcularPuntosTropas(user: UserWithProgress): number {
  if (!user.propiedades) return 0;
  
  return user.propiedades.reduce((totalPropiedades, propiedad) => {
    if (!propiedad.TropaUsuario) return totalPropiedades;
    const puntosPropiedad = propiedad.TropaUsuario.reduce((totalTropas, tropa) => {
      const puntos = tropa.configuracionTropa.puntos * tropa.cantidad;
      return totalTropas + puntos;
    }, 0);
    return totalPropiedades + puntosPropiedad;
  }, 0);
}

export function calcularPuntosEntrenamientos(user: UserWithProgress): number {
  if (!user.entrenamientos) return 0;

  return user.entrenamientos.reduce((total, entrenamiento) => {
    const puntos = entrenamiento.configuracionEntrenamiento.puntos * entrenamiento.nivel;
    return total + puntos;
  }, 0);
}
