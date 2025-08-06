
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

async function MapPageContent({ searchParams }: { searchParams?: { ciudad?: string; barrio?: string; }}) {
    const user = await getSessionUser();
    if (!user) {
        redirect('/');
    }
    
    const initialCiudad = searchParams?.ciudad ? parseInt(searchParams.ciudad, 10) : user.propiedades?.[0]?.ciudad || 1;
    const initialBarrio = searchParams?.barrio ? parseInt(searchParams.barrio, 10) : user.propiedades?.[0]?.barrio || 1;

    const properties = await getPropertiesByLocation(initialCiudad, initialBarrio);

    return (
        <MapView 
            initialCiudad={initialCiudad} 
            initialBarrio={initialBarrio} 
            initialProperties={properties} 
            currentUser={user}
        />
    )
}


export default function MapPage({
    searchParams
}: {
    searchParams?: {
        ciudad?: string;
        barrio?: string;
    };
}) {
    return (
        <div className="main-view">
            <h2 className="text-3xl font-bold tracking-tight mb-4 text-center">Mapa de la Ciudad</h2>
            <Suspense fallback={<MapLoading />}>
                <MapPageContent searchParams={searchParams} />
            </Suspense>
        </div>
    );
}
