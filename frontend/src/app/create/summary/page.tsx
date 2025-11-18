'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useAuthStore } from '@/lib/store';
import { contentAPI } from '@/lib/api';
import { AIProvider, SummaryRequest } from '@/types';
import FormLayout from '@/components/FormLayout';
import AIProviderSelector from '@/components/AIProviderSelector';
import { FileText, AlignLeft, Upload, Type } from 'lucide-react';
import { Button, Card } from '@/components/ui';
import { toast } from 'sonner';
import PageTransition, { SlideIn } from '@/components/PageTransition';

interface FormData {
  text: string;
  length: 'short' | 'medium' | 'long';
}

type InputMode = 'text' | 'pdf';

export default function CreateSummaryPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [aiProvider, setAiProvider] = useState<AIProvider>(AIProvider.OLLAMA);
  const [modelName, setModelName] = useState('qwen3:4b');
  const [inputMode, setInputMode] = useState<InputMode>('text');
  const [pdfFile, setPdfFile] = useState<File | null>(null);

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

      toast.loading('Generando resumen con IA...', { id: 'summary-generation' });

      let activity;

      if (inputMode === 'pdf') {
        // Validar que se haya seleccionado un PDF
        if (!pdfFile) {
          throw new Error('Por favor selecciona un archivo PDF');
        }

        activity = await contentAPI.generateSummaryFromPDF(
          pdfFile,
          data.length,
          aiProvider,
          modelName
        );
      } else {
        // Modo texto normal
        const request: SummaryRequest = {
          text: data.text,
          length: data.length,
          ai_provider: aiProvider,
          model_name: modelName,
        };

        activity = await contentAPI.generateSummary(request);
      }

      toast.success('¡Resumen generado exitosamente!', { id: 'summary-generation' });
      router.push(`/activity/${activity.id}`);
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || err.message || 'Error al generar el resumen';
      setError(errorMessage);
      toast.error(errorMessage, { id: 'summary-generation' });
      setLoading(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validar que sea un PDF
      if (!file.name.toLowerCase().endsWith('.pdf')) {
        setError('Por favor selecciona un archivo PDF válido');
        setPdfFile(null);
        return;
      }

      // Validar tamaño (máximo 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        setError('El archivo PDF no debe superar los 10MB');
        setPdfFile(null);
        return;
      }

      setPdfFile(file);
      setError('');
    }
  };

  if (!user) return null;

  const textLength = watch('text')?.length || 0;

  return (
    <PageTransition>
      <FormLayout
        title="Crear Resumen"
        description="Genera resúmenes automáticos de textos largos o documentos"
      >
        <SlideIn direction="up">
          <Card variant="elevated" padding="lg">
            <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
              <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-3 rounded-xl shadow-md">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Configuración del Resumen</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">Pega tu texto y ajusta la longitud deseada</p>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {error && (
                <div className="bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg">
                  <p className="font-semibold text-sm">Error al generar</p>
                  <p className="text-sm">{error}</p>
                </div>
              )}

              {/* Selector de modo de entrada */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-3">
                  Método de entrada
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setInputMode('text');
                      setPdfFile(null);
                      setError('');
                    }}
                    className={`flex items-center justify-center gap-2 p-4 border-2 rounded-lg transition-all ${
                      inputMode === 'text'
                        ? 'border-green-600 dark:border-green-500 bg-green-50 dark:bg-green-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/10'
                    }`}
                  >
                    <Type className="w-5 h-5" />
                    <span className="font-semibold">Escribir o Pegar Texto</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setInputMode('pdf');
                      setError('');
                    }}
                    className={`flex items-center justify-center gap-2 p-4 border-2 rounded-lg transition-all ${
                      inputMode === 'pdf'
                        ? 'border-green-600 dark:border-green-500 bg-green-50 dark:bg-green-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/10'
                    }`}
                  >
                    <Upload className="w-5 h-5" />
                    <span className="font-semibold">Subir PDF</span>
                  </button>
                </div>
              </div>

              {/* Entrada de texto o PDF según el modo */}
              {inputMode === 'text' ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                    Texto a Resumir <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    {...register('text', {
                      required: inputMode === 'text' ? 'El texto es requerido' : false,
                      minLength: inputMode === 'text' ? { value: 100, message: 'El texto debe tener al menos 100 caracteres' } : undefined,
                    })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent hover:border-gray-400 dark:hover:border-gray-500 min-h-[300px] font-mono text-sm resize-y dark:bg-gray-700 dark:text-white"
                    placeholder="Pega aquí el texto que deseas resumir. Asegúrate de que tenga al menos 100 caracteres para obtener un buen resumen..."
                    autoFocus
                  />
                  <div className="flex justify-between items-center mt-2">
                    <div className="flex-1">
                      {errors.text && (
                        <p className="text-red-600 dark:text-red-400 text-sm flex items-center gap-1">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          {errors.text.message}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <AlignLeft className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                      <p className={`text-sm font-medium ${textLength < 100 ? 'text-orange-600 dark:text-orange-400' : 'text-green-600 dark:text-green-400'}`}>
                        {textLength} caracteres
                        {textLength < 100 && ` (mínimo 100)`}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                    Archivo PDF <span className="text-red-500">*</span>
                  </label>
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center hover:border-green-400 dark:hover:border-green-500 transition-colors">
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={handleFileChange}
                      className="hidden"
                      id="pdf-upload"
                    />
                    <label
                      htmlFor="pdf-upload"
                      className="cursor-pointer flex flex-col items-center gap-3"
                    >
                      <div className="bg-green-100 dark:bg-green-900/30 p-4 rounded-full">
                        <Upload className="w-8 h-8 text-green-600 dark:text-green-400" />
                      </div>
                      {pdfFile ? (
                        <div className="space-y-2">
                          <p className="text-sm font-semibold text-green-600 dark:text-green-400">
                            {pdfFile.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {(pdfFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              setPdfFile(null);
                            }}
                            className="text-xs text-red-600 dark:text-red-400 hover:underline"
                          >
                            Remover archivo
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                            Haz clic para seleccionar un archivo PDF
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            o arrastra y suelta aquí (máximo 10MB)
                          </p>
                        </div>
                      )}
                    </label>
                  </div>
                  {pdfFile && (
                    <p className="text-sm text-green-600 dark:text-green-400 mt-2 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Archivo listo para procesar
                    </p>
                  )}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-3">
                  Longitud del Resumen
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'short', label: 'Corto', desc: '2-3 párrafos' },
                    { value: 'medium', label: 'Medio', desc: '4-5 párrafos' },
                    { value: 'long', label: 'Largo', desc: '6-8 párrafos' },
                  ].map((option) => (
                    <label
                      key={option.value}
                      className="relative flex flex-col p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:border-green-300 dark:hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 transition-all group"
                    >
                      <input
                        {...register('length')}
                        type="radio"
                        value={option.value}
                        className="sr-only peer"
                      />
                      <div className="text-center">
                        <p className="font-semibold text-gray-900 dark:text-white mb-1">{option.label}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">{option.desc}</p>
                      </div>
                      <div className="absolute inset-0 border-2 border-green-600 dark:border-green-500 rounded-lg opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none"></div>
                      <div className="absolute top-2 right-2 w-5 h-5 bg-green-600 dark:bg-green-500 rounded-full opacity-0 peer-checked:opacity-100 transition-opacity flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <AIProviderSelector
                  value={aiProvider}
                  onChange={setAiProvider}
                  modelName={modelName}
                  onModelChange={setModelName}
                />
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  fullWidth
                  isLoading={loading}
                  disabled={inputMode === 'text' ? textLength < 100 : !pdfFile}
                >
                  {loading ? 'Generando Resumen...' : 'Generar Resumen con IA'}
                </Button>
              </div>
            </form>
          </Card>
        </SlideIn>
      </FormLayout>
    </PageTransition>
  );
}
