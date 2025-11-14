'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/store';
import { authAPI } from '@/lib/api';
import { Toaster } from 'sonner';
import Spinner from './ui/Spinner';
import { ThemeProvider } from './ThemeProvider';

function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user, token, isHydrated, isLoggingOut, clearAuth, setAuth } = useAuthStore();
  const [isValidating, setIsValidating] = useState(true);
  const [hasValidated, setHasValidated] = useState(false);

  // Validar sesión al cargar la app (SOLO UNA VEZ)
  useEffect(() => {
    const validateSession = async () => {
      // Esperar a que el store se hidrate
      if (!isHydrated) return;

      // Si estamos haciendo logout, NO validar nada
      if (isLoggingOut) {
        setIsValidating(false);
        return;
      }

      // Si ya validamos, no hacer nada
      if (hasValidated) return;

      // Marcar como validado inmediatamente para evitar múltiples calls
      setHasValidated(true);

      // Solo validar si estamos en rutas protegidas
      const currentPath = window.location.pathname;
      const publicPaths = ['/login', '/register', '/', '/explore'];
      const isPublicPath = publicPaths.includes(currentPath) ||
                          currentPath.startsWith('/explore') ||
                          currentPath.startsWith('/activity/');

      // Si estamos en ruta pública, no validar
      if (isPublicPath) {
        setIsValidating(false);
        return;
      }

      // Si hay usuario y token, validar con el backend
      if (user && token) {
        try {
          // Intentar refrescar el token automáticamente
          const response = await authAPI.refresh();
          setAuth(response.user, response.access_token);
        } catch (error) {
          // Si falla, limpiar la sesión completamente
          console.error('Error validando sesión:', error);
          clearAuth();
          // Redirigir a landing page si estamos en ruta protegida
          if (!isPublicPath) {
            window.location.href = '/';
          }
        }
      } else if (!isPublicPath) {
        // Si no hay usuario/token y estamos en ruta protegida, redirigir a landing
        window.location.href = '/';
      }

      setIsValidating(false);
    };

    validateSession();
  }, [isHydrated, hasValidated, isLoggingOut]); // Agregado isLoggingOut para detectar logout

  // Cross-tab synchronization
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      // Si el storage cambió en otra pestaña
      if (e.key === 'auth-storage') {
        // Si se limpió en otra pestaña (logout)
        if (!e.newValue || e.newValue === 'null' || e.newValue === '{}') {
          console.log('Sesión cerrada en otra pestaña, sincronizando...');
          clearAuth();
          window.location.href = '/';
        } else if (e.newValue !== e.oldValue) {
          // Sincronizar el estado con la otra pestaña
          try {
            const newState = JSON.parse(e.newValue);
            if (newState.state) {
              const { user: newUser, token: newToken } = newState.state;
              if (newUser && newToken) {
                console.log('Sesión actualizada en otra pestaña, sincronizando...');
                setAuth(newUser, newToken);
              } else {
                clearAuth();
                window.location.href = '/';
              }
            } else {
              clearAuth();
              window.location.href = '/';
            }
          } catch (error) {
            console.error('Error sincronizando estado:', error);
            clearAuth();
            window.location.href = '/';
          }
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [clearAuth, setAuth]);

  // Mostrar loading mientras valida
  if (isValidating) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-primary-50 to-blue-50">
        <div className="text-center">
          <Spinner size="xl" />
          <p className="mt-4 text-gray-600 font-medium">Cargando...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Toaster
            position="top-right"
            richColors
            closeButton
            toastOptions={{
              duration: 4000,
            }}
          />
          {children}
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
