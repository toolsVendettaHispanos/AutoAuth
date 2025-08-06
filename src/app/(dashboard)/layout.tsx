import { getSessionUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { ResourceBar } from '@/components/dashboard/resource-bar';
import { PropertyProvider } from '@/contexts/property-context';
import { DashboardClientLayout } from '@/components/dashboard/dashboard-client-layout';
import { actualizarEstadoCompletoDelJuego } from '@/lib/actions/user.actions';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let user = await getSessionUser();
  if (!user) {
    redirect('/');
  }

  // This function call is heavy and will be addressed in a future refactor.
  user = await actualizarEstadoCompletoDelJuego(user);

  return (
    <PropertyProvider properties={user.propiedades}>
      <DashboardClientLayout
        user={user}
        resourceBar={<ResourceBar user={user} />}
      >
        {children}
      </DashboardClientLayout>
    </PropertyProvider>
  );
}
