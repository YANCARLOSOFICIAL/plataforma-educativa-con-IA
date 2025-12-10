'use client';

import React, { useState, useEffect } from 'react';
import { Card, Badge, Button } from '@/components/ui';
import { CheckCircle, Circle } from 'lucide-react';

interface InteractiveExamProps {
  content: any;
  onAnswersChange: (answers: any) => void;
  isSubmitted: boolean;
}

export function InteractiveExam({ content, onAnswersChange, isSubmitted }: InteractiveExamProps) {
  const [answers, setAnswers] = useState<Record<number, string>>({});

  useEffect(() => {
    onAnswersChange(answers);
  }, [answers, onAnswersChange]);

  const handleAnswerChange = (questionId: number, answer: string) => {
    if (isSubmitted) return;
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  return (
    <div className="space-y-6">
      {content.instructions && (
        <div className="bg-blue-50 dark:bg-blue-900/30 border-l-4 border-blue-500 p-4 rounded-r-lg">
          <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">Instrucciones</h3>
          <p className="text-blue-800 dark:text-blue-300">{content.instructions}</p>
        </div>
      )}

      <div className="space-y-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Preguntas</h3>
        {content.questions?.map((q: any, idx: number) => (
          <Card key={idx} variant="default" padding="lg" className={`transition-all ${isSubmitted ? 'opacity-75' : ''}`}>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-primary-500 text-white rounded-full flex items-center justify-center font-bold">
                  {q.id}
                </div>
                <p className="flex-1 font-semibold text-gray-900 dark:text-white text-lg pt-1">
                  {q.question}
                </p>
              </div>

              {/* Multiple Choice */}
              {q.type === 'multiple_choice' && q.options && (
                <div className="space-y-3 ml-11">
                  {q.options.map((option: string, optIdx: number) => {
                    const optionLetter = String.fromCharCode(65 + optIdx);
                    const isSelected = answers[q.id] === optionLetter;
                    return (
                      <button
                        key={optIdx}
                        onClick={() => handleAnswerChange(q.id, optionLetter)}
                        disabled={isSubmitted}
                        className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                          isSelected
                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                            : 'border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700'
                        } ${isSubmitted ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                      >
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                          isSelected
                            ? 'border-primary-500 bg-primary-500'
                            : 'border-gray-300 dark:border-gray-600'
                        }`}>
                          {isSelected && <Circle className="w-3 h-3 fill-white text-white" />}
                        </div>
                        <span className="flex-1 text-left text-gray-700 dark:text-gray-300">
                          <span className="font-semibold mr-2">{optionLetter}.</span>
                          {option}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* True/False */}
              {q.type === 'true_false' && (
                <div className="space-y-3 ml-11">
                  {['Verdadero', 'Falso'].map((option, optIdx) => {
                    const isSelected = answers[q.id] === option;
                    return (
                      <button
                        key={optIdx}
                        onClick={() => handleAnswerChange(q.id, option)}
                        disabled={isSubmitted}
                        className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                          isSelected
                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                            : 'border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700'
                        } ${isSubmitted ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                      >
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                          isSelected
                            ? 'border-primary-500 bg-primary-500'
                            : 'border-gray-300 dark:border-gray-600'
                        }`}>
                          {isSelected && <Circle className="w-3 h-3 fill-white text-white" />}
                        </div>
                        <span className="flex-1 text-left text-gray-700 dark:text-gray-300 font-medium">
                          {option}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Short Answer */}
              {q.type === 'short_answer' && (
                <div className="ml-11">
                  <textarea
                    value={answers[q.id] || ''}
                    onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                    disabled={isSubmitted}
                    placeholder="Escribe tu respuesta aquí..."
                    rows={3}
                    className={`w-full px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all resize-none ${
                      isSubmitted ? 'cursor-not-allowed opacity-75' : ''
                    }`}
                  />
                </div>
              )}

              {/* Answer Indicator */}
              {answers[q.id] && (
                <div className="ml-11 flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                  <CheckCircle className="w-4 h-4" />
                  <span>Respondida</span>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Progress Indicator */}
      <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Progreso
          </span>
          <span className="text-sm font-bold text-primary-600 dark:text-primary-400">
            {Object.keys(answers).length} / {content.questions?.length || 0}
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className="bg-primary-500 h-2 rounded-full transition-all duration-300"
            style={{
              width: `${((Object.keys(answers).length / (content.questions?.length || 1)) * 100)}%`
            }}
          />
        </div>
      </div>
    </div>
  );
}
