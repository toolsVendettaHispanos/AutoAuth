
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { getGlobalViewData } from "@/lib/actions/admin.actions";
import { GlobalView } from "@/components/admin/global-view/global-view";

function GlobalViewLoading() {
    return (
        <div className="space-y-4">
            <Skeleton className="h-8 w-64" />
            <div className="border rounded-lg">
                <Skeleton className="h-96 w-full" />
            </div>
        </div>
    )
}

export default async function GlobalViewPage() {
    const data = await getGlobalViewData();
    
    if (!data) {
        return <p>No autorizado o error al cargar los datos.</p>
    }

    return (
        <div>
            <h1 className="text-2xl font-bold mb-4">Visión Global de Jugadores</h1>
            <Suspense fallback={<GlobalViewLoading />}>
                <GlobalView initialData={data.users} troopConfigs={data.troopConfigs} />
            </Suspense>
        </div>
    );
}
