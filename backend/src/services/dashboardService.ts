import { prisma } from '../config/database';
import { AssessmentStatus, NCRStatus, Severity } from '../types/enums';

interface OverviewData {
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

interface SectionBreakdownData {
  sectionId: string;
  sectionNumber: string;
  sectionTitle: string;
  score: number;
  questionsAnswered: number;
  totalQuestions: number;
  compliancePercentage: number;
}

interface TrendDataPoint {
  month: string;
  year: number;
  complianceScore: number;
  assessmentsCompleted: number;
  ncrsOpened: number;
  ncrsClosed: number;
}

export class DashboardService {
  /**
   * Get overview data for the dashboard
   * Returns compliance score, assessment counts by status, and NCR counts
   */
  async getOverview(organizationId: string): Promise<OverviewData> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Get assessment counts by status
    const assessmentStatusCounts = await prisma.assessment.groupBy({
      by: ['status'],
      where: { organizationId },
      _count: { id: true },
    });

    const totalAssessments = await prisma.assessment.count({
      where: { organizationId },
    });

    // Transform assessment status counts
    const assessmentByStatus: Record<string, number> = {};
    for (const item of assessmentStatusCounts) {
      assessmentByStatus[item.status] = item._count.id;
    }

    // Ensure all statuses are present
    for (const status of Object.values(AssessmentStatus)) {
      if (!(status in assessmentByStatus)) {
        assessmentByStatus[status] = 0;
      }
    }

    // Get NCR counts by status
    const ncrStatusCounts = await prisma.nonConformity.groupBy({
      by: ['status'],
      where: {
        assessment: { organizationId },
      },
      _count: { id: true },
    });

    // Get NCR counts by severity
    const ncrSeverityCounts = await prisma.nonConformity.groupBy({
      by: ['severity'],
      where: {
        assessment: { organizationId },
      },
      _count: { id: true },
    });

    const totalNCRs = await prisma.nonConformity.count({
      where: {
        assessment: { organizationId },
      },
    });

    // Transform NCR status counts
    const ncrByStatus: Record<string, number> = {};
    for (const item of ncrStatusCounts) {
      ncrByStatus[item.status] = item._count.id;
    }

    // Ensure all NCR statuses are present
    for (const status of Object.values(NCRStatus)) {
      if (!(status in ncrByStatus)) {
        ncrByStatus[status] = 0;
      }
    }

    // Transform NCR severity counts
    const ncrBySeverity: Record<string, number> = {};
    for (const item of ncrSeverityCounts) {
      ncrBySeverity[item.severity] = item._count.id;
    }

    // Ensure all severities are present
    for (const severity of Object.values(Severity)) {
      if (!(severity in ncrBySeverity)) {
        ncrBySeverity[severity] = 0;
      }
    }

    // Calculate open and closed NCR counts
    const openNCRs = (ncrByStatus[NCRStatus.OPEN] || 0) + (ncrByStatus[NCRStatus.IN_PROGRESS] || 0);
    const closedNCRs = ncrByStatus[NCRStatus.CLOSED] || 0;

    // Calculate overall compliance score from completed assessments
    const completedAssessments = await prisma.assessment.findMany({
      where: {
        organizationId,
        status: AssessmentStatus.COMPLETED,
        overallScore: { not: null },
      },
      select: { overallScore: true },
    });

    let complianceScore = 0;
    if (completedAssessments.length > 0) {
      const totalScore = completedAssessments.reduce(
        (sum, assessment) => sum + (assessment.overallScore || 0),
        0
      );
      complianceScore = Math.round((totalScore / completedAssessments.length) * 10) / 10;
    }

    // Get recent activity (this month)
    const assessmentsThisMonth = await prisma.assessment.count({
      where: {
        organizationId,
        createdAt: { gte: startOfMonth },
      },
    });

    const ncrsCreatedThisMonth = await prisma.nonConformity.count({
      where: {
        assessment: { organizationId },
        createdAt: { gte: startOfMonth },
      },
    });

    const ncrsClosedThisMonth = await prisma.nonConformity.count({
      where: {
        assessment: { organizationId },
        status: NCRStatus.CLOSED,
        updatedAt: { gte: startOfMonth },
      },
    });

    return {
      complianceScore,
      assessmentCounts: {
        total: totalAssessments,
        byStatus: assessmentByStatus,
      },
      ncrCounts: {
        total: totalNCRs,
        open: openNCRs,
        closed: closedNCRs,
        byStatus: ncrByStatus,
        bySeverity: ncrBySeverity,
      },
      recentActivity: {
        assessmentsThisMonth,
        ncrsCreatedThisMonth,
        ncrsClosedThisMonth,
      },
    };
  }

