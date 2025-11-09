'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { useQuery } from '@tanstack/react-query';
import { authAPI, activitiesAPI } from '@/lib/api';
import Link from 'next/link';
import {
  BookOpen,
  FileText,
  PenTool,
  FileCheck,
  Edit3,
  Presentation,
  Mail,
  FileQuestion,
  Bot,
  BookMarked,
  Grid3x3,
  Search,
  LogOut,
  CreditCard,
  ArrowRight,
  Sparkles,
  Shield,
} from 'lucide-react';
import { activityTypeLabels } from '@/lib/utils';
import { Button, Card, Badge } from '@/components/ui';
import { CardSkeleton } from '@/components/ui/LoadingSkeleton';
import ThemeToggle from '@/components/ThemeToggle';
import PageTransition, { FadeIn, SlideIn, Stagger } from '@/components/PageTransition';

const activityIcons: Record<string, any> = {
  exam: FileQuestion,
  summary: FileText,
  class_activity: BookOpen,
  rubric: FileCheck,
  writing_correction: Edit3,
  slides: Presentation,
  email: Mail,
  survey: PenTool,
  chatbot: Bot,
  story: BookMarked,
  crossword: Grid3x3,
  word_search: Search,
};

export default function DashboardPage() {
  const router = useRouter();
  const { user, clearAuth } = useAuthStore();

  const { data: credits } = useQuery({
    queryKey: ['credits'],
    queryFn: authAPI.getCredits,
    refetchInterval: 30000, // Refrescar cada 30 segundos
  });

  const { data: myActivities } = useQuery({
    queryKey: ['my-activities'],
    queryFn: () => activitiesAPI.getMy({ limit: 5 }),
  });

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  if (!user) {
    return null;
  }

  const handleLogout = async () => {
    try {
      // Llamar al endpoint de logout para borrar la cookie httpOnly
      await authAPI.logout();
    } catch (error) {
      console.error('Error al cerrar sesión en el servidor:', error);
      // Continuar con logout local aunque falle el servidor
    } finally {
      // Limpiar estado local
      clearAuth();
      // Redirigir a login
      router.push('/login');
    }
  };

  const contentTypes = [
    { type: 'exam', label: 'Exámenes', icon: FileQuestion, color: 'bg-blue-500' },
    { type: 'summary', label: 'Resúmenes', icon: FileText, color: 'bg-green-500' },
    { type: 'class_activity', label: 'Actividades', icon: BookOpen, color: 'bg-purple-500' },
    { type: 'rubric', label: 'Rúbricas', icon: FileCheck, color: 'bg-orange-500' },
    { type: 'writing_correction', label: 'Corrección', icon: Edit3, color: 'bg-red-500' },
    { type: 'slides', label: 'Diapositivas', icon: Presentation, color: 'bg-indigo-500' },
    { type: 'email', label: 'Correos', icon: Mail, color: 'bg-pink-500' },
    { type: 'survey', label: 'Encuestas', icon: PenTool, color: 'bg-teal-500' },
  ];

  const gameTypes = [
    { type: 'story', label: 'Cuentos', icon: BookMarked, color: 'bg-yellow-500' },
    { type: 'crossword', label: 'Crucigramas', icon: Grid3x3, color: 'bg-cyan-500' },
    { type: 'word_search', label: 'Sopa de Letras', icon: Search, color: 'bg-lime-500' },
  ];

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-primary-500 to-blue-600 p-2 rounded-lg">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-blue-600 bg-clip-text text-transparent dark:from-primary-400 dark:to-blue-400">
                  Plataforma Educativa
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-300">Bienvenido, {user.full_name || user.username}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-gradient-to-r from-primary-50 to-blue-50 dark:from-primary-900/30 dark:to-blue-900/30 px-4 py-2 rounded-lg border border-primary-200 dark:border-primary-700">
                <CreditCard className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                <span className="font-semibold text-primary-900 dark:text-primary-100">
                  {credits?.current_balance || user.credits}
                </span>
                <span className="text-sm text-primary-600 dark:text-primary-400">créditos</span>
              </div>
              {user.role === 'admin' && (
                <Link href="/admin">
                  <Button
                    variant="primary"
                    size="md"
                    className="!bg-gradient-to-r !from-purple-500 !to-indigo-600 hover:!from-purple-600 hover:!to-indigo-700"
                  >
                    <Shield className="w-5 h-5 mr-2" />
                    Panel Admin
                  </Button>
                </Link>
              )}
              <ThemeToggle />
              <Button
                onClick={handleLogout}
                variant="ghost"
                size="md"
              >
                <LogOut className="w-5 h-5 mr-2" />
                Salir
              </Button>
            </div>
          </div>
        </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Stats */}
          <FadeIn delay={0.1}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <Card variant="elevated" padding="lg" hover className="bg-gradient-to-br from-primary-50 to-white dark:from-primary-900/20 dark:to-gray-800 border-t-4 border-primary-500">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200">Créditos Disponibles</h3>
              <CreditCard className="w-8 h-8 text-primary-500" />
            </div>
            <p className="text-4xl font-bold text-primary-600 dark:text-primary-400 mb-2">
              {credits?.current_balance || user.credits}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-1">
              <Sparkles className="w-4 h-4" />
              Usa Ollama para generar contenido gratis
            </p>
          </Card>

          <Card variant="elevated" padding="lg" hover className="bg-gradient-to-br from-blue-50 to-white dark:from-blue-900/20 dark:to-gray-800 border-t-4 border-blue-500">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200">Mis Actividades</h3>
              <FileText className="w-8 h-8 text-blue-500" />
            </div>
            <p className="text-4xl font-bold text-gray-900 dark:text-white mb-2">{myActivities?.length || 0}</p>
            <Link href="/activities" className="text-sm text-primary-600 hover:text-primary-700 inline-flex items-center gap-1 group">
              Ver todas
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Card>

          <Card variant="elevated" padding="lg" hover className="bg-gradient-to-br from-purple-50 to-white dark:from-purple-900/20 dark:to-gray-800 border-t-4 border-purple-500">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200">Rol</h3>
              <Badge variant="primary" size="lg">{user.role}</Badge>
            </div>
            <p className="text-xl font-semibold text-gray-900 dark:text-white capitalize mb-2">{user.role}</p>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {user.role === 'docente' ? 'Puedes crear y compartir actividades' : 'Acceso a actividades públicas'}
            </p>
              </Card>
            </div>
          </FadeIn>

          {/* Herramientas Educativas */}
          <SlideIn direction="up" delay={0.2}>
            <section className="mb-10">
          <div className="flex items-center gap-2 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Herramientas Educativas</h2>
            <Badge variant="info">8 disponibles</Badge>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {contentTypes.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.type}
                  href={`/create/${item.type}`}
                  className="group"
                >
                  <Card
                    variant="default"
                    padding="md"
                    hover
                    className="h-full border-2 border-transparent group-hover:border-primary-300 transition-all"
                  >
                    <div className={`${item.color} w-14 h-14 rounded-xl flex items-center justify-center mb-4 shadow-md group-hover:scale-110 transition-transform`}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                      {item.label}
                    </h3>
                  </Card>
                </Link>
              );
              })}
            </div>
          </section>
        </SlideIn>

        {/* Juegos Educativos */}
        <SlideIn direction="up" delay={0.3}>
          <section className="mb-10">
          <div className="flex items-center gap-2 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Juegos Educativos</h2>
            <Badge variant="success">3 disponibles</Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {gameTypes.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.type}
                  href={`/create/${item.type}`}
                  className="group"
                >
                  <Card
                    variant="default"
                    padding="md"
                    hover
                    className="h-full border-2 border-transparent group-hover:border-green-300 transition-all"
                  >
                    <div className={`${item.color} w-14 h-14 rounded-xl flex items-center justify-center mb-4 shadow-md group-hover:scale-110 transition-transform`}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                      {item.label}
                    </h3>
                  </Card>
                </Link>
              );
              })}
            </div>
          </section>
        </SlideIn>

          {/* Actividades Recientes */}
          {myActivities && myActivities.length > 0 && (
            <SlideIn direction="up" delay={0.4}>
              <section>
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Actividades Recientes</h2>
                <Badge variant="default">{myActivities.length}</Badge>
              </div>
              <Link href="/activities" className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 inline-flex items-center gap-1 group">
                Ver todas
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            <div className="space-y-3">
              {myActivities.map((activity) => {
                const Icon = activityIcons[activity.activity_type];
                return (
                  <Card
                    key={activity.id}
                    variant="default"
                    padding="md"
                    className="hover:shadow-lg transition-all border border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-500"
                  >
                    <div className="flex items-center gap-4">
                      {Icon && (
                        <div className="bg-gradient-to-br from-primary-100 to-blue-100 dark:from-primary-900/40 dark:to-blue-900/40 w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
                          <Icon className="w-7 h-7 text-primary-600 dark:text-primary-400" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-1 truncate">{activity.title}</h3>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="primary" size="sm">
                            {activityTypeLabels[activity.activity_type]}
                          </Badge>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(activity.created_at).toLocaleDateString('es-ES', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric'
                            })}
                          </span>
                        </div>
                      </div>
                      <Link href={`/activity/${activity.id}`}>
                        <Button variant="primary" size="sm">
                          Ver detalles
                        </Button>
                      </Link>
                    </div>
                  </Card>
                );
                })}
              </div>
            </section>
          </SlideIn>
          )}
        </main>
      </div>
    </PageTransition>
  );
}
