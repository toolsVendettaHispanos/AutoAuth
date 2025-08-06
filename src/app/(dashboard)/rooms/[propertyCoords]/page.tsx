
import { RoomsView } from "@/components/dashboard/rooms-view"
import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { getSessionUser } from "@/lib/auth"
import { getRoomConfigurations } from "@/lib/data"
import { redirect } from "next/navigation"
import { PageProps } from "@/lib/types"
import { PropertyProvider } from "@/contexts/property-context"

function RoomsLoading() {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-64 mb-2 shimmer" />
            <Skeleton className="h-4 w-80 shimmer" />
          </div>
        </div>
        <div className="border rounded-lg p-0">
            <div className="divide-y">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="p-4 flex items-center space-x-4">
                        <Skeleton className="h-16 w-20 rounded-md shimmer" />
                        <div className="space-y-2 flex-1">
                            <Skeleton className="h-4 w-3/4 shimmer" />
                            <Skeleton className="h-4 w-1/2 shimmer" />
                        </div>
                        <Skeleton className="h-10 w-24 rounded-md shimmer" />
                    </div>
                ))}
            </div>
        </div>
      </div>
    )
  }

export default async function RoomsByCoordsPage({ params }: PageProps<{ propertyCoords: string }>) {
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
  const propertyFromCoords = user.propiedades.find(p => p.ciudad === ciudad && p.barrio === barrio && p.edificio === edificio);

  return (
    <div className="main-view">
        <PropertyProvider properties={user.propiedades}>
            <Suspense fallback={<RoomsLoading />}>
                <RoomsView 
                    user={user} 
                    allRoomConfigs={allRoomConfigs} 
                    initialProperty={propertyFromCoords}
                />
            </Suspense>
        </PropertyProvider>
    </div>
  )
}
