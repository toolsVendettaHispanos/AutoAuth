
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { getSessionUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getEspionageReportById } from "@/lib/data";
import { EspionageDetailView } from "@/components/dashboard/espionage/espionage-detail-view";
import { PageProps } from "@/lib/types";

function EspionageDetailLoading() {
    return (
        <div className="space-y-4 max-w-4xl mx-auto">
            <Skeleton className="h-8 w-64 mb-2 shimmer" />
            <Skeleton className="h-4 w-80 shimmer" />
            <div className="border rounded-lg p-6 space-y-6">
                <div className="flex justify-around items-center">
                    <Skeleton className="h-20 w-20 rounded-full shimmer" />
                    <Skeleton className="h-10 w-16 shimmer" />
                    <Skeleton className="h-20 w-20 rounded-full shimmer" />
                </div>
                <Skeleton className="h-24 w-full shimmer" />
                <Skeleton className="h-48 w-full shimmer" />
            </div>
        </div>
    );
}

export default async function EspionageDetailPage({ params }: PageProps<{ reportId: string }>) {
    const user = await getSessionUser();
    if (!user) {
        redirect('/');
    }

    const report = await getEspionageReportById(params.reportId);
    
    if (!report || (report.attackerId !== user.id && report.defenderId !== user.id)) {
        return (
            <div className="main-view text-center">
                <h2 className="text-3xl font-bold tracking-tight">Informe no encontrado</h2>
                <p className="text-muted-foreground">
                    El informe de espionaje que buscas no existe o no tienes permiso para verlo.
                </p>
            </div>
        );
    }
    
    return (
        <div className="main-view">
            <Suspense fallback={<EspionageDetailLoading />}>
                <EspionageDetailView report={report} />
            </Suspense>
        </div>
    );
}
