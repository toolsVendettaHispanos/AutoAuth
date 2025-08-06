
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { getSessionUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ProfileView } from "@/components/dashboard/profile/profile-view";

function ProfileLoading() {
    return (
        <div className="space-y-6">
            <div className="relative h-40 w-full rounded-lg overflow-hidden">
                 <Skeleton className="h-full w-full" />
            </div>
             <div className="flex flex-col items-center sm:flex-row sm:items-end gap-4 -mt-16 sm:-mt-20 z-10 relative px-4">
                 <Skeleton className="h-32 w-32 rounded-full border-4 border-background" />
                 <div className="flex-grow text-center sm:text-left space-y-2">
                     <Skeleton className="h-10 w-48" />
                     <Skeleton className="h-6 w-32" />
                 </div>
                 <div className="text-center sm:text-right space-y-2">
                     <Skeleton className="h-4 w-24" />
                     <Skeleton className="h-10 w-32" />
                 </div>
            </div>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                <Skeleton className="h-64 md:col-span-2 w-full" />
                <Skeleton className="h-64 w-full" />
            </div>
        </div>
    );
}

export default async function ProfilePage() {
    const user = await getSessionUser();
    if (!user) {
        redirect('/login');
    }
    
    // Redirect from the generic /profile to the specific user's profile
    redirect(`/profile/${user.id}`);
}
