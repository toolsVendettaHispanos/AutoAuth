
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { getFamiliesForRanking, getUsersForRanking, getUsersForHonorRanking, getRecentBattleReports } from "@/lib/data";
import { PlayerRankingsView } from "@/components/dashboard/rankings/player-rankings-view";
import { RankingTypeSelector } from "@/components/dashboard/rankings/ranking-type-selector";
import { FamilyRankingsView } from "@/components/dashboard/rankings/family-rankings-view";
import { getSessionUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { HonorRankingsView } from "@/components/dashboard/rankings/honor-rankings-view";
import { BattlesRankingsView } from "@/components/dashboard/rankings/battles-rankings-view";

function RankingsLoading() {
    return (
        <div className="space-y-4 animate-pulse">
            <div className="flex flex-col sm:flex-row gap-4 justify-between sm:items-center">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-24 w-full" />
            </div>
            <div className="rounded-lg border">
                <div className="w-full h-12 bg-muted/80 rounded-t-lg" />
                <div className="p-4 space-y-2">
                    {[...Array(10)].map((_, i) => (
                        <Skeleton key={i} className="h-10 w-full shimmer" />
                    ))}
                </div>
            </div>
        </div>
    )
}

const PAGE_SIZE = 100;

export default async function RankingsPage({
    searchParams
}: {
    searchParams?: { type?: string, range?: string }
}) {
    const user = await getSessionUser();
    if (!user) {
        redirect('/');
    }

    const rankingType = searchParams?.type || '0';
    const range = parseInt(searchParams?.range || '0', 10);
    const skip = range * PAGE_SIZE;

    const users = rankingType === '0' ? await getUsersForRanking(skip, PAGE_SIZE) : [];
    const families = rankingType === '1' ? await getFamiliesForRanking(skip, PAGE_SIZE) : [];
    const honorUsers = rankingType === '2' ? await getUsersForHonorRanking(skip, PAGE_SIZE) : [];
    const recentBattles = rankingType === '3' ? await getRecentBattleReports() : [];

    return (
        <div className="main-view">
            <div className="flex flex-col sm:flex-row gap-4 justify-between sm:items-center">
              <h2 className="text-3xl font-bold tracking-tight">Clasificaciones</h2>
            </div>
             <div className="mt-4">
                 <RankingTypeSelector />
            </div>
            <Suspense fallback={<RankingsLoading />}>
                {rankingType === '0' && <PlayerRankingsView users={users} currentUserId={user.id} page={range} pageSize={PAGE_SIZE} />}
                {rankingType === '1' && <FamilyRankingsView families={families} currentUserFamilyId={user.familyMember?.familyId} page={range} pageSize={PAGE_SIZE} />}
                {rankingType === '2' && <HonorRankingsView users={honorUsers} currentUserId={user.id} page={range} pageSize={PAGE_SIZE} />}
                {rankingType === '3' && <BattlesRankingsView reports={recentBattles} currentUserId={user.id} />}
            </Suspense>
        </div>
    );
}
