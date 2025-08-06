
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { getRoomConfigurations, getTrainingConfigurations, getTroopConfigurations, UserWithProgress } from "@/lib/data";
import { TechnologyTreeView } from "@/components/dashboard/technologies/technology-tree-view";
import { getSessionUser } from "@/lib/auth";
import { redirect } from "next/navigation";

function TechnologiesLoading() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <Skeleton className="h-8 w-64 mb-2 shimmer" />
                    <Skeleton className="h-4 w-80 shimmer" />
                </div>
            </div>
             <div className="flex gap-2 mb-4">
                <Skeleton className="h-10 w-32" />
                <Skeleton className="h-10 w-32" />
                <Skeleton className="h-10 w-32" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(9)].map((_, i) => (
                    <Skeleton key={i} className="h-48 w-full shimmer" />
                ))}
            </div>
        </div>
    )
}

export default async function TechnologiesPage() {
    const user = await getSessionUser();
    if (!user) {
        redirect('/');
    }
    
    const [rooms, trainings, troops] = await Promise.all([
        getRoomConfigurations(),
        getTrainingConfigurations(),
        getTroopConfigurations()
    ]);
    
    return (
        <div className="main-view">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Guía de Desbloqueo</h2>
                    <p className="text-muted-foreground">
                        Consulta el árbol tecnológico para planificar tus próximos movimientos.
                    </p>
                </div>
            </div>
            <Suspense fallback={<TechnologiesLoading />}>
                <TechnologyTreeView
                    user={user}
                    rooms={rooms}
                    trainings={trainings}
                    troops={troops}
                />
            </Suspense>
        </div>
    );
}
