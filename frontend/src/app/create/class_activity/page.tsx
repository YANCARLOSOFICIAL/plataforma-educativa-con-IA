'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { useAuthStore } from '@/lib/store';
import { contentAPI } from '@/lib/api';
import { ClassActivityRequest } from '@/types';
import FormLayout from '@/components/FormLayout';
import { Loader2, Plus, X, Upload, FileText } from 'lucide-react';

interface FormData {
  topic: string;
  duration_minutes: number;
  grade_level: string;
  objectives: { value: string }[];
}

type InputMode = 'form' | 'file';

const GRADE_LEVEL_OPTIONS = [
  { value: 'escuela', label: 'Escuela (Primaria)' },
  { value: 'secundaria', label: 'Secundaria' },
  { value: 'preparatoria', label: 'Preparatoria' },
  { value: 'universitario', label: 'Universitario' },
];

export default function CreateClassActivityPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [inputMode, setInputMode] = useState<InputMode>('form');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      duration_minutes: 60,
      grade_level: 'secundaria',
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

      let activity;

      if (inputMode === 'file') {
        // Validar que se haya seleccionado un archivo
        if (!uploadedFile) {
          throw new Error('Por favor selecciona un archivo PDF o Word');
        }

        // Crear FormData para enviar archivo
        const formData = new FormData();
        formData.append('file', uploadedFile);
        formData.append('topic', data.topic);
        formData.append('duration_minutes', data.duration_minutes.toString());
        formData.append('grade_level', data.grade_level);

        activity = await contentAPI.generateClassActivityFromFile(formData);
      } else {
        // Modo formulario normal
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
        };

        activity = await contentAPI.generateClassActivity(request);
      }

      router.push(`/activity/${activity.id}`);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Error al generar la actividad');
      setLoading(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validar que sea PDF o Word
      const validExtensions = ['.pdf', '.doc', '.docx'];
      const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));

      if (!validExtensions.includes(fileExtension)) {
        setError('Por favor selecciona un archivo PDF o Word válido (.pdf, .doc, .docx)');
        setUploadedFile(null);
        return;
      }

      // Validar tamaño (máximo 10MB)
      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        setError('El archivo no debe superar los 10MB');
        setUploadedFile(null);
        return;
      }

      setUploadedFile(file);
      setError('');
    }
  };

  if (!user) return null;

  return (
    <FormLayout
      title="Crear Actividad de Clase"
      description="Genera actividades de clase completas con objetivos, pasos y materiales"
    >
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-600 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg">
              <p className="font-medium">Error</p>
              <p className="text-sm">{error}</p>
            </div>
          )}

          {/* Selector de modo de entrada */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
              Método de entrada
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setInputMode('form');
                  setUploadedFile(null);
                  setError('');
                }}
                className={`flex items-center justify-center gap-2 p-4 border-2 rounded-lg transition-all ${
                  inputMode === 'form'
                    ? 'border-blue-600 dark:border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-500'
                }`}
              >
                <FileText className="w-5 h-5" />
                <span className="font-semibold">Formulario Completo</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setInputMode('file');
                  setError('');
                }}
                className={`flex items-center justify-center gap-2 p-4 border-2 rounded-lg transition-all ${
                  inputMode === 'file'
                    ? 'border-blue-600 dark:border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-500'
                }`}
              >
                <Upload className="w-5 h-5" />
                <span className="font-semibold">Subir PDF/Word</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
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
              <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
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
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Entre 10 y 240 minutos</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                Nivel Académico *
              </label>
              <select
                {...register('grade_level', { required: 'El nivel es requerido' })}
                className="input"
              >
                {GRADE_LEVEL_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {errors.grade_level && (
                <p className="text-red-600 text-sm mt-1">{errors.grade_level.message}</p>
              )}
            </div>
          </div>

          {/* Campo de archivo solo en modo file */}
          {inputMode === 'file' && (
            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                Archivo PDF o Word <span className="text-red-500">*</span>
              </label>
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center hover:border-blue-400 dark:hover:border-blue-500 transition-colors">
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileChange}
                  className="hidden"
                  id="activity-file-upload"
                />
                <label
                  htmlFor="activity-file-upload"
                  className="cursor-pointer flex flex-col items-center gap-3"
                >
                  <div className="bg-blue-100 dark:bg-blue-900/30 p-4 rounded-full">
                    <Upload className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  {uploadedFile ? (
                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                        {uploadedFile.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          setUploadedFile(null);
                        }}
                        className="text-xs text-red-600 dark:text-red-400 hover:underline"
                      >
                        Eliminar archivo
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                        Haz clic para seleccionar o arrastra un archivo aquí
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        PDF o Word (máximo 10MB)
                      </p>
                    </div>
                  )}
                </label>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                Sube un documento con contenido educativo. La IA generará una actividad de clase basada en el contenido.
              </p>
            </div>
          )}

          {/* Objetivos solo en modo formulario */}
          {inputMode === 'form' && (
            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
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
              Agregar Objetivo
            </button>
          </div>
          )}

          <div className="flex gap-3 pt-6">
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
