'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { useAuthStore } from '@/lib/store';
import { contentAPI } from '@/lib/api';
import { AIProvider, RubricRequest } from '@/types';
import FormLayout from '@/components/FormLayout';
import AIProviderSelector from '@/components/AIProviderSelector';
import { Loader2, Plus, X } from 'lucide-react';

interface FormData {
  topic: string;
  career: string;
  semester: string;
  objectives: { value: string }[];
  criteria: { value: string }[];
}

export default function CreateRubricPage() {
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
      objectives: [{ value: '' }],
      criteria: [{ value: '' }],
    },
  });

  const { fields: objectiveFields, append: appendObjective, remove: removeObjective } = useFieldArray({
    control,
    name: 'objectives',
  });

  const { fields: criteriaFields, append: appendCriteria, remove: removeCriteria } = useFieldArray({
    control,
    name: 'criteria',
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

      const objectives = data.objectives.map(obj => obj.value.trim()).filter(obj => obj.length > 0);
      const criteria = data.criteria.map(crit => crit.value.trim()).filter(crit => crit.length > 0);

      if (objectives.length === 0 || criteria.length === 0) {
        setError('Debes agregar al menos un objetivo y un criterio');
        setLoading(false);
        return;
      }

      const request: RubricRequest = {
        topic: data.topic,
        career: data.career,
        semester: data.semester,
        objectives,
        criteria,
        ai_provider: aiProvider,
        model_name: modelName,
      };

      const activity = await contentAPI.generateRubric(request);
      router.push(`/activity/${activity.id}`);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Error al generar la rúbrica');
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <FormLayout
      title="Crear Rúbrica de Evaluación"
      description="Genera rúbricas detalladas con criterios y niveles de desempeño"
    >
      <div className="bg-white rounded-lg shadow-md p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              <p className="font-medium">Error</p>
              <p className="text-sm">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Tema/Actividad *
              </label>
              <input
                {...register('topic', { required: 'El tema es requerido' })}
                type="text"
                className="input"
                placeholder="Ej: Proyecto Final"
                autoFocus
              />
              {errors.topic && (
                <p className="text-red-600 text-sm mt-1">{errors.topic.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Carrera/Materia *
              </label>
              <input
                {...register('career', { required: 'La carrera es requerida' })}
                type="text"
                className="input"
                placeholder="Ej: Ingeniería"
              />
              {errors.career && (
                <p className="text-red-600 text-sm mt-1">{errors.career.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Semestre/Nivel *
              </label>
              <input
                {...register('semester', { required: 'El semestre es requerido' })}
                type="text"
                className="input"
                placeholder="Ej: 3er Semestre"
              />
              {errors.semester && (
                <p className="text-red-600 text-sm mt-1">{errors.semester.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Objetivos de Aprendizaje
            </label>
            <div className="space-y-2">
              {objectiveFields.map((field, index) => (
                <div key={field.id} className="flex gap-2">
                  <input
                    {...register(`objectives.${index}.value` as const)}
                    type="text"
                    className="input flex-1"
                    placeholder={`Objetivo ${index + 1}`}
                  />
                  {objectiveFields.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeObjective(index)}
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
              onClick={() => appendObjective({ value: '' })}
              className="btn btn-secondary mt-2 flex items-center gap-2 text-sm"
            >
              <Plus className="w-4 h-4" />
              Agregar Objetivo
            </button>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Criterios de Evaluación
            </label>
            <div className="space-y-2">
              {criteriaFields.map((field, index) => (
                <div key={field.id} className="flex gap-2">
                  <input
                    {...register(`criteria.${index}.value` as const)}
                    type="text"
                    className="input flex-1"
                    placeholder={`Criterio ${index + 1} (Ej: Contenido, Presentación, Creatividad)`}
                  />
                  {criteriaFields.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeCriteria(index)}
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
              onClick={() => appendCriteria({ value: '' })}
              className="btn btn-secondary mt-2 flex items-center gap-2 text-sm"
            >
              <Plus className="w-4 h-4" />
              Agregar Criterio
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
                  Generando Rúbrica...
                </span>
              ) : (
                'Generar Rúbrica con IA'
              )}
            </button>
          </div>
        </form>
      </div>
    </FormLayout>
  );
}
