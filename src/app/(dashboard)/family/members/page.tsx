
import { Suspense } from "react";
import { getSessionUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getFamilyById } from "@/lib/data";
import { Skeleton } from "@/components/ui/skeleton";
import { FamilyMembersView } from "@/components/dashboard/family/family-members-view";

function MembersLoading() {
    return (
        <div className="space-y-4">
            <Skeleton className="h-10 w-48" />
            <div className="border rounded-md">
                <Skeleton className="h-12 w-full bg-muted/80" />
                <div className="p-4 space-y-3">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                </div>
            </div>
        </div>
    );
}

export default async function FamilyMembersPage({
    searchParams,
}: {
    searchParams: { id?: string };
}) {
    const user = await getSessionUser();
    if (!user) {
        redirect('/');
    }

    const familyId = searchParams.id || user.familyMember?.familyId;
    if (!familyId) {
        redirect('/family');
    }

    const family = await getFamilyById(familyId);

    if (!family) {
        return <p>Familia no encontrada.</p>;
    }

    return (
        <div className="main-view">
            <Suspense fallback={<MembersLoading />}>
                <FamilyMembersView family={family} />
            </Suspense>
        </div>
    );
}
