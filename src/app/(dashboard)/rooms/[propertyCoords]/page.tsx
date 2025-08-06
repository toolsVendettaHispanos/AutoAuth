
import { RoomsView } from "@/components/dashboard/rooms-view"
import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { getSessionUser } from "@/lib/auth"
import { getRoomConfigurations } from "@/lib/data"
import { redirect } from "next/navigation"
import { FullPropiedad, PageProps } from "@/lib/types"

function RoomsLoading() {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-64 mb-2 shimmer" />
            <Skeleton className="h-4 w-80 shimmer" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(9)].map((_, i) => (
                <Skeleton key={i} className="h-48 w-full shimmer" />
            ))}
        </div>
      </div>
    )
  }

async function RoomsPageContent({ params }: { params: { propertyCoords: string } }) {
    const user = await getSessionUser();
    if (!user) {
        redirect('/');
    }

    const allRoomConfigs = await getRoomConfigurations();

    if (!user.propiedades || user.propiedades.length === 0) {
        return (
            <div className="main-view">
                <h2 className="text-3xl font-bold tracking-tight">Gestión de Habitaciones</h2>
                <p>No tienes propiedades para gestionar.</p>
            </div>
        )
    }

    const [ciudad, barrio, edificio] = params.propertyCoords.split(':').map(Number);
    const propertyFromCoords = user.propiedades.find((p: FullPropiedad) => p.ciudad === ciudad && p.barrio === barrio && p.edificio === edificio);
    
    return (
        <RoomsView
            user={user}
            allRoomConfigs={allRoomConfigs}
            initialProperty={propertyFromCoords}
        />
    )
}

export default async function RoomsByCoordsPage({ params }: PageProps<{ propertyCoords: string }>) {
  return (
    <div className="main-view">
        <Suspense fallback={<RoomsLoading />}>
            <RoomsPageContent params={params} />
        </Suspense>
    </div>
  )
}
