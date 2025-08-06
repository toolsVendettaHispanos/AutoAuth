
'use client'

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { FullFamily, UserWithProgress } from "@/lib/types";
import { FamilyRole } from "@prisma/client";
import { Users, Loader2, HandMetal, Send, Settings2, AreaChart } from "lucide-react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
  } from "@/components/ui/alert-dialog"
import { useRef, useTransition } from "react";
import { useToast } from "@/hooks/use-toast";
import { createFamilyAnnouncement, leaveFamily } from "@/lib/actions/family.actions";
import Image from "next/image";
import Link from "next/link";
import { InviteMemberDialog } from "./invite-member-dialog";
import { Textarea } from "@/components/ui/textarea";


interface FamilyDashboardViewProps {
    family: FullFamily;
    currentUser: UserWithProgress;
    allUsers: { id: string; name: string; familyMember: { familyId: string; } | null; }[];
    pendingRequests: number;
}

function AnnouncementForm({ familyId }: { familyId: string }) {
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();
    const formRef = useRef<HTMLFormElement>(null);

    const handleSubmit = async (formData: FormData) => {
        const content = formData.get('content') as string;
        if (!content.trim()) {
            toast({ variant: 'destructive', title: 'Error', description: 'El anuncio no puede estar vacío.'});
            return;
        }

        startTransition(async () => {
             const result = await createFamilyAnnouncement(familyId, content);
              if (result.error) {
                 toast({ variant: 'destructive', title: 'Error', description: result.error });
            } else {
                 toast({ title: 'Éxito', description: result.success });
                 formRef.current?.reset();
             }
        });
    }
    
    return (
        <form action={handleSubmit} ref={formRef} className="space-y-2 mt-4">
            <Textarea 
                name="content"
                placeholder="Escribe tu anuncio aquí..."
                rows={3}
                disabled={isPending}
            />
            <Button type="submit" size="sm" disabled={isPending}>
                {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                Publicar
            </Button>
        </form>
    )
}

export function FamilyDashboardView({ family, currentUser, allUsers, pendingRequests }: FamilyDashboardViewProps) {
    const { toast } = useToast();
    const [isPending, startTransition] = useTransition();

    const handleLeaveFamily = () => {
        startTransition(async () => {
            const result = await leaveFamily();
             if (result.error) {
                toast({ variant: 'destructive', title: 'Error', description: result.error });
            } else {
                toast({ title: 'Has abandonado la familia', description: result.success });
            }
        });
    }
    
    const userRole = currentUser.familyMember?.role;
    const canManage = userRole === FamilyRole.LEADER || userRole === FamilyRole.CO_LEADER;
    const isLeader = userRole === FamilyRole.LEADER;

    const usersNotInFamily = allUsers.filter(u => !u.familyMember && u.id !== currentUser.id);

    return (
        <div className="main-view space-y-6">
            <Card className="overflow-hidden">
                <div className="relative h-48 bg-muted">
                    <Image src="/img/login_bg.jpg" alt="Family Banner" fill className="object-cover" data-ai-hint="mafia pattern" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2">
                         <Avatar className="h-28 w-28 border-4 border-background shadow-lg">
                            <AvatarImage src={family.avatarUrl || ''} alt={family.name} data-ai-hint="family crest" />
                            <AvatarFallback className="text-4xl">{family.tag}</AvatarFallback>
                        </Avatar>
                    </div>
                </div>
                 <div className="pt-16 pb-4 px-4 text-center border-b">
                     <h2 className="text-3xl font-bold font-heading tracking-widest text-white shadow-lg">[{family.tag}] {family.name}</h2>
                     <p className="text-muted-foreground max-w-2xl mx-auto mt-2">{family.description || "La familia más temida de la ciudad."}</p>
                 </div>
                 <div className="p-4 bg-muted/30 flex flex-wrap items-center justify-center gap-2">
                    {canManage && <InviteMemberDialog familyId={family.id} allUsers={usersNotInFamily} />}
                    {canManage && (
                         <Button asChild size="sm" variant="outline">
                            <Link href={`/family/requests`}>
                                <HandMetal className="mr-2 h-4 w-4" />
                                Solicitudes
                                {pendingRequests > 0 && <Badge variant="destructive" className="ml-2">{pendingRequests}</Badge>}
                            </Link>
                        </Button>
                    )}
                    {isLeader && (
                         <Button asChild size="sm" variant="outline">
                            <Link href={`/family/management`}>
                                <Settings2 className="mr-2 h-4 w-4" />
                                Administrar Rangos
                            </Link>
                        </Button>
                    )}
                    <Button asChild size="sm" variant="outline">
                        <Link href={`/family/members?id=${family.id}`}>
                            <Users className="mr-2 h-4 w-4" />
                            Ver Lista de Miembros
                        </Link>
                    </Button>
                    <Button asChild size="sm" variant="outline">
                        <Link href="/family/global">
                            <AreaChart className="mr-2 h-4 w-4" />
                            Visión Global
                        </Link>
                    </Button>
                     <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm">Abandonar Familia</Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                            <AlertDialogTitle>¿Estás seguro de que quieres abandonar la familia?</AlertDialogTitle>
                            <AlertDialogDescription>
                                Esta acción no se puede deshacer. Perderás todos los beneficios y la protección de la familia.
                            </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={handleLeaveFamily} disabled={isPending}>
                                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Sí, abandonar familia
                            </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Tablón de Anuncios</CardTitle>
                        </CardHeader>
                        <CardContent>
                           {family.announcements.length === 0 ? (
                            <p className="text-sm text-center text-muted-foreground py-8">
                                El tablón de anuncios está vacío.
                            </p>
                           ) : (
                               <div className="space-y-4">
                                   {family.announcements.map((announcement) => (
                                       <div key={announcement.id} className="p-4 border rounded-md">
                                           <div className="flex items-center gap-3 mb-2">
                                                <Avatar className="h-8 w-8">
                                                    <AvatarImage src={announcement.author.avatarUrl || ''} />
                                                    <AvatarFallback>{announcement.author.name.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-semibold text-sm">{announcement.author.name}</p>
                                                    <p className="text-xs text-muted-foreground">{new Date(announcement.createdAt).toLocaleString()}</p>
                                                </div>
                                           </div>
                                           <p className="text-sm whitespace-pre-wrap">{announcement.content}</p>
                                       </div>
                                   ))}
                               </div>
                           )}
                           {canManage && <AnnouncementForm familyId={family.id} />}
                        </CardContent>
                    </Card>
                </div>
                 <div>
                    <Card>
                        <CardHeader>
                            <CardTitle>Estadísticas</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">Miembros</span>
                                <span className="font-bold">{family.members.length}</span>
                            </div>
                            <Separator />
                            <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">Puntos Totales</span>
                                <span className="font-bold">--</span>
                            </div>
                            <Separator />
                             <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">Posición Ranking</span>
                                <span className="font-bold">--</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )

}
