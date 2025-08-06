
'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FullFamilyInvitation } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { useTransition } from "react";
import { acceptRequest, rejectInvitation } from "@/lib/actions/family.actions";
import { useToast } from "@/hooks/use-toast";
import { Check, Loader2, X, ArrowLeft } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";


interface FamilyRequestsViewProps {
    requests: FullFamilyInvitation[];
}

function formatPoints(points: number | null | undefined): string {
    if (points === null || points === undefined) return "0";
    return Math.floor(points).toLocaleString('de-DE');
}

export function FamilyRequestsView({ requests }: FamilyRequestsViewProps) {
    const { toast } = useToast();
    const [isPending, startTransition] = useTransition();

    const handleAction = (action: 'accept' | 'reject', invitationId: string) => {
        startTransition(async () => {
            const result = action === 'accept' 
                ? await acceptRequest(invitationId)
                : await rejectInvitation(invitationId);
            
            if(result.error) {
                toast({ variant: 'destructive', title: 'Error', description: result.error });
            } else {
                toast({ title: 'Éxito', description: result.success });
            }
        })
    }
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Solicitudes para Unirse</h2>
                    <p className="text-muted-foreground">
                       Gestiona las solicitudes pendientes de los jugadores que quieren unirse a tu familia.
                    </p>
                </div>
                <Button asChild variant="outline" size="sm">
                    <Link href="/family">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Volver a la Familia
                    </Link>
                </Button>
            </div>
            <Card>
                <CardContent className="p-0">
                    {requests.length === 0 ? (
                        <p className="p-6 text-center text-muted-foreground">No hay solicitudes pendientes.</p>
                    ) : (
                        <>
                        {/* Desktop Table */}
                        <Table className="hidden md:table">
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Jugador</TableHead>
                                    <TableHead className="text-right">Puntos</TableHead>
                                    <TableHead className="text-right">Fecha Solicitud</TableHead>
                                    <TableHead className="text-right">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                             <TableBody>
                                {requests.map(req => (
                                    <TableRow key={req.id}>
                                        <TableCell className="font-semibold">{req.user.name}</TableCell>
                                        <TableCell className="text-right font-mono">{formatPoints(req.user.puntuacion?.puntosTotales)}</TableCell>
                                        <TableCell className="text-right">{new Date(req.createdAt).toLocaleDateString()}</TableCell>
                                        <TableCell className="text-right space-x-2">
                                            <Button size="icon" variant="outline" className="text-green-500 hover:text-green-500 hover:bg-green-500/10" onClick={() => handleAction('accept', req.id)} disabled={isPending}>
                                                {isPending ? <Loader2 className="animate-spin" /> : <Check />}
                                            </Button>
                                             <Button size="icon" variant="outline" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleAction('reject', req.id)} disabled={isPending}>
                                                {isPending ? <Loader2 className="animate-spin" /> : <X />}
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                         {/* Mobile Cards */}
                         <div className="md:hidden p-2 space-y-2">
                            {requests.map(req => (
                                <Card key={req.id} className="p-4">
                                     <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                             <Avatar>
                                                <AvatarImage src={req.user.avatarUrl || ''} />
                                                <AvatarFallback>{req.user.name.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                 <p className="font-semibold">{req.user.name}</p>
                                                <p className="text-xs text-muted-foreground">{new Date(req.createdAt).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                         <div className="text-right">
                                            <p className="font-bold text-primary">{formatPoints(req.user.puntuacion?.puntosTotales)}</p>
                                            <p className="text-xs text-muted-foreground">Puntos</p>
                                        </div>
                                    </div>
                                    <Separator className="my-3"/>
                                    <div className="flex justify-end gap-2">
                                         <Button size="sm" variant="outline" className="flex-1 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleAction('reject', req.id)} disabled={isPending}>
                                            <X className="mr-2 h-4 w-4"/> Rechazar
                                        </Button>
                                        <Button size="sm" className="flex-1" onClick={() => handleAction('accept', req.id)} disabled={isPending}>
                                            <Check className="mr-2 h-4 w-4"/> Aceptar
                                        </Button>
                                    </div>
                                </Card>
                            ))}
                         </div>
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
