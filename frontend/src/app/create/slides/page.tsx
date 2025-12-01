'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useAuthStore } from '@/lib/store';
import { contentAPI } from '@/lib/api';
import { SlidesRequest } from '@/types';
import FormLayout from '@/components/FormLayout';
import { Loader2 } from 'lucide-react';

interface FormData {
  topic: string;
  num_slides: number;
  grade_level?: string;
}

const GRADE_LEVEL_OPTIONS = [
  { value: 'escuela', label: 'Escuela (Primaria)' },
  { value: 'secundaria', label: 'Secundaria' },
  { value: 'preparatoria', label: 'Preparatoria' },
  { value: 'universitario', label: 'Universitario' },
];

export default function CreateSlidesPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      num_slides: 10,
      grade_level: 'secundaria',
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

      const request: SlidesRequest = {
        topic: data.topic,
        num_slides: data.num_slides,
        grade_level: data.grade_level,
      };

      const activity = await contentAPI.generateSlides(request);
      router.push(`/activity/${activity.id}`);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Error al generar las diapositivas');
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <FormLayout
      title="Crear Diapositivas"
      description="Genera contenido para presentaciones de PowerPoint o Google Slides"
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
              Tema de la Presentación *
            </label>
            <input
              {...register('topic', { required: 'El tema es requerido' })}
              type="text"
              className="input"
              placeholder="Ej: Energías Renovables, Historia del Arte, Marketing Digital..."
              autoFocus
            />
            {errors.topic && (
              <p className="text-red-600 text-sm mt-1">{errors.topic.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
              Número de Diapositivas
            </label>
            <input
              {...register('num_slides', {
                required: true,
                min: 3,
                max: 30,
                valueAsNumber: true,
              })}
              type="number"
              className="input"
              min="3"
              max="30"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Entre 3 y 30 diapositivas</p>
            {errors.num_slides && (
              <p className="text-red-600 text-sm mt-1">Debe ser entre 3 y 30</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
              Nivel Académico
            </label>
            <select
              {...register('grade_level')}
              className="input"
            >
              {GRADE_LEVEL_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-3 pt-6">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed py-3 text-base font-semibold"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5" />
                  Generando Diapositivas...
                </span>
              ) : (
                'Generar Diapositivas con IA'
              )}
            </button>
          </div>
        </form>
      </div>
    </FormLayout>
  );
}
