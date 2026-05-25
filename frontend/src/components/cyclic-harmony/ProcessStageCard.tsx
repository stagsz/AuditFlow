'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';
import { CrownedCard } from './CrownedCard';
import { cn } from '@/lib/utils';

export interface ProcessStageCardProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  stageNumber: string;
  status?: 'pending' | 'active' | 'completed';
  progress?: number; // 0-100
  onClick?: () => void;
  className?: string;
}

/**
 * ProcessStageCard - Displays a single stage in a multi-step process
 * Used for ISO sections in the audit flow
 */
export function ProcessStageCard({
  icon: Icon,
  title,
  description,
  stageNumber,
  status = 'pending',
  progress = 0,
  onClick,
  className,
}: ProcessStageCardProps) {
  // Determine crown color based on status and progress
  const getCrownColor = (): 'sage' | 'olive' | 'forest' | 'lime' | 'gradient' => {
    if (status === 'completed') return 'forest';
    if (status === 'active') return 'gradient';
    if (progress > 0) return 'lime';
    return 'sage';
  };

  const getOpacity = () => {
    if (status === 'pending' && progress === 0) return 'opacity-40';
    return 'opacity-100';
  };

  return (
    <div className={cn('relative w-full max-w-[280px]', className)}>
      <CrownedCard
        crownColor={getCrownColor()}
        interactive={!!onClick}
        active={status === 'active'}
        disabled={status === 'pending' && progress === 0}
        onClick={onClick}
        className={cn(
          'h-[320px] flex flex-col transition-opacity duration-300',
          getOpacity()
        )}
      >
        {/* Icon Section */}
        <div className="flex-1 flex items-center justify-center -mt-4">
          <div className={cn(
            'transition-all duration-300',
            status === 'completed' && 'text-harmony-forest',
            status === 'active' && 'text-harmony-olive',
            status === 'pending' && 'text-harmony-sage'
          )}>
            <Icon size={56} strokeWidth={2} />
          </div>
        </div>

        {/* Title & Description */}
        <div className="text-center space-y-2 mb-4">
          <h3 className="font-display font-bold text-lg text-harmony-dark-text leading-tight">
            {title}
          </h3>
          {description && (
            <p className="text-sm text-gray-600 line-clamp-2 leading-generous">
              {description}
            </p>
          )}
        </div>

        {/* Progress Bar (if in progress) */}
        {progress > 0 && progress < 100 && (
          <div className="mb-4">
            <div className="h-1.5 bg-harmony-light-beige rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-harmony-lime to-harmony-olive transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Stage Number */}
        <div className="text-center">
          <span className={cn(
            'inline-block font-display font-medium text-sm tracking-wider',
            status === 'completed' && 'text-harmony-forest',
            status === 'active' && 'text-harmony-olive',
            status === 'pending' && 'text-harmony-sage'
          )}>
            {stageNumber}
          </span>
        </div>

        {/* Completion Checkmark Overlay */}
        {status === 'completed' && (
          <div className="absolute top-4 right-4 w-8 h-8 bg-harmony-forest rounded-full flex items-center justify-center shadow-md">
            <svg
              className="w-5 h-5 text-white"
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
      </CrownedCard>
    </div>
  );
}

export default ProcessStageCard;
