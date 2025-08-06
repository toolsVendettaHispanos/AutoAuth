
'use client';

import type { BattleReport, CombatStats } from '@/lib/types/simulation.types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { CheckCircle, XCircle, Swords, Users, Shield, Skull, TrendingDown, Package, Hourglass } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface SimulationReportDisplayProps {
    report: BattleReport | null;
    isSimulating: boolean;
}

function formatNumber(num: number): string {
    if(num === undefined || num === null) return "0";
    return Math.floor(num).toLocaleString('de-DE');
}

const StatCard = ({ title, value, icon, subtext }: { title: string, value: string, icon: React.ReactNode, subtext?: string }) => (
    <Card className="bg-muted/50 p-4 text-center">
        <div className="flex justify-center items-center text-muted-foreground mb-2">{icon}</div>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{title}</p>
        {subtext && <p className="text-xs text-muted-foreground/80 mt-1">{subtext}</p>}
    </Card>
)

export function SimulationReportDisplay({ report, isSimulating }: SimulationReportDisplayProps) {

    if (isSimulating) {
        return (
            <div className="flex flex-col items-center justify-center h-full bg-card rounded-lg border border-dashed p-8 text-center animate-pulse">
                <Hourglass className="h-16 w-16 text-primary mb-4 animate-spin" />
                <h3 className="text-xl font-semibold">Calculando Escenario de Batalla...</h3>
                <p className="text-muted-foreground">Las unidades se están posicionando en el campo.</p>
            </div>
        )
    }

    if (!report) {
        return (
            <div className="flex flex-col items-center justify-center h-full bg-card rounded-lg border border-dashed p-8 text-center">
                <div className="w-24 h-24 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                     <svg width="60" height="60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-muted-foreground animate-pulse-slow">
                        <path d="M12 2L2 7V17L12 22L22 17V7L12 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M2 7L12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M12 22V12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M22 7L12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M17 4.5L7 9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                </div>
                <h3 className="text-xl font-semibold">Simulador de Batalla</h3>
                <p className="text-muted-foreground">Configure las fuerzas y ejecute la simulación para ver el informe aquí.</p>
            </div>
        );
    }
    
    const getWinnerInfo = () => {
        switch(report.winner) {
            case 'attacker':
                return { text: "VICTORIA DECISIVA DEL ATACANTE", icon: <CheckCircle />, className: "bg-green-800/80 text-green-300 border-green-500/50" };
            case 'defender':
                return { text: "DERROTA DEL ATACANTE", icon: <XCircle />, className: "bg-destructive/80 text-destructive-foreground border-destructive/50" };
            default:
                return { text: "EMPATE / BATALLA NO CONCLUYENTE", icon: <Swords />, className: "bg-amber-800/80 text-amber-300 border-amber-500/50" };
        }
    }

    const winnerInfo = getWinnerInfo();
    const stats = report.finalStats;

    return (
        <div className="h-full flex flex-col gap-4 animate-fade-in">
             <Card className={cn("text-center p-4 border-2", winnerInfo.className)}>
                <h3 className="text-lg font-bold flex items-center justify-center gap-2">{winnerInfo.icon}{winnerInfo.text}</h3>
            </Card>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="Bajas Atacante" value={formatNumber(stats.attacker.troopsLost)} icon={<Users className="text-red-400"/>} />
                <StatCard title="Bajas Defensor" value={formatNumber(stats.defender.troopsLost)} icon={<Shield className="text-red-400"/>} />
                <StatCard title="Puntos Perdidos" value={formatNumber(stats.attacker.pointsLost + stats.defender.pointsLost)} icon={<TrendingDown className="text-yellow-400"/>} subtext="Total en batalla" />
                <StatCard title="Botín Estimado" value={formatNumber(Object.values(stats.attacker.lootedResources || {}).reduce((a,b) => a + b, 0))} icon={<Package className="text-green-400"/>} subtext="Recursos saqueados" />
            </div>

            <Card className="flex-grow flex flex-col">
                <CardHeader>
                    <CardTitle>Desglose de la Batalla</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow p-2">
                     <Accordion type="single" collapsible className="w-full" defaultValue="round-1">
                        {report.rounds.map((round, index) => {
                            const combinedTroops = round.attacker.troops.map(t => {
                                const defenderTroop = round.defender.troops.find(d => d.id === t.id);
                                return {
                                    id: t.id,
                                    name: t.nombre,
                                    attackerInitial: t.initialQuantity,
                                    attackerLost: t.lostQuantity,
                                    defenderInitial: defenderTroop?.initialQuantity || 0,
                                    defenderLost: defenderTroop?.lostQuantity || 0,
                                };
                            });

                            return (
                                <AccordionItem value={`round-${index + 1}`} key={index}>
                                    <AccordionTrigger>Ronda {index + 1}</AccordionTrigger>
                                    <AccordionContent>
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Tropa</TableHead>
                                                    <TableHead className="text-center">Atacante</TableHead>
                                                    <TableHead className="text-center">Defensor</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {combinedTroops.filter(t => t.attackerInitial > 0 || t.defenderInitial > 0).map(t => (
                                                    <TableRow key={t.id}>
                                                        <TableCell className="font-medium">{t.name}</TableCell>
                                                        <TableCell className="text-center font-mono">
                                                            {formatNumber(t.attackerInitial)} <span className="text-destructive">(-{formatNumber(t.attackerLost)})</span>
                                                        </TableCell>
                                                          <TableCell className="text-center font-mono">
                                                            {formatNumber(t.defenderInitial)} <span className="text-destructive">(-{formatNumber(t.defenderLost)})</span>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </AccordionContent>
                                </AccordionItem>
                            )
                        })}
                    </Accordion>
                </CardContent>
            </Card>
        </div>
    );
}
