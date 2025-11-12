'use client';

import { useState } from 'react';
import { Button, Card } from '@/components/ui';
import { X, Bot, Sparkles } from 'lucide-react';
import { chatbotAPI } from '@/lib/api';
import { ChatbotType, AIProvider } from '@/types';
import type { ChatbotCreate } from '@/types';

interface ChatbotCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  templateId?: string;
  templateData?: {
    name: string;
    description: string;
    personality: string;
    knowledge_areas: string[];
    instruction_prompt: string;
  };
}

export default function ChatbotCreateModal({
  isOpen,
  onClose,
  onSuccess,
  templateId,
  templateData,
}: ChatbotCreateModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState<ChatbotCreate>({
    name: templateData?.name || '',
    description: templateData?.description || '',
    chatbot_type: (templateId as ChatbotType) || ChatbotType.CUSTOM,
    personality: templateData?.personality || '',
    knowledge_areas: templateData?.knowledge_areas || [],
    instruction_prompt: templateData?.instruction_prompt || '',
    ai_provider: 'ollama',
    model_name: 'qwen3:4b',  // Modelo ligero y rápido por defecto
    temperature: 70,
    is_public: false,
  });

  // Modelos disponibles según el proveedor
  const getAvailableModels = (provider: string) => {
    switch (provider) {
      case 'ollama':
        return [
          'qwen3:4b',              // Más rápido, recomendado
          'llama2:7b-chat',        // Rápido y eficiente
          'deepseek-r1:8b',        // Balance entre velocidad y calidad
          'qwen2.5vl:latest',      // Más pesado, solo si tienes buen hardware
        ];
      case 'openai':
        return ['gpt-3.5-turbo', 'gpt-4', 'gpt-4-turbo'];
      case 'gemini':
        return ['gemini-pro', 'gemini-pro-vision'];
      default:
        return [];
    }
  };

  // Actualizar el modelo cuando cambia el proveedor
  const handleProviderChange = (provider: string) => {
    const models = getAvailableModels(provider);
    setFormData({
      ...formData,
      ai_provider: provider,
      model_name: models[0] || '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await chatbotAPI.create(formData);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Error al crear el chatbot');
    } finally {
      setLoading(false);
    }
  };

  const handleKnowledgeAreaChange = (value: string) => {
    const areas = value.split(',').map((area) => area.trim()).filter(Boolean);
    setFormData({ ...formData, knowledge_areas: areas });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <Card variant="gradient" padding="lg" className="shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-lg">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {templateId && templateId !== 'custom' ? 'Crear desde Plantilla' : 'Crear Chatbot Personalizado'}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Configura tu asistente virtual
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 p-4 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-800 rounded-lg">
              <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Nombre del Chatbot *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                placeholder="Ej: Mi Tutor de Matemáticas"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Descripción
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                rows={3}
                placeholder="Describe brevemente para qué sirve este chatbot"
              />
            </div>

            {/* Personality */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Personalidad
              </label>
              <textarea
                value={formData.personality}
                onChange={(e) => setFormData({ ...formData, personality: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                rows={2}
                placeholder="Ej: Eres un tutor paciente y amigable que explica con ejemplos claros"
              />
            </div>

            {/* Knowledge Areas */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Áreas de Conocimiento
              </label>
              <input
                type="text"
                value={formData.knowledge_areas?.join(', ') || ''}
                onChange={(e) => handleKnowledgeAreaChange(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                placeholder="Ej: Álgebra, Geometría, Cálculo (separadas por comas)"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Separa las áreas con comas
              </p>
            </div>

            {/* AI Provider */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Proveedor de IA
              </label>
              <select
                value={formData.ai_provider}
                onChange={(e) => handleProviderChange(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              >
                <option value="ollama">Ollama (Gratis, Local)</option>
                <option value="openai">OpenAI (Con costo)</option>
                <option value="gemini">Google Gemini (Con costo)</option>
              </select>
            </div>

            {/* Model Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Modelo de IA
              </label>
              <select
                value={formData.model_name}
                onChange={(e) => setFormData({ ...formData, model_name: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              >
                {getAvailableModels(formData.ai_provider || 'ollama').map((model) => (
                  <option key={model} value={model}>
                    {model}
                  </option>
                ))}
              </select>
            </div>

            {/* Temperature */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Creatividad: {formData.temperature}%
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={formData.temperature}
                onChange={(e) => setFormData({ ...formData, temperature: parseInt(e.target.value) })}
                className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                <span>Más preciso</span>
                <span>Más creativo</span>
              </div>
            </div>

            {/* Public */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="is_public"
                checked={formData.is_public}
                onChange={(e) => setFormData({ ...formData, is_public: e.target.checked })}
                className="w-5 h-5 rounded border-gray-300 dark:border-gray-600 text-purple-600 focus:ring-purple-500"
              />
              <label htmlFor="is_public" className="text-sm text-gray-700 dark:text-gray-300">
                Hacer público (otros usuarios podrán usar este chatbot)
              </label>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={loading}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={loading}
                className="flex-1 !bg-gradient-to-r !from-purple-600 !to-pink-600 hover:!from-purple-700 hover:!to-pink-700"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Creando...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Crear Chatbot
                  </>
                )}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
