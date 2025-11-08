'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { useAuthStore } from '@/lib/store';
import { contentAPI } from '@/lib/api';
import { AIProvider, ClassActivityRequest } from '@/types';
import FormLayout from '@/components/FormLayout';
import AIProviderSelector from '@/components/AIProviderSelector';
import { Loader2, Plus, X } from 'lucide-react';

interface FormData {
  topic: string;
  duration_minutes: number;
  grade_level: string;
  objectives: { value: string }[];
}

export default function CreateClassActivityPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [aiProvider, setAiProvider] = useState<AIProvider>(AIProvider.OLLAMA);
  const [modelName, setModelName] = useState('qwen2.5vl:latest');

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      duration_minutes: 60,
      objectives: [{ value: '' }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'objectives',
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

      const objectives = data.objectives
        .map((obj) => obj.value.trim())
        .filter((obj) => obj.length > 0);

      if (objectives.length === 0) {
        setError('Debes agregar al menos un objetivo');
        setLoading(false);
        return;
      }

      const request: ClassActivityRequest = {
        topic: data.topic,
        duration_minutes: data.duration_minutes,
        grade_level: data.grade_level,
        objectives,
        ai_provider: aiProvider,
        model_name: modelName,
      };

      const activity = await contentAPI.generateClassActivity(request);
      router.push(`/activity/${activity.id}`);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Error al generar la actividad');
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <FormLayout
      title="Crear Actividad de Clase"
      description="Genera actividades de clase completas con objetivos, pasos y materiales"
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
              Tema de la Actividad *
            </label>
            <input
              {...register('topic', { required: 'El tema es requerido' })}
              type="text"
              className="input"
              placeholder="Ej: Ciclo del Agua, Fracciones, Revolución Mexicana..."
              autoFocus
            />
            {errors.topic && (
              <p className="text-red-600 text-sm mt-1">{errors.topic.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Duración (minutos) *
              </label>
              <input
                {...register('duration_minutes', {
                  required: true,
                  min: 10,
                  max: 240,
                  valueAsNumber: true,
                })}
                type="number"
                className="input"
                min="10"
                max="240"
              />
              <p className="text-xs text-gray-500 mt-1">Entre 10 y 240 minutos</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Nivel Académico *
              </label>
              <input
                {...register('grade_level', { required: 'El nivel es requerido' })}
                type="text"
                className="input"
                placeholder="Ej: 5to Primaria, Secundaria..."
              />
              {errors.grade_level && (
                <p className="text-red-600 text-sm mt-1">{errors.grade_level.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Objetivos de Aprendizaje
            </label>
            <div className="space-y-2">
              {fields.map((field, index) => (
                <div key={field.id} className="flex gap-2">
                  <input
                    {...register(`objectives.${index}.value` as const)}
                    type="text"
                    className="input flex-1"
                    placeholder={`Objetivo ${index + 1}`}
                  />
                  {fields.length > 1 && (
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="btn bg-red-100 text-red-700 hover:bg-red-200 px-3"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => append({ value: '' })}
              className="btn btn-secondary mt-2 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Agregar Objetivo
            </button>
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
                  Generando Actividad...
                </span>
              ) : (
                'Generar Actividad con IA'
              )}
            </button>
          </div>
        </form>
      </div>
    </FormLayout>
  );
}
