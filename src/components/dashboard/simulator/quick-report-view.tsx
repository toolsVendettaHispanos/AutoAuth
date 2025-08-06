
'use client';

import type { BattleReport } from '@/lib/types/simulation.types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { CheckCircle, XCircle, Swords } from 'lucide-react';

interface QuickReportViewProps {
    report: BattleReport | null;
}

function formatNumber(num: number): string {
    if(num === undefined || num === null) return "0";
    return Math.floor(num).toLocaleString('de-DE');
}

const StatLossBar = ({ label, attackerValue, defenderValue }: { label: string, attackerValue: number, defenderValue: number}) => {
    const total = attackerValue + defenderValue;
    const attackerPercent = total > 0 ? (attackerValue / total) * 100 : 0;
    const defenderPercent = total > 0 ? (defenderValue / total) * 100 : 0;
    
    return (
        <div className="space-y-2">
            <div className="flex justify-between items-baseline text-sm">
                <span className="text-blue-400 font-semibold">{formatNumber(attackerValue)}</span>
                <span className="text-muted-foreground">{label}</span>
                <span className="text-red-400 font-semibold">{formatNumber(defenderValue)}</span>
            </div>
            <div className="flex w-full h-3 rounded-full bg-muted overflow-hidden">
                <div style={{ width: `${attackerPercent}%`}} className="bg-blue-600/80 transition-all duration-500 ease-in-out" />
                <div style={{ width: `${defenderPercent}%`}} className="bg-red-800/80 transition-all duration-500 ease-in-out" />
            </div>
        </div>
    )
}

export function QuickReportView({ report }: QuickReportViewProps) {
    if (!report) {
        return null;
    }

    const getWinnerInfo = () => {
        switch(report.winner) {
            case 'attacker':
                return { text: "Victoria del Atacante", icon: <CheckCircle />, className: "text-green-400" };
            case 'defender':
                return { text: "Defensa Exitosa", icon: <XCircle />, className: "text-red-400" };
            default:
                return { text: "Empate", icon: <Swords />, className: "text-amber-400" };
        }
    }

    const winnerInfo = getWinnerInfo();

    return (
        <div className="w-full font-mono">
            <Card className={cn("p-4 text-center transition-all duration-300 ease-in-out", 
                report.winner === 'attacker' && "bg-green-900/50 border-green-500/50",
                report.winner === 'defender' && "bg-red-900/50 border-red-500/50",
                report.winner === 'draw' && "bg-muted/50"
            )}>
                <h3 className={cn("text-xl font-bold flex items-center justify-center gap-2", winnerInfo.className)}>
                    {winnerInfo.icon}
                    {winnerInfo.text}
                </h3>
            </Card>

            <Card className="mt-4">
                <CardHeader>
                    <CardTitle className="text-lg">Resumen de Pérdidas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex justify-between text-sm font-bold">
                        <span className="text-blue-400">Atacante</span>
                        <span className="text-red-400">Defensor</span>
                    </div>
                    <Separator className="bg-white/10" />
                    <StatLossBar label="Tropas" attackerValue={report.finalStats.attacker.troopsLost} defenderValue={report.finalStats.defender.troopsLost} />
                    <StatLossBar label="Puntos" attackerValue={report.finalStats.attacker.pointsLost} defenderValue={report.finalStats.defender.pointsLost} />
                    <Separator className="bg-white/10" />
                    <StatLossBar label="Armas" attackerValue={report.finalStats.attacker.resourcesLost.armas} defenderValue={report.finalStats.defender.resourcesLost.armas} />
                    <StatLossBar label="Munición" attackerValue={report.finalStats.attacker.resourcesLost.municion} defenderValue={report.finalStats.defender.resourcesLost.municion} />
                    <StatLossBar label="Dólares" attackerValue={report.finalStats.attacker.resourcesLost.dolares} defenderValue={report.finalStats.defender.resourcesLost.dolares} />
                </CardContent>
            </Card>
        </div>
    );
}

