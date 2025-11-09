'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useAuthStore } from '@/lib/store';
import { contentAPI } from '@/lib/api';
import { AIProvider, ExamRequest } from '@/types';
import FormLayout from '@/components/FormLayout';
import AIProviderSelector from '@/components/AIProviderSelector';
import { FileQuestion, CheckCircle2 } from 'lucide-react';
import { Button, Input, Card } from '@/components/ui';
import { toast } from 'sonner';
import PageTransition, { SlideIn } from '@/components/PageTransition';

interface FormData {
  topic: string;
  num_questions: number;
  question_types: string[];
  grade_level?: string;
}

export default function CreateExamPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [aiProvider, setAiProvider] = useState<AIProvider>(AIProvider.OLLAMA);
  const [modelName, setModelName] = useState('qwen2.5vl:latest');

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<FormData>({
    defaultValues: {
      num_questions: 10,
      question_types: ['multiple_choice'],
    },
  });

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true);
      setError('');

      const request: ExamRequest = {
        topic: data.topic,
        num_questions: data.num_questions,
        question_types: data.question_types,
        grade_level: data.grade_level,
        ai_provider: aiProvider,
        model_name: modelName,
      };

      toast.loading('Generando examen con IA...', { id: 'exam-generation' });
      const activity = await contentAPI.generateExam(request);
      toast.success('¡Examen generado exitosamente!', { id: 'exam-generation' });
      router.push(`/activity/${activity.id}`);
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || 'Error al generar el examen';
      setError(errorMessage);
      toast.error(errorMessage, { id: 'exam-generation' });
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <PageTransition>
      <FormLayout
        title="Crear Examen"
        description="Genera exámenes automáticamente con preguntas de verdadero/falso, selección múltiple y respuesta corta"
      >
        <SlideIn direction="up">
          <Card variant="elevated" padding="lg">
            <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
              <div className="bg-gradient-to-br from-primary-500 to-blue-600 p-3 rounded-xl shadow-md">
                <FileQuestion className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Configuración del Examen</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">Completa los campos para generar tu examen</p>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {error && (
                <div className="bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg">
                  <p className="font-semibold text-sm">Error al generar</p>
                  <p className="text-sm">{error}</p>
                </div>
              )}

              <Input
                {...register('topic', { required: 'El tema es requerido' })}
                label="Tema del Examen"
                placeholder="Ej: Historia de México, Matemáticas Álgebra, Biología Celular..."
                error={errors.topic?.message}
                fullWidth
                required
                autoFocus
              />

              <Input
                {...register('num_questions', {
                  required: true,
                  min: 1,
                  max: 50,
                  valueAsNumber: true,
                })}
                type="number"
                label="Número de Preguntas"
                placeholder="10"
                helperText="Entre 1 y 50 preguntas"
                error={errors.num_questions && 'Debe ser entre 1 y 50'}
                fullWidth
                required
                min="1"
                max="50"
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-3">
                  Tipos de Preguntas <span className="text-red-500">*</span>
                </label>
                <div className="space-y-3">
                  {[
                    { value: 'multiple_choice', label: 'Selección Múltiple', defaultChecked: true },
                    { value: 'true_false', label: 'Verdadero/Falso', defaultChecked: false },
                    { value: 'short_answer', label: 'Respuesta Corta', defaultChecked: false },
                  ].map((option) => (
                    <label
                      key={option.value}
                      className="flex items-center p-3 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-primary-300 dark:hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all cursor-pointer group"
                    >
                      <input
                        {...register('question_types')}
                        type="checkbox"
                        value={option.value}
                        defaultChecked={option.defaultChecked}
                        className="w-5 h-5 text-primary-600 border-gray-300 dark:border-gray-600 rounded focus:ring-primary-500 mr-3"
                      />
                      <div className="flex items-center gap-2 flex-1">
                        <CheckCircle2 className="w-5 h-5 text-primary-600 dark:text-primary-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <span className="text-gray-900 dark:text-white font-medium">{option.label}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <Input
                {...register('grade_level')}
                label="Nivel Académico"
                placeholder="Ej: Secundaria, Preparatoria, Universidad..."
                helperText="Opcional"
                fullWidth
              />

              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <AIProviderSelector
                  value={aiProvider}
                  onChange={setAiProvider}
                  modelName={modelName}
                  onModelChange={setModelName}
                />
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  fullWidth
                  isLoading={loading}
                >
                  {loading ? 'Generando Examen...' : 'Generar Examen con IA'}
                </Button>
              </div>
            </form>
          </Card>
        </SlideIn>
      </FormLayout>
    </PageTransition>
  );
}
