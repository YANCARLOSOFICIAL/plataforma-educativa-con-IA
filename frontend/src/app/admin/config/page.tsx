'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminAPI } from '@/lib/api';
import { Card, Button } from '@/components/ui';
import Spinner from '@/components/ui/Spinner';
import PageTransition, { FadeIn, SlideIn } from '@/components/PageTransition';
import { Settings, Save, Bot, Zap, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

const AI_PROVIDERS = [
  { value: 'ollama', label: 'Ollama (Gratis, Local)', description: '0 créditos por uso', icon: '🟢' },
  { value: 'openai', label: 'OpenAI (Pago)', description: '~5-10 créditos por uso', icon: '🔵' },
  { value: 'gemini', label: 'Gemini (Pago)', description: '~5 créditos por uso', icon: '🟣' },
];

const MODELS: Record<string, { value: string; label: string; recommended?: boolean }[]> = {
  ollama: [
    { value: 'qwen3:4b', label: 'Qwen3 4B', recommended: true },
    { value: 'llama2:7b-chat', label: 'Llama 2 7B Chat' },
    { value: 'deepseek-r1:8b', label: 'DeepSeek R1 8B' },
    { value: 'llama3:8b', label: 'Llama 3 8B' },
    { value: 'qwen2.5vl:latest', label: 'Qwen 2.5 VL' },
  ],
  openai: [
    { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo', recommended: true },
    { value: 'gpt-4', label: 'GPT-4' },
    { value: 'gpt-4-turbo', label: 'GPT-4 Turbo' },
  ],
  gemini: [
    { value: 'gemini-pro', label: 'Gemini Pro', recommended: true },
    { value: 'gemini-pro-vision', label: 'Gemini Pro Vision' },
  ],
};

export default function AdminConfigPage() {
  const queryClient = useQueryClient();
  const [selectedProvider, setSelectedProvider] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<string>('');

  const { data: config, isLoading } = useQuery({
    queryKey: ['admin-config'],
    queryFn: adminAPI.getConfig,
    onSuccess: (data) => {
      setSelectedProvider(data.default_ai_provider);
      setSelectedModel(data.default_model_name);
    },
  });

  const updateConfigMutation = useMutation({
    mutationFn: adminAPI.updateConfig,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-config'] });
      toast.success('✅ Configuración actualizada correctamente');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Error al actualizar la configuración');
    },
  });

  const handleSave = () => {
    if (!selectedProvider || !selectedModel) {
      toast.error('Por favor selecciona un proveedor y un modelo');
      return;
    }

    updateConfigMutation.mutate({
      default_ai_provider: selectedProvider,
      default_model_name: selectedModel,
    });
  };

  const handleProviderChange = (provider: string) => {
    setSelectedProvider(provider);
    // Seleccionar el modelo recomendado por defecto
    const recommendedModel = MODELS[provider].find((m) => m.recommended) || MODELS[provider][0];
    setSelectedModel(recommendedModel.value);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    );
  }

  const availableModels = selectedProvider ? MODELS[selectedProvider] : [];

  return (
    <PageTransition>
      <div className="space-y-8">
        {/* Header */}
        <FadeIn delay={0.1}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 sm:gap-3 mb-2">
                <div className="p-2 sm:p-3 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl shadow-lg flex-shrink-0">
                  <Settings className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                </div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent dark:from-purple-400 dark:via-indigo-400 dark:to-purple-400">
                  Configuración del Sistema
                </h1>
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base lg:text-lg sm:ml-11 lg:ml-16">
                Configura el modelo de IA que usarán todos los usuarios
              </p>
            </div>
          </div>
        </FadeIn>

        {/* Configuration Card */}
        <SlideIn direction="up" delay={0.2}>
          <Card variant="glass" padding="lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-br from-primary-500 to-blue-600 rounded-xl shadow-lg">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Modelo de IA Global
              </h2>
            </div>

            <div className="space-y-6">
              {/* Provider Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  Proveedor de IA
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {AI_PROVIDERS.map((provider) => (
                    <button
                      key={provider.value}
                      onClick={() => handleProviderChange(provider.value)}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        selectedProvider === provider.value
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-2xl">{provider.icon}</span>
                        {selectedProvider === provider.value && (
                          <CheckCircle2 className="w-5 h-5 text-primary-500" />
                        )}
                      </div>
                      <h3 className="font-bold text-gray-900 dark:text-white mb-1">
                        {provider.label}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {provider.description}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Model Selection */}
              {selectedProvider && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    Modelo Específico
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {availableModels.map((model) => (
                      <button
                        key={model.value}
                        onClick={() => setSelectedModel(model.value)}
                        className={`p-3 rounded-lg border transition-all text-left ${
                          selectedModel === model.value
                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-gray-900 dark:text-white">
                            {model.label}
                          </span>
                          {model.recommended && (
                            <span className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded">
                              Recomendado
                            </span>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Current Configuration Info */}
              {config && (
                <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                  <div className="flex items-start gap-3">
                    <Zap className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                        Configuración Actual
                      </h4>
                      <p className="text-sm text-blue-700 dark:text-blue-300">
                        Proveedor: <span className="font-medium">{config.default_ai_provider}</span>
                        {' • '}
                        Modelo: <span className="font-medium">{config.default_model_name}</span>
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Save Button */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <Button
                  onClick={handleSave}
                  disabled={updateConfigMutation.isLoading || !selectedProvider || !selectedModel}
                  className="flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {updateConfigMutation.isLoading ? 'Guardando...' : 'Guardar Configuración'}
                </Button>
              </div>
            </div>
          </Card>
        </SlideIn>

        {/* Info Card */}
        <SlideIn direction="up" delay={0.3}>
          <Card variant="glass" padding="lg">
            <div className="space-y-3">
              <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                ℹ️ Información Importante
              </h3>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li className="flex items-start gap-2">
                  <span className="text-primary-500 mt-0.5">•</span>
                  <span>
                    Esta configuración se aplicará a <strong>todos los usuarios</strong> del sistema
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary-500 mt-0.5">•</span>
                  <span>
                    Los usuarios ya no podrán seleccionar el modelo de IA manualmente
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary-500 mt-0.5">•</span>
                  <span>
                    <strong>Ollama</strong> es gratuito y local, ideal para desarrollo y ahorro de créditos
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary-500 mt-0.5">•</span>
                  <span>
                    <strong>OpenAI y Gemini</strong> consumen créditos pero ofrecen mayor calidad
                  </span>
                </li>
              </ul>
            </div>
          </Card>
        </SlideIn>
      </div>
    </PageTransition>
  );
}
