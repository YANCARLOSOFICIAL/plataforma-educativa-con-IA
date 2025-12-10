'use client';

import React from 'react';
import { InteractiveExam } from './InteractiveExam';

interface InteractiveSurveyProps {
  content: any;
  onAnswersChange: (answers: any) => void;
  isSubmitted: boolean;
}

export function InteractiveSurvey({ content, onAnswersChange, isSubmitted }: InteractiveSurveyProps) {
  // Las encuestas tienen la misma estructura que los exámenes
  return <InteractiveExam content={content} onAnswersChange={onAnswersChange} isSubmitted={isSubmitted} />;
}
