
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { getSessionUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { PowerAttackView } from "@/components/dashboard/powerattack-view";

function PowerAttackLoading() {
    return (
        <div className="space-y-4">
            <Skeleton className="h-8 w-64 mb-2 shimmer" />
            <Skeleton className="h-4 w-80 shimmer" />
            <Skeleton className="h-24 w-full shimmer" />
            <div className="border rounded-lg p-0">
                <Skeleton className="h-[400px] w-full shimmer" />
            </div>
        </div>
    );
}

export default async function PowerAttackPage() {
    const user = await getSessionUser();
    if (!user) {
        redirect('/');
    }

    return (
        <div className="main-view">
            <Suspense fallback={<PowerAttackLoading />}>
                <PowerAttackView user={user} />
            </Suspense>
        </div>
    );
}
