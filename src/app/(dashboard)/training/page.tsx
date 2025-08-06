
import { TrainingView } from "@/components/dashboard/training-view"
import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { getSessionUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getTrainingConfigurations } from "@/lib/data"
import { calcularCostosEntrenamiento, calcularTiempoEntrenamiento } from "@/lib/formulas/training-formulas"
import { ID_ESCUELA_ESPECIALIZACION, TRAINING_ORDER } from "@/lib/constants"

function TrainingLoading() {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-64 mb-2 shimmer" />
            <Skeleton className="h-4 w-80 shimmer" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {[...Array(9)].map((_, i) => (
                <Skeleton key={i} className="h-48 w-full shimmer" />
            ))}
        </div>
      </div>
    )
  }

export default async function TrainingPage() {
  const user = await getSessionUser();
  if (!user) {
    redirect('/');
  }

  const allTrainingConfigs = await getTrainingConfigurations();

  // Pre-calculate data on the server
  const userTrainingsMap = new Map(user.entrenamientos.map(t => [t.configuracionEntrenamientoId, t.nivel]));
  const nivelEscuela = user.propiedades.flatMap(p => p.habitaciones).find(h => h.configuracionHabitacionId === ID_ESCUELA_ESPECIALIZACION)?.nivel || 0;
  
  const sortedTrainingsData = TRAINING_ORDER.map(id => {
      const config = allTrainingConfigs.find(c => c.id === id);
      if (!config) return null;

      const userTraining = userTrainingsMap.get(id);
      const nivel = userTraining || 0;
      
      const costosSiguienteNivel = calcularCostosEntrenamiento(nivel + 1, config);
      const tiempoSiguienteNivel = calcularTiempoEntrenamiento(nivel + 1, config, nivelEscuela);
      
      const requisitos = config.requisitos || [];
      const meetsRequirements = requisitos.every(req => (userTrainingsMap.get(req.requiredTrainingId) || 0) >= req.requiredLevel);
      const requirementsText = !meetsRequirements 
        ? requisitos
            .map(req => {
                const reqConfig = allTrainingConfigs.find(c => c.id === req.requiredTrainingId);
                return `${reqConfig?.nombre || req.requiredTrainingId} (Nvl ${req.requiredLevel})`
            })
            .join(', ')
        : null;


      return {
          ...config,
          nivel,
          costos: costosSiguienteNivel,
          tiempo: tiempoSiguienteNivel,
          meetsRequirements,
          requirementsText
      };
  }).filter((t): t is NonNullable<typeof t> => t !== null);


  return (
    <div className="main-view">
      <Suspense fallback={<TrainingLoading />}>
          <TrainingView user={user} trainingsData={sortedTrainingsData} />
      </Suspense>
    </div>
  );
}
