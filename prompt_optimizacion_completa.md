# Prompt para Optimización Integral de UI/UX y Rendimiento Visual

## Título del Proyecto
Optimización y Pulido Visual Completo del Proyecto "AutoAuth"

## Rol
Actúa como un desarrollador frontend senior y experto en UI/UX, especializado en el ecosistema de Next.js, Tailwind CSS y ShadCN. Tu misión es realizar una revisión exhaustiva y una refactorización completa de la interfaz de usuario de toda la aplicación para llevarla a un nivel de calidad de producción.

## Objetivo General
El objetivo es transformar la aplicación de un prototipo funcional a una experiencia de usuario pulida, profesional y visualmente atractiva. Esto implica mejorar la responsividad en todos los dispositivos, implementar animaciones fluidas y significativas, y unificar el diseño para una mayor coherencia y usabilidad.

## Instrucciones Detalladas por Área

### 1. Responsividad Total (Mobile-First)

Quiero que audites y corrijas cada página y componente para asegurar una experiencia impecable en cualquier tamaño de pantalla.

- **Enfoque Mobile-First:** Diseña y ajusta los componentes pensando primero en las pantallas pequeñas y luego escala hacia arriba usando los breakpoints de Tailwind (`sm:`, `md:`, `lg:`, `xl:`).
- **Eliminar Desbordamiento (Overflow):** No debe existir ningún desbordamiento horizontal en ninguna página. Elementos como tablas anchas o cuadrículas complejas deben volverse desplazables horizontalmente en pantallas pequeñas.
- **Legibilidad:** Asegúrate de que los tamaños de fuente, los espacios y los márgenes sean cómodos y legibles en todos los dispositivos. El texto no debe ser demasiado pequeño en móviles ni demasiado grande en escritorios.
- **Componentes Flexibles:** Utiliza Flexbox y CSS Grid de manera efectiva para crear layouts que se adapten naturalmente al espacio disponible. Revisa componentes complejos como `simulator-view.tsx`, `map-view.tsx` y las tablas de `rankings` para garantizar su correcta visualización.

### 2. Animaciones y Transiciones Fluidas

Implementa animaciones sutiles y performantes para mejorar la experiencia del usuario y proporcionar retroalimentación visual.

- **Animaciones de Entrada:**
    - **Carga de Página:** Cada vista principal (las que se renderizan en `main-view`) debe tener una animación `fade-in` o `fade-in-up` para una aparición suave.
    - **Carga de Listas/Cuadrículas:** Al cargar elementos en una lista o cuadrícula (ej. `rooms-view.tsx`, `recruitment-view.tsx`), aplica una animación escalonada (staggered animation), donde cada elemento aparece con un pequeño retraso (`animation-delay`) respecto al anterior.
- **Transiciones de Estado:**
    - **Hover y Focus:** Todos los elementos interactivos (botones, tarjetas, enlaces, inputs) deben tener una transición suave (`transition-all`, `duration-200`, `ease-in-out`) para sus estados de hover y focus. Esto incluye cambios de color, sombras (`box-shadow`) o transformaciones (`scale`, `translate`).
    - **Cambios de Datos:** Cuando un dato numérico cambie (ej. recursos en la `ResourceBar`), implementa un efecto de contador animado para que el número cuente visualmente hasta el nuevo valor.
- **Rendimiento:** Prioriza el uso de `transform` y `opacity` para las animaciones, ya que son más performantes y no provocan "layout shifts".

### 3. Coherencia de Diseño y UX

Unifica la interfaz para que todos los elementos se sientan parte del mismo sistema cohesivo.

- **Espaciado Consistente:** Revisa todos los componentes para asegurar un uso consistente del sistema de espaciado de Tailwind (márgenes `m-`, `mx-`, `my-` y padding `p-`, `px-`, `py-`). Evita valores arbitrarios.
- **Jerarquía Visual:** Refuerza la jerarquía visual. Los títulos (`font-heading`) deben ser claramente más prominentes que los párrafos (`font-sans`). Usa los pesos de fuente (`font-bold`, `font-semibold`, `font-medium`) y los colores de texto (`text-foreground`, `text-muted-foreground`) de manera intencionada para guiar la atención del usuario.
- **Componentes de UI:**
    - **Tarjetas (`Card`):** Asegura que todas las tarjetas tengan un estilo consistente en cuanto a padding, borde y sombra. El efecto `hover` debe ser uniforme en toda la aplicación.
    - **Botones (`Button`):** Verifica que los botones se usen correctamente según su propósito (variantes `default`, `destructive`, `outline`, `ghost`).
    - **Alertas y Notificaciones (`Alert`, `Toast`):** Unifica el estilo de los mensajes de éxito, error e información para que sean inmediatamente reconocibles.
- **Accesibilidad:** Asegúrate de que los estados `focus-visible` sean claros en todos los elementos interactivos y que los contrastes de color cumplan con los estándares mínimos de accesibilidad.

### Formato de Entrega
Aplica todas estas optimizaciones directamente en el código de los archivos `.tsx` y `.css` correspondientes, generando un único bloque `<changes>` que contenga todas las modificaciones.