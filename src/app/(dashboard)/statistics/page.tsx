
import { getGlobalStatistics, getMaximumResourceCapacity, UserWithProgress } from "@/lib/data";
import { getSessionUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { StatisticsView } from "@/components/dashboard/statistics/statistics-view";

function StatisticsLoading() {
    return (
        <div className="space-y-6">
             <div className="flex items-center justify-between">
                <div>
                    <Skeleton className="h-8 w-64 mb-2 shimmer" />
                    <Skeleton className="h-4 w-80 shimmer" />
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Skeleton className="h-64 w-full shimmer" />
                <Skeleton className="h-64 w-full shimmer" />
                <Skeleton className="h-64 w-full shimmer" />
                <Skeleton className="h-64 w-full shimmer" />
            </div>
        </div>
    )
}

export default async function StatisticsPage() {
    const user = await getSessionUser();
    if (!user) {
        redirect('/');
    }

    const [
        globalStats,
        resourceStats
    ] = await Promise.all([
        getGlobalStatistics(),
        getMaximumResourceCapacity()
    ]);
    
    const { 
        allRoomConfigs, 
        allTrainingConfigs, 
        allTroopConfigs, 
        roomStats, 
        trainingStats, 
        troopStats 
    } = globalStats;
    

    return (
        <div className="main-view">
            <Suspense fallback={<StatisticsLoading />}>
                <StatisticsView 
                    currentUser={user}
                    allRoomConfigs={allRoomConfigs}
                    allTrainingConfigs={allTrainingConfigs}
                    allTroopConfigs={allTroopConfigs}
                    roomStats={roomStats}
                    trainingStats={trainingStats}
                    troopStats={troopStats}
                    resourceStats={resourceStats}
                />
            </Suspense>
        </div>
    );
}
