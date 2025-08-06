

import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { getSessionUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { OverviewView } from "@/components/dashboard/overview-view";
import { getRoomConfigurations, getTroopConfigurations } from "@/lib/data";
import React from "react";
import { PropertyProvider } from "@/contexts/property-context";

function OverviewLoading() {
    return (
        <div className="flex-grow p-4 md:p-6 space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <Skeleton className="h-24 w-full rounded-lg" />
                <Skeleton className="h-48 lg:h-auto lg:row-span-2 w-full rounded-lg" />
                <Skeleton className="h-48 lg:h-auto lg:row-span-2 w-full rounded-lg" />
                 <div className="lg:col-span-1 space-y-4">
                    <Skeleton className="h-24 w-full rounded-lg" />
                    <Skeleton className="h-24 w-full rounded-lg" />
                 </div>
            </div>
             <Skeleton className="h-[74px] w-full rounded-lg" />
        </div>
    )
}


export default async function OverviewPage() {
    const user = await getSessionUser();
    if (!user) {
        redirect('/');
    }

    // Although these are fetched here, OverviewView still uses the large `user` object.
    // This will be refactored in the next step to use more granular components.
    const [allRooms, allTroops] = await Promise.all([
        getRoomConfigurations(),
        getTroopConfigurations()
    ]);

    const allRoomConfigs = allRooms.map(r => ({ id: r.id, nombre: r.nombre, urlImagen: r.urlImagen }));

    return (
        <div className="main-view h-full">
            <PropertyProvider properties={user.propiedades}>
                <Suspense fallback={<OverviewLoading/>}>
                    <OverviewView 
                        user={user} 
                        allRooms={allRoomConfigs} 
                        allTroops={allTroops} 
                    />
                </Suspense>
            </PropertyProvider>
        </div>
    )
}
