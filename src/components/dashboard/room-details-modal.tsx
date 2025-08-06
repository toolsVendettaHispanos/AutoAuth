
'use client';

import Image from 'next/image';
import { DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { calcularCostosNivel, calcularProduccionRecurso } from '@/lib/formulas/room-formulas';
import { X } from 'lucide-react';
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';
import { Button } from '../ui/button';
import type { FullConfiguracionHabitacion } from '@/lib/types';

type RoomWithLevel = FullConfiguracionHabitacion & { nivel: number };

interface RoomDetailsModalProps {
  room: RoomWithLevel;
}

function formatNumber(num: number): string {
    return num.toLocaleString('de-DE');
}

function getBenefitText(roomId: string, level: number): string {
    if (!roomId) return '-';
    
    // Simplificado, en un futuro se puede hacer más dinámico
    if (roomId.includes('almacen') || roomId.includes('deposito') || roomId.includes('caja_fuerte')) {
        return `+${formatNumber(level * 5000)} Capacidad`;
    }
    if (roomId === 'oficina_del_jefe') return `-${level * 2}% Tiempo const.`;
    if (roomId === 'escuela_especializacion') return `-${level * 2}% Tiempo entren.`;
    if (roomId === 'campo_de_entrenamiento') return `-${level * 5}% Tiempo reclut.`;
    if (roomId.includes('seguridad') || roomId.includes('torreta') || roomId.includes('minas')) return `+${level * 5}% Defensa`;

    return 'Beneficio mejorado';
}

function CostList({ costos }: { costos: { armas: number, municion: number, dolares: number }}) {
    return (
        <div className="flex flex-col gap-1 sm:grid sm:grid-cols-3 sm:gap-x-2 text-xs">
            {costos.armas > 0 && <div className="flex items-center gap-1.5" title='Armas'><Image src="/img/recursos/armas.svg" alt="Armas" width={14} height={14} /><span>{formatNumber(costos.armas)}</span></div>}
            {costos.municion > 0 && <div className="flex items-center gap-1.5" title='Munición'><Image src="/img/recursos/municion.svg" alt="Munición" width={14} height={14} /><span>{formatNumber(costos.municion)}</span></div>}
            {costos.dolares > 0 && <div className="flex items-center gap-1.5" title='Dólares'><Image src="/img/recursos/dolares.svg" alt="Dólares" width={14} height={14} /><span>{formatNumber(costos.dolares)}</span></div>}
        </div>
    )
}

export function RoomDetailsModal({ room }: RoomDetailsModalProps) {
  const projectionLevels = Array.from({ length: 5 }, (_, i) => room.nivel + i + 1);

  return (
    <DialogContent className="max-w-3xl w-full p-0 flex flex-col h-full sm:h-auto max-h-screen">
        <DialogHeader className="p-6 pb-4 shrink-0">
            <div className="flex flex-col sm:flex-row items-start gap-4">
            <div className="w-24 h-20 relative rounded-md overflow-hidden border flex-shrink-0">
                <Image src={room.urlImagen} alt={room.nombre} fill className="object-cover" data-ai-hint="game building icon" />
            </div>
            <div>
                <DialogTitle className="text-2xl">{room.nombre}</DialogTitle>
                <DialogDescription>
                Nivel actual: <span className="font-bold text-primary">{room.nivel}</span>
                </DialogDescription>
                <p className="text-sm text-muted-foreground mt-2">{room.descripcion}</p>
            </div>
            </div>
        </DialogHeader>
       
        <ScrollArea className="flex-grow min-h-0 px-6">
            <h3 className="font-semibold mb-2">Proyección de Mejoras</h3>
            
            {/* Vista de tabla para escritorio */}
            <Table className="hidden sm:table">
            <TableHeader>
                <TableRow>
                <TableHead className="w-[80px]">Nivel</TableHead>
                <TableHead>Costos</TableHead>
                <TableHead className="text-right">Producción / Beneficio</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {projectionLevels.map((level) => {
                const costos = calcularCostosNivel(level, room);
                const produccion = room.produccionRecurso 
                    ? calcularProduccionRecurso(room.id, level)
                    : 0;

                return (
                    <TableRow key={level}>
                    <TableCell className="font-medium text-primary">{level}</TableCell>
                    <TableCell>
                        <CostList costos={costos} />
                    </TableCell>
                    <TableCell className="text-right text-green-400 font-mono text-sm">
                        {produccion > 0 
                        ? `+${formatNumber(produccion)}/h`
                        : getBenefitText(room.id, level)
                        }
                    </TableCell>
                    </TableRow>
                );
                })}
            </TableBody>
            </Table>

            {/* Vista de lista/tarjetas para móvil */}
            <div className="sm:hidden space-y-4">
                {projectionLevels.map((level) => {
                    const costos = calcularCostosNivel(level, room);
                    const produccion = room.produccionRecurso
                        ? calcularProduccionRecurso(room.id, level)
                        : 0;
                    
                    return (
                        <div key={level} className="p-3 border rounded-lg">
                            <div className="flex justify-between items-center mb-2">
                                <span className="font-bold text-primary">Nivel {level}</span>
                                <span className="text-sm text-green-400 font-mono">
                                    {produccion > 0 
                                      ? `+${formatNumber(produccion)}/h`
                                      : getBenefitText(room.id, level)
                                    }
                                </span>
                            </div>
                             <Separator className="my-2" />
                            <div className="text-xs text-muted-foreground mb-1">Costos:</div>
                            <CostList costos={costos} />
                        </div>
                    )
                })}
            </div>
        </ScrollArea>
        <DialogFooter className="p-6 pt-4 border-t shrink-0">
             <DialogClose asChild>
                <Button type="button" variant="secondary" className="w-full">
                    Cerrar
                </Button>
            </DialogClose>
        </DialogFooter>
    </DialogContent>
  );
}