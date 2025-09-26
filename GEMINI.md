# 🚀 Guía de Inicio Rápido del Proyecto: AutoAuth

¡Bienvenido a AutoAuth! Esta guía está diseñada para ayudarte a entender la estructura, las tecnologías y los procesos clave del proyecto de manera rápida y eficiente.

## 1. 🏗️ Pila Tecnológica (Tech Stack)

Este proyecto está construido con un conjunto de tecnologías modernas y robustas:

-   **Framework Principal:** [Next.js](https://nextjs.org/) (usando App Router)
-   **Lenguaje:** [TypeScript](https://www.typescriptlang.org/)
-   **UI Framework:** [React](https://reactjs.org/)
-   **Estilos CSS:** [Tailwind CSS](https://tailwindcss.com/)
-   **Componentes UI:** [ShadCN/UI](https://ui.shadcn.com/) - Una colección de componentes reutilizables construidos sobre Radix UI y Tailwind CSS.
-   **ORM y Base de Datos:** [Prisma](https://www.prisma.io/) - ORM de próxima generación para Node.js y TypeScript.
-   **Inteligencia Artificial:** [Genkit (Firebase)](https://firebase.google.com/docs/genkit) - Un framework para construir flujos de IA.
-   **Iconos:** [Lucide React](https://lucide.dev/)
-   **Gráficas y Diagramas:** [Recharts](https://recharts.org/)
-   **Autenticación:** Solución personalizada (ver `src/lib/auth.ts` y `src/lib/actions/auth.actions.ts`).

## 2. 📂 Estructura del Proyecto

La organización del código está pensada para ser escalable y mantenible.

-   `prisma/`: Contiene el esquema de la base de datos (`schema.prisma`) y scripts para gestionar los datos (migraciones, seeding, etc.).
    -   `script/`: Scripts para realizar operaciones CRUD sobre la base de datos, como `subir.ts` y `bajar.ts`.
-   `src/app/`: El corazón de la aplicación, siguiendo la convención de Next.js App Router.
    -   `layout.tsx`: El layout raíz que envuelve toda la aplicación.
    -   `globals.css`: Estilos globales y configuración de Tailwind CSS.
    -   `(dashboard)/`: Un [grupo de rutas](https://nextjs.org/docs/app/building-your-application/routing/route-groups) que contiene todas las páginas protegidas de la aplicación.
        -   `layout.tsx`: El layout específico para el panel de control, que incluye la barra lateral y la barra de recursos.
        -   `overview/page.tsx`: La página principal o "Visión General" después de iniciar sesión.
        -   `[ruta]/page.tsx`: Cada subcarpeta representa una ruta de la aplicación (ej: `/rooms`, `/missions`, `/family`, etc.).
    -   `page.tsx` y `login/page.tsx`: Las páginas de inicio y de login.
    -   `api/`: Rutas de API para funcionalidades del backend.
-   `src/components/`: Componentes de React reutilizables.
    -   `ui/`: Componentes base generados por ShadCN (Button, Card, Input, etc.).
    -   `dashboard/`: Componentes específicos para las diferentes secciones del panel de control.
    -   `admin/`: Componentes para el panel de administración.
-   `src/lib/`: Lógica central, acciones de servidor y utilidades.
    -   `actions/`: [Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations) de Next.js para interactuar con el servidor (ej: crear familia, enviar misión).
    -   `auth.ts`: Lógica para gestionar la sesión del usuario.
    -   `constants.ts`: Constantes globales utilizadas en toda la aplicación.
    -   `data.ts`: Funciones para acceder a la base de datos utilizando Prisma.
    -   `formulas/`: Lógica de negocio y cálculos del juego (puntos, costos, tiempos, etc.).
    -   `types/`: Definiciones de tipos y interfaces de TypeScript.
    -   `utils.ts`: Funciones de utilidad reutilizables.
-   `src/ai/`: Contiene la configuración y los flujos de Genkit para las funcionalidades de IA.
-   `public/`: Archivos estáticos como imágenes y fuentes.

## 3. ⚙️ Scripts Esenciales

Puedes ejecutar los siguientes comandos desde la raíz del proyecto:

-   `npm run dev`: Inicia el servidor de desarrollo en modo de recarga rápida.
-   `npm run build`: Compila la aplicación para producción.
-   `npm run start`: Inicia un servidor de producción (requiere una compilación previa con `npm run build`).
-   `npm run lint`: Ejecuta ESLint para analizar el código en busca de problemas.
-   `npm run prisma:generate`: Genera el cliente de Prisma basado en tu `schema.prisma`.
-   `npm run prisma:migrate`: Aplica las migraciones de la base de datos.
-   `npm run prisma:studio`: Abre la interfaz de Prisma Studio para visualizar y editar los datos de tu base de datos.

## 4. 🔑 Variables de Entorno

El proyecto requiere un archivo `.env.local` en la raíz para almacenar las variables de entorno. Este archivo **no debe ser versionado** en Git.

Crea un archivo `.env.local` y añade las siguientes variables, basándote en el archivo `.env.example` si existe:

```env
DATABASE_URL="postgresql://..."
ADMIN_PASSWORD="tu_contraseña_de_admin"
# Otras variables que puedan ser necesarias
```
