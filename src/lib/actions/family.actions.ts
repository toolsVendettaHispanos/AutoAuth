
'use server';

import prisma from "../prisma/prisma";
import { getSessionUser } from "../auth";
import { revalidatePath } from "next/cache";
import { FamilyRole, InvitationStatus, InvitationType } from "@prisma/client";

export async function createFamily(formData: FormData) {
    const user = await getSessionUser();
    if (!user) return { error: "Debes iniciar sesión para crear una familia." };
    if (user.familyMember) return { error: "Ya perteneces a una familia." };

    const name = formData.get('name') as string;
    const tag = formData.get('tag') as string;

    if (!name || !tag) return { error: "El nombre y el tag son obligatorios." };
    if (tag.length < 3 || tag.length > 4) return { error: "El tag debe tener entre 3 y 4 caracteres." };

    try {
        const newFamily = await prisma.family.create({
            data: {
                name,
                tag,
                description: formData.get('description') as string,
                avatarUrl: formData.get('avatarUrl') as string,
                members: {
                    create: {
                        userId: user.id,
                        role: FamilyRole.LEADER,
                    }
                }
            }
        });
        revalidatePath('/family');
        return { success: `¡Familia "${newFamily.name}" creada con éxito!`, family: newFamily };
    } catch (error: any) {
        if (error.code === 'P2002') { // Prisma unique constraint violation
            return { error: "El nombre o el tag de la familia ya están en uso." };
        }
        console.error(error);
        return { error: "Ocurrió un error al crear la familia." };
    }
}

export async function inviteUserToFamily(userIdToInvite: string, familyId: string) {
    const user = await getSessionUser();
    if (!user || !user.familyMember) return { error: "No tienes permisos para invitar." };
    if (user.familyMember.familyId !== familyId) return { error: "No puedes invitar a una familia a la que no perteneces." };
    
    const role = user.familyMember.role;
    if (role !== FamilyRole.LEADER && role !== FamilyRole.CO_LEADER) {
        return { error: "Solo los líderes y co-líderes pueden enviar invitaciones." };
    }

    try {
        await prisma.familyInvitation.create({
            data: {
                familyId: familyId,
                userId: userIdToInvite,
                type: InvitationType.INVITATION, // Family invites user
                status: InvitationStatus.PENDING,
            }
        });
        revalidatePath('/family');
        return { success: "Invitación enviada." };
    } catch (error: any) {
         if (error.code === 'P2002') {
            return { error: "Ya existe una invitación o solicitud para este usuario." };
        }
        console.error(error);
        return { error: "No se pudo enviar la invitación." };
    }
}


export async function acceptFamilyInvitation(invitationId: string) {
    const user = await getSessionUser();
    if (!user) return { error: "Usuario no autenticado." };
    if (user.familyMember) return { error: "Ya perteneces a una familia." };

    const invitation = await prisma.familyInvitation.findUnique({
        where: { id: invitationId }
    });

    if (!invitation || invitation.userId !== user.id) {
        return { error: "Invitación no válida." };
    }
    
    try {
        await prisma.$transaction(async (tx) => {
            await tx.familyMember.create({
                data: {
                    userId: user.id,
                    familyId: invitation.familyId,
                    role: FamilyRole.MEMBER
                }
            });
            
            // Delete this invitation and any other pending invitations/requests for this user
            await tx.familyInvitation.deleteMany({
                where: {
                    userId: user.id,
                }
            })
        });

        revalidatePath('/family');
        return { success: "¡Bienvenido a la familia!" };
    } catch(error) {
        console.error(error);
        return { error: "Error al unirse a la familia." };
    }
}


