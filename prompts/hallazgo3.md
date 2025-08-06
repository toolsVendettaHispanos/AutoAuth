# Prompt para Refactorizar: Lógica de Negocio en Componente de Cliente

## Objetivo General
Mover la lógica de negocio que actualmente reside en el componente de cliente `OverviewView` al servidor para mejorar el rendimiento, la legibilidad y la experiencia de usuario.

## Contexto
El componente `src/components/dashboard/overview-view.tsx` contiene un `useEffect` que realiza un cálculo asíncrono para determinar el "Poder de Ataque" (`lealtad`). Este cálculo se ejecuta en el cliente y depende de datos que ya están disponibles en el servidor, lo cual es ineficiente.

### Pasos Detallados:

1.  **Mover el Cálculo al Servidor:**
    *   Abre el archivo de la página `src/app/(dashboard)/overview/page.tsx`.
    *   Dentro de este Server Component, realiza el cálculo del poder de ataque directamente.
    *   Importa la función necesaria (`calcularPoderAtaque` desde `src/lib/formulas/score-formulas.ts`).
    *   Obtén los datos necesarios del usuario (nivel de honor, número de propiedades) desde la sesión o a través de una función de datos.
    *   Llama a `calcularPoderAtaque` y guarda el resultado en una variable (ej. `lealtad`).

2.  **Crear o Adaptar un Componente de UI "Tonto":**
    *   Asegúrate de tener un componente de UI (puede ser de cliente) que sea responsable de mostrar las estadísticas, por ejemplo `StatsDisplay`.
    *   Este componente no debe realizar ningún cálculo. Su única responsabilidad es recibir el valor de `lealtad` ya calculado como una prop y mostrarlo.

3.  **Actualizar la Página para Pasar las Props:**
    *   En `src/app/(dashboard)/overview/page.tsx`, renderiza el componente `StatsDisplay` y pásale como prop el valor de `lealtad` que calculaste en el servidor.
    *   Por ejemplo:
        ```tsx
        // src/app/(dashboard)/overview/page.tsx
        export default async function OverviewPage() {
            const user = await getSessionUser();
            if (!user) redirect('/');

            // Realizar el cálculo en el servidor
            const honorLevel = user.entrenamientos.find(t => t.configuracionEntrenamientoId === 'honor')?.nivel || 0;
            const propertyCount = user.propiedades.length;
            const lealtad = Math.round(await calcularPoderAtaque(propertyCount, honorLevel));

            return (
                <div>
                    {/* Pasar el valor ya calculado al componente de UI */}
                    <StatsDisplay user={user} lealtad={lealtad} />
                </div>
            );
        }
        ```

4.  **Eliminar la Lógica del Cliente:**
    *   Elimina el `useEffect` y el `useState` relacionados con `lealtad` del componente `src/components/dashboard/overview-view.tsx` (o del componente de cliente donde residía).

## Resultado Esperado
El cálculo se realizará una sola vez en el servidor. El cliente recibirá HTML ya renderizado, eliminando la necesidad de estado adicional (`useState`), efectos (`useEffect`) y re-renders en el cliente. Esto resultará en una carga más rápida y una mejor experiencia de usuario al evitar el "parpadeo" de datos.