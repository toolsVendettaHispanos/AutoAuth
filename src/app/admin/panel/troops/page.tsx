


import { verifyAdminSession } from "@/lib/auth-admin";
import { Button } from "@/components/ui/button";
import { redirect } from "next/navigation";
import { TroopConfigTable } from "@/components/admin/troop-config-table";
import { getTrainingConfigurations, getTroopConfigurations } from "@/lib/data";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { TipoTropa } from "@prisma/client";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

function TableSkeleton() {
    return (
        <div className="space-y-4">
            <Skeleton className="h-10 w-48" />
            <div className="border rounded-md">
                <Skeleton className="h-12 w-full rounded-t-md" />
                <div className="p-4 space-y-3">
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                </div>
            </div>
        </div>
    )
}

export default async function AdminTroopsPage() {
    const isAdmin = await verifyAdminSession();
    if (!isAdmin) {
        redirect('/admin');
    }

    const troops = await getTroopConfigurations();
    const trainings = await getTrainingConfigurations();
    const tiposTropa = Object.values(TipoTropa);

    return (
        <div className="space-y-4">
             <Button asChild variant="outline" size="sm">
                <Link href="/admin/panel">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Volver al Panel Principal
                </Link>
            </Button>
            <Suspense fallback={<TableSkeleton />}>
                <TroopConfigTable 
                    initialData={troops} 
                    allTrainings={trainings}
                    tiposTropa={tiposTropa} 
                />
            </Suspense>
        </div>
    )
}
