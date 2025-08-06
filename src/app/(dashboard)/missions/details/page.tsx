
import { Suspense } from "react";
import { getSessionUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { MissionDetailsView } from "@/components/dashboard/missions/mission-details-view";
import { getTroopConfigurations } from "@/lib/data";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

function MissionDetailsLoading() {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <Skeleton className="h-8 w-64 mb-2 shimmer" />
                    <Skeleton className="h-4 w-80 shimmer" />
                </div>
            </div>
            <Skeleton className="h-10 w-full" />
            <div className="border rounded-lg p-0">
                <div className="divide-y">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="p-4 flex items-center space-x-4">
                            <div className="space-y-2 flex-1">
                                <Skeleton className="h-4 w-full shimmer" />
                                <Skeleton className="h-4 w-3/4 shimmer" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default async function MissionDetailsPage() {
    const user = await getSessionUser();
    if (!user) {
        redirect('/');
    }

    const troopConfigs = await getTroopConfigurations();

    return (
        <div className="main-view">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Centro de Control de Misiones</h2>
                    <p className="text-muted-foreground">
                        Supervisa todas tus flotas en movimiento.
                    </p>
                </div>
                 <Button asChild variant="outline">
                    <Link href="/missions">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Volver a Enviar Misiones
                    </Link>
                </Button>
            </div>
            <Suspense fallback={<MissionDetailsLoading />}>
                <MissionDetailsView 
                    missions={user.misiones} 
                    incomingAttacks={user.incomingAttacks || []}
                    troopConfigs={troopConfigs}
                />
            </Suspense>
        </div>
    );
}
