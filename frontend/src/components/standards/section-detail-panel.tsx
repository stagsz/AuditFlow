'use client';

import { useState } from 'react';
import { clsx } from 'clsx';
import {
  BookOpen,
  FileText,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ISOSection, AuditQuestion, useQuestionsBySection } from '@/hooks/useStandards';

interface ScoreCriteriaProps {
  score1: string;
  score2: string;
  score3: string;
}

function ScoreCriteria({ score1, score2, score3 }: ScoreCriteriaProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {/* Score 1 - Non-compliant */}
      <div className="rounded-xl border border-red-200 bg-red-50 p-3">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center text-xs font-bold">
            1
          </div>
          <span className="text-sm font-medium text-red-700">Non-Compliant</span>
        </div>
        <p className="text-xs text-red-600">{score1}</p>
      </div>

      {/* Score 2 - Partially compliant */}
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs font-bold">
            2
          </div>
          <span className="text-sm font-medium text-amber-700">Partially Compliant</span>
        </div>
        <p className="text-xs text-amber-600">{score2}</p>
      </div>

      {/* Score 3 - Fully compliant */}
      <div className="rounded-xl border border-green-200 bg-green-50 p-3">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center text-xs font-bold">
            3
          </div>
          <span className="text-sm font-medium text-green-700">Fully Compliant</span>
        </div>
        <p className="text-xs text-green-600">{score3}</p>
      </div>
    </div>
  );
}

interface QuestionItemProps {
  question: AuditQuestion;
  isExpanded: boolean;
  onToggle: () => void;
}

function QuestionItem({ question, isExpanded, onToggle }: QuestionItemProps) {
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      {/* Question header */}
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-start gap-3 p-4 text-left hover:bg-gray-50 transition-colors"
      >
        <div className="flex-shrink-0 mt-0.5">
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-700">
              {question.questionNumber}
            </span>
            {question.standardReference && (
              <span className="text-xs text-gray-500">
                Ref: {question.standardReference}
              </span>
            )}
            {!question.isActive && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-500">
                Inactive
              </span>
            )}
          </div>
          <p className="text-sm text-gray-900">{question.questionText}</p>
        </div>
      </button>

      {/* Expanded content */}
      {isExpanded && (
        <div className="px-4 pb-4 pt-0">
          <div className="ml-8 space-y-4">
            {/* Guidance section */}
            {question.guidance && (
              <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
                <div className="flex items-start gap-2">
                  <HelpCircle className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-blue-700 mb-1">
                      Auditor Guidance
                    </p>
                    <p className="text-sm text-blue-600">{question.guidance}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Score criteria */}
            <div>
              <p className="text-xs font-medium text-gray-700 uppercase tracking-wide mb-2">
                Scoring Criteria
              </p>
              <ScoreCriteria
                score1={question.score1Criteria}
                score2={question.score2Criteria}
                score3={question.score3Criteria}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function QuestionsLoadingSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="border border-gray-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <Skeleton width={20} height={20} />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Skeleton width={60} height={20} />
                <Skeleton width={80} height={16} />
              </div>
              <Skeleton width="100%" height={16} />
              <Skeleton width="80%" height={16} className="mt-1" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

interface SectionDetailPanelProps {
  section: ISOSection | null;
}

export function SectionDetailPanel({ section }: SectionDetailPanelProps) {
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(
    new Set()
  );

  const { data: questionsData, isLoading: isLoadingQuestions } =
    useQuestionsBySection(section?.id ?? null);

  const questions = questionsData?.data ?? [];
  const questionCount = section?._count?.questions ?? 0;

  const toggleQuestion = (questionId: string) => {
    setExpandedQuestions((prev) => {
      const next = new Set(prev);
      if (next.has(questionId)) {
        next.delete(questionId);
      } else {
        next.add(questionId);
      }
      return next;
    });
  };

  const expandAllQuestions = () => {
    setExpandedQuestions(new Set(questions.map((q) => q.id)));
  };

  const collapseAllQuestions = () => {
    setExpandedQuestions(new Set());
  };

  // Empty state - no section selected
  if (!section) {
    return (
      <Card className="h-full">
        <CardContent className="h-full flex items-center justify-center py-12">
          <div className="text-center text-gray-500">
            <BookOpen className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="font-medium">Select a section</p>
            <p className="text-sm mt-1">
              Click on a section to view its details and questions
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-emerald-50 rounded-xl flex-shrink-0">
            <BookOpen className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="min-w-0">
            <CardTitle className="text-lg">
              {section.sectionNumber} {section.title}
            </CardTitle>
            {section.description && (
              <p className="text-sm text-gray-500 mt-1">{section.description}</p>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-6">
        {/* Section metadata */}
        <div className="grid grid-cols-2 gap-4 pb-4 border-b">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">
              Section Number
            </p>
            <p className="font-medium text-gray-900">{section.sectionNumber}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">
              Questions
            </p>
            <p className="font-medium text-gray-900">{questionCount}</p>
          </div>
        </div>

        {/* Subsections summary */}
        {section.children.length > 0 && (
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">
              Subsections ({section.children.length})
            </p>
            <div className="space-y-1">
              {section.children.map((child) => (
                <div
                  key={child.id}
                  className="flex items-center justify-between py-1.5 px-2 bg-gray-50 rounded"
                >
                  <span className="text-sm text-gray-700">
                    <span className="font-medium">{child.sectionNumber}</span>{' '}
                    {child.title}
                  </span>
                  {(child._count?.questions ?? 0) > 0 && (
                    <span className="text-xs text-gray-500">
                      {child._count?.questions} questions
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Questions section */}
        {questionCount > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-gray-500 uppercase tracking-wide">
                Audit Questions
              </p>
              {questions.length > 1 && (
                <div className="flex items-center gap-2 text-xs">
                  <button
                    onClick={expandAllQuestions}
                    className="text-emerald-600 hover:text-emerald-700 font-medium"
                  >
                    Expand All
                  </button>
                  <span className="text-gray-300">|</span>
                  <button
                    onClick={collapseAllQuestions}
                    className="text-emerald-600 hover:text-emerald-700 font-medium"
                  >
                    Collapse All
                  </button>
                </div>
              )}
            </div>

            {isLoadingQuestions ? (
              <QuestionsLoadingSkeleton />
            ) : questions.length > 0 ? (
              <div className="space-y-3">
                {questions.map((question) => (
                  <QuestionItem
                    key={question.id}
                    question={question}
                    isExpanded={expandedQuestions.has(question.id)}
                    onToggle={() => toggleQuestion(question.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500 border border-dashed border-gray-200 rounded-xl">
                <AlertCircle className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">No questions found for this section</p>
              </div>
            )}
          </div>
        )}

        {/* No content message */}
        {section.children.length === 0 && questionCount === 0 && (
          <div className="text-center py-6 text-gray-500">
            <FileText className="w-8 h-8 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">No questions defined for this section</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
