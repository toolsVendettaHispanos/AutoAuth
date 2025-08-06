
import { ResourcesView } from "@/components/dashboard/resources-view"
import { getSessionUser } from "@/lib/auth";
import { Skeleton } from "@/components/ui/skeleton"
import { redirect } from "next/navigation";
import { Suspense } from "react"

function ResourcesLoading() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="h-8 w-64 mb-2 shimmer" />
          <Skeleton className="h-4 w-80 shimmer" />
        </div>
      </div>
       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Skeleton className="h-64 w-full shimmer" />
            <Skeleton className="h-64 w-full shimmer" />
            <Skeleton className="h-64 w-full shimmer" />
            <Skeleton className="h-64 w-full shimmer" />
        </div>
    </div>
  )
}

export default async function ResourcesPage() {
  const user = await getSessionUser();
  if (!user) {
    redirect('/');
  }

  return (
    <div className="main-view">
      <div className="flex items-center justify-between">
        <div>
            <h2 className="text-3xl font-bold tracking-tight">Análisis de Recursos</h2>
            <p className="text-muted-foreground">
                Visualiza la producción y proyección de tus recursos.
            </p>
        </div>
      </div>
      <Suspense fallback={<ResourcesLoading />}>
        <ResourcesView user={user} />
      </Suspense>
    </div>
  )
}
