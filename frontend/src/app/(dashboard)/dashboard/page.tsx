'use client';

import {
  ClipboardCheck,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CircularProgress } from '@/components/ui/progress-bar';
import {
  ComplianceBarChart,
  ComplianceRadarChart,
  TrendLineChart,
} from '@/components/charts/compliance-chart';
import { useDashboard } from '@/hooks/useDashboard';
import { DashboardSkeleton } from '@/components/dashboard/dashboard-skeleton';
import { DashboardEmptyState } from '@/components/dashboard/dashboard-empty-state';

export default function DashboardPage() {
  const { overview, sections, trends, isLoading } = useDashboard();

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  const hasNoAssessments = !overview.data?.assessmentCounts?.total;
  if (hasNoAssessments) {
    return <DashboardEmptyState />;
  }

  const sectionScores = (sections.data || []).map((s) => ({
    section: s.sectionTitle,
    sectionNumber: s.sectionNumber,
    score: s.score,
  }));

  const trendData = (trends.data || []).map((t) => ({
    date: t.month,
    score: t.complianceScore,
  }));

  const calculateTrend = () => {
    const data = trends.data || [];
    if (data.length < 2) return { direction: 'UP' as const, change: 0 };
    const current = data[data.length - 1]?.complianceScore || 0;
    const previous = data[data.length - 2]?.complianceScore || 0;
    const change = Math.abs(current - previous);
    return {
      direction: current >= previous ? 'UP' as const : 'DOWN' as const,
      change: Math.round(change * 10) / 10,
    };
  };

  const trendInfo = calculateTrend();
  const overviewData = overview.data;
  const complianceScore = overviewData?.complianceScore || 0;
  const ncrCounts = overviewData?.ncrCounts;
  const majorCount = ncrCounts?.bySeverity?.MAJOR || 0;
  const minorCount = ncrCounts?.bySeverity?.MINOR || 0;
  const openNCRs = ncrCounts?.open || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-0.5">ISO 9001:2015 Quality Management System Overview</p>
        </div>
        <Link href="/assessments/new">
          <Button>
            <ClipboardCheck className="mr-2 h-4 w-4" />
            New Assessment
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Overall Compliance */}
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Overall Compliance</p>
                <div className="flex items-center mt-1">
                  <span className="text-3xl font-bold text-gray-900">
                    {complianceScore.toFixed(1)}%
                  </span>
                  {trendInfo.change > 0 && (
                    <span
                      className={`ml-2 flex items-center text-sm font-medium ${
                        trendInfo.direction === 'UP' ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {trendInfo.direction === 'UP' ? (
                        <TrendingUp className="h-4 w-4 mr-0.5" />
                      ) : (
                        <TrendingDown className="h-4 w-4 mr-0.5" />
                      )}
                      {trendInfo.change}%
                    </span>
                  )}
                </div>
              </div>
              <CircularProgress value={complianceScore} size={60} colorScheme="compliance" />
            </div>
          </CardContent>
        </Card>

        {/* Assessments */}
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Assessments</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {overviewData?.assessmentCounts?.total || 0}
                </p>
              </div>
              <div className="p-3 bg-blue-50 rounded-xl">
                <ClipboardCheck className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-3">
              {overviewData?.recentActivity?.assessmentsThisMonth || 0} this month
            </p>
          </CardContent>
        </Card>

        {/* Non-Conformities */}
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Active Non-Conformities</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{openNCRs}</p>
              </div>
              <div className="p-3 bg-red-50 rounded-xl">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-3">
              {majorCount} major, {minorCount} minor
            </p>
          </CardContent>
        </Card>

        {/* Closed NCRs */}
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">NCRs Closed</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {ncrCounts?.closed || 0}
                </p>
              </div>
              <div className="p-3 bg-green-50 rounded-xl">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-3">
              {overviewData?.recentActivity?.ncrsClosedThisMonth || 0} this month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      {sectionScores.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <Card>
            <CardHeader>
              <CardTitle>Compliance by Section</CardTitle>
            </CardHeader>
            <CardContent>
              <ComplianceBarChart data={sectionScores} height={280} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Compliance Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <ComplianceRadarChart data={sectionScores} height={280} />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Trend Chart */}
      {trendData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Compliance Trend (Last 6 Months)</CardTitle>
          </CardHeader>
          <CardContent>
            <TrendLineChart data={trendData} height={250} />
          </CardContent>
        </Card>
      )}

      {/* Assessment Status Breakdown */}
      {overviewData?.assessmentCounts && (
        <Card>
          <CardHeader>
            <CardTitle>Assessment Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {Object.entries(overviewData.assessmentCounts.byStatus).map(([status, count]) => (
                <div key={status} className="p-4 bg-gray-50 rounded-xl text-center border border-gray-100">
                  <p className="text-2xl font-bold text-gray-900">{count}</p>
                  <p className="text-sm text-gray-500 capitalize mt-1">
                    {status.toLowerCase().replace('_', ' ')}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* NCR Status Breakdown */}
      {overviewData?.ncrCounts && overviewData.ncrCounts.total > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Non-Conformity Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(overviewData.ncrCounts.byStatus).map(([status, count]) => (
                <div key={status} className="p-4 bg-gray-50 rounded-xl text-center border border-gray-100">
                  <p className="text-2xl font-bold text-gray-900">{count}</p>
                  <p className="text-sm text-gray-500 capitalize mt-1">
                    {status.toLowerCase().replace('_', ' ')}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
