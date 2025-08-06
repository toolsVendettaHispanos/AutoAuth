
import { Suspense } from "react";
import { getSessionUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getFamiliesForRanking, getInvitationsForUser } from "@/lib/data";
import { Skeleton } from "@/components/ui/skeleton";
import { FindFamilyView } from "@/components/dashboard/family/find-family-view";

function FindFamilyLoading() {
    return (
        <div className="space-y-4">
            <Skeleton className="h-10 w-full max-w-md" />
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

export default async function FindFamilyPage() {
    const user = await getSessionUser();
    if (!user) redirect('/');
    if (user.familyMember) redirect('/family'); // Already in a family

    const [families, userInvitations] = await Promise.all([
        getFamiliesForRanking(0, 100), // Fetch first 100 families for example
        getInvitationsForUser(user.id)
    ]);

    return (
        <div className="main-view">
             <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Buscar Familia</h2>
                    <p className="text-muted-foreground">
                       Encuentra una nueva familia a la que unirte o responde a tus invitaciones.
                    </p>
                </div>
            </div>
            <Suspense fallback={<FindFamilyLoading />}>
                <FindFamilyView 
                    families={families} 
                    userInvitations={userInvitations}
                    currentUserId={user.id}
                />
            </Suspense>
        </div>
    );
}
