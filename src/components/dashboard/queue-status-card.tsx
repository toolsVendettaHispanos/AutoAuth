
'use client';

import type { UserWithProgress, FullPropiedad, ColaConstruccion, FullConfiguracionTropa } from '@/lib/types';
import { MissionStatus } from './mission-status';
import { ConstructionStatus } from './construction-status';
import { RecruitmentStatus } from './recruitment-status';
import { TrainingStatus } from './training-status';
import { Hammer, Swords, Users, BrainCircuit } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';

type QueueCardProps = {
    user: UserWithProgress;
    allRooms: { id: string; nombre: string; }[];
    allTroops: FullConfiguracionTropa[];
};

export function QueueStatusCard({ user, allRooms, allTroops }: QueueCardProps) {
    
    const activeConstructionsPerProperty = user.propiedades
        .map((p: FullPropiedad) => {
            const activeConstruction = p.colaConstruccion.find((c: ColaConstruccion) => c.fechaFinalizacion && new Date(c.fechaFinalizacion) > new Date());
            return activeConstruction ? { ...activeConstruction, propiedadNombre: p.nombre } : null;
        })
        .filter((c): c is NonNullable<typeof c> => c !== null);

    const propertiesWithActiveConstruction = user.propiedades.filter((p: FullPropiedad) => 
        p.colaConstruccion.some((c: ColaConstruccion) => c.fechaFinalizacion && new Date(c.fechaFinalizacion) > new Date())
    ).length;
    
    const totalProperties = user.propiedades.length;

    const activeRecruitments = user.propiedades
        .filter((p: FullPropiedad) => p.colaReclutamiento)
        .map((p: FullPropiedad) => ({ ...p.colaReclutamiento!, propiedadNombre: p.nombre }));

    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle>Colas de Actividad</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className='p-3 border-l-4 border-blue-500 rounded-r-lg bg-muted/30'>
                    <h4 className='font-semibold flex items-center gap-2 mb-2'><Hammer className='h-5 w-5 text-blue-500' /> Construcción ({propertiesWithActiveConstruction}/{totalProperties})</h4>
                    <ConstructionStatus constructions={activeConstructionsPerProperty} allRooms={allRooms} />
                </div>
                 <div className='p-3 border-l-4 border-green-500 rounded-r-lg bg-muted/30'>
                    <h4 className='font-semibold flex items-center gap-2 mb-2'><Users className='h-5 w-5 text-green-500' /> Reclutamiento ({activeRecruitments.length}/{totalProperties})</h4>
                    <RecruitmentStatus recruitments={activeRecruitments} />
                </div>
                 <div className='p-3 border-l-4 border-amber-500 rounded-r-lg bg-muted/30'>
                    <h4 className='font-semibold flex items-center gap-2 mb-2'><BrainCircuit className='h-5 w-5 text-amber-500' /> Entrenamiento ({user.colaEntrenamientos.length})</h4>
                    <TrainingStatus trainings={user.colaEntrenamientos} />
                </div>
            </CardContent>
        </Card>
    );
}
