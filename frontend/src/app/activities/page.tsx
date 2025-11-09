'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { useQuery } from '@tanstack/react-query';
import { activitiesAPI, exportAPI } from '@/lib/api';
import Link from 'next/link';
import { Download, Eye, Trash2, ArrowLeft, FileText, Calendar, BookOpen } from 'lucide-react';
import { activityTypeLabels, aiProviderLabels, downloadFile } from '@/lib/utils';
import { Button, Card, Badge } from '@/components/ui';
import { ActivityCardSkeleton } from '@/components/ui/LoadingSkeleton';
import { toast } from 'sonner';
import PageTransition, { SlideIn, FadeIn } from '@/components/PageTransition';

export default function ActivitiesPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);

  const { data: activities, isLoading, refetch } = useQuery({
    queryKey: ['my-activities'],
    queryFn: () => activitiesAPI.getMy(),
  });

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  const handleExportWord = async (activityId: number, title: string) => {
    const toastId = toast.loading('Exportando a Word...');
    try {
      const blob = await exportAPI.exportToWord(activityId);
      downloadFile(blob, `${title}.docx`);
      toast.success('Archivo Word descargado correctamente', { id: toastId });
    } catch (error) {
      console.error('Error exportando a Word:', error);
      toast.error('Error al exportar a Word', { id: toastId });
    }
  };

  const handleExportExcel = async (activityId: number, title: string) => {
    const toastId = toast.loading('Exportando a Excel...');
    try {
      const blob = await exportAPI.exportToExcel(activityId);
      downloadFile(blob, `${title}.xlsx`);
      toast.success('Archivo Excel descargado correctamente', { id: toastId });
    } catch (error: any) {
      console.error('Error exportando a Excel:', error);
      toast.error(error.response?.data?.detail || 'Error al exportar a Excel', { id: toastId });
    }
  };

  const handleExportPptx = async (activityId: number, title: string) => {
    const toastId = toast.loading('Exportando a PowerPoint...');
    try {
      const blob = await exportAPI.exportToPptx(activityId);
      downloadFile(blob, `${title}.pptx`);
      toast.success('Archivo PowerPoint descargado correctamente', { id: toastId });
    } catch (error) {
      console.error('Error exportando a PPTX:', error);
      toast.error('Error al exportar a PowerPoint', { id: toastId });
    }
  };

  const handleDelete = async (activityId: number) => {
    if (!confirm('¿Estás seguro de eliminar esta actividad?')) return;

    const toastId = toast.loading('Eliminando actividad...');
    try {
      await activitiesAPI.delete(activityId);
      refetch();
      toast.success('Actividad eliminada correctamente', { id: toastId });
    } catch (error) {
      console.error('Error eliminando actividad:', error);
      toast.error('Error al eliminar la actividad', { id: toastId });
    }
  };

  if (!user) return null;

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <SlideIn direction="right">
            <div className="mb-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-4 group"
          >
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Volver al Dashboard
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-gradient-to-br from-primary-500 to-blue-600 p-2 rounded-lg">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-blue-600 bg-clip-text text-transparent">
              Mis Actividades
            </h1>
            {!isLoading && activities && (
              <Badge variant="primary" size="lg">{activities.length}</Badge>
            )}
          </div>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Gestiona todas tus actividades creadas
          </p>
        </div>
      </SlideIn>

        {isLoading ? (
          <FadeIn>
            <div className="grid gap-4">
              {[1, 2, 3].map((i) => (
                <ActivityCardSkeleton key={i} />
              ))}
            </div>
          </FadeIn>
        ) : activities && activities.length > 0 ? (
            <FadeIn delay={0.2}>
              <div className="grid gap-4">
            {activities.map((activity) => (
              <Card
                key={activity.id}
                variant="elevated"
                padding="lg"
                className="hover:shadow-xl transition-all border border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-500"
              >
                <div className="flex items-start justify-between gap-6">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                      {activity.title}
                    </h3>
                    <div className="flex flex-wrap gap-2 mb-4">
                      <Badge variant="primary">
                        {activityTypeLabels[activity.activity_type]}
                      </Badge>
                      {activity.ai_provider && (
                        <Badge variant="success">
                          {aiProviderLabels[activity.ai_provider]}
                        </Badge>
                      )}
                      {activity.is_public ? (
                        <Badge variant="info">Público</Badge>
                      ) : (
                        <Badge variant="default">Privado</Badge>
                      )}
                      {activity.credits_used > 0 && (
                        <Badge variant="warning">
                          {activity.credits_used} créditos
                        </Badge>
                      )}
                    </div>
                    {activity.description && (
                      <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 line-clamp-2">{activity.description}</p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                      {activity.subject && (
                        <div className="flex items-center gap-1">
                          <BookOpen className="w-4 h-4" />
                          <span>{activity.subject}</span>
                          {activity.grade_level && <span>• {activity.grade_level}</span>}
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(activity.created_at).toLocaleDateString('es-ES', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Link href={`/activity/${activity.id}`}>
                      <Button variant="primary" size="sm" fullWidth>
                        <Eye className="w-4 h-4 mr-2" />
                        Ver
                      </Button>
                    </Link>
                    <Button
                      onClick={() => handleExportWord(activity.id, activity.title)}
                      variant="secondary"
                      size="sm"
                      fullWidth
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Word
                    </Button>
                    {activity.activity_type === 'slides' && (
                      <Button
                        onClick={() => handleExportPptx(activity.id, activity.title)}
                        variant="secondary"
                        size="sm"
                        fullWidth
                      >
                        <Download className="w-4 h-4 mr-2" />
                        PPTX
                      </Button>
                    )}
                    {['exam', 'survey', 'rubric', 'crossword', 'word_search'].includes(activity.activity_type) && (
                      <Button
                        onClick={() => handleExportExcel(activity.id, activity.title)}
                        variant="secondary"
                        size="sm"
                        fullWidth
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Excel
                      </Button>
                    )}
                    <Button
                      onClick={() => handleDelete(activity.id)}
                      variant="danger"
                      size="sm"
                      fullWidth
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Eliminar
                    </Button>
                  </div>
                </div>
                </Card>
              ))}
            </div>
          </FadeIn>
          ) : (
            <FadeIn delay={0.2}>
              <Card variant="elevated" padding="lg" className="text-center py-12">
            <div className="max-w-md mx-auto">
              <FileText className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-2">No tienes actividades creadas</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">Comienza creando tu primera actividad educativa</p>
              <Link href="/dashboard">
                <Button variant="primary" size="lg">
                  Crear Primera Actividad
                </Button>
                </Link>
              </div>
            </Card>
          </FadeIn>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
