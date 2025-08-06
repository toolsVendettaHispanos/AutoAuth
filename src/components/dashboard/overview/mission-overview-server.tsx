
import { getMissionsData, getIncomingAttacksData, getTroopConfigurations } from '@/lib/data';
import { MissionOverview } from '@/components/dashboard/overview/mission-overview';

export async function MissionOverviewServer({ userId }: { userId: string }) {
  const [missions, incomingAttacks, allTroops] = await Promise.all([
    getMissionsData(userId),
    getIncomingAttacksData(userId),
    getTroopConfigurations()
  ]);
  
  return <MissionOverview missions={missions} incomingAttacks={incomingAttacks} allTroops={allTroops} />;
}
