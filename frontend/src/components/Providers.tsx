'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/store';
import { authAPI } from '@/lib/api';

function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user, token, isHydrated, clearAuth, setAuth } = useAuthStore();
  const [isValidating, setIsValidating] = useState(true);
  const [hasValidated, setHasValidated] = useState(false);

  // Validar sesión al cargar la app (SOLO UNA VEZ)
  useEffect(() => {
    const validateSession = async () => {
      // Esperar a que el store se hidrate
      if (!isHydrated) return;

      // Si ya validamos, no hacer nada
      if (hasValidated) return;

      // Marcar como validado inmediatamente para evitar múltiples calls
      setHasValidated(true);

      // Solo validar si estamos en rutas protegidas
      const currentPath = window.location.pathname;
      const publicPaths = ['/login', '/register', '/'];
      const isPublicPath = publicPaths.includes(currentPath);

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
          // Redirigir a login si estamos en ruta protegida
          if (!isPublicPath) {
            window.location.href = '/login';
          }
        }
      } else if (!isPublicPath) {
        // Si no hay usuario/token y estamos en ruta protegida, redirigir
        window.location.href = '/login';
      }

      setIsValidating(false);
    };

    validateSession();
  }, [isHydrated, hasValidated]); // Removido user, token, setAuth, clearAuth para evitar re-renders

  // Cross-tab synchronization
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      // Si el storage cambió en otra pestaña
      if (e.key === 'auth-storage') {
        // Si se limpió en otra pestaña (logout)
        if (!e.newValue || e.newValue === 'null' || e.newValue === '{}') {
          console.log('Sesión cerrada en otra pestaña, sincronizando...');
          clearAuth();
          window.location.href = '/login';
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
                window.location.href = '/login';
              }
            } else {
              clearAuth();
              window.location.href = '/login';
            }
          } catch (error) {
            console.error('Error sincronizando estado:', error);
            clearAuth();
            window.location.href = '/login';
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>{children}</AuthProvider>
    </QueryClientProvider>
  );
}
