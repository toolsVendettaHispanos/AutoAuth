
'use client'

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { FullFamily, FullFamilyInvitation } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { applyToFamily, rejectInvitation } from "@/lib/actions/family.actions";
import { useToast } from "@/hooks/use-toast";
import { useState, useTransition } from "react";
import { Check, Hourglass, Loader2, Send, X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { InvitationType } from "@prisma/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { acceptFamilyInvitation } from "@/lib/actions/family.actions";

interface FindFamilyViewProps {
    families: FullFamily[];
    userInvitations: FullFamilyInvitation[];
    currentUserId: string;
}

function ActionButton({ familyId, userInvitations }: { familyId: string, userInvitations: FullFamilyInvitation[] }) {
    const { toast } = useToast();
    const [isPending, startTransition] = useTransition();

    const existingRequest = userInvitations.find(inv => inv.familyId === familyId && inv.type === InvitationType.REQUEST);

    const handleApply = () => {
        startTransition(async () => {
            const result = await applyToFamily(familyId);
            if(result.error) {
                toast({ variant: 'destructive', title: 'Error', description: result.error });
            } else {
                toast({ title: 'Éxito', description: 'Solicitud enviada correctamente.' });
            }
        });
    }

    if(existingRequest) {
        return (
             <Button size="sm" variant="secondary" disabled>
                <Hourglass className="mr-2 h-4 w-4" />
                Pendiente
            </Button>
        )
    }

    return (
        <Button size="sm" onClick={handleApply} disabled={isPending}>
            {isPending ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Send className="mr-2 h-4 w-4" />}
            Enviar Solicitud
        </Button>
    )
}

export function FindFamilyView({ families, userInvitations }: FindFamilyViewProps) {
    const [searchTerm, setSearchTerm] = useState("");
    const { toast } = useToast();
    const [isPending, startTransition] = useTransition();

    const filteredFamilies = families.filter(family => 
        family.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        family.tag.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleInvitationAction = (action: 'accept' | 'reject', invitationId: string) => {
        startTransition(async () => {
            const result = action === 'accept'
                ? await acceptFamilyInvitation(invitationId) 
                : await rejectInvitation(invitationId);
            
            if (result.error) {
                toast({ variant: 'destructive', title: 'Error', description: result.error });
            } else {
                toast({ title: 'Éxito', description: result.success });
            }
        })
    }

    const familyInvitations = userInvitations.filter(inv => inv.type === 'INVITATION');

    return (
        <div className="space-y-4">
             <div className="flex items-center justify-between">
                <div>
                     <Button asChild variant="outline" size="sm">
                        <Link href="/family">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Volver
                        </Link>
                    </Button>
                </div>
            </div>
            <Tabs defaultValue="search" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="search">Buscar Familia</TabsTrigger>
                    <TabsTrigger value="invitations">
                        Invitaciones
                        {familyInvitations.length > 0 && <Badge variant="destructive" className="ml-2">{familyInvitations.length}</Badge>}
                    </TabsTrigger>
                </TabsList>
                <TabsContent value="search">
                    <Card>
                        <CardHeader>
                            <CardTitle>Buscar Familias</CardTitle>
                            <CardDescription>Encuentra y solicita unirte a una familia existente.</CardDescription>
                            <Input 
                                placeholder="Buscar por nombre o tag..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="mt-2"
                            />
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="md:grid md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                                {filteredFamilies.map(family => (
                                    <Card key={family.id} className="flex flex-col">
                                        <CardHeader className="flex flex-row items-center gap-4">
                                            <Avatar className="h-16 w-16">
                                                <AvatarImage src={family.avatarUrl || ''} />
                                                <AvatarFallback>{family.tag}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <CardTitle>[{family.tag}] {family.name}</CardTitle>
                                                <CardDescription>{family.members.length} miembros</CardDescription>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="text-sm text-muted-foreground flex-grow">
                                            <p className="line-clamp-2">{family.description || "Esta familia no tiene descripción."}</p>
                                        </CardContent>
                                        <CardFooter className="flex justify-between items-center">
                                            <span className="text-xs font-bold">Puntos: --</span>
                                            <ActionButton familyId={family.id} userInvitations={userInvitations}/>
                                        </CardFooter>
                                    </Card>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="invitations">
                    <Card>
                         <CardHeader>
                            <CardTitle>Invitaciones Recibidas</CardTitle>
                            <CardDescription>Otras familias te quieren en sus filas. ¡Decide tu futuro!</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {familyInvitations.length > 0 ? (
                                <div className="space-y-4">
                                    {familyInvitations.map(inv => (
                                        <div key={inv.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 border rounded-lg gap-4">
                                            <div className="flex items-center gap-4">
                                                <Avatar>
                                                    <AvatarImage src={inv.family.avatarUrl || ''}/>
                                                    <AvatarFallback>{inv.family.tag}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-semibold">[{inv.family.tag}] {inv.family.name}</p>
                                                    <p className="text-xs text-muted-foreground">Te ha invitado a unirte.</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-2 shrink-0">
                                                <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handleInvitationAction('accept', inv.id)} disabled={isPending}>
                                                    <Check className="mr-2 h-4 w-4"/> Aceptar
                                                </Button>
                                                <Button size="sm" variant="destructive" onClick={() => handleInvitationAction('reject', inv.id)} disabled={isPending}>
                                                    <X className="mr-2 h-4 w-4"/> Rechazar
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-center text-muted-foreground py-8">No tienes invitaciones pendientes.</p>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
