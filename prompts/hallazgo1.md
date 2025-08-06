# Prompt para Refactorizar: Obtención de Datos Excesiva

## Objetivo General
Refactorizar el sistema de obtención de datos para eliminar el "over-fetching" y el "prop drilling". Actualmente, una única función `getUserWithProgressById` carga una cantidad masiva de datos que se pasan en cascada desde el layout principal, lo cual es ineficiente.

## Tarea Principal
Quiero que modifiques la estrategia de carga de datos siguiendo un enfoque más granular y eficiente, típico de las arquitecturas modernas de Next.js con Server Components.

### Pasos Detallados:

1.  **Descomponer la Función de Datos:**
    *   Ve al archivo `src/lib/data.ts`.
    *   Crea **nuevas funciones de datos más pequeñas y específicas** en lugar de la monolítica `getUserWithProgressById`. Por ejemplo:
        *   `getPlayerCardData(userId)`: Debe seleccionar solo los campos necesarios para la tarjeta de jugador (`name`, `title`, `avatarUrl`, `puntuacion`, `lastSeen`).
        *   `getQueueStatusData(propertyId)`: Debe seleccionar solo los datos de las colas de construcción y reclutamiento para una propiedad específica.
        *   Crea otras funciones que consideres necesarias para `overview/page.tsx`.
    *   Asegúrate de que estas nuevas funciones utilicen `React.cache` para optimizar las consultas a la base de datos.

2.  **Modificar el Layout Principal (`src/app/(dashboard)/layout.tsx`):**
    *   El layout ya no debe cargar la totalidad de los datos del usuario con `getUserWithProgressById`.
    *   Su responsabilidad principal será obtener el `sessionUser` para la autenticación y pasarlo al `PropertyProvider` y al `DashboardClientLayout` sin el objeto de datos masivo.

3.  **Refactorizar la Página de Visión General (`src/app/(dashboard)/overview/page.tsx`):**
    *   Esta página ahora debe ser la responsable de obtener los datos que necesita utilizando las nuevas funciones granulares creadas en `data.ts`.
    *   Usa `Promise.all` para obtener los datos de diferentes componentes en paralelo.
    *   En lugar de renderizar un único componente monolítico `OverviewView`, esta página debe componer la UI llamando a los nuevos componentes de servidor más pequeños (que crearás en el siguiente hallazgo), pasando solo los datos que cada uno necesita.

## Resultado Esperado
Al final, el `layout.tsx` será más ligero, y la página `overview/page.tsx` orquestará la obtención de datos para sus componentes hijos de una manera mucho más eficiente y performante.