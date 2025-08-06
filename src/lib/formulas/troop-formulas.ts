


import type { ConfiguracionTropa } from '@prisma/client';
import { TROOP_TYPE_DEFENSE } from '../constants';
import type { UserWithProgress } from '../types';

/**
 * Calcula el tiempo total de reclutamiento para una cantidad de tropas.
 * La nueva fórmula es: (duracion / nivel_campo) * cantidad
 * @param config - La configuración de la tropa.
 * @param cantidad - El número de tropas a reclutar.
 * @param nivelCampoEntrenamiento - El nivel actual del Campo de Entrenamiento de la propiedad.
 * @returns El tiempo de reclutamiento total en segundos.
 */
export function calcularTiempoReclutamiento(
  config: ConfiguracionTropa,
  cantidad: number,
  nivelCampoEntrenamiento: number
): number {
  if (cantidad <= 0) {
    return 0;
  }

  // Aseguramos que el nivel del campo no sea menor que 1 para evitar división por cero.
  const divisorNivelCampo = Math.max(1, nivelCampoEntrenamiento);

  const tiempoPorUnidad = config.duracion / divisorNivelCampo;
  const tiempoTotal = tiempoPorUnidad * cantidad;

  return Math.max(1, Math.floor(tiempoTotal)); // Aseguramos un tiempo mínimo de reclutamiento.
}


export function calcularStatsTropaConBonus(
    tropaConfig: ConfiguracionTropa, 
    entrenamientos: UserWithProgress['entrenamientos']
  ): { ataqueActual: number, defensaActual: number, capacidadActual: number, velocidadActual: number, salarioActual: number } {
  
    const entrenamientosMap = new Map(entrenamientos.map(e => [e.configuracionEntrenamientoId, e.nivel]));
  
    let ataqueActual = tropaConfig.ataque;
    let defensaActual = tropaConfig.defensa;
    let capacidadActual = tropaConfig.capacidad;
    let velocidadActualNum = Number(tropaConfig.velocidad);
    let salarioActual = tropaConfig.salario;
  
    const bonusAtaqueIds = tropaConfig.bonusAtaque || [];
    const bonusDefensaIds = tropaConfig.bonusDefensa || [];

    // 1. Cáculo de Valor de Combate (Ataque y Defensa) - Multiplicativo
    let factorAtaqueTotal = 1;
    bonusAtaqueIds.forEach(id => {
      const nivel = entrenamientosMap.get(id) || 0;
      if (nivel > 0) {
        factorAtaqueTotal *= (1 + Math.sqrt(nivel) / 10);
      }
    });
    ataqueActual *= factorAtaqueTotal;

    let factorDefensaTotal = 1;
    bonusDefensaIds.forEach(id => {
        const nivel = entrenamientosMap.get(id) || 0;
        if (nivel > 0) {
            factorDefensaTotal *= (1 + Math.sqrt(nivel) / 10);
        }
    });
    defensaActual *= factorDefensaTotal;

    // 2. Bonificación de Capacidad por Contrabando
    if (tropaConfig.tipo !== TROOP_TYPE_DEFENSE && tropaConfig.capacidad > 0) {
      const nivelContrabando = entrenamientosMap.get('contrabando') || 0;
      if (nivelContrabando > 0) {
        capacidadActual *= (1 + Math.sqrt(nivelContrabando) / 10);
      }
    }

    // 3. Bonificaciones de Velocidad
    const tropasRutas = ['maton', 'portero', 'acuchillador', 'pistolero', 'ocupacion', 'porteador'];
    const tropasEncargos = ['espia', 'cia', 'fbi', 'transportista', 'tactico', 'francotirador', 'asesino', 'ninja', 'mercenario', 'demoliciones'];
    
    if (tropasRutas.includes(tropaConfig.id)) {
        const nivelRutas = entrenamientosMap.get('rutas') || 0;
        if (nivelRutas > 0) {
            velocidadActualNum *= (1 + Math.sqrt(nivelRutas) / 10);
        }
    } else if (tropasEncargos.includes(tropaConfig.id)) {
        const nivelEncargos = entrenamientosMap.get('encargos') || 0;
        if (nivelEncargos > 0) {
            velocidadActualNum *= (1 + Math.sqrt(nivelEncargos) / 10);
        }
    }
    
    // 4. Reducción de Salario por Contrabando
    const nivelContrabandoSalario = entrenamientosMap.get('contrabando') || 0;
    if (nivelContrabandoSalario > 0) {
        salarioActual /= (1 + (Math.sqrt(nivelContrabandoSalario) / 10));
    }
  
    return {
      ataqueActual: Math.floor(ataqueActual),
      defensaActual: Math.floor(defensaActual),
      capacidadActual: Math.floor(capacidadActual),
      velocidadActual: Math.floor(velocidadActualNum),
      salarioActual: Math.floor(salarioActual),
    };
  }
