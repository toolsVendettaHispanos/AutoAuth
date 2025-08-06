
import { Suspense } from "react";
import { getSessionUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { CreateOrJoinFamilyView } from "@/components/dashboard/family/create-or-join-family-view";
import { FamilyDashboardView } from "@/components/dashboard/family/family-dashboard-view";
import { getFamilyById, getFamilyRequests, getUsers } from "@/lib/data";
import { Skeleton } from "@/components/ui/skeleton";

function FamilyLoading() {
    return (
        <div className="space-y-6">
            <Skeleton className="h-48 w-full" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Skeleton className="h-64 lg:col-span-2 w-full" />
                <Skeleton className="h-48 w-full" />
            </div>
        </div>
    )
}

export default async function FamilyPage() {
    const user = await getSessionUser();
    if (!user) {
        redirect('/');
    }

    if (user.familyMember && user.familyMember.familyId) {
         const [family, allUsers, requests] = await Promise.all([
            getFamilyById(user.familyMember.familyId),
            getUsers(),
            getFamilyRequests(user.familyMember.familyId)
         ]);

        if (family) {
             return (
                <Suspense fallback={<FamilyLoading />}>
                    <FamilyDashboardView 
                        family={family} 
                        currentUser={user} 
                        allUsers={allUsers}
                        pendingRequests={requests.length}
                    />
                </Suspense>
            );
        }
    }

    // If not in a family, show the create/join view
    return (
        <Suspense fallback={<FamilyLoading />}>
            <CreateOrJoinFamilyView />
        </Suspense>
    )
}
