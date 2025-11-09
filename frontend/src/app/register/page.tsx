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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 px-4 py-12">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary-600 to-blue-600 text-white rounded-2xl mb-4 shadow-lg">
            <UserPlus className="w-10 h-10" />
          </div>
          <h2 className="text-4xl font-extrabold bg-gradient-to-r from-primary-600 to-blue-600 bg-clip-text text-transparent mb-2">
            Crear Cuenta
          </h2>
          <p className="text-gray-600 dark:text-gray-300 flex items-center justify-center gap-1">
            <Sparkles className="w-4 h-4" />
            Únete a la Plataforma Educativa
          </p>
        </div>

        <Card variant="elevated" padding="lg" className="backdrop-blur-sm bg-white/95 dark:bg-gray-800/95">
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
