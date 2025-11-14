'use client';

import { useQuery } from '@tanstack/react-query';
import { activitiesAPI } from '@/lib/api';
import Link from 'next/link';
import { Eye, Users, FileText, Calendar, BookOpen, Filter, Share2 } from 'lucide-react';
import { activityTypeLabels, aiProviderLabels } from '@/lib/utils';
import { Button, Card, Badge } from '@/components/ui';
import DashboardLayout from '@/components/DashboardLayout';
import PageTransition, { SlideIn, FadeIn } from '@/components/PageTransition';
import { useState } from 'react';

export default function CommunityPage() {
  const [filterType, setFilterType] = useState<string | null>(null);

  const { data: activities, isLoading } = useQuery({
    queryKey: ['public-activities'],
    queryFn: () => activitiesAPI.getAll({ is_public: true }),
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

  return (
    <DashboardLayout>
      <PageTransition>
        <div className="space-y-8">
          {/* Header */}
          <FadeIn delay={0.1}>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 sm:gap-3 mb-2">
                  <div className="p-2 sm:p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-lg flex-shrink-0">
                    <Users className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                  </div>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold bg-gradient-to-r from-green-600 via-emerald-600 to-green-600 bg-clip-text text-transparent dark:from-green-400 dark:via-emerald-400 dark:to-green-400">
                    Comunidad
                  </h1>
                  {!isLoading && filteredActivities && (
                    <Badge className="!bg-gradient-to-r !from-green-600 !to-emerald-600 !text-white shadow-lg text-sm sm:text-base lg:text-lg px-2 sm:px-3 lg:px-4 py-1 sm:py-1.5 lg:py-2 flex-shrink-0">
                      {filteredActivities.length}
                    </Badge>
                  )}
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base lg:text-lg sm:ml-11 lg:ml-16">
                  Descubre y explora actividades compartidas por otros educadores
                </p>
              </div>
            </div>
          </FadeIn>

          {/* Filtros */}
          {activityTypes.length > 0 && (
            <FadeIn delay={0.15}>
              <Card variant="glass" padding="md">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-wrap">
                  <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300 font-semibold text-sm sm:text-base flex-shrink-0">
                    <Filter className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span>Filtrar:</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
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
                </div>
              </Card>
            </FadeIn>
          )}

          {/* Activities List */}
          {isLoading ? (
            <FadeIn delay={0.2}>
              <div className="grid gap-4">
                {[1, 2, 3, 4].map((i) => (
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
          ) : filteredActivities && filteredActivities.length > 0 ? (
            <FadeIn delay={0.2}>
              <div className="grid gap-5">
                {filteredActivities.map((activity) => (
                  <Card
                    key={activity.id}
                    variant="glass"
                    padding="lg"
                    hover
                    className="group"
                  >
                    <div className="flex items-start justify-between gap-6">
                      <div className="flex gap-4 flex-1">
                        {/* Icon Badge */}
                        <div className="flex-shrink-0">
                          <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition-transform">
                            <Share2 className="w-10 h-10" />
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
                            <Badge className="!bg-gradient-to-r !from-green-500 !to-emerald-600 !text-white">
                              <Share2 className="w-3 h-3 mr-1" />
                              Compartido
                            </Badge>
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
                              <span>{new Date(activity.created_at).toLocaleDateString('es-ES', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric'
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
                            Ver Actividad
                          </Button>
                        </Link>
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
                  <Users className="w-20 h-20 text-gray-400 mx-auto mb-6" />
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                    {filterType
                      ? 'No hay actividades públicas de este tipo'
                      : 'Aún no hay actividades compartidas'
                    }
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6 text-lg">
                    {filterType
                      ? 'Prueba cambiando el filtro para ver otras actividades'
                      : 'Sé el primero en compartir una actividad con la comunidad'
                    }
                  </p>
                  {!filterType && (
                    <Link href="/activities">
                      <Button variant="primary" size="lg">
                        <FileText className="w-5 h-5 mr-2" />
                        Ir a Mis Actividades
                      </Button>
                    </Link>
                  )}
                </div>
              </Card>
            </FadeIn>
          )}

          {/* Info Banner */}
          {!isLoading && filteredActivities && filteredActivities.length > 0 && (
            <SlideIn direction="up" delay={0.3}>
              <Card variant="glass" padding="md" className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-500 rounded-lg">
                    <Share2 className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      <span className="font-bold">Tip:</span> Puedes hacer tus propias actividades públicas desde la página de
                      <Link href="/activities" className="text-green-600 dark:text-green-400 font-semibold hover:underline ml-1">
                        Mis Actividades
                      </Link>
                    </p>
                  </div>
                </div>
              </Card>
            </SlideIn>
          )}
        </div>
      </PageTransition>
    </DashboardLayout>
  );
}
