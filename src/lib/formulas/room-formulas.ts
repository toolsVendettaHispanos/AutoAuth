

import type { FullConfiguracionHabitacion, FullPropiedad } from '../types';
import { BASE_STORAGE_CAPACITY, ID_CAMPO_ENTRENAMIENTO, ID_ESCUELA_ESPECIALIZACION, ID_OFICINA_JEFE, STORAGE_CAPACITY_PER_LEVEL } from '../constants';

export interface ProductionData {
  produccionBruta: number;
  consumoTotal: number;
  produccionNeta: number;
}


/**
 * Calcula los costos de recursos para construir o mejorar una habitación a un nivel específico.
 */
export function calcularCostosNivel(
  nivel: number,
  config: FullConfiguracionHabitacion
): { armas: number; municion: number; dolares: number } {
  if (nivel <= 1) {
    return { armas: Number(config.costoArmas), municion: Number(config.costoMunicion), dolares: Number(config.costoDolares) };
  }

  const factor = nivel * nivel;

  const costoArmas = Math.floor(Number(config.costoArmas) * factor);
  const costoMunicion = Math.floor(Number(config.costoMunicion) * factor);
  const costoDolares = Math.floor(Number(config.costoDolares) * factor);

  return { armas: costoArmas, municion: costoMunicion, dolares: costoDolares };
}

/**
 * Calcula el tiempo de construcción para una habitación a un nivel específico.
 */
export function calcularTiempoConstruccion(
  nivel: number,
  config: FullConfiguracionHabitacion,
  nivelOficinaJefe: number
): number {
  if (nivel <= 0) {
    return config.duracion;
  }

  if (config.id === ID_OFICINA_JEFE) {
    if (nivel === 1) {
        return config.duracion;
    }
    const tiempoBase = config.duracion;
    return Math.floor(((nivel * nivel) * tiempoBase) / (nivel - 1));
  }

  const divisorOficina = Math.max(1, nivelOficinaJefe);
  
  const tiempoFinal = ((nivel * nivel) / divisorOficina) * config.duracion;

  return Math.max(5, Math.floor(tiempoFinal));
}

function calcularProduccionArmeria(nivel: number): number {
  if (nivel <= 0) return 0;
  return Math.trunc(10 * Math.pow((nivel + 1) / 2, 2));
}

function calcularProduccionMunicion(nivel: number): number {
  if (nivel <= 0) return 0;
  return Math.trunc(20 * Math.pow((nivel + 1) / 2, 2) + 20);
}

function calcularProduccionCerveceria(nivel: number): number {
    if (nivel <= 0) return 0;
    const signo = Math.sign(nivel);
    const entero = Math.trunc(nivel / 2);
    const residuo = nivel % 2;
    const residuoMasUno = (nivel + 1) % 2;
  
    const calculoIntermedio = ((1 + entero) * entero + (entero + 1) * residuo) * 10 + (residuoMasUno * 2);
    return signo * calculoIntermedio * 5;
}

function calcularProduccionTaberna(nivel: number): number {
    if (nivel <= 0) return 0;
    return Math.trunc(2 * Math.pow((nivel + 1) / 2, 2));
}

function calcularProduccionContrabando(nivel: number): number {
    if (nivel <= 0) return 0;
    return Math.trunc(21 * Math.pow((nivel + 1) / 2, 2));
}

export function calcularProduccionRecurso(idHabitacion: string, nivel: number): number {
  switch (idHabitacion) {
    case 'armeria':
      return calcularProduccionArmeria(nivel);
    case 'almacen_de_municion':
      return calcularProduccionMunicion(nivel);
    case 'cerveceria':
      return calcularProduccionCerveceria(nivel);
    case 'taberna':
      return calcularProduccionTaberna(nivel);
    case 'contrabando':
      return calcularProduccionContrabando(nivel);
    default:
      return 0;
  }
}

export function calcularConsumoAlcoholTaberna(produccionDolares: number): number {
    return (produccionDolares * 7) + 3;
}

