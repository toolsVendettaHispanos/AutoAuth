
'use client';

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Card, CardContent } from "@/components/ui/card"
import type { UserForRanking } from "@/lib/data";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { Medal } from "lucide-react";
import { cn } from "@/lib/utils";

interface PlayerRankingsViewProps {
    users: UserForRanking[];
    currentUserId: string;
    page: number;
    pageSize: number;
}

function formatPoints(points: number | null | undefined): string {
    if (points === null || points === undefined) return "0";
    return Math.floor(points).toLocaleString('de-DE');
}

const medalColors = [
    "text-amber-400", // Gold
    "text-slate-400", // Silver
    "text-amber-600"  // Bronze
];

export function PlayerRankingsView({ users, currentUserId, page, pageSize }: PlayerRankingsViewProps) {
    return (
        <div className="animate-fade-in">
            <Card className="mt-4">
                <CardContent className="p-0">
                    {/* Vista de Tabla para Escritorio */}
                    <Table className="hidden md:table">
                        <TableHeader>
                            <TableRow className="bg-muted/50 hover:bg-muted/80">
                                <TableHead className="w-[80px] font-bold">#</TableHead>
                                <TableHead className="font-bold">NOMBRE</TableHead>
                                <TableHead className="text-right font-bold">PUNTOS (ENTRÉN.)</TableHead>
                                <TableHead className="text-right font-bold">PUNTOS (EDIFICIOS)</TableHead>
                                <TableHead className="text-right font-bold">PUNTOS (TROPAS)</TableHead>
                                <TableHead className="text-right font-bold">SUMA</TableHead>
                                <TableHead className="text-right font-bold">PROPIEDADES</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.map((user, index) => {
                                const rank = page * pageSize + index + 1;
                                return (
                                <TableRow key={user.id} className={cn(user.id === currentUserId && "bg-primary/10 hover:bg-primary/20")}>
                                    <TableCell className="font-medium text-lg flex items-center gap-2">
                                        {rank <= 3 && <Medal className={cn("h-5 w-5", medalColors[rank - 1])} />}
                                        {rank}
                                    </TableCell>
                                    <TableCell className="font-bold">
                                        <Link href={`/profile/${user.id}`} className="hover:underline">
                                            {user.name}
                                        </Link>
                                    </TableCell>
                                    <TableCell className="text-right font-mono">{formatPoints(user.puntuacion?.puntosEntrenamientos)}</TableCell>
                                    <TableCell className="text-right font-mono">{formatPoints(user.puntuacion?.puntosHabitaciones)}</TableCell>
                                    <TableCell className="text-right font-mono">{formatPoints(user.puntuacion?.puntosTropas)}</TableCell>
                                    <TableCell className="text-right font-bold text-primary font-mono">{formatPoints(user.puntuacion?.puntosTotales)}</TableCell>
                                    <TableCell className="text-right font-mono">{user._count.propiedades}</TableCell>
                                </TableRow>
                            )})}
                        </TableBody>
                    </Table>

                    {/* Vista de Tarjetas para Móvil */}
                    <div className="md:hidden">
                        <div className="space-y-2 p-2">
                            {users.map((user, index) => {
                                const rank = page * pageSize + index + 1;
                                return (
                                <Card key={user.id} className={cn("p-4", user.id === currentUserId && "bg-primary/10 border-primary/20")}>
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-4">
                                            <span className="text-lg font-bold text-muted-foreground w-8 flex items-center gap-1">
                                                {rank <= 3 && <Medal className={cn("h-5 w-5", medalColors[rank - 1])} />}
                                                #{rank}
                                            </span>
                                            <Link href={`/profile/${user.id}`} className="hover:underline">
                                                <span className="font-bold text-lg">{user.name}</span>
                                            </Link>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-bold text-primary text-lg">{formatPoints(user.puntuacion?.puntosTotales)}</div>
                                            <div className="text-xs text-muted-foreground">Puntos Totales</div>
                                        </div>
                                    </div>
                                    <Separator className="my-3" />
                                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Entrenamiento:</span>
                                            <span className="font-semibold">{formatPoints(user.puntuacion?.puntosEntrenamientos)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Edificios:</span>
                                            <span className="font-semibold">{formatPoints(user.puntuacion?.puntosHabitaciones)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Tropas:</span>
                                            <span className="font-semibold">{formatPoints(user.puntuacion?.puntosTropas)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Propiedades:</span>
                                            <span className="font-semibold">{user._count.propiedades}</span>
                                        </div>
                                    </div>
                                </Card>
                            )})}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
