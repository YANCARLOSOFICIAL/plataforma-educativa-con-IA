'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { useAuthStore } from '@/lib/store';
import { contentAPI } from '@/lib/api';
import { AIProvider, StoryRequest } from '@/types';
import FormLayout from '@/components/FormLayout';
import AIProviderSelector from '@/components/AIProviderSelector';
import { Loader2, Plus, X } from 'lucide-react';

interface FormData {
  theme: string;
  story_type: 'cuento' | 'fabula' | 'aventura';
  characters: { value: string }[];
  moral?: string;
}

export default function CreateStoryPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [aiProvider, setAiProvider] = useState<AIProvider>(AIProvider.OLLAMA);
  const [modelName, setModelName] = useState('qwen3:4b');

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<FormData>({
    defaultValues: {
      story_type: 'cuento',
      characters: [{ value: '' }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'characters',
  });

  const storyType = watch('story_type');

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true);
      setError('');

      const characters = data.characters
        .map((char) => char.value.trim())
        .filter((char) => char.length > 0);

      if (characters.length === 0) {
        setError('Debes agregar al menos un personaje');
        setLoading(false);
        return;
      }

      const request: StoryRequest = {
        theme: data.theme,
        story_type: data.story_type,
        characters,
        moral: data.moral,
        ai_provider: aiProvider,
        model_name: modelName,
      };

      const activity = await contentAPI.generateStory(request);
      router.push(`/activity/${activity.id}`);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Error al generar la historia');
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <FormLayout
      title="Crear Cuento/Fábula/Aventura"
      description="Genera historias personalizadas para niños y jóvenes"
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
              Tipo de Historia *
            </label>
            <div className="grid grid-cols-3 gap-3">
              <label className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                storyType === 'cuento' ? 'border-primary-500 bg-primary-50' : 'border-gray-200 dark:border-gray-600'
              }`}>
                <input
                  {...register('story_type')}
                  type="radio"
                  value="cuento"
                  className="sr-only"
                />
                <div className="font-semibold text-center">Cuento</div>
              </label>
              <label className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                storyType === 'fabula' ? 'border-primary-500 bg-primary-50' : 'border-gray-200 dark:border-gray-600'
              }`}>
                <input
                  {...register('story_type')}
                  type="radio"
                  value="fabula"
                  className="sr-only"
                />
                <div className="font-semibold text-center">Fábula</div>
              </label>
              <label className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                storyType === 'aventura' ? 'border-primary-500 bg-primary-50' : 'border-gray-200 dark:border-gray-600'
              }`}>
                <input
                  {...register('story_type')}
                  type="radio"
                  value="aventura"
                  className="sr-only"
                />
                <div className="font-semibold text-center">Aventura</div>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
              Tema de la Historia *
            </label>
            <input
              {...register('theme', { required: 'El tema es requerido' })}
              type="text"
              className="input"
              placeholder="Ej: La amistad, El bosque mágico, Viaje espacial..."
              autoFocus
            />
            {errors.theme && (
              <p className="text-red-600 text-sm mt-1">{errors.theme.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
              Personajes *
            </label>
            <div className="space-y-2">
              {fields.map((field, index) => (
                <div key={field.id} className="flex gap-2">
                  <input
                    {...register(`characters.${index}.value` as const)}
                    type="text"
                    className="input flex-1"
                    placeholder={`Personaje ${index + 1} (Ej: Un conejo valiente, Una niña curiosa...)`}
                  />
                  {fields.length > 1 && (
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="btn bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 px-3"
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
              Agregar Personaje
            </button>
          </div>

          {storyType === 'fabula' && (
            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                Moraleja (Opcional)
              </label>
              <textarea
                {...register('moral')}
                className="input min-h-[80px]"
                placeholder="Ej: La honestidad siempre es la mejor política..."
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Déjalo vacío para que la IA genere una moraleja automáticamente
              </p>
            </div>
          )}

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
                  Generando Historia...
                </span>
              ) : (
                'Generar Historia con IA'
              )}
            </button>
          </div>
        </form>
      </div>
    </FormLayout>
  );
}
