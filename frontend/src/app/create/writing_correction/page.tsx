'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useAuthStore } from '@/lib/store';
import { contentAPI } from '@/lib/api';
import { WritingCorrectionRequest } from '@/types';
import FormLayout from '@/components/FormLayout';
import { Loader2, Upload, FileText } from 'lucide-react';
import { toast } from 'sonner';

interface FormData {
  text: string;
}

type InputMode = 'text' | 'file';

export default function CreateWritingCorrectionPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [inputMode, setInputMode] = useState<InputMode>('text');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm<FormData>();

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar tipo de archivo
      const validTypes = [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/msword',
      ];

      if (!validTypes.includes(file.type)) {
        toast.error('Por favor selecciona un archivo PDF o Word (.docx, .doc)');
        return;
      }

      // Validar tamaño (10MB máximo)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('El archivo es demasiado grande. Máximo 10MB');
        return;
      }

      setSelectedFile(file);
      toast.success(`Archivo "${file.name}" seleccionado`);
    }
  };

  const handleModeChange = (mode: InputMode) => {
    setInputMode(mode);
    setSelectedFile(null);
    reset();
  };

  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true);
      setError('');

      if (inputMode === 'file') {
        if (!selectedFile) {
          toast.error('Por favor selecciona un archivo');
          setLoading(false);
          return;
        }

        toast.loading('Procesando archivo...', { id: 'correction' });
        const formData = new FormData();
        formData.append('file', selectedFile);

        const activity = await contentAPI.correctWritingFile(formData);
        toast.success('¡Archivo corregido exitosamente!', { id: 'correction' });
        router.push(`/activity/${activity.id}`);
      } else {
        toast.loading('Corrigiendo texto...', { id: 'correction' });
        const request: WritingCorrectionRequest = {
          text: data.text,
        };

        const activity = await contentAPI.correctWriting(request);
        toast.success('¡Texto corregido exitosamente!', { id: 'correction' });
        router.push(`/activity/${activity.id}`);
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || 'Error al corregir';
      setError(errorMsg);
      toast.error(errorMsg, { id: 'correction' });
      setLoading(false);
    }
  };

  if (!user) return null;

  const textLength = watch('text')?.length || 0;

  return (
    <FormLayout
      title="Corrección de Escritura"
      description="Corrige ortografía, gramática y sintaxis de textos o archivos PDF/Word"
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
            <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
              Método de Entrada *
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => handleModeChange('text')}
                className={`flex items-center justify-center gap-3 p-4 rounded-lg border-2 transition-all ${
                  inputMode === 'text'
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                    : 'border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-600'
                }`}
              >
                <FileText className="w-5 h-5" />
                <span className="font-medium">Escribir Texto</span>
              </button>
              <button
                type="button"
                onClick={() => handleModeChange('file')}
                className={`flex items-center justify-center gap-3 p-4 rounded-lg border-2 transition-all ${
                  inputMode === 'file'
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                    : 'border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-600'
                }`}
              >
                <Upload className="w-5 h-5" />
                <span className="font-medium">Subir Archivo</span>
              </button>
            </div>
          </div>

          {/* Input de texto */}
          {inputMode === 'text' && (
            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                Texto a Corregir *
              </label>
              <textarea
                {...register('text', {
                  required: inputMode === 'text' ? 'El texto es requerido' : false,
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
          )}

          {/* Input de archivo */}
          {inputMode === 'file' && (
            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                Archivo PDF o Word *
              </label>
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer flex flex-col items-center gap-2"
                >
                  <Upload className="w-12 h-12 text-gray-400" />
                  {selectedFile ? (
                    <div className="text-center">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {selectedFile.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          setSelectedFile(null);
                        }}
                        className="text-xs text-red-600 dark:text-red-400 hover:underline mt-2"
                      >
                        Cambiar archivo
                      </button>
                    </div>
                  ) : (
                    <>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Haz clic para seleccionar un archivo
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        PDF, DOC o DOCX (Máximo 10MB)
                      </p>
                    </>
                  )}
                </label>
              </div>
            </div>
          )}

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

          <div className="flex gap-3 pt-6">
            <button
              type="submit"
              disabled={
                loading ||
                (inputMode === 'text' && textLength < 10) ||
                (inputMode === 'file' && !selectedFile)
              }
              className="flex-1 btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed py-3 text-base font-semibold"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5" />
                  {inputMode === 'file' ? 'Procesando Archivo...' : 'Corrigiendo Texto...'}
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
