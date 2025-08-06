
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { getSessionUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getEspionageReportsForUser } from "@/lib/data";
import { EspionageListView } from "@/components/dashboard/espionage/espionage-list-view";

function EspionageLoading() {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <Skeleton className="h-8 w-64 mb-2 shimmer" />
                    <Skeleton className="h-4 w-80 shimmer" />
                </div>
            </div>
            <div className="border rounded-lg p-0">
                <div className="divide-y">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="p-4 flex items-center space-x-4">
                            <Skeleton className="h-10 w-10 rounded-full shimmer" />
                            <div className="space-y-2 flex-1">
                                <Skeleton className="h-4 w-3/4 shimmer" />
                                <Skeleton className="h-4 w-1/2 shimmer" />
                            </div>
                            <Skeleton className="h-8 w-24 rounded-md shimmer" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

// Este nuevo componente obtiene los datos y los pasa a EspionageListView
async function EspionageContent() {
    const user = await getSessionUser();
    if (!user) {
        redirect('/');
    }
    const reports = await getEspionageReportsForUser(user.id);
    return <EspionageListView initialReports={reports} currentUserId={user.id} />;
}

export default function EspionagePage() {
    return (
        <div className="main-view">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Informes de Espionaje</h2>
                    <p className="text-muted-foreground">
                        Revisa el historial de tus operaciones de inteligencia.
                    </p>
                </div>
            </div>
            <Suspense fallback={<EspionageLoading />}>
                <EspionageContent />
            </Suspense>
        </div>
    );
}
