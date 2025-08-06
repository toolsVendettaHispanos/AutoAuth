
import { getGlobalStatsData } from '@/lib/data';
import { GlobalStats } from './global-stats';
import { calcularPoderAtaque } from '@/lib/formulas/score-formulas';

export async function GlobalStatsServer({ userId }: { userId: string }) {
  const data = await getGlobalStatsData(userId);
  
  if (!data) return null;

  const honorLevel = data.entrenamientos[0]?.nivel || 0;
  const propertyCount = data._count.propiedades;
  const lealtad = await calcularPoderAtaque(propertyCount, honorLevel);
  
  const stats = {
    puntosEntrenamiento: data.puntuacion?.puntosEntrenamientos || 0,
    puntosEdificios: data.puntuacion?.puntosHabitaciones || 0,
    puntosTropas: data.puntuacion?.puntosTropas || 0,
    puntosTotales: data.puntuacion?.puntosTotales || 0,
    propiedades: propertyCount,
    lealtad: lealtad,
  };

  return <GlobalStats stats={stats} />;
}
