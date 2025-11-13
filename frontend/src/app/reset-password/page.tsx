'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { authAPI } from '@/lib/api';
import { Button, Input, Card } from '@/components/ui';
import { Lock, Eye, EyeOff, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import PageTransition, { FadeIn } from '@/components/PageTransition';

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    if (tokenParam) {
      setToken(tokenParam);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      toast.error('Token no válido. Por favor solicita un nuevo enlace de recuperación.');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }

    setIsLoading(true);
    const toastId = toast.loading('Restableciendo contraseña...');

    try {
      await authAPI.resetPassword({
        token,
        new_password: newPassword,
      });

      toast.success('Contraseña restablecida exitosamente', { id: toastId });
      setSuccess(true);

      // Redirigir al login después de 3 segundos
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    } catch (error: any) {
      console.error('Error al resetear contraseña:', error);
      toast.error(
        error?.response?.data?.detail || 'Error al restablecer la contraseña. El token puede haber expirado.',
        { id: toastId }
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
        <PageTransition>
          <Card variant="glass" padding="lg" className="shadow-2xl max-w-md text-center">
            <Lock className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Token No Válido
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              El enlace de recuperación no es válido o ha expirado.
            </p>
            <Link href="/forgot-password">
              <Button variant="primary" size="lg" fullWidth>
                Solicitar Nuevo Enlace
              </Button>
            </Link>
          </Card>
        </PageTransition>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
      <PageTransition>
        <div className="w-full max-w-md">
          {!success ? (
            <FadeIn delay={0.1}>
              <Card variant="glass" padding="lg" className="shadow-2xl">
                <div className="text-center mb-8">
                  <div className="inline-flex p-4 bg-gradient-to-br from-primary-500 to-blue-600 rounded-2xl shadow-lg mb-4">
                    <Lock className="w-12 h-12 text-white" />
                  </div>
                  <h1 className="text-3xl font-extrabold bg-gradient-to-r from-primary-600 to-blue-600 bg-clip-text text-transparent dark:from-primary-400 dark:to-blue-400 mb-2">
                    Nueva Contraseña
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400">
                    Ingresa tu nueva contraseña
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-2 block">
                      Nueva Contraseña
                    </label>
                    <div className="relative">
                      <Input
                        type={showNewPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Ingresa tu nueva contraseña"
                        required
                        fullWidth
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                      >
                        {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Mínimo 6 caracteres
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-2 block">
                      Confirmar Contraseña
                    </label>
                    <div className="relative">
                      <Input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirma tu nueva contraseña"
                        required
                        fullWidth
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                      >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    fullWidth
                    isLoading={isLoading}
                  >
                    Restablecer Contraseña
                  </Button>
                </form>
              </Card>
            </FadeIn>
          ) : (
            <FadeIn delay={0.1}>
              <Card variant="glass" padding="lg" className="shadow-2xl text-center">
                <div className="inline-flex p-4 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-lg mb-6">
                  <CheckCircle className="w-16 h-16 text-white" />
                </div>
                <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-4">
                  ¡Contraseña Restablecida!
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Tu contraseña ha sido actualizada exitosamente.
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-500 mb-8">
                  Serás redirigido al inicio de sesión en unos segundos...
                </p>

                <Link href="/login">
                  <Button variant="primary" size="lg" fullWidth>
                    Ir al Inicio de Sesión
                  </Button>
                </Link>
              </Card>
            </FadeIn>
          )}
        </div>
      </PageTransition>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Cargando...</p>
        </div>
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}
