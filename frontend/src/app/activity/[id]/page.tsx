'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { useQuery } from '@tanstack/react-query';
import { activitiesAPI, exportAPI } from '@/lib/api';
import Link from 'next/link';
import { ArrowLeft, Download, Share2 } from 'lucide-react';
import { activityTypeLabels, aiProviderLabels, downloadFile } from '@/lib/utils';

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
    try {
      const blob = await exportAPI.exportToWord(activity.id);
      downloadFile(blob, `${activity.title}.docx`);
    } catch (error) {
      console.error('Error exportando a Word:', error);
      alert('Error al exportar a Word');
    }
  };

  const handleExportExcel = async () => {
    if (!activity) return;
    try {
      const blob = await exportAPI.exportToExcel(activity.id);
      downloadFile(blob, `${activity.title}.xlsx`);
    } catch (error: any) {
      console.error('Error exportando a Excel:', error);
      alert(error.response?.data?.detail || 'Error al exportar a Excel');
    }
  };

  const togglePublic = async () => {
    if (!activity) return;
    try {
      await activitiesAPI.update(activity.id, { is_public: !activity.is_public });
      window.location.reload();
    } catch (error) {
      console.error('Error actualizando visibilidad:', error);
      alert('Error al cambiar la visibilidad');
    }
  };

  if (!user) return null;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!activity) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Actividad no encontrada</h2>
          <Link href="/activities" className="btn btn-primary">
            Volver a Actividades
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link
            href="/activities"
            className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver a Actividades
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-8 text-white">
            <h1 className="text-3xl font-bold mb-2">{activity.title}</h1>
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-white bg-opacity-20">
                {activityTypeLabels[activity.activity_type]}
              </span>
              {activity.ai_provider && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-white bg-opacity-20">
                  {aiProviderLabels[activity.ai_provider]}
                  {activity.model_used && ` • ${activity.model_used}`}
                </span>
              )}
              {activity.credits_used > 0 && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-white bg-opacity-20">
                  {activity.credits_used} créditos
                </span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="px-6 py-4 bg-gray-50 border-b flex flex-wrap gap-3">
            <button onClick={handleExportWord} className="btn btn-primary flex items-center gap-2">
              <Download className="w-4 h-4" />
              Exportar a Word
            </button>
            {['exam', 'survey', 'rubric', 'crossword', 'word_search'].includes(activity.activity_type) && (
              <button onClick={handleExportExcel} className="btn btn-secondary flex items-center gap-2">
                <Download className="w-4 h-4" />
                Exportar a Excel
              </button>
            )}
            {activity.creator_id === user.id && (
              <button onClick={togglePublic} className="btn btn-secondary flex items-center gap-2">
                <Share2 className="w-4 h-4" />
                {activity.is_public ? 'Hacer Privado' : 'Hacer Público'}
              </button>
            )}
          </div>

          {/* Content */}
          <div className="px-6 py-6">
            {activity.description && (
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Descripción</h2>
                <p className="text-gray-700">{activity.description}</p>
              </div>
            )}

            {(activity.subject || activity.grade_level) && (
              <div className="mb-6 grid grid-cols-2 gap-4">
                {activity.subject && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-600">Materia</h3>
                    <p className="text-gray-900">{activity.subject}</p>
                  </div>
                )}
                {activity.grade_level && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-600">Nivel</h3>
                    <p className="text-gray-900">{activity.grade_level}</p>
                  </div>
                )}
              </div>
            )}

            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Contenido Generado</h2>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <pre className="text-sm text-gray-800 whitespace-pre-wrap font-mono overflow-auto max-h-96">
                  {JSON.stringify(activity.content, null, 2)}
                </pre>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Nota: Este es el contenido en formato JSON. Usa los botones de exportación para obtener un formato más legible.
              </p>
            </div>

            <div className="text-sm text-gray-500 border-t pt-4">
              <p>Creado: {new Date(activity.created_at).toLocaleString('es-ES')}</p>
              {activity.updated_at && (
                <p>Actualizado: {new Date(activity.updated_at).toLocaleString('es-ES')}</p>
              )}
              <p>Visibilidad: {activity.is_public ? 'Público' : 'Privado'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
