
import { Suspense } from "react";
import { getSessionUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getFamilyById } from "@/lib/data";
import { Skeleton } from "@/components/ui/skeleton";
import { FamilyManagementView } from "@/components/dashboard/family/family-management-view";
import { FamilyRole } from "@prisma/client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

function ManagementLoading() {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <Skeleton className="h-10 w-64" />
                <Skeleton className="h-10 w-32" />
            </div>
            <Skeleton className="h-24 w-full" />
            <Card>
                <CardHeader>
                    <Skeleton className="h-8 w-48" />
                </CardHeader>
                <CardContent>
                     <div className="border rounded-md">
                        <Skeleton className="h-12 w-full bg-muted/80" />
                        <div className="p-4 space-y-3">
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

export default async function FamilyManagementPage() {
    const user = await getSessionUser();
    if (!user || !user.familyMember) {
        redirect('/family');
    }

    const isLeader = user.familyMember.role === FamilyRole.LEADER;
    if (!isLeader) {
        redirect('/family');
    }

    const family = await getFamilyById(user.familyMember.familyId);

    if (!family) {
        redirect('/family');
    }

    return (
        <div className="main-view">
            <Suspense fallback={<ManagementLoading />}>
                <FamilyManagementView family={family} currentUserId={user.id} />
            </Suspense>
        </div>
    );
}
