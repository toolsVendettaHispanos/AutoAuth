
import { getPlayerCardData } from '@/lib/data';
import { PlayerCard } from '@/components/dashboard/overview/player-card';

export async function PlayerCardServer({ userId }: { userId: string }) {
  const data = await getPlayerCardData(userId);
  
  if (!data) return null;

  // We are casting because the data fetched is compatible with UserWithProgress for the card's needs.
  return <PlayerCard user={data as any} />;
}
