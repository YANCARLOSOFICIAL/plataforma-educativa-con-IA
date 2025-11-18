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

const QUESTION_TYPE_OPTIONS = [
  { value: 'multiple_choice', label: 'Selección Múltiple' },
  { value: 'true_false', label: 'Verdadero/Falso' },
  { value: 'short_answer', label: 'Respuesta Corta' },
];

const GRADE_LEVEL_OPTIONS = [
  { value: 'escuela', label: 'Escuela (Primaria)' },
  { value: 'secundaria', label: 'Secundaria' },
  { value: 'preparatoria', label: 'Preparatoria' },
  { value: 'universitario', label: 'Universitario' },
];

export default function CreateExamPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [aiProvider, setAiProvider] = useState<AIProvider>(AIProvider.OLLAMA);
  const [modelName, setModelName] = useState('qwen3:4b');
  const [questionDistribution, setQuestionDistribution] = useState<Record<string, number>>({
    multiple_choice: 10,
    true_false: 0,
    short_answer: 0,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<FormData>({
    defaultValues: {
      num_questions: 10,
      question_types: ['multiple_choice'],
      grade_level: 'secundaria',
    },
  });

  const selectedQuestionTypes = watch('question_types') || [];
  const numQuestions = watch('num_questions') || 10;

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  // Actualizar la distribución cuando cambian los tipos seleccionados
  useEffect(() => {
    if (selectedQuestionTypes.length > 0) {
      const questionsPerType = Math.floor(numQuestions / selectedQuestionTypes.length);
      const remainder = numQuestions % selectedQuestionTypes.length;

      const newDistribution: Record<string, number> = {};
      selectedQuestionTypes.forEach((type, index) => {
        newDistribution[type] = questionsPerType + (index === 0 ? remainder : 0);
      });

      // Mantener los tipos no seleccionados en 0
      QUESTION_TYPE_OPTIONS.forEach((option) => {
        if (!selectedQuestionTypes.includes(option.value)) {
          newDistribution[option.value] = 0;
        }
      });

      setQuestionDistribution(newDistribution);
    }
  }, [selectedQuestionTypes, numQuestions]);

  const handleDistributionChange = (type: string, value: number) => {
    setQuestionDistribution((prev) => ({
      ...prev,
      [type]: Math.max(0, value),
    }));
  };

  const getTotalDistributed = () => {
    return selectedQuestionTypes.reduce((sum, type) => sum + (questionDistribution[type] || 0), 0);
  };

  const isDistributionValid = () => {
    return getTotalDistributed() === numQuestions;
  };

  const onSubmit = async (data: FormData) => {
    // Validar que la distribución sea correcta
    if (!isDistributionValid()) {
      toast.error(`La suma de preguntas debe ser ${numQuestions}. Actualmente: ${getTotalDistributed()}`);
      return;
    }
    try {
      setLoading(true);
      setError('');

      // Filtrar solo los tipos seleccionados en la distribución
      const filteredDistribution: Record<string, number> = {};
      selectedQuestionTypes.forEach((type) => {
        if (questionDistribution[type] > 0) {
          filteredDistribution[type] = questionDistribution[type];
        }
      });

      const request: ExamRequest = {
        topic: data.topic,
        num_questions: data.num_questions,
        question_types: data.question_types,
        question_distribution: filteredDistribution,
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
                  {QUESTION_TYPE_OPTIONS.map((option) => (
                    <label
                      key={option.value}
                      className="flex items-center p-3 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-primary-300 dark:hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all cursor-pointer group"
                    >
                      <input
                        {...register('question_types')}
                        type="checkbox"
                        value={option.value}
                        defaultChecked={option.value === 'multiple_choice'}
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

              {selectedQuestionTypes.length > 0 && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-3">
                    Distribución de Preguntas <span className="text-red-500">*</span>
                  </label>
                  <div className="space-y-3">
                    {selectedQuestionTypes.map((type) => {
                      const option = QUESTION_TYPE_OPTIONS.find((opt) => opt.value === type);
                      return (
                        <div key={type} className="flex items-center gap-3">
                          <label className="flex-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                            {option?.label}:
                          </label>
                          <Input
                            type="number"
                            min="0"
                            max={numQuestions}
                            value={questionDistribution[type] || 0}
                            onChange={(e) => handleDistributionChange(type, parseInt(e.target.value) || 0)}
                            className="w-24"
                          />
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-3 pt-3 border-t border-blue-200 dark:border-blue-800">
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-medium text-gray-700 dark:text-gray-300">Total asignado:</span>
                      <span
                        className={`font-bold ${
                          isDistributionValid()
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-red-600 dark:text-red-400'
                        }`}
                      >
                        {getTotalDistributed()} / {numQuestions}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  Nivel Académico <span className="text-red-500">*</span>
                </label>
                <select
                  {...register('grade_level', { required: 'El nivel académico es requerido' })}
                  className="w-full px-4 py-2.5 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:text-white transition-all"
                >
                  {GRADE_LEVEL_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {errors.grade_level && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.grade_level.message}</p>
                )}
              </div>

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
