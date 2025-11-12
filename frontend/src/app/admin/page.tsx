'use client';

import { useQuery } from '@tanstack/react-query';
import { adminAPI } from '@/lib/api';
import { Card, Badge } from '@/components/ui';
import Spinner from '@/components/ui/Spinner';
import DashboardLayout from '@/components/DashboardLayout';
import PageTransition, { FadeIn, SlideIn } from '@/components/PageTransition';
import Link from 'next/link';
import {
  Users,
  FileText,
  CreditCard,
  TrendingUp,
  Plus,
  Shield,
  Activity,
  UserCheck,
  Zap,
} from 'lucide-react';

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
    <DashboardLayout>
      <PageTransition>
        <div className="space-y-8">
          {/* Header */}
          <FadeIn delay={0.1}>
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-3 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl shadow-lg">
                    <Shield className="w-7 h-7 text-white" />
                  </div>
                  <h1 className="text-4xl font-extrabold bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent dark:from-purple-400 dark:via-indigo-400 dark:to-purple-400">
                    Panel de Administración
                  </h1>
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-lg ml-16">
                  Vista general del sistema y gestión de usuarios
                </p>
              </div>
              <Badge className="!bg-gradient-to-r !from-purple-500 !to-indigo-600 !text-white shadow-lg text-lg px-4 py-2">
                Admin
              </Badge>
            </div>
          </FadeIn>

          {/* Stats Cards */}
          <FadeIn delay={0.15}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {statsCards.map((stat, index) => {
                const Icon = stat.icon;
                const gradientColors = [
                  'from-blue-500 to-cyan-600',
                  'from-green-500 to-emerald-600',
                  'from-purple-500 to-pink-600',
                  'from-orange-500 to-red-600',
                  'from-pink-500 to-rose-600',
                ];
                return (
                  <Card
                    key={stat.title}
                    variant="glass"
                    padding="lg"
                    hover
                    className="group relative overflow-hidden"
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${gradientColors[index]} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                    <div className="relative">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">
                            {stat.title}
                          </p>
                          <p className="text-4xl font-extrabold text-gray-900 dark:text-white">
                            {stat.value.toLocaleString()}
                          </p>
                        </div>
                        <div className={`p-4 bg-gradient-to-br ${gradientColors[index]} rounded-2xl shadow-lg group-hover:scale-110 transition-transform`}>
                          <Icon className="w-7 h-7 text-white" />
                        </div>
                      </div>
                      <div className="mt-4 pt-4 border-t border-white/20 dark:border-gray-700/30">
                        <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                          {index < 3 ? '📊 Total acumulado' : '⚡ Últimas 24 horas'}
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </FadeIn>

          {/* System Information */}
          <SlideIn direction="up" delay={0.2}>
            <Card variant="glass" padding="lg">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-gradient-to-br from-primary-500 to-blue-600 rounded-xl shadow-lg">
                  <Activity className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Métricas del Sistema
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-white/50 dark:bg-gray-800/50">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Créditos por Usuario
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats?.total_users ? Math.round(stats.total_credits_used / stats.total_users) : 0}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-white/50 dark:bg-gray-800/50">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Actividades por Usuario
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats?.total_users ? (stats.total_activities / stats.total_users).toFixed(2) : 0}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-white/50 dark:bg-gray-800/50">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Tasa de Actividad Hoy
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats?.total_users ? Math.round((stats.active_users_today / stats.total_users) * 100) : 0}%
                  </p>
                </div>
              </div>
            </Card>
          </SlideIn>

          {/* Quick Links */}
          <SlideIn direction="up" delay={0.3}>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <Zap className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                Acceso Rápido
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link href="/admin/users">
                  <Card variant="glass" padding="lg" hover className="h-full group">
                    <div className="flex items-center gap-4">
                      <div className="p-4 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl shadow-lg group-hover:scale-110 transition-transform">
                        <Users className="w-7 h-7 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-1">
                          Gestionar Usuarios
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Ver, editar y administrar usuarios del sistema
                        </p>
                      </div>
                    </div>
                  </Card>
                </Link>

                <Link href="/admin/activities">
                  <Card variant="glass" padding="lg" hover className="h-full group">
                    <div className="flex items-center gap-4">
                      <div className="p-4 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-lg group-hover:scale-110 transition-transform">
                        <FileText className="w-7 h-7 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-1">
                          Todas las Actividades
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Revisar y moderar todas las actividades
                        </p>
                      </div>
                    </div>
                  </Card>
                </Link>
              </div>
            </div>
          </SlideIn>
        </div>
      </PageTransition>
    </DashboardLayout>
  );
}
