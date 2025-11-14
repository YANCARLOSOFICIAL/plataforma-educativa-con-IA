'use client';

import DashboardLayout from '@/components/DashboardLayout';
import { Card, Badge } from '@/components/ui';
import Link from 'next/link';
import PageTransition, { FadeIn, SlideIn } from '@/components/PageTransition';
import {
  FileQuestion,
  FileText,
  BookOpen,
  FileCheck,
  Edit3,
  Presentation,
  Mail,
  PenTool,
  BookMarked,
  Grid3x3,
  Search,
  Sparkles,
} from 'lucide-react';

const activityTypes = [
  {
    type: 'exam',
    label: 'Crear Examen',
    description: 'Genera exámenes con preguntas de múltiple opción, verdadero/falso y más',
    icon: FileQuestion,
    color: 'from-blue-500 to-cyan-600',
    category: 'Evaluación',
  },
  {
    type: 'summary',
    label: 'Crear Resumen',
    description: 'Crea resúmenes concisos de textos largos o temas específicos',
    icon: FileText,
    color: 'from-green-500 to-emerald-600',
    category: 'Contenido',
  },
  {
    type: 'class_activity',
    label: 'Actividad de Clase',
    description: 'Diseña actividades interactivas y ejercicios para tus clases',
    icon: BookOpen,
    color: 'from-purple-500 to-pink-600',
    category: 'Educativo',
  },
  {
    type: 'rubric',
    label: 'Crear Rúbrica',
    description: 'Genera rúbricas de evaluación con criterios claros',
    icon: FileCheck,
    color: 'from-orange-500 to-red-600',
    category: 'Evaluación',
  },
  {
    type: 'writing_correction',
    label: 'Corrección de Escritura',
    description: 'Analiza y corrige textos con sugerencias de mejora',
    icon: Edit3,
    color: 'from-red-500 to-pink-600',
    category: 'Corrección',
  },
  {
    type: 'slides',
    label: 'Crear Diapositivas',
    description: 'Genera presentaciones educativas profesionales',
    icon: Presentation,
    color: 'from-indigo-500 to-blue-600',
    category: 'Contenido',
  },
  {
    type: 'email',
    label: 'Redactar Email',
    description: 'Crea correos electrónicos profesionales para padres o estudiantes',
    icon: Mail,
    color: 'from-pink-500 to-rose-600',
    category: 'Comunicación',
  },
  {
    type: 'survey',
    label: 'Crear Encuesta',
    description: 'Diseña encuestas para recoger feedback de estudiantes',
    icon: PenTool,
    color: 'from-teal-500 to-cyan-600',
    category: 'Evaluación',
  },
  {
    type: 'story',
    label: 'Crear Cuento',
    description: 'Genera cuentos educativos personalizados',
    icon: BookMarked,
    color: 'from-yellow-500 to-orange-600',
    category: 'Juego',
  },
  {
    type: 'crossword',
    label: 'Crear Crucigrama',
    description: 'Genera crucigramas educativos sobre cualquier tema',
    icon: Grid3x3,
    color: 'from-cyan-500 to-blue-600',
    category: 'Juego',
  },
  {
    type: 'word_search',
    label: 'Sopa de Letras',
    description: 'Crea sopas de letras personalizadas',
    icon: Search,
    color: 'from-lime-500 to-green-600',
    category: 'Juego',
  },
];

export default function CreatePage() {
  const categories = ['Todos', 'Evaluación', 'Contenido', 'Educativo', 'Corrección', 'Comunicación', 'Juego'];
  const [selectedCategory, setSelectedCategory] = React.useState('Todos');

  const filteredActivities = selectedCategory === 'Todos'
    ? activityTypes
    : activityTypes.filter(activity => activity.category === selectedCategory);

  return (
    <DashboardLayout>
      <PageTransition>
        <div className="space-y-8">
          {/* Header */}
          <FadeIn delay={0.1}>
            <div className="text-center">
              <div className="inline-flex p-4 sm:p-5 bg-gradient-to-br from-primary-500 via-blue-600 to-purple-600 rounded-3xl shadow-2xl mb-4 sm:mb-6 animate-float">
                <Sparkles className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold bg-gradient-to-r from-primary-600 via-blue-600 to-purple-600 bg-clip-text text-transparent dark:from-primary-400 dark:via-blue-400 dark:to-purple-400 mb-3 sm:mb-4 px-4">
                Crear Contenido con IA
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-base sm:text-lg lg:text-xl max-w-3xl mx-auto px-4">
                Selecciona el tipo de contenido que deseas generar. Nuestra IA creará contenido educativo de alta calidad en segundos.
              </p>
            </div>
          </FadeIn>

          {/* Category Filter */}
          <FadeIn delay={0.15}>
            <div className="flex justify-center px-4">
              <div className="flex flex-wrap justify-center gap-2 p-2 glass-strong rounded-2xl max-w-full">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-3 sm:px-4 py-2 rounded-xl font-semibold transition-all text-sm sm:text-base whitespace-nowrap ${
                      selectedCategory === category
                        ? 'bg-gradient-to-r from-primary-600 to-blue-600 text-white shadow-lg'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-700/50'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </FadeIn>

          {/* Activity Grid */}
          <SlideIn direction="up" delay={0.2}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredActivities.map((activity) => {
                const Icon = activity.icon;
                return (
                  <Link key={activity.type} href={`/create/${activity.type}`}>
                    <Card variant="glass" padding="lg" hover className="h-full group relative overflow-hidden">
                      <div className={`absolute inset-0 bg-gradient-to-br ${activity.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />

                      <div className="relative">
                        {/* Category Badge */}
                        <Badge className="absolute top-0 right-0 !bg-white/90 dark:!bg-gray-800/90 !text-gray-700 dark:!text-gray-300 text-xs">
                          {activity.category}
                        </Badge>

                        {/* Icon */}
                        <div className={`inline-flex p-4 bg-gradient-to-br ${activity.color} rounded-2xl shadow-lg mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                          <Icon className="w-8 h-8 text-white" />
                        </div>

                        {/* Content */}
                        <h3 className="font-bold text-xl text-gray-900 dark:text-white mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                          {activity.label}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                          {activity.description}
                        </p>
                      </div>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </SlideIn>
        </div>
      </PageTransition>
    </DashboardLayout>
  );
}

// Add React import for useState
import React from 'react';
