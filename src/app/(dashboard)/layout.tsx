import { getSessionUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { ResourceBar } from '@/components/dashboard/resource-bar';
import { PropertyProvider } from '@/contexts/property-context';
import { DashboardClientLayout } from '@/components/dashboard/dashboard-client-layout';
import { Suspense } from 'react';
import { GameStateUpdater } from '@/components/game-state-updater';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();
  if (!user) {
    redirect('/');
  }

  return (
    <PropertyProvider properties={user.propiedades}>
       <Suspense>
        <GameStateUpdater />
      </Suspense>
      <DashboardClientLayout
        user={user}
        resourceBar={<ResourceBar user={user} />}
      >
        {children}
      </DashboardClientLayout>
    </PropertyProvider>
  );
}
