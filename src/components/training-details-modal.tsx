
'use client';

import Image from 'next/image';
import { DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose, DialogFooter } from '@/components/ui/dialog';
import { ScrollArea } from '../ui/scroll-area';
import { Button } from '../ui/button';
import type { FullConfiguracionEntrenamiento, UserWithProgress } from '@/lib/types';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';

interface TrainingDetailsModalProps {
  training: FullConfiguracionEntrenamiento & { level: number };
  requirementsText: string | null;
}

export function TrainingDetailsModal({ training, requirementsText }: TrainingDetailsModalProps) {
  return (
    <DialogContent className="max-w-xl w-full p-0 flex flex-col h-full sm:h-auto max-h-screen">
        <DialogHeader className="p-6 pb-4 shrink-0">
            <div className="flex flex-col sm:flex-row items-start gap-4">
                <div className="w-24 h-20 relative rounded-md overflow-hidden border flex-shrink-0">
                    <Image src={training.urlImagen} alt={training.nombre} fill className="object-cover" data-ai-hint="skill icon" />
                </div>
                <div className="flex-grow">
                    <DialogTitle className="text-2xl">{training.nombre}</DialogTitle>
                    <DialogDescription>
                        Nivel actual: <span className="font-bold text-primary">{training.level}</span>
                    </DialogDescription>
                </div>
            </div>
        </DialogHeader>
       
        <ScrollArea className="flex-grow min-h-0 px-6">
            <div className="space-y-4">
                 <div>
                    <h4 className="font-semibold mb-2">Descripción</h4>
                    <p className="text-sm text-muted-foreground">Mejora tus capacidades de {training.nombre.toLowerCase()} para obtener ventajas estratégicas.</p>
                </div>
                <Separator/>
                <div>
                    <h4 className="font-semibold mb-2">Requisitos para el Siguiente Nivel</h4>
                    {requirementsText ? (
                         <div className="flex flex-wrap gap-1">
                            {requirementsText.split(', ').map(req => (
                                <Badge key={req} variant="secondary">{req}</Badge>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground">No hay requisitos para el siguiente nivel.</p>
                    )}
                </div>
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
