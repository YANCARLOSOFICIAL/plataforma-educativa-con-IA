'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { authAPI } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import type { LoginCredentials } from '@/types';
import Link from 'next/link';
import { Button, Input, Card } from '@/components/ui';
import { toast } from 'sonner';
import { BookOpen, Sparkles } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginCredentials>();

  const onSubmit = async (data: LoginCredentials) => {
    try {
      setLoading(true);
      setError('');
      const response = await authAPI.login(data);
      setAuth(response.user, response.access_token);
      toast.success(`¡Bienvenido, ${response.user.full_name || response.user.username}!`);
      router.push('/dashboard');
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || 'Error al iniciar sesión';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center mesh-bg px-4 py-12 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary-400/30 rounded-full filter blur-3xl animate-float" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-400/30 rounded-full filter blur-3xl animate-float" style={{ animationDelay: '2s' }} />

      <div className="max-w-md w-full relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-primary-600 via-blue-600 to-purple-600 text-white rounded-3xl mb-6 shadow-2xl animate-float">
            <BookOpen className="w-12 h-12" />
          </div>
          <h2 className="text-5xl font-extrabold bg-gradient-to-r from-primary-600 via-blue-600 to-purple-600 bg-clip-text text-transparent mb-3 dark:from-primary-400 dark:via-blue-400 dark:to-purple-400">
            Iniciar Sesión
          </h2>
          <p className="text-gray-700 dark:text-gray-300 flex items-center justify-center gap-2 text-lg font-medium">
            <Sparkles className="w-5 h-5 text-primary-500" />
            Plataforma Educativa con IA
          </p>
        </div>

        <Card variant="glass" padding="lg" className="shadow-2xl">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {error && (
              <div className="bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg">
                <p className="font-semibold text-sm">Error de autenticación</p>
                <p className="text-sm">{error}</p>
              </div>
            )}

            <Input
              {...register('email', {
                required: 'El email es requerido',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Email inválido',
                },
              })}
              type="email"
              label="Correo Electrónico"
              placeholder="ejemplo@email.com"
              error={errors.email?.message}
              fullWidth
              required
              autoFocus
            />

            <div>
              <Input
                {...register('password', { required: 'La contraseña es requerida' })}
                type="password"
                label="Contraseña"
                placeholder="Ingresa tu contraseña"
                error={errors.password?.message}
                fullWidth
                required
              />
              <div className="text-right mt-2">
                <Link
                  href="/forgot-password"
                  className="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-semibold hover:underline transition-colors"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              isLoading={loading}
            >
              {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </Button>

            <div className="text-center pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                ¿No tienes cuenta?{' '}
                <Link href="/register" className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-semibold hover:underline transition-colors">
                  Regístrate aquí
                </Link>
              </p>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
