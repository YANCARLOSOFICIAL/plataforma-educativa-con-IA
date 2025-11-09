'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { useQuery } from '@tanstack/react-query';
import { activitiesAPI, exportAPI } from '@/lib/api';
import Link from 'next/link';
import { ArrowLeft, Download, Share2, FileText, Calendar, User, BookOpen, Sparkles, Lock, Globe } from 'lucide-react';
import { activityTypeLabels, aiProviderLabels, downloadFile } from '@/lib/utils';
import { ActivityContent } from '@/components/ActivityContent';
import { Button, Card, Badge } from '@/components/ui';
import { toast } from 'sonner';
import PageTransition, { SlideIn, FadeIn } from '@/components/PageTransition';
import Spinner from '@/components/ui/Spinner';

export default function ActivityDetailPage() {
  const router = useRouter();
  const params = useParams();
  const user = useAuthStore((state) => state.user);
  const activityId = params?.id ? parseInt(params.id as string) : null;

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

  const handleExportWord = async () => {
    if (!activity) return;
    const toastId = toast.loading('Exportando a Word...');
    try {
      const blob = await exportAPI.exportToWord(activity.id);
      downloadFile(blob, `${activity.title}.docx`);
      toast.success('Archivo Word descargado correctamente', { id: toastId });
    } catch (error) {
      console.error('Error exportando a Word:', error);
      toast.error('Error al exportar a Word', { id: toastId });
    }
  };

  const handleExportPptx = async () => {
    if (!activity) return;
    const toastId = toast.loading('Exportando a PowerPoint...');
    try {
      const blob = await exportAPI.exportToPptx(activity.id);
      downloadFile(blob, `${activity.title}.pptx`);
      toast.success('Archivo PowerPoint descargado correctamente', { id: toastId });
    } catch (error) {
      console.error('Error exportando a PPTX:', error);
      toast.error('Error al exportar a PowerPoint', { id: toastId });
    }
  };

  const handleExportExcel = async () => {
    if (!activity) return;
    const toastId = toast.loading('Exportando a Excel...');
    try {
      const blob = await exportAPI.exportToExcel(activity.id);
      downloadFile(blob, `${activity.title}.xlsx`);
      toast.success('Archivo Excel descargado correctamente', { id: toastId });
    } catch (error: any) {
      console.error('Error exportando a Excel:', error);
      toast.error(error.response?.data?.detail || 'Error al exportar a Excel', { id: toastId });
    }
  };

  const togglePublic = async () => {
    if (!activity) return;
    const toastId = toast.loading('Actualizando visibilidad...');
    try {
      await activitiesAPI.update(activity.id, { is_public: !activity.is_public });
      toast.success(`Actividad ahora es ${!activity.is_public ? 'pública' : 'privada'}`, { id: toastId });
      window.location.reload();
    } catch (error) {
      console.error('Error actualizando visibilidad:', error);
      toast.error('Error al cambiar la visibilidad', { id: toastId });
    }
  };

  if (!user) return null;

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
          <FileText className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Actividad no encontrada</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">La actividad que buscas no existe o no tienes acceso a ella.</p>
          <Link href="/activities">
            <Button variant="primary" size="lg">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver a Actividades
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Back Button */}
          <SlideIn direction="right">
            <Link
              href="/activities"
              className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-6 group transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
              Volver a Actividades
            </Link>
          </SlideIn>

          {/* Header Card */}
          <FadeIn delay={0.1}>
            <Card variant="elevated" padding="none" className="overflow-hidden mb-6">
              <div className="bg-gradient-to-r from-primary-600 via-blue-600 to-indigo-600 px-8 py-10 text-white relative overflow-hidden">
                {/* Background decoration */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-32 -mt-32"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-5 rounded-full -ml-24 -mb-24"></div>

                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h1 className="text-4xl font-bold mb-4">{activity.title}</h1>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="default" size="md" className="bg-white/20 text-white border-white/30">
                          {activityTypeLabels[activity.activity_type]}
                        </Badge>
                        {activity.ai_provider && (
                          <Badge variant="default" size="md" className="bg-white/20 text-white border-white/30">
                            <Sparkles className="w-3 h-3 mr-1" />
                            {aiProviderLabels[activity.ai_provider]}
                            {activity.model_used && ` • ${activity.model_used}`}
                          </Badge>
                        )}
                        {activity.credits_used > 0 && (
                          <Badge variant="default" size="md" className="bg-yellow-500/30 text-white border-yellow-300/30">
                            {activity.credits_used} créditos
                          </Badge>
                        )}
                      </div>
                    </div>
                    {activity.is_public ? (
                      <Globe className="w-8 h-8 text-white/70" />
                    ) : (
                      <Lock className="w-8 h-8 text-white/70" />
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="px-8 py-5 bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-gray-700 border-b border-gray-200 dark:border-gray-600">
                <div className="flex flex-wrap gap-3">
                  <Button onClick={handleExportWord} variant="primary" size="md">
                    <Download className="w-4 h-4 mr-2" />
                    Exportar Word
                  </Button>
                  {['exam', 'survey', 'rubric', 'crossword', 'word_search'].includes(activity.activity_type) && (
                    <Button onClick={handleExportExcel} variant="secondary" size="md">
                      <Download className="w-4 h-4 mr-2" />
                      Exportar Excel
                    </Button>
                  )}
                  {activity.activity_type === 'slides' && (
                    <Button onClick={handleExportPptx} variant="secondary" size="md">
                      <Download className="w-4 h-4 mr-2" />
                      Exportar PPTX
                    </Button>
                  )}
                  {activity.creator_id === user.id && (
                    <Button onClick={togglePublic} variant="outline" size="md">
                      <Share2 className="w-4 h-4 mr-2" />
                      {activity.is_public ? 'Hacer Privado' : 'Hacer Público'}
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          </FadeIn>

          {/* Metadata Grid */}
          <FadeIn delay={0.2}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {activity.subject && (
                <Card variant="default" padding="md" className="border-l-4 border-primary-500">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary-100 dark:bg-primary-900/30 p-2 rounded-lg">
                      <BookOpen className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Materia</p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">{activity.subject}</p>
                    </div>
                  </div>
                </Card>
              )}
              {activity.grade_level && (
                <Card variant="default" padding="md" className="border-l-4 border-blue-500">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg">
                      <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Nivel</p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">{activity.grade_level}</p>
                    </div>
                  </div>
                </Card>
              )}
              <Card variant="default" padding="md" className="border-l-4 border-purple-500">
                <div className="flex items-center gap-3">
                  <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-lg">
                    <Calendar className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Creado</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {new Date(activity.created_at).toLocaleDateString('es-ES', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </FadeIn>

          {/* Description */}
          {activity.description && (
            <FadeIn delay={0.3}>
              <Card variant="elevated" padding="lg" className="mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                  Descripción
                </h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{activity.description}</p>
              </Card>
            </FadeIn>
          )}

          {/* Main Content */}
          <FadeIn delay={0.4}>
            <Card variant="elevated" padding="lg">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                Contenido Generado
              </h2>
              <div className="prose max-w-none">
                <ActivityContent activity={activity} />
              </div>
            </Card>
          </FadeIn>

          {/* Footer Info */}
          <FadeIn delay={0.5}>
            <div className="mt-6 text-sm text-gray-500 dark:text-gray-400 text-center space-y-1">
              {activity.updated_at && (
                <p>Última actualización: {new Date(activity.updated_at).toLocaleString('es-ES')}</p>
              )}
              <p className="flex items-center justify-center gap-2">
                {activity.is_public ? (
                  <>
                    <Globe className="w-4 h-4" />
                    Actividad pública
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    Actividad privada
                  </>
                )}
              </p>
            </div>
          </FadeIn>
        </div>
      </div>
    </PageTransition>
  );
}
