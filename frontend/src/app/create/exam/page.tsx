'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useAuthStore } from '@/lib/store';
import { contentAPI } from '@/lib/api';
import { AIProvider, ExamRequest } from '@/types';
import FormLayout from '@/components/FormLayout';
import AIProviderSelector from '@/components/AIProviderSelector';
import { Loader2 } from 'lucide-react';

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

      const activity = await contentAPI.generateExam(request);
      router.push(`/activity/${activity.id}`);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Error al generar el examen');
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <FormLayout
      title="Crear Examen"
      description="Genera exámenes automáticamente con preguntas de verdadero/falso, selección múltiple y respuesta corta"
    >
      <div className="bg-white rounded-lg shadow-md p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              <p className="font-medium">Error</p>
              <p className="text-sm">{error}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Tema del Examen *
            </label>
            <input
              {...register('topic', { required: 'El tema es requerido' })}
              type="text"
              className="input"
              placeholder="Ej: Historia de México, Matemáticas Álgebra, Biología Celular..."
              autoFocus
            />
            {errors.topic && (
              <p className="text-red-600 text-sm mt-1">{errors.topic.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Número de Preguntas
            </label>
            <input
              {...register('num_questions', {
                required: true,
                min: 1,
                max: 50,
                valueAsNumber: true,
              })}
              type="number"
              className="input"
              min="1"
              max="50"
            />
            <p className="text-xs text-gray-500 mt-1">Entre 1 y 50 preguntas</p>
            {errors.num_questions && (
              <p className="text-red-600 text-sm mt-1">Debe ser entre 1 y 50</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
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
                <span className="text-gray-700">Selección Múltiple</span>
              </label>
              <label className="flex items-center">
                <input
                  {...register('question_types')}
                  type="checkbox"
                  value="true_false"
                  className="mr-2"
                />
                <span className="text-gray-700">Verdadero/Falso</span>
              </label>
              <label className="flex items-center">
                <input
                  {...register('question_types')}
                  type="checkbox"
                  value="short_answer"
                  className="mr-2"
                />
                <span className="text-gray-700">Respuesta Corta</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Nivel Académico (Opcional)
            </label>
            <input
              {...register('grade_level')}
              type="text"
              className="input"
              placeholder="Ej: Secundaria, Preparatoria, Universidad..."
            />
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
                  Generando Examen...
                </span>
              ) : (
                'Generar Examen con IA'
              )}
            </button>
          </div>
        </form>
      </div>
    </FormLayout>
  );
}
