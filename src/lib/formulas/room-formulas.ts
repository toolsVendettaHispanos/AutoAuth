import { Propiedad } from '@prisma/client';

export interface ProductionData {
    produccionBruta: number;
    consumoTotal: number;
    produccionNeta: number;
}

export function calculateStorageCapacity(property: Propiedad) {
    // Placeholder implementation
    return {
        armas: 100000,
        municion: 100000,
        alcohol: 100000,
        dolares: 100000,
    };
}

export function calcularProduccionTotalPorSegundo(property: Propiedad) {
    // Placeholder implementation
    const placeholderProduction: ProductionData = {
        produccionBruta: 100,
        consumoTotal: 10,
        produccionNeta: 90,
    };
    return {
        armas: placeholderProduction,
        municion: placeholderProduction,
        alcohol: placeholderProduction,
        dolares: placeholderProduction,
    };
}
