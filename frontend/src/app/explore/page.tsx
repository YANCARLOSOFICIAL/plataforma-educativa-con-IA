'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { activitiesAPI } from '@/lib/api';
import Link from 'next/link';
import { Eye, FileText, Calendar, BookOpen, Filter, Share2, Users, ArrowLeft, LogIn } from 'lucide-react';
import { activityTypeLabels, aiProviderLabels } from '@/lib/utils';
import { Button, Card, Badge } from '@/components/ui';
import PageTransition, { SlideIn, FadeIn } from '@/components/PageTransition';
import { useAuthStore } from '@/lib/store';

export default function ExplorePage() {
  const [filterType, setFilterType] = useState<string | null>(null);
  const user = useAuthStore((state) => state.user);
  const isHydrated = useAuthStore((state) => state.isHydrated);
  const isLoggingOut = useAuthStore((state) => state.isLoggingOut);

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

  // Esperar a que el store se hidrate antes de renderizar
  if (!isHydrated || isLoggingOut) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // Forzar user a ser null si estamos después de logout
  const actualUser = isLoggingOut ? null : user;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Public Navigation */}
      <nav className="sticky top-0 z-50 backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 border-b border-white/20 dark:border-gray-700/30 shadow-glass">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center gap-2">
                <div className="p-2 bg-gradient-to-br from-primary-600 to-blue-600 rounded-xl shadow-lg">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-blue-600 bg-clip-text text-transparent">
                  EduAI
                </span>
              </Link>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              {!actualUser ? (
                <>
                  <Link href="/login">
                    <Button variant="outline" size="sm">
                      <LogIn className="w-4 h-4 sm:mr-2" />
                      <span className="hidden sm:inline">Entrar</span>
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button variant="primary" size="sm">
                      Registrarse
                    </Button>
                  </Link>
                </>
              ) : (
                <Link href="/dashboard">
                  <Button variant="primary" size="sm">
                    Ir al Dashboard
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      <PageTransition>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
          {/* Header */}
          <FadeIn delay={0.1}>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 sm:gap-3 mb-2">
                  <div className="p-2 sm:p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-lg flex-shrink-0">
                    <Users className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                  </div>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold bg-gradient-to-r from-green-600 via-emerald-600 to-green-600 bg-clip-text text-transparent dark:from-green-400 dark:via-emerald-400 dark:to-green-400">
                    Explora Recursos Públicos
                  </h1>
                  {!isLoading && filteredActivities && (
                    <Badge className="!bg-gradient-to-r !from-green-600 !to-emerald-600 !text-white shadow-lg text-sm sm:text-base lg:text-lg px-2 sm:px-3 lg:px-4 py-1 sm:py-1.5 lg:py-2 flex-shrink-0">
                      {filteredActivities.length}
                    </Badge>
                  )}
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base lg:text-lg sm:ml-11 lg:ml-16">
                  Descubre actividades compartidas por educadores de todo el mundo
                </p>
              </div>
            </div>
          </FadeIn>

          {/* Info Banner */}
          {!actualUser && (
            <FadeIn delay={0.15}>
              <Card variant="glass" padding="md" className="border-2 border-primary-300/50 dark:border-primary-500/30">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex-1">
                    <p className="text-gray-700 dark:text-gray-300 font-medium mb-1">
                      ¿Te gusta lo que ves?
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Regístrate gratis para crear tus propias actividades y acceder a todas las funcionalidades
                    </p>
                  </div>
                  <Link href="/register">
                    <Button variant="primary" size="sm" className="w-full sm:w-auto">
                      Crear Cuenta Gratis
                    </Button>
                  </Link>
                </div>
              </Card>
            </FadeIn>
          )}

          {/* Filtros */}
          {activityTypes.length > 0 && (
            <FadeIn delay={0.2}>
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
            <FadeIn delay={0.25}>
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
          ) : filteredActivities.length > 0 ? (
            <FadeIn delay={0.25}>
              <div className="grid gap-4 sm:gap-6">
                {filteredActivities.map((activity) => (
                  <Card
                    key={activity.id}
                    variant="glass"
                    padding="lg"
                    hover
                    className="group"
                  >
                    <div className="flex flex-col sm:flex-row items-start justify-between gap-4 sm:gap-6">
                      <div className="flex-1 w-full">
                        <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
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
                          <Badge variant="info" size="sm">
                            <Share2 className="w-3 h-3 mr-1" />
                            Público
                          </Badge>
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

                      <div className="w-full sm:w-auto">
                        {actualUser ? (
                          <Link href={`/activity/${activity.id}`} className="block">
                            <Button variant="primary" size="sm" className="w-full">
                              <Eye className="w-4 h-4 mr-2" />
                              Ver Actividad
                            </Button>
                          </Link>
                        ) : (
                          <Link href={`/activity/${activity.id}`} className="block">
                            <Button variant="primary" size="sm" className="w-full">
                              <Eye className="w-4 h-4 mr-2" />
                              Ver Actividad
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </FadeIn>
          ) : (
            <FadeIn delay={0.25}>
              <Card variant="glass" padding="lg" className="text-center">
                <FileText className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  No se encontraron actividades públicas
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  {filterType ? 'Intenta con otro filtro' : 'Aún no hay actividades compartidas públicamente'}
                </p>
                {filterType && (
                  <Button onClick={() => setFilterType(null)} variant="primary">
                    Ver Todas
                  </Button>
                )}
              </Card>
            </FadeIn>
          )}

          {/* CTA Banner */}
          {!actualUser && filteredActivities.length > 0 && (
            <FadeIn delay={0.3}>
              <Card variant="elevated" padding="none" className="overflow-hidden">
                <div className="bg-gradient-to-r from-primary-600 via-blue-600 to-purple-600 p-6 sm:p-8 lg:p-12 text-center">
                  <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4">
                    ¿Listo para crear tus propias actividades?
                  </h3>
                  <p className="text-base sm:text-lg text-white/90 mb-6 sm:mb-8 max-w-2xl mx-auto">
                    Regístrate gratis y comienza a generar contenido educativo con IA
                  </p>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link href="/register">
                      <Button
                        variant="secondary"
                        size="lg"
                        className="w-full sm:w-auto !bg-white !text-primary-600 hover:!bg-gray-100"
                      >
                        Crear Cuenta Gratis
                      </Button>
                    </Link>
                    <Link href="/login">
                      <Button
                        variant="outline"
                        size="lg"
                        className="w-full sm:w-auto !border-white !text-white hover:!bg-white/10"
                      >
                        Ya tengo cuenta
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            </FadeIn>
          )}
        </div>
      </PageTransition>
    </div>
  );
}
