'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useAuthStore } from '@/lib/store';
import { contentAPI } from '@/lib/api';
import { AIProvider, CrosswordRequest } from '@/types';
import FormLayout from '@/components/FormLayout';
import AIProviderSelector from '@/components/AIProviderSelector';
import { Loader2 } from 'lucide-react';

interface FormData {
  topic: string;
  num_words: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

export default function CreateCrosswordPage() {
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
  } = useForm<FormData>({
    defaultValues: {
      num_words: 10,
      difficulty: 'medium',
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

      const request: CrosswordRequest = {
        topic: data.topic,
        num_words: data.num_words,
        difficulty: data.difficulty,
        ai_provider: aiProvider,
        model_name: modelName,
      };

      const activity = await contentAPI.generateCrossword(request);
      router.push(`/activity/${activity.id}`);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Error al generar el crucigrama');
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <FormLayout
      title="Crear Crucigrama"
      description="Genera crucigramas educativos personalizados para tus estudiantes"
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
              Tema del Crucigrama *
            </label>
            <input
              {...register('topic', { required: 'El tema es requerido' })}
              type="text"
              className="input"
              placeholder="Ej: Animales del bosque, Partes del cuerpo humano, Verbos en inglés..."
              autoFocus
            />
            {errors.topic && (
              <p className="text-red-600 text-sm mt-1">{errors.topic.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
              Número de Palabras
            </label>
            <input
              {...register('num_words', {
                required: true,
                min: 5,
                max: 20,
                valueAsNumber: true,
              })}
              type="number"
              className="input"
              min="5"
              max="20"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Entre 5 y 20 palabras</p>
            {errors.num_words && (
              <p className="text-red-600 text-sm mt-1">Debe ser entre 5 y 20</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
              Nivel de Dificultad
            </label>
            <div className="grid grid-cols-3 gap-3">
              <label className="flex items-center p-3 border-2 rounded-lg cursor-pointer hover:border-primary-300 transition-colors">
                <input
                  {...register('difficulty')}
                  type="radio"
                  value="easy"
                  className="mr-2"
                />
                <div>
                  <div className="font-semibold text-green-700 dark:text-green-400">Fácil</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Palabras cortas</div>
                </div>
              </label>
              <label className="flex items-center p-3 border-2 rounded-lg cursor-pointer hover:border-primary-300 transition-colors">
                <input
                  {...register('difficulty')}
                  type="radio"
                  value="medium"
                  className="mr-2"
                  defaultChecked
                />
                <div>
                  <div className="font-semibold text-yellow-700 dark:text-yellow-400">Medio</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Equilibrado</div>
                </div>
              </label>
              <label className="flex items-center p-3 border-2 rounded-lg cursor-pointer hover:border-primary-300 transition-colors">
                <input
                  {...register('difficulty')}
                  type="radio"
                  value="hard"
                  className="mr-2"
                />
                <div>
                  <div className="font-semibold text-red-700 dark:text-red-400">Difícil</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Palabras largas</div>
                </div>
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
                  Generando Crucigrama...
                </span>
              ) : (
                'Generar Crucigrama con IA'
              )}
            </button>
          </div>
        </form>
      </div>
    </FormLayout>
  );
}
