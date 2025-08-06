
'use client';

import { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { cn } from '@/lib/utils';
import { Swords, Shield, ChevronsRight } from "lucide-react";
import { Button } from '@/components/ui/button';
import type { FullBattleReport } from '@/lib/types';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useRouter } from 'next/navigation';

interface BrawlsViewProps {
    initialReports: FullBattleReport[];
    currentUserId: string;
}

type FilterType = 'all' | 'attacks' | 'defenses' | 'victories' | 'defeats';

export function BrawlsView({ initialReports, currentUserId }: BrawlsViewProps) {
    const router = useRouter();
    const [filter, setFilter] = useState<FilterType>('all');

    const filteredReports = initialReports.filter(report => {
        const isAttacker = report.attackerId === currentUserId;
        const wasVictory = (isAttacker && report.winner === 'attacker') || (!isAttacker && report.winner === 'defender');

        if (filter === 'all') return true;
        if (filter === 'attacks' && isAttacker) return true;
        if (filter === 'defenses' && !isAttacker) return true;
        if (filter === 'victories' && wasVictory) return true;
        if (filter === 'defeats' && !wasVictory) return true;
        return false;
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return (
        <>
            <div className="flex justify-center mb-4 flex-wrap">
                 <ToggleGroup type="single" value={filter} onValueChange={(value: FilterType) => value && setFilter(value)} className="flex-wrap justify-center">
                    <ToggleGroupItem value="all" aria-label="Todas">Todas</ToggleGroupItem>
                    <ToggleGroupItem value="attacks" aria-label="Ataques">Ataques</ToggleGroupItem>
                    <ToggleGroupItem value="defenses" aria-label="Defensas">Defensas</ToggleGroupItem>
                    <ToggleGroupItem value="victories" aria-label="Victorias">Victorias</ToggleGroupItem>
                    <ToggleGroupItem value="defeats" aria-label="Derrotas">Derrotas</ToggleGroupItem>
                </ToggleGroup>
            </div>
            <Card>
                 <ScrollArea className="h-[calc(100vh-340px)]">
                    <CardContent className="p-0">
                        <div className="divide-y divide-border">
                            {filteredReports.length > 0 ? (
                                filteredReports.map(report => {
                                    const isAttacker = report.attackerId === currentUserId;
                                    const opponent = isAttacker ? report.defender : report.attacker;
                                    const wasVictory = (isAttacker && report.winner === 'attacker') || (!isAttacker && report.winner === 'defender');

                                    return (
                                        <div
                                            key={report.id}
                                            className={cn(
                                                "p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 cursor-pointer hover:bg-muted/50 transition-colors ease-in-out",
                                                wasVictory ? "border-l-4 border-green-500/70" : "border-l-4 border-destructive/70"
                                            )}
                                            onClick={() => router.push(`/brawls/${report.id}`)}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="flex-shrink-0">
                                                    {isAttacker ? (
                                                        <Swords className={cn("h-8 w-8", wasVictory ? "text-green-500" : "text-destructive")} />
                                                    ) : (
                                                        <Shield className={cn("h-8 w-8", wasVictory ? "text-green-500" : "text-destructive")} />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-bold">
                                                        {isAttacker ? "Ataque a" : "Defensa contra"} {opponent.name}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {new Date(report.createdAt).toLocaleString('es-ES')}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="sm:ml-auto">
                                                <Button variant="outline" size="sm" className="w-full sm:w-auto">
                                                    Ver Informe
                                                    <ChevronsRight className="ml-2 h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="p-8 text-center text-muted-foreground">
                                    No hay informes que coincidan con el filtro.
                                </div>
                            )}
                        </div>
                    </CardContent>
                 </ScrollArea>
            </Card>
        </>
    );
}
