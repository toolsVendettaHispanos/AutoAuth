# Guía de Colaboración para Asistentes de IA de Google (Proyecto AutoAuth)

## ¡Bienvenido, Asistente de IA!

Este documento sirve como una guía central para colaborar en el desarrollo del proyecto "AutoAuth". Tu objetivo es ayudar a los desarrolladores a construir, mejorar y mantener la aplicación siguiendo las directrices y la arquitectura establecidas.

## Resumen del Proyecto

-   **Nombre:** AutoAuth
-   **Propósito:** Una aplicación de juego de estrategia y gestión de imperios criminales, con un enfoque en la autenticación automática, gestión de recursos, tropas y familias (clanes).
-   **Stack Tecnológico:**
    -   **Framework:** Next.js con App Router
    -   **Lenguaje:** TypeScript
    -   **UI:** React, ShadCN UI, Tailwind CSS
    -   **Base de Datos:** Prisma con PostgreSQL
    -   **Autenticación:** Sistema de sesión basado en cookies
    -   **IA Generativa:** Genkit (si se implementa)

## Flujo de Trabajo y Colaboración

1.  **Analizar la Solicitud del Usuario:** Lee atentamente la petición del desarrollador. Identifica los archivos afectados y el objetivo principal del cambio (ej. "arreglar un bug", "añadir una nueva función", "mejorar el estilo").
2.  **Consultar el Código Existente:** Antes de proponer cambios, revisa los archivos relevantes proporcionados en el contexto para entender la lógica actual, los tipos de datos y la arquitectura.
3.  **Adherirse a las Directrices:** Es crucial seguir las directrices de codificación establecidas en este documento y en el prompt inicial. Esto incluye:
    -   Uso de componentes de ShadCN.
    -   Estilo de código (TypeScript, Server Components, etc.).
    -   Manejo de errores y estado.
    -   Estructura de la base de datos (schema de Prisma).
4.  **Generar un Plan de Cambios (XML):** Tu respuesta principal para modificaciones de código debe ser siempre un bloque `<changes>`.
    -   **Descripción:** Proporciona un resumen claro y conciso de los cambios que vas a realizar.
    -   **Contenido Completo:** Cada bloque `<change>` debe contener el contenido **completo y final** del archivo. No uses diffs ni fragmentos de código.
    -   **Precisión de Rutas:** Asegúrate de que las rutas de los archivos (`<file>`) sean absolutas y correctas.
5.  **Comunicación Clara:** Explica tus cambios de forma sencilla antes de presentar el bloque XML. Si una solicitud es ambigua, haz preguntas para clarificar los requisitos.

## Directrices de Codificación Clave

### Backend (Server Actions & Lógica de Juego)

-   **Separación de Lógica:** Mantén la lógica de negocio (cálculos de fórmulas, validaciones complejas) en el directorio `src/lib/formulas/` o `src/lib/actions/`.
-   **Interacciones con la Base de Datos:** Centraliza todas las consultas a la base de datos en `src/lib/data.ts` y las mutaciones en `src/lib/actions/`.
-   **Inmutabilidad:** Evita mutar el estado directamente. Utiliza los métodos de Prisma (`increment`, `decrement`) o crea nuevos objetos/arrays cuando sea necesario.
-   **Server Actions:** Utiliza Server Actions de Next.js para todas las mutaciones de datos que se originan desde el cliente. Esto simplifica el código y mejora la seguridad.
-   **Validación:** Valida siempre los datos de entrada en las Server Actions para asegurar la integridad y prevenir errores.

### Frontend (Componentes de React)

-   **Componentes de Servidor por Defecto:** Prefiere los Componentes de Servidor de React (`async function Component()`) para obtener datos y renderizar la UI inicial.
-   **Interactividad con `"use client"`:** Solo añade la directiva `"use client"` a los componentes que necesiten interactividad (hooks como `useState`, `useEffect`, o manejadores de eventos).
-   **Estructura de Componentes:** Divide la UI en componentes pequeños y reutilizables. Sigue la estructura de directorios existente en `src/components/dashboard/`.
-   **Estilos con Tailwind CSS y ShadCN:** Utiliza las clases de utilidad de Tailwind CSS para el estilo. Prefiere los componentes de ShadCN (`Button`, `Card`, `Table`, etc.) sobre la creación de componentes personalizados desde cero.
-   **Responsividad:** Asegúrate de que todos los componentes de la interfaz de usuario sean responsivos y se vean bien tanto en dispositivos móviles como en escritorio.

### Manejo de Estado y Datos

-   **Contexto de React:** Utiliza `React.Context` para gestionar el estado global que es compartido por muchos componentes, como la propiedad seleccionada (`PropertyProvider`).
-   **Obtención de Datos:** En los Componentes de Servidor, obtén los datos directamente llamando a las funciones de `src/lib/data.ts`.
-   **Revalidación de Datos:** Después de una mutación exitosa en una Server Action, utiliza `revalidatePath()` para asegurar que los datos en el cliente se actualicen.

## Consideraciones Adicionales

-   **No Añadir Comentarios al Código:** A menos que sea estrictamente necesario para explicar un algoritmo muy complejo, evita añadir comentarios al código.
-   **Archivo `.aiexclude`:** Respeta las reglas de este archivo. Los archivos y directorios listados en él no deben ser procesados ni incluidos en tus respuestas para optimizar el contexto.
-   **Seguridad:** Nunca expongas claves secretas o información sensible en el lado del cliente. Toda la lógica sensible y las credenciales deben permanecer en el servidor.

¡Gracias por tu colaboración! Siguiendo estas directrices, ayudaremos a construir una aplicación robusta, mantenible y de alta calidad.
