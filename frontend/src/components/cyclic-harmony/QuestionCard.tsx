'use client';

import React from 'react';
import { CrownedCard } from './CrownedCard';
import { cn } from '@/lib/utils';

export interface QuestionCardProps {
  questionNumber: string;
  questionText: string;
  guidance?: string;
  score: 0 | 1 | 2 | 3 | 4 | 5 | null;
  justification: string;
  onScoreChange: (score: 0 | 1 | 2 | 3 | 4 | 5) => void;
  onJustificationChange: (justification: string) => void;
  disabled?: boolean;
  className?: string;
}

/**
 * QuestionCard - Displays an audit question with scoring interface
 * Features crowned design with score buttons and justification textarea
 */
export function QuestionCard({
  questionNumber,
  questionText,
  guidance,
  score,
  justification,
  onScoreChange,
  onJustificationChange,
  disabled = false,
  className,
}: QuestionCardProps) {
  const scoreLabels = {
    1: 'Non-compliant',
    2: 'Partially compliant',
    3: 'Fully compliant',
  };

  const scoreColors = {
    1: {
      bg: 'bg-red-50',
      border: 'border-red-300',
      text: 'text-red-700',
      activeBg: 'bg-red-50',
      activeBorder: 'border-red-400',
      activeText: 'text-red-800',
    },
    2: {
      bg: 'bg-amber-50',
      border: 'border-amber-300',
      text: 'text-amber-700',
      activeBg: 'bg-amber-50',
      activeBorder: 'border-amber-500',
      activeText: 'text-amber-800',
    },
    3: {
      bg: 'bg-harmony-lime/20',
      border: 'border-harmony-sage',
      text: 'text-harmony-forest',
      activeBg: 'bg-harmony-lime/40',
      activeBorder: 'border-harmony-olive',
      activeText: 'text-harmony-forest',
    },
  };

  const getCrownColor = (): 'sage' | 'olive' | 'forest' | 'lime' => {
    if (score === 1) return 'sage';
    if (score === 2) return 'lime';
    if (score === 3) return 'forest';
    return 'sage';
  };

  return (
    <CrownedCard
      crownColor={getCrownColor()}
      className={cn('animate-fade-in', className)}
      disabled={disabled}
      crownHeight={25}
    >
      {/* Question Header */}
      <div className="mb-6">
        <div className="flex items-start gap-4 mb-3">
          <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-harmony-light-beige text-harmony-forest font-display font-bold text-sm flex-shrink-0">
            {questionNumber}
          </span>
          <h3 className="font-display font-bold text-lg text-harmony-dark-text leading-tight flex-1">
            {questionText}
          </h3>
        </div>

        {guidance && (
          <div className="ml-14 p-4 bg-harmony-warm-white rounded-xl border border-harmony-light-beige">
            <p className="text-sm text-gray-600 leading-generous italic">
              {guidance}
            </p>
          </div>
        )}
      </div>

      {/* Score Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-harmony-dark-text mb-3">
          Compliance Score
        </label>
        <div className="grid grid-cols-3 gap-3">
          {([1, 2, 3] as const).map((scoreValue) => {
            const colors = scoreColors[scoreValue];
            const isActive = score === scoreValue;

            return (
              <button
                key={scoreValue}
                type="button"
                onClick={() => !disabled && onScoreChange(scoreValue)}
                disabled={disabled}
                className={cn(
                  'relative p-4 rounded-xl border-2 transition-all duration-300',
                  'hover:shadow-md hover:-translate-y-0.5',
                  'disabled:opacity-50 disabled:cursor-not-allowed',
                  isActive
                    ? cn(colors.activeBg, colors.activeBorder, colors.activeText, 'shadow-md scale-105')
                    : cn(colors.bg, colors.border, colors.text)
                )}
              >
                <div className="text-center">
                  <div className="text-3xl font-bold mb-1">{scoreValue}</div>
                  <div className="text-xs font-medium leading-tight">
                    {scoreLabels[scoreValue]}
                  </div>
                </div>

                {/* Active indicator */}
                {isActive && (
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-harmony-forest rounded-full flex items-center justify-center shadow-md">
                    <svg
                      className="w-4 h-4 text-white"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2.5"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Justification */}
      <div>
        <label htmlFor={`justification-${questionNumber}`} className="block text-sm font-medium text-harmony-dark-text mb-3">
          Justification & Evidence
        </label>
        <textarea
          id={`justification-${questionNumber}`}
          value={justification}
          onChange={(e) => !disabled && onJustificationChange(e.target.value)}
          disabled={disabled}
          rows={4}
          placeholder="Provide detailed justification for your score, including evidence and observations..."
          className={cn(
            'w-full px-4 py-3 rounded-xl border-2 transition-all duration-200',
            'focus:outline-none focus:ring-2 focus:ring-harmony-olive focus:border-harmony-olive',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'bg-white border-harmony-light-beige text-gray-700',
            'placeholder:text-gray-400 leading-generous resize-none'
          )}
        />
      </div>
    </CrownedCard>
  );
}

export default QuestionCard;
