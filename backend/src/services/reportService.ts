import PDFDocument from 'pdfkit';
import { prisma } from '../config/database';
import { NotFoundError, ValidationError, AuthorizationError } from '../utils/errors';
import { AssessmentStatus, NCRStatus, Severity, UserRole } from '../types/enums';

// Optional PowerPoint support - only import if available
let PptxGenJs: any;
try {
  PptxGenJs = require('pptxgenjs');
} catch (e) {
  console.warn('PowerPoint support disabled: pptxgenjs not installed. Run: npm install pptxgenjs');
}

// Color constants for the report
const COLORS = {
  PRIMARY: '#1e40af',
  SECONDARY: '#475569',
  SUCCESS: '#16a34a',
  WARNING: '#ca8a04',
  DANGER: '#dc2626',
  LIGHT_GRAY: '#f1f5f9',
  DARK_GRAY: '#334155',
  WHITE: '#ffffff',
};

// Score color mapping
const SCORE_COLORS: Record<number, string> = {
  1: COLORS.DANGER,
  2: COLORS.WARNING,
  3: COLORS.SUCCESS,
};

interface SectionScore {
  sectionId: string;
  sectionNumber: string;
  sectionTitle: string;
  score: number;
  actualScore: number;
  maxPossibleScore: number;
  questionsAnswered: number;
  totalQuestions: number;
}

interface ReportData {
  assessment: {
    id: string;
    title: string;
    description: string | null;
    status: string;
    auditType: string;
    scope: string | null;
    objectives: string | null;
    overallScore: number | null;
    sectionScores: string | null;
    scheduledDate: Date | null;
    dueDate: Date | null;
    completedDate: Date | null;
    createdAt: Date;
    organization: {
      id: string;
      name: string;
    };
    leadAuditor: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
    };
    teamMembers: Array<{
      role: string;
      user: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
      };
    }>;
  };
  findings: Array<{
    id: string;
    score: number | null;
    justification: string | null;
    question: {
      id: string;
      questionNumber: string;
      questionText: string;
      standardReference: string | null;
    };
    section: {
      id: string;
      sectionNumber: string;
      title: string;
    } | null;
  }>;
  nonConformities: Array<{
    id: string;
    title: string;
    description: string;
    severity: string;
    status: string;
    rootCause: string | null;
    correctiveActions: Array<{
      id: string;
      description: string;
      status: string;
      priority: string;
      targetDate: Date | null;
      completedDate: Date | null;
    }>;
  }>;
  sectionBreakdown: SectionScore[];
}

export class ReportService {
  /**
   * Generate a PDF report for an assessment
   * Returns a buffer containing the PDF data
   */
  async generateAssessmentReport(
    assessmentId: string,
    organizationId: string,
    userId: string,
    userRole: UserRole
  ): Promise<Buffer> {
    // Fetch all data needed for the report
    const reportData = await this.getReportData(assessmentId, organizationId, userId, userRole);

    // Generate the PDF
    return this.createPDF(reportData);
  }

  /**
   * Fetch all data needed for the report
   */
  private async getReportData(
    assessmentId: string,
    organizationId: string,
    userId: string,
    userRole: UserRole
  ): Promise<ReportData> {
    // Fetch the assessment with all related data
    const assessment = await prisma.assessment.findFirst({
      where: {
        id: assessmentId,
        organizationId,
      },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
          },
        },
        leadAuditor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        teamMembers: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!assessment) {
      throw new NotFoundError('Assessment', assessmentId);
    }

    // Check if user has permission to generate report
    const canGenerateReport = this.canAccessReport(assessment, userId, userRole);
    if (!canGenerateReport) {
      throw new AuthorizationError('You do not have permission to generate reports for this assessment');
    }

    // Reports can only be generated for COMPLETED or UNDER_REVIEW assessments
    if (assessment.status !== AssessmentStatus.COMPLETED && assessment.status !== AssessmentStatus.UNDER_REVIEW) {
      throw new ValidationError(
        `Reports can only be generated for completed or under review assessments. Current status: ${assessment.status}`
      );
    }

    // Fetch findings (questions with score < 3)
    const findings = await prisma.questionResponse.findMany({
      where: {
        assessmentId,
        isDraft: false,
        score: {
          lt: 3,
        },
      },
      include: {
        question: {
          select: {
            id: true,
            questionNumber: true,
            questionText: true,
            standardReference: true,
          },
        },
        section: {
          select: {
            id: true,
            sectionNumber: true,
            title: true,
          },
        },
      },
      orderBy: [
        { score: 'asc' },
        { sectionId: 'asc' },
      ],
    });

    // Fetch non-conformities with corrective actions
    const nonConformities = await prisma.nonConformity.findMany({
      where: {
        assessmentId,
      },
      include: {
        correctiveActions: {
          select: {
            id: true,
            description: true,
            status: true,
            priority: true,
            targetDate: true,
            completedDate: true,
          },
          orderBy: {
            priority: 'desc',
          },
        },
      },
      orderBy: [
        { severity: 'desc' },
        { status: 'asc' },
      ],
    });

