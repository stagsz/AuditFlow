import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '@/lib/api';

// Types matching backend API responses
export interface OverviewData {
  complianceScore: number;
  assessmentCounts: {
    total: number;
    byStatus: Record<string, number>;
  };
  ncrCounts: {
    total: number;
    open: number;
    closed: number;
    byStatus: Record<string, number>;
    bySeverity: Record<string, number>;
  };
  recentActivity: {
    assessmentsThisMonth: number;
    ncrsCreatedThisMonth: number;
    ncrsClosedThisMonth: number;
  };
}

export interface SectionBreakdownData {
  sectionId: string;
  sectionNumber: string;
  sectionTitle: string;
  score: number;
  questionsAnswered: number;
  totalQuestions: number;
  compliancePercentage: number;
}

export interface TrendDataPoint {
  month: string;
  year: number;
  complianceScore: number;
  assessmentsCompleted: number;
  ncrsOpened: number;
  ncrsClosed: number;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export function useDashboardOverview() {
  return useQuery({
    queryKey: ['dashboard', 'overview'],
    queryFn: async () => {
      const response = await dashboardApi.getOverview();
      return (response.data as ApiResponse<OverviewData>).data;
    },
  });
}

export function useDashboardSections(assessmentId?: string) {
  return useQuery({
    queryKey: ['dashboard', 'sections', assessmentId],
    queryFn: async () => {
      const response = await dashboardApi.getSections(assessmentId);
      return (response.data as ApiResponse<SectionBreakdownData[]>).data;
    },
  });
}

export function useDashboardTrends() {
  return useQuery({
    queryKey: ['dashboard', 'trends'],
    queryFn: async () => {
      const response = await dashboardApi.getTrends();
      return (response.data as ApiResponse<TrendDataPoint[]>).data;
    },
  });
}

// Combined hook that fetches all dashboard data
export function useDashboard() {
  const overview = useDashboardOverview();
  const sections = useDashboardSections();
  const trends = useDashboardTrends();

  return {
    overview,
    sections,
    trends,
    isLoading: overview.isLoading || sections.isLoading || trends.isLoading,
    isError: overview.isError || sections.isError || trends.isError,
  };
}
