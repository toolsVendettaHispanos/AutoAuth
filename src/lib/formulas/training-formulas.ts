
import type { ConfiguracionEntrenamiento } from '@prisma/client';

export function calcularCostosEntrenamiento(
  nivel: number,
  config: ConfiguracionEntrenamiento
): { armas: number; municion: number; dolares: number } {
  if (nivel <= 1) {
    return { armas: Number(config.costoArmas), municion: Number(config.costoMunicion), dolares: Number(config.costoDolares) };
  }

  const factor = Math.pow(nivel, 2);

  const costoArmas = Math.floor(Number(config.costoArmas) * factor);
  const costoMunicion = Math.floor(Number(config.costoMunicion) * factor);
  const costoDolares = Math.floor(Number(config.costoDolares) * factor);

  return { armas: costoArmas, municion: costoMunicion, dolares: costoDolares };
}

export function calcularTiempoEntrenamiento(
  nivel: number,
  config: ConfiguracionEntrenamiento,
  nivelEscuela: number
): number {
  if (nivel <= 0) {
    return config.duracion;
  }
  
  // La fórmula es (duracion_base * (nivel_objetivo)^2) / nivel_escuela
  // Aseguramos que nivelEscuela sea al menos 1 para evitar división por cero.
  const divisorNivelEscuela = Math.max(1, nivelEscuela);

  const tiempoFinal = (config.duracion * Math.pow(nivel, 2)) / divisorNivelEscuela;
  
  return Math.max(5, Math.floor(tiempoFinal)); // Asegura un tiempo mínimo de 5 segundos.
}
