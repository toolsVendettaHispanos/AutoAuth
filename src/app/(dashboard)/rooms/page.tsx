
import { RoomsView } from "@/components/dashboard/rooms-view"
import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { getSessionUser } from "@/lib/auth"
import { getRoomConfigurations } from "@/lib/data"
import { redirect } from "next/navigation"

function RoomsLoading() {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight font-heading"><Skeleton className="h-8 w-64 mb-2 shimmer" /></h2>
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

export default async function RoomsPage() {
  const user = await getSessionUser();
  if (!user) {
    redirect('/');
  }

  const allRoomConfigs = await getRoomConfigurations();

  return (
    <div className="main-view">
      <Suspense fallback={<RoomsLoading />}>
          <RoomsView user={user} allRoomConfigs={allRoomConfigs} />
      </Suspense>
    </div>
  )
}
