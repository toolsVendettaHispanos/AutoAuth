
'use client';

import { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { cn } from '@/lib/utils';
import { ChevronsRight, CheckCircle, XCircle } from "lucide-react";
import { Button } from '@/components/ui/button';
import type { FullEspionageReport } from '@/lib/types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useRouter } from 'next/navigation';

interface EspionageListViewProps {
    initialReports: FullEspionageReport[];
    currentUserId: string;
}

export function EspionageListView({ initialReports, currentUserId }: EspionageListViewProps) {
    const router = useRouter();

    const sortedReports = initialReports.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return (
        <Card>
             <ScrollArea className="h-[calc(100vh-340px)]">
                <CardContent className="p-0">
                    <div className="divide-y divide-border">
                        {sortedReports.length > 0 ? (
                            sortedReports.map(report => {
                                const isAttacker = report.attackerId === currentUserId;
                                const opponent = isAttacker ? report.defender : report.attacker;
                                const wasSuccess = !!report.details.intel;

                                return (
                                    <div
                                        key={report.id}
                                        className={cn(
                                            "p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 cursor-pointer hover:bg-muted/50 transition-colors ease-in-out",
                                            wasSuccess ? "border-l-4 border-green-500/70" : "border-l-4 border-destructive/70"
                                        )}
                                        onClick={() => router.push(`/espionage/${report.id}`)}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="flex-shrink-0">
                                                {wasSuccess ? (
                                                    <CheckCircle className="h-8 w-8 text-green-500" />
                                                ) : (
                                                    <XCircle className="h-8 w-8 text-destructive" />
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-bold">
                                                    {isAttacker ? "Espionaje a" : "Espionaje de"} {opponent.name}
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
                                No tienes informes de espionaje.
                            </div>
                        )}
                    </div>
                </CardContent>
             </ScrollArea>
        </Card>
    );
}
