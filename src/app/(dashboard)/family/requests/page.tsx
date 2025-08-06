
import { Suspense } from "react";
import { getSessionUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getFamilyRequests } from "@/lib/data";
import { Skeleton } from "@/components/ui/skeleton";
import { FamilyRequestsView } from "@/components/dashboard/family/family-requests-view";
import { FamilyRole } from "@prisma/client";

function RequestsLoading() {
    return (
        <div className="space-y-4">
            <Skeleton className="h-10 w-48" />
            <div className="border rounded-md">
                <Skeleton className="h-12 w-full bg-muted/80" />
                <div className="p-4 space-y-3">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                </div>
            </div>
        </div>
    );
}

export default async function FamilyRequestsPage() {
    const user = await getSessionUser();
    if (!user || !user.familyMember) {
        redirect('/family');
    }

    const canManage = user.familyMember.role === FamilyRole.LEADER || user.familyMember.role === FamilyRole.CO_LEADER;
    if (!canManage) {
        redirect('/family');
    }

    const requests = await getFamilyRequests(user.familyMember.familyId);

    return (
        <div className="main-view">
            <Suspense fallback={<RequestsLoading />}>
                <FamilyRequestsView requests={requests} />
            </Suspense>
        </div>
    );
}