  /**
   * Get section breakdown with scores by ISO section
   * Can optionally filter to a specific assessment
   */
  async getSectionBreakdown(
    organizationId: string,
    assessmentId?: string
  ): Promise<SectionBreakdownData[]> {
    // Build where clause for responses
    const responseWhere: Record<string, unknown> = {
      isDraft: false,
      assessment: { organizationId },
    };

    if (assessmentId) {
      responseWhere.assessmentId = assessmentId;
    }

    // Get all ISO sections
    const sections = await prisma.iSOStandardSection.findMany({
      where: {
        parentId: null, // Only top-level sections
      },
      orderBy: { order: 'asc' },
      include: {
        questions: {
          where: { isActive: true },
          select: { id: true },
        },
      },
    });

    const sectionBreakdown: SectionBreakdownData[] = [];

    for (const section of sections) {
      // Get all questions for this section and its children
      const sectionQuestionIds = await this.getSectionQuestionIds(section.id);

      if (sectionQuestionIds.length === 0) {
        continue;
      }

      // Get responses for these questions
      const responses = await prisma.questionResponse.findMany({
        where: {
          ...responseWhere,
          questionId: { in: sectionQuestionIds },
          score: { not: null },
        },
        select: { score: true },
      });

      const questionsAnswered = responses.length;
      const totalQuestions = sectionQuestionIds.length;

      if (questionsAnswered === 0) {
        sectionBreakdown.push({
          sectionId: section.id,
          sectionNumber: section.sectionNumber,
          sectionTitle: section.title,
          score: 0,
          questionsAnswered: 0,
          totalQuestions,
          compliancePercentage: 0,
        });
        continue;
      }

      // Calculate score
      const totalScore = responses.reduce((sum, r) => sum + (r.score || 0), 0);
      const maxPossibleScore = questionsAnswered * 3;
      const scorePercentage = (totalScore / maxPossibleScore) * 100;

      sectionBreakdown.push({
        sectionId: section.id,
        sectionNumber: section.sectionNumber,
        sectionTitle: section.title,
        score: Math.round(scorePercentage * 10) / 10,
        questionsAnswered,
        totalQuestions,
        compliancePercentage: Math.round(scorePercentage * 10) / 10,
      });
    }

    return sectionBreakdown;
  }

  /**
   * Get historical trend data for the last 6 months
   */
  async getTrends(organizationId: string): Promise<TrendDataPoint[]> {
    const trends: TrendDataPoint[] = [];
    const now = new Date();

    // Generate data for the last 6 months
    for (let i = 5; i >= 0; i--) {
      const targetDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const nextMonth = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 1);

      const monthName = targetDate.toLocaleString('en-US', { month: 'short' });
      const year = targetDate.getFullYear();

      // Get completed assessments in this month
      const completedAssessments = await prisma.assessment.findMany({
        where: {
          organizationId,
          status: AssessmentStatus.COMPLETED,
          completedDate: {
            gte: targetDate,
            lt: nextMonth,
          },
        },
        select: { overallScore: true },
      });

      // Calculate average compliance score for the month
      let complianceScore = 0;
      if (completedAssessments.length > 0) {
        const totalScore = completedAssessments.reduce(
          (sum, a) => sum + (a.overallScore || 0),
          0
        );
        complianceScore = Math.round((totalScore / completedAssessments.length) * 10) / 10;
      }

      // Get NCRs opened in this month
      const ncrsOpened = await prisma.nonConformity.count({
        where: {
          assessment: { organizationId },
          createdAt: {
            gte: targetDate,
            lt: nextMonth,
          },
        },
      });

      // Get NCRs closed in this month (updated to CLOSED status in this month)
      const ncrsClosed = await prisma.nonConformity.count({
        where: {
          assessment: { organizationId },
          status: NCRStatus.CLOSED,
          updatedAt: {
            gte: targetDate,
            lt: nextMonth,
          },
        },
      });

      trends.push({
        month: monthName,
        year,
        complianceScore,
        assessmentsCompleted: completedAssessments.length,
        ncrsOpened,
        ncrsClosed,
      });
    }

    return trends;
  }

  /**
   * Get all question IDs for a section and its children recursively
   */
  private async getSectionQuestionIds(sectionId: string): Promise<string[]> {
    const questionIds: string[] = [];

    // Get questions directly in this section
    const directQuestions = await prisma.auditQuestion.findMany({
      where: {
        sectionId,
        isActive: true,
      },
      select: { id: true },
    });

    questionIds.push(...directQuestions.map((q) => q.id));

    // Get child sections
    const childSections = await prisma.iSOStandardSection.findMany({
      where: { parentId: sectionId },
      select: { id: true },
    });

    // Recursively get questions from child sections
    for (const child of childSections) {
      const childQuestionIds = await this.getSectionQuestionIds(child.id);
      questionIds.push(...childQuestionIds);
    }

    return questionIds;
  }
}

export const dashboardService = new DashboardService();