export async function leaveFamily() {
    const user = await getSessionUser();
    if (!user || !user.familyMember) return { error: "No perteneces a ninguna familia." };

    // Add logic here to handle if the user is the leader
    if (user.familyMember.role === FamilyRole.LEADER) {
        const members = await prisma.familyMember.count({
            where: { familyId: user.familyMember.familyId }
        });
        if (members > 1) {
            return { error: "Eres el líder. Debes nombrar a un nuevo líder o ser el último miembro para poder abandonar la familia." }
        }
    }

    try {
        await prisma.$transaction(async (tx) => {
             const familyId = user.familyMember!.familyId;
             await tx.familyMember.delete({
                where: { userId: user.id }
            });
            const remainingMembers = await tx.familyMember.count({
                where: { familyId: familyId }
            });
            if (remainingMembers === 0) {
                // If last member leaves, also delete the family and any pending requests
                await tx.familyInvitation.deleteMany({ where: { familyId: familyId } });
                await tx.family.delete({ where: { id: familyId } });
            }
        });
        
        revalidatePath('/family');
        return { success: "Has abandonado la familia." };
    } catch(error) {
        console.error(error);
        return { error: "No se pudo abandonar la familia." };
    }
}

export async function applyToFamily(familyId: string) {
    const user = await getSessionUser();
    if (!user) return { error: "Debes iniciar sesión para solicitar unirte." };
    if (user.familyMember) return { error: "Ya perteneces a una familia." };

    try {
        await prisma.familyInvitation.create({
            data: {
                familyId: familyId,
                userId: user.id,
                type: InvitationType.REQUEST, // User requests to join
                status: InvitationStatus.PENDING,
            }
        });
        revalidatePath('/family/find');
        return { success: "Solicitud enviada." };
    } catch (error: any) {
         if (error.code === 'P2002') {
            return { error: "Ya has enviado una solicitud a esta familia." };
        }
        console.error(error);
        return { error: "No se pudo enviar la solicitud." };
    }
}


export async function cancelInvitation(invitationId: string) {
    const user = await getSessionUser();
    if (!user) return { error: "No autenticado." };
    
    const invitation = await prisma.familyInvitation.findUnique({ where: { id: invitationId }, include: { family: { include: { members: true } } }});
    if(!invitation) return { error: "Invitación no encontrada." };
    
    // User can cancel their own application, or a leader can cancel an invitation
    const userIsLeader = invitation.family.members.some(m => m.userId === user.id && (m.role === "LEADER" || m.role === "CO_LEADER"));
    const userIsApplicant = invitation.userId === user.id;

    if (!userIsLeader && !userIsApplicant) {
        return { error: "No tienes permiso para cancelar esta solicitud/invitación." };
    }

    try {
        await prisma.familyInvitation.update({
            where: { id: invitationId },
            data: { status: InvitationStatus.CANCELLED }
        });
        revalidatePath('/family');
        revalidatePath('/family/find');
        return { success: "Solicitud/Invitación cancelada." };
    } catch(error) {
        console.error(error);
        return { error: "Error al cancelar." };
    }
}

export async function rejectInvitation(invitationId: string) {
    const user = await getSessionUser();
    if (!user) return { error: "No autenticado." };

    const invitation = await prisma.familyInvitation.findUnique({ where: { id: invitationId }, include: { family: { include: { members: true } } }});
    if(!invitation) return { error: "Invitación/Solicitud no encontrada." };

    const userIsLeader = invitation.family.members.some(m => m.userId === user.id && (m.role === "LEADER" || m.role === "CO_LEADER"));
    const userIsInvitee = invitation.userId === user.id;

    if (!userIsLeader && !userIsInvitee) {
        return { error: "No tienes permiso para realizar esta acción." };
    }

    try {
        await prisma.familyInvitation.update({
            where: { id: invitationId },
            data: { status: InvitationStatus.REJECTED }
        });
        revalidatePath('/family');
        revalidatePath('/family/requests');
        return { success: "Solicitud/Invitación rechazada." };
    } catch(error) {
        console.error(error);
        return { error: "Error al rechazar." };
    }
}

