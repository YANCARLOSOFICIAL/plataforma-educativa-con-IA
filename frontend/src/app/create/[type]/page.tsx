'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function CreateActivityPage() {
  const router = useRouter();
  const params = useParams();
  const user = useAuthStore((state) => state.user);
  const [activityType, setActivityType] = useState<string>('');

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
    if (params?.type) {
      setActivityType(params.type as string);
    }
  }, [user, router, params]);

  const activityTitles: Record<string, string> = {
    exam: 'Crear Examen',
    summary: 'Crear Resumen',
    class_activity: 'Crear Actividad de Clase',
    rubric: 'Crear Rúbrica de Evaluación',
    writing_correction: 'Corrección de Escritura',
    slides: 'Crear Diapositivas',
    email: 'Crear Correo Electrónico',
    survey: 'Crear Encuesta',
    story: 'Crear Cuento/Fábula',
    crossword: 'Crear Crucigrama',
    word_search: 'Crear Sopa de Letras',
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link
            href="/dashboard"
            className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">
            {activityTitles[activityType] || 'Crear Actividad'}
          </h1>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 text-blue-600 rounded-full mb-4">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Funcionalidad en Desarrollo
            </h2>

            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              El formulario de creación para <strong>{activityTitles[activityType]}</strong> está en desarrollo.
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 max-w-md mx-auto">
              <p className="text-sm text-blue-800">
                <strong>Próximamente:</strong> Podrás crear este tipo de actividad usando IA con Ollama (gratis), OpenAI o Gemini.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900">Por ahora puedes:</h3>
              <ul className="text-gray-600 space-y-2">
                <li>✓ Registrarte y obtener 500 créditos</li>
                <li>✓ Verificar que Ollama está funcionando</li>
                <li>✓ Explorar el dashboard</li>
                <li>✓ Ver tus actividades (cuando las crees)</li>
              </ul>
            </div>

            <div className="mt-8 flex gap-4 justify-center">
              <Link href="/dashboard" className="btn btn-primary">
                Volver al Dashboard
              </Link>
              <a
                href="http://localhost:8000/docs"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary"
              >
                Ver API Docs
              </a>
            </div>

            <div className="mt-8 p-4 bg-gray-50 rounded-lg max-w-md mx-auto">
              <p className="text-xs text-gray-500 mb-2">
                <strong>Para desarrolladores:</strong>
              </p>
              <p className="text-xs text-gray-600">
                Los endpoints de la API están funcionando. Puedes probarlos en{' '}
                <a
                  href="http://localhost:8000/docs"
                  target="_blank"
                  className="text-primary-600 hover:underline"
                >
                  http://localhost:8000/docs
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
