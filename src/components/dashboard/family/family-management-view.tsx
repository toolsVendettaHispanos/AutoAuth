

'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { FullFamily, FullFamilyMember } from "@/lib/types";
import { FamilyRole } from "@prisma/client";
import { useTransition } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Crown, Shield, User as UserIcon, AlertCircle, Trash2, Loader2, Check, MoreVertical } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { updateMemberRole, transferLeadership, expelMember } from "@/lib/actions/family.actions";
import { Badge } from "@/components/ui/badge";
import { useIsMobile } from "@/hooks/use-mobile";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";

interface FamilyManagementViewProps {
    family: FullFamily;
    currentUserId: string;
}

const roleTranslations: Record<FamilyRole, string> = {
    [FamilyRole.LEADER]: "Líder",
    [FamilyRole.CO_LEADER]: "Co-Líder",
    [FamilyRole.MEMBER]: "Miembro",
};

const roleColors: Record<FamilyRole, string> = {
    [FamilyRole.LEADER]: "bg-amber-500 text-amber-900",
    [FamilyRole.CO_LEADER]: "bg-blue-500 text-blue-900",
    [FamilyRole.MEMBER]: "bg-gray-500 text-gray-100",
}

function formatPoints(points: number | null | undefined): string {
    if (points === null || points === undefined) return "0";
    return Math.floor(points).toLocaleString('de-DE');
}


function MemberActions({ member, familyId, currentUserId }: { member: FullFamilyMember, familyId: string, currentUserId: string }) {
    const { toast } = useToast();
    const [isPending, startTransition] = useTransition();
    const isMobile = useIsMobile();
    
    if (member.userId === currentUserId) return null;

    const handleRoleChange = (newRole: FamilyRole) => {
        startTransition(async () => {
            const result = await updateMemberRole(member.userId, familyId, newRole);
            if (result.error) toast({ variant: 'destructive', title: 'Error', description: result.error });
            else toast({ title: 'Éxito', description: result.success });
        });
    }
    
    const handleTransferLeadership = () => {
        startTransition(async () => {
            const result = await transferLeadership(member.userId, familyId);
            if (result.error) toast({ variant: 'destructive', title: 'Error', description: result.error });
            else toast({ title: 'Éxito', description: result.success });
        });
    }

    const handleExpel = () => {
         startTransition(async () => {
            const result = await expelMember(member.userId, familyId);
            if (result.error) toast({ variant: 'destructive', title: 'Error', description: result.error });
            else toast({ title: 'Éxito', description: result.success });
        });
    }
    
    const roleSelect = (
        <Select onValueChange={(role) => handleRoleChange(role as FamilyRole)} defaultValue={member.role} disabled={isPending}>
            <SelectTrigger className="w-[150px] h-9">
                <SelectValue placeholder="Cambiar Rango" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value={FamilyRole.CO_LEADER}>Co-Líder</SelectItem>
                <SelectItem value={FamilyRole.MEMBER}>Miembro</SelectItem>
            </SelectContent>
        </Select>
    );

    const transferDialog = (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm">Transferir Liderazgo</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>¿Transferir el liderazgo?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Esta acción es irreversible. Cederás tu rango de Líder a {member.user.name}. ¿Estás seguro?
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleTransferLeadership} disabled={isPending}>
                        {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check />}
                        Confirmar
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );

    const expelDialog = (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                 <Button variant="destructive" size="sm">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Expulsar
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>¿Expulsar a {member.user.name}?</AlertDialogTitle>
                    <AlertDialogDescription>
                        El jugador será eliminado de la familia permanentemente.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleExpel} variant="destructive" disabled={isPending}>
                        {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 />}
                        Expulsar
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );


    if (isMobile) {
        return (
             <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon"><MoreVertical className="h-5 w-5"/></Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                         <Select onValueChange={(role) => handleRoleChange(role as FamilyRole)} defaultValue={member.role} disabled={isPending}>
                            <SelectTrigger className="w-full border-none h-auto p-0 justify-start gap-2 focus:ring-0">
                                <SelectValue placeholder="Cambiar Rango" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={FamilyRole.CO_LEADER}>Co-Líder</SelectItem>
                                <SelectItem value={FamilyRole.MEMBER}>Miembro</SelectItem>
                            </SelectContent>
                        </Select>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator/>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>Transferir Liderazgo</DropdownMenuItem>
                        </AlertDialogTrigger>
                         <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>¿Transferir el liderazgo?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Esta acción es irreversible. Cederás tu rango de Líder a {member.user.name}. ¿Estás seguro?
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={handleTransferLeadership} disabled={isPending}>
                                    {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check />}
                                    Confirmar
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                     <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive focus:bg-destructive/10 focus:text-destructive">Expulsar Miembro</DropdownMenuItem>
                        </AlertDialogTrigger>
                         <AlertDialogContent>
                             <AlertDialogHeader>
                                <AlertDialogTitle>¿Expulsar a {member.user.name}?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    El jugador será eliminado de la familia permanentemente.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={handleExpel} variant="destructive" disabled={isPending}>
                                    {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 />}
                                    Expulsar
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                     </AlertDialog>
                </DropdownMenuContent>
            </DropdownMenu>
        )
    }

    return (
        <div className="flex items-center gap-2">
            {roleSelect}
            {transferDialog}
            {expelDialog}
        </div>
    );
}


