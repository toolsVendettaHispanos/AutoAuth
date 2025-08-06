
'use client';

import { useState, useEffect, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { ColaMisiones, IncomingAttack, FullConfiguracionTropa, ResourceCost } from '@/lib/types';
import { ArrowLeftRight, Check, Loader2, Shield, Swords, Undo2, X } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { cancelarMision } from '@/lib/actions/cancel-mission.action';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { resourceIcons } from '@/lib/constants';

const missionIcons: { [key: string]: React.ReactNode } = {
    ATAQUE: <Swords className="h-4 w-4 text-destructive" />,
    DEFENDER: <Shield className="h-4 w-4 text-blue-500" />,
    TRANSPORTE: <ArrowLeftRight className="h-4 w-4 text-green-500" />,
    ESPIONAJE: <ArrowLeftRight className="h-4 w-4 text-yellow-500" />,
    OCUPAR: <Check className="h-4 w-4 text-primary" />,
    REGRESO: <Undo2 className="h-4 w-4 text-gray-400" />,
};

function formatTime(totalSeconds: number): string {
    if (totalSeconds < 0) totalSeconds = 0;
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = Math.floor(totalSeconds % 60);
    return [hours, minutes, seconds].map(v => v.toString().padStart(2, '0')).join(':');
}

function Countdown({ endDate, onFinish }: { endDate: Date; onFinish: () => void }) {
    const [timeLeft, setTimeLeft] = useState(() => {
        const diff = new Date(endDate).getTime() - new Date().getTime();
        return Math.max(0, Math.floor(diff / 1000));
    });

    useEffect(() => {
        const interval = setInterval(() => {
            const diff = new Date(endDate).getTime() - new Date().getTime();
            const secondsLeft = Math.max(0, Math.floor(diff / 1000));
            setTimeLeft(secondsLeft);
            if (secondsLeft <= 0) {
                clearInterval(interval);
                onFinish();
            }
        }, 1000);
        return () => clearInterval(interval);
    }, [endDate, onFinish]);

    return <span className="font-mono">{formatTime(timeLeft)}</span>;
}

interface MissionOverviewProps {
    missions: ColaMisiones[];
    incomingAttacks: IncomingAttack[];
    allTroops: FullConfiguracionTropa[];
}

const MissionRow = ({ mission, type, allTroops }: { mission: ColaMisiones | IncomingAttack, type: 'outgoing' | 'incoming' | 'returning', allTroops: FullConfiguracionTropa[] }) => {
    const { toast } = useToast();
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const handleCancel = (missionId: string) => {
        startTransition(async () => {
            const result = await cancelarMision(missionId);
            if(result.error) toast({ variant: 'destructive', title: 'Error', description: result.error });
            else toast({ title: 'Éxito', description: result.success });
        })
    }

    const isOutgoing = 'userId' in mission;
    const from = isOutgoing ? `${mission.origenCiudad}:${mission.origenBarrio}` : mission.attackerName;
    const to = isOutgoing ? `${mission.destinoCiudad}:${mission.destinoBarrio}` : mission.targetProperty;
    const troops = isOutgoing ? (mission.tropas as {id: string, cantidad: number}[]).reduce((sum, t) => sum + t.cantidad, 0) : mission.totalTroops;
    const missionType = isOutgoing ? mission.tipoMision : 'ATAQUE';
    const arrivalDate = isOutgoing ? mission.fechaLlegada : mission.arrivalTime;
    const returnDate = isOutgoing ? mission.fechaRegreso : null;
    const resources = (isOutgoing && mission.tipoMision === 'REGRESO' && mission.recursos) ? mission.recursos as ResourceCost : null;

    const finalDate = type === 'returning' && returnDate ? returnDate : arrivalDate;

    return (
        <TableRow className="animate-fade-in-up">
            <TableCell><div className="flex items-center gap-2">{missionIcons[missionType]} <span className="hidden sm:inline">{missionType}</span></div></TableCell>
            <TableCell>
                <p className="font-semibold">{isOutgoing ? `a ${to}` : `de ${from}`}</p>
                <p className="text-xs text-muted-foreground">{new Date(finalDate).toLocaleString('es-ES')}</p>
            </TableCell>
            <TableCell className="text-center">
                 <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild><Button variant="ghost" size="sm" className="font-mono">{troops.toLocaleString('de-DE')}</Button></TooltipTrigger>
                        <TooltipContent>
                           <div className="p-2 space-y-2 w-48">
                                <p className="font-bold text-base">Carga de Flota</p>
                                <Separator/>
                                <div className="space-y-1 text-sm">
                                    <h4 className="font-semibold text-muted-foreground">Tropas</h4>
                                    {isOutgoing && (mission.tropas as {id: string; cantidad: number}[]).map(t => {
                                        const config = allTroops.find(c => c.id === t.id);
                                        return (
                                            <div key={t.id} className="flex justify-between items-center gap-4">
                                                <span className="flex items-center gap-2">
                                                    <Image src={config?.urlImagen || ''} alt={config?.nombre || ''} width={16} height={16} className="bg-white/10 rounded-sm" />
                                                    {config?.nombre || t.id}
                                                </span>
                                                <span className="font-bold">{t.cantidad.toLocaleString('de-DE')}</span>
                                            </div>
                                        )
                                    })}
                                </div>
                                {resources && (
                                    <>
                                        <Separator/>
                                        <div className="space-y-1 text-sm">
                                            <h4 className="font-semibold text-muted-foreground">Recursos</h4>
                                            {Object.entries(resources).map(([key, value]) => (
                                                value > 0 && (
                                                    <div key={key} className="flex justify-between items-center gap-4">
                                                        <span className='capitalize flex items-center gap-2'>
                                                            <Image src={resourceIcons[key]} alt={key} width={16} height={16} />
                                                            {key}:
                                                        </span> 
                                                        <span className="font-bold">{(value as number).toLocaleString('de-DE')}</span>
                                                    </div>
                                                )
                                            ))}
                                        </div>
                                    </>
                                )}
                           </div>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </TableCell>
            <TableCell className="text-right font-mono"><Countdown endDate={finalDate} onFinish={() => router.refresh()} /></TableCell>
            <TableCell className="text-right">
                {isOutgoing && missionType !== 'REGRESO' && (
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive/80 hover:text-destructive"><X/></Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>¿Cancelar misión?</AlertDialogTitle>
                                <AlertDialogDescription>La flota regresará inmediatamente. Esta acción no se puede deshacer.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>No</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleCancel(mission.id)} disabled={isPending}>
                                    {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <X className="mr-2"/>}
                                    Confirmar
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                )}
            </TableCell>
        </TableRow>
    );
}

