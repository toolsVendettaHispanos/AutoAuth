
'use client';

import { useEffect, useState, useTransition } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { FullPropiedad, ColaConstruccion } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { Clock, Loader2, Timer, X } from 'lucide-react';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '../ui/tooltip';
import Image from 'next/image';
import { MAX_CONSTRUCTION_QUEUE_SIZE } from '@/lib/constants';
import { Button } from '../ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { cancelarConstruccion } from '@/lib/actions/room.actions';

function formatTime(totalSeconds: number) {
    if (totalSeconds < 0) totalSeconds = 0;
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = Math.floor(totalSeconds % 60);
    return [hours, minutes, seconds]
        .map(v => v.toString().padStart(2, '0'))
        .join(':');
}

type ConstructionQueueProps = {
    propiedad: FullPropiedad;
    allRooms: { id: string; nombre: string; urlImagen: string | null }[];
};

export function ConstructionQueue({ propiedad, allRooms }: ConstructionQueueProps) {
    const router = useRouter();
    const { toast } = useToast();
    const [isPending, startTransition] = useTransition();
    const [timers, setTimers] = useState<Record<string, number>>({});

    const construccionesEnCola = propiedad.colaConstruccion;

    const handleCancel = (colaId: string) => {
        startTransition(async () => {
            const result = await cancelarConstruccion(colaId);
            if (result.error) {
                toast({ variant: 'destructive', title: 'Error', description: result.error });
            } else {
                toast({ title: 'Construcción Cancelada', description: result.success });
            }
        });
    }

    useEffect(() => {
        const intervalId = setInterval(() => {
            const now = new Date().getTime();
            let hasChanged = false;
            const newTimers = { ...timers };

            construccionesEnCola.forEach((item: ColaConstruccion) => {
                if (item.fechaFinalizacion) {
                    const endTime = new Date(item.fechaFinalizacion).getTime();
                    const newTimeLeft = Math.max(0, Math.floor((endTime - now) / 1000));
                    
                    if (newTimers[item.id] !== newTimeLeft) {
                        newTimers[item.id] = newTimeLeft;
                        hasChanged = true;
                    }
                    if (newTimeLeft === 0 && timers[item.id] > 0) {
                        router.refresh();
                    }
                }
            });

            if (hasChanged) {
                setTimers(newTimers);
            }
        }, 1000);

        return () => clearInterval(intervalId);
    }, [construccionesEnCola, router, timers]);


    if (construccionesEnCola.length === 0) {
        return null;
    }

    return (
        <Card className="mb-4">
            <CardHeader>
                <CardTitle className="text-primary flex items-center gap-2">
                    <Timer className="h-5 w-5" />
                    Cola de Construcción ({propiedad.nombre})
                    <span className='ml-auto text-sm text-muted-foreground'>
                        ({construccionesEnCola.length}/{MAX_CONSTRUCTION_QUEUE_SIZE})
                    </span>
                </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
                {construccionesEnCola.map((colaItem: ColaConstruccion, index: number) => {
                    const roomConfig = allRooms.find(r => r.id === colaItem.habitacionId);
                    const timeLeft = timers[colaItem.id] ?? (colaItem.fechaFinalizacion ? Math.max(0, Math.floor((new Date(colaItem.fechaFinalizacion).getTime() - Date.now()) / 1000)) : colaItem.duracion);
                    
                    const esActiva = index === 0 && colaItem.fechaFinalizacion && new Date(colaItem.fechaFinalizacion) > new Date();
                    const tooltipText = `${roomConfig?.nombre || 'Habitación'} (Nivel ${colaItem.nivelDestino}) ${colaItem.fechaFinalizacion ? ` - Finaliza a las: ${new Date(colaItem.fechaFinalizacion).toLocaleTimeString()}`: ''}`;

                    return (
                        <div key={colaItem.id} className="group flex items-center gap-2 border rounded-full p-1 pr-2 bg-muted/50 hover:bg-muted transition-colors">
                            <TooltipProvider delayDuration={0}>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 relative rounded-full overflow-hidden border-2 border-primary/50 flex-shrink-0">
                                                <Image
                                                    src={roomConfig?.urlImagen || "https://placehold.co/80x56.png"}
                                                    alt={roomConfig?.nombre || 'Habitación'}
                                                    fill
                                                    className="object-cover"
                                                />
                                            </div>
                                            <div className='flex flex-col items-start'>
                                                <span className='text-xs font-semibold leading-tight'>{roomConfig?.nombre} (Nvl {colaItem.nivelDestino})</span>
                                                <div className="flex items-center gap-1 font-mono text-sm font-semibold">
                                                    <Clock className={`h-4 w-4 ${esActiva ? 'text-green-500 animate-pulse' : 'text-amber-500'}`} />
                                                    <span>{formatTime(timeLeft)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>{tooltipText}</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                             <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full opacity-50 group-hover:opacity-100 hover:bg-destructive/20 hover:text-destructive">
                                        <X className="h-4 w-4"/>
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>¿Cancelar Construcción?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            Se te devolverán los recursos invertidos. ¿Estás seguro de que quieres cancelar la construcción de {roomConfig?.nombre} Nivel {colaItem.nivelDestino}?
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>No</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => handleCancel(colaItem.id)} disabled={isPending}>
                                            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                                            Sí, cancelar
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    );
                })}
            </CardContent>
        </Card>
    );
}
