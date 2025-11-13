'use client';

import { useQuery } from '@tanstack/react-query';
import { activitiesAPI } from '@/lib/api';
import Link from 'next/link';
import { Eye, Clock, FileText, Calendar, BookOpen, Filter } from 'lucide-react';
import { activityTypeLabels, aiProviderLabels } from '@/lib/utils';
import { Button, Card, Badge } from '@/components/ui';
import DashboardLayout from '@/components/DashboardLayout';
import PageTransition, { SlideIn, FadeIn } from '@/components/PageTransition';
import { useState } from 'react';
import type { Activity } from '@/types';

export default function HistoryPage() {
  const [filterType, setFilterType] = useState<string | null>(null);

  const { data: activities, isLoading } = useQuery({
    queryKey: ['my-activities'],
    queryFn: () => activitiesAPI.getMy(),
  });

  // Ordenar actividades por fecha (más recientes primero)
  const sortedActivities = activities
    ? [...activities].sort((a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
    : [];

  // Filtrar por tipo si hay un filtro activo
  const filteredActivities = filterType
    ? sortedActivities.filter(activity => activity.activity_type === filterType)
    : sortedActivities;

  // Obtener tipos únicos para los filtros
  const activityTypes = activities
    ? Array.from(new Set(activities.map(a => a.activity_type)))
    : [];

  // Agrupar actividades por mes
  const groupedActivities = filteredActivities.reduce((acc, activity) => {
    const date = new Date(activity.created_at);
    const monthYear = date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });

    if (!acc[monthYear]) {
      acc[monthYear] = [];
    }
    acc[monthYear].push(activity);
    return acc;
  }, {} as Record<string, Activity[]>);

  return (
    <DashboardLayout>
      <PageTransition>
        <div className="space-y-8">
          {/* Header */}
          <FadeIn delay={0.1}>
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-3 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl shadow-lg">
                    <Clock className="w-7 h-7 text-white" />
                  </div>
                  <h1 className="text-4xl font-extrabold bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent dark:from-purple-400 dark:via-indigo-400 dark:to-purple-400">
                    Historial
                  </h1>
                  {!isLoading && filteredActivities && (
                    <Badge className="!bg-gradient-to-r !from-purple-600 !to-indigo-600 !text-white shadow-lg text-lg px-4 py-2">
                      {filteredActivities.length}
                    </Badge>
                  )}
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-lg ml-16">
                  Revisa tu historial de actividades creadas
                </p>
              </div>
            </div>
          </FadeIn>

          {/* Filtros */}
          {activityTypes.length > 0 && (
            <FadeIn delay={0.15}>
              <Card variant="glass" padding="md">
                <div className="flex items-center gap-3 flex-wrap">
                  <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300 font-semibold">
                    <Filter className="w-5 h-5" />
                    <span>Filtrar:</span>
                  </div>
                  <Button
                    variant={filterType === null ? 'primary' : 'secondary'}
                    size="sm"
                    onClick={() => setFilterType(null)}
                  >
                    Todas
                  </Button>
                  {activityTypes.map((type) => (
                    <Button
                      key={type}
                      variant={filterType === type ? 'primary' : 'secondary'}
                      size="sm"
                      onClick={() => setFilterType(type)}
                    >
                      {activityTypeLabels[type]}
                    </Button>
                  ))}
                </div>
              </Card>
            </FadeIn>
          )}

          {/* Activities List Grouped by Month */}
          {isLoading ? (
            <FadeIn delay={0.2}>
              <div className="grid gap-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i} variant="glass" padding="lg" className="animate-pulse">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-gray-300 dark:bg-gray-700 rounded-xl" />
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
          ) : Object.keys(groupedActivities).length > 0 ? (
            <div className="space-y-8">
              {Object.entries(groupedActivities).map(([monthYear, monthActivities], index) => (
                <FadeIn key={monthYear} delay={0.2 + index * 0.05}>
                  <div className="space-y-4">
                    {/* Month Header */}
                    <div className="flex items-center gap-3">
                      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-700 to-transparent" />
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white capitalize">
                        {monthYear}
                      </h2>
                      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-700 to-transparent" />
                    </div>

                    {/* Activities in this month */}
                    <div className="grid gap-4">
                      {monthActivities.map((activity) => (
                        <Card
                          key={activity.id}
                          variant="glass"
                          padding="lg"
                          hover
                          className="group"
                        >
                          <div className="flex items-start justify-between gap-6">
                            <div className="flex gap-4 flex-1">
                              {/* Date badge */}
                              <div className="flex-shrink-0">
                                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex flex-col items-center justify-center text-white shadow-lg">
                                  <div className="text-2xl font-bold">
                                    {new Date(activity.created_at).getDate()}
                                  </div>
                                  <div className="text-xs uppercase">
                                    {new Date(activity.created_at).toLocaleDateString('es-ES', { month: 'short' })}
                                  </div>
                                </div>
                              </div>

                              {/* Activity info */}
                              <div className="flex-1">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                                  {activity.title}
                                </h3>
                                <div className="flex flex-wrap gap-2 mb-3">
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
                                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 line-clamp-2">
                                    {activity.description}
                                  </p>
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
                                    <span>{new Date(activity.created_at).toLocaleTimeString('es-ES', {
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}</span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Action button */}
                            <div className="flex-shrink-0">
                              <Link href={`/activity/${activity.id}`}>
                                <Button variant="primary" size="sm">
                                  <Eye className="w-4 h-4 mr-2" />
                                  Ver Detalles
                                </Button>
                              </Link>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                </FadeIn>
              ))}
            </div>
          ) : (
            <FadeIn delay={0.2}>
              <Card variant="glass" padding="lg" className="text-center py-16">
                <div className="max-w-md mx-auto">
                  <Clock className="w-20 h-20 text-gray-400 mx-auto mb-6" />
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                    {filterType ? 'No hay actividades de este tipo' : 'No hay actividades en tu historial'}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6 text-lg">
                    {filterType
                      ? 'Prueba cambiando el filtro para ver otras actividades'
                      : 'Comienza creando tu primera actividad educativa con IA'
                    }
                  </p>
                  {!filterType && (
                    <Link href="/create">
                      <Button variant="primary" size="lg">
                        <FileText className="w-5 h-5 mr-2" />
                        Crear Actividad
                      </Button>
                    </Link>
                  )}
                </div>
              </Card>
            </FadeIn>
          )}
        </div>
      </PageTransition>
    </DashboardLayout>
  );
}
