'use client';

import { useQuery } from '@tanstack/react-query';
import { activitiesAPI } from '@/lib/api';
import { User, Mail, Shield, Calendar, CreditCard, Activity, TrendingUp, Award } from 'lucide-react';
import { Card, Badge } from '@/components/ui';
import DashboardLayout from '@/components/DashboardLayout';
import PageTransition, { FadeIn, SlideIn } from '@/components/PageTransition';
import { useAuthStore } from '@/lib/store';
import { activityTypeLabels } from '@/lib/utils';

export default function ProfilePage() {
  const user = useAuthStore(state => state.user);

  const { data: activities } = useQuery({
    queryKey: ['my-activities'],
    queryFn: () => activitiesAPI.getMy(),
  });

  // Calcular estadísticas
  const totalActivities = activities?.length || 0;
  const totalCreditsUsed = activities?.reduce((sum, act) => sum + act.credits_used, 0) || 0;
  const publicActivities = activities?.filter(act => act.is_public).length || 0;

  // Tipos de actividades más creados
  const activityTypeCounts = activities?.reduce((acc, act) => {
    acc[act.activity_type] = (acc[act.activity_type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  const topActivityType = Object.entries(activityTypeCounts)
    .sort(([, a], [, b]) => b - a)[0];

  // Calcular días desde el registro
  const daysSinceRegistration = user?.created_at
    ? Math.floor((Date.now() - new Date(user.created_at).getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  const roleLabels = {
    admin: 'Administrador',
    docente: 'Docente',
    estudiante: 'Estudiante',
  };

  if (!user) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-gray-600 dark:text-gray-400">Cargando perfil...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <PageTransition>
        <div className="space-y-8">
          {/* Header */}
          <FadeIn delay={0.1}>
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl shadow-lg">
                    <User className="w-7 h-7 text-white" />
                  </div>
                  <h1 className="text-4xl font-extrabold bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-600 bg-clip-text text-transparent dark:from-blue-400 dark:via-cyan-400 dark:to-blue-400">
                    Mi Perfil
                  </h1>
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-lg ml-16">
                  Información de tu cuenta y estadísticas
                </p>
              </div>
              <Badge
                className={`text-lg px-4 py-2 shadow-lg ${
                  user.role === 'admin'
                    ? '!bg-gradient-to-r !from-purple-500 !to-indigo-600 !text-white'
                    : user.role === 'docente'
                    ? '!bg-gradient-to-r !from-blue-500 !to-cyan-600 !text-white'
                    : '!bg-gradient-to-r !from-green-500 !to-emerald-600 !text-white'
                }`}
              >
                {roleLabels[user.role as keyof typeof roleLabels] || user.role}
              </Badge>
            </div>
          </FadeIn>

          {/* User Info Card */}
          <FadeIn delay={0.15}>
            <Card variant="glass" padding="lg">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl shadow-lg">
                  <User className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Información Personal
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                    <User className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">
                      Nombre de Usuario
                    </p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {user.username}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                    <Mail className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">
                      Correo Electrónico
                    </p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white break-all">
                      {user.email}
                    </p>
                  </div>
                </div>

                {user.full_name && (
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-xl">
                      <User className="w-6 h-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">
                        Nombre Completo
                      </p>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">
                        {user.full_name}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-4">
                  <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-xl">
                    <Shield className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">
                      Rol
                    </p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {roleLabels[user.role as keyof typeof roleLabels] || user.role}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-3 bg-cyan-50 dark:bg-cyan-900/20 rounded-xl">
                    <Calendar className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">
                      Miembro desde
                    </p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {new Date(user.created_at).toLocaleDateString('es-ES', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Hace {daysSinceRegistration} días
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl">
                    <CreditCard className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">
                      Créditos Disponibles
                    </p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {user.credits.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </FadeIn>

          {/* Statistics */}
          <SlideIn direction="up" delay={0.2}>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                Estadísticas de Uso
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card variant="glass" padding="lg" hover className="group">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">
                        Total de Actividades
                      </p>
                      <p className="text-4xl font-extrabold text-gray-900 dark:text-white">
                        {totalActivities}
                      </p>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl shadow-lg group-hover:scale-110 transition-transform">
                      <Activity className="w-7 h-7 text-white" />
                    </div>
                  </div>
                </Card>

                <Card variant="glass" padding="lg" hover className="group">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">
                        Créditos Utilizados
                      </p>
                      <p className="text-4xl font-extrabold text-gray-900 dark:text-white">
                        {totalCreditsUsed}
                      </p>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl shadow-lg group-hover:scale-110 transition-transform">
                      <CreditCard className="w-7 h-7 text-white" />
                    </div>
                  </div>
                </Card>

                <Card variant="glass" padding="lg" hover className="group">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">
                        Actividades Públicas
                      </p>
                      <p className="text-4xl font-extrabold text-gray-900 dark:text-white">
                        {publicActivities}
                      </p>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-lg group-hover:scale-110 transition-transform">
                      <Award className="w-7 h-7 text-white" />
                    </div>
                  </div>
                </Card>

                <Card variant="glass" padding="lg" hover className="group">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">
                        Promedio por Día
                      </p>
                      <p className="text-4xl font-extrabold text-gray-900 dark:text-white">
                        {daysSinceRegistration > 0
                          ? (totalActivities / daysSinceRegistration).toFixed(1)
                          : '0'}
                      </p>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl shadow-lg group-hover:scale-110 transition-transform">
                      <TrendingUp className="w-7 h-7 text-white" />
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </SlideIn>

          {/* Top Activity Type */}
          {topActivityType && (
            <SlideIn direction="up" delay={0.25}>
              <Card variant="glass" padding="lg">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl shadow-lg">
                    <Award className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Tu Actividad Favorita
                  </h2>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-lg text-gray-600 dark:text-gray-400 mb-2">
                      Has creado más actividades de tipo:
                    </p>
                    <p className="text-3xl font-extrabold bg-gradient-to-r from-pink-600 via-rose-600 to-pink-600 bg-clip-text text-transparent dark:from-pink-400 dark:via-rose-400 dark:to-pink-400">
                      {activityTypeLabels[topActivityType[0]]}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-5xl font-extrabold text-gray-900 dark:text-white mb-2">
                      {topActivityType[1]}
                    </p>
                    <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                      veces
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
