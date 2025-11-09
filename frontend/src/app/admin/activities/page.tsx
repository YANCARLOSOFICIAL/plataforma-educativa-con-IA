'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminAPI } from '@/lib/api';
import { Card, Button, Badge } from '@/components/ui';
import Spinner from '@/components/ui/Spinner';
import PageTransition, { FadeIn } from '@/components/PageTransition';
import { Eye, Trash2, Filter } from 'lucide-react';
import { clsx } from 'clsx';
import { toast } from 'sonner';
import Link from 'next/link';
import { activityTypeLabels } from '@/lib/utils';
import type { ActivityListItem } from '@/types';

export default function ActivitiesManagementPage() {
  const queryClient = useQueryClient();
  const [activityTypeFilter, setActivityTypeFilter] = useState<string>('');

  const { data: activities, isLoading } = useQuery({
    queryKey: ['admin-activities', activityTypeFilter],
    queryFn: () =>
      adminAPI.getActivities({
        activity_type: activityTypeFilter || undefined,
      }),
  });

  const deleteActivityMutation = useMutation({
    mutationFn: (activityId: number) => adminAPI.deleteActivity(activityId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-activities'] });
      toast.success('Actividad eliminada correctamente');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.detail || 'Error al eliminar actividad');
    },
  });

  const handleDeleteActivity = (activity: ActivityListItem) => {
    if (window.confirm(`¿Estás seguro de eliminar la actividad "${activity.title}"?`)) {
      deleteActivityMutation.mutate(activity.id);
    }
  };

  const getActivityTypeBadgeColor = (type: string): 'primary' | 'success' | 'warning' | 'info' | 'danger' => {
    const colors: Record<string, 'primary' | 'success' | 'warning' | 'info' | 'danger'> = {
      exam: 'info',
      summary: 'success',
      class_activity: 'primary',
      rubric: 'warning',
      writing_correction: 'danger',
      slides: 'primary',
      email: 'info',
      survey: 'warning',
      story: 'success',
      crossword: 'info',
      word_search: 'success',
    };
    return colors[type] || 'primary';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="space-y-6">
        <FadeIn delay={0.1}>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Gestión de Actividades</h1>
              <p className="text-gray-600 dark:text-gray-400">Administra todas las actividades creadas</p>
            </div>
            <Badge variant="primary" size="lg">
              {activities?.length || 0} actividades
            </Badge>
          </div>
        </FadeIn>

        <FadeIn delay={0.2}>
          <Card padding="md">
            <div className="flex items-center gap-3">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={activityTypeFilter}
                onChange={(e) => setActivityTypeFilter(e.target.value)}
                className={clsx(
                  'flex-1 px-4 py-2 border rounded-lg transition-all duration-200',
                  'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
                  'dark:bg-gray-700 dark:text-white dark:border-gray-600',
                  'border-gray-300 hover:border-gray-400 dark:hover:border-gray-500'
                )}
              >
                <option value="">Todos los tipos</option>
                {Object.entries(activityTypeLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </Card>
        </FadeIn>

        <FadeIn delay={0.3}>
          <Card padding="none">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Título
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Tipo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Creador ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Visibilidad
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Créditos
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Fecha
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {activities?.map((activity) => (
                    <tr key={activity.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        #{activity.id}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100 max-w-xs">
                        <div className="truncate" title={activity.title}>
                          {activity.title}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant={getActivityTypeBadgeColor(activity.activity_type)}>
                          {activityTypeLabels[activity.activity_type] || activity.activity_type}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        #{activity.creator_id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant={activity.is_public ? 'success' : 'default'}>
                          {activity.is_public ? 'Pública' : 'Privada'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className="font-semibold text-primary-600 dark:text-primary-400">
                          {activity.credits_used}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {new Date(activity.created_at).toLocaleDateString('es-ES', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex gap-2">
                          <Link href={`/activity/${activity.id}`}>
                            <Button variant="outline" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleDeleteActivity(activity)}
                            isLoading={deleteActivityMutation.isPending}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {activities?.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-500 dark:text-gray-400">
                    {activityTypeFilter
                      ? 'No se encontraron actividades con este filtro'
                      : 'No hay actividades registradas'}
                  </p>
                </div>
              )}
            </div>
          </Card>
        </FadeIn>

        {/* Stats Summary */}
        <FadeIn delay={0.4}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card padding="md" className="bg-gradient-to-br from-blue-50 to-white dark:from-blue-900/20 dark:to-gray-800">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total de Actividades</p>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{activities?.length || 0}</p>
            </Card>

            <Card padding="md" className="bg-gradient-to-br from-green-50 to-white dark:from-green-900/20 dark:to-gray-800">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Actividades Públicas</p>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                {activities?.filter((a) => a.is_public).length || 0}
              </p>
            </Card>

            <Card padding="md" className="bg-gradient-to-br from-purple-50 to-white dark:from-purple-900/20 dark:to-gray-800">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Créditos Totales Usados</p>
              <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                {activities?.reduce((sum, a) => sum + a.credits_used, 0) || 0}
              </p>
            </Card>
          </div>
        </FadeIn>
      </div>
    </PageTransition>
  );
}
