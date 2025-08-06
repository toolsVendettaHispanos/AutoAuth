# Prompt para Diagnóstico y Solución de Errores de Hidratación en Next.js

## Título del Análisis
Análisis y Corrección de Errores de Hidratación en la Aplicación "AutoAuth"

## Objetivo General
Quiero que analices a fondo mi aplicación Next.js para identificar y solucionar las causas de los errores de hidratación. El objetivo principal es asegurar que el HTML renderizado por el servidor sea idéntico al renderizado inicial en el cliente, eliminando las advertencias y posibles problemas de UI.

## Contexto del Problema
Estoy recibiendo el siguiente error de Next.js, que indica un fallo de hidratación:
`Runtime Error: Hydration failed because the server rendered HTML didn't match the client.`

El error apunta específicamente al componente `src/components/dashboard/overview-view.tsx`, pero quiero que realices un análisis general del proyecto, ya que podrían existir otros casos similares.

## Instrucciones Detalladas para el Análisis y la Solución

Revisa todo el código fuente, prestando especial atención a los componentes de cliente (`"use client"`) en los directorios `src/app/` y `src/components/`. Para cada problema que encuentres, por favor, proporciona:

1.  **Archivo y Ubicación:** El path completo del archivo y el nombre del componente o función afectada.
2.  **Descripción del Problema:** Una explicación clara de por qué se está produciendo el error de hidratación. Identifica si la causa es:
    *   Uso de APIs específicas del navegador (ej. `window`, `localStorage`, `navigator`).
    *   Uso de valores inconsistentes entre servidor y cliente (ej. `new Date()`, `Math.random()`).
    *   Anidación de HTML inválida (ej. un `<p>` dentro de otro `<p>`).
    *   Renderizado condicional que depende de estado que solo existe en el cliente.
3.  **Solución Propuesta (con Código):** Proporciona el fragmento de código corregido. La solución debe seguir las mejores prácticas de Next.js:
    *   **Para APIs del Navegador o Valores Dinámicos:** Mueve la lógica a un hook `useEffect` con un array de dependencias vacío (`[]`) para asegurar que solo se ejecute en el cliente después del montaje inicial. Considera mostrar un estado de carga o un esqueleto (skeleton) mientras el valor se calcula en el cliente.
    *   **Para Renderizado Condicional:** Si un componente o parte de él no debe renderizarse en el servidor, utiliza `next/dynamic` con la opción `ssr: false`.
    *   **Para Anidación de HTML:** Corrige la estructura del JSX para que sea semánticamente válida.
4.  **Justificación:** Explica brevemente por qué la solución propuesta resuelve el error de hidratación y mejora la aplicación.

### Áreas de Enfoque
*   **Componentes de Cliente (`"use client"`):** Son los candidatos más probables a causar estos errores.
*   **Hooks `useState` y `useEffect`:** Revisa cómo se inicializa el estado y qué efectos secundarios se ejecutan. Un estado inicial que depende de una API del navegador es una causa común.
*   **Bibliotecas de Terceros:** Algunas bibliotecas de visualización o gráficos pueden intentar acceder al objeto `window` al inicializarse. Estas a menudo necesitan ser importadas dinámicamente con `ssr: false`.

### Ejemplo de Salida Deseada

#### Hallazgo 1: Uso de `useState` con API del navegador

*   **Archivo:** `src/components/example-component.tsx`
*   **Problema:** El estado `isMobile` se inicializa directamente con `window.innerWidth`, que no existe en el servidor. Esto causa que el renderizado del servidor y el cliente no coincidan.
*   **Solución Propuesta:**
    ```diff
    - const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    + const [isMobile, setIsMobile] = useState(false);
    +
    + useEffect(() => {
    +   const checkMobile = () => setIsMobile(window.innerWidth < 768);
    +   checkMobile();
    +   window.addEventListener('resize', checkMobile);
    +   return () => window.removeEventListener('resize', checkMobile);
    + }, []);
    ```
*   **Justificación:** Al mover la lógica que accede a `window.innerWidth` dentro de un `useEffect`, nos aseguramos de que solo se ejecute en el cliente. El estado se inicializa con un valor por defecto (`false`) que es consistente en ambos entornos, evitando el error de hidratación.
