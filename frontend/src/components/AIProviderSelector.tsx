'use client';

import { AIProvider } from '@/types';
import { useAuthStore } from '@/lib/store';

interface AIProviderSelectorProps {
  value: AIProvider;
  onChange: (provider: AIProvider) => void;
  modelName?: string;
  onModelChange?: (model: string) => void;
}

const ollamaModels = [
  'qwen2.5vl:latest',
  'qwen3:4b',
  'deepseek-r1:8b',
  'llama2:7b-chat',
  'llama3:8b',
];

const openaiModels = [
  'gpt-3.5-turbo',
  'gpt-4',
  'gpt-4-turbo',
];

const geminiModels = [
  'gemini-pro',
  'gemini-pro-vision',
];

export default function AIProviderSelector({
  value,
  onChange,
  modelName,
  onModelChange,
}: AIProviderSelectorProps) {
  const user = useAuthStore((state) => state.user);

  const getModelsForProvider = (provider: AIProvider) => {
    switch (provider) {
      case AIProvider.OLLAMA:
        return ollamaModels;
      case AIProvider.OPENAI:
        return openaiModels;
      case AIProvider.GEMINI:
        return geminiModels;
      default:
        return [];
    }
  };

  const models = getModelsForProvider(value);

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
          Proveedor de IA
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => onChange(AIProvider.OLLAMA)}
            className={`p-4 rounded-lg border-2 transition-all ${
              value === AIProvider.OLLAMA
                ? 'border-green-500 bg-green-50 dark:bg-green-900/30'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            <div className="font-semibold text-gray-900 dark:text-white">Ollama</div>
            <div className="text-sm text-gray-600 dark:text-gray-300">Gratis • Local</div>
            <div className="text-xs text-green-600 dark:text-green-400 font-medium mt-1">
              0 créditos
            </div>
          </button>

          <button
            type="button"
            onClick={() => onChange(AIProvider.OPENAI)}
            className={`p-4 rounded-lg border-2 transition-all ${
              value === AIProvider.OPENAI
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            <div className="font-semibold text-gray-900 dark:text-white">OpenAI</div>
            <div className="text-sm text-gray-600 dark:text-gray-300">GPT-4 / GPT-3.5</div>
            <div className="text-xs text-blue-600 dark:text-blue-400 font-medium mt-1">
              ~5-10 créditos
            </div>
          </button>

          <button
            type="button"
            onClick={() => onChange(AIProvider.GEMINI)}
            className={`p-4 rounded-lg border-2 transition-all ${
              value === AIProvider.GEMINI
                ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            <div className="font-semibold text-gray-900 dark:text-white">Gemini</div>
            <div className="text-sm text-gray-600 dark:text-gray-300">Google AI</div>
            <div className="text-xs text-purple-600 dark:text-purple-400 font-medium mt-1">
              ~5 créditos
            </div>
          </button>
        </div>

        {user && user.credits < 5 && value !== AIProvider.OLLAMA && (
          <div className="mt-2 p-3 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700 rounded-lg">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              ⚠️ Tienes solo {user.credits} créditos. Usa Ollama para generar gratis.
            </p>
          </div>
        )}
      </div>

      {onModelChange && (
        <div>
          <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
            Modelo
          </label>
          <select
            value={modelName || models[0]}
            onChange={(e) => onModelChange(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent hover:border-gray-400 dark:hover:border-gray-500 dark:bg-gray-700 dark:text-white w-full"
          >
            {models.map((model) => (
              <option key={model} value={model}>
                {model}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {value === AIProvider.OLLAMA && 'Asegúrate de tener este modelo descargado en Ollama'}
          </p>
        </div>
      )}
    </div>
  );
}
