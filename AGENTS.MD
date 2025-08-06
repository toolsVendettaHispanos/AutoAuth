# Manual de Contexto para Agentes de IA: Proyecto "AutoAuth"

## 1. Resumen General del Proyecto

**Nombre del Proyecto:** AutoAuth (nombre interno para un juego de estrategia/simulación tipo mafia).

**Objetivo Principal:** Es un juego de estrategia multijugador basado en web donde los usuarios gestionan un imperio criminal. Los jugadores construyen edificios, reclutan tropas, realizan entrenamientos, gestionan recursos y compiten entre sí a través de misiones de ataque, defensa y espionaje.

**Stack Tecnológico Principal:**
- **Framework:** Next.js (con App Router)
- **Lenguaje:** TypeScript
- **UI:** React, ShadCN UI, Tailwind CSS
- **ORM:** Prisma
- **Autenticación:** Sistema de cookies personalizado (Server Actions).

---

## 2. Conceptos Clave y Terminología del Dominio

- **Usuario (User):** El jugador principal. Tiene un perfil, estadísticas y un imperio.
- **Propiedad (Property):** Representa un edificio o territorio propiedad de un usuario en coordenadas específicas (ciudad, barrio, edificio). Es la unidad central para la gestión de recursos y tropas.
- **Habitaciones (Rooms):** Son las construcciones dentro de una propiedad. Cada una tiene un nivel y propósito específico (ej. producir recursos, desbloquear unidades, etc.).
- **Recursos (Resources):** El juego maneja cuatro recursos principales: `Armas`, `Munición`, `Alcohol`, `Dólares`. Se producen, consumen y almacenan en las propiedades.
- **Tropas (Troops):** Unidades militares que los jugadores pueden reclutar. Se dividen en:
    - **Tropas de Ataque/Móviles:** Usadas para misiones fuera de la propiedad.
    - **Tropas de Seguridad/Defensa:** Permanecen en la propiedad para defenderla.
- **Entrenamientos (Trainings):** Investigaciones o mejoras globales que el usuario puede realizar para potenciar sus tropas, economía u otras estadísticas.
- **Puntuación (Score):** Los jugadores acumulan puntos basados en el nivel de sus edificios, la cantidad de tropas y el nivel de sus entrenamientos. También existe una puntuación de "Honor" ganada en batallas.
- **Misiones (Missions):** Acciones que las tropas realizan fuera de su propiedad de origen, como `ATAQUE`, `ESPIONAJE`, `TRANSPORTE`, etc. Tienen un tiempo de viaje y un coste.
- **Familia (Family):** Un clan o alianza de jugadores. Los miembros pueden colaborar y competir contra otras familias. Tienen roles (Líder, Co-Líder, Miembro).

---

## 3. Arquitectura y Flujos de Usuario Clave

### 3.1. Flujo de Autenticación
- **Entrada:** La aplicación utiliza una autenticación automática en la ruta raíz (`/`).
- **Proceso:**
    1. El componente `src/app/page.tsx` se carga.
    2. Un `useEffect` dispara una función `attemptLogin` que simula una llamada a API con credenciales fijas (`bomberox`/`123456789`).
    3. Mientras espera, se muestra una pantalla de carga.
    4. **Éxito:** Si las credenciales son correctas, el `login` Server Action (`src/lib/actions/auth.actions.ts`) establece una cookie de sesión (`vendetta-session`). El usuario es redirigido a `/overview`.
    5. **Fallo:** Se muestra una notificación de error.
- **Verificación de Sesión:** En las rutas protegidas, la función `getSessionUser` (`src/lib/auth.ts`) lee la cookie para obtener el perfil del usuario.

### 3.2. Estructura del Dashboard
- **Layout Principal (`src/app/(dashboard)/layout.tsx`):**
    - Componente de servidor que verifica la sesión. Si no hay usuario, redirige a `/`.
    - **Actualización de Estado:** Llama a `actualizarEstadoCompletoDelJuego`. Esta función es **CRUCIAL**, ya que procesa el estado del juego que ha cambiado con el tiempo (finaliza construcciones, reclutamientos, misiones, etc.) y actualiza los recursos del usuario.
    - **Contexto de Propiedad:** Envuelve las páginas hijas en un `PropertyProvider` (`src/contexts/property-context.tsx`) para gestionar la propiedad seleccionada por el usuario en la UI.
- **Navegación:** La barra lateral (`src/components/dashboard/sidebar-nav.tsx`) contiene los enlaces a las diferentes secciones del juego.

### 3.3. Gestión de Recursos y Construcción
- **Página de Habitaciones (`/rooms`):**
    - Muestra las habitaciones de la propiedad seleccionada.
    - El usuario puede iniciar la ampliación de una habitación.
    - **Acción:** `iniciarAmpliacion` (`src/lib/actions/room.actions.ts`) verifica recursos, calcula costos/tiempo y añade el trabajo a la `ColaConstruccion` de la propiedad.
- **Barra de Recursos (`src/components/dashboard/resource-bar.tsx`):**
    - Muestra los recursos actuales y la producción por hora de la propiedad seleccionada.
    - La lógica de cálculo se encuentra en `src/lib/formulas/room-formulas.ts`.

### 3.4. Flujo de Misiones y Combate
- **Envío de Misión (`/missions`):**
    - El usuario selecciona coordenadas de destino, tipo de misión y cantidad de tropas.
    - **Acción:** `enviarMision` (`src/lib/actions/mission.actions.ts`) calcula la velocidad de la flota, duración y coste del viaje. Si es viable, crea una `ColaMisiones` y deduce las tropas y recursos.
- **Simulador (`/simulator`):**
    - Permite a los usuarios simular batallas sin consecuencias reales.
    - **Acción:** `runBattleSimulation` (`src/lib/actions/simulation.actions.ts`) contiene toda la lógica de combate, procesando rondas y calculando pérdidas.
- **Procesamiento de Misiones (Backend):**
    - La función `verificarYFinalizarMisiones` (llamada desde el layout) comprueba las misiones que han llegado a su destino.
    - Si es una misión de `ATAQUE`, llama a `handleAttackMission`, que a su vez ejecuta `runBattleSimulation` con los datos reales de atacante y defensor, procesa el resultado, actualiza las bases de datos y genera los informes de batalla.

### 3.5. Sistema de Familias
- **Página de Familia (`/family`):**
    - Si el usuario no tiene familia, puede crear una (`createFamily` action) o buscar existentes.
    - Si tiene familia, ve un dashboard con anuncios, miembros y estadísticas.
- **Gestión:** Los líderes pueden invitar miembros (`inviteUserToFamily`), gestionar solicitudes (`acceptRequest`) y administrar roles.

---

## 4. Directorios y Archivos Importantes

- `src/app/(dashboard)/`: Contiene todas las páginas de la aplicación una vez que el usuario está autenticado.
- `src/lib/actions/`: **Server Actions.** Aquí reside la lógica de negocio que modifica datos (mutaciones). Es el "backend" de la aplicación.
- `src/lib/formulas/`: Contiene la lógica pura de cálculo del juego (costos, tiempos, puntos, etc.). Son funciones deterministas.
- `src/lib/data.ts`: Funciones para acceder a la base de datos (lectura). Usa `cache` de React para optimizar.
- `src/lib/types/`: Definiciones de tipos de TypeScript, cruciales para entender la estructura de los datos.
- `src/components/dashboard/`: Componentes de React reutilizables específicos del panel de control.
- `src/contexts/`: Contiene el `PropertyContext` para gestionar la propiedad activa en la UI.