const getMovementArrival = (movement: ColaMisiones | IncomingAttack): Date => {
    if ('fechaLlegada' in movement) {
        return movement.fechaLlegada;
    }
    return movement.arrivalTime;
}

export function MissionOverview({ missions, incomingAttacks, allTroops }: MissionOverviewProps) {
    const isMobile = useIsMobile();
    const allMovements = [...missions, ...incomingAttacks].sort(
        (a, b) => getMovementArrival(a).getTime() - getMovementArrival(b).getTime()
    );

    if (allMovements.length === 0) return null;

    if (isMobile) {
        return (
             <div className="space-y-3">
                 <h3 className="text-lg font-semibold px-4">Movimiento de Flotas</h3>
                {allMovements.map((mov) => {
                    const isOutgoing = 'userId' in mov;
                    const missionType = isOutgoing ? mov.tipoMision : 'ATAQUE';
                    const from = isOutgoing ? `${mov.origenCiudad}:${mov.origenBarrio}` : mov.attackerName;
                    const to = isOutgoing ? `${mov.destinoCiudad}:${mov.destinoBarrio}` : mov.targetProperty;
                    const finalDate = 'fechaRegreso' in mov && mov.fechaRegreso && mov.tipoMision === 'REGRESO' 
                                        ? mov.fechaRegreso 
                                        : ('fechaLlegada' in mov ? mov.fechaLlegada : mov.arrivalTime);

                    return (
                        <Card key={mov.id} className={cn("p-4", missionType === 'ATAQUE' && 'border-destructive/50')}>
                           <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    {missionIcons[missionType]}
                                    <div>
                                        <p className="font-bold">{missionType}</p>
                                        <p className="text-xs text-muted-foreground">{isOutgoing ? `Hacia ${to}` : `Desde ${from}`}</p>
                                    </div>
                                </div>
                                 <div className="text-right">
                                    <p className="font-mono text-lg"><Countdown endDate={finalDate} onFinish={() => {}} /></p>
                                    <p className="text-xs text-muted-foreground">Tiempo Restante</p>
                                </div>
                           </div>
                        </Card>
                    )
                })}
            </div>
        )
    }

    return (
        <Card className="animate-fade-in-up" style={{ animationDelay: '500ms'}}>
            <CardHeader>
                <CardTitle>Movimiento de Flotas</CardTitle>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-64">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Tipo</TableHead>
                                <TableHead>Origen/Destino</TableHead>
                                <TableHead className="text-center">Tropas</TableHead>
                                <TableHead className="text-right">Tiempo Restante</TableHead>
                                <TableHead className="w-[50px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {allMovements.map(mov => <MissionRow key={mov.id} mission={mov} type={('userId' in mov) ? (mov.tipoMision === 'REGRESO' ? 'returning' : 'outgoing') : 'incoming'} allTroops={allTroops} />)}
                        </TableBody>
                    </Table>
                </ScrollArea>
            </CardContent>
        </Card>
    );
}
