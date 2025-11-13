'use client';

import { useState } from 'react';
import { authAPI } from '@/lib/api';
import { Button, Input, Card } from '@/components/ui';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import PageTransition, { FadeIn } from '@/components/PageTransition';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error('Por favor ingresa tu correo electrónico');
      return;
    }

    setIsLoading(true);
    const toastId = toast.loading('Enviando enlace de recuperación...');

    try {
      await authAPI.forgotPassword(email);
      toast.success('Enlace de recuperación enviado a tu correo', { id: toastId });
      setEmailSent(true);
    } catch (error: any) {
      console.error('Error al solicitar recuperación:', error);
      toast.error(
        error?.response?.data?.detail || 'Error al enviar el enlace. Verifica tu correo electrónico.',
        { id: toastId }
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
      <PageTransition>
        <div className="w-full max-w-md">
          {!emailSent ? (
            <FadeIn delay={0.1}>
              <Card variant="glass" padding="lg" className="shadow-2xl">
                <div className="text-center mb-8">
                  <div className="inline-flex p-4 bg-gradient-to-br from-primary-500 to-blue-600 rounded-2xl shadow-lg mb-4">
                    <Mail className="w-12 h-12 text-white" />
                  </div>
                  <h1 className="text-3xl font-extrabold bg-gradient-to-r from-primary-600 to-blue-600 bg-clip-text text-transparent dark:from-primary-400 dark:to-blue-400 mb-2">
                    ¿Olvidaste tu contraseña?
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400">
                    No te preocupes, te enviaremos un enlace para recuperarla
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <Input
                    type="email"
                    label="Correo Electrónico"
                    placeholder="tu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    fullWidth
                    icon={Mail}
                  />

                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    fullWidth
                    isLoading={isLoading}
                  >
                    Enviar Enlace de Recuperación
                  </Button>

                  <div className="text-center">
                    <Link
                      href="/login"
                      className="inline-flex items-center gap-2 text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-semibold text-sm"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Volver al inicio de sesión
                    </Link>
                  </div>
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
                  ¡Correo Enviado!
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mb-2">
                  Hemos enviado un enlace de recuperación a:
                </p>
                <p className="text-lg font-bold text-primary-600 dark:text-primary-400 mb-6">
                  {email}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-500 mb-8">
                  Revisa tu bandeja de entrada y sigue las instrucciones para resetear tu contraseña.
                  Si no lo encuentras, revisa la carpeta de spam.
                </p>

                <div className="space-y-3">
                  <Button
                    variant="outline"
                    size="md"
                    fullWidth
                    onClick={() => {
                      setEmailSent(false);
                      setEmail('');
                    }}
                  >
                    Intentar con otro correo
                  </Button>
                  <Link href="/login">
                    <Button variant="primary" size="md" fullWidth>
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Volver al inicio de sesión
                    </Button>
                  </Link>
                </div>
              </Card>
            </FadeIn>
          )}
        </div>
      </PageTransition>
    </div>
  );
}
