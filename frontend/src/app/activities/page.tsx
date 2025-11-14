'use client';

import { useQuery } from '@tanstack/react-query';
import { activitiesAPI, exportAPI } from '@/lib/api';
import Link from 'next/link';
import { Download, Eye, Trash2, FileText, Calendar, BookOpen, Plus } from 'lucide-react';
import { activityTypeLabels, aiProviderLabels, downloadFile } from '@/lib/utils';
import { Button, Card, Badge } from '@/components/ui';
import DashboardLayout from '@/components/DashboardLayout';
import { toast } from 'sonner';
import PageTransition, { SlideIn, FadeIn } from '@/components/PageTransition';

export default function ActivitiesPage() {
  const { data: activities, isLoading, refetch } = useQuery({
    queryKey: ['my-activities'],
    queryFn: () => activitiesAPI.getMy(),
  });

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

  return (
    <DashboardLayout>
      <PageTransition>
        <div className="space-y-8">
          {/* Header */}
          <FadeIn delay={0.1}>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 sm:gap-3 mb-2">
                  <div className="p-2 sm:p-3 bg-gradient-to-br from-primary-500 to-blue-600 rounded-2xl shadow-lg flex-shrink-0">
                    <FileText className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                  </div>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold bg-gradient-to-r from-primary-600 via-blue-600 to-purple-600 bg-clip-text text-transparent dark:from-primary-400 dark:via-blue-400 dark:to-purple-400">
                    Mis Actividades
                  </h1>
                  {!isLoading && activities && (
                    <Badge className="!bg-gradient-to-r !from-primary-600 !to-blue-600 !text-white shadow-lg text-sm sm:text-base lg:text-lg px-2 sm:px-3 lg:px-4 py-1 sm:py-1.5 lg:py-2 flex-shrink-0">
                      {activities.length}
                    </Badge>
                  )}
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base lg:text-lg sm:ml-11 lg:ml-16">
                  Gestiona y exporta todas tus actividades creadas
                </p>
              </div>
              <Link href="/create" className="w-full sm:w-auto">
                <Button variant="primary" size="lg" className="w-full sm:w-auto">
                  <Plus className="w-5 h-5 mr-2" />
                  <span className="hidden sm:inline">Nueva Actividad</span>
                  <span className="sm:hidden">Nueva</span>
                </Button>
              </Link>
            </div>
          </FadeIn>

          {/* Activities List */}
          {isLoading ? (
            <FadeIn delay={0.15}>
              <div className="grid gap-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i} variant="glass" padding="lg" className="animate-pulse">
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-20 bg-gray-300 dark:bg-gray-700 rounded-xl" />
                      <div className="flex-1">
                        <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-2/3 mb-3" />
                        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2 mb-2" />
                        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/3" />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </FadeIn>
          ) : activities && activities.length > 0 ? (
            <FadeIn delay={0.2}>
              <div className="grid gap-5">
                {activities.map((activity) => (
                  <Card
                    key={activity.id}
                    variant="glass"
                    padding="lg"
                    hover
                    className="group"
                  >
                <div className="flex flex-col lg:flex-row items-start justify-between gap-4 lg:gap-6">
                  <div className="flex-1 w-full">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-3">
                      {activity.title}
                    </h3>
                    <div className="flex flex-wrap gap-2 mb-4">
                      <Badge variant="primary" size="sm">
                        {activityTypeLabels[activity.activity_type]}
                      </Badge>
                      {activity.ai_provider && (
                        <Badge variant="success" size="sm">
                          {aiProviderLabels[activity.ai_provider]}
                        </Badge>
                      )}
                      {activity.is_public ? (
                        <Badge variant="info" size="sm">Público</Badge>
                      ) : (
                        <Badge variant="default" size="sm">Privado</Badge>
                      )}
                      {activity.credits_used > 0 && (
                        <Badge variant="warning" size="sm">
                          {activity.credits_used} créditos
                        </Badge>
                      )}
                    </div>
                    {activity.description && (
                      <p className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm mb-3 line-clamp-2">{activity.description}</p>
                    )}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                      {activity.subject && (
                        <div className="flex items-center gap-1">
                          <BookOpen className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                          <span className="truncate">{activity.subject}</span>
                          {activity.grade_level && <span className="flex-shrink-0">• {activity.grade_level}</span>}
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                        <span className="truncate">{new Date(activity.created_at).toLocaleDateString('es-ES', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex lg:flex-col gap-2 w-full lg:w-auto flex-wrap lg:flex-nowrap">
                    <Link href={`/activity/${activity.id}`} className="flex-1 lg:flex-initial">
                      <Button variant="primary" size="sm" className="w-full">
                        <Eye className="w-4 h-4 lg:mr-2" />
                        <span className="hidden sm:inline">Ver</span>
                      </Button>
                    </Link>
                    <Button
                      onClick={() => handleExportWord(activity.id, activity.title)}
                      variant="secondary"
                      size="sm"
                      className="flex-1 lg:flex-initial lg:w-full"
                    >
                      <Download className="w-4 h-4 lg:mr-2" />
                      <span className="hidden sm:inline">Word</span>
                    </Button>
                    {activity.activity_type === 'slides' && (
                      <Button
                        onClick={() => handleExportPptx(activity.id, activity.title)}
                        variant="secondary"
                        size="sm"
                        className="flex-1 lg:flex-initial lg:w-full"
                      >
                        <Download className="w-4 h-4 lg:mr-2" />
                        <span className="hidden sm:inline">PPTX</span>
                      </Button>
                    )}
                    {['exam', 'survey', 'rubric', 'crossword', 'word_search'].includes(activity.activity_type) && (
                      <Button
                        onClick={() => handleExportExcel(activity.id, activity.title)}
                        variant="secondary"
                        size="sm"
                        className="flex-1 lg:flex-initial lg:w-full"
                      >
                        <Download className="w-4 h-4 lg:mr-2" />
                        <span className="hidden sm:inline">Excel</span>
                      </Button>
                    )}
                    <Button
                      onClick={() => handleDelete(activity.id)}
                      variant="danger"
                      size="sm"
                      className="flex-1 lg:flex-initial lg:w-full"
                    >
                      <Trash2 className="w-4 h-4 lg:mr-2" />
                      <span className="hidden sm:inline">Eliminar</span>
                    </Button>
                  </div>
                </div>
                </Card>
              ))}
            </div>
          </FadeIn>
          ) : (
            <FadeIn delay={0.2}>
              <Card variant="glass" padding="lg" className="text-center py-16">
                <div className="max-w-md mx-auto">
                  <FileText className="w-20 h-20 text-gray-400 mx-auto mb-6" />
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                    No tienes actividades creadas
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6 text-lg">
                    Comienza creando tu primera actividad educativa con IA
                  </p>
                  <Link href="/create">
                    <Button variant="primary" size="lg">
                      <Plus className="w-5 h-5 mr-2" />
                      Crear Primera Actividad
                    </Button>
                  </Link>
                </div>
              </Card>
            </FadeIn>
          )}
        </div>
      </PageTransition>
    </DashboardLayout>
  );
}
