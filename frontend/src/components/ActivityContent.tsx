'use client';

import React from 'react';
import type { Activity } from '@/types';

interface ActivityContentProps {
  activity: Activity;
}

export function ActivityContent({ activity }: ActivityContentProps) {
  const content = typeof activity.content === 'string'
    ? JSON.parse(activity.content)
    : activity.content;

  switch (activity.activity_type) {
    case 'exam':
      return <ExamContent content={content} />;
    case 'survey':
      return <SurveyContent content={content} />;
    case 'summary':
      return <SummaryContent content={content} />;
    case 'class_activity':
      return <ClassActivityContent content={content} />;
    case 'rubric':
      return <RubricContent content={content} />;
    case 'writing_correction':
      return <WritingCorrectionContent content={content} />;
    case 'slides':
      return <SlidesContent content={content} />;
    case 'email':
      return <EmailContent content={content} />;
    case 'story':
      return <StoryContent content={content} />;
    case 'crossword':
      return <CrosswordContent content={content} />;
    case 'word_search':
      return <WordSearchContent content={content} />;
    default:
      return <DefaultContent content={content} />;
  }
}

// Componente para Exámenes
function ExamContent({ content }: { content: any }) {
  return (
    <div className="space-y-6">
      {content.instructions && (
        <div className="bg-blue-50 dark:bg-blue-900/30 border-l-4 border-blue-500 p-4">
          <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">Instrucciones</h3>
          <p className="text-blue-800 dark:text-blue-300">{content.instructions}</p>
        </div>
      )}

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Preguntas</h3>
        {content.questions?.map((q: any, idx: number) => (
          <div key={idx} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <p className="font-semibold text-gray-900 dark:text-white mb-3">
              {q.id}. {q.question}
            </p>

            {q.type === 'multiple_choice' && q.options && (
              <div className="space-y-2 ml-4">
                {q.options.map((option: string, optIdx: number) => (
                  <div key={optIdx} className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full border-2 border-gray-300 dark:border-gray-600 flex items-center justify-center">
                      <span className="text-xs text-gray-600 dark:text-gray-400">{String.fromCharCode(65 + optIdx)}</span>
                    </div>
                    <span className="text-gray-700 dark:text-gray-300">{option}</span>
                  </div>
                ))}
              </div>
            )}

            {q.type === 'true_false' && (
              <div className="space-y-2 ml-4">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full border-2 border-gray-300 dark:border-gray-600"></div>
                  <span className="text-gray-700 dark:text-gray-300">Verdadero</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full border-2 border-gray-300 dark:border-gray-600"></div>
                  <span className="text-gray-700 dark:text-gray-300">Falso</span>
                </div>
              </div>
            )}

            {q.type === 'short_answer' && (
              <div className="ml-4 mt-2">
                <div className="border-b-2 border-gray-300 dark:border-gray-600 pb-2">
                  <span className="text-gray-400 dark:text-gray-500 text-sm">Respuesta: _______________</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// Componente para Encuestas
function SurveyContent({ content }: { content: any }) {
  return <ExamContent content={content} />; // Mismo formato que exámenes
}

// Componente para Resúmenes
function SummaryContent({ content }: { content: any }) {
  return (
    <div className="space-y-4">
      <div className="prose max-w-none">
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{content.summary}</p>
      </div>

      {content.key_points && content.key_points.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Puntos Clave</h3>
          <ul className="space-y-2">
            {content.key_points.map((point: string, idx: number) => (
              <li key={idx} className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-500 dark:bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  {idx + 1}
                </span>
                <span className="text-gray-700 dark:text-gray-300 pt-0.5">{point}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// Componente para Actividades de Clase
function ClassActivityContent({ content }: { content: any }) {
  return (
    <div className="space-y-6">
      {content.objectives && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Objetivos</h3>
          <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300">
            {content.objectives.map((obj: string, idx: number) => (
              <li key={idx}>{obj}</li>
            ))}
          </ul>
        </div>
      )}

      {content.materials && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Materiales</h3>
          <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300">
            {content.materials.map((mat: string, idx: number) => (
              <li key={idx}>{mat}</li>
            ))}
          </ul>
        </div>
      )}

      {content.steps && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Pasos de la Actividad</h3>
          <div className="space-y-4">
            {content.steps.map((step: any, idx: number) => (
              <div key={idx} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-10 h-10 bg-indigo-500 dark:bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold">
                    {step.step}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Duración: {step.duration_minutes} min
                      </span>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300">{step.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Componente para Rúbricas
function RubricContent({ content }: { content: any }) {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Criterios de Evaluación</h3>
      {content.criteria?.map((criterion: any, idx: number) => (
        <div key={idx} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
          <div className="bg-gray-100 dark:bg-gray-700 px-4 py-3 border-b dark:border-gray-600">
            <h4 className="font-semibold text-gray-900 dark:text-white">
              {criterion.name} <span className="text-blue-600 dark:text-blue-400">({criterion.weight}%)</span>
            </h4>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Nivel</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Puntos</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Descripción</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {criterion.levels?.map((level: any, levelIdx: number) => (
                  <tr key={levelIdx}>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">{level.level}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{level.points}</td>
                    <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{level.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}

// Componente para Corrección de Escritura
function WritingCorrectionContent({ content }: { content: any }) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Texto Original</h3>
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg p-4">
          <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">{content.original_text}</p>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Texto Corregido</h3>
        <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 rounded-lg p-4">
          <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">{content.corrected_text}</p>
        </div>
      </div>

      {content.errors && content.errors.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Errores Detectados</h3>
          <div className="space-y-3">
            {content.errors.map((error: any, idx: number) => (
              <div key={idx} className="bg-yellow-50 dark:bg-yellow-900/30 border-l-4 border-yellow-400 p-4">
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 px-2 py-1 bg-yellow-200 dark:bg-yellow-700 text-yellow-800 dark:text-yellow-200 text-xs font-semibold rounded">
                    {error.type}
                  </span>
                  <div className="flex-1">
                    <p className="text-gray-900 dark:text-gray-100">
                      <span className="line-through text-red-600 dark:text-red-400">{error.original}</span>
                      {' → '}
                      <span className="text-green-600 dark:text-green-400 font-medium">{error.correction}</span>
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{error.explanation}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Componente para Diapositivas
function SlidesContent({ content }: { content: any }) {
  // Estilos de diseño para cada diapositiva
  const getDesignStyles = (style: string = 'modern') => {
    const styles = {
      modern: {
        gradient: 'from-blue-500 via-purple-500 to-pink-500',
        textColor: 'text-white',
        accentColor: 'bg-white/20'
      },
      minimal: {
        gradient: 'from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900',
        textColor: 'text-gray-900 dark:text-white',
        accentColor: 'bg-gray-900/10 dark:bg-white/10'
      },
      colorful: {
        gradient: 'from-orange-400 via-red-500 to-pink-500',
        textColor: 'text-white',
        accentColor: 'bg-white/20'
      },
      professional: {
        gradient: 'from-slate-700 via-slate-800 to-slate-900',
        textColor: 'text-white',
        accentColor: 'bg-white/10'
      }
    };
    return styles[style as keyof typeof styles] || styles.modern;
  };

  return (
    <div className="space-y-6">
      {content.slides?.map((slide: any, idx: number) => {
        const designStyle = getDesignStyles(slide.design_style);
        const hasImage = slide.image?.url;

        return (
          <div
            key={idx}
            className="group relative overflow-hidden rounded-2xl shadow-2xl transition-all duration-300 hover:shadow-3xl hover:scale-[1.02]"
          >
            {/* Layout con imagen y contenido lado a lado (estilo Gamma AI) */}
            <div className={`relative min-h-[500px] bg-gradient-to-br ${designStyle.gradient}`}>
              <div className={`grid ${hasImage ? 'md:grid-cols-2' : 'grid-cols-1'} gap-6 h-full`}>

                {/* Imagen de fondo o lateral */}
                {hasImage && (
                  <div className="relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/20 z-10"></div>
                    <img
                      src={slide.image.url}
                      alt={slide.image.alt || slide.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    {/* Créditos del fotógrafo */}
                    {slide.image.photographer && slide.image.source !== 'placeholder' && (
                      <div className="absolute bottom-2 left-2 z-20">
                        <a
                          href={slide.image.photographer_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-white/80 hover:text-white bg-black/30 backdrop-blur-sm px-2 py-1 rounded"
                        >
                          📷 {slide.image.photographer}
                        </a>
                      </div>
                    )}
                  </div>
                )}

                {/* Contenido de la diapositiva */}
                <div className={`flex flex-col justify-center p-8 md:p-12 ${hasImage ? '' : 'col-span-full'}`}>
                  {/* Número de diapositiva */}
                  <div className="mb-6">
                    <span className={`inline-flex items-center justify-center w-12 h-12 rounded-full ${designStyle.accentColor} ${designStyle.textColor} font-bold text-lg`}>
                      {slide.slide_number || idx + 1}
                    </span>
                  </div>

                  {/* Título de la diapositiva */}
                  <h3 className={`text-3xl md:text-4xl font-bold ${designStyle.textColor} mb-6 leading-tight`}>
                    {slide.title}
                  </h3>

                  {/* Puntos de contenido */}
                  <ul className="space-y-4">
                    {slide.content?.map((point: string, pointIdx: number) => (
                      <li key={pointIdx} className="flex items-start gap-3 group/item">
                        <span className={`flex-shrink-0 w-2 h-2 rounded-full ${designStyle.accentColor} mt-2.5`}></span>
                        <span className={`text-lg ${designStyle.textColor} opacity-90 leading-relaxed`}>
                          {point}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* Notas del presentador */}
                  {slide.notes && (
                    <div className={`mt-8 pt-6 border-t ${designStyle.accentColor}`}>
                      <p className={`text-sm italic ${designStyle.textColor} opacity-75`}>
                        💡 {slide.notes}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Decoración adicional - formas geométricas */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -z-0"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/5 rounded-full blur-2xl -z-0"></div>
            </div>
          </div>
        );
      })}

      {/* Información adicional */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4 text-center">
        <p className="text-sm text-gray-600 dark:text-gray-300">
          💡 <strong>Tip:</strong> Usa los botones de exportación arriba para descargar esta presentación en formato PowerPoint o PDF
        </p>
      </div>
    </div>
  );
}

// Componente para Correo Electrónico
function EmailContent({ content }: { content: any }) {
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm">
      <div className="border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-600 dark:text-gray-400 w-20">Asunto:</span>
            <span className="text-gray-900 dark:text-white font-medium">{content.subject}</span>
          </div>
        </div>
      </div>
      <div className="px-6 py-6">
        <div className="prose max-w-none">
          <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">{content.body}</p>
        </div>
        {content.closing && (
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">{content.closing}</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Componente para Cuentos/Fábulas
function StoryContent({ content }: { content: any }) {
  return (
    <div className="space-y-6">
      <div className="prose max-w-none">
        <p className="text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-wrap text-lg">
          {content.story}
        </p>
      </div>
      {content.moral && (
        <div className="bg-amber-50 dark:bg-amber-900/30 border-l-4 border-amber-500 p-6 rounded-r-lg">
          <h3 className="text-lg font-semibold text-amber-900 dark:text-amber-200 mb-2">Moraleja</h3>
          <p className="text-amber-800 dark:text-amber-300 italic">{content.moral}</p>
        </div>
      )}
    </div>
  );
}

// Componente para Crucigramas
function CrosswordContent({ content }: { content: any }) {
  // Manejar dos formatos: el viejo (clues.across/down) y el nuevo (clues con type)
  let across: any[] = [];
  let down: any[] = [];

  if (Array.isArray(content.clues)) {
    // Nuevo formato: clues es un array con field 'type'
    across = content.clues.filter((c: any) => c.type === 'across').map((c: any) => ({
      ...c,
      clue: c.text || c.clue
    }));
    down = content.clues.filter((c: any) => c.type === 'down').map((c: any) => ({
      ...c,
      clue: c.text || c.clue
    }));
  } else {
    // Formato viejo: clues.across y clues.down
    const clues = content.clues || {};
    across = clues.across || [];
    down = clues.down || [];
  }

  return (
    <div className="space-y-6">
      {/* Descripción del crucigrama */}
      {content.description && (
        <div className="bg-blue-50 dark:bg-blue-900/30 border-l-4 border-blue-500 p-4 rounded-r-lg">
          <p className="text-blue-900 dark:text-blue-200 font-medium">{content.description}</p>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {across.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <span className="w-8 h-8 bg-blue-500 dark:bg-blue-600 text-white rounded flex items-center justify-center text-sm">→</span>
              Horizontales
            </h3>
            <div className="space-y-2">
              {across.map((clue: any, idx: number) => (
                <div key={idx} className="bg-white dark:bg-gray-800 border-l-4 border-blue-500 border-r border-t border-b border-gray-200 dark:border-gray-700 rounded-r p-3 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <span className="font-bold text-blue-600 dark:text-blue-400 text-lg">{clue.number}.</span>{' '}
                      <span className="text-gray-700 dark:text-gray-300">{clue.clue}</span>
                    </div>
                    <span className="flex-shrink-0 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-semibold px-2 py-1 rounded">
                      {clue.length || clue.answer?.length || 0} letras
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {down.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <span className="w-8 h-8 bg-green-500 dark:bg-green-600 text-white rounded flex items-center justify-center text-sm">↓</span>
              Verticales
            </h3>
            <div className="space-y-2">
              {down.map((clue: any, idx: number) => (
                <div key={idx} className="bg-white dark:bg-gray-800 border-l-4 border-green-500 border-r border-t border-b border-gray-200 dark:border-gray-700 rounded-r p-3 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <span className="font-bold text-green-600 dark:text-green-400 text-lg">{clue.number}.</span>{' '}
                      <span className="text-gray-700 dark:text-gray-300">{clue.clue}</span>
                    </div>
                    <span className="flex-shrink-0 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-semibold px-2 py-1 rounded">
                      {clue.length || clue.answer?.length || 0} letras
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-2 border-blue-200 dark:border-blue-700 rounded-xl p-4">
        <p className="text-sm text-gray-700 dark:text-gray-300 text-center font-medium">
          💡 <strong>Nota:</strong> Usa los botones de exportación arriba para descargar el crucigrama completo con la cuadrícula, o haz clic en "✏️ Realizar" para completarlo de forma interactiva
        </p>
      </div>
    </div>
  );
}

// Componente para Sopa de Letras
function WordSearchContent({ content }: { content: any }) {
  const words = content.words || [];
  const grid = content.grid || [];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Palabras a buscar</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {words.map((wordData: any, idx: number) => (
            <div key={idx} className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg p-3">
              <p className="font-bold text-blue-900 dark:text-blue-200">{wordData.word}</p>
              {wordData.hint && (
                <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">{wordData.hint}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {grid.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Sopa de Letras</h3>
          <div className="inline-block bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-700 rounded-lg p-4">
            <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${grid[0]?.length || 0}, minmax(0, 1fr))` }}>
              {grid.map((row: string[], rowIdx: number) =>
                row.map((letter: string, colIdx: number) => (
                  <div
                    key={`${rowIdx}-${colIdx}`}
                    className="w-8 h-8 border border-gray-300 dark:border-gray-600 flex items-center justify-center font-bold text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-yellow-100 dark:hover:bg-yellow-900/30 transition-colors"
                  >
                    {letter}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Componente por defecto (fallback)
function DefaultContent({ content }: { content: any }) {
  return (
    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
      <pre className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap font-mono overflow-auto max-h-96">
        {JSON.stringify(content, null, 2)}
      </pre>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
        Nota: Vista de contenido no disponible para este tipo de actividad.
      </p>
    </div>
  );
}
