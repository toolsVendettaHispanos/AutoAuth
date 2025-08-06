
'use server';

import { MessageCategory } from "@prisma/client";
import { getSessionUser } from "../auth";
import prisma from "../prisma/prisma";
import { revalidatePath } from "next/cache";

export async function sendMessage(formData: FormData) {
    const user = await getSessionUser();
    if (!user) return { error: "No autenticado." };

    const recipientId = formData.get('recipientId') as string;
    const subject = formData.get('subject') as string;
    const content = formData.get('content') as string;

    if (!recipientId || !subject || !content) {
        return { error: "Todos los campos son obligatorios." };
    }

    try {
        await prisma.message.create({
            data: {
                senderId: user.id,
                recipientId,
                subject,
                content,
                category: MessageCategory.JUGADOR,
            }
        });
        revalidatePath('/messages');
        return { success: true };
    } catch (e) {
        console.error(e);
        return { error: "No se pudo enviar el mensaje." };
    }
}

export async function markMessageAsRead(messageId: string) {
    const user = await getSessionUser();
    if (!user) return { error: "No autenticado." };

    try {
        await prisma.message.updateMany({
            where: {
                id: messageId,
                recipientId: user.id,
            },
            data: {
                isRead: true,
            }
        });
        revalidatePath('/messages');
        return { success: true };
    } catch (e) {
        console.error(e);
        return { error: "No se pudo marcar el mensaje como leído." };
    }
}

export async function deleteMessage(messageId: string) {
    const user = await getSessionUser();
    if (!user) return { error: "No autenticado." };

    try {
        await prisma.message.deleteMany({
            where: {
                id: messageId,
                recipientId: user.id,
            }
        });
        revalidatePath('/messages');
        return { success: true };
    } catch (e) {
        console.error(e);
        return { error: "No se pudo eliminar el mensaje." };
    }
}
