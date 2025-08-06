# Prompt para Análisis Crítico y Propuesta de Mejoras en el Proyecto "AutoAuth"

## Título del Análisis
Análisis Arquitectónico y de Mejoras Críticas para el Proyecto "AutoAuth"

## Rol
Actúa como un arquitecto de software senior y desarrollador principal de React/Next.js. Tu objetivo es realizar una revisión exhaustiva del código fuente del proyecto "AutoAuth" para identificar problemas críticos y proponer mejoras sustanciales que impacten positivamente en el rendimiento, la mantenibilidad, la escalabilidad y la calidad general del código.

## Contexto del Proyecto
La aplicación es un juego de estrategia/simulación web (tipo mafia) llamado internamente "AutoAuth". Está construido con Next.js (App Router), React, TypeScript, ShadCN UI, Tailwind CSS y utiliza Prisma como ORM. La lógica de negocio principal se encuentra en los Server Actions (`src/lib/actions`), la lógica de cálculo en `src/lib/formulas`, y el acceso a datos en `src/lib/data.ts`. El proyecto es complejo, con muchas interdependencias entre datos, componentes y estado.

## Objetivo General
Generar un informe de análisis detallado y accionable. No busco micro-optimaciones, sino cambios estructurales y de patrones de codificación que ofrezcan el mayor beneficio. Para cada hallazgo, el informe debe ser claro, conciso y proporcionar una solución práctica.

## Instrucciones Detalladas para el Análisis

Analiza a fondo el código fuente, prestando especial atención a los directorios `src/app/`, `src/components/`, `src/lib/` y `src/contexts/`. Para cada área de mejora identificada, proporciona:

1.  **Título Descriptivo:** Un título claro que resuma el problema (ej. "Componente Monolítico en `RoomsView` Causa Re-renders Excesivos").
2.  **Archivo(s) y Ubicación:** El path completo de los archivos relevantes y, si es posible, el nombre del componente o función.
3.  **Descripción del Problema Crítico:** Una explicación detallada de por qué la implementación actual es un problema. Contextualiza el impacto (ej. "Cada vez que el usuario cambia de propiedad, el componente `RoomsView` se vuelve a renderizar por completo, incluyendo las tarjetas de las habitaciones que no han cambiado, lo que degrada la performance en la UI.").
4.  **Solución Propuesta y Refactorización:**
    *   Proporciona fragmentos de código del "antes" y el "después" para ilustrar claramente el cambio.
    *   La solución debe ser pragmática y seguir las mejores prácticas modernas de Next.js y React.
5.  **Justificación de la Mejora:** Explica por qué tu solución es superior. Destaca los beneficios clave:
    *   **Mejora de Rendimiento:** (ej. "Al dividir `RoomCard` en un componente separado y usar `React.memo`, evitamos que las tarjetas se vuelvan a renderizar innecesariamente...")
    *   **Mantenibilidad y Legibilidad:** (ej. "Extraer esta lógica a un hook personalizado como `useRoomData` simplifica el componente principal y permite reutilizar la lógica...")
    *   **Escalabilidad:** (ej. "Este nuevo patrón permite añadir más tipos de habitaciones en el futuro sin aumentar la complejidad del componente principal...")

### Áreas de Enfoque Crítico

Quiero que te centres en los siguientes aspectos de alta prioridad:

1.  **Rendimiento de Renderizado y UI:**
    *   **Componentes Monolíticos:** Identifica componentes grandes que manejan demasiada lógica o estado y que podrían dividirse en componentes más pequeños y especializados para optimizar los re-renders (ej. ¿Hay un componente que renderiza una lista y también maneja los modales de cada ítem de la lista?).
    *   **Memoización (`React.memo`, `useMemo`, `useCallback`):** ¿Hay componentes o cálculos costosos que se ejecutan en cada render y que se beneficiarían de ser memoizados? Sé específico sobre qué y por qué.
    *   **Server Components vs. Client Components:** Analiza el uso de `"use client"`. ¿Hay componentes que están marcados como de cliente pero que podrían ser en gran parte de servidor? ¿Se están pasando props innecesariamente desde el servidor al cliente cuando podrían ser obtenidos directamente donde se necesitan?