export function calcularConsumoAlcoholContrabando(produccionDolares: number): number {
    return (produccionDolares * 4) + 1;
}

/**
 * Calcula la producción total por segundo para todos los recursos de una propiedad.
 * @param propiedad - La propiedad para la cual calcular la producción.
 * @returns Un objeto con la producción por segundo de cada recurso.
 */
export function calcularProduccionTotalPorSegundo(propiedad: FullPropiedad): { armas: ProductionData, municion: ProductionData, alcohol: ProductionData, dolares: ProductionData } {
  let produccionArmasPorHora = 0;
  let produccionMunicionPorHora = 0;
  let produccionAlcoholBrutaPorHora = 0;
  let produccionDolaresPorHora = 0;

  const nivelTaberna = propiedad.habitaciones?.find(h => h.configuracionHabitacionId === 'taberna')?.nivel || 0;
  const nivelContrabando = propiedad.habitaciones?.find(h => h.configuracionHabitacionId === 'contrabando')?.nivel || 0;

  propiedad.habitaciones?.forEach(habitacion => {
      const config = habitacion.configuracionHabitacion;
      if (!config || !config.produccionRecurso || habitacion.nivel === 0) return;

      const produccionPorHora = calcularProduccionRecurso(config.id, habitacion.nivel);
      
      switch (config.produccionRecurso) {
          case 'armas':
              produccionArmasPorHora += produccionPorHora;
              break;
          case 'municion':
              produccionMunicionPorHora += produccionPorHora;
              break;
          case 'alcohol':
              produccionAlcoholBrutaPorHora += produccionPorHora;
              break;
      }
  });

  let produccionDolaresTabernaPorHora = calcularProduccionRecurso('taberna', nivelTaberna);
  let consumoAlcoholTaberna = calcularConsumoAlcoholTaberna(produccionDolaresTabernaPorHora);
  
  let produccionDolaresContrabandoPorHora = calcularProduccionRecurso('contrabando', nivelContrabando);
  let consumoAlcoholContrabando = calcularConsumoAlcoholContrabando(produccionDolaresContrabandoPorHora);
  
  let consumoTotalAlcohol = consumoAlcoholTaberna + consumoAlcoholContrabando;
  let produccionNetaAlcoholPorHora = produccionAlcoholBrutaPorHora - consumoTotalAlcohol;


  if (produccionNetaAlcoholPorHora < 0) {
      let alcoholDisponible = produccionAlcoholBrutaPorHora;

      if (alcoholDisponible >= consumoAlcoholTaberna) {
          alcoholDisponible -= consumoAlcoholTaberna;
          if(alcoholDisponible < consumoAlcoholContrabando){
            produccionDolaresContrabandoPorHora = Math.max(0, (alcoholDisponible - 1) / 4);
          }
      } else {
          produccionDolaresTabernaPorHora = Math.max(0, (alcoholDisponible - 3) / 7);
          produccionDolaresContrabandoPorHora = 0; 
      }
  }

  produccionDolaresPorHora = produccionDolaresTabernaPorHora + produccionDolaresContrabandoPorHora;

  return {
    armas: { produccionBruta: produccionArmasPorHora, consumoTotal: 0, produccionNeta: produccionArmasPorHora },
    municion: { produccionBruta: produccionMunicionPorHora, consumoTotal: 0, produccionNeta: produccionMunicionPorHora },
    alcohol: { produccionBruta: produccionAlcoholBrutaPorHora, consumoTotal: consumoTotalAlcohol, produccionNeta: produccionNetaAlcoholPorHora },
    dolares: { produccionBruta: produccionDolaresPorHora, consumoTotal: 0, produccionNeta: produccionDolaresPorHora },
  };
}


/**
 * Calcula la capacidad de almacenamiento de recursos de una propiedad.
 * @param propiedad - La propiedad con sus habitaciones.
 * @returns Un objeto con la capacidad máxima de cada recurso.
 */
export function calculateStorageCapacity(propiedad: FullPropiedad): { armas: number, municion: number, alcohol: number, dolares: number } {
    if (!propiedad || !propiedad.habitaciones) {
        return { armas: BASE_STORAGE_CAPACITY, municion: BASE_STORAGE_CAPACITY, alcohol: BASE_STORAGE_CAPACITY, dolares: BASE_STORAGE_CAPACITY };
    }
    let capacidadArmas = BASE_STORAGE_CAPACITY;
    let capacidadMunicion = BASE_STORAGE_CAPACITY;
    let capacidadAlcohol = BASE_STORAGE_CAPACITY;
    let capacidadDolares = BASE_STORAGE_CAPACITY;

    const almacenArmas = propiedad.habitaciones.find(h => h.configuracionHabitacionId === 'almacen_de_armas');
    if (almacenArmas) {
        capacidadArmas += almacenArmas.nivel * STORAGE_CAPACITY_PER_LEVEL;
    }

    const depositoMunicion = propiedad.habitaciones.find(h => h.configuracionHabitacionId === 'deposito_de_municion');
    if (depositoMunicion) {
        capacidadMunicion += depositoMunicion.nivel * STORAGE_CAPACITY_PER_LEVEL;
    }

    const almacenAlcohol = propiedad.habitaciones.find(h => h.configuracionHabitacionId === 'almacen_de_alcohol');
    if (almacenAlcohol) {
        capacidadAlcohol += almacenAlcohol.nivel * STORAGE_CAPACITY_PER_LEVEL;
    }

    const cajaFuerte = propiedad.habitaciones.find(h => h.configuracionHabitacionId === 'caja_fuerte');
    if (cajaFuerte) {
        capacidadDolares += cajaFuerte.nivel * STORAGE_CAPACITY_PER_LEVEL;
    }

    return {
        armas: capacidadArmas,
        municion: capacidadMunicion,
        alcohol: capacidadAlcohol,
        dolares: capacidadDolares,
    };
}

export function calculateSafeStorage(propiedad: FullPropiedad): { armas: number, municion: number, alcohol: number, dolares: number } {
     if (!propiedad || !propiedad.habitaciones) {
        return { armas: 0, municion: 0, alcohol: 0, dolares: 0 };
    }
    let safeArmas = 0;
    let safeMunicion = 0;
    let safeAlcohol = 0;
    let safeDolares = 0;

    const almacenArmas = propiedad.habitaciones.find(h => h.configuracionHabitacionId === 'almacen_de_armas');
    if (almacenArmas) {
        safeArmas = BASE_STORAGE_CAPACITY + (almacenArmas.nivel * STORAGE_CAPACITY_PER_LEVEL);
    }

    const depositoMunicion = propiedad.habitaciones.find(h => h.configuracionHabitacionId === 'deposito_de_municion');
    if (depositoMunicion) {
        safeMunicion = BASE_STORAGE_CAPACITY + (depositoMunicion.nivel * STORAGE_CAPACITY_PER_LEVEL);
    }

    const almacenAlcohol = propiedad.habitaciones.find(h => h.configuracionHabitacionId === 'almacen_de_alcohol');
    if (almacenAlcohol) {
        safeAlcohol = BASE_STORAGE_CAPACITY + (almacenAlcohol.nivel * STORAGE_CAPACITY_PER_LEVEL);
    }

    const cajaFuerte = propiedad.habitaciones.find(h => h.configuracionHabitacionId === 'caja_fuerte');
    if (cajaFuerte) {
        safeDolares = BASE_STORAGE_CAPACITY + (cajaFuerte.nivel * STORAGE_CAPACITY_PER_LEVEL);
    }

    return {
        armas: Math.floor(safeArmas),
        municion: Math.floor(safeMunicion),
        alcohol: Math.floor(safeAlcohol),
        dolares: Math.floor(safeDolares),
    };
}
