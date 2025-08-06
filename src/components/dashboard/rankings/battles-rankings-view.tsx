
'use client';

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { Swords } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FullBattleReport } from "@/lib/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { BattleReport } from '@/lib/types/simulation.types';
import { useRouter } from "next/navigation";

interface BattlesRankingsViewProps {
    reports: FullBattleReport[];
    currentUserId: string;
}

function formatNumber(points: number | null | undefined): string {
    if (points === null || points === undefined) return "0";
    return Math.floor(points).toLocaleString('de-DE');
}

export function BattlesRankingsView({ reports }: BattlesRankingsViewProps) {
    const router = useRouter();
    const processedReports = reports.map(report => {
        const details = report.details as unknown as BattleReport;
        const totalTropasDestruidas = (details?.finalStats?.attacker.troopsLost ?? 0) + (details?.finalStats?.defender.troopsLost ?? 0);
        const totalPuntosDestruidos = (details?.finalStats?.attacker.pointsLost ?? 0) + (details?.finalStats?.defender.pointsLost ?? 0);
        return {
            ...report,
            totalTropasDestruidas,
            totalPuntosDestruidos
        };
    });
    
    const handleRowClick = (reportId: string) => {
        router.push(`/brawls/${reportId}`);
    }

    return (
        <div className="animate-fade-in">
            <Card className="mt-4">
                <CardContent className="p-0">
                    {/* Desktop Table */}
                    <Table className="hidden md:table">
                        <TableHeader>
                            <TableRow className="bg-muted/50 hover:bg-muted/80">
                                <TableHead className="font-bold text-center">Enfrentamiento</TableHead>
                                <TableHead className="text-right font-bold">Tropas Destruidas</TableHead>
                                <TableHead className="text-right font-bold">Puntos Destruidos</TableHead>
                                <TableHead className="text-right font-bold">Día</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {processedReports.map((report) => (
                                <TableRow key={report.id} onClick={() => handleRowClick(report.id)} className="cursor-pointer">
                                    <TableCell>
                                        <div className="flex items-center justify-center gap-4">
                                            <Link href={`/profile/${report.attacker.id}`} className="flex items-center gap-2 hover:underline text-green-400 font-semibold" onClick={(e) => e.stopPropagation()}>
                                                <Avatar className="h-8 w-8"><AvatarImage src={report.attacker.avatarUrl || ''} /><AvatarFallback>{report.attacker.name.charAt(0)}</AvatarFallback></Avatar>
                                                {report.attacker.name}
                                            </Link>
                                            <Swords className="h-6 w-6 text-destructive" />
                                             <Link href={`/profile/${report.defender.id}`} className="flex items-center gap-2 hover:underline text-red-400 font-semibold" onClick={(e) => e.stopPropagation()}>
                                                <Avatar className="h-8 w-8"><AvatarImage src={report.defender.avatarUrl || ''} /><AvatarFallback>{report.defender.name.charAt(0)}</AvatarFallback></Avatar>
                                                {report.defender.name}
                                            </Link>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right font-mono">{formatNumber(report.totalTropasDestruidas)}</TableCell>
                                    <TableCell className="text-right font-mono text-primary">{formatNumber(report.totalPuntosDestruidos)}</TableCell>
                                    <TableCell className="text-right text-xs text-muted-foreground">{new Date(report.createdAt).toLocaleDateString()}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    {/* Mobile Cards */}
                     <div className="md:hidden space-y-2 p-2">
                        {processedReports.map((report) => (
                            <Card key={report.id} className="p-4" onClick={() => handleRowClick(report.id)}>
                                <div className="flex justify-between items-center text-sm">
                                    <Link href={`/profile/${report.attacker.id}`} className="font-semibold text-green-400 hover:underline" onClick={(e) => e.stopPropagation()}>{report.attacker.name}</Link>
                                    <Swords className="h-5 w-5 text-destructive" />
                                    <Link href={`/profile/${report.defender.id}`} className="font-semibold text-red-400 hover:underline" onClick={(e) => e.stopPropagation()}>{report.defender.name}</Link>
                                </div>
                                <Separator className="my-3"/>
                                <div className="space-y-1 text-xs">
                                    <div className="flex justify-between"><span>Tropas Destruidas:</span><span className="font-semibold font-mono">{formatNumber(report.totalTropasDestruidas)}</span></div>
                                    <div className="flex justify-between"><span>Puntos Destruidos:</span><span className="font-semibold font-mono">{formatNumber(report.totalPuntosDestruidos)}</span></div>
                                    <div className="flex justify-between"><span>Fecha:</span><span className="font-semibold font-mono">{new Date(report.createdAt).toLocaleString()}</span></div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
