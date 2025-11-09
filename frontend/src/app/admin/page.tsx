'use client';

import { useQuery } from '@tanstack/react-query';
import { adminAPI } from '@/lib/api';
import { Card } from '@/components/ui';
import Spinner from '@/components/ui/Spinner';
import PageTransition, { FadeIn } from '@/components/PageTransition';
import {
  Users,
  FileText,
  CreditCard,
  TrendingUp,
  Plus,
} from 'lucide-react';
import { clsx } from 'clsx';

export default function AdminDashboardPage() {
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: adminAPI.getStats,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card padding="lg" className="max-w-md text-center">
          <p className="text-red-600 dark:text-red-400 font-semibold mb-2">Error al cargar estadísticas</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {error instanceof Error ? error.message : 'Error desconocido'}
          </p>
        </Card>
      </div>
    );
  }

  const statsCards = [
    {
      title: 'Total de Usuarios',
      value: stats?.total_users || 0,
      icon: Users,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      textColor: 'text-blue-700 dark:text-blue-300',
      iconColor: 'text-blue-500',
    },
    {
      title: 'Total de Actividades',
      value: stats?.total_activities || 0,
      icon: FileText,
      color: 'bg-green-500',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      textColor: 'text-green-700 dark:text-green-300',
      iconColor: 'text-green-500',
    },
    {
      title: 'Créditos Utilizados',
      value: stats?.total_credits_used || 0,
      icon: CreditCard,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      textColor: 'text-purple-700 dark:text-purple-300',
      iconColor: 'text-purple-500',
    },
    {
      title: 'Usuarios Activos Hoy',
      value: stats?.active_users_today || 0,
      icon: TrendingUp,
      color: 'bg-orange-500',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
      textColor: 'text-orange-700 dark:text-orange-300',
      iconColor: 'text-orange-500',
    },
    {
      title: 'Actividades Creadas Hoy',
      value: stats?.activities_created_today || 0,
      icon: Plus,
      color: 'bg-pink-500',
      bgColor: 'bg-pink-50 dark:bg-pink-900/20',
      textColor: 'text-pink-700 dark:text-pink-300',
      iconColor: 'text-pink-500',
    },
  ];

  return (
    <PageTransition>
      <div className="space-y-6">
        <FadeIn delay={0.1}>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-400">Vista general del sistema</p>
          </div>
        </FadeIn>

        <FadeIn delay={0.2}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {statsCards.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Card
                  key={stat.title}
                  variant="elevated"
                  padding="lg"
                  hover
                  className={clsx(
                    'border-t-4 transition-all duration-300',
                    stat.color.replace('bg-', 'border-')
                  )}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                        {stat.title}
                      </p>
                      <p className={clsx('text-3xl font-bold', stat.textColor)}>
                        {stat.value.toLocaleString()}
                      </p>
                    </div>
                    <div className={clsx('p-3 rounded-lg', stat.bgColor)}>
                      <Icon className={clsx('w-6 h-6', stat.iconColor)} />
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className={clsx('text-xs font-medium', stat.textColor)}>
                      {index < 3 ? 'Total acumulado' : 'Últimas 24 horas'}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </FadeIn>

        <FadeIn delay={0.3}>
          <Card padding="lg">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Información del Sistema</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-3 border-b border-gray-200 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400">Promedio de créditos por usuario</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {stats?.total_users ? Math.round(stats.total_credits_used / stats.total_users) : 0}
                </span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-gray-200 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400">Actividades por usuario</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {stats?.total_users ? (stats.total_activities / stats.total_users).toFixed(2) : 0}
                </span>
              </div>
              <div className="flex justify-between items-center py-3">
                <span className="text-gray-600 dark:text-gray-400">Tasa de usuarios activos hoy</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {stats?.total_users ? Math.round((stats.active_users_today / stats.total_users) * 100) : 0}%
                </span>
              </div>
            </div>
          </Card>
        </FadeIn>
      </div>
    </PageTransition>
  );
}
