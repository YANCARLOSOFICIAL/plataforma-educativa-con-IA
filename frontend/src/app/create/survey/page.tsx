'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useAuthStore } from '@/lib/store';
import { contentAPI } from '@/lib/api';
import { AIProvider, SurveyRequest } from '@/types';
import FormLayout from '@/components/FormLayout';
import AIProviderSelector from '@/components/AIProviderSelector';
import { Loader2 } from 'lucide-react';

interface FormData {
  topic: string;
  num_questions: number;
  question_types: string[];
}

export default function CreateSurveyPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [aiProvider, setAiProvider] = useState<AIProvider>(AIProvider.OLLAMA);
  const [modelName, setModelName] = useState('qwen3:4b');

  const {
    register,
    handleSubmit,
    formState: { errors },
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

      const request: SurveyRequest = {
        topic: data.topic,
        num_questions: data.num_questions,
        question_types: data.question_types,
        ai_provider: aiProvider,
        model_name: modelName,
      };

      const activity = await contentAPI.generateSurvey(request);
      router.push(`/activity/${activity.id}`);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Error al generar la encuesta');
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <FormLayout
      title="Crear Encuesta"
      description="Genera encuestas personalizadas con diferentes tipos de preguntas"
    >
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-600 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg">
              <p className="font-medium">Error</p>
              <p className="text-sm">{error}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
              Tema de la Encuesta *
            </label>
            <input
              {...register('topic', { required: 'El tema es requerido' })}
              type="text"
              className="input"
              placeholder="Ej: Satisfacción del curso, Clima escolar, Hábitos de estudio..."
              autoFocus
            />
            {errors.topic && (
              <p className="text-red-600 text-sm mt-1">{errors.topic.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
              Número de Preguntas
            </label>
            <input
              {...register('num_questions', {
                required: true,
                min: 5,
                max: 30,
                valueAsNumber: true,
              })}
              type="number"
              className="input"
              min="5"
              max="30"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Entre 5 y 30 preguntas</p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
              Tipos de Preguntas
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  {...register('question_types')}
                  type="checkbox"
                  value="multiple_choice"
                  className="mr-2"
                  defaultChecked
                />
                <span className="text-gray-700 dark:text-gray-300">Selección Múltiple</span>
              </label>
              <label className="flex items-center">
                <input
                  {...register('question_types')}
                  type="checkbox"
                  value="scale"
                  className="mr-2"
                />
                <span className="text-gray-700 dark:text-gray-300">Escala (1-5)</span>
              </label>
              <label className="flex items-center">
                <input
                  {...register('question_types')}
                  type="checkbox"
                  value="open"
                  className="mr-2"
                />
                <span className="text-gray-700 dark:text-gray-300">Respuesta Abierta</span>
              </label>
            </div>
          </div>

          <AIProviderSelector
            value={aiProvider}
            onChange={setAiProvider}
            modelName={modelName}
            onModelChange={setModelName}
          />

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed py-3 text-base font-semibold"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5" />
                  Generando Encuesta...
                </span>
              ) : (
                'Generar Encuesta con IA'
              )}
            </button>
          </div>
        </form>
      </div>
    </FormLayout>
  );
}
