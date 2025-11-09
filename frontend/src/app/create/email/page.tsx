'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useAuthStore } from '@/lib/store';
import { contentAPI } from '@/lib/api';
import { AIProvider, EmailRequest } from '@/types';
import FormLayout from '@/components/FormLayout';
import AIProviderSelector from '@/components/AIProviderSelector';
import { Loader2 } from 'lucide-react';

interface FormData {
  purpose: string;
  recipient_type: string;
  tone: string;
}

export default function CreateEmailPage() {
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
  } = useForm<FormData>({
    defaultValues: {
      tone: 'formal',
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

      const request: EmailRequest = {
        purpose: data.purpose,
        recipient_type: data.recipient_type,
        tone: data.tone,
        ai_provider: aiProvider,
        model_name: modelName,
      };

      const activity = await contentAPI.generateEmail(request);
      router.push(`/activity/${activity.id}`);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Error al generar el correo');
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <FormLayout
      title="Crear Correo Electrónico"
      description="Genera plantillas de correos profesionales para diferentes propósitos"
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
              Propósito del Correo *
            </label>
            <textarea
              {...register('purpose', { required: 'El propósito es requerido' })}
              className="input min-h-[100px]"
              placeholder="Ej: Solicitar información sobre un curso, Enviar recordatorio de reunión, Agradecer por la oportunidad..."
              autoFocus
            />
            {errors.purpose && (
              <p className="text-red-600 text-sm mt-1">{errors.purpose.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
              Destinatario *
            </label>
            <select
              {...register('recipient_type', { required: 'Selecciona el destinatario' })}
              className="input"
            >
              <option value="">Selecciona...</option>
              <option value="estudiante">Estudiante</option>
              <option value="padre">Padre de Familia</option>
              <option value="colega">Colega/Docente</option>
              <option value="directivo">Directivo/Autoridad</option>
              <option value="proveedor">Proveedor/Empresa</option>
              <option value="general">General</option>
            </select>
            {errors.recipient_type && (
              <p className="text-red-600 text-sm mt-1">{errors.recipient_type.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
              Tono del Mensaje
            </label>
            <select {...register('tone')} className="input">
              <option value="formal">Formal</option>
              <option value="semiformal">Semi-formal</option>
              <option value="amigable">Amigable</option>
              <option value="profesional">Profesional</option>
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
              disabled={loading}
              className="flex-1 btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed py-3 text-base font-semibold"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5" />
                  Generando Correo...
                </span>
              ) : (
                'Generar Correo con IA'
              )}
            </button>
          </div>
        </form>
      </div>
    </FormLayout>
  );
}
