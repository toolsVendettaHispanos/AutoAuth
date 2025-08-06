


'use server';

import { revalidatePath } from "next/cache";
import prisma from "../prisma/prisma";
import { ConfiguracionHabitacion, ConfiguracionTropa, ConfiguracionEntrenamiento, TipoTropa, TropaBonusContrincante } from "@prisma/client";
import { verifyAdminSession } from "../auth-admin";


const parseNumber = (val: FormDataEntryValue | null) => Number(val) || 0;
const parseFloatValue = (val: FormDataEntryValue | null) => parseFloat(String(val)) || 0;
const parseBigInt = (val: FormDataEntryValue | null) => BigInt(String(val || '0'));
const parseString = (val: FormDataEntryValue | null) => String(val || '');
const parseNullString = (val: FormDataEntryValue | null) => val ? String(val) : null;
const parseStringArray = (val: FormDataEntryValue | null) => parseString(val).split(',').map(s => s.trim()).filter(Boolean);


// Room Config CRUD
export async function saveRoomConfig(formData: FormData) {
    const isAdmin = await verifyAdminSession();
    if (!isAdmin) return { error: "No autorizado" };

    const originalId = parseString(formData.get('originalId'));
    const id = parseString(formData.get('id')) || originalId;

    if (!id) {
        return { error: "El ID de la habitación es obligatorio." };
    }

    const data: Omit<ConfiguracionHabitacion, 'createdAt' | 'updatedAt'> = {
        id,
        nombre: parseString(formData.get('nombre')),
        descripcion: parseString(formData.get('descripcion')),
        urlImagen: parseString(formData.get('urlImagen')),
        costoArmas: parseBigInt(formData.get('costoArmas')),
        costoMunicion: parseBigInt(formData.get('costoMunicion')),
        costoDolares: parseBigInt(formData.get('costoDolares')),
        duracion: parseNumber(formData.get('duracion')),
        produccionBase: parseFloatValue(formData.get('produccionBase')),
        produccionRecurso: parseNullString(formData.get('produccionRecurso')),
        puntos: parseFloatValue(formData.get('puntos')),
    };

    const requirementIds = formData.getAll('requirement_ids').map(String);
    const newRequirements = requirementIds.map(reqId => {
        const level = parseNumber(formData.get(`requirement_level_${reqId}`));
        if (level <= 0) {
            throw new Error(`Nivel inválido para el requisito ${reqId}`);
        }
        return { requiredRoomId: reqId, requiredLevel: level };
    });

    try {
        await prisma.$transaction(async (tx) => {
             if (originalId && originalId !== id) {
                await tx.roomRequirement.deleteMany({ where: { OR: [{ roomId: originalId }, { requiredRoomId: originalId }] } });
                await tx.configuracionHabitacion.delete({ where: { id: originalId } });
            }

            await tx.configuracionHabitacion.upsert({
                where: { id: id },
                update: data,
                create: data,
            });

            await tx.roomRequirement.deleteMany({
                where: { roomId: id }
            });

            if (newRequirements.length > 0) {
                await tx.roomRequirement.createMany({
                    data: newRequirements.map(req => ({
                        roomId: id,
                        requiredRoomId: req.requiredRoomId,
                        requiredLevel: req.requiredLevel
                    }))
                });
            }
        });
        revalidatePath('/admin/panel');
        return { success: true };
    } catch (e: unknown) {
        return { error: (e as Error).message };
    }
}

export async function deleteRoomConfig(id: string) {
    const isAdmin = await verifyAdminSession();
    if (!isAdmin) return { error: "No autorizado" };

    try {
         await prisma.$transaction(async (tx) => {
            await tx.roomRequirement.deleteMany({
                where: { OR: [{ roomId: id }, { requiredRoomId: id }] }
            });
            await tx.configuracionHabitacion.delete({ where: { id } });
        });
        revalidatePath('/admin/panel');
        return { success: true };
    } catch (e: unknown) {
        return { error: (e as Error).message };
    }
}


// Training Config CRUD
export async function saveTrainingConfig(formData: FormData) {
    const isAdmin = await verifyAdminSession();
    if (!isAdmin) return { error: "No autorizado" };

    const originalId = parseString(formData.get('originalId'));
    const id = parseString(formData.get('id')) || originalId;
    
    if (!id) {
        return { error: "El ID del entrenamiento es obligatorio." };
    }

    const data: Omit<ConfiguracionEntrenamiento, 'createdAt' | 'updatedAt'> = {
        id,
        nombre: parseString(formData.get('nombre')),
        urlImagen: parseString(formData.get('urlImagen')),
        costoArmas: parseBigInt(formData.get('costoArmas')),
        costoMunicion: parseBigInt(formData.get('costoMunicion')),
        costoDolares: parseBigInt(formData.get('costoDolares')),
        duracion: parseNumber(formData.get('duracion')),
        puntos: parseFloatValue(formData.get('puntos')),
    };

    const requirementIds = formData.getAll('requirement_ids').map(String);
    const newRequirements = requirementIds.map(reqId => {
        const level = parseNumber(formData.get(`requirement_level_${reqId}`));
        if (level <= 0) {
            throw new Error(`Nivel inválido para el requisito ${reqId}`);
        }
        return { requiredTrainingId: reqId, requiredLevel: level };
    });

    try {
        await prisma.$transaction(async (tx) => {
            if (originalId && originalId !== id) {
                 await tx.trainingRequirement.deleteMany({ where: { OR: [{ trainingId: originalId }, { requiredTrainingId: originalId }] } });
                 await tx.configuracionEntrenamiento.delete({ where: { id: originalId } });
            }

            await tx.configuracionEntrenamiento.upsert({
                where: { id: id },
                update: data,
                create: data,
            });

            await tx.trainingRequirement.deleteMany({
                where: { trainingId: id }
            });

            if (newRequirements.length > 0) {
                await tx.trainingRequirement.createMany({
                    data: newRequirements.map(req => ({
                        trainingId: id,
                        requiredTrainingId: req.requiredTrainingId,
                        requiredLevel: req.requiredLevel
                    }))
                });
            }
        });
        revalidatePath('/admin/panel');
        return { success: true };
    } catch (e: unknown) {
        return { error: (e as Error).message };
    }
}

