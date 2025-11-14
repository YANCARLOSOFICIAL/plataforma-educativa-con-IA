'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { authAPI } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import { UserRole, type RegisterData } from '@/types';
import Link from 'next/link';
import { Button, Input, Card } from '@/components/ui';
import { toast } from 'sonner';
import { UserPlus, Sparkles } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<RegisterData & { confirmPassword: string }>();

  const password = watch('password');

  const onSubmit = async (data: RegisterData & { confirmPassword: string }) => {
    try {
      setLoading(true);
      setError('');
      const { confirmPassword, ...registerData } = data;
      const response = await authAPI.register(registerData);
      setAuth(response.user, response.access_token);
      toast.success('¡Cuenta creada exitosamente! Bienvenido a la plataforma');
      router.push('/dashboard');
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || 'Error al registrarse';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center mesh-bg px-4 py-12 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-20 right-10 w-72 h-72 bg-purple-400/30 rounded-full filter blur-3xl animate-float" />
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-blue-400/30 rounded-full filter blur-3xl animate-float" style={{ animationDelay: '2s' }} />

      <div className="max-w-md w-full relative z-10">
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-gradient-to-br from-primary-600 via-blue-600 to-purple-600 text-white rounded-2xl sm:rounded-3xl mb-4 sm:mb-6 shadow-2xl animate-float">
            <UserPlus className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12" />
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold bg-gradient-to-r from-primary-600 via-blue-600 to-purple-600 bg-clip-text text-transparent mb-2 sm:mb-3 dark:from-primary-400 dark:via-blue-400 dark:to-purple-400 px-4">
            Crear Cuenta
          </h2>
          <p className="text-gray-700 dark:text-gray-300 flex items-center justify-center gap-2 text-base sm:text-lg font-medium px-4">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-primary-500 flex-shrink-0" />
            Únete a la Plataforma Educativa
          </p>
        </div>

        <Card variant="glass" padding="lg" className="shadow-2xl">
          <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
            {error && (
              <div className="bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg">
                <p className="font-semibold text-sm">Error al crear cuenta</p>
                <p className="text-sm">{error}</p>
              </div>
            )}

            <Input
              {...register('full_name')}
              type="text"
              label="Nombre Completo"
              placeholder="Juan Pérez"
              helperText="Opcional"
              fullWidth
            />

            <Input
              {...register('username', { required: 'El nombre de usuario es requerido' })}
              type="text"
              label="Nombre de Usuario"
              placeholder="juanperez"
              error={errors.username?.message}
              fullWidth
              required
              autoFocus
            />

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
            />

            <div className="flex flex-col gap-1.5">
              <label htmlFor="role" className="text-sm font-medium text-gray-700 dark:text-gray-200">
                Rol <span className="text-red-500 ml-1">*</span>
              </label>
              <select
                {...register('role')}
                id="role"
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent hover:border-gray-400 dark:hover:border-gray-500 dark:bg-gray-700 dark:text-white"
                defaultValue={UserRole.DOCENTE}
              >
                <option value={UserRole.ESTUDIANTE}>Estudiante</option>
                <option value={UserRole.DOCENTE}>Docente</option>
              </select>
            </div>

            <Input
              {...register('password', {
                required: 'La contraseña es requerida',
                minLength: {
                  value: 6,
                  message: 'La contraseña debe tener al menos 6 caracteres',
                },
              })}
              type="password"
              label="Contraseña"
              placeholder="Mínimo 6 caracteres"
              error={errors.password?.message}
              fullWidth
              required
            />

            <Input
              {...register('confirmPassword', {
                required: 'Confirma tu contraseña',
                validate: (value) => value === password || 'Las contraseñas no coinciden',
              })}
              type="password"
              label="Confirmar Contraseña"
              placeholder="Repite tu contraseña"
              error={errors.confirmPassword?.message}
              fullWidth
              required
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              isLoading={loading}
              className="mt-6"
            >
              {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
            </Button>

            <div className="text-center pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                ¿Ya tienes cuenta?{' '}
                <Link href="/login" className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-semibold hover:underline transition-colors">
                  Inicia sesión aquí
                </Link>
              </p>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
