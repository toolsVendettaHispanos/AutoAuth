
import { getFamilyCardData } from '@/lib/data';
import { FamilyCard } from '@/components/dashboard/overview/family-card';
import { FullFamily } from '@/lib/types';

export async function FamilyCardServer({ userId }: { userId: string }) {
  const family = await getFamilyCardData(userId);
  return <FamilyCard family={family as FullFamily | null} />;
}
