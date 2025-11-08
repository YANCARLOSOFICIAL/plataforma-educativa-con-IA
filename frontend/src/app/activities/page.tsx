'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { useQuery } from '@tanstack/react-query';
import { activitiesAPI, exportAPI } from '@/lib/api';
import Link from 'next/link';
import { Download, Eye, Trash2, ArrowLeft } from 'lucide-react';
import { activityTypeLabels, aiProviderLabels, downloadFile } from '@/lib/utils';

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
    try {
      const blob = await exportAPI.exportToWord(activityId);
      downloadFile(blob, `${title}.docx`);
    } catch (error) {
      console.error('Error exportando a Word:', error);
      alert('Error al exportar a Word');
    }
  };

  const handleExportExcel = async (activityId: number, title: string) => {
    try {
      const blob = await exportAPI.exportToExcel(activityId);
      downloadFile(blob, `${title}.xlsx`);
    } catch (error: any) {
      console.error('Error exportando a Excel:', error);
      alert(error.response?.data?.detail || 'Error al exportar a Excel');
    }
  };

  const handleDelete = async (activityId: number) => {
    if (!confirm('¿Estás seguro de eliminar esta actividad?')) return;

    try {
      await activitiesAPI.delete(activityId);
      refetch();
      alert('Actividad eliminada correctamente');
    } catch (error) {
      console.error('Error eliminando actividad:', error);
      alert('Error al eliminar la actividad');
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link
            href="/dashboard"
            className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Mis Actividades</h1>
          <p className="text-gray-600 mt-2">
            Gestiona todas tus actividades creadas
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
          </div>
        ) : activities && activities.length > 0 ? (
          <div className="grid gap-4">
            {activities.map((activity) => (
              <div key={activity.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {activity.title}
                    </h3>
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {activityTypeLabels[activity.activity_type]}
                      </span>
                      {activity.ai_provider && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {aiProviderLabels[activity.ai_provider]}
                        </span>
                      )}
                      {activity.is_public ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          Público
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          Privado
                        </span>
                      )}
                      {activity.credits_used > 0 && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          {activity.credits_used} créditos
                        </span>
                      )}
                    </div>
                    {activity.description && (
                      <p className="text-gray-600 text-sm mb-2">{activity.description}</p>
                    )}
                    {activity.subject && (
                      <p className="text-gray-500 text-sm">
                        Materia: {activity.subject}
                        {activity.grade_level && ` • Nivel: ${activity.grade_level}`}
                      </p>
                    )}
                    <p className="text-gray-400 text-xs mt-2">
                      Creado: {new Date(activity.created_at).toLocaleDateString('es-ES')}
                    </p>
                  </div>

                  <div className="flex flex-col gap-2 ml-4">
                    <Link
                      href={`/activity/${activity.id}`}
                      className="btn btn-primary text-sm flex items-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      Ver
                    </Link>
                    <button
                      onClick={() => handleExportWord(activity.id, activity.title)}
                      className="btn btn-secondary text-sm flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Word
                    </button>
                    {activity.activity_type === 'slides' && (
                      <button
                        onClick={async () => {
                          try {
                            const blob = await exportAPI.exportToPptx(activity.id);
                            downloadFile(blob, `${activity.title}.pptx`);
                          } catch (error) {
                            console.error('Error exportando a PPTX:', error);
                            alert('Error al exportar a PPTX');
                          }
                        }}
                        className="btn btn-secondary text-sm flex items-center gap-2"
                      >
                        <Download className="w-4 h-4" />
                        PPTX
                      </button>
                    )}
                    {['exam', 'survey', 'rubric', 'crossword', 'word_search'].includes(activity.activity_type) && (
                      <button
                        onClick={() => handleExportExcel(activity.id, activity.title)}
                        className="btn btn-secondary text-sm flex items-center gap-2"
                      >
                        <Download className="w-4 h-4" />
                        Excel
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(activity.id)}
                      className="btn bg-red-100 text-red-700 hover:bg-red-200 text-sm flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500 text-lg">No tienes actividades creadas aún</p>
            <Link href="/dashboard" className="btn btn-primary mt-4">
              Crear Primera Actividad
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
