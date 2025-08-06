import { getSessionUser } from '@/lib/auth';
import { actualizarEstadoCompletoDelJuego } from '@/lib/actions/user.actions';
import type { UserWithProgress } from '@/lib/types';

export async function GameStateUpdater() {
  const user = await getSessionUser();
  if (user) {
    // La actualización ocurre aquí, encapsulada.
    await actualizarEstadoCompletoDelJuego(user as UserWithProgress);
  }
  // Este componente no necesita renderizar nada.
  return null;
}
