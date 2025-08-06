
import { getRoomConfigurations } from '@/lib/data';
import { QueueStatusCard } from '@/components/dashboard/queue-status-card';
import { getSessionUser } from '@/lib/auth';


export async function QueueStatusServer() {
  const user = await getSessionUser(); // We need the full user object for this component for now.
  const allRooms = await getRoomConfigurations();
  
  if (!user) return null;

  return <QueueStatusCard user={user} allRooms={allRooms} />;
}
