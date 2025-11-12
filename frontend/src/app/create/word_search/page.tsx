'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useAuthStore } from '@/lib/store';
import { contentAPI } from '@/lib/api';
import { AIProvider, WordSearchRequest } from '@/types';
import FormLayout from '@/components/FormLayout';
import AIProviderSelector from '@/components/AIProviderSelector';
import { Loader2 } from 'lucide-react';

interface FormData {
  topic: string;
  num_words: number;
  grid_size: number;
}

export default function CreateWordSearchPage() {
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
    watch,
  } = useForm<FormData>({
    defaultValues: {
      num_words: 10,
      grid_size: 15,
    },
  });

  const gridSize = watch('grid_size');

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true);
      setError('');

      const request: WordSearchRequest = {
        topic: data.topic,
        num_words: data.num_words,
        grid_size: data.grid_size,
        ai_provider: aiProvider,
        model_name: modelName,
      };

      const activity = await contentAPI.generateWordSearch(request);
      router.push(`/activity/${activity.id}`);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Error al generar la sopa de letras');
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <FormLayout
      title="Crear Sopa de Letras"
      description="Genera sopas de letras educativas para reforzar vocabulario"
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
              Tema de la Sopa de Letras *
            </label>
            <input
              {...register('topic', { required: 'El tema es requerido' })}
              type="text"
              className="input"
              placeholder="Ej: Frutas tropicales, Capitales de Europa, Términos matemáticos..."
              autoFocus
            />
            {errors.topic && (
              <p className="text-red-600 text-sm mt-1">{errors.topic.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                Tamaño de la Cuadrícula
              </label>
              <input
                {...register('grid_size', {
                  required: true,
                  min: 10,
                  max: 20,
                  valueAsNumber: true,
                })}
                type="number"
                className="input"
                min="10"
                max="20"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Entre 10x10 y 20x20 ({gridSize}x{gridSize})
              </p>
              {errors.grid_size && (
                <p className="text-red-600 text-sm mt-1">Debe ser entre 10 y 20</p>
              )}
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-600 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400 dark:text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3 flex-1">
                <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300">Consejo</h3>
                <div className="mt-2 text-sm text-blue-700 dark:text-blue-300">
                  <p>Las palabras se ocultarán en horizontal, vertical y diagonal. Cuanto mayor sea la cuadrícula, más espacio habrá para ocultar las palabras.</p>
                </div>
              </div>
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
                  Generando Sopa de Letras...
                </span>
              ) : (
                'Generar Sopa de Letras con IA'
              )}
            </button>
          </div>
        </form>
      </div>
    </FormLayout>
  );
}
