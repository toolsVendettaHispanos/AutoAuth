# Prompt para Refactorizar: Componente de Cliente Monolítico

## Objetivo General
Descomponer el componente de cliente monolítico `OverviewView` en componentes más pequeños, especializados y, siempre que sea posible, convertirlos en Server Components para mejorar drásticamente el rendimiento.

## Contexto
Actualmente, `src/components/dashboard/overview-view.tsx` es un componente de cliente que recibe un objeto `user` enorme y es responsable de renderizar toda la página de "Visión General". Esto causa re-renders innecesarios en toda la página ante cualquier cambio mínimo de datos.

### Pasos Detallados:

1.  **Crear Nuevos Componentes de Servidor Especializados:**
    *   Crea una nueva carpeta `src/components/dashboard/overview/`.
    *   Dentro de ella, crea nuevos componentes de servidor (sin la directiva `"use client"`). Cada uno será responsable de una sección de la UI:
        *   `PlayerCardServer({ userId })`: Este componente obtendrá sus propios datos llamando a `getPlayerCardData(userId)` y luego renderizará un componente de UI "tonto" (ej. `PlayerCardUI`) que solo recibe las props y las muestra.
        *   `QueueStatusServer({ propertyId })`: Similar al anterior, obtendrá los datos de las colas con `getQueueStatusData(propertyId)`.
        *   `IncomingAttacksServer({ userId })`: Obtendrá los datos de ataques entrantes.
    *   Estos componentes de servidor deben seguir el patrón de "obtener datos y luego pasar props a un componente de cliente tonto" para la UI.

2.  **Componer la UI en la Página (`src/app/(dashboard)/overview/page.tsx`):**
    *   Modifica la página `overview/page.tsx` para que, en lugar de llamar a `OverviewView`, ahora llame a los nuevos componentes de servidor que creaste.
    *   Obtén el ID de usuario desde `getSessionUser`.
    *   Envuelve cada uno de los nuevos componentes de servidor en un `<Suspense>` de React para permitir la carga en streaming. Esto mejora la experiencia de usuario, mostrando partes de la página a medida que los datos están listos. Por ejemplo:
        ```tsx
        import { Suspense } from 'react';
        import { Skeleton } from '@/components/ui/skeleton';
        import { PlayerCardServer } from '@/components/dashboard/overview/player-card-server';
        // ... otros imports

        export default async function OverviewPage() {
          const user = await getSessionUser();
          if (!user) redirect('/');
          
          return (
            <div className="space-y-4">
              <Suspense fallback={<Skeleton className="h-24" />}>
                <PlayerCardServer userId={user.id} />
              </Suspense>
              {/* ... otros componentes con Suspense ... */}
            </div>
          );
        }
        ```

3.  **Limpiar `OverviewView`:**
    *   El componente `src/components/dashboard/overview-view.tsx` original puede ser eliminado o refactorizado en los nuevos componentes de UI "tontos" que solo reciben props.

## Resultado Esperado
La página de "Visión General" será mucho más performante, ya que la carga de datos y el renderizado se habrán movido al servidor, reduciendo el JavaScript del cliente y aislando los re-renders a componentes individuales.