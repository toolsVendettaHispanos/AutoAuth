
import { Suspense } from "react";
import { getSessionUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { GlobalVisionView } from "@/components/dashboard/vision/global-view";

function GlobalVisionLoading() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-64" />
                    <Skeleton className="h-4 w-80" />
                </div>
            </div>
            <Skeleton className="h-48 w-full" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-64 w-full" />
            </div>
        </div>
    );
}


export default async function GlobalVisionPage() {
    const user = await getSessionUser();
    if (!user) {
        redirect('/login');
    }

    return (
        <div className="main-view">
            <Suspense fallback={<GlobalVisionLoading />}>
                <GlobalVisionView user={user} />
            </Suspense>
        </div>
    );
}