export async function deleteTrainingConfig(id: string) {
    const isAdmin = await verifyAdminSession();
    if (!isAdmin) return { error: "No autorizado" };

    try {
        await prisma.$transaction(async (tx) => {
            await tx.trainingRequirement.deleteMany({
                where: { OR: [{ trainingId: id }, { requiredTrainingId: id }] }
            });
            await tx.configuracionEntrenamiento.delete({ where: { id } });
        });
        revalidatePath('/admin/panel');
        return { success: true };
    } catch (e: unknown) {
        return { error: (e as Error).message };
    }
}


// Troop Config CRUD
export async function saveTroopConfig(formData: FormData) {
    const isAdmin = await verifyAdminSession();
    if (!isAdmin) return { error: "No autorizado" };
    
    const id = parseString(formData.get('idForm')) || parseString(formData.get('id'));
     if (!id) {
        return { error: "El ID de la tropa es obligatorio." };
    }

    const data: Omit<ConfiguracionTropa, 'createdAt' | 'updatedAt'> = {
        id,
        nombre: parseString(formData.get('nombre')),
        urlImagen: parseString(formData.get('urlImagen')),
        descripcion: parseString(formData.get('descripcion')),
        costoArmas: parseBigInt(formData.get('costoArmas')),
        costoMunicion: parseBigInt(formData.get('costoMunicion')),
        costoDolares: parseBigInt(formData.get('costoDolares')),
        duracion: parseNumber(formData.get('duracion')),
        puntos: parseFloatValue(formData.get('puntos')),
        ataque: parseNumber(formData.get('ataque')),
        defensa: parseNumber(formData.get('defensa')),
        capacidad: parseNumber(formData.get('capacidad')),
        velocidad: parseBigInt(formData.get('velocidad')),
        salario: parseNumber(formData.get('salario')),
        tipo: parseString(formData.get('tipo')) as TipoTropa,
        requisitos: parseStringArray(formData.get('requisitos')),
        bonusAtaque: parseStringArray(formData.get('bonusAtaque')),
        bonusDefensa: parseStringArray(formData.get('bonusDefensa')),
    };

    const bonusContrincantes = JSON.parse(parseString(formData.get('bonusContrincantes')) || '[]') as {tropaDefensoraId: string, factorPrioridad: number}[];

    try {
        await prisma.$transaction(async (tx) => {
            await tx.configuracionTropa.upsert({
                where: { id: data.id },
                update: data,
                create: data,
            });

            await tx.tropaBonusContrincante.deleteMany({
                where: { tropaAtacanteId: id }
            });

            if (bonusContrincantes.length > 0) {
                 await tx.tropaBonusContrincante.createMany({
                    data: bonusContrincantes.map((b) => ({
                        tropaAtacanteId: id,
                        tropaDefensoraId: b.tropaDefensoraId,
                        factorPrioridad: b.factorPrioridad
                    }))
                });
            }
        });
        revalidatePath('/admin/panel/troops');
        return { success: true };
    } catch (e: unknown) {
        return { error: (e as Error).message };
    }
}

export async function deleteTroopConfig(id: string) {
    const isAdmin = await verifyAdminSession();
    if (!isAdmin) return { error: "No autorizado" };

    try {
        await prisma.$transaction(async (tx) => {
            await tx.tropaBonusContrincante.deleteMany({
                where: { OR: [{ tropaAtacanteId: id }, { tropaDefensoraId: id }] }
            });
            await tx.configuracionTropa.delete({ where: { id } });
        });
        revalidatePath('/admin/panel/troops');
        return { success: true };
    } catch (e: unknown) {
        return { error: (e as Error).message };
    }
}

// Bonus Config
export async function saveTroopBonusConfig(bonusData: Omit<TropaBonusContrincante, 'id'>[]) {
    const isAdmin = await verifyAdminSession();
    if (!isAdmin) return { error: "No autorizado" };

    try {
        await prisma.$transaction(async (tx) => {
            await tx.tropaBonusContrincante.deleteMany({});
            if (bonusData.length > 0) {
                await tx.tropaBonusContrincante.createMany({
                    data: bonusData,
                });
            }
        });
        revalidatePath('/admin/panel/bonus');
        return { success: true };
    } catch (e: unknown) {
        console.error(e);
        return { error: "Error al guardar la configuración de bonus." };
    }
}
