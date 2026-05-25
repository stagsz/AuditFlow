'use client';

import { clsx } from 'clsx';
import { HelpCircle, AlertTriangle, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { ScoreGroup } from '@/components/ui/score-button';

export interface Question {
  id: string;
  questionNumber: string;
  questionText: string;
  guidance?: string | null;
  standardReference?: string | null;
  score0Criteria?: string | null;
  score1Criteria?: string | null;
  score2Criteria?: string | null;
  score3Criteria?: string | null;
  score4Criteria?: string | null;
  score5Criteria?: string | null;
}

export interface QuestionResponse {
  score: 0 | 1 | 2 | 3 | 4 | 5 | null;
  justification?: string;
  isDraft?: boolean;
}

export const MAX_JUSTIFICATION_LENGTH = 2000;

interface QuestionCardProps {
  question: Question;
  response?: QuestionResponse;
  onScoreChange: (score: 0 | 1 | 2 | 3 | 4 | 5) => void;
  onJustificationChange?: (justification: string) => void;
  disabled?: boolean;
  showGuidance?: boolean;
  className?: string;
}

const scoreColors: Record<0 | 1 | 2 | 3 | 4 | 5, string> = {
  0: 'border-l-gray-500 bg-gray-50/30',
  1: 'border-l-red-500 bg-red-50/30',
  2: 'border-l-orange-500 bg-orange-50/30',
  3: 'border-l-yellow-500 bg-amber-50/30',
  4: 'border-l-green-500 bg-green-50/30',
  5: 'border-l-blue-500 bg-blue-50/30',
};

const scoreLabels: Record<0 | 1 | 2 | 3 | 4 | 5, string> = {
  0: 'Not Applicable',
  1: 'Non-Compliant',
  2: 'Initial',
  3: 'Developing',
  4: 'Established',
  5: 'Optimizing',
};

export function QuestionCard({
  question,
  response,
  onScoreChange,
  onJustificationChange,
  disabled = false,
  showGuidance = true,
  className,
}: QuestionCardProps) {
  const currentScore = response?.score;
  const hasScore = currentScore !== null && currentScore !== undefined;
  const justificationText = response?.justification ?? '';
  const justificationLength = justificationText.length;

  // Determine if justification is required (score 1-2 need justification, 0=N/A doesn't)
  const requiresJustification = hasScore && currentScore > 0 && currentScore < 3;
  const hasJustification = justificationText.trim().length > 0;
  const showJustificationWarning = requiresJustification && !hasJustification;
  const isOverLimit = justificationLength > MAX_JUSTIFICATION_LENGTH;

  return (
    <Card
      className={clsx(
        'border-l-4 transition-colors',
        hasScore ? scoreColors[currentScore] : 'border-l-gray-300',
        className
      )}
    >
      <CardContent className="pt-6">
        {/* Question Header */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                {question.questionNumber}
              </span>
              {question.standardReference && (
                <span className="text-xs text-gray-500">
                  Ref: {question.standardReference}
                </span>
              )}
            </div>
            <p className="text-gray-900 font-medium">{question.questionText}</p>
          </div>

          {/* Current Score Badge */}
          {hasScore && (
            <div
              className={clsx(
                'flex-shrink-0 px-3 py-1.5 rounded-xl text-sm font-medium',
                currentScore === 0 && 'bg-gray-100 text-gray-700',
                currentScore === 1 && 'bg-red-50 text-red-700',
                currentScore === 2 && 'bg-orange-100 text-orange-700',
                currentScore === 3 && 'bg-amber-50 text-amber-700',
                currentScore === 4 && 'bg-green-50 text-green-700',
                currentScore === 5 && 'bg-blue-50 text-blue-700'
              )}
            >
              {scoreLabels[currentScore]}
            </div>
          )}
        </div>

        {/* Guidance Section */}
        {showGuidance && question.guidance && (
          <div className="mb-6 p-3 bg-blue-50 rounded-xl border border-blue-100">
            <div className="flex items-start gap-2">
              <HelpCircle className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-medium text-blue-700 mb-1">Auditor Guidance</p>
                <p className="text-sm text-blue-600">{question.guidance}</p>
              </div>
            </div>
          </div>
        )}

        {/* Score Buttons */}
        <div className="mb-4">
          <p className="text-sm font-medium text-gray-700 mb-3 text-center">
            Select Compliance Score
          </p>
          <ScoreGroup
            value={currentScore ?? undefined}
            onChange={onScoreChange}
            criteria={{
              score0: question.score0Criteria,
              score1: question.score1Criteria,
              score2: question.score2Criteria,
              score3: question.score3Criteria,
              score4: question.score4Criteria,
              score5: question.score5Criteria,
            }}
            disabled={disabled}
          />
        </div>

        {/* Justification Textarea */}
        {hasScore && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <label
                htmlFor={`justification-${question.id}`}
                className="text-sm font-medium text-gray-700 flex items-center gap-1.5"
              >
                Justification / Notes
                {requiresJustification && (
                  <span className="text-red-500 text-xs font-semibold">
                    (Required)
                  </span>
                )}
              </label>
              <span
                className={clsx(
                  'text-xs',
                  isOverLimit ? 'text-red-500 font-medium' : 'text-gray-500'
                )}
              >
                {justificationLength.toLocaleString()} / {MAX_JUSTIFICATION_LENGTH.toLocaleString()}
              </span>
            </div>
            <textarea
              id={`justification-${question.id}`}
              value={justificationText}
              onChange={(e) => onJustificationChange?.(e.target.value)}
              placeholder={
                requiresJustification
                  ? 'Please explain why this item is not fully compliant...'
                  : 'Add notes or evidence references (optional)...'
              }
              disabled={disabled}
              rows={3}
              className={clsx(
                'w-full rounded-md border px-3 py-2 text-sm resize-y min-h-[80px] max-h-[200px]',
                'placeholder:text-gray-400',
                'focus:outline-none focus:ring-2 focus:border-transparent',
                'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-50',
                requiresJustification && !hasJustification
                  ? 'border-amber-400 focus:ring-amber-500 bg-amber-50/50'
                  : isOverLimit
                  ? 'border-red-400 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-emerald-400 bg-white'
              )}
            />
            {showJustificationWarning && (
              <div className="mt-2 flex items-center gap-1.5">
                <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0" />
                <p className="text-xs text-amber-700">
                  Justification is required for non-compliant scores
                </p>
              </div>
            )}
            {isOverLimit && (
              <div className="mt-2 flex items-center gap-1.5">
                <AlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0" />
                <p className="text-xs text-red-600">
                  Justification exceeds maximum length
                </p>
              </div>
            )}
          </div>
        )}

        {/* Draft Indicator */}
        {response?.isDraft && (
          <div className="mt-4 flex items-center justify-end">
            <span className="text-xs text-gray-500 italic">Draft - not yet saved</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Compact variant for list views
interface QuestionCardCompactProps {
  question: Question;
  response?: QuestionResponse;
  onClick?: () => void;
  className?: string;
}

export function QuestionCardCompact({
  question,
  response,
  onClick,
  className,
}: QuestionCardCompactProps) {
  const currentScore = response?.score;
  const hasScore = currentScore !== null && currentScore !== undefined;

  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        'w-full text-left p-4 rounded-xl border-l-4 bg-white border border-gray-200 transition-all',
        'hover:shadow-md hover:border-gray-300',
        hasScore ? scoreColors[currentScore] : 'border-l-gray-300',
        className
      )}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">
              {question.questionNumber}
            </span>
            {hasScore && (
              <span
                className={clsx(
                  'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium',
                  currentScore === 0 && 'bg-gray-100 text-gray-700',
                  currentScore === 1 && 'bg-red-50 text-red-700',
                  currentScore === 2 && 'bg-orange-100 text-orange-700',
                  currentScore === 3 && 'bg-amber-50 text-amber-700',
                  currentScore === 4 && 'bg-green-50 text-green-700',
                  currentScore === 5 && 'bg-blue-50 text-blue-700'
                )}
              >
                Score: {currentScore}
              </span>
            )}
            {!hasScore && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-500">
                Not scored
              </span>
            )}
          </div>
          <p className="text-sm text-gray-900 truncate">{question.questionText}</p>
        </div>
        <div className="flex-shrink-0">
          <div
            className={clsx(
              'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold',
              !hasScore && 'bg-gray-100 text-gray-400',
              currentScore === 0 && 'bg-gray-500 text-white',
              currentScore === 1 && 'bg-red-500 text-white',
              currentScore === 2 && 'bg-orange-500 text-white',
              currentScore === 3 && 'bg-amber-500 text-white',
              currentScore === 4 && 'bg-green-500 text-white',
              currentScore === 5 && 'bg-blue-500 text-white'
            )}
          >
            {hasScore ? (currentScore === 0 ? 'N/A' : currentScore) : '-'}
          </div>
        </div>
      </div>
    </button>
  );
}