    // Parse section scores from the assessment
    let sectionBreakdown: SectionScore[] = [];
    if (assessment.sectionScores && typeof assessment.sectionScores === 'string') {
      try {
        sectionBreakdown = JSON.parse(assessment.sectionScores) as SectionScore[];
      } catch {
        sectionBreakdown = [];
      }
    }

    return {
      assessment: {
        ...assessment,
        objectives: typeof assessment.objectives === 'string' ? assessment.objectives : null,
        sectionScores: typeof assessment.sectionScores === 'string' ? assessment.sectionScores : null,
      },
      findings,
      nonConformities,
      sectionBreakdown,
    };
  }

  /**
   * Create the PDF document
   */
  private createPDF(data: ReportData): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      const doc = new PDFDocument({
        size: 'A4',
        margins: { top: 50, bottom: 50, left: 50, right: 50 },
        info: {
          Title: `Assessment Report - ${data.assessment.title}`,
          Author: 'ISO 9001 Audit Management System',
          Subject: 'Assessment Report',
          Creator: 'ISO 9001 Audit Management System',
        },
      });

      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Generate report sections
      this.addCoverPage(doc, data);
      this.addExecutiveSummary(doc, data);
      this.addSectionBreakdown(doc, data);
      this.addFindingsList(doc, data);
      this.addNCRSummary(doc, data);
      this.addRecommendations(doc, data);

      // Finalize the document
      doc.end();
    });
  }

  /**
   * Add cover page
   */
  private addCoverPage(doc: typeof PDFDocument.prototype, data: ReportData): void {
    const { assessment } = data;
    const pageWidth = 595.28; // A4 width in points

    // Title
    doc.fontSize(28)
      .fillColor(COLORS.PRIMARY)
      .text('ISO 9001:2015', { align: 'center' })
      .moveDown(0.5);

    doc.fontSize(24)
      .fillColor(COLORS.DARK_GRAY)
      .text('Assessment Report', { align: 'center' })
      .moveDown(2);

    // Assessment title
    doc.fontSize(18)
      .fillColor(COLORS.PRIMARY)
      .text(assessment.title, { align: 'center' })
      .moveDown(0.5);

    // Organization
    doc.fontSize(14)
      .fillColor(COLORS.SECONDARY)
      .text(assessment.organization.name, { align: 'center' })
      .moveDown(2);

    // Visual Score Gauge
    this.addScoreGauge(doc, assessment.overallScore, pageWidth);
    doc.moveDown(2);

    // Key details box
    const boxY = doc.y;
    const boxWidth = 300;
    const boxX = (pageWidth - boxWidth) / 2 - 50;

    doc.rect(boxX, boxY, boxWidth, 130)
      .fillAndStroke(COLORS.LIGHT_GRAY, COLORS.PRIMARY);

    doc.fontSize(11)
      .fillColor(COLORS.DARK_GRAY);

    const labelX = boxX + 20;
    const valueX = boxX + 120;
    let currentY = boxY + 20;

    // Status
    doc.text('Status:', labelX, currentY);
    doc.font('Helvetica-Bold')
      .text(assessment.status.replace('_', ' '), valueX, currentY);
    currentY += 22;

    // Audit Type
    doc.font('Helvetica')
      .text('Audit Type:', labelX, currentY);
    doc.font('Helvetica-Bold')
      .text(assessment.auditType.replace('_', ' '), valueX, currentY);
    currentY += 22;

    // Lead Auditor
    doc.font('Helvetica')
      .fillColor(COLORS.DARK_GRAY)
      .text('Lead Auditor:', labelX, currentY);
    doc.font('Helvetica-Bold')
      .text(`${assessment.leadAuditor.firstName} ${assessment.leadAuditor.lastName}`, valueX, currentY);
    currentY += 22;

    // Date
    doc.font('Helvetica')
      .text('Report Date:', labelX, currentY);
    doc.font('Helvetica-Bold')
      .text(new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }), valueX, currentY);

    // Footer with completion date if available
    doc.y = 700;
    doc.fontSize(10)
      .font('Helvetica')
      .fillColor(COLORS.SECONDARY);

    if (assessment.completedDate) {
      doc.text(`Assessment Completed: ${new Date(assessment.completedDate).toLocaleDateString('en-US')}`, { align: 'center' });
    }
    if (assessment.scheduledDate) {
      doc.text(`Scheduled Date: ${new Date(assessment.scheduledDate).toLocaleDateString('en-US')}`, { align: 'center' });
    }

    doc.addPage();
  }

  /**
   * Add visual score gauge on cover page
   */
  private addScoreGauge(doc: typeof PDFDocument.prototype, score: number | null, pageWidth: number): void {
    const centerX = pageWidth / 2;
    const gaugeY = doc.y + 20;
    const outerRadius = 60;
    const innerRadius = 45;
    const startAngle = Math.PI * 0.75; // Start at 135 degrees (bottom-left)
    const endAngle = Math.PI * 2.25; // End at 405 degrees (bottom-right)
    const totalAngle = endAngle - startAngle;

    // Draw background arc (gray)
    doc.save();
    this.drawArc(doc, centerX, gaugeY + outerRadius, outerRadius, innerRadius, startAngle, endAngle, COLORS.LIGHT_GRAY);

    // Draw score arc (colored based on score)
    if (score !== null && score > 0) {
      const scoreAngle = startAngle + (totalAngle * (score / 100));
      const scoreColor = this.getScoreColor(score);
      this.drawArc(doc, centerX, gaugeY + outerRadius, outerRadius, innerRadius, startAngle, scoreAngle, scoreColor);
    }

    // Draw center circle (white background for text)
    doc.circle(centerX, gaugeY + outerRadius, innerRadius - 5)
      .fill(COLORS.WHITE);

    // Draw score text in center
    const scoreText = score !== null ? `${Math.round(score)}%` : 'N/A';
    const scoreColor = this.getScoreColor(score);
    doc.fontSize(20)
      .font('Helvetica-Bold')
      .fillColor(scoreColor)
      .text(scoreText, centerX - 30, gaugeY + outerRadius - 12, { width: 60, align: 'center' });

    // Draw label below gauge
    doc.fontSize(10)
      .font('Helvetica')
      .fillColor(COLORS.SECONDARY)
      .text('Overall Compliance', centerX - 50, gaugeY + outerRadius * 2 + 10, { width: 100, align: 'center' });

    // Draw scale markers
    this.drawGaugeMarkers(doc, centerX, gaugeY + outerRadius, outerRadius + 8);

    doc.restore();

    // Update doc.y to account for gauge height
    doc.y = gaugeY + outerRadius * 2 + 35;
  }

  /**
   * Draw an arc segment for the gauge
   */
  private drawArc(
    doc: typeof PDFDocument.prototype,
    cx: number,
    cy: number,
    outerRadius: number,
    innerRadius: number,
    startAngle: number,
    endAngle: number,
    color: string
  ): void {
    const segments = 50; // Number of segments for smooth arc
    const angleStep = (endAngle - startAngle) / segments;

    // Build path for arc segment
    doc.path(`M ${cx + Math.cos(startAngle) * innerRadius} ${cy + Math.sin(startAngle) * innerRadius}`);

    // Inner arc (going forward)
    for (let i = 0; i <= segments; i++) {
      const angle = startAngle + (angleStep * i);
      const x = cx + Math.cos(angle) * innerRadius;
      const y = cy + Math.sin(angle) * innerRadius;
      doc.lineTo(x, y);
    }

    // Line to outer radius
    doc.lineTo(cx + Math.cos(endAngle) * outerRadius, cy + Math.sin(endAngle) * outerRadius);

    // Outer arc (going backward)
    for (let i = segments; i >= 0; i--) {
      const angle = startAngle + (angleStep * i);
      const x = cx + Math.cos(angle) * outerRadius;
      const y = cy + Math.sin(angle) * outerRadius;
      doc.lineTo(x, y);
    }

    doc.closePath();
    doc.fill(color);
  }

  /**
   * Draw gauge scale markers (0%, 50%, 100%)
   */
  private drawGaugeMarkers(doc: typeof PDFDocument.prototype, cx: number, cy: number, radius: number): void {
    const startAngle = Math.PI * 0.75;
    const endAngle = Math.PI * 2.25;
    const markers = [
      { value: 0, angle: startAngle },
      { value: 50, angle: startAngle + (endAngle - startAngle) * 0.5 },
      { value: 100, angle: endAngle },
    ];

    doc.fontSize(8)
      .font('Helvetica')
      .fillColor(COLORS.SECONDARY);

    for (const marker of markers) {
      const x = cx + Math.cos(marker.angle) * radius;
      const y = cy + Math.sin(marker.angle) * radius;
      const labelX = marker.value === 0 ? x - 15 : marker.value === 100 ? x - 5 : x - 8;
      const labelY = marker.value === 50 ? y - 12 : y - 4;
      doc.text(`${marker.value}`, labelX, labelY);
    }
  }

  /**
   * Add executive summary section
   */
  private addExecutiveSummary(doc: typeof PDFDocument.prototype, data: ReportData): void {
    const { assessment, findings, nonConformities } = data;

    this.addSectionHeader(doc, 'Executive Summary');

    // Description
    if (assessment.description) {
      doc.fontSize(11)
        .font('Helvetica')
        .fillColor(COLORS.DARK_GRAY)
        .text(assessment.description)
        .moveDown();
    }

    // Scope
    if (assessment.scope) {
      doc.font('Helvetica-Bold')
        .fontSize(12)
        .text('Scope:')
        .font('Helvetica')
        .fontSize(11)
        .text(assessment.scope)
        .moveDown();
    }

    // Objectives
    if (assessment.objectives) {
      let objectives: string[] = [];
      try {
        objectives = JSON.parse(assessment.objectives) as string[];
      } catch {
        objectives = [assessment.objectives];
      }

      if (objectives.length > 0) {
        doc.font('Helvetica-Bold')
          .fontSize(12)
          .text('Objectives:')
          .font('Helvetica')
          .fontSize(11);

        for (const objective of objectives) {
          doc.text(`• ${objective}`, { indent: 15 });
        }
        doc.moveDown();
      }
    }

    // Key Statistics
    doc.font('Helvetica-Bold')
      .fontSize(12)
      .text('Key Statistics:')
      .moveDown(0.5);

    const score1Count = findings.filter(f => f.score === 1).length;
    const score2Count = findings.filter(f => f.score === 2).length;
    const openNCRs = nonConformities.filter(n => n.status !== NCRStatus.CLOSED).length;
    const closedNCRs = nonConformities.filter(n => n.status === NCRStatus.CLOSED).length;
    const criticalNCRs = nonConformities.filter(n => n.severity === Severity.CRITICAL).length;
    const majorNCRs = nonConformities.filter(n => n.severity === Severity.MAJOR).length;

    const stats = [
      { label: 'Overall Compliance Score', value: assessment.overallScore !== null ? `${assessment.overallScore.toFixed(1)}%` : 'N/A' },
      { label: 'Non-Compliant Findings (Score 1)', value: score1Count.toString() },
      { label: 'Partial Compliance Findings (Score 2)', value: score2Count.toString() },
      { label: 'Total Non-Conformities', value: nonConformities.length.toString() },
      { label: 'Open NCRs', value: openNCRs.toString() },
      { label: 'Closed NCRs', value: closedNCRs.toString() },
      { label: 'Critical Severity NCRs', value: criticalNCRs.toString() },
      { label: 'Major Severity NCRs', value: majorNCRs.toString() },
    ];

    doc.font('Helvetica')
      .fontSize(11);

    for (const stat of stats) {
      doc.text(`• ${stat.label}: `, { continued: true })
        .font('Helvetica-Bold')
        .text(stat.value)
        .font('Helvetica');
    }

    // Team Members
    if (assessment.teamMembers.length > 0) {
      doc.moveDown()
        .font('Helvetica-Bold')
        .fontSize(12)
        .text('Audit Team:')
        .font('Helvetica')
        .fontSize(11);

      for (const member of assessment.teamMembers) {
        doc.text(`• ${member.user.firstName} ${member.user.lastName} (${member.role.replace('_', ' ')})`);
      }
    }

    doc.addPage();
  }

  /**
   * Add section breakdown
   */
  private addSectionBreakdown(doc: typeof PDFDocument.prototype, data: ReportData): void {
    const { sectionBreakdown } = data;

    this.addSectionHeader(doc, 'Section Breakdown');

    if (sectionBreakdown.length === 0) {
      doc.fontSize(11)
        .font('Helvetica-Oblique')
        .fillColor(COLORS.SECONDARY)
        .text('No section scores available.')
        .moveDown();
      return;
    }

    // Table header
    const tableTop = doc.y;
    const col1 = 50;
    const col2 = 150;
    const col3 = 350;
    const col4 = 420;
    const col5 = 480;

    doc.fontSize(10)
      .font('Helvetica-Bold')
      .fillColor(COLORS.PRIMARY);

    doc.text('Section', col1, tableTop);
    doc.text('Title', col2, tableTop);
    doc.text('Score', col3, tableTop);
    doc.text('Questions', col4, tableTop);
    doc.text('Status', col5, tableTop);

    // Underline
    doc.moveTo(col1, tableTop + 15)
      .lineTo(550, tableTop + 15)
      .strokeColor(COLORS.PRIMARY)
      .stroke();

    let rowY = tableTop + 25;

    doc.font('Helvetica')
      .fontSize(10)
      .fillColor(COLORS.DARK_GRAY);

    for (const section of sectionBreakdown) {
      // Check if we need a new page
      if (rowY > 700) {
        doc.addPage();
        rowY = 50;
      }

      doc.text(section.sectionNumber, col1, rowY);
      doc.text(section.sectionTitle.substring(0, 30), col2, rowY);

      // Score with color
      doc.fillColor(this.getScoreColor(section.score))
        .text(`${section.score.toFixed(1)}%`, col3, rowY);

      doc.fillColor(COLORS.DARK_GRAY)
        .text(`${section.questionsAnswered}/${section.totalQuestions}`, col4, rowY);

      // Status indicator
      const status = section.score >= 80 ? 'Good' : section.score >= 60 ? 'Fair' : 'Poor';
      doc.fillColor(this.getScoreColor(section.score))
        .text(status, col5, rowY);

      rowY += 20;
    }

    doc.moveDown(2);
    doc.addPage();
  }

  /**
   * Add findings list
   */
  private addFindingsList(doc: typeof PDFDocument.prototype, data: ReportData): void {
    const { findings } = data;

    this.addSectionHeader(doc, 'Findings');

    if (findings.length === 0) {
      doc.fontSize(11)
        .font('Helvetica')
        .fillColor(COLORS.SUCCESS)
        .text('No findings with scores below 3 (fully compliant).')
        .moveDown();
      doc.addPage();
      return;
    }

    doc.fontSize(11)
      .font('Helvetica')
      .fillColor(COLORS.DARK_GRAY)
      .text(`Total findings requiring attention: ${findings.length}`)
      .moveDown();

    // Group findings by score
    const score1Findings = findings.filter(f => f.score === 1);
    const score2Findings = findings.filter(f => f.score === 2);

    // Non-compliant findings (Score 1)
    if (score1Findings.length > 0) {
      doc.font('Helvetica-Bold')
        .fontSize(12)
        .fillColor(COLORS.DANGER)
        .text(`Non-Compliant (Score 1) - ${score1Findings.length} findings`)
        .moveDown(0.5);

      this.addFindingsTable(doc, score1Findings);
    }

    // Partial compliance findings (Score 2)
    if (score2Findings.length > 0) {
      if (score1Findings.length > 0) {
        doc.moveDown();
      }

      doc.font('Helvetica-Bold')
        .fontSize(12)
        .fillColor(COLORS.WARNING)
        .text(`Partial Compliance (Score 2) - ${score2Findings.length} findings`)
        .moveDown(0.5);

      this.addFindingsTable(doc, score2Findings);
    }

    doc.addPage();
  }

  /**
   * Add findings table
   */
  private addFindingsTable(doc: typeof PDFDocument.prototype, findings: ReportData['findings']): void {
    for (const finding of findings) {
      // Check if we need a new page
      if (doc.y > 680) {
        doc.addPage();
      }

      const sectionInfo = finding.section
        ? `${finding.section.sectionNumber} - ${finding.section.title}`
        : 'Unknown Section';

      doc.font('Helvetica-Bold')
        .fontSize(10)
        .fillColor(COLORS.PRIMARY)
        .text(`${finding.question.questionNumber}: ${sectionInfo}`)
        .font('Helvetica')
        .fontSize(10)
        .fillColor(COLORS.DARK_GRAY)
        .text(finding.question.questionText, { indent: 15 });

      if (finding.justification) {
        doc.font('Helvetica-Oblique')
          .fillColor(COLORS.SECONDARY)
          .text(`Justification: ${finding.justification}`, { indent: 15 });
      }

      if (finding.question.standardReference) {
        doc.font('Helvetica')
          .fontSize(9)
          .fillColor(COLORS.SECONDARY)
          .text(`Standard Reference: ${finding.question.standardReference}`, { indent: 15 });
      }

      doc.moveDown(0.5);
    }
  }

  /**
   * Add NCR summary
   */
  private addNCRSummary(doc: typeof PDFDocument.prototype, data: ReportData): void {
    const { nonConformities } = data;

    this.addSectionHeader(doc, 'Non-Conformity Report Summary');

    if (nonConformities.length === 0) {
      doc.fontSize(11)
        .font('Helvetica')
        .fillColor(COLORS.SUCCESS)
        .text('No non-conformities recorded for this assessment.')
        .moveDown();
      doc.addPage();
      return;
    }

    // Summary counts
    const statusCounts: Record<string, number> = {};
    const severityCounts: Record<string, number> = {};

    for (const ncr of nonConformities) {
      statusCounts[ncr.status] = (statusCounts[ncr.status] || 0) + 1;
      severityCounts[ncr.severity] = (severityCounts[ncr.severity] || 0) + 1;
    }

    doc.fontSize(11)
      .font('Helvetica')
      .fillColor(COLORS.DARK_GRAY)
      .text(`Total NCRs: ${nonConformities.length}`)
      .moveDown(0.5);

    doc.font('Helvetica-Bold')
      .text('By Status:');
    for (const [status, count] of Object.entries(statusCounts)) {
      doc.font('Helvetica')
        .text(`  • ${status.replace('_', ' ')}: ${count}`);
    }

    doc.moveDown(0.5)
      .font('Helvetica-Bold')
      .text('By Severity:');
    for (const [severity, count] of Object.entries(severityCounts)) {
      const color = severity === Severity.CRITICAL ? COLORS.DANGER
        : severity === Severity.MAJOR ? COLORS.WARNING
        : COLORS.SECONDARY;
      doc.font('Helvetica')
        .fillColor(color)
        .text(`  • ${severity}: ${count}`);
    }

    doc.fillColor(COLORS.DARK_GRAY)
      .moveDown();

    // List each NCR
    doc.font('Helvetica-Bold')
      .fontSize(12)
      .text('NCR Details:')
      .moveDown(0.5);

    for (const ncr of nonConformities) {
      // Check if we need a new page
      if (doc.y > 650) {
        doc.addPage();
      }

      const severityColor = ncr.severity === Severity.CRITICAL ? COLORS.DANGER
        : ncr.severity === Severity.MAJOR ? COLORS.WARNING
        : COLORS.SECONDARY;

      doc.font('Helvetica-Bold')
        .fontSize(10)
        .fillColor(COLORS.PRIMARY)
        .text(ncr.title)
        .font('Helvetica')
        .fontSize(9)
        .fillColor(severityColor)
        .text(`Severity: ${ncr.severity} | Status: ${ncr.status.replace('_', ' ')}`, { indent: 10 })
        .fillColor(COLORS.DARK_GRAY)
        .text(ncr.description, { indent: 10 });

      if (ncr.rootCause) {
        doc.font('Helvetica-Oblique')
          .text(`Root Cause: ${ncr.rootCause}`, { indent: 10 });
      }

      // Corrective actions
      if (ncr.correctiveActions.length > 0) {
        doc.font('Helvetica-Bold')
          .fontSize(9)
          .text(`Corrective Actions (${ncr.correctiveActions.length}):`, { indent: 10 });

        for (const action of ncr.correctiveActions) {
          const actionStatus = action.status.replace('_', ' ');
          doc.font('Helvetica')
            .fontSize(9)
            .text(`  - ${action.description.substring(0, 60)}... [${actionStatus}]`, { indent: 15 });
        }
      }

      doc.moveDown(0.5);
    }

    doc.addPage();
  }

  /**
   * Add recommendations section
   */
  private addRecommendations(doc: typeof PDFDocument.prototype, data: ReportData): void {
    const { assessment, findings, nonConformities } = data;

    this.addSectionHeader(doc, 'Recommendations');

    const recommendations: string[] = [];

    // Generate recommendations based on findings
    const criticalFindings = findings.filter(f => f.score === 1);
    if (criticalFindings.length > 0) {
      recommendations.push(
        `Address ${criticalFindings.length} non-compliant finding(s) with highest priority. ` +
        'These represent areas where the QMS does not meet ISO 9001:2015 requirements.'
      );
    }

    const openNCRs = nonConformities.filter(n => n.status !== NCRStatus.CLOSED);
    if (openNCRs.length > 0) {
      recommendations.push(
        `Complete corrective actions for ${openNCRs.length} open NCR(s). ` +
        'Ensure root cause analysis is documented and actions are verified for effectiveness.'
      );
    }

    const criticalNCRs = nonConformities.filter(n => n.severity === Severity.CRITICAL);
    if (criticalNCRs.length > 0) {
      recommendations.push(
        `Prioritize resolution of ${criticalNCRs.length} critical NCR(s). ` +
        'These may pose significant risks to product quality or customer satisfaction.'
      );
    }

    if (assessment.overallScore !== null && assessment.overallScore < 70) {
      recommendations.push(
        'Consider conducting a follow-up assessment after implementing corrective actions ' +
        'to verify improvement in overall compliance score.'
      );
    }

    // Low-scoring sections
    const lowScoringSections = data.sectionBreakdown.filter(s => s.score < 60);
    if (lowScoringSections.length > 0) {
      const sectionNumbers = lowScoringSections.map(s => s.sectionNumber).join(', ');
      recommendations.push(
        `Focus improvement efforts on sections ${sectionNumbers} which scored below 60%.`
      );
    }

    if (recommendations.length === 0) {
      recommendations.push(
        'Continue to maintain current quality management practices.',
        'Schedule periodic surveillance audits to ensure ongoing compliance.',
        'Consider opportunities for continual improvement as defined in Clause 10.'
      );
    }

    doc.fontSize(11)
      .font('Helvetica')
      .fillColor(COLORS.DARK_GRAY);

    for (let i = 0; i < recommendations.length; i++) {
      doc.text(`${i + 1}. ${recommendations[i]}`)
        .moveDown(0.5);
    }

    // Footer
    doc.moveDown(2)
      .fontSize(10)
      .font('Helvetica-Oblique')
      .fillColor(COLORS.SECONDARY)
      .text('This report was generated automatically by the ISO 9001 Audit Management System.', { align: 'center' })
      .text(`Generated on: ${new Date().toISOString()}`, { align: 'center' });
  }

  /**
   * Add section header helper
   */
  private addSectionHeader(doc: typeof PDFDocument.prototype, title: string): void {
    doc.fontSize(16)
      .font('Helvetica-Bold')
      .fillColor(COLORS.PRIMARY)
      .text(title)
      .moveDown(0.5);

    // Underline
    doc.moveTo(50, doc.y)
      .lineTo(550, doc.y)
      .strokeColor(COLORS.PRIMARY)
      .lineWidth(1)
      .stroke();

    doc.moveDown();
  }

  /**
   * Get color based on score percentage
   */
  private getScoreColor(score: number | null): string {
    if (score === null) return COLORS.SECONDARY;
    if (score >= 80) return COLORS.SUCCESS;
    if (score >= 60) return COLORS.WARNING;
    return COLORS.DANGER;
  }

  /**
   * Generate a PowerPoint report for an assessment
   * Returns a buffer containing the PPTX data
   */
  async generateAssessmentPowerPoint(
    assessmentId: string,
    organizationId: string,
    userId: string,
    userRole: UserRole
  ): Promise<Buffer> {
    if (!PptxGenJs) {
      throw new Error('PowerPoint generation is not available. Please install pptxgenjs: npm install pptxgenjs');
    }

    // Fetch all data needed for the report
    const reportData = await this.getReportData(assessmentId, organizationId, userId, userRole);

    // Generate the PowerPoint
    return this.createPowerPoint(reportData);
  }

  /**
   * Create the PowerPoint presentation
   */
  private async createPowerPoint(data: ReportData): Promise<Buffer> {
    const pptx = new PptxGenJs();

    // Set presentation properties
    pptx.author = 'ISO 9001 Audit Management System';
    pptx.company = data.assessment.organization.name;
    pptx.subject = 'Assessment Report';
    pptx.title = `Assessment Report - ${data.assessment.title}`;

    // Define colors
    const colors = {
      primary: '1E40AF',
      secondary: '475569',
      success: '16A34A',
      warning: 'CA8A04',
      danger: 'DC2626',
      lightGray: 'F1F5F9',
      darkGray: '334155',
      white: 'FFFFFF',
      text: '1E293B',
    };

    // 1. Cover Slide
    const coverSlide = pptx.addSlide();
    coverSlide.background = { color: colors.primary };

    coverSlide.addText('ISO 9001:2015', {
      x: 0.5,
      y: 1.5,
      w: 9,
      h: 0.8,
      fontSize: 44,
      bold: true,
      color: colors.white,
      align: 'center',
    });

    coverSlide.addText('Assessment Report', {
      x: 0.5,
      y: 2.5,
      w: 9,
      h: 0.6,
      fontSize: 32,
      color: colors.white,
      align: 'center',
    });

    coverSlide.addText(data.assessment.title, {
      x: 1,
      y: 3.5,
      w: 8,
      h: 0.5,
      fontSize: 24,
      bold: true,
      color: colors.white,
      align: 'center',
    });

    coverSlide.addText(data.assessment.organization.name, {
      x: 1,
      y: 4.2,
      w: 8,
      h: 0.4,
      fontSize: 18,
      color: colors.white,
      align: 'center',
    });

    const formattedDate = data.assessment.completedDate
      ? new Date(data.assessment.completedDate).toLocaleDateString()
      : new Date().toLocaleDateString();

    coverSlide.addText(`Report Date: ${formattedDate}`, {
      x: 1,
      y: 5,
      w: 8,
      h: 0.3,
      fontSize: 14,
      color: colors.white,
      align: 'center',
    });

    // 2. Executive Summary Slide
    const summarySlide = pptx.addSlide();
    summarySlide.addText('Executive Summary', {
      x: 0.5,
      y: 0.3,
      w: 9,
      h: 0.5,
      fontSize: 32,
      bold: true,
      color: colors.primary,
    });

    const overallScore = data.assessment.overallScore || 0;
    const scorePercentage = Math.round((overallScore / 3) * 100);
    const scoreColor = overallScore >= 2.5 ? colors.success : overallScore >= 1.5 ? colors.warning : colors.danger;

    summarySlide.addText(`Overall Compliance Score: ${scorePercentage}%`, {
      x: 1,
      y: 1.2,
      w: 8,
      h: 0.5,
      fontSize: 24,
      bold: true,
      color: scoreColor,
      align: 'center',
    });

    summarySlide.addText(`Status: ${data.assessment.status.replace('_', ' ')}`, {
      x: 1,
      y: 2,
      w: 8,
      h: 0.4,
      fontSize: 16,
      align: 'center',
    });

    // Summary stats
    const statsY = 2.8;
    const findings = data.findings;
    const score1Count = findings.filter(f => f.score === 1).length;
    const score2Count = findings.filter(f => f.score === 2).length;

    summarySlide.addText([
      { text: 'Assessment Details:\n\n', options: { fontSize: 16, bold: true } },
      { text: `• Audit Type: ${data.assessment.auditType}\n`, options: { fontSize: 14 } },
      { text: `• Total Findings: ${findings.length}\n`, options: { fontSize: 14 } },
      { text: `• Non-Compliant (Score 1): ${score1Count}\n`, options: { fontSize: 14, color: colors.danger } },
      { text: `• Partial Compliance (Score 2): ${score2Count}\n`, options: { fontSize: 14, color: colors.warning } },
      { text: `• Non-Conformities: ${data.nonConformities.length}\n`, options: { fontSize: 14 } },
      { text: `• Lead Auditor: ${data.assessment.leadAuditor.firstName} ${data.assessment.leadAuditor.lastName}`, options: { fontSize: 14 } },
    ], {
      x: 1.5,
      y: statsY,
      w: 7,
      h: 2.5,
    });

    // 3. Section Breakdown Slide
    if (data.sectionBreakdown && data.sectionBreakdown.length > 0) {
      const breakdownSlide = pptx.addSlide();
      breakdownSlide.addText('Section Compliance Breakdown', {
        x: 0.5,
        y: 0.3,
        w: 9,
        h: 0.5,
        fontSize: 28,
        bold: true,
        color: colors.primary,
      });

      // Create chart data
      const chartData = data.sectionBreakdown.slice(0, 10).map(section => ({
        name: section.sectionNumber,
        labels: [section.sectionNumber],
        values: [Math.round((section.score / 3) * 100)],
      }));

      breakdownSlide.addChart(pptx.ChartType.bar, chartData, {
        x: 1,
        y: 1.2,
        w: 8,
        h: 4,
        chartColors: [colors.primary],
        showValue: true,
        valAxisMaxVal: 100,
        catAxisLabelFontSize: 10,
        valAxisLabelFontSize: 10,
        showTitle: false,
      });
    }

    // 4. Non-Conformities Slide
    if (data.nonConformities.length > 0) {
      const ncrSlide = pptx.addSlide();
      ncrSlide.addText('Non-Conformities Summary', {
        x: 0.5,
        y: 0.3,
        w: 9,
        h: 0.5,
        fontSize: 28,
        bold: true,
        color: colors.primary,
      });

      const ncrRows = [
        [
          { text: 'Severity', options: { bold: true, color: colors.white, fill: colors.primary } },
          { text: 'Title', options: { bold: true, color: colors.white, fill: colors.primary } },
          { text: 'Status', options: { bold: true, color: colors.white, fill: colors.primary } },
          { text: 'Actions', options: { bold: true, color: colors.white, fill: colors.primary } },
        ],
      ];

      data.nonConformities.slice(0, 8).forEach(ncr => {
        const severityColor = ncr.severity === 'CRITICAL' ? colors.danger : ncr.severity === 'MAJOR' ? colors.warning : colors.secondary;
        ncrRows.push([
          { text: ncr.severity, options: { color: severityColor, bold: true, fill: colors.white } },
          { text: ncr.title.substring(0, 40) + (ncr.title.length > 40 ? '...' : ''), options: { color: colors.text, bold: false, fill: colors.white } },
          { text: ncr.status.replace('_', ' '), options: { color: colors.text, bold: false, fill: colors.white } },
          { text: ncr.correctiveActions.length.toString(), options: { color: colors.text, bold: false, fill: colors.white } },
        ]);
      });

      ncrSlide.addTable(ncrRows, {
        x: 0.5,
        y: 1.2,
        w: 9,
        h: 4,
        fontSize: 11,
        colW: [1.5, 4.5, 1.8, 1.2],
      });
    }

    // 5. Findings Details Slide
    if (findings.length > 0) {
      const findingsSlide = pptx.addSlide();
      findingsSlide.addText('Key Findings', {
        x: 0.5,
        y: 0.3,
        w: 9,
        h: 0.5,
        fontSize: 28,
        bold: true,
        color: colors.primary,
      });

      const findingsRows = [
        [
          { text: 'Score', options: { bold: true, color: colors.white, fill: colors.primary } },
          { text: 'Section', options: { bold: true, color: colors.white, fill: colors.primary } },
          { text: 'Question', options: { bold: true, color: colors.white, fill: colors.primary } },
        ],
      ];

      findings.slice(0, 10).forEach(finding => {
        const scoreColor = finding.score === 1 ? colors.danger : colors.warning;
        const sectionInfo = finding.section
          ? `${finding.section.sectionNumber}`
          : 'N/A';

        findingsRows.push([
          { text: finding.score?.toString() || 'N/A', options: { color: scoreColor, bold: true, fill: colors.white } },
          { text: sectionInfo, options: { color: colors.text, bold: false, fill: colors.white } },
          { text: finding.question.questionText.substring(0, 60) + (finding.question.questionText.length > 60 ? '...' : ''), options: { color: colors.text, bold: false, fill: colors.white } },
        ]);
      });

      findingsSlide.addTable(findingsRows, {
        x: 0.5,
        y: 1.2,
        w: 9,
        h: 4,
        fontSize: 10,
        colW: [0.8, 1.5, 6.7],
      });
    }

    // 6. Recommendations Slide
    const recommendationsSlide = pptx.addSlide();
    recommendationsSlide.addText('Recommendations', {
      x: 0.5,
      y: 0.3,
      w: 9,
      h: 0.5,
      fontSize: 28,
      bold: true,
      color: colors.primary,
    });

    const recommendations = [];
    if (score1Count > 0) {
      recommendations.push(`• Address ${score1Count} non-compliant finding(s) immediately`);
    }
    if (score2Count > 0) {
      recommendations.push(`• Improve ${score2Count} partially compliant area(s)`);
    }
    if (data.nonConformities.length > 0) {
      const openNCRs = data.nonConformities.filter(ncr => ncr.status === 'OPEN' || ncr.status === 'IN_PROGRESS');
      if (openNCRs.length > 0) {
        recommendations.push(`• Complete ${openNCRs.length} open non-conformity correction(s)`);
      }
    }
    recommendations.push('• Schedule follow-up assessment in 6 months');
    recommendations.push('• Provide training to address identified gaps');
    recommendations.push('• Document all corrective actions and improvements');

    recommendationsSlide.addText(recommendations.join('\n\n'), {
      x: 1,
      y: 1.2,
      w: 8,
      h: 4,
      fontSize: 16,
      bullet: false,
    });

    // Generate buffer
    const buffer = await pptx.write({ outputType: 'nodebuffer' });
    return buffer as Buffer;
  }

  /**
   * Check if user can access reports for an assessment
   */
  private canAccessReport(
    assessment: {
      leadAuditorId: string;
      teamMembers: Array<{ user: { id: string } }>;
    },
    userId: string,
    userRole: UserRole
  ): boolean {
    // System admins and quality managers can always access reports
    if (userRole === UserRole.SYSTEM_ADMIN || userRole === UserRole.QUALITY_MANAGER) {
      return true;
    }

    // Lead auditor can access reports
    if (assessment.leadAuditorId === userId) {
      return true;
    }

    // Team members can access reports
    const isTeamMember = assessment.teamMembers.some(tm => tm.user.id === userId);
    if (isTeamMember) {
      return true;
    }

    // Department heads and viewers can access reports (read-only)
    if (userRole === UserRole.DEPARTMENT_HEAD || userRole === UserRole.VIEWER) {
      return true;
    }

    return false;
  }

  /**
   * Get report filename
   */
  getReportFilename(assessmentTitle: string, format: 'pdf' | 'pptx' = 'pdf'): string {
    const sanitizedTitle = assessmentTitle
      .replace(/[^a-z0-9]/gi, '-')
      .replace(/-+/g, '-')
      .toLowerCase()
      .substring(0, 50);
    const timestamp = new Date().toISOString().split('T')[0];
    return `assessment-report-${sanitizedTitle}-${timestamp}.${format}`;
  }
}

export const reportService = new ReportService();
