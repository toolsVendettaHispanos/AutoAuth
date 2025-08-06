
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { MapView } from "@/components/dashboard/map-view";
import { getPropertiesByLocation } from "@/lib/data";
import { getSessionUser } from "@/lib/auth";
import { redirect } from "next/navigation";

function MapLoading() {
    return (
        <div className="space-y-4">
            <div className="flex justify-center items-center gap-4">
                <Skeleton className="h-10 w-48 shimmer" />
                <Skeleton className="h-10 w-48 shimmer" />
            </div>
            <Skeleton className="w-full aspect-square rounded-lg shimmer" />
        </div>
    )
}

export default async function MapPage({
    searchParams
}: {
    searchParams?: {
        ciudad?: string;
        barrio?: string;
    };
}) {
    const user = await getSessionUser();
    if (!user) {
        redirect('/');
    }
    
    // Si no hay params, usamos la ubicación de la primera propiedad del usuario
    const initialCiudad = searchParams?.ciudad ? parseInt(searchParams.ciudad, 10) : user.propiedades?.[0]?.ciudad || 1;
    const initialBarrio = searchParams?.barrio ? parseInt(searchParams.barrio, 10) : user.propiedades?.[0]?.barrio || 1;

    const properties = await getPropertiesByLocation(initialCiudad, initialBarrio);

    return (
        <div className="main-view">
            <h2 className="text-3xl font-bold tracking-tight mb-4 text-center">Mapa de la Ciudad</h2>
            <Suspense fallback={<MapLoading />}>
                <MapView 
                    initialCiudad={initialCiudad} 
                    initialBarrio={initialBarrio} 
                    initialProperties={properties} 
                    currentUser={user}
                />
            </Suspense>
        </div>
    );
}
