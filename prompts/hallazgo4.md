# Prompt para Refactorizar: Mutación de Datos en el Flujo de Renderizado

## Objetivo General
Separar la lógica de actualización del estado del juego del flujo de renderizado del layout principal para mejorar la previsibilidad, mantenibilidad y robustez de la aplicación.

## Contexto
El layout principal del dashboard (`src/app/(dashboard)/layout.tsx`) actualmente llama a la Server Action `actualizarEstadoCompletoDelJuego` en cada carga de página. Esta función realiza operaciones de escritura en la base de datos (mutaciones), lo cual es un anti-patrón dentro del ciclo de vida de renderizado de un componente de layout.

### Pasos Detallados:

1.  **Crear un Componente Dedicado para la Actualización:**
    *   Crea un nuevo archivo en `src/components/game-state-updater.tsx`.
    *   Dentro de este archivo, crea un **Server Component** asíncrono llamado `GameStateUpdater`.
    *   Mueve la lógica que llama a `actualizarEstadoCompletoDelJuego` desde el `layout.tsx` a este nuevo componente.
    *   Idealmente, la acción `actualizarEstadoCompletoDelJuego` debería ser modificada para recibir solo el `userId` en lugar del objeto `user` completo, para ser más eficiente.
    *   Este componente **no debe renderizar ningún HTML**, por lo que debe devolver `null`.
    *   Ejemplo de `GameStateUpdater`:
        ```tsx
        import { getSessionUser } from '@/lib/auth';
        import { actualizarEstadoCompletoDelJuego } from '@/lib/actions/user.actions';
        import { User } from '@/lib/types'; // Asume el tipo correcto

        export async function GameStateUpdater() {
          const user = await getSessionUser();
          if (user) {
            // La actualización ocurre aquí, encapsulada.
            await actualizarEstadoCompletoDelJuego(user as User); 
          }
          return null; // No renderiza nada.
        }
        ```

2.  **Integrar el Nuevo Componente en el Layout:**
    *   Modifica el archivo `src/app/(dashboard)/layout.tsx`.
    *   Elimina la llamada directa a `actualizarEstadoCompletoDelJuego`. El layout ahora solo debe leer los datos de la sesión.
    *   Importa el nuevo componente `GameStateUpdater`.
    *   Renderiza `<GameStateUpdater />` dentro del layout, idealmente envuelto en un `<Suspense>`.
    *   Ejemplo de `layout.tsx` modificado:
        ```tsx
        import { getSessionUser } from '@/lib/auth';
        import { redirect } from 'next/navigation';
        import { GameStateUpdater } from '@/components/game-state-updater';
        import { Suspense } from 'react';

        export default async function DashboardLayout({ children }) {
          const user = await getSessionUser(); // Ahora solo lee
          if (!user) redirect('/');

          return (
            <PropertyProvider properties={user.propiedades}>
              <Suspense>
                <GameStateUpdater />
              </Suspense>
              <DashboardClientLayout user={user} ...>
                {children}
              </DashboardClientLayout>
            </PropertyProvider>
          );
        }
        ```

## Resultado Esperado
La lógica de escritura (actualización del estado del juego) estará claramente separada de la lógica de renderizado del layout. Esto hace que la arquitectura sea más limpia, predecible y fácil de mantener. Sigue el principio de que los componentes de renderizado no deben tener efectos secundarios de mutación de forma implícita.