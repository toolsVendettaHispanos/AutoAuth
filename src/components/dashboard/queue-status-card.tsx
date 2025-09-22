
'use client';

import type { UserWithProgress, FullPropiedad, ColaConstruccion, FullColaReclutamiento } from '@/lib/types';
import { ConstructionStatus } from './construction-status';
import { RecruitmentStatus } from './recruitment-status';
import { TrainingStatus } from './training-status';
import { Hammer, Users, BrainCircuit } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from '../ui/scroll-area';
import { useProperty } from '@/contexts/property-context';
import { TroopOverview } from './troop-overview';
import { useIsMobile } from '@/hooks/use-mobile';
import { FullColaEntrenamiento } from '@/lib/types';

type QueueCardProps = {
    user: UserWithProgress;
    allRooms: { id: string; nombre: string; }[];
};

const ConstructionQueueView = ({ constructions, allRooms }: { constructions: (ColaConstruccion & { propiedadNombre: string })[], allRooms: { id: string, nombre: string }[] }) => (
    <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-2"><Hammer className="h-5 w-5"/> Construcción</CardTitle>
        </CardHeader>
        <CardContent>
            <ConstructionStatus constructions={constructions} allRooms={allRooms} />
        </CardContent>
    </Card>
);

const RecruitmentQueueView = ({ recruitments }: { recruitments: (FullColaReclutamiento & { propiedadNombre: string })[] }) => (
    <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5"/> Reclutamiento</CardTitle>
        </CardHeader>
        <CardContent>
            <RecruitmentStatus recruitments={recruitments} />
        </CardContent>
    </Card>
);

const TrainingQueueView = ({ trainings }: { trainings: FullColaEntrenamiento[] }) => (
    <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-2"><BrainCircuit className="h-5 w-5"/> Entrenamiento</CardTitle>
        </CardHeader>
        <CardContent>
            <TrainingStatus trainings={trainings} />
        </CardContent>
    </Card>
);


export function QueueStatusCard({ user, allRooms }: QueueCardProps) {
    const { selectedProperty } = useProperty();
    const isMobile = useIsMobile();

    if (!selectedProperty) {
        return (
            <Card className="h-full flex items-center justify-center">
                <p className="text-muted-foreground">Selecciona una propiedad para ver su estado.</p>
            </Card>
        );
    }
    
    const activeConstructionsPerProperty = user.propiedades
        .map((p: FullPropiedad) => {
            const activeConstruction = p.colaConstruccion.find((c: ColaConstruccion) => c.fechaFinalizacion && new Date(c.fechaFinalizacion) > new Date());
            return activeConstruction ? { ...activeConstruction, propiedadNombre: p.nombre } : null;
        })
        .filter((c): c is NonNullable<typeof c> => c !== null);

    const activeRecruitments = user.propiedades
        .filter((p: FullPropiedad) => p.colaReclutamiento)
        .map((p: FullPropiedad) => ({ ...p.colaReclutamiento!, propiedadNombre: p.nombre }));

    if (isMobile) {
        return (
            <div className="space-y-4">
                <TroopOverview troops={selectedProperty.TropaUsuario} />
                <ConstructionQueueView constructions={activeConstructionsPerProperty} allRooms={allRooms} />
                <RecruitmentQueueView recruitments={activeRecruitments} />
                <TrainingQueueView trainings={user.colaEntrenamientos} />
            </div>
        )
    }

    return (
        <div className='grid grid-cols-1 xl:grid-cols-2 gap-6 h-full'>
            <TroopOverview troops={selectedProperty.TropaUsuario} />
            <Card className="h-full">
                <CardHeader>
                    <CardTitle>Colas de Actividad</CardTitle>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="construction" className="w-full">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="construction"><Hammer className="mr-2 h-4 w-4"/>Construcción</TabsTrigger>
                            <TabsTrigger value="recruitment"><Users className="mr-2 h-4 w-4"/>Reclutamiento</TabsTrigger>
                            <TabsTrigger value="training"><BrainCircuit className="mr-2 h-4 w-4"/>Entrenamiento</TabsTrigger>
                        </TabsList>
                        <TabsContent value="construction" className="mt-4">
                            <ScrollArea className="h-32">
                               <ConstructionStatus constructions={activeConstructionsPerProperty} allRooms={allRooms} />
                            </ScrollArea>
                        </TabsContent>
                        <TabsContent value="recruitment" className="mt-4">
                            <ScrollArea className="h-32">
                                <RecruitmentStatus recruitments={activeRecruitments} />
                            </ScrollArea>
                        </TabsContent>
                        <TabsContent value="training" className="mt-4">
                             <ScrollArea className="h-32">
                                <TrainingStatus trainings={user.colaEntrenamientos} />
                            </ScrollArea>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
}

