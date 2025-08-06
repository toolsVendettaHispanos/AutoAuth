// src/components/lab/battle-report-display.tsx
'use client';

import type { BattleReport, BattleRound, CombatStats } from '@/lib/types/simulation.types';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { resourceIcons } from '@/lib/constants';
import Image from 'next/image';

interface BattleReportDisplayProps {
    report: BattleReport | null;
}

function formatNumber(num: number): string {
    if(num === undefined || num === null) return "0";
    return Math.floor(num).toLocaleString('de-DE');
}

const getWinnerBadgeVariant = (winner: 'attacker' | 'defender' | 'draw') => {
    switch (winner) {
        case 'attacker':
            return 'destructive';
        case 'defender':
            return 'secondary';
        case 'draw':
        default:
            return 'outline';
    }
};

const StatsCard = ({ title, stats, lootedResources }: { title: string, stats: CombatStats[keyof CombatStats], lootedResources?: CombatStats['attacker']['lootedResources'] }) => (
    <div className="space-y-2 rounded-lg border p-4">
        <h4 className="font-semibold text-center">{title}</h4>
        <Separator />
        <div className="text-sm">
            <div className="flex justify-between"><span>Tropas Perdidas:</span> <span className="font-mono">{stats.troopsLost.toLocaleString()}</span></div>
            <div className="flex justify-between"><span>Puntos Perdidos:</span> <span className="font-mono">{stats.pointsLost.toLocaleString()}</span></div>
        </div>
        <div>
            <h5 className="text-xs text-muted-foreground mb-1">Recursos Perdidos:</h5>
            <div className="text-sm space-y-1">
                <div className="flex justify-between"><span>Armas:</span> <span className="font-mono">{stats.resourcesLost.armas.toLocaleString()}</span></div>
                <div className="flex justify-between"><span>Munición:</span> <span className="font-mono">{stats.resourcesLost.municion.toLocaleString()}</span></div>
                <div className="flex justify-between"><span>Dólares:</span> <span className="font-mono">{stats.resourcesLost.dolares.toLocaleString()}</span></div>
            </div>
        </div>
        {lootedResources && (
            <div className='mt-2'>
                <h5 className="text-xs text-green-400 mb-1">Botín Obtenido:</h5>
                 <div className="text-sm space-y-1">
                    {Object.entries(lootedResources).map(([key, value]) => (
                        value > 0 && (
                            <div key={key} className="flex justify-between">
                                <span className='capitalize flex items-center gap-1.5'><Image src={resourceIcons[key]} alt={key} width={12} height={12}/>{key}:</span> 
                                <span className="font-mono text-green-400">+{value.toLocaleString()}</span>
                            </div>
                        )
                    ))}
                </div>
            </div>
        )}
    </div>
);


const RoundDetails = ({ round }: { round: BattleRound }) => {
    const combinedTroops = round.attacker.troops.map(attackerTroop => {
        const defenderTroop = round.defender.troops.find(t => t.id === attackerTroop.id);
        return {
            id: attackerTroop.id,
            nombre: attackerTroop.nombre,
            attackerInitial: attackerTroop.initialQuantity,
            attackerLost: attackerTroop.lostQuantity,
            defenderInitial: defenderTroop?.initialQuantity || 0,
            defenderLost: defenderTroop?.lostQuantity || 0,
        };
    });

    return (
        <div className="space-y-4">
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Tropa</TableHead>
                            <TableHead className="text-center">Atacante</TableHead>
                            <TableHead className="text-center text-destructive">Pérdidas</TableHead>
                            <TableHead className="text-center">Defensor</TableHead>
                            <TableHead className="text-center text-destructive">Pérdidas</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {combinedTroops.map(t => (
                            <TableRow key={t.id}>
                                <TableCell className="font-medium">{t.nombre}</TableCell>
                                <TableCell className="text-center font-mono">{formatNumber(t.attackerInitial)}</TableCell>
                                <TableCell className="text-center font-mono text-destructive">{formatNumber(t.attackerLost)}</TableCell>
                                <TableCell className="text-center font-mono">{formatNumber(t.defenderInitial)}</TableCell>
                                <TableCell className="text-center font-mono text-destructive">{formatNumber(t.defenderLost)}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
};

export function BattleReportDisplay({ report }: BattleReportDisplayProps) {
    if (!report) {
        return (
             <Card className="mt-6">
                <CardHeader>
                    <CardTitle>Reporte de Batalla</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground text-center py-8">
                        Realiza una simulación para ver aquí el reporte de batalla.
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="mt-6">
            <CardHeader>
                <CardTitle className="flex justify-between items-center">
                    <span>Reporte de Batalla</span>
                     <Badge variant={getWinnerBadgeVariant(report.winner)} className="capitalize text-base px-3 py-1">
                        {report.winner === 'draw' ? 'Empate' : `Victoria: ${report.winner}`}
                    </Badge>
                </CardTitle>
                <CardDescription>{report.finalMessage}</CardDescription>
            </CardHeader>
            <CardContent>
                 <Accordion type="single" collapsible className="w-full" defaultValue="round-1">
                    {report.rounds.map(round => (
                         <AccordionItem value={`round-${round.round}`} key={round.round}>
                            <AccordionTrigger className="text-lg font-semibold">
                                RONDA DE BATALLA {round.round}
                            </AccordionTrigger>
                            <AccordionContent>
                                <RoundDetails round={round} />
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
                
                <Separator className="my-6" />

                <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-center">ESTADÍSTICAS FINALES DE COMBATE</h3>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <StatsCard title="Pérdidas del Atacante" stats={report.finalStats.attacker} lootedResources={report.finalStats.attacker.lootedResources} />
                        <StatsCard title="Pérdidas del Defensor" stats={report.finalStats.defender} />
                    </div>
                </div>

            </CardContent>
        </Card>
    );
}
