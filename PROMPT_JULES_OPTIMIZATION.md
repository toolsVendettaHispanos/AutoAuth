# Prompt para Análisis y Optimización de Código con Jules

## Título del Análisis
Análisis de Optimización y Componentes No Utilizados para el Proyecto "AutoAuth"

## Objetivo General
Generar un informe de análisis detallado sobre el código fuente del proyecto "AutoAuth". El objetivo es doble:
1.  Proporcionar recomendaciones específicas y fundamentadas para optimizar el código existente en términos de rendimiento, legibilidad y buenas prácticas.
2.  Identificar y listar todos los componentes dentro del directorio `src/components` que no están siendo utilizados en ninguna parte de la aplicación.

## Contexto del Proyecto
La aplicación es un juego de estrategia/simulación web (tipo mafia) llamado internamente "AutoAuth". Está construido con Next.js (App Router), React, TypeScript, ShadCN UI y Tailwind CSS. La lógica de negocio principal se encuentra en los Server Actions (`src/lib/actions`), la lógica de cálculo en `src/lib/formulas`, y el acceso a datos en `src/lib/data.ts`.

## Instrucciones Detalladas para el Análisis

### Parte 1: Recomendaciones de Optimización de Código

Analiza el código fuente, prestando especial atención a los directorios `src/app/` y `src/components/`. Para cada recomendación, proporciona:
- **Archivo y Ubicación:** El path completo del archivo y, si es posible, el número de línea o el nombre del componente/función.
- **Descripción del Problema:** Una explicación clara y concisa del problema o área de mejora.
- **Sugerencia de Optimización:** La solución propuesta, incluyendo fragmentos de código del "antes" y el "después" para ilustrar el cambio.
- **Justificación:** El "porqué" de la optimización (ej. "mejora el rendimiento al evitar re-renders", "simplifica la lógica y mejora la legibilidad", "separa responsabilidades siguiendo las mejores prácticas de React", etc.).

#### Áreas de Enfoque para la Optimización:
1.  **Uso de Componentes de Servidor vs. Cliente:**
    - ¿Hay componentes marcados como `"use client"` que podrían ser Componentes de Servidor para reducir el JavaScript enviado al cliente?
    - ¿Se está pasando data de forma innecesaria de componentes de servidor a componentes de cliente, cuando podría ser obtenida directamente en el cliente o a través de un contexto?

2.  **Gestión del Estado y Hooks de React:**
    - **`useState` vs. `useMemo` / `useCallback`:** ¿Hay cálculos costosos o funciones que se recrean en cada render y que podrían ser memorizados?
    - **`useEffect`:** Revisa los `useEffect`. ¿Tienen las dependencias correctas? ¿Se podrían reemplazar por lógica derivada del estado o Server Actions para simplificar?
    - **Estructura del Estado:** ¿Hay estados complejos que podrían gestionarse mejor con `useReducer` o separarse en múltiples `useState`?

3.  **Renderizado y Performance:**
    - **Componentes Grandes:** ¿Existen componentes monolíticos que podrían dividirse en componentes más pequeños y especializados para optimizar los re-renders?
    - **Patrones de Renderizado:** Identifica cualquier patrón que pueda causar renderizados innecesarios en cascada.

4.  **Código Duplicado y Reutilización:**
    - ¿Existen bloques de código o lógica de UI que se repiten en diferentes componentes y que podrían extraerse a un hook personalizado o a un componente reutilizable?

### Parte 2: Identificación de Componentes No Utilizados

Inspecciona el directorio `src/components` y todos sus subdirectorios. Realiza un barrido completo del proyecto para identificar qué componentes (`.tsx`) no están siendo importados ni utilizados en ninguna página (`src/app`), layout o en otro componente.

#### Formato de Salida para Componentes No Utilizados:
Crea una lista clara y directa con el path completo de cada componente no utilizado.

**Ejemplo de formato:**
```
Componentes No Utilizados:
- src/components/ui/unused-button.tsx
- src/components/dashboard/old-chart-wrapper.tsx
- ...
```

---

## Formato de Entrega del Informe Final
El informe debe estar en formato Markdown y estructurado de la siguiente manera:

1.  **Resumen Ejecutivo:** (Opcional) Un breve resumen de los hallazgos más importantes.
2.  **Recomendaciones de Optimización de Código:**
    -   **Recomendación 1:**
        -   **Archivo:** `src/app/(dashboard)/overview/page.tsx`
        -   **Problema:** ...
        -   **Sugerencia:** ...
        -   **Justificación:** ...
    -   **Recomendación 2:**
        -   ...
3.  **Componentes No Utilizados:**
    -   Una lista con viñetas de los paths de los archivos.
```
