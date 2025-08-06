

import type { ConfiguracionTropa } from "@prisma/client";

interface Coordenadas {
    ciudad: number;
    barrio: number;
    edificio: number;
}

interface CoordenadasVirtuales {
    altura: number;
    anchura: number;
}

export function convertirACoordenadasVirtuales(coords: Coordenadas): CoordenadasVirtuales {
    const altura = (coords.barrio - 1) * 15 + Math.ceil(coords.edificio / 17);
    const anchura = (coords.ciudad - 1) * 17 + (coords.edificio - (Math.floor((coords.edificio - 1) / 17) * 17));
    return { altura, anchura };
}

export function calcularDistancia(coordsOrigen: CoordenadasVirtuales, coordsDestino: CoordenadasVirtuales): number {
    const diffAltura = coordsDestino.altura - coordsOrigen.altura;
    const diffAnchura = coordsDestino.anchura - coordsOrigen.anchura;
    const distancia = Math.sqrt(Math.pow(diffAltura, 2) + Math.pow(diffAnchura, 2));
    return distancia;
}

export function calcularVelocidadFlota(
    tropasEnviadas: { id: string; cantidad: number }[],
    configs: Map<string, ConfiguracionTropa>
): number {
    let velocidadMasLenta: number | null = null;
    
    for (const tropa of tropasEnviadas) {
        if (tropa.cantidad > 0) {
            const config = configs.get(tropa.id);
            if (config) {
                 const velocidadTropa = Number(config.velocidad);
                 if (velocidadMasLenta === null || velocidadTropa < velocidadMasLenta) {
                    velocidadMasLenta = velocidadTropa;
                }
            }
        }
    }
    return velocidadMasLenta === null ? 1000 : velocidadMasLenta;
}


export function calcularDuracionViaje(distancia: number, velocidadFlota: number): number {
    if (velocidadFlota <= 0) {
        return 86400 * 30; // 30 días como fallback.
    }

    const distanciaRedondeada = Math.ceil(distancia);
    const tiempoEnDias = (0.21989 * Math.pow(velocidadFlota, -0.2)) * Math.pow(distanciaRedondeada, 0.2);
    const duracionEnSegundos = Math.round(tiempoEnDias * 86400);

    return Math.max(10, duracionEnSegundos);
}

export function calcularCosteMision(tropasSeleccionadas: { cantidad: number, salario: number }[], distancia: number): number {
    const distanciaRedondeada = Math.ceil(distancia);
    
    const totalCost = tropasSeleccionadas.reduce((sum, tropa) => {
        const tropaCost = ((tropa.cantidad * tropa.salario) / 10) * Math.pow(distanciaRedondeada, 0.8);
        return sum + tropaCost;
    }, 0);

    return Math.floor(totalCost);
}

