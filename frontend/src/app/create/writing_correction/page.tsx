'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useAuthStore } from '@/lib/store';
import { contentAPI } from '@/lib/api';
import { AIProvider, WritingCorrectionRequest } from '@/types';
import FormLayout from '@/components/FormLayout';
import AIProviderSelector from '@/components/AIProviderSelector';
import { Loader2 } from 'lucide-react';

interface FormData {
  text: string;
}

export default function CreateWritingCorrectionPage() {
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
  } = useForm<FormData>();

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true);
      setError('');

      const request: WritingCorrectionRequest = {
        text: data.text,
        ai_provider: aiProvider,
        model_name: modelName,
      };

      const activity = await contentAPI.correctWriting(request);
      router.push(`/activity/${activity.id}`);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Error al corregir el texto');
      setLoading(false);
    }
  };

  if (!user) return null;

  const textLength = watch('text')?.length || 0;

  return (
    <FormLayout
      title="Corrección de Escritura"
      description="Corrige ortografía, gramática y sintaxis de cualquier texto"
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
              Texto a Corregir *
            </label>
            <textarea
              {...register('text', {
                required: 'El texto es requerido',
                minLength: { value: 10, message: 'El texto debe tener al menos 10 caracteres' },
              })}
              className="input min-h-[300px]"
              placeholder="Escribe o pega el texto que deseas corregir..."
              autoFocus
            />
            <div className="flex justify-between mt-1">
              <div>
                {errors.text && (
                  <p className="text-red-600 text-sm">{errors.text.message}</p>
                )}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {textLength} caracteres
              </p>
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-600 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">¿Qué se corregirá?</h3>
            <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
              <li>✓ Ortografía y tildes</li>
              <li>✓ Gramática y concordancia</li>
              <li>✓ Sintaxis y estructura</li>
              <li>✓ Puntuación</li>
              <li>✓ Sugerencias de mejora</li>
            </ul>
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
              disabled={loading || textLength < 10}
              className="flex-1 btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed py-3 text-base font-semibold"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5" />
                  Corrigiendo Texto...
                </span>
              ) : (
                'Corregir con IA'
              )}
            </button>
          </div>
        </form>
      </div>
    </FormLayout>
  );
}
