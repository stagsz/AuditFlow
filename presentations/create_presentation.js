const PptxGenJS = require("pptxgenjs");

// Create presentation
const prs = new PptxGenJS();
prs.defineLayout({ name: "LAYOUT1", width: 10, height: 7.5 });
prs.defineLayout({ name: "LAYOUT2", width: 10, height: 7.5 });

// Color scheme
const colors = {
  darkBlue: "1E3A8A",
  teal: "0F766E",
  red: "DC2626",
  white: "FFFFFF",
  lightGray: "F5F5F5",
  black: "000000"
};

// Slide 1: Title
let slide = prs.addSlide();
slide.background = { color: colors.darkBlue };
slide.addText("ISO 9001 Self-Assessment\n& Audit Management", {
  x: 0.5,
  y: 2.5,
  w: 9,
  h: 1.5,
  fontSize: 54,
  bold: true,
  color: colors.white,
  align: "center",
  fontFace: "Arial"
});
slide.addText("Complete Web Application\nMVP Complete - 108 Tasks", {
  x: 0.5,
  y: 4.2,
  w: 9,
  h: 2,
  fontSize: 28,
  color: colors.white,
  align: "center",
  fontFace: "Arial"
});

// Helper function for content slides
function addContentSlide(title, items) {
  let slide = prs.addSlide();
  slide.background = { color: colors.lightGray };
  
  // Title bar
  slide.addShape("rect", {
    x: 0,
    y: 0,
    w: 10,
    h: 1,
    fill: { color: colors.darkBlue },
    line: { type: "none" }
  });
  
  slide.addText(title, {
    x: 0.5,
    y: 0.2,
    w: 9,
    h: 0.6,
    fontSize: 40,
    bold: true,
    color: colors.white,
    align: "left",
    fontFace: "Arial",
    valign: "middle"
  });
  
  // Content
  let yPos = 1.3;
  items.forEach((item, index) => {
    slide.addText(item, {
      x: 0.7,
      y: yPos,
      w: 8.6,
      h: 0.5,
      fontSize: 18,
      color: colors.black,
      align: "left",
      fontFace: "Arial"
    });
    yPos += 0.55;
  });
}

// Slide 2: Overview
addContentSlide("Project Overview", [
  "Purpose: Automate ISO 9001:2015 self-assessments and internal audits",
  "Scope: 73 ISO sections, 27 audit questions, multi-user collaboration",
  "Status: MVP COMPLETE (108/108 tasks)",
  "User Roles: 5 roles (Admin, Manager, Auditor, Head, Viewer)",
  "Production Ready: YES ✓"
]);

// Slide 3: Tech Stack
addContentSlide("Technology Stack", [
  "Frontend: Next.js 14, React 18, TypeScript, Tailwind CSS",
  "Backend: Node.js, Express.js, TypeScript, Prisma ORM",
  "Database: PostgreSQL 12+ with native enums",
  "Authentication: JWT tokens with refresh mechanism",
  "Deployment: Docker, Docker Compose",
  "Testing: Jest + Supertest, Jest + React Testing Library"
]);

// Slide 4: Database
addContentSlide("Database Architecture", [
  "10 Core Models with relationships",
  "Native PostgreSQL Enums for type safety",
  "Hierarchical sections with self-referential relationships",
  "Models: Organization, User, Assessment, ISOStandardSection",
  "AuditQuestion, QuestionResponse, Evidence, NonConformity",
  "CorrectiveAction, Template, TeamMember"
]);

// Slide 5: Assessments
addContentSlide("Core Features: Assessments", [
  "Multi-user assessments with team collaboration",
  "Score questions: 1 (Red), 2 (Yellow), 3 (Green)",
  "Auto-calculate compliance scores in real-time",
  "Upload evidence files (documents, images, video)",
  "Auto-save responses to prevent data loss",
  "Clone assessments for recurring audits"
]);

// Slide 6: Non-Conformities
addContentSlide("Non-Conformity Management", [
  "Auto-generate from Score 1 responses",
  "Classify severity: CRITICAL, MAJOR, MINOR",
  "Root cause analysis and tracking",
  "Workflow: OPEN → IN_PROGRESS → CLOSED → VERIFIED",
  "Create and assign corrective actions",
  "Verify effectiveness with complete audit trail"
]);

// Slide 7: Scoring
addContentSlide("Scoring & Compliance System", [
  "Score 1 (Red): Non-compliant → Auto-generates NCR",
  "Score 2 (Yellow): Partially compliant → Needs improvement",
  "Score 3 (Green): Fully compliant → Baseline maintained",
  "Section scores calculated from question averages",
  "Overall score is weighted average of sections",
  "Dashboard with charts, gauges, trend analysis"
]);

// Slide 8: Testing
addContentSlide("Testing & Quality Assurance", [
  "Backend: 91 tests (Jest + Supertest)",
  "  - Auth API: 26 tests",
  "  - Assessment API: 65 tests",
  "Frontend: 60 tests (Jest + React Testing Library)",
  "  - Zustand stores: 48 tests",
  "  - React components: 12 tests",
  "Total: 151 tests ✓ All critical paths covered"
]);

// Slide 9: Deployment
addContentSlide("Deployment & Infrastructure", [
  "Docker Compose (dev and production environments)",
  "PostgreSQL 12+ database with persistence",
  "Node.js/Express backend on port 5000",
  "Next.js/Nginx frontend on port 3000",
  "Health check endpoints for monitoring",
  "Structured logging and automatic restart"
]);

// Slide 10: Roles
addContentSlide("User Roles & Permissions", [
  "System Admin: Full system access and configuration",
  "Quality Manager: Assessment creation and oversight",
  "Internal Auditor: Conduct audits and document findings",
  "Department Head: Respond to findings for their areas",
  "Viewer: Read-only access to reports and data",
  "Fine-grained role-based access control"
]);

// Slide 11: API
addContentSlide("REST API Endpoints", [
  "9 Main Route Groups: Auth, Assessments, Standards",
  "Non-Conformities, Actions, Evidence, Dashboard, Users, Templates",
  "50+ Total Endpoints with RESTful conventions",
  "/api/assessments - Full CRUD and audit management",
  "/api/non-conformities - NCR workflow and tracking",
  "/api/standards - ISO sections and questions"
]);

// Slide 12: Achievements
addContentSlide("Project Achievements", [
  "108 Tasks COMPLETED ✓",
  "11 Development Phases COMPLETED ✓",
  "10 Database Models with type-safe design",
  "151 Tests passing (91 backend + 60 frontend)",
  "73 ISO 9001:2015 sections pre-loaded",
  "27 Comprehensive audit questions"
]);

// Slide 13: Conclusion
slide = prs.addSlide();
slide.background = { color: colors.darkBlue };
slide.addText("Ready for Production", {
  x: 0.5,
  y: 2.5,
  w: 9,
  h: 1.5,
  fontSize: 54,
  bold: true,
  color: colors.white,
  align: "center",
  fontFace: "Arial"
});
slide.addText("All 108 MVP Tasks Complete\n151 Tests Passing\nProduction Deployment Ready", {
  x: 0.5,
  y: 4.2,
  w: 9,
  h: 2,
  fontSize: 28,
  color: colors.white,
  align: "center",
  fontFace: "Arial"
});

// Save presentation
prs.writeFile("Selfassessment-App-Presentation.pptx");
console.log("✓ SUCCESS!");
console.log("✓ File: Selfassessment-App-Presentation.pptx");
console.log("✓ Location: C:\\Users\\staff\\Selfassesment-app\\");
console.log("✓ Slides: 13");
console.log("✓ Ready to present!");
