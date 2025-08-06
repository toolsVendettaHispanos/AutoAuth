
'use server'

import { revalidatePath } from "next/cache";
import prisma from "../prisma/prisma";
import { getSessionUser } from "../auth";

export async function cancelarMision(misionId: string) {
    const user = await getSessionUser();
    if (!user) {
        return { error: "Usuario no autenticado." };
    }

    const mision = await prisma.colaMisiones.findUnique({
        where: { id: misionId }
    });

    if (!mision || mision.userId !== user.id) {
        return { error: "Misión no encontrada o no te pertenece." };
    }
    
    if (new Date() > new Date(mision.fechaLlegada)) {
        return { error: "No se puede cancelar una misión que ya ha llegado a su destino." };
    }

    const ahora = new Date();
    const tiempoTranscurrido = ahora.getTime() - new Date(mision.fechaInicio).getTime();
    const nuevaFechaRegreso = new Date(ahora.getTime() + tiempoTranscurrido);

    try {
        await prisma.colaMisiones.update({
            where: { id: misionId },
            data: {
                tipoMision: 'REGRESO',
                fechaRegreso: nuevaFechaRegreso,
            }
        });
        revalidatePath('/overview');
        revalidatePath('/missions/details');
        return { success: "La misión ha sido cancelada y la flota está de regreso." };

    } catch (error) {
        console.error("Error al cancelar la misión:", error);
        return { error: "No se pudo cancelar la misión." };
    }

}
