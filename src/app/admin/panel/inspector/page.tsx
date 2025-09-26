
import { getUsers, getUserWithProgressByUsername } from "@/lib/data";
import { UserInspectorView } from "@/components/admin/inspector/user-inspector-view";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { inspectUser } from "@/lib/actions/admin.actions";
import { UserWithProgress } from "@/lib/types";

function InspectorLoading() {
    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-10 w-48" />
            </div>
            <div className="border rounded-lg p-6">
                <Skeleton className="h-40 w-full" />
            </div>
        </div>
    )
}

export default async function InspectorPage({ searchParams }: { searchParams?: { userId?: string }}) {
    const users = await getUsers();
    const selectedUserId = searchParams?.userId;
    
    let userData: UserWithProgress | null = null;
    if (selectedUserId) {
        userData = await inspectUser(selectedUserId);
    }

    return (
        <div>
            <h1 className="text-2xl font-bold mb-4">Inspector de Jugador</h1>
            <Suspense fallback={<InspectorLoading/>}>
                <UserInspectorView users={users} selectedUserId={selectedUserId} initialUserData={userData} />
            </Suspense>
        </div>
    );
}
