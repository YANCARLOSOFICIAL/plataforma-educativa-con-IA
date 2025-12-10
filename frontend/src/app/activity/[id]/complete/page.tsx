'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { useQuery } from '@tanstack/react-query';
import { activitiesAPI } from '@/lib/api';
import Link from 'next/link';
import { ArrowLeft, CheckCircle, Send } from 'lucide-react';
import { Button, Card, Badge } from '@/components/ui';
import { toast } from 'sonner';
import PageTransition, { FadeIn } from '@/components/PageTransition';
import Spinner from '@/components/ui/Spinner';
import { InteractiveExam } from '@/components/interactive/InteractiveExam';
import { InteractiveSurvey } from '@/components/interactive/InteractiveSurvey';
import { InteractiveCrossword } from '@/components/interactive/InteractiveCrossword';
import { InteractiveWordSearch } from '@/components/interactive/InteractiveWordSearch';

export default function CompleteActivityPage() {
  const router = useRouter();
  const params = useParams();
  const user = useAuthStore((state) => state.user);
  const activityId = params?.id ? parseInt(params.id as string) : null;
  const [answers, setAnswers] = useState<any>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  const { data: activity, isLoading } = useQuery({
    queryKey: ['activity', activityId],
    queryFn: () => activitiesAPI.getById(activityId!),
    enabled: !!activityId,
  });

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  const handleAnswersChange = (newAnswers: any) => {
    setAnswers(newAnswers);
  };

  const handleSubmit = async () => {
    if (!activity) return;

    const toastId = toast.loading('Enviando respuestas...');
    try {
      // Aquí puedes agregar la lógica para enviar las respuestas al backend
      // Por ahora, solo mostramos un mensaje de éxito
      console.log('Respuestas enviadas:', answers);
      setIsSubmitted(true);
      toast.success('¡Actividad completada exitosamente!', { id: toastId });
    } catch (error) {
      console.error('Error enviando respuestas:', error);
      toast.error('Error al enviar las respuestas', { id: toastId });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <Spinner size="xl" />
          <p className="mt-4 text-gray-600 dark:text-gray-300 font-medium">Cargando actividad...</p>
        </div>
      </div>
    );
  }

  if (!activity) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
        <Card variant="elevated" padding="lg" className="text-center max-w-md">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Actividad no encontrada</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">La actividad que buscas no existe.</p>
          <Link href="/courses">
            <Button variant="primary" size="lg">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver a Cursos
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  // Verificar si la actividad es interactiva
  const isInteractiveActivity = ['exam', 'survey', 'crossword', 'word_search'].includes(activity.activity_type);

  if (!isInteractiveActivity) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
        <Card variant="elevated" padding="lg" className="text-center max-w-md">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Actividad no interactiva</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">Esta actividad solo está disponible para visualización.</p>
          <Link href={`/activity/${activityId}`}>
            <Button variant="primary" size="lg">
              Ver Actividad
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  const renderInteractiveContent = () => {
    const content = typeof activity.content === 'string'
      ? JSON.parse(activity.content)
      : activity.content;

    switch (activity.activity_type) {
      case 'exam':
        return (
          <InteractiveExam
            content={content}
            onAnswersChange={handleAnswersChange}
            isSubmitted={isSubmitted}
          />
        );
      case 'survey':
        return (
          <InteractiveSurvey
            content={content}
            onAnswersChange={handleAnswersChange}
            isSubmitted={isSubmitted}
          />
        );
      case 'crossword':
        return (
          <InteractiveCrossword
            content={content}
            onComplete={handleAnswersChange}
            isSubmitted={isSubmitted}
          />
        );
      case 'word_search':
        return (
          <InteractiveWordSearch
            content={content}
            onComplete={handleAnswersChange}
            isSubmitted={isSubmitted}
          />
        );
      default:
        return null;
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
          {/* Back Button */}
          <Link
            href="/courses"
            className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-4 sm:mb-6 group transition-colors text-sm sm:text-base"
          >
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Volver a Cursos
          </Link>

          {/* Header Card */}
          <FadeIn delay={0.1}>
            <Card variant="elevated" padding="lg" className="mb-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    {activity.title}
                  </h1>
                  {activity.description && (
                    <p className="text-gray-600 dark:text-gray-400 mb-3">
                      {activity.description}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-2">
                    {activity.subject && (
                      <Badge variant="primary">{activity.subject}</Badge>
                    )}
                    {activity.grade_level && (
                      <Badge variant="secondary">{activity.grade_level}</Badge>
                    )}
                    {isSubmitted && (
                      <Badge variant="success">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Completada
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          </FadeIn>

          {/* Interactive Content */}
          <FadeIn delay={0.2}>
            <Card variant="elevated" padding="lg">
              {renderInteractiveContent()}
            </Card>
          </FadeIn>

          {/* Submit Button */}
          {!isSubmitted && (
            <FadeIn delay={0.3}>
              <div className="mt-6 flex justify-center">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleSubmit}
                  className="min-w-[200px]"
                >
                  <Send className="w-5 h-5 mr-2" />
                  Enviar Respuestas
                </Button>
              </div>
            </FadeIn>
          )}

          {/* Success Message */}
          {isSubmitted && (
            <FadeIn delay={0.4}>
              <Card variant="elevated" padding="lg" className="mt-6 text-center bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-200 dark:border-green-700">
                <CheckCircle className="w-16 h-16 text-green-600 dark:text-green-400 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  ¡Excelente trabajo!
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Has completado esta actividad exitosamente.
                </p>
                <Link href="/courses">
                  <Button variant="primary" size="lg">
                    Volver a Mis Cursos
                  </Button>
                </Link>
              </Card>
            </FadeIn>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
