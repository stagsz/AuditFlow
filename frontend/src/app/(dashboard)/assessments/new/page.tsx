'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { ArrowLeft, ClipboardList, FileText } from 'lucide-react';
import { assessmentsApi, templatesApi } from '@/lib/api';
import { isNetworkError, getAuthErrorInfo } from '@/lib/auth-errors';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { TeamMemberSelect, TeamMember } from '@/components/ui/team-member-select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface Template {
  id: string;
  name: string;
  description: string | null;
  isDefault: boolean;
  includedClauses: string[] | null;
  includedSections: string[] | null;
}

const auditTypeOptions = [
  { value: 'INTERNAL', label: 'Internal Audit' },
  { value: 'EXTERNAL', label: 'External Audit' },
  { value: 'SURVEILLANCE', label: 'Surveillance Audit' },
  { value: 'CERTIFICATION', label: 'Certification Audit' },
];

const assessmentSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be 200 characters or less'),
  description: z.string().max(2000, 'Description must be 2000 characters or less').optional(),
  auditType: z.enum(['INTERNAL', 'EXTERNAL', 'SURVEILLANCE', 'CERTIFICATION']),
  templateId: z.string().optional(),
  scheduledDate: z.string().optional(),
  dueDate: z.string().optional(),
}).refine((data) => {
  if (data.scheduledDate && data.dueDate) {
    return new Date(data.scheduledDate) <= new Date(data.dueDate);
  }
  return true;
}, {
  message: 'Scheduled date must be before or equal to due date',
  path: ['dueDate'],
});

type AssessmentFormData = z.infer<typeof assessmentSchema>;

