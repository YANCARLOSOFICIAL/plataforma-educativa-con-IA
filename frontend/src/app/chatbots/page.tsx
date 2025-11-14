'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import DashboardLayout from '@/components/DashboardLayout';
import ChatbotCreateModal from '@/components/ChatbotCreateModal';
import { Card, Button, Badge } from '@/components/ui';
import { Bot, Plus, MessageSquare, Brain, BookOpen, Code, Heart, Calculator, Globe, Sparkles, Trash2, Edit, Power } from 'lucide-react';
import Link from 'next/link';
import PageTransition, { FadeIn, SlideIn } from '@/components/PageTransition';
import { chatbotAPI } from '@/lib/api';
import type { Chatbot } from '@/types';

const chatbotTemplates = [
  {
    id: 'math',
    name: 'Tutor de Matemáticas',
    description: 'Asistente especializado en resolver problemas matemáticos y explicar conceptos',
    icon: Calculator,
    color: 'from-blue-500 to-cyan-600',
    subjects: ['Álgebra', 'Geometría', 'Cálculo'],
  },
  {
    id: 'language',
    name: 'Profesor de Idiomas',
    description: 'Ayuda con gramática, vocabulario y práctica conversacional',
    icon: Globe,
    color: 'from-green-500 to-emerald-600',
    subjects: ['Inglés', 'Español', 'Francés'],
  },
  {
    id: 'science',
    name: 'Tutor de Ciencias',
    description: 'Explica conceptos de física, química y biología de manera simple',
    icon: Brain,
    color: 'from-purple-500 to-pink-600',
    subjects: ['Física', 'Química', 'Biología'],
  },
  {
    id: 'literature',
    name: 'Guía Literario',
    description: 'Análisis de textos, comprensión lectora y escritura creativa',
    icon: BookOpen,
    color: 'from-orange-500 to-red-600',
    subjects: ['Literatura', 'Redacción', 'Poesía'],
  },
  {
    id: 'programming',
    name: 'Mentor de Programación',
    description: 'Enseña conceptos de programación y ayuda a resolver errores de código',
    icon: Code,
    color: 'from-indigo-500 to-blue-600',
    subjects: ['Python', 'JavaScript', 'HTML/CSS'],
  },
  {
    id: 'wellness',
    name: 'Coach de Bienestar',
    description: 'Apoyo emocional, técnicas de estudio y manejo del estrés',
    icon: Heart,
    color: 'from-pink-500 to-rose-600',
    subjects: ['Mindfulness', 'Motivación', 'Organización'],
  },
];

