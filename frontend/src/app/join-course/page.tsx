'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { GraduationCap, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { Button, Card } from '@/components/ui';
import { toast } from 'sonner';
import { useAuthStore } from '@/lib/store';

function JoinCourseContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [courseName, setCourseName] = useState('');

  const handleJoinCourse = async () => {
    if (!token) {
      setError('Token de invitación no válido');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const authToken = useAuthStore.getState().token;
      if (!authToken) {
        router.push(`/login?redirect=/join-course?token=${token}`);
        return;
      }

      const response = await fetch('http://localhost:8000/api/courses/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ token })
      });

      if (response.ok) {
        const data = await response.json();
        setCourseName(data.title);
        setSuccess(true);
        toast.success(`Te has unido a ${data.title}`);

        // Redirigir a los cursos después de 2 segundos
        setTimeout(() => {
          router.push('/courses');
        }, 2000);
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Error al unirse al curso');
      }
    } catch (err) {
      setError('Error de conexión. Por favor intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <Card variant="glass" padding="xl" className="max-w-md w-full text-center">
          <div className="w-20 h-20 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <XCircle className="w-10 h-10 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
            Link Inválido
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            El link de invitación no es válido. Por favor, verifica que hayas copiado correctamente el link completo.
          </p>
          <Link href="/courses">
            <Button variant="primary" size="lg" className="w-full">
              Ir a Mis Cursos
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <Card variant="glass" padding="xl" className="max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
            ¡Te has unido al curso!
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-2 text-lg">
            Te has inscrito exitosamente en
          </p>
          <p className="text-2xl font-bold text-primary-600 dark:text-primary-400 mb-6">
            {courseName}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mb-6">
            Redirigiendo a tus cursos...
          </p>
          <Link href="/courses">
            <Button variant="primary" size="lg" className="w-full">
              Ver Mis Cursos
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <Card variant="glass" padding="xl" className="max-w-md w-full text-center">
          <div className="w-20 h-20 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-10 h-10 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
            Error
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {error}
          </p>
          <div className="space-y-3">
            <Button
              variant="primary"
              size="lg"
              onClick={handleJoinCourse}
              className="w-full"
            >
              Intentar de Nuevo
            </Button>
            <Link href="/courses">
              <Button variant="secondary" size="lg" className="w-full">
                Volver a Cursos
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <Card variant="glass" padding="xl" className="max-w-md w-full text-center">
        <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <GraduationCap className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
          Invitación a Curso
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Has recibido una invitación para unirte a un curso. Haz clic en el botón de abajo para aceptar la invitación.
        </p>
        <Button
          variant="primary"
          size="lg"
          onClick={handleJoinCourse}
          disabled={loading}
          className="w-full"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
              Uniéndose...
            </span>
          ) : (
            'Unirse al Curso'
          )}
        </Button>
      </Card>
    </div>
  );
}

export default function JoinCoursePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
      </div>
    }>
      <JoinCourseContent />
    </Suspense>
  );
}
