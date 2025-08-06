
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { getSessionUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { BuildingsView } from "@/components/dashboard/buildings/buildings-view";
import { calcularPuntosPropiedad } from "@/lib/formulas/score-formulas";

function BuildingsLoading() {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <Skeleton className="h-8 w-64 mb-2 shimmer" />
                    <Skeleton className="h-4 w-80 shimmer" />
                </div>
            </div>
            <div className="border rounded-lg p-0">
                <div className="h-12 w-full bg-muted/50 rounded-t-lg" />
                <div className="p-4 space-y-3">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                </div>
            </div>
        </div>
    );
}

export default async function BuildingsPage() {
    const user = await getSessionUser();
    if (!user) {
        redirect('/');
    }

    const propertiesWithPoints = user.propiedades.map(prop => ({
        ...prop,
        puntos: calcularPuntosPropiedad(prop)
    }));
    
    return (
        <div className="main-view">
             <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Gestión de Edificios</h2>
                    <p className="text-muted-foreground">
                        Administra los nombres y la propiedad principal de tu imperio.
                    </p>
                </div>
            </div>
            <Suspense fallback={<BuildingsLoading />}>
                <BuildingsView initialProperties={propertiesWithPoints} />
            </Suspense>
        </div>
    );
}
