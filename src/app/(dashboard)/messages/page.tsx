
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { getSessionUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { MessagesView } from "@/components/dashboard/messages/messages-view";
import { getNotificationFeedForUser, getUsers } from "@/lib/data";

function MessagesLoading() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="col-span-1">
                <Skeleton className="h-12 w-full mb-2" />
                <Skeleton className="h-12 w-full mb-2" />
                <Skeleton className="h-12 w-full mb-2" />
                <Skeleton className="h-12 w-full" />
            </div>
            <div className="md:col-span-3">
                <Skeleton className="h-96 w-full" />
            </div>
        </div>
    )
}


export default async function MessagesPage() {
    const user = await getSessionUser();
    if (!user) {
        redirect('/');
    }

    const [initialFeed, allUsers] = await Promise.all([
        getNotificationFeedForUser(user.id),
        getUsers()
    ]);
    
    return (
        <div className="main-view">
            <Suspense fallback={<MessagesLoading />}>
                <MessagesView 
                    currentUser={user}
                    initialFeed={initialFeed} 
                    allUsers={allUsers}
                />
            </Suspense>
        </div>
    );
}
