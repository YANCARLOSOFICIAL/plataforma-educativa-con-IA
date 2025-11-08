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
} from 'lucide-react';
import { activityTypeLabels } from '@/lib/utils';

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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Plataforma Educativa</h1>
              <p className="text-sm text-gray-600">Bienvenido, {user.full_name || user.username}</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-primary-50 px-4 py-2 rounded-lg">
                <CreditCard className="w-5 h-5 text-primary-600" />
                <span className="font-semibold text-primary-900">
                  {credits?.current_balance || user.credits} créditos
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-gray-700 hover:text-gray-900"
              >
                <LogOut className="w-5 h-5" />
                Salir
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Créditos Disponibles</h3>
            <p className="text-3xl font-bold text-primary-600">
              {credits?.current_balance || user.credits}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Usa Ollama para generar contenido gratis
            </p>
          </div>
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Mis Actividades</h3>
            <p className="text-3xl font-bold text-gray-900">{myActivities?.length || 0}</p>
            <Link href="/activities" className="text-sm text-primary-600 hover:text-primary-700 mt-1 inline-block">
              Ver todas →
            </Link>
          </div>
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Rol</h3>
            <p className="text-xl font-semibold text-gray-900 capitalize">{user.role}</p>
            <p className="text-sm text-gray-500 mt-1">
              {user.role === 'docente' ? 'Puedes crear y compartir actividades' : 'Acceso a actividades públicas'}
            </p>
          </div>
        </div>

        {/* Herramientas Educativas */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Herramientas Educativas</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {contentTypes.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.type}
                  href={`/create/${item.type}`}
                  className="card hover:shadow-lg transition-shadow cursor-pointer"
                >
                  <div className={`${item.color} w-12 h-12 rounded-lg flex items-center justify-center mb-3`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900">{item.label}</h3>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Juegos Educativos */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Juegos Educativos</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {gameTypes.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.type}
                  href={`/create/${item.type}`}
                  className="card hover:shadow-lg transition-shadow cursor-pointer"
                >
                  <div className={`${item.color} w-12 h-12 rounded-lg flex items-center justify-center mb-3`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900">{item.label}</h3>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Actividades Recientes */}
        {myActivities && myActivities.length > 0 && (
          <section>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Actividades Recientes</h2>
              <Link href="/activities" className="text-primary-600 hover:text-primary-700">
                Ver todas →
              </Link>
            </div>
            <div className="space-y-4">
              {myActivities.map((activity) => {
                const Icon = activityIcons[activity.activity_type];
                return (
                  <div key={activity.id} className="card flex items-center gap-4">
                    {Icon && (
                      <div className="bg-gray-100 w-12 h-12 rounded-lg flex items-center justify-center">
                        <Icon className="w-6 h-6 text-gray-600" />
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{activity.title}</h3>
                      <p className="text-sm text-gray-600">
                        {activityTypeLabels[activity.activity_type]} •{' '}
                        {new Date(activity.created_at).toLocaleDateString('es-ES')}
                      </p>
                    </div>
                    <Link
                      href={`/activity/${activity.id}`}
                      className="btn btn-primary"
                    >
                      Ver
                    </Link>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
