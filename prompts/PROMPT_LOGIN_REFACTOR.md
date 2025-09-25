# Prompt para Refactorizar el Sistema de Autenticación

## Objetivo General
Quiero que modifiques mi aplicación Next.js para eliminar el flujo de inicio de sesión tradicional (con formulario en `/login`) y lo reemplaces por un sistema de autenticación automático y fijo en la página raíz (`/`).

La idea es que cuando un usuario visite la aplicación, se intente iniciar sesión automáticamente con las credenciales `bomberox` y `123456789`. Mientras esto sucede, se debe mostrar una pantalla de carga. Una vez autenticado, el usuario será redirigido a la página principal del dashboard en `/overview`.

---

## Pasos a Realizar

### 1. Eliminar Rutas Antiguas
- Si existen, elimina los archivos o carpetas correspondientes a las rutas `/login` y la antigua página de inicio (`/`). La nueva página de inicio será el punto de entrada para la autenticación.

### 2. Crear la Nueva Página de Autenticación Automática (`src/app/page.tsx`)
- Este archivo reemplazará la página de inicio anterior.
- **Funcionalidad Principal:**
    - Debe ser un **Componente de Cliente** (`"use client"`).
    - Usa el hook `useEffect` para ejecutar el proceso de autenticación tan pronto como el componente se cargue.
    - Dentro de `useEffect`, llama a una función asíncrona que simule un inicio de sesión.
- **Lógica de Autenticación:**
    - Crea una función `attemptLogin` que acepte un usuario y una contraseña.
    - Esta función debe simular una llamada a una API usando `setTimeout` con un retardo de 1.5 segundos.
    - Dentro del `setTimeout`, comprueba si el usuario es `bomberox` y la contraseña es `123456789`. Devuelve `true` si coinciden.
- **Redirección:**
    - Utiliza el hook `useRouter` de `next/navigation`.
    - Si la autenticación es exitosa (`true`), redirige al usuario a `/overview` usando `router.replace('/overview')`. Es importante usar `replace` para que el usuario no pueda volver a esta página con el botón "atrás" del navegador.
- **Interfaz de Usuario (UI):**
    - Mientras se realiza la autenticación, muestra una pantalla de carga centrada.
    - Utiliza el icono `Loader2` de `lucide-react` con una animación de giro (`animate-spin`).
    - Añade un texto informativo como "Iniciando sesión de forma segura..." para indicar al usuario lo que está sucediendo.

### 3. Asegurar que el Dashboard (`src/app/(dashboard)/overview/page.tsx`) sea el Destino
- Confirma que la página del dashboard en `src/app/(dashboard)/overview/page.tsx` existe y está lista para recibir al usuario después de la autenticación. No es necesario modificar este archivo, solo asegurar que la redirección apunte a él correctamente.

---

### Ejemplo de Código de Referencia para `src/app/page.tsx`

Puedes basarte en esta estructura:

```tsx
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast'; // Opcional, para manejo de errores

// Simula una llamada a API para autenticar
async function attemptLogin(user: string, pass: string): Promise<boolean> {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(user === 'bomberox' && pass === '123456789');
    }, 1500);
  });
}

export default function AutoAuthPage() {
  const router = useRouter();
  const { toast } = useToast(); // Opcional

  useEffect(() => {
    const authenticateAndRedirect = async () => {
      const isAuthenticated = await attemptLogin('bomberox', '123456789');
      if (isAuthenticated) {
        router.replace('/overview');
      } else {
        // Manejo de error opcional
        toast({
          variant: "destructive",
          title: "Fallo de Autenticación",
          description: "Las credenciales fijas son incorrectas.",
        });
      }
    };
    authenticateAndRedirect();
  }, [router, toast]);

  return (
    <main className="flex min-h-screen w-full items-center justify-center">
      <div className="flex flex-col items-center space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <h1 className="text-xl font-semibold">Iniciando sesión...</h1>
        <p className="text-muted-foreground">Por favor, espera.</p>
      </div>
    </main>
  );
}
```
