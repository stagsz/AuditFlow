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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-5xl font-display font-extrabold tracking-tight text-navy-900">
            Dashboard
          </h1>
          <p className="text-base font-medium text-muted-foreground mt-1">
            ISO 9001:2015 Quality Management System Overview
          </p>
        </div>
        <Link href="/assessments/new">
          <Button className="h-11 px-6 text-sm font-semibold rounded-full">
            <ClipboardCheck className="mr-2 h-4 w-4" />
            New Assessment
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Overall Compliance */}
        <Card className="border border-slate-200 bg-white shadow-sm">
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-sm font-semibold text-slate-500">Overall Compliance</p>
              <div className="mt-2 flex items-center gap-2">
                <span className="text-5xl font-extrabold tracking-tight text-navy-900">
                  {complianceScore.toFixed(1)}%
                </span>
                {trendInfo.change > 0 && (
                  <span
                    className={`text-sm font-semibold ${
                      trendInfo.direction === 'UP' ? 'text-emerald-600' : 'text-red-600'
                    }`}
                  >
                    {trendInfo.direction === 'UP' ? (
                      <TrendingUp className="inline h-4 w-4 mr-0.5" />
                    ) : (
                      <TrendingDown className="inline h-4 w-4 mr-0.5" />
                    )}
                    {trendInfo.change}%
                  </span>
                )}
              </div>
            </div>
            <CircularProgress value={complianceScore} size={64} colorScheme="compliance" />
          </CardContent>
        </Card>

        {/* Assessments */}
        <Card className="border border-slate-200 bg-white shadow-sm">
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-sm font-semibold text-slate-500">Total Assessments</p>
              <p className="mt-2 text-5xl font-extrabold tracking-tight text-navy-900">
                {overviewData?.assessmentCounts?.total || 0}
              </p>
            </div>
            <div className="rounded-2xl bg-sky-50 p-3">
              <ClipboardCheck className="h-7 w-7 text-sky-600" />
            </div>
          </CardContent>
        </Card>

        {/* Non-Conformities */}
        <Card className="border border-slate-200 bg-white shadow-sm">
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-sm font-semibold text-slate-500">Active Non-Conformities</p>
              <p className="mt-2 text-5xl font-extrabold tracking-tight text-navy-900">{openNCRs}</p>
            </div>
            <div className="rounded-2xl bg-amber-50 p-3">
              <AlertTriangle className="h-7 w-7 text-amber-600" />
            </div>
          </CardContent>
        </Card>

        {/* Closed NCRs */}
        <Card className="border border-slate-200 bg-white shadow-sm">
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-sm font-semibold text-slate-500">NCRs Closed</p>
              <p className="mt-2 text-5xl font-extrabold tracking-tight text-navy-900">
                {ncrCounts?.closed || 0}
              </p>
            </div>
            <div className="rounded-2xl bg-emerald-50 p-3">
              <CheckCircle className="h-7 w-7 text-emerald-600" />
            </div>
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
