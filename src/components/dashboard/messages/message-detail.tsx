
'use client';
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { FullMessage, FullBattleReport, FullEspionageReport } from "@/lib/types";
import { ArrowLeft, Reply, Trash2, Swords, Eye } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Shield } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BattleReport as BattleReportType } from "@/lib/types/simulation.types";

type FeedItem = (FullMessage & { type: 'message' }) 
                | (FullBattleReport & { type: 'battle' }) 
                | (FullEspionageReport & { type: 'espionage' });

interface MessageDetailProps {
    item: FeedItem;
    onBack: () => void;
}

function formatNumber(num: number): string {
    if (num === null || num === undefined) return "0";
    return num.toLocaleString('de-DE');
}

export function MessageDetail({ item, onBack }: MessageDetailProps) {
    if (!item) {
        return (
            <div className="flex items-center justify-center h-full text-muted-foreground p-8 text-center">
                <p>Selecciona una notificación para leerla.</p>
            </div>
        )
    }

    if (item.type === 'message') {
        return (
            <div className="flex flex-col h-full">
                <div className="p-4 border-b flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0 md:hidden" onClick={onBack}>
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                        <Avatar className="h-10 w-10">
                             {item.sender ? (
                                <AvatarImage src={item.sender.avatarUrl || ''} />
                            ) : (
                                <Shield className="h-full w-full p-2 text-muted-foreground"/>
                            )}
                            <AvatarFallback>{item.sender?.name?.[0] || 'S'}</AvatarFallback>
                        </Avatar>
                         <div className="overflow-hidden">
                            <p className="font-semibold truncate">{item.sender?.name || "Sistema"}</p>
                            <p className="text-xs text-muted-foreground">Recibido: {new Date(item.createdAt).toLocaleString('es-ES')}</p>
                        </div>
                    </div>
                     <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Reply className="h-4 w-4" />
                            <span className="sr-only">Responder</span>
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                             <span className="sr-only">Eliminar</span>
                        </Button>
                     </div>
                </div>
                 <div className="p-6 border-b">
                     <h2 className="text-xl font-bold">{item.subject}</h2>
                </div>
                 {item.battleReportId && (
                    <div className="p-4 border-b">
                        <Button asChild className="w-full">
                            <Link href={`/brawls/${item.battleReportId}`}>
                                <Swords className="mr-2 h-4 w-4" />
                                Ver Informe de Batalla
                            </Link>
                        </Button>
                    </div>
                )}
                {item.espionageReportId && (
                    <div className="p-4 border-b">
                         <Button asChild className="w-full">
                            <Link href={`/espionage/${item.espionageReportId}`}>
                                <Eye className="mr-2 h-4 w-4" />
                                Ver Informe de Espionaje
                            </Link>
                        </Button>
                    </div>
                )}
                <ScrollArea className="flex-grow">
                     <div className="p-6 whitespace-pre-wrap text-sm leading-relaxed">
                        {item.content}
                    </div>
                </ScrollArea>
           </div>
        )
    }

    const details = item.details as BattleReportType;

    return (
        <div className="flex flex-col h-full">
             <div className="p-4 border-b flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0 md:hidden" onClick={onBack}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    {item.type === 'battle' ? <Swords className="h-8 w-8 text-destructive"/> : <Eye className="h-8 w-8 text-blue-500"/>}
                     <div className="overflow-hidden">
                        <p className="font-semibold truncate">{item.type === 'battle' ? 'Informe de Batalla' : 'Informe de Espionaje'}</p>
                        <p className="text-xs text-muted-foreground">Recibido: {new Date(item.createdAt).toLocaleString('es-ES')}</p>
                    </div>
                </div>
            </div>
            <ScrollArea className="flex-grow">
                <div className="p-4 space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>{item.type === 'battle' ? 'Resultado del Combate' : 'Resultado del Espionaje'}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {item.type === 'battle' && (
                                <div className="space-y-2">
                                    <div className="flex justify-between"><span>Atacante:</span> <span className="font-bold">{item.attacker.name}</span></div>
                                    <div className="flex justify-between"><span>Defensor:</span> <span className="font-bold">{item.defender.name}</span></div>
                                    <div className="flex justify-between"><span>Ganador:</span> <span className="font-bold text-primary">{details.winner}</span></div>
                                    <Separator className="my-2"/>
                                    <p className="text-sm text-muted-foreground">Pérdidas Atacante:</p>
                                    <p className="text-xs">Tropas: {formatNumber(details.finalStats.attacker.troopsLost)} | Puntos: {formatNumber(details.finalStats.attacker.pointsLost)}</p>
                                    <p className="text-sm text-muted-foreground">Pérdidas Defensor:</p>
                                    <p className="text-xs">Tropas: {formatNumber(details.finalStats.defender.troopsLost)} | Puntos: {formatNumber(details.finalStats.defender.pointsLost)}</p>
                                </div>
                            )}
                             {item.type === 'espionage' && (
                                <div className="space-y-2">
                                     <div className="flex justify-between"><span>Objetivo:</span> <span className="font-bold">{item.defender.name}</span></div>
                                     <div className="flex justify-between"><span>Resultado:</span> <span className="font-bold text-primary">{item.details.intel ? 'Éxito' : 'Fallo'}</span></div>
                                     <Separator className="my-2"/>
                                     {item.details.intel ? (
                                         <p className="text-sm text-green-400">Se obtuvo información sobre recursos y edificios.</p>
                                     ): (
                                         <p className="text-sm text-destructive">Tus espías fueron detectados y neutralizados.</p>
                                     )}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                    <Button asChild className="w-full">
                        <Link href={`/${item.type === 'battle' ? 'brawls' : 'espionage'}/${item.id}`}>
                            Ver Informe Completo
                        </Link>
                    </Button>
                </div>
            </ScrollArea>
        </div>
    )
}
