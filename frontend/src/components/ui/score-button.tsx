'use client';

import { clsx } from 'clsx';

interface ScoreButtonProps {
  score: 0 | 1 | 2 | 3 | 4 | 5;
  selected: boolean;
  onClick: () => void;
  criteria?: string | null;
  disabled?: boolean;
}

const scoreConfig = {
  0: {
    label: 'Not Applicable',
    shortLabel: 'N/A',
    bgColor: 'bg-gray-100 hover:bg-gray-200',
    selectedBg: 'bg-gray-500',
    textColor: 'text-gray-600',
    selectedText: 'text-white',
    borderColor: 'border-gray-300',
    selectedBorder: 'border-gray-600',
    ringColor: 'ring-gray-400',
  },
  1: {
    label: 'Non-Compliant',
    shortLabel: '1',
    bgColor: 'bg-red-50 hover:bg-red-100',
    selectedBg: 'bg-red-500',
    textColor: 'text-red-700',
    selectedText: 'text-white',
    borderColor: 'border-red-200',
    selectedBorder: 'border-red-600',
    ringColor: 'ring-red-400',
  },
  2: {
    label: 'Initial',
    shortLabel: '2',
    bgColor: 'bg-amber-50 hover:bg-amber-100',
    selectedBg: 'bg-amber-500',
    textColor: 'text-amber-700',
    selectedText: 'text-white',
    borderColor: 'border-amber-200',
    selectedBorder: 'border-amber-600',
    ringColor: 'ring-amber-400',
  },
  3: {
    label: 'Developing',
    shortLabel: '3',
    bgColor: 'bg-yellow-50 hover:bg-yellow-100',
    selectedBg: 'bg-yellow-500',
    textColor: 'text-yellow-700',
    selectedText: 'text-white',
    borderColor: 'border-yellow-200',
    selectedBorder: 'border-yellow-600',
    ringColor: 'ring-yellow-400',
  },
  4: {
    label: 'Established',
    shortLabel: '4',
    bgColor: 'bg-green-50 hover:bg-green-100',
    selectedBg: 'bg-green-500',
    textColor: 'text-green-700',
    selectedText: 'text-white',
    borderColor: 'border-green-200',
    selectedBorder: 'border-green-600',
    ringColor: 'ring-green-400',
  },
  5: {
    label: 'Optimizing',
    shortLabel: '5',
    bgColor: 'bg-blue-50 hover:bg-blue-100',
    selectedBg: 'bg-blue-600',
    textColor: 'text-blue-700',
    selectedText: 'text-white',
    borderColor: 'border-blue-200',
    selectedBorder: 'border-blue-700',
    ringColor: 'ring-blue-400',
  },
};

export function ScoreButton({ score, selected, onClick, criteria, disabled }: ScoreButtonProps) {
  const config = scoreConfig[score];

  return (
    <div className="relative group">
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className={clsx(
          'score-button flex flex-col items-center justify-center p-3 rounded-xl border-2 min-w-[90px] transition-all duration-200',
          selected
            ? `${config.selectedBg} ${config.selectedBorder} ${config.selectedText} ring-2 ring-offset-2 ${config.ringColor} shadow-md`
            : `${config.bgColor} ${config.borderColor} ${config.textColor}`,
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        <span className="text-xl font-bold">{config.shortLabel}</span>
        <span className="text-xs mt-1 text-center leading-tight">{config.label}</span>
      </button>

      {/* Tooltip with criteria */}
      {criteria && criteria.trim() && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 w-64 z-10 pointer-events-none shadow-xl">
          <div className="font-medium mb-1">{config.label}</div>
          <div className="text-gray-300 text-xs">{criteria}</div>
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-8 border-transparent border-t-gray-900" />
        </div>
      )}
    </div>
  );
}

interface ScoreGroupProps {
  value?: 0 | 1 | 2 | 3 | 4 | 5;
  onChange: (score: 0 | 1 | 2 | 3 | 4 | 5) => void;
  criteria: {
    score0?: string | null;
    score1?: string | null;
    score2?: string | null;
    score3?: string | null;
    score4?: string | null;
    score5?: string | null;
  };
  disabled?: boolean;
}

export function ScoreGroup({ value, onChange, criteria, disabled }: ScoreGroupProps) {
  return (
    <div className="flex gap-3 justify-center flex-wrap">
      <ScoreButton
        score={0}
        selected={value === 0}
        onClick={() => onChange(0)}
        criteria={criteria.score0 || 'Not applicable to this organization'}
        disabled={disabled}
      />
      <ScoreButton
        score={1}
        selected={value === 1}
        onClick={() => onChange(1)}
        criteria={criteria.score1 || 'No evidence, not addressed'}
        disabled={disabled}
      />
      <ScoreButton
        score={2}
        selected={value === 2}
        onClick={() => onChange(2)}
        criteria={criteria.score2 || 'Awareness exists, no formal implementation'}
        disabled={disabled}
      />
      <ScoreButton
        score={3}
        selected={value === 3}
        onClick={() => onChange(3)}
        criteria={criteria.score3 || 'Partially implemented, inconsistent'}
        disabled={disabled}
      />
      <ScoreButton
        score={4}
        selected={value === 4}
        onClick={() => onChange(4)}
        criteria={criteria.score4 || 'Fully implemented, consistent application'}
        disabled={disabled}
      />
      <ScoreButton
        score={5}
        selected={value === 5}
        onClick={() => onChange(5)}
        criteria={criteria.score5 || 'Exceeds requirements, continual improvement'}
        disabled={disabled}
      />
    </div>
  );
}
