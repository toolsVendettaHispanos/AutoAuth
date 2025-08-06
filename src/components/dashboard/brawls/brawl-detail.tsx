
'use client';

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { BattleReport } from "@/lib/types/simulation.types";
import type { FullBattleReport } from "@/lib/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface BrawlDetailProps {
    report: FullBattleReport;
    currentUserId: string;
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

export function BrawlDetail({ report }: BrawlDetailProps) {
    const router = useRouter();
    if (!report.details) return null;
    
    const details = report.details as unknown as BattleReport;

    return (
        <div className="w-full max-w-4xl mx-auto bg-black/80 border-primary border text-white font-mono flex flex-col h-full rounded-lg">
            <div className="p-6 pb-2 shrink-0 text-center">
                <h2 className="text-2xl text-primary tracking-widest font-heading">
                    INFORME DE BATALLA
                </h2>
                <p className="text-sm text-muted-foreground">
                    {new Date(report.createdAt).toLocaleString('es-ES')}
                </p>
            </div>
             <div className="flex flex-row items-center justify-around p-4 border-y border-dashed border-white/20 gap-4 shrink-0">
                <Link href={`/profile/${report.attacker.id}`} className={cn("flex flex-col items-center gap-2", details.winner === 'attacker' && "border-2 border-amber-400 p-2 rounded-lg")}>
                    <Avatar className="h-16 w-16 md:h-20 md:w-20">
                        <AvatarImage src={report.attacker.avatarUrl || ''} alt={report.attacker.name} />
                        <AvatarFallback>{report.attacker.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span className="font-bold text-base md:text-lg">{report.attacker.name}</span>
                    <span className="text-xs text-red-400">Pérdidas: {formatNumber(details.finalStats.attacker.troopsLost)}</span>
                </Link>
                <span className="text-3xl md:text-5xl font-black text-destructive">VS</span>
                <Link href={`/profile/${report.defender.id}`} className={cn("flex flex-col items-center gap-2", details.winner === 'defender' && "border-2 border-amber-400 p-2 rounded-lg")}>
                    <Avatar className="h-16 w-16 md:h-20 md:w-20">
                        <AvatarImage src={report.defender.avatarUrl || ''} alt={report.defender.name} />
                        <AvatarFallback>{report.defender.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span className="font-bold text-base md:text-lg">{report.defender.name}</span>
                    <span className="text-xs text-red-400">Pérdidas: {formatNumber(details.finalStats.defender.troopsLost)}</span>
                </Link>
            </div>
            <ScrollArea className="flex-grow min-h-0">
                <div className="space-y-4 p-4">
                    <Card className={cn("p-4 text-center transition-all duration-300 ease-in-out", 
                        details.winner === 'attacker' && "bg-green-900/50 border-green-500/50",
                        details.winner === 'defender' && "bg-red-900/50 border-red-500/50",
                        details.winner === 'draw' && "bg-muted/50"
                    )}>
                        <h3 className={cn("text-xl font-bold flex items-center justify-center gap-2",
                            details.winner === 'attacker' && "text-green-400",
                            details.winner === 'defender' && "text-red-400"
                        )}>
                            {details.winner === 'attacker' && <CheckCircle />}
                            {details.winner === 'defender' && <XCircle />}
                            {details.finalMessage}
                        </h3>
                        <Separator className="my-2 bg-white/10"/>
                        <div className="flex justify-around text-sm">
                            <div>
                                <p className="text-muted-foreground">Puntos Perdidos (Atacante)</p>
                                <p className="font-bold text-lg text-red-400">{formatNumber(details.finalStats.attacker.pointsLost)}</p>
                            </div>
                                <div>
                                <p className="text-muted-foreground">Puntos Perdidos (Defensor)</p>
                                <p className="font-bold text-lg text-red-400">{formatNumber(details.finalStats.defender.pointsLost)}</p>
                            </div>
                        </div>
                    </Card>
                    <Card>
                        <CardHeader><CardTitle className="text-lg">Resumen de Pérdidas</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between text-sm font-bold">
                                <span className="text-blue-400">Atacante</span>
                                <span className="text-red-400">Defensor</span>
                            </div>
                            <Separator className="bg-white/10" />
                            <StatLossBar label="Tropas" attackerValue={details.finalStats.attacker.troopsLost} defenderValue={details.finalStats.defender.troopsLost} />
                            <StatLossBar label="Armas" attackerValue={details.finalStats.attacker.resourcesLost.armas} defenderValue={details.finalStats.defender.resourcesLost.armas} />
                            <StatLossBar label="Munición" attackerValue={details.finalStats.attacker.resourcesLost.municion} defenderValue={details.finalStats.defender.resourcesLost.municion} />
                            <StatLossBar label="Dólares" attackerValue={details.finalStats.attacker.resourcesLost.dolares} defenderValue={details.finalStats.defender.resourcesLost.dolares} />
                        </CardContent>
                    </Card>

                    {details.rounds.map(round => (
                        <div key={round.round} className="space-y-2">
                            <div className="bg-primary/80 text-primary-foreground text-center font-bold font-heading py-1">
                                RONDA DE BATALLA {round.round}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Atacante */}
                                <div>
                                    <h4 className='font-bold text-center mb-1 font-heading'>Atacante</h4>
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="border-b-primary/50">
                                                <TableHead className="text-white">Tropa</TableHead>
                                                <TableHead className="text-right text-white">Cant.</TableHead>
                                                <TableHead className="text-right text-red-500">Pérdidas</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {round.attacker.troops.map(t => (
                                                <TableRow key={t.id} className="border-b-primary/20">
                                                    <TableCell>{t.nombre}</TableCell>
                                                    <TableCell className="text-right">{formatNumber(t.initialQuantity)}</TableCell>
                                                    <TableCell className="text-right text-red-500">{formatNumber(t.lostQuantity)}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                                 {/* Defensor */}
                                <div>
                                     <h4 className='font-bold text-center mb-1 font-heading'>Defensor</h4>
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="border-b-primary/50">
                                                <TableHead className="text-white">Tropa</TableHead>
                                                <TableHead className="text-right text-white">Cant.</TableHead>
                                                <TableHead className="text-right text-red-500">Pérdidas</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {round.defender.troops.map(t => (
                                                <TableRow key={t.id} className="border-b-primary/20">
                                                    <TableCell>{t.nombre}</TableCell>
                                                    <TableCell className="text-right">{formatNumber(t.initialQuantity)}</TableCell>
                                                    <TableCell className="text-right text-red-500">{formatNumber(t.lostQuantity)}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </div>
                            
                            <div className="bg-primary/80 text-primary-foreground text-center font-bold font-heading py-1 mt-2">
                                ESTADO RONDA {round.round}
                            </div>
                            <div className="grid grid-cols-2 gap-x-4 p-2 text-sm font-mono">
                                 <div><span className="font-bold">Ataque Atacante:</span> {formatNumber(round.attacker.totalAttackConBonus)} {round.attacker.poderAtaquePercent ? `(${round.attacker.poderAtaquePercent.toFixed(2)}%)` : ''}</div>
                                 <div className="text-right"><span className="font-bold">Defensa Defensor:</span> {formatNumber(round.defender.totalDefense)}</div>
                                 <div><span className="font-bold">Ataque Defensor:</span> {formatNumber(round.defender.totalAttackConBonus)} {round.defender.poderAtaquePercent ? `(${round.defender.poderAtaquePercent.toFixed(2)}%)` : ''}</div>
                                 <div className="text-right"><span className="font-bold">Defensa Atacante:</span> {formatNumber(round.attacker.totalDefense)}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </ScrollArea>
            <div className="p-4 pt-4 border-t shrink-0">
                <Button onClick={() => router.back()} className="w-full" variant="outline">
                    <ArrowLeft className="mr-2 h-4 w-4"/>
                    Volver a Informes
                </Button>
            </div>
        </div>
    );
}
