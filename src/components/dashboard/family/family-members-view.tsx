
'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { FullFamily, FullFamilyMember } from "@/lib/types";
import { FamilyRole } from "@prisma/client";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowUpDown, Crown, Shield, User as UserIcon } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface FamilyMembersViewProps {
    family: FullFamily;
}

type SortKey = 'name' | 'points' | 'status';
type SortDirection = 'asc' | 'desc';

const roleTranslations: Record<FamilyRole, string> = {
    [FamilyRole.LEADER]: "Líder",
    [FamilyRole.CO_LEADER]: "Co-Líder",
    [FamilyRole.MEMBER]: "Miembro",
};

const roleIcons: Record<FamilyRole, React.ReactNode> = {
    [FamilyRole.LEADER]: <Crown className="h-4 w-4 text-amber-400" />,
    [FamilyRole.CO_LEADER]: <Shield className="h-4 w-4 text-blue-400" />,
    [FamilyRole.MEMBER]: <UserIcon className="h-4 w-4 text-muted-foreground" />,
}

function formatPoints(points: number | null | undefined): string {
    if (points === null || points === undefined) return "0";
    return Math.floor(points).toLocaleString('de-DE');
}

function getLastSeenStatus(lastSeen: Date | null): { text: string; isOnline: boolean; minutesAgo: number } {
    if (!lastSeen) return { text: "Nunca", isOnline: false, minutesAgo: Infinity };
    const now = new Date();
    const diffSeconds = Math.floor((now.getTime() - new Date(lastSeen).getTime()) / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);

    if (diffMinutes < 5) return { text: "En Línea", isOnline: true, minutesAgo: diffMinutes };
    if (diffMinutes < 60) return { text: `Hace ${diffMinutes}m`, isOnline: false, minutesAgo: diffMinutes };
    
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return { text: `Hace ${diffHours}h`, isOnline: false, minutesAgo: diffMinutes };

    const diffDays = Math.floor(diffHours / 24);
    return { text: `Hace ${diffDays}d`, isOnline: false, minutesAgo: diffMinutes };
}


export function FamilyMembersView({ family }: FamilyMembersViewProps) {
    const [isClient, setIsClient] = useState(false);
    const [sortKey, setSortKey] = useState<SortKey>('points');
    const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

    useEffect(() => {
        setIsClient(true);
        const timer = setInterval(() => {
            // The purpose of the timer is just to force a re-render periodically
            // to update the "last seen" status, so we don't need to manage state here.
        }, 60000);
        return () => clearInterval(timer);
    }, []);

    const handleSort = (key: SortKey) => {
        if (sortKey === key) {
            setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setSortKey(key);
            setSortDirection('asc');
        }
    }
    
    const sortedMembers = [...family.members].sort((a, b) => {
        const statusA = isClient ? getLastSeenStatus(a.user.lastSeen) : { minutesAgo: Infinity };
        const statusB = isClient ? getLastSeenStatus(b.user.lastSeen) : { minutesAgo: Infinity };

        let compareA: string | number;
        let compareB: string | number;

        switch (sortKey) {
            case 'name':
                compareA = a.user.name.toLowerCase();
                compareB = b.user.name.toLowerCase();
                break;
            case 'points':
                compareA = b.user.puntuacion?.puntosTotales ?? 0; // Default desc
                compareB = a.user.puntuacion?.puntosTotales ?? 0;
                break;
            case 'status':
                compareA = statusA.minutesAgo; // Online first
                compareB = statusB.minutesAgo;
                break;
            default:
                return 0;
        }

        if (compareA > compareB) return sortDirection === 'asc' ? 1 : -1;
        if (compareA < compareB) return sortDirection === 'asc' ? -1 : 1;
        return 0;
    });

    return (
        <div className="space-y-4">
             <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Miembros de {family.name}</h2>
                    <p className="text-muted-foreground">
                        Lista de todos los jugadores de tu familia.
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
                     {/* Desktop Table */}
                    <Table className="hidden md:table">
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[80px]">#</TableHead>
                                <TableHead>
                                     <Button variant="ghost" onClick={() => handleSort('name')}>Jugador <ArrowUpDown className="ml-2 h-4 w-4 inline" /></Button>
                                </TableHead>
                                <TableHead>Posición</TableHead>
                                <TableHead className="text-right">
                                     <Button variant="ghost" onClick={() => handleSort('points')}>Puntos <ArrowUpDown className="ml-2 h-4 w-4 inline" /></Button>
                                </TableHead>
                                <TableHead className="text-right">
                                    <Button variant="ghost" onClick={() => handleSort('status')}>Estado <ArrowUpDown className="ml-2 h-4 w-4 inline" /></Button>
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {sortedMembers.map((member, index) => {
                                const status = isClient ? getLastSeenStatus(member.user.lastSeen) : null;
                                return (
                                    <TableRow key={member.user.id}>
                                        <TableCell className="font-medium text-muted-foreground">{index + 1}</TableCell>
                                        <TableCell>
                                            <Link href={`/profile/${member.user.id}`} className="font-semibold hover:underline">{member.user.name}</Link>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                {roleIcons[member.role]}
                                                <span>{roleTranslations[member.role]}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right font-mono">{formatPoints(member.user.puntuacion?.puntosTotales)}</TableCell>
                                        <TableCell className="text-right">
                                            {isClient && status ? (
                                                <div className="flex items-center justify-end gap-2">
                                                    <div className={cn("h-2.5 w-2.5 rounded-full", status.isOnline ? "bg-green-500" : "bg-muted")} />
                                                    <span className={cn("font-mono text-sm", status.isOnline ? "text-green-400" : "text-muted-foreground")}>
                                                        {status.text}
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="text-sm text-muted-foreground">...</span>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                )
                            })}
                        </TableBody>
                    </Table>
                     {/* Mobile Cards */}
                    <div className="md:hidden p-2 space-y-2">
                        {sortedMembers.map((member, index) => {
                             const status = isClient ? getLastSeenStatus(member.user.lastSeen) : null;
                             return (
                                <Card key={member.user.id} className="p-4">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-3">
                                            <span className="text-lg font-bold text-muted-foreground">#{index + 1}</span>
                                            <div>
                                                 <Link href={`/profile/${member.user.id}`} className="font-semibold hover:underline">{member.user.name}</Link>
                                                 <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                                    {roleIcons[member.role]}
                                                    <span>{roleTranslations[member.role]}</span>
                                                </div>
                                            </div>
                                        </div>
                                        {isClient && status ? (
                                            <div className={cn("text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1.5", status.isOnline ? "bg-green-500/20 text-green-400" : "bg-muted")}>
                                                <div className={cn("h-2 w-2 rounded-full", status.isOnline ? "bg-green-500" : "bg-muted-foreground")} />
                                                {status.text}
                                            </div>
                                        ) : (
                                            <div className="text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1.5 bg-muted">...</div>
                                        )}
                                    </div>
                                    <Separator className="my-3"/>
                                    <div className="text-center">
                                        <p className="text-xl font-bold font-mono text-primary">{formatPoints(member.user.puntuacion?.puntosTotales)}</p>
                                        <p className="text-xs text-muted-foreground">Puntos</p>
                                    </div>
                                </Card>
                             )
                        })}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