2.  **Arquitectura y Gestión de Estado:**
    *   **Prop Drilling:** Detecta si hay propiedades que se pasan a través de múltiples niveles de componentes. Sugiere el uso de `Context` o composición de componentes para solucionarlo. Revisa `property-context.tsx` y evalúa si su uso es óptimo o si podría mejorarse.
    *   **Lógica de Negocio en Componentes:** ¿Hay lógica de negocio compleja (cálculos, validaciones extensas) directamente en los componentes de la UI? Propón moverla a `Server Actions` (`/lib/actions`) o a funciones de utilidad en `/lib/formulas`.
    *   **Server Actions:** Revisa los Server Actions. ¿Son demasiado grandes? ¿Podrían dividirse en acciones más pequeñas y específicas? ¿Manejan los errores y las revalidaciones de caché (`revalidatePath`) de forma correcta y eficiente?

3.  **Calidad y Reutilización del Código:**
    *   **Código Duplicado (DRY - Don't Repeat Yourself):** Busca patrones de UI o de lógica que se repiten en diferentes partes de la aplicación. Propón extraerlos a componentes reutilizables o hooks personalizados.
    *   **Complejidad Ciclomática:** Identifica funciones o componentes con una lógica condicional muy compleja (múltiples `if/else`, `switch` anidados) y sugiere formas de simplificarla.

## Formato de Entrega del Informe
El resultado final debe ser un informe en formato Markdown, bien estructurado y fácil de leer.

**Ejemplo de formato de salida:**

```markdown
# Informe de Mejoras Críticas para "AutoAuth"

A continuación se detallan los hallazgos y recomendaciones clave para mejorar el proyecto.

---

### Hallazgo 1: Componente `RoomsView` propenso a re-renders ineficientes

*   **Archivo:** `src/components/dashboard/rooms-view.tsx`
*   **Problema Crítico:** El componente `RoomsView` es responsable de renderizar la lista completa de `RoomCard`. Cuando el estado de una sola tarjeta cambia (ej. al iniciar una construcción), o cuando el usuario cambia de propiedad, el componente entero se vuelve a renderizar, forzando a todas las `RoomCard` a re-evaluarse, incluso si sus props no han cambiado. Esto causa una experiencia de usuario lenta, especialmente en propiedades con muchas habitaciones.
*   **Solución Propuesta:**
    1.  Convertir `RoomCard` en su propio componente que reciba todos los datos necesarios como props.
    2.  Envolver la exportación de `RoomCard` con `React.memo` para evitar re-renders si sus props no cambian.
    3.  Gestionar el estado de "submit" individualmente dentro de cada tarjeta o a través de un ID en el componente padre.

    **Antes (en `RoomsView`):**
    ```tsx
    // ...
    return (
      <div className="grid ...">
        {roomsData.map(room => (
          // ...Toda la lógica de la tarjeta aquí...
        ))}
      </div>
    );
    ```

    **Después (Nuevo componente `room-card.tsx`):**
    ```tsx
    import React from 'react';
    // ... otros imports
    
    function RoomCardComponent({ room, onUpgrade }) {
      // ... lógica de la tarjeta
    }
    
    export const RoomCard = React.memo(RoomCardComponent);
    ```
*   **Justificación:** El uso de `React.memo` en `RoomCard` previene re-renders innecesarios, mejorando drásticamente el rendimiento de la UI. Al aislar la lógica en su propio componente, también mejoramos la legibilidad y la mantenibilidad, haciendo más fácil depurar o añadir funcionalidades a las tarjetas en el futuro.

---

### Hallazgo 2: ...
```