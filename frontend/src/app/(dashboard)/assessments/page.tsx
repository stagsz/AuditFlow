'use client';

import { useCallback, useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { format } from 'date-fns';
import {
  Plus,
  Search,
  Filter,
  MoreVertical,
  Eye,
  Edit,
  Copy,
  AlertCircle,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Download,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { ProgressBar } from '@/components/ui/progress-bar';
import { Pagination } from '@/components/ui/pagination';
import { useAssessments } from '@/hooks/useAssessments';
import { useDebounce } from '@/hooks/useDebounce';
import { assessmentsApi } from '@/lib/api';
import { toast } from 'sonner';
import { AssessmentsListSkeleton } from '@/components/assessments/AssessmentsListSkeleton';
import { AssessmentsEmptyState } from '@/components/assessments/AssessmentsEmptyState';

const statusColors: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-700',
  IN_PROGRESS: 'bg-blue-50 text-blue-700',
  UNDER_REVIEW: 'bg-amber-50 text-amber-700',
  COMPLETED: 'bg-green-50 text-green-700',
  ARCHIVED: 'bg-gray-100 text-gray-500',
};

const statusOptions = [
  { value: 'DRAFT', label: 'Draft' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'UNDER_REVIEW', label: 'Under Review' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'ARCHIVED', label: 'Archived' },
];

type SortField = 'createdAt' | 'scheduledDate' | 'overallScore' | 'status';
type SortOrder = 'asc' | 'desc';

interface SortableColumnHeaderProps {
  field: SortField;
  label: string;
  currentSortBy: string;
  currentSortOrder: SortOrder;
  onSort: (field: SortField) => void;
}

function SortableColumnHeader({
  field,
  label,
  currentSortBy,
  currentSortOrder,
  onSort,
}: SortableColumnHeaderProps) {
  const isActive = currentSortBy === field;

  return (
    <button
      onClick={() => onSort(field)}
      className="flex items-center gap-1 font-medium text-gray-600 hover:text-gray-900 transition-colors"
      aria-label={`Sort by ${label}`}
    >
      {label}
      {isActive ? (
        currentSortOrder === 'asc' ? (
          <ArrowUp className="h-4 w-4 text-emerald-600" />
        ) : (
          <ArrowDown className="h-4 w-4 text-emerald-600" />
        )
      ) : (
        <ArrowUpDown className="h-4 w-4 text-gray-400" />
      )}
    </button>
  );
}

export default function AssessmentsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Get filter values from URL
  const statusFilter = searchParams.get('status') || '';
  const searchTermFromUrl = searchParams.get('q') || '';
  const page = parseInt(searchParams.get('page') || '1', 10);
  const pageSize = parseInt(searchParams.get('pageSize') || '10', 10);
  const sortBy = (searchParams.get('sortBy') || 'createdAt') as SortField;
  const sortOrder = (searchParams.get('sortOrder') || 'desc') as SortOrder;

  // Local state for search input (for immediate feedback)
  const [searchInput, setSearchInput] = useState(searchTermFromUrl);

  // State for export loading
  const [isExporting, setIsExporting] = useState(false);

  // Debounce the search input (300ms delay)
  const debouncedSearch = useDebounce(searchInput, 300);

  // Update URL with new filter values
  const updateQueryParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(updates).forEach(([key, value]) => {
        if (value === null || value === '') {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      });

      // Reset to page 1 when filters change (but not when sorting)
      if (!updates.hasOwnProperty('page') &&
          (updates.status !== undefined || updates.q !== undefined) &&
          updates.sortBy === undefined && updates.sortOrder === undefined) {
        params.delete('page');
      }

      const queryString = params.toString();
      router.push(queryString ? `${pathname}?${queryString}` : pathname);
    },
    [router, pathname, searchParams]
  );

  // Sync URL when debounced search value changes
  useEffect(() => {
    // Only update URL if the debounced value differs from the URL value
    if (debouncedSearch !== searchTermFromUrl) {
      updateQueryParams({ q: debouncedSearch });
    }
  }, [debouncedSearch, searchTermFromUrl, updateQueryParams]);

  // Sync local state when URL changes externally (e.g., browser back/forward)
  useEffect(() => {
    if (searchTermFromUrl !== searchInput && searchTermFromUrl !== debouncedSearch) {
      setSearchInput(searchTermFromUrl);
    }
  }, [searchTermFromUrl]);

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateQueryParams({ status: e.target.value });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
  };

  const handlePageChange = (newPage: number) => {
    updateQueryParams({ page: String(newPage) });
  };

  const handlePageSizeChange = (newPageSize: number) => {
    // Reset to page 1 when changing page size
    updateQueryParams({ pageSize: String(newPageSize), page: '1' });
  };

  const handleSort = (field: SortField) => {
    if (sortBy === field) {
      // Toggle sort order if same field
      updateQueryParams({ sortOrder: sortOrder === 'asc' ? 'desc' : 'asc' });
    } else {
      // Default to descending for new field
      updateQueryParams({ sortBy: field, sortOrder: 'desc' });
    }
  };

  // Check if any filters are active
  const hasFilters = Boolean(searchTermFromUrl || statusFilter);

  // Clear all filters
  const handleClearFilters = useCallback(() => {
    setSearchInput('');
    router.push(pathname);
  }, [router, pathname]);

  const handleExportCSV = async () => {
    if (isExporting) return;

    setIsExporting(true);
    try {
      const response = await assessmentsApi.exportCsv();

      // Create a blob from the response data
      const blob = new Blob([response.data], { type: 'text/csv' });

      // Create a download link and trigger the download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;

      // Generate filename with timestamp
      const timestamp = new Date().toISOString().split('T')[0];
      link.download = `assessments-export-${timestamp}.csv`;

      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up the URL object
      window.URL.revokeObjectURL(url);

      toast.success('Assessments exported successfully');
    } catch (error) {
      console.error('Failed to export assessments:', error);
      toast.error('Failed to export assessments. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const { data, isLoading, isError } = useAssessments({
    page,
    pageSize,
    status: statusFilter || undefined,
    q: searchTermFromUrl || undefined,
    sortBy,
    sortOrder,
  });

  const assessments = data?.data || [];
  const pagination = data?.pagination;

  // Show full-page skeleton while loading
  if (isLoading) {
    return <AssessmentsListSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Assessments</h1>
          <p className="text-gray-500">Manage your ISO 9001 self-assessments and audits</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleExportCSV}
            disabled={isExporting}
            loading={isExporting}
          >
            <Download className="mr-2 h-4 w-4" />
            {isExporting ? 'Exporting...' : 'Export to CSV'}
          </Button>
          <Link href="/assessments/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Assessment
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <Input
                  placeholder="Search by title or description..."
                  value={searchInput}
                  onChange={handleSearchChange}
                  className="pl-10"
                  aria-label="Search assessments"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <div className="w-44">
                <Select
                  value={statusFilter}
                  onChange={handleStatusChange}
                  options={statusOptions}
                  placeholder="All Status"
                  aria-label="Filter by status"
                />
              </div>
              <Button variant="outline">
                <Filter className="mr-2 h-4 w-4" />
                More Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sort Controls */}
      {!isLoading && !isError && assessments.length > 0 && (
        <Card>
          <CardContent className="py-3">
            <div className="flex items-center gap-6 text-sm">
              <span className="text-gray-500 font-medium">Sort by:</span>
              <SortableColumnHeader
                field="createdAt"
                label="Created"
                currentSortBy={sortBy}
                currentSortOrder={sortOrder}
                onSort={handleSort}
              />
              <SortableColumnHeader
                field="scheduledDate"
                label="Scheduled"
                currentSortBy={sortBy}
                currentSortOrder={sortOrder}
                onSort={handleSort}
              />
              <SortableColumnHeader
                field="overallScore"
                label="Score"
                currentSortBy={sortBy}
                currentSortOrder={sortOrder}
                onSort={handleSort}
              />
              <SortableColumnHeader
                field="status"
                label="Status"
                currentSortBy={sortBy}
                currentSortOrder={sortOrder}
                onSort={handleSort}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Assessments List */}
      <div className="space-y-4">
        {isError ? (
          <Card>
            <CardContent className="py-12 text-center">
              <AlertCircle className="mx-auto h-12 w-12 text-red-400 mb-4" />
              <p className="text-gray-700 font-medium">Failed to load assessments</p>
              <p className="text-gray-500 text-sm mt-1">Please try refreshing the page</p>
            </CardContent>
          </Card>
        ) : assessments.length === 0 ? (
          <Card>
            <CardContent className="py-6">
              <AssessmentsEmptyState
                hasFilters={hasFilters}
                onClearFilters={handleClearFilters}
              />
            </CardContent>
          </Card>
        ) : (
          assessments.map((assessment) => (
            <Card key={assessment.id} className="hover:shadow-md transition-shadow">
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/assessments/${assessment.id}`}
                        className="text-lg font-semibold text-gray-900 hover:text-emerald-600"
                      >
                        {assessment.title}
                      </Link>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          statusColors[assessment.status] || 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {assessment.status.replace('_', ' ')}
                      </span>
                      <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                        {assessment.auditType}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center gap-6 text-sm text-gray-500">
                      <span>
                        Lead: {assessment.leadAuditor.firstName} {assessment.leadAuditor.lastName}
                      </span>
                      {assessment.scheduledDate && (
                        <span>
                          Scheduled: {format(new Date(assessment.scheduledDate), 'MMM d, yyyy')}
                        </span>
                      )}
                      <span>Responses: {assessment._count.responses}</span>
                      {assessment._count.nonConformities > 0 && (
                        <span className="text-red-600">
                          NC: {assessment._count.nonConformities}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    {/* Progress or Score */}
                    <div className="w-40">
                      {assessment.status === 'COMPLETED' ? (
                        <div className="text-center">
                          <span
                            className={`text-2xl font-bold ${
                              (assessment.overallScore || 0) >= 70
                                ? 'text-green-600'
                                : (assessment.overallScore || 0) >= 50
                                ? 'text-amber-600'
                                : 'text-red-600'
                            }`}
                          >
                            {assessment.overallScore?.toFixed(1)}%
                          </span>
                          <p className="text-xs text-gray-500">Compliance Score</p>
                        </div>
                      ) : (
                        <ProgressBar
                          value={assessment.progress}
                          label="Progress"
                          size="sm"
                        />
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <Link href={`/assessments/${assessment.id}`}>
                        <Button variant="ghost" size="icon" title="View">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      {assessment.status !== 'COMPLETED' && (
                        <Link href={`/assessments/${assessment.id}/edit`}>
                          <Button variant="ghost" size="icon" title="Edit">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                      )}
                      <Button variant="ghost" size="icon" title="Clone">
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" title="More">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Pagination */}
      {!isLoading && !isError && assessments.length > 0 && pagination && (
        <Card>
          <CardContent className="py-4">
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              totalItems={pagination.totalItems}
              pageSize={pagination.pageSize}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
              pageSizeOptions={[10, 25, 50]}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