export function FamilyManagementView({ family, currentUserId }: FamilyManagementViewProps) {
    const isMobile = useIsMobile();
    
    const sortedMembers = [...family.members].sort((a, b) => {
        if (a.role === FamilyRole.LEADER) return -1;
        if (b.role === FamilyRole.LEADER) return 1;
        if (a.role === FamilyRole.CO_LEADER) return -1;
        if (b.role === FamilyRole.CO_LEADER) return 1;
        return (b.user.puntuacion?.puntosTotales ?? 0) - (a.user.puntuacion?.puntosTotales ?? 0);
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Administrar Rangos</h2>
                    <p className="text-muted-foreground">Familia: {family.name} [{family.tag}]</p>
                </div>
                <div className="flex gap-2">
                     <Button asChild>
                        <Link href="/family">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Volver
                        </Link>
                    </Button>
                </div>
            </div>
            
            <Card className="bg-primary/5 border-primary/20">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><AlertCircle className="text-primary"/>Permisos del Líder</CardTitle>
                </CardHeader>
                <CardContent>
                    <ul className="list-disc pl-5 text-muted-foreground space-y-1 text-sm">
                        <li>Cambiar rangos de miembros a Co-Líder o Miembro.</li>
                        <li>Transferir el liderazgo a otro miembro (esta acción es irreversible).</li>
                        <li>Expulsar miembros de la familia.</li>
                    </ul>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Miembros de la Familia</CardTitle>
                    <CardDescription>Gestiona los rangos y permisos de los miembros.</CardDescription>
                </CardHeader>
                <CardContent>
                     {/* Vista de tabla para escritorio */}
                    <div className="hidden md:block border rounded-lg overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Miembro</TableHead>
                                    <TableHead>Rango Actual</TableHead>
                                    <TableHead className="text-right">Puntos</TableHead>
                                    <TableHead className="text-right">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {sortedMembers.map(member => (
                                    <TableRow key={member.userId}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Avatar>
                                                    <AvatarImage src={member.user.avatarUrl || ''} />
                                                    <AvatarFallback>{member.user.name.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                                <span className="font-semibold">{member.user.name}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={roleColors[member.role]}>{roleTranslations[member.role]}</Badge>
                                        </TableCell>
                                        <TableCell className="text-right font-mono">{formatPoints(member.user.puntuacion?.puntosTotales)}</TableCell>
                                        <TableCell className="text-right">
                                            <MemberActions member={member} familyId={family.id} currentUserId={currentUserId} />
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                     {/* Vista de tarjetas para móvil */}
                    <div className="md:hidden space-y-3">
                         {sortedMembers.map(member => (
                            <Card key={member.userId} className="p-4">
                                 <div className="flex items-start justify-between gap-4">
                                     <div className="flex items-center gap-3">
                                        <Avatar>
                                            <AvatarImage src={member.user.avatarUrl || ''} />
                                            <AvatarFallback>{member.user.name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-semibold">{member.user.name}</p>
                                            <Badge className={`${roleColors[member.role]} text-xs`}>{roleTranslations[member.role]}</Badge>
                                        </div>
                                    </div>
                                    <MemberActions member={member} familyId={family.id} currentUserId={currentUserId} />
                                </div>
                                <Separator className="my-3"/>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-muted-foreground">Puntos</span>
                                    <span className="font-mono font-semibold">{formatPoints(member.user.puntuacion?.puntosTotales)}</span>
                                </div>
                            </Card>
                         ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
