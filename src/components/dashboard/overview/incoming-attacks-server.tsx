
import { getIncomingAttacksData } from '@/lib/data';
import { IncomingAttacks } from '@/components/dashboard/incoming-attacks';

export async function IncomingAttacksServer({ userId }: { userId: string }) {
  const attacks = await getIncomingAttacksData(userId);
  return <IncomingAttacks attacks={attacks} />;
}
