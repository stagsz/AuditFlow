'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface NavigationButtonsProps {
  onPrevious?: () => void;
  onNext?: () => void;
  hasPrevious: boolean;
  hasNext: boolean;
  previousLabel?: string;
  nextLabel?: string;
  className?: string;
}

/**
 * NavigationButtons - Previous/Next navigation for section flow
 * Styled with Cyclic Harmony design system
 */
export function NavigationButtons({
  onPrevious,
  onNext,
  hasPrevious,
  hasNext,
  previousLabel = 'Previous Section',
  nextLabel = 'Next Section',
  className,
}: NavigationButtonsProps) {
  return (
    <div className={cn('flex items-center justify-between gap-4', className)}>
      {/* Previous Button */}
      <button
        onClick={onPrevious}
        disabled={!hasPrevious}
        className={cn(
          'group flex items-center gap-3 px-6 py-3 rounded-xl transition-all duration-300',
          'font-medium text-harmony-dark-text',
          hasPrevious
            ? 'bg-white border-2 border-harmony-sage hover:border-harmony-olive hover:bg-harmony-warm-white hover:-translate-x-1 shadow-crown hover:shadow-crown-hover'
            : 'bg-harmony-light-beige text-gray-400 cursor-not-allowed opacity-50'
        )}
      >
        <ChevronLeft
          className={cn(
            'w-5 h-5 transition-transform duration-300',
            hasPrevious && 'group-hover:-translate-x-1'
          )}
        />
        <span>{previousLabel}</span>
      </button>

      {/* Next Button */}
      <button
        onClick={onNext}
        disabled={!hasNext}
        className={cn(
          'group flex items-center gap-3 px-6 py-3 rounded-xl transition-all duration-300',
          'font-medium',
          hasNext
            ? 'bg-gradient-to-r from-harmony-lime to-harmony-sage text-harmony-dark-text hover:from-harmony-sage hover:to-harmony-olive hover:translate-x-1 shadow-crown hover:shadow-crown-hover'
            : 'bg-harmony-light-beige text-gray-400 cursor-not-allowed opacity-50'
        )}
      >
        <span>{nextLabel}</span>
        <ChevronRight
          className={cn(
            'w-5 h-5 transition-transform duration-300',
            hasNext && 'group-hover:translate-x-1'
          )}
        />
      </button>
    </div>
  );
}

export default NavigationButtons;
