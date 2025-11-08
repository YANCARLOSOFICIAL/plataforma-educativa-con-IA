'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useAuthStore } from '@/lib/store';
import { contentAPI } from '@/lib/api';
import { AIProvider, SummaryRequest } from '@/types';
import FormLayout from '@/components/FormLayout';
import AIProviderSelector from '@/components/AIProviderSelector';
import { Loader2 } from 'lucide-react';

interface FormData {
  text: string;
  length: 'short' | 'medium' | 'long';
}

export default function CreateSummaryPage() {
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
      length: 'medium',
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

      const request: SummaryRequest = {
        text: data.text,
        length: data.length,
        ai_provider: aiProvider,
        model_name: modelName,
      };

      const activity = await contentAPI.generateSummary(request);
      router.push(`/activity/${activity.id}`);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Error al generar el resumen');
      setLoading(false);
    }
  };

  if (!user) return null;

  const textLength = watch('text')?.length || 0;

  return (
    <FormLayout
      title="Crear Resumen"
      description="Genera resúmenes automáticos de textos largos o documentos"
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
              Texto a Resumir *
            </label>
            <textarea
              {...register('text', {
                required: 'El texto es requerido',
                minLength: { value: 100, message: 'El texto debe tener al menos 100 caracteres' },
              })}
              className="input min-h-[300px] font-mono text-sm"
              placeholder="Pega aquí el texto que deseas resumir..."
              autoFocus
            />
            <div className="flex justify-between mt-1">
              <div>
                {errors.text && (
                  <p className="text-red-600 text-sm">{errors.text.message}</p>
                )}
              </div>
              <p className="text-xs text-gray-500">
                {textLength} caracteres
                {textLength < 100 && ` (mínimo 100)`}
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Longitud del Resumen
            </label>
            <select {...register('length')} className="input">
              <option value="short">Corto (2-3 párrafos)</option>
              <option value="medium">Medio (4-5 párrafos)</option>
              <option value="long">Largo (6-8 párrafos)</option>
            </select>
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
              disabled={loading || textLength < 100}
              className="flex-1 btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed py-3 text-base font-semibold"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5" />
                  Generando Resumen...
                </span>
              ) : (
                'Generar Resumen con IA'
              )}
            </button>
          </div>
        </form>
      </div>
    </FormLayout>
  );
}
