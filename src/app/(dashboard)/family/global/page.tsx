
import { Suspense } from "react";
import { getSessionUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getFamilyByIdWithAllMembersData } from "@/lib/data";
import { Skeleton } from "@/components/ui/skeleton";
import { FamilyGlobalView } from "@/components/dashboard/family/family-global-view";
import { FullFamily } from "@/lib/types";

function GlobalViewLoading() {
    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                 <Skeleton className="h-10 w-48" />
                 <Skeleton className="h-10 w-32" />
            </div>
            <div className="border rounded-lg overflow-hidden">
                <Skeleton className="h-96 w-full" />
            </div>
        </div>
    );
}


export default async function FamilyGlobalViewPage() {
    const user = await getSessionUser();
    if (!user || !user.familyMember) {
        redirect('/family');
    }

    const familyWithDetails = await getFamilyByIdWithAllMembersData(user.familyMember.familyId);

    if (!familyWithDetails) {
        return <p>Familia no encontrada.</p>;
    }
    
    return (
        <div className="main-view">
            <Suspense fallback={<GlobalViewLoading />}>
                <FamilyGlobalView family={familyWithDetails as FullFamily} />
            </Suspense>
        </div>
    );
}
