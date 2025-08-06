
import { Suspense } from 'react';
import { getSessionUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { PlayerCardServer } from '@/components/dashboard/overview/player-card-server';
import { FamilyCardServer } from '@/components/dashboard/overview/family-card-server';
import { QueueStatusServer } from '@/components/dashboard/overview/queue-status-server';
import { IncomingAttacksServer } from '@/components/dashboard/overview/incoming-attacks-server';
import { MissionOverviewServer } from '@/components/dashboard/overview/mission-overview-server';

function OverviewLoading() {
  return (
    <div className="flex-grow p-4 md:p-6 space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Skeleton className="h-48 w-full rounded-lg" />
        <Skeleton className="h-48 w-full rounded-lg" />
      </div>
      <Skeleton className="h-[200px] w-full rounded-lg" />
      <Skeleton className="h-[200px] w-full rounded-lg" />
    </div>
  );
}

export default async function OverviewPage() {
  const user = await getSessionUser();
  if (!user) {
    redirect('/');
  }

  // Assuming the first property is the "main" one for overview purposes.
  // This could be made more sophisticated later (e.g., using a context or user setting).
  const primaryPropertyId = user.propiedades[0]?.id;

  return (
    <div className="main-view h-full space-y-4">
      <Suspense fallback={<OverviewLoading />}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Suspense fallback={<Skeleton className="h-48 w-full rounded-lg" />}>
            <PlayerCardServer userId={user.id} />
          </Suspense>
          <Suspense fallback={<Skeleton className="h-48 w-full rounded-lg" />}>
            <FamilyCardServer userId={user.id} />
          </Suspense>
        </div>

        {primaryPropertyId && (
          <Suspense fallback={<Skeleton className="h-48 w-full rounded-lg" />}>
            <QueueStatusServer propertyId={primaryPropertyId} />
          </Suspense>
        )}

        <Suspense fallback={<Skeleton className="h-32 w-full rounded-lg" />}>
          <IncomingAttacksServer userId={user.id} />
        </Suspense>
        
        <Suspense fallback={<Skeleton className="h-64 w-full rounded-lg" />}>
          <MissionOverviewServer userId={user.id} />
        </Suspense>
      </Suspense>
    </div>
  );
}
