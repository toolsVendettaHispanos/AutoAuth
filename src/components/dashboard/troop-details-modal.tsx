
'use client';

import Image from 'next/image';
import { DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose, DialogFooter } from '@/components/ui/dialog';
import { ScrollArea } from '../ui/scroll-area';
import { Button } from '../ui/button';
import type { ConfiguracionTropa } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

interface TroopDetailsModalProps {
  troop: ConfiguracionTropa;
  ataqueActual: number;
  defensaActual: number;
  capacidadActual: number;
  velocidadActual: number;
  salarioActual: number;
}

function formatNumber(num: number): string {
    if (num === null || num === undefined) return "0";
    return num.toLocaleString('de-DE');
}

export function TroopDetailsModal({ troop, ataqueActual, defensaActual, capacidadActual, velocidadActual, salarioActual }: TroopDetailsModalProps) {
    const stats = [
        { label: 'Ataque', base: troop.ataque, actual: ataqueActual },
        { label: 'Defensa', base: troop.defensa, actual: defensaActual },
        { label: 'Capacidad', base: troop.capacidad, actual: capacidadActual },
        { label: 'Velocidad', base: Number(troop.velocidad), actual: velocidadActual },
        { label: 'Salario', base: troop.salario, actual: salarioActual },
        { label: 'Puntos', base: troop.puntos, actual: troop.puntos },
    ];
  return (
    <DialogContent className="max-w-3xl w-full p-0 flex flex-col h-full sm:h-auto max-h-screen">
       <div className="grid sm:grid-cols-2 h-full">
         <div className="relative hidden sm:block">
            <Image src={troop.urlImagen} alt={troop.nombre} fill className="object-cover rounded-l-lg" data-ai-hint="mafia character icon" />
             <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
        </div>
        <div className="flex flex-col">
            <DialogHeader className="p-6 pb-4 shrink-0">
                <div className="flex flex-col sm:flex-row items-start gap-4">
                    <div className="w-24 h-20 relative rounded-md overflow-hidden border flex-shrink-0 sm:hidden">
                        <Image src={troop.urlImagen} alt={troop.nombre} fill className="object-contain" data-ai-hint="mafia character icon" />
                    </div>
                    <div className="flex-grow">
                        <DialogTitle className="text-2xl">{troop.nombre}</DialogTitle>
                        <DialogDescription className="text-sm text-muted-foreground mt-2">{troop.descripcion}</DialogDescription>
                    </div>
                </div>
            </DialogHeader>

            <ScrollArea className="flex-grow min-h-0 px-6">
                <h3 className="font-semibold mb-2">Estadísticas de la Tropa</h3>
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                    <Card>
                        <CardHeader className='p-4'>
                            <CardTitle className='text-base'>Estadísticas Base</CardTitle>
                        </CardHeader>
                        <CardContent className='p-4 pt-0 grid grid-cols-2 gap-x-4 gap-y-2 text-sm'>
                            {stats.map(stat => (
                                <div key={`base-${stat.label}`} className='flex justify-between items-baseline'>
                                    <span className='text-muted-foreground'>{stat.label}:</span>
                                    <span className='font-mono font-semibold'>{formatNumber(Number(stat.base))}</span>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                     <Card className='bg-muted/30'>
                        <CardHeader className='p-4'>
                            <CardTitle className='text-base text-primary'>Estadísticas Actuales (con Bonus)</CardTitle>
                        </CardHeader>
                        <CardContent className='p-4 pt-0 grid grid-cols-2 gap-x-4 gap-y-2 text-sm'>
                             {stats.map(stat => (
                                <div key={`actual-${stat.label}`} className='flex justify-between items-baseline'>
                                    <span className='text-muted-foreground'>{stat.label}:</span>
                                    <span className='font-mono font-bold text-primary'>{formatNumber(stat.actual)}</span>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            </ScrollArea>
            <DialogFooter className="p-6 pt-4 border-t shrink-0">
                <DialogClose asChild>
                    <Button type="button" variant="secondary" className="w-full">
                        Cerrar
                    </Button>
                </DialogClose>
            </DialogFooter>
        </div>
       </div>
    </DialogContent>
  );
}
