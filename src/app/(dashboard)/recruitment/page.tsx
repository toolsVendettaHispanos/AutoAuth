
import { RecruitmentView } from "@/components/dashboard/recruitment-view"
import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { getTroopConfigurations } from "@/lib/data"
import { getSessionUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import { calcularStatsTropaConBonus } from "@/lib/formulas/troop-formulas"

function RecruitmentLoading() {
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
                        <Skeleton className="h-10 w-32 rounded-md shimmer" />
                    </div>
                ))}
            </div>
        </div>
      </div>
    )
  }

export default async function RecruitmentPage() {
  const user = await getSessionUser();
  if (!user) {
    redirect('/');
  }

  const troopConfigs = await getTroopConfigurations();

  const troopsWithStats = troopConfigs.map(config => {
      const { ataqueActual, defensaActual, capacidadActual, velocidadActual, salarioActual } = calcularStatsTropaConBonus(config, user.entrenamientos);
      return {
          ...config,
          ataqueActual,
          defensaActual,
          capacidadActual,
          velocidadActual,
          salarioActual,
      }
  })

  return (
    <div className="main-view">
      <Suspense fallback={<RecruitmentLoading />}>
          <RecruitmentView user={user} troopConfigsWithStats={troopsWithStats} />
      </Suspense>
    </div>
  )
}
