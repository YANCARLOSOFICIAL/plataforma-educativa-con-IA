'use client';

import Link from 'next/link';
import { useAuthStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  Sparkles,
  BookOpen,
  Bot,
  FileText,
  Users,
  Zap,
  ArrowRight,
  CheckCircle,
  Rocket,
  Target,
  TrendingUp,
  Award,
} from 'lucide-react';
import { Button, Card, Badge } from '@/components/ui';

export default function LandingPage() {
  const user = useAuthStore((state) => state.user);
  const isHydrated = useAuthStore((state) => state.isHydrated);
  const router = useRouter();

  // Redirigir a dashboard solo si hay usuario autenticado
  useEffect(() => {
    if (isHydrated && user) {
      router.push('/dashboard');
    }
  }, [user, router, isHydrated]);

  // Esperar a que el store se hidrate antes de renderizar
  if (!isHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // Si hay usuario, no mostrar nada mientras redirige
  if (user) {
    return null;
  }

  const features = [
    {
      icon: Sparkles,
      title: 'Generación con IA',
      description: 'Crea actividades educativas en segundos usando inteligencia artificial avanzada',
      color: 'from-purple-500 to-pink-600',
    },
    {
      icon: FileText,
      title: 'Múltiples Formatos',
      description: 'Exámenes, presentaciones, crucigramas, sopas de letras y más',
      color: 'from-blue-500 to-cyan-600',
    },
    {
      icon: Bot,
      title: 'Chatbots Educativos',
      description: 'Tutores virtuales especializados en diferentes áreas del conocimiento',
      color: 'from-green-500 to-emerald-600',
    },
    {
      icon: Users,
      title: 'Comunidad',
      description: 'Comparte y descubre recursos creados por otros educadores',
      color: 'from-orange-500 to-red-600',
    },
  ];

  const benefits = [
    'Ahorra horas de trabajo preparando materiales',
    'Contenido educativo de alta calidad',
    'Exporta a Word, PowerPoint y Excel',
    'Múltiples proveedores de IA disponibles',
    'Sistema de créditos flexible',
    'Comunidad activa de educadores',
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 border-b border-white/20 dark:border-gray-700/30 shadow-glass">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-gradient-to-br from-primary-600 to-blue-600 rounded-xl shadow-lg">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-blue-600 bg-clip-text text-transparent">
                EduAI
              </span>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <Link href="/explore" className="hidden sm:block">
                <Button variant="outline" size="sm">
                  Explorar
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" size="sm">
                  <span className="hidden sm:inline">Iniciar Sesión</span>
                  <span className="sm:hidden">Entrar</span>
                </Button>
              </Link>
              <Link href="/register">
                <Button variant="primary" size="sm">
                  <span className="hidden sm:inline">Registrarse</span>
                  <span className="sm:hidden">Registro</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary-400/20 rounded-full filter blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-400/20 rounded-full filter blur-3xl animate-float" style={{ animationDelay: '2s' }} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-32">
          <div className="text-center">
            <Badge className="!bg-gradient-to-r !from-primary-600 !to-blue-600 !text-white shadow-lg text-sm px-4 py-2 mb-6 inline-flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Potenciado por IA
            </Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold mb-6">
              <span className="bg-gradient-to-r from-primary-600 via-blue-600 to-purple-600 bg-clip-text text-transparent dark:from-primary-400 dark:via-blue-400 dark:to-purple-400">
                Crea Contenido Educativo
              </span>
              <br />
              <span className="text-gray-900 dark:text-white">en Segundos con IA</span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8 sm:mb-12">
              La plataforma definitiva para docentes. Genera exámenes, presentaciones, actividades interactivas y más usando inteligencia artificial.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/register">
                <Button variant="primary" size="lg" className="w-full sm:w-auto group">
                  Comenzar Gratis
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/explore">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  Ver Recursos Públicos
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Todo lo que necesitas en un solo lugar
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Herramientas poderosas diseñadas específicamente para educadores modernos
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card
                key={index}
                variant="glass"
                padding="lg"
                hover
                className="group relative overflow-hidden"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                <div className="relative">
                  <div className={`inline-flex p-4 bg-gradient-to-br ${feature.color} rounded-2xl shadow-lg mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {feature.description}
                  </p>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div>
            <Badge className="!bg-gradient-to-r !from-green-600 !to-emerald-600 !text-white shadow-lg text-sm px-4 py-2 mb-6 inline-flex items-center gap-2">
              <Rocket className="w-4 h-4" />
              Beneficios
            </Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              ¿Por qué elegir nuestra plataforma?
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
              Únete a cientos de educadores que ya están transformando su forma de crear contenido educativo.
            </p>
            <div className="space-y-4">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                  <p className="text-gray-700 dark:text-gray-300">{benefit}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-primary-400/20 to-blue-400/20 rounded-3xl blur-3xl" />
            <Card variant="elevated" padding="lg" className="relative">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-2xl">
                  <Target className="w-8 h-8 text-blue-600 dark:text-blue-400 mb-3" />
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">10+</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Tipos de Actividades</p>
                </div>
                <div className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl">
                  <TrendingUp className="w-8 h-8 text-purple-600 dark:text-purple-400 mb-3" />
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">90%</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Ahorro de Tiempo</p>
                </div>
                <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl">
                  <Users className="w-8 h-8 text-green-600 dark:text-green-400 mb-3" />
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">500+</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Educadores Activos</p>
                </div>
                <div className="p-6 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-2xl">
                  <Award className="w-8 h-8 text-orange-600 dark:text-orange-400 mb-3" />
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">5★</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Calificación</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <Card variant="elevated" padding="none" className="overflow-hidden">
          <div className="bg-gradient-to-r from-primary-600 via-blue-600 to-purple-600 p-8 sm:p-12 lg:p-16 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -mr-32 -mt-32" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-10 rounded-full -ml-24 -mb-24" />
            <div className="relative z-10">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
                ¿Listo para transformar tu enseñanza?
              </h2>
              <p className="text-lg sm:text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                Únete hoy y recibe créditos gratis para comenzar a crear contenido educativo increíble
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
                <Link href="/explore">
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full sm:w-auto !border-white !text-white hover:!bg-white/10"
                  >
                    Explorar Primero
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-gradient-to-br from-primary-600 to-blue-600 rounded-xl shadow-lg">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-primary-600 to-blue-600 bg-clip-text text-transparent">
                EduAI
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              © 2025 EduAI. Plataforma educativa con IA.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