export default function NewAssessmentPage() {
  const router = useRouter();
  const [descriptionLength, setDescriptionLength] = useState(0);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [templatesLoading, setTemplatesLoading] = useState(true);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<AssessmentFormData>({
    resolver: zodResolver(assessmentSchema),
    defaultValues: {
      auditType: 'INTERNAL',
      description: '',
      templateId: '',
    },
  });

  // Watch template selection
  const watchedTemplateId = watch('templateId');

  // Fetch templates on mount
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const response = await templatesApi.list();
        const templateList = response.data.data || [];
        setTemplates(templateList);

        // Auto-select default template if one exists
        const defaultTemplate = templateList.find((t: Template) => t.isDefault);
        if (defaultTemplate) {
          setValue('templateId', defaultTemplate.id);
        }
      } catch {
        // Templates are optional, so we don't need to show an error
        // Just leave the dropdown empty
      } finally {
        setTemplatesLoading(false);
      }
    };

    fetchTemplates();
  }, [setValue]);

  const templateOptions = [
    { value: '', label: 'No template' },
    ...templates.map((template) => ({
      value: template.id,
      label: template.isDefault ? `${template.name} (Default)` : template.name,
    })),
  ];

  const onSubmit = async (data: AssessmentFormData) => {
    try {
      const response = await assessmentsApi.create({
        title: data.title,
        description: data.description || undefined,
        auditType: data.auditType,
        scheduledDate: data.scheduledDate || undefined,
        dueDate: data.dueDate || undefined,
        templateId: data.templateId || undefined,
        teamMembers: teamMembers.length > 0 ? teamMembers : undefined,
      });

      toast.success('Assessment created successfully!');
      router.push(`/assessments/${response.data.data.id}`);
    } catch (err: unknown) {
      if (isNetworkError(err)) {
        return;
      }

      const errorInfo = getAuthErrorInfo(err);
      toast.error(errorInfo.message, {
        description: errorInfo.title !== 'Error' ? errorInfo.title : undefined,
      });
    }
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDescriptionLength(e.target.value.length);
  };

  // Get selected template details
  const selectedTemplate = templates.find(t => t.id === watchedTemplateId);

  // Helper to get template scope description
  const getTemplateScopeText = (template: Template | undefined) => {
    if (!template) return null;

    if (!template.includedClauses && !template.includedSections) {
      return 'Full assessment - all ISO 9001:2015 clauses (4-10)';
    }

    if (template.includedClauses) {
      const clauseList = template.includedClauses.join(', ');
      return `ISO 9001:2015 Clause${template.includedClauses.length > 1 ? 's' : ''} ${clauseList}`;
    }

    if (template.includedSections) {
      return `${template.includedSections.length} specific sections selected`;
    }

    return null;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/assessments">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create New Assessment</h1>
          <p className="text-gray-500">Set up a new ISO 9001 self-assessment or audit</p>
        </div>
      </div>

      {/* Form Card */}
      <Card className="max-w-2xl">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 rounded-xl">
              <ClipboardList className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <CardTitle>Assessment Details</CardTitle>
              <CardDescription>
                Provide the basic information for your assessment
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Title */}
            <Input
              {...register('title')}
              type="text"
              label="Title"
              placeholder="e.g., Q1 2026 Internal Audit"
              error={errors.title?.message}
              autoComplete="off"
            />

            {/* Description */}
            <div className="w-full">
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Description
              </label>
              <textarea
                {...register('description', {
                  onChange: handleDescriptionChange,
                })}
                id="description"
                rows={4}
                placeholder="Describe the scope and objectives of this assessment..."
                className={`flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 resize-none ${
                  errors.description ? 'border-red-400 focus:ring-red-500' : ''
                }`}
              />
              <div className="mt-1 flex justify-between text-sm">
                <span className={errors.description ? 'text-red-500' : 'text-transparent'}>
                  {errors.description?.message || ' '}
                </span>
                <span className={`text-gray-400 ${descriptionLength > 2000 ? 'text-red-500' : ''}`}>
                  {descriptionLength}/2000
                </span>
              </div>
            </div>

            {/* Template Selection */}
            <div className="w-full space-y-2">
              <label
                htmlFor="templateId"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Template
                  <span className="text-gray-400 font-normal">(optional)</span>
                </div>
              </label>
              {templatesLoading ? (
                <div className="h-10 w-full rounded-md border border-gray-300 bg-gray-50 animate-pulse" />
              ) : templates.length > 0 ? (
                <>
                  <Select
                    {...register('templateId')}
                    id="templateId"
                    options={templateOptions}
                    error={errors.templateId?.message}
                  />
                  {errors.templateId && (
                    <p className="mt-1 text-sm text-red-500">{errors.templateId.message}</p>
                  )}

                  {/* Selected Template Info */}
                  {selectedTemplate && watchedTemplateId && (
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-md space-y-2">
                      {selectedTemplate.description && (
                        <p className="text-sm text-gray-700">
                          {selectedTemplate.description}
                        </p>
                      )}
                      {getTemplateScopeText(selectedTemplate) && (
                        <div className="flex items-center gap-2 text-sm">
                          <span className="font-medium text-blue-900">Scope:</span>
                          <span className="text-blue-800">
                            {getTemplateScopeText(selectedTemplate)}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <div className="flex items-center gap-2 px-3 py-2 text-sm text-gray-500 bg-gray-50 rounded-md border border-gray-200">
                  <span>No templates available</span>
                </div>
              )}
            </div>

            {/* Team Members */}
            <TeamMemberSelect
              value={teamMembers}
              onChange={setTeamMembers}
            />

            {/* Audit Type */}
            <div className="w-full">
              <label
                htmlFor="auditType"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Audit Type
              </label>
              <Select
                {...register('auditType')}
                id="auditType"
                options={auditTypeOptions}
                error={errors.auditType?.message}
              />
              {errors.auditType && (
                <p className="mt-1 text-sm text-red-500">{errors.auditType.message}</p>
              )}
            </div>

            {/* Date Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="w-full">
                <label
                  htmlFor="scheduledDate"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Scheduled Date
                </label>
                <div className="relative">
                  <input
                    {...register('scheduledDate')}
                    type="date"
                    id="scheduledDate"
                    className={`flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 ${
                      errors.scheduledDate ? 'border-red-400 focus:ring-red-500' : ''
                    }`}
                  />
                </div>
                {errors.scheduledDate && (
                  <p className="mt-1 text-sm text-red-500">{errors.scheduledDate.message}</p>
                )}
              </div>

              <div className="w-full">
                <label
                  htmlFor="dueDate"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Due Date
                </label>
                <div className="relative">
                  <input
                    {...register('dueDate')}
                    type="date"
                    id="dueDate"
                    className={`flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 ${
                      errors.dueDate ? 'border-red-400 focus:ring-red-500' : ''
                    }`}
                  />
                </div>
                {errors.dueDate && (
                  <p className="mt-1 text-sm text-red-500">{errors.dueDate.message}</p>
                )}
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t">
              <Link href="/assessments">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" loading={isSubmitting}>
                Create Assessment
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
