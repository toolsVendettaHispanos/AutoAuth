
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
    <div className="grid flex-grow grid-cols-1 gap-6 p-4 md:grid-cols-2 md:p-6 lg:grid-cols-2">
      {/* Columna Izquierda */}
      <div className="space-y-6">
        <Skeleton className="h-48 w-full rounded-lg" />
        <Skeleton className="h-48 w-full rounded-lg" />
      </div>
      {/* Columna Derecha */}
      <div className="space-y-6">
        <Skeleton className="h-48 w-full rounded-lg" />
        <Skeleton className="h-64 w-full rounded-lg" />
      </div>
      {/* Fila Inferior */}
      <div className="md:col-span-2 lg:col-span-2">
        <Skeleton className="h-24 w-full rounded-lg" />
      </div>
    </div>
  );
}

export default async function OverviewPage() {
  const user = await getSessionUser();
  if (!user) {
    redirect('/');
  }

  const primaryPropertyId = user.propiedades[0]?.id;

  return (
    <div className="main-view h-full">
      <Suspense fallback={<OverviewLoading />}>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Columna Izquierda */}
          <div className="space-y-6">
            <div className="animate-fade-in-up" style={{ animationDelay: '0ms' }}>
              <Suspense fallback={<Skeleton className="h-48 w-full rounded-lg" />}>
                <PlayerCardServer userId={user.id} />
              </Suspense>
            </div>
            {primaryPropertyId && (
              <div className="animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                <Suspense fallback={<Skeleton className="h-48 w-full rounded-lg" />}>
                  <QueueStatusServer propertyId={primaryPropertyId} />
                </Suspense>
              </div>
            )}
          </div>

          {/* Columna Derecha */}
          <div className="space-y-6">
             <div className="animate-fade-in-up" style={{ animationDelay: '100ms' }}>
              <Suspense fallback={<Skeleton className="h-48 w-full rounded-lg" />}>
                <FamilyCardServer userId={user.id} />
              </Suspense>
            </div>
             <div className="animate-fade-in-up" style={{ animationDelay: '300ms' }}>
                <Suspense fallback={<Skeleton className="h-64 w-full rounded-lg" />}>
                    <MissionOverviewServer userId={user.id} />
                </Suspense>
            </div>
          </div>
          
           {/* Fila Inferior */}
           <div className="lg:col-span-2 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
                 <Suspense fallback={<Skeleton className="h-24 w-full rounded-lg" />}>
                    <GlobalStatsServer userId={user.id} />
                </Suspense>
           </div>
        </div>
      </Suspense>
    </div>
  );
}