export async function acceptRequest(invitationId: string) {
    const user = await getSessionUser();
    if (!user || !user.familyMember) return { error: "No tienes permisos para aceptar." };

    const invitation = await prisma.familyInvitation.findUnique({
        where: { id: invitationId },
    });

    if (!invitation || invitation.familyId !== user.familyMember.familyId) {
        return { error: "Solicitud no válida o no para tu familia." };
    }
    
    const role = user.familyMember.role;
    if (role !== FamilyRole.LEADER && role !== FamilyRole.CO_LEADER) {
        return { error: "Solo los líderes y co-líderes pueden aceptar solicitudes." };
    }

    try {
        await prisma.$transaction(async (tx) => {
            // Check if user to be added is already in a family
            const applicant = await tx.user.findUnique({
                where: { id: invitation.userId },
                include: { familyMember: true }
            });
            if (applicant?.familyMember) {
                throw new Error("El usuario ya se ha unido a otra familia.");
            }

            await tx.familyMember.create({
                data: {
                    userId: invitation.userId,
                    familyId: invitation.familyId,
                    role: FamilyRole.MEMBER
                }
            });
            
            // Delete all pending invitations and requests for the user who was just accepted
            await tx.familyInvitation.deleteMany({
                where: {
                    userId: invitation.userId
                }
            });
        });

        revalidatePath('/family');
        revalidatePath('/family/requests');
        return { success: "¡Nuevo miembro aceptado en la familia!" };
    } catch(error: any) {
        console.error(error);
        return { error: error.message || "Error al aceptar al miembro." };
    }
}

export async function createFamilyAnnouncement(familyId: string, content: string) {
    const user = await getSessionUser();
    if (!user || !user.familyMember) return { error: "No tienes permisos para crear un anuncio." };

    const member = await prisma.familyMember.findUnique({
        where: { userId: user.id }
    });

    if (!member || member.familyId !== familyId) {
        return { error: "No perteneces a esta familia." };
    }

    if (member.role !== FamilyRole.LEADER && member.role !== FamilyRole.CO_LEADER) {
        return { error: "Solo los líderes y co-líderes pueden crear anuncios." };
    }

    if (!content.trim()) {
        return { error: "El contenido del anuncio no puede estar vacío." };
    }

    try {
        await prisma.familyAnnouncement.create({
            data: {
                content,
                familyId,
                authorId: user.id,
            }
        });

        revalidatePath('/family');
        return { success: "Anuncio publicado." };
    } catch (e) {
        console.error(e);
        return { error: "Error al publicar el anuncio." };
    }
}

export async function updateMemberRole(memberId: string, familyId: string, newRole: FamilyRole) {
    const user = await getSessionUser();
    if (!user || !user.familyMember || user.familyMember.role !== FamilyRole.LEADER || user.familyMember.familyId !== familyId) {
        return { error: "No tienes permiso para realizar esta acción." };
    }
    if (newRole === FamilyRole.LEADER) {
        return { error: "El liderazgo solo se puede transferir, no asignar." };
    }
    try {
        await prisma.familyMember.update({
            where: { userId: memberId },
            data: { role: newRole }
        });
        revalidatePath('/family/management');
        return { success: "Rango actualizado correctamente." };
    } catch (error) {
        return { error: "Error al actualizar el rango." };
    }
}

export async function transferLeadership(newLeaderId: string, familyId: string) {
    const user = await getSessionUser();
    if (!user || !user.familyMember || user.familyMember.role !== FamilyRole.LEADER || user.familyMember.familyId !== familyId) {
        return { error: "No tienes permiso para realizar esta acción." };
    }
    try {
        await prisma.$transaction(async (tx) => {
            await tx.familyMember.update({
                where: { userId: user.id },
                data: { role: FamilyRole.CO_LEADER }
            });
            await tx.familyMember.update({
                where: { userId: newLeaderId },
                data: { role: FamilyRole.LEADER }
            });
        });
        revalidatePath('/family/management');
        revalidatePath('/family');
        return { success: "Liderazgo transferido con éxito." };
    } catch (error) {
        return { error: "Error al transferir el liderazgo." };
    }
}

export async function expelMember(memberId: string, familyId: string) {
    const user = await getSessionUser();
    if (!user || !user.familyMember || user.familyMember.role !== FamilyRole.LEADER || user.familyMember.familyId !== familyId) {
        return { error: "No tienes permiso para realizar esta acción." };
    }
    try {
        await prisma.familyMember.delete({
            where: { userId: memberId }
        });
        revalidatePath('/family/management');
        return { success: "Miembro expulsado." };
    } catch (error) {
        return { error: "Error al expulsar al miembro." };
    }
}
