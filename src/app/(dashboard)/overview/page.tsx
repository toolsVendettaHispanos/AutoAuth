
import { Suspense } from 'react';
import { getSessionUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { PlayerCardServer } from '@/components/dashboard/overview/player-card-server';
import { FamilyCardServer } from '@/components/dashboard/overview/family-card-server';
import { QueueStatusServer } from '@/components/dashboard/overview/queue-status-server';
import { IncomingAttacksServer } from '@/components/dashboard/overview/incoming-attacks-server';
import { MissionOverviewServer } from '@/components/dashboard/overview/mission-overview-server';
import { GlobalStatsServer } from '@/components/dashboard/overview/global-stats-server';

function OverviewLoading() {
  return (
    <div className="grid flex-grow grid-cols-1 gap-6 p-4 md:grid-cols-2 md:p-6 lg:grid-cols-3 xl:grid-cols-4">
      <Skeleton className="h-48 w-full rounded-lg" />
      <Skeleton className="h-48 w-full rounded-lg" />
      <Skeleton className="h-48 w-full rounded-lg lg:col-span-2 xl:col-span-2" />
      <Skeleton className="h-64 w-full rounded-lg md:col-span-2 lg:col-span-3 xl:col-span-4" />
      <Skeleton className="h-24 w-full rounded-lg md:col-span-2 lg:col-span-3 xl:col-span-4" />
    </div>
  );
}

export default async function OverviewPage() {
  const user = await getSessionUser();
  if (!user) {
    redirect('/');
  }

  const primaryPropertyId = user.propiedades[0]?.id;

  const components = [
    <div key="player-card" className="lg:col-span-1 xl:col-span-1">
        <Suspense fallback={<Skeleton className="h-full min-h-48 w-full rounded-lg" />}>
            <PlayerCardServer userId={user.id} />
        </Suspense>
    </div>,
    <div key="family-card" className="lg:col-span-1 xl:col-span-1">
        <Suspense fallback={<Skeleton className="h-full min-h-48 w-full rounded-lg" />}>
            <FamilyCardServer userId={user.id} />
        </Suspense>
    </div>,
    primaryPropertyId ? (
        <div key="queue-status" className="lg:col-span-1 xl:col-span-2">
            <Suspense fallback={<Skeleton className="h-full min-h-48 w-full rounded-lg" />}>
                <QueueStatusServer propertyId={primaryPropertyId} />
            </Suspense>
        </div>
    ) : null,
     <div key="incoming-attacks" className="md:col-span-2 lg:col-span-3 xl:col-span-4">
        <Suspense fallback={<Skeleton className="h-32 w-full rounded-lg" />}>
            <IncomingAttacksServer userId={user.id} />
        </Suspense>
    </div>,
    <div key="mission-overview" className="md:col-span-2 lg:col-span-3 xl:col-span-4">
        <Suspense fallback={<Skeleton className="h-64 w-full rounded-lg" />}>
            <MissionOverviewServer userId={user.id} />
        </Suspense>
    </div>,
    <div key="global-stats" className="md:col-span-2 lg:col-span-3 xl:col-span-4">
        <Suspense fallback={<Skeleton className="h-24 w-full rounded-lg" />}>
            <GlobalStatsServer userId={user.id} />
        </Suspense>
    </div>
  ].filter(Boolean);

  return (
    <div className="main-view h-full">
      <Suspense fallback={<OverviewLoading />}>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {components.map((component, index) => (
                 <div key={index} className="animate-fade-in-up" style={{ animationDelay: `${index * 100}ms` }}>
                    {component}
                </div>
            ))}
        </div>
      </Suspense>
    </div>
  );
}