export default function ChatbotsPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [templateData, setTemplateData] = useState<any>(null);

  // Fetch user's chatbots
  const { data: myChatbots, refetch } = useQuery({
    queryKey: ['my-chatbots'],
    queryFn: chatbotAPI.getMyChatbots,
  });

  // Fetch templates
  const { data: templates } = useQuery({
    queryKey: ['chatbot-templates'],
    queryFn: chatbotAPI.getTemplates,
  });

  const handleOpenModal = (templateId: string) => {
    setSelectedTemplate(templateId);
    if (templates && templates[templateId]) {
      setTemplateData(templates[templateId]);
    }
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedTemplate(null);
    setTemplateData(null);
  };

  const handleSuccess = () => {
    refetch();
  };

  const handleDeleteChatbot = async (id: number) => {
    if (confirm('¿Estás seguro de eliminar este chatbot?')) {
      try {
        await chatbotAPI.delete(id);
        refetch();
      } catch (error) {
        alert('Error al eliminar el chatbot');
      }
    }
  };

  return (
    <DashboardLayout>
      <PageTransition>
        <div className="space-y-8">
          <ChatbotCreateModal
            isOpen={modalOpen}
            onClose={handleCloseModal}
            onSuccess={handleSuccess}
            templateId={selectedTemplate || undefined}
            templateData={templateData}
          />
          {/* Header */}
          <FadeIn delay={0.1}>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
              <div className="flex-1">
                <h1 className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 bg-clip-text text-transparent dark:from-purple-400 dark:via-pink-400 dark:to-purple-400 mb-2">
                  Chatbots IA
                </h1>
                <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base lg:text-lg">
                  Asistentes virtuales especializados para diferentes áreas educativas
                </p>
              </div>
              <Badge className="!bg-gradient-to-r !from-accent-500 !to-pink-600 !text-white shadow-lg text-base sm:text-lg px-3 sm:px-4 py-1.5 sm:py-2 self-start sm:self-auto flex-shrink-0">
                Nuevo
              </Badge>
            </div>
          </FadeIn>

          {/* Info Card */}
          <SlideIn direction="up" delay={0.15}>
            <Card variant="glass" padding="lg" className="border-2 border-purple-300/50 dark:border-purple-500/30">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-lg">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">
                    ¿Qué son los Chatbots IA?
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Son asistentes virtuales personalizados y especializados en diferentes áreas educativas.
                    Cada chatbot está entrenado para ayudarte de manera específica según tus necesidades.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="primary" size="sm">Disponible 24/7</Badge>
                    <Badge variant="success" size="sm">Respuestas instantáneas</Badge>
                    <Badge variant="info" size="sm">Múltiples materias</Badge>
                  </div>
                </div>
              </div>
            </Card>
          </SlideIn>

          {/* Templates Grid */}
          <SlideIn direction="up" delay={0.2}>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <Bot className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                Plantillas Disponibles
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {chatbotTemplates.map((template, index) => {
                  const Icon = template.icon;
                  return (
                    <Card
                      key={template.id}
                      variant="glass"
                      padding="lg"
                      hover
                      className="group relative overflow-hidden"
                    >
                      <div className={`absolute inset-0 bg-gradient-to-br ${template.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />

                      <div className="relative">
                        {/* Icon */}
                        <div className={`inline-flex p-4 bg-gradient-to-br ${template.color} rounded-2xl shadow-lg mb-4 group-hover:scale-110 transition-transform`}>
                          <Icon className="w-8 h-8 text-white" />
                        </div>

                        {/* Content */}
                        <h3 className="font-bold text-xl text-gray-900 dark:text-white mb-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                          {template.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                          {template.description}
                        </p>

                        {/* Subjects */}
                        <div className="flex flex-wrap gap-2 mb-4">
                          {template.subjects.map((subject) => (
                            <span
                              key={subject}
                              className="text-xs px-2 py-1 rounded-full bg-white/50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 font-medium"
                            >
                              {subject}
                            </span>
                          ))}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleOpenModal(template.id)}
                            className="flex-1 !bg-gradient-to-r !from-purple-600 !to-pink-600 hover:!from-purple-700 hover:!to-pink-700"
                          >
                            <Plus className="w-4 h-4 mr-1" />
                            Crear
                          </Button>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          </SlideIn>

          {/* Custom Chatbot */}
          <SlideIn direction="up" delay={0.3}>
            <Card variant="gradient" padding="lg" className="border-0 shadow-2xl">
              <div className="text-center">
                <div className="inline-flex p-5 bg-gradient-to-br from-primary-500 via-purple-600 to-pink-600 rounded-3xl shadow-2xl mb-6 animate-float">
                  <Bot className="w-12 h-12 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
                  ¿Necesitas algo más específico?
                </h2>
                <p className="text-gray-600 dark:text-gray-400 text-lg mb-6 max-w-2xl mx-auto">
                  Crea un chatbot personalizado con tus propias especificaciones,
                  personalidad y conocimientos específicos para tus necesidades.
                </p>
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => handleOpenModal('custom')}
                  className="!bg-gradient-to-r !from-primary-600 !via-purple-600 !to-pink-600 hover:!from-primary-700 hover:!via-purple-700 hover:!to-pink-700 shadow-xl"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Crear Chatbot Personalizado
                </Button>
              </div>
            </Card>
          </SlideIn>

          {/* My Chatbots Section */}
          <SlideIn direction="up" delay={0.4}>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <MessageSquare className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                Mis Chatbots
              </h2>
              {!myChatbots || myChatbots.length === 0 ? (
                <Card variant="glass" padding="lg" className="text-center">
                  <Bot className="w-20 h-20 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                    Aún no has creado ningún chatbot
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Selecciona una plantilla arriba para comenzar
                  </p>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {myChatbots.map((chatbot: Chatbot) => {
                    const template = chatbotTemplates.find((t) => t.id === chatbot.chatbot_type);
                    const Icon = template?.icon || Bot;
                    const color = template?.color || 'from-gray-500 to-gray-600';

                    return (
                      <Card key={chatbot.id} variant="glass" padding="lg" hover className="group relative">
                        {/* Icon */}
                        <div className={`inline-flex p-4 bg-gradient-to-br ${color} rounded-2xl shadow-lg mb-4 group-hover:scale-110 transition-transform`}>
                          <Icon className="w-8 h-8 text-white" />
                        </div>

                        {/* Status Badge */}
                        <div className="absolute top-4 right-4">
                          <Badge variant={chatbot.is_active ? 'success' : 'warning'} size="sm">
                            {chatbot.is_active ? 'Activo' : 'Inactivo'}
                          </Badge>
                        </div>

                        {/* Content */}
                        <h3 className="font-bold text-xl text-gray-900 dark:text-white mb-2">
                          {chatbot.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                          {chatbot.description || 'Sin descripción'}
                        </p>

                        {/* Knowledge Areas */}
                        {chatbot.knowledge_areas && chatbot.knowledge_areas.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-4">
                            {chatbot.knowledge_areas.slice(0, 3).map((area) => (
                              <span
                                key={area}
                                className="text-xs px-2 py-1 rounded-full bg-white/50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 font-medium"
                              >
                                {area}
                              </span>
                            ))}
                            {chatbot.knowledge_areas.length > 3 && (
                              <span className="text-xs px-2 py-1 rounded-full bg-white/50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 font-medium">
                                +{chatbot.knowledge_areas.length - 3}
                              </span>
                            )}
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-2">
                          <Link href={`/chatbots/${chatbot.id}/chat`} className="flex-1">
                            <Button
                              variant="primary"
                              size="sm"
                              className="w-full !bg-gradient-to-r !from-purple-600 !to-pink-600 hover:!from-purple-700 hover:!to-pink-700"
                            >
                              <MessageSquare className="w-4 h-4 mr-1" />
                              Chatear
                            </Button>
                          </Link>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteChatbot(chatbot.id)}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          </SlideIn>
        </div>
      </PageTransition>
    </DashboardLayout>
  );
}
