
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { getSessionUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { SettingsView } from "@/components/dashboard/settings-view";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";

function SettingsLoading() {
    return (
        <div className="space-y-6">
            <Skeleton className="h-8 w-48 mb-4" />
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-1/3" />
                    <Skeleton className="h-4 w-2/3" />
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-20" />
                                <Skeleton className="h-10 w-full" />
                            </div>
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-20" />
                                <Skeleton className="h-10 w-full" />
                            </div>
                        </div>
                         <div className="space-y-4">
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-20" />
                                <Skeleton className="h-10 w-full" />
                            </div>
                            <div className="flex justify-center pt-2">
                                <Skeleton className="h-24 w-24 rounded-full" />
                            </div>
                        </div>
                    </div>
                </CardContent>
                <CardFooter>
                    <Skeleton className="h-10 w-32" />
                </CardFooter>
            </Card>
        </div>
    )
}


export default async function SettingsPage() {
    const user = await getSessionUser();
    if (!user) {
        redirect('/');
    }

    return (
        <div className="main-view">
            <Suspense fallback={<SettingsLoading />}>
                <SettingsView user={user} />
            </Suspense>
        </div>
    );
}
