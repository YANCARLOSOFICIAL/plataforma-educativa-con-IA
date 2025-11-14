'use client';

import { useAuthStore } from '@/lib/store';
import { useQuery } from '@tanstack/react-query';
import { authAPI, activitiesAPI, chatbotAPI } from '@/lib/api';
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
  ArrowRight,
  Sparkles,
  TrendingUp,
  Users,
  Zap,
  Target,
} from 'lucide-react';
import { activityTypeLabels } from '@/lib/utils';
import { Button, Card, Badge } from '@/components/ui';
import DashboardLayout from '@/components/DashboardLayout';
import PageTransition, { FadeIn, SlideIn } from '@/components/PageTransition';

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

// Dashboard para Estudiantes
function StudentDashboard() {
  const { user } = useAuthStore();

  const { data: credits } = useQuery({
    queryKey: ['credits'],
    queryFn: authAPI.getCredits,
    refetchInterval: 30000,
  });

  const { data: publicActivities, isLoading: loadingActivities } = useQuery({
    queryKey: ['public-activities-preview'],
    queryFn: () => activitiesAPI.getAll({ is_public: true, limit: 6 }),
  });

  const { data: chatbots, isLoading: loadingChatbots } = useQuery({
    queryKey: ['chatbots-preview'],
    queryFn: () => chatbotAPI.getMyChatbots(),
  });

  return (
    <DashboardLayout>
      <PageTransition>
        <div className="space-y-8">
          {/* Welcome Section */}
          <FadeIn delay={0.1}>
            <div className="relative overflow-hidden">
              <Card variant="gradient" padding="lg" className="border-0 shadow-2xl">
                <div className="relative z-10 flex items-center justify-between">
                  <div>
                    <h1 className="text-4xl font-extrabold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent dark:from-white dark:to-gray-300 mb-2">
                      ¡Hola, {user?.full_name || user?.username}! 👋
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 text-lg">
                      ¿Listo para aprender algo nuevo hoy?
                    </p>
                  </div>
                  <div className="hidden md:block">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-primary-400 to-purple-600 rounded-full blur-2xl opacity-50 animate-pulse" />
                      <BookOpen className="relative w-20 h-20 text-primary-600 dark:text-primary-400" />
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </FadeIn>

          {/* Quick Stats */}
          <FadeIn delay={0.15}>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
              <Card variant="glass" padding="md" className="group hover:shadow-xl transition-all">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 sm:p-3 bg-gradient-to-br from-primary-500 to-blue-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform flex-shrink-0">
                    <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                      {credits?.current_balance || user?.credits}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">Créditos</p>
                  </div>
                </div>
              </Card>

              <Card variant="glass" padding="md" className="group hover:shadow-xl transition-all">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 sm:p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform flex-shrink-0">
                    <Bot className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                      {chatbots?.length || 0}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">Tutores IA</p>
                  </div>
                </div>
              </Card>

              <Card variant="glass" padding="md" className="group hover:shadow-xl transition-all sm:col-span-2 md:col-span-1">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 sm:p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform flex-shrink-0">
                    <Users className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                      {publicActivities?.length || 0}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">Recursos</p>
                  </div>
                </div>
              </Card>
            </div>
          </FadeIn>

          {/* Quick Actions */}
          <SlideIn direction="up" delay={0.2}>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                Acceso Rápido
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link href="/chatbots">
                  <Card variant="glass" padding="lg" hover className="h-full group relative overflow-hidden">
                    <Badge className="absolute top-4 right-4 !bg-accent-500 !text-white">Tutor</Badge>
                    <div className="text-center">
                      <div className="inline-flex p-4 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl shadow-lg mb-4 group-hover:scale-110 transition-transform">
                        <Bot className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">
                        Chatbots IA
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Aprende con asistentes IA especializados
                      </p>
                    </div>
                  </Card>
                </Link>

                <Link href="/community">
                  <Card variant="glass" padding="lg" hover className="h-full group">
                    <div className="text-center">
                      <div className="inline-flex p-4 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-lg mb-4 group-hover:scale-110 transition-transform">
                        <Users className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">
                        Explorar Recursos
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Descubre materiales compartidos por docentes
                      </p>
                    </div>
                  </Card>
                </Link>
              </div>
            </div>
          </SlideIn>

          {/* Chatbots Disponibles */}
          <SlideIn direction="up" delay={0.3}>
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Bot className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  Tutores IA Disponibles
                </h2>
                <Link
                  href="/chatbots"
                  className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 inline-flex items-center gap-1 group font-semibold text-sm"
                >
                  Ver todos
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>

              {loadingChatbots ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[1, 2].map((i) => (
                    <Card key={i} variant="glass" padding="md" className="animate-pulse">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-gray-300 dark:bg-gray-700 rounded-xl" />
                        <div className="flex-1">
                          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2 mb-2" />
                          <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-3/4" />
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : chatbots && chatbots.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {chatbots.slice(0, 4).map((chatbot) => (
                    <Link key={chatbot.id} href={`/chatbots/${chatbot.id}/chat`}>
                      <Card variant="glass" padding="md" hover className="h-full group">
                        <div className="flex items-center gap-4">
                          <div className="bg-gradient-to-br from-purple-500 to-pink-600 w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                            <Bot className="w-7 h-7 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-base text-gray-900 dark:text-white mb-1 truncate group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                              {chatbot.name}
                            </h3>
                            <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-1">
                              {chatbot.description || 'Asistente IA especializado'}
                            </p>
                          </div>
                        </div>
                      </Card>
                    </Link>
                  ))}
                </div>
              ) : (
                <Card variant="glass" padding="lg" className="text-center">
                  <Bot className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                    No hay tutores IA disponibles
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Pronto habrá asistentes IA para ayudarte a aprender
                  </p>
                </Card>
              )}
            </div>
          </SlideIn>

          {/* Recursos Compartidos */}
          <SlideIn direction="up" delay={0.4}>
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Users className="w-6 h-6 text-green-600 dark:text-green-400" />
                  Recursos Compartidos
                </h2>
                <Link
                  href="/community"
                  className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 inline-flex items-center gap-1 group font-semibold text-sm"
                >
                  Ver todos
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>

              {loadingActivities ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <Card key={i} variant="glass" padding="md" className="animate-pulse">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-gray-300 dark:bg-gray-700 rounded-xl" />
                        <div className="flex-1">
                          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-2/3 mb-2" />
                          <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-1/3" />
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : publicActivities && publicActivities.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {publicActivities.slice(0, 6).map((activity) => {
                    const Icon = activityIcons[activity.activity_type];
                    return (
                      <Link key={activity.id} href={`/activity/${activity.id}`}>
                        <Card variant="glass" padding="md" hover className="h-full group">
                          <div className="flex items-center gap-4">
                            {Icon && (
                              <div className="bg-gradient-to-br from-green-500 to-emerald-600 w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                                <Icon className="w-7 h-7 text-white" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <h3 className="font-bold text-base text-gray-900 dark:text-white mb-1 truncate group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                                {activity.title}
                              </h3>
                              <Badge variant="success" size="sm">
                                {activityTypeLabels[activity.activity_type]}
                              </Badge>
                            </div>
                          </div>
                        </Card>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <Card variant="glass" padding="lg" className="text-center">
                  <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                    No hay recursos disponibles
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Los docentes compartirán recursos pronto
                  </p>
                </Card>
              )}
            </div>
          </SlideIn>
        </div>
      </PageTransition>
    </DashboardLayout>
  );
}

// Dashboard para Docentes/Admins
function TeacherDashboard() {
  const { user } = useAuthStore();

  const { data: credits } = useQuery({
    queryKey: ['credits'],
    queryFn: authAPI.getCredits,
    refetchInterval: 30000,
  });

  const { data: myActivities, isLoading } = useQuery({
    queryKey: ['my-activities'],
    queryFn: () => activitiesAPI.getMy({ limit: 6 }),
  });

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
    <DashboardLayout>
      <PageTransition>
        <div className="space-y-8">
          {/* Welcome Section */}
          <FadeIn delay={0.1}>
            <div className="relative overflow-hidden">
              <Card variant="gradient" padding="lg" className="border-0 shadow-2xl">
                <div className="relative z-10 flex items-center justify-between">
                  <div>
                    <h1 className="text-4xl font-extrabold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent dark:from-white dark:to-gray-300 mb-2">
                      ¡Hola, {user?.full_name || user?.username}! 👋
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 text-lg">
                      ¿Qué vamos a crear hoy?
                    </p>
                  </div>
                  <div className="hidden md:block">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-primary-400 to-purple-600 rounded-full blur-2xl opacity-50 animate-pulse" />
                      <Sparkles className="relative w-20 h-20 text-primary-600 dark:text-primary-400" />
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </FadeIn>
          {/* Quick Stats */}
          <FadeIn delay={0.15}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <Card variant="glass" padding="md" className="group hover:shadow-xl transition-all">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 sm:p-3 bg-gradient-to-br from-primary-500 to-blue-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform flex-shrink-0">
                    <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                      {credits?.current_balance || user?.credits}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">Créditos</p>
                  </div>
                </div>
              </Card>

              <Card variant="glass" padding="md" className="group hover:shadow-xl transition-all">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 sm:p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform flex-shrink-0">
                    <Target className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                      {myActivities?.length || 0}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">Actividades</p>
                  </div>
                </div>
              </Card>

              <Card variant="glass" padding="md" className="group hover:shadow-xl transition-all">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 sm:p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform flex-shrink-0">
                    <Bot className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">0</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">Chatbots</p>
                  </div>
                </div>
              </Card>

              <Card variant="glass" padding="md" className="group hover:shadow-xl transition-all">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 sm:p-3 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform flex-shrink-0">
                    <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">+15%</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">Esta semana</p>
                  </div>
                </div>
              </Card>
            </div>
          </FadeIn>

          {/* Quick Actions */}
          <SlideIn direction="up" delay={0.2}>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                Acciones Rápidas
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link href="/create">
                  <Card variant="glass" padding="lg" hover className="h-full group">
                    <div className="text-center">
                      <div className="inline-flex p-4 bg-gradient-to-br from-primary-500 to-blue-600 rounded-2xl shadow-lg mb-4 group-hover:scale-110 transition-transform">
                        <FileText className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">
                        Crear Actividad
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Genera exámenes, resúmenes y más con IA
                      </p>
                    </div>
                  </Card>
                </Link>

                <Link href="/chatbots">
                  <Card variant="glass" padding="lg" hover className="h-full group relative overflow-hidden">
                    <Badge className="absolute top-4 right-4 !bg-accent-500 !text-white">Nuevo</Badge>
                    <div className="text-center">
                      <div className="inline-flex p-4 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl shadow-lg mb-4 group-hover:scale-110 transition-transform">
                        <Bot className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">
                        Crear Chatbot
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Asistentes IA para diferentes áreas
                      </p>
                    </div>
                  </Card>
                </Link>

                <Link href="/activities">
                  <Card variant="glass" padding="lg" hover className="h-full group">
                    <div className="text-center">
                      <div className="inline-flex p-4 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-lg mb-4 group-hover:scale-110 transition-transform">
                        <BookOpen className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">
                        Mis Actividades
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Ver y gestionar todo tu contenido
                      </p>
                    </div>
                  </Card>
                </Link>
              </div>
            </div>
          </SlideIn>


          {/* Actividades Recientes */}
          <SlideIn direction="up" delay={0.3}>
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <FileText className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                  Actividades Recientes
                </h2>
                <Link
                  href="/activities"
                  className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 inline-flex items-center gap-1 group font-semibold text-sm"
                >
                  Ver todas
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>

              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Card key={i} variant="glass" padding="md" className="animate-pulse">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-gray-300 dark:bg-gray-700 rounded-xl" />
                        <div className="flex-1">
                          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2 mb-2" />
                          <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-1/4" />
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : myActivities && myActivities.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {myActivities.slice(0, 6).map((activity) => {
                    const Icon = activityIcons[activity.activity_type];
                    return (
                      <Link key={activity.id} href={`/activity/${activity.id}`}>
                        <Card variant="glass" padding="md" hover className="h-full group">
                          <div className="flex items-center gap-4">
                            {Icon && (
                              <div className="bg-gradient-to-br from-primary-500 to-blue-600 w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                                <Icon className="w-7 h-7 text-white" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <h3 className="font-bold text-base text-gray-900 dark:text-white mb-1 truncate group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                                {activity.title}
                              </h3>
                              <div className="flex items-center gap-2">
                                <Badge variant="primary" size="sm">
                                  {activityTypeLabels[activity.activity_type]}
                                </Badge>
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  {new Date(activity.created_at).toLocaleDateString('es-ES', {
                                    day: 'numeric',
                                    month: 'short',
                                  })}
                                </span>
                              </div>
                            </div>
                          </div>
                        </Card>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <Card variant="glass" padding="lg" className="text-center">
                  <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                    No tienes actividades aún
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Comienza creando tu primera actividad con IA
                  </p>
                  <Link href="/create">
                    <Button variant="primary" size="md">
                      Crear Actividad
                    </Button>
                  </Link>
                </Card>
              )}
            </div>
          </SlideIn>
        </div>
      </PageTransition>
    </DashboardLayout>
  );
}


// Componente principal que decide qué dashboard mostrar
export default function DashboardPage() {
  const { user } = useAuthStore();

  // Mostrar dashboard específico según el rol
  if (user?.role === "estudiante") {
    return <StudentDashboard />;
  }

  // Docentes y admins ven el dashboard de creación
  return <TeacherDashboard />;
}
