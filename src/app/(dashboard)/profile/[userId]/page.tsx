
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { getSessionUser } from "@/lib/auth";
import { getUserProfileById, getUserWithProgressByUsername } from "@/lib/data";
import { redirect } from "next/navigation";
import { ProfileView } from "@/components/dashboard/profile/profile-view";
import { PageProps } from "@/lib/types";
import { actualizarEstadoCompletoDelJuego } from "@/lib/actions/user.actions";
import { UserWithProgress } from "@/lib/types";

function ProfileLoading() {
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-6">
                <Skeleton className="h-24 w-24 rounded-full" />
                <div className="space-y-2">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-4 w-32" />
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-48 w-full" />
            </div>
        </div>
    );
}

export default async function ProfilePage({ params }: PageProps<{ userId: string }>) {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
        redirect('/');
    }

    // Actualizar el estado del usuario del perfil que se está visitando
    const userToUpdate = await getUserWithProgressByUsername(params.userId);
    if (userToUpdate) {
        await actualizarEstadoCompletoDelJuego(userToUpdate as UserWithProgress);
    }

    const userProfile = await getUserProfileById(params.userId);

    if (!userProfile) {
        return (
            <div className="main-view">
                <h2 className="text-3xl font-bold tracking-tight">Perfil no encontrado</h2>
                <p>El jugador que buscas no existe o ha sido eliminado.</p>
            </div>
        );
    }
    
    return (
        <div className="main-view">
            <Suspense fallback={<ProfileLoading />}>
                <ProfileView user={userProfile} />
            </Suspense>
        </div>
    );
}
