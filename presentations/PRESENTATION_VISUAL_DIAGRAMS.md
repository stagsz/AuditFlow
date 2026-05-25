# Selfassessment-app: Visual Architecture & Diagrams

## Application Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         ISO 9001 Self-Assessment & Audit App                │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                          WEB BROWSER (Client)                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                    NEXT.JS 14 FRONTEND (React 18)                    │  │
│  ├──────────────────────────────────────────────────────────────────────┤  │
│  │                                                                       │  │
│  │  Pages Layer (App Router)                                            │  │
│  │  ├── (auth) - Login, Register                                        │  │
│  │  └── (dashboard) - Assessments, NCRs, Reports, Settings             │  │
│  │                                                                       │  │
│  │  Components Layer                                                    │  │
│  │  ├── Layout (Sidebar, Header)                                        │  │
│  │  ├── UI (Button, Input, Modal, Toast)                               │  │
│  │  ├── Charts (Compliance visualization)                               │  │
│  │  └── Forms (Assessment, Response, NCR)                               │  │
│  │                                                                       │  │
│  │  State Management                                                    │  │
│  │  ├── useAuthStore (Zustand) - User, tokens                          │  │
│  │  ├── useAssessmentDraftStore - Draft responses                      │  │
│  │  └── useUIStore - Modals, notifications                             │  │
│  │                                                                       │  │
│  │  Server State                                                        │  │
│  │  └── TanStack Query - API caching, refetching                       │  │
│  │                                                                       │  │
│  │  Styling                                                             │  │
│  │  └── Tailwind CSS - Responsive, utility-first                       │  │
│  │                                                                       │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                   ↕                                         │
│                            REST API (HTTPS)                                 │
│                            50+ Endpoints                                    │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘

                          ↕↕↕ Network Boundary ↕↕↕

┌─────────────────────────────────────────────────────────────────────────────┐
│                      EXPRESS.JS BACKEND (API Server)                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                         HTTP Request Handler                         │  │
│  │                                                                       │  │
│  │  Routes → Controllers → Services → Database                         │  │
│  │                                                                       │  │
│  │  Routes:                                                             │  │
│  │  ├── /api/auth          (AuthController)                            │  │
│  │  ├── /api/assessments   (AssessmentController)                      │  │
│  │  ├── /api/standards     (StandardsController)                       │  │
│  │  ├── /api/non-conformities (NCRController)                          │  │
│  │  ├── /api/actions       (CorrectiveActionController)                │  │
│  │  ├── /api/evidence      (EvidenceController)                        │  │
│  │  ├── /api/dashboard     (DashboardController)                       │  │
│  │  ├── /api/users         (UserController)                            │  │
│  │  └── /api/templates     (TemplateController)                        │  │
│  │                                                                       │  │
│  │  Services (Business Logic):                                         │  │
│  │  ├── AuthService        - Login, tokens, password                   │  │
│  │  ├── AssessmentService  - CRUD, scoring, cloning, export            │  │
│  │  ├── StandardsService   - ISO sections, questions                   │  │
│  │  ├── NCRService         - Auto-generate, status transitions          │  │
│  │  ├── ActionService      - Create, verify, track                     │  │
│  │  ├── EvidenceService    - Upload, download, delete                  │  │
│  │  ├── ReportService      - PDF generation                            │  │
│  │  └── DashboardService   - Stats, trends, breakdown                  │  │
│  │                                                                       │  │
│  │  Middleware:                                                         │  │
│  │  ├── authProxy          - JWT verification                          │  │
│  │  ├── uploadProxy        - Multer file upload                        │  │
│  │  ├── validationProxy    - Zod schema validation                     │  │
│  │  └── errorProxy         - Global error handling                     │  │
│  │                                                                       │  │
│  │  File Storage:                                                       │  │
│  │  └── /uploads directory - Evidence files                            │  │
│  │                                                                       │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                   ↕                                         │
│                            SQL Queries (TCP/5432)                          │
│                            Type-safe with Prisma                           │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘

                          ↕↕↕ Network Boundary ↕↕↕

┌─────────────────────────────────────────────────────────────────────────────┐
│                      POSTGRESQL DATABASE                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                     Data Models (10 Tables)                          │  │
│  │                                                                       │  │
│  │  Organization                    Assessment                          │  │
│  │  ├── id (PK)                     ├── id (PK)                        │  │
│  │  ├── name                        ├── title                          │  │
│  │  └── ...                         ├── status (enum)                  │  │
│  │                                  ├── overallScore                   │  │
│  │  User                            └── ...                            │  │
│  │  ├── id (PK)                                                        │  │
│  │  ├── email                       AuditQuestion                      │  │
│  │  ├── role (enum: ADMIN, etc)     ├── id (PK)                        │  │
│  │  └── ...                         ├── questionText                   │  │
│  │                                  ├── score1/2/3Criteria             │  │
│  │  ISOStandardSection              └── ...                            │  │
│  │  ├── id (PK)                                                        │  │
│  │  ├── sectionNumber (UNIQUE)      QuestionResponse                   │  │
│  │  ├── title                       ├── id (PK)                        │  │
│  │  ├── parentId (FK, self)         ├── score (1-3)                    │  │
│  │  └── ...                         ├── justification                  │  │
│  │                                  └── ...                            │  │
│  │  NonConformity                                                      │  │
│  │  ├── id (PK)                     Evidence                           │  │
│  │  ├── severity (enum)             ├── id (PK)                        │  │
│  │  ├── status (enum)               ├── fileName                       │  │
│  │  └── ...                         ├── filePath                       │  │
│  │                                  └── ...                            │  │
│  │  CorrectiveAction                                                   │  │
│  │  ├── id (PK)                     Type-Safe Enums:                   │  │
│  │  ├── status (enum)               ├── UserRole                       │  │
│  │  ├── priority (enum)             ├── AssessmentStatus               │  │
│  │  └── ...                         ├── Severity                       │  │
│  │                                  ├── Priority                       │  │
│  └──────────────────────────────────└── ... (more enums)               │  │
│                                                                          │  │
│  Prisma ORM:                                                             │  │
│  ├── Type-safe query builder                                             │  │
│  ├── Automatic migrations                                                │  │
│  └── Client generation                                                   │  │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Deployment Architecture (Docker Compose)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        Docker Compose Stack                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                       nginx (Reverse Proxy)                          │  │
│  │                          Port: 3000                                  │  │
│  │                                                                       │  │
│  │  Routes:                                                             │  │
│  │  - http://localhost:3000 → Next.js frontend                        │  │
│  │  - http://localhost:3000/api → Express backend                     │  │
│  │                                                                       │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                    next-app (Frontend Container)                     │  │
│  │                        Port: 3001 (internal)                         │  │
│  │                                                                       │  │
│  │  Node.js process running Next.js                                    │  │
│  │  - App Router pages                                                 │  │
│  │  - React components                                                 │  │
│  │  - Tailwind CSS styling                                             │  │
│  │                                                                       │  │
│  │  Volumes:                                                            │  │
│  │  - .next/cache (Next.js build cache)                               │  │
│  │  - node_modules (dependencies)                                      │  │
│  │                                                                       │  │
│  │  Environment:                                                        │  │
│  │  - NEXT_PUBLIC_API_URL=http://localhost:3000/api                  │  │
│  │                                                                       │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                    backend (Backend Container)                       │  │
│  │                        Port: 5000 (exposed)                          │  │
│  │                                                                       │  │
│  │  Node.js process running Express                                    │  │
│  │  - API routes (50+ endpoints)                                       │  │
│  │  - Business logic services                                          │  │
│  │  - Database queries                                                 │  │
│  │                                                                       │  │
│  │  Volumes:                                                            │  │
│  │  - ./backend/uploads (Evidence files)                               │  │
│  │  - node_modules (dependencies)                                      │  │
│  │                                                                       │  │
│  │  Environment:                                                        │  │
│  │  - DATABASE_URL=postgresql://user:pass@postgres:5432/dbname        │  │
│  │  - JWT_SECRET=<secret>                                              │  │
│  │  - NODE_ENV=production                                              │  │
│  │                                                                       │  │
│  │  Health Check:                                                       │  │
│  │  - GET /health → Returns { status: 'ok' }                          │  │
│  │                                                                       │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                   postgres (Database Container)                      │  │
│  │                        Port: 5432 (exposed)                          │  │
│  │                                                                       │  │
│  │  PostgreSQL 12+                                                      │  │
│  │  - 10 tables with foreign keys                                      │  │
│  │  - Native enum types for type safety                                │  │
│  │  - Connection pooling                                               │  │
│  │                                                                       │  │
│  │  Volumes:                                                            │  │
│  │  - postgres_data (Database files - persisted)                       │  │
│  │                                                                       │  │
│  │  Environment:                                                        │  │
│  │  - POSTGRES_USER=dbuser                                             │  │
│  │  - POSTGRES_PASSWORD=<password>                                     │  │
│  │  - POSTGRES_DB=selfassessment                                       │  │
│  │                                                                       │  │
│  │  Initialization:                                                     │  │
│  │  - schema.prisma (Prisma schema)                                    │  │
│  │  - migrations/ (Database migrations)                                │  │
│  │  - seed.ts (Seed data: 73 sections, 27 questions)                   │  │
│  │                                                                       │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  Networks:                                                                  │
│  - backend (internal network for container communication)                  │
│                                                                              │
│  Volumes:                                                                   │
│  - postgres_data (Named volume for database persistence)                   │
│  - ./backend/uploads (Host mount for evidence files)                       │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘

Docker Compose Command:
$ docker-compose up -d

Access Points:
- Frontend:  http://localhost:3000
- Backend:   http://localhost:5000 (or via Nginx at /api)
- Database:  localhost:5432
```

---

## Assessment Workflow Diagram

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                         ASSESSMENT WORKFLOW                                  │
└──────────────────────────────────────────────────────────────────────────────┘

Quality Manager
        │
        ▼
   ┌─────────────┐
   │   CREATE    │  - Enter title, description, audit type
   │ ASSESSMENT  │  - Select ISO sections to audit (1-73)
   │   (DRAFT)   │  - Choose assessment template (if applicable)
   └──────┬──────┘
          │
          ▼
   ┌─────────────────────┐
   │ ADD TEAM MEMBERS    │  - Lead Auditor (required)
   │ & SCHEDULE AUDIT    │  - Auditors (optional)
   │  (SCHEDULED)        │  - Observers (optional)
   │                     │  - Set scheduled date & due date
   └──────┬──────────────┘
          │
          ▼ (Audit begins)
   ┌──────────────────────────────────────┐
   │    IN_PROGRESS STATE                 │
   │                                      │
   │ Lead Auditor walks through each of   │
   │ 73 ISO sections and 27 questions     │
   │                                      │
   │ For each question:                   │
   │  1. Score: 1 (Red), 2 (Yellow),     │
   │             or 3 (Green)             │
   │  2. Write justification              │
   │  3. Propose corrective action (if    │
   │     score 1 or 2)                    │
   │  4. Upload evidence files            │
   │  5. Write conclusion                 │
   │                                      │
   │ Real-time auto-save prevents loss    │
   │ Section scores calculated live       │
   │ Overall compliance % updates         │
   └──────┬───────────────────────────────┘
          │
          ▼ (Auto-triggered)
   ┌─────────────────────────────────────┐
   │ NON-CONFORMITIES AUTO-GENERATED     │
   │ (for each Score 1 response)         │
   │                                     │
   │ System creates:                     │
   │  - NCR record                       │
   │  - Link to question response        │
   │  - Status: OPEN                     │
   │  - Awaiting severity classification │
   └──────┬──────────────────────────────┘
          │
          ▼
   ┌─────────────────────────────────────┐
   │    ASSESSMENT COMPLETED             │
   │    (COMPLETED STATE)                │
   │                                     │
   │ - Final compliance score calculated│
   │ - Report can be generated (PDF)     │
   │ - Data can be exported (CSV)        │
   │ - Assessment can be cloned          │
   └──────┬──────────────────────────────┘
          │
          ├─────────────────────────────────┐
          │                                 │
          ▼                                 ▼
   ┌────────────────┐          ┌───────────────────────┐
   │ GENERATE REPORT│          │ CLONE FOR NEXT YEAR   │
   │ (PDF Format)   │          │ (Copy structure &     │
   │                │          │  questions, reset     │
   │ - Summary page │          │  responses)           │
   │ - Scoring      │          │                       │
   │ - NCRs found   │          │ New assessment with   │
   │ - Trends       │          │ same sections &       │
   └────────────────┘          │ questions created     │
                               └───────────────────────┘

   Optional: Archive assessment (ARCHIVED state)

┌──────────────────────────────────────────────────────────────────────────────┐
│                    PARALLEL: NON-CONFORMITY WORKFLOW                         │
└──────────────────────────────────────────────────────────────────────────────┘

          Quality Manager
                │
                ▼
          ┌──────────────┐
          │  NCR OPEN    │  - System auto-created from Score 1
          └──────┬───────┘  - Awaiting qualification
                 │
                 ▼
          ┌──────────────────────┐
          │ CLASSIFY & ANALYZE   │  - Severity: CRITICAL/MAJOR/MINOR
          │  (Still OPEN)        │  - Root cause analysis
          │                      │  - Document findings
          │                      │  - Upload evidence
          └──────┬───────────────┘
                 │
                 ▼
          ┌──────────────────────────┐
          │ CREATE CORRECTIVE ACTION │  - Detailed action plan
          │                          │  - Assign to team member
          │                          │  - Set due date & priority
          │                          │  - Link to NCR
          │                          │
          │ NCR Status → IN_PROGRESS │
          └──────┬───────────────────┘
                 │
                 ▼
          ┌──────────────────────────┐
          │  ACTION IMPLEMENTATION   │  - Assigned person executes
          │  (Team Member)           │  - Updates status
          │                          │  - Uploads evidence
          │                          │  - Marks complete
          └──────┬───────────────────┘
                 │
                 ▼
          ┌──────────────────────────┐
          │ VERIFY EFFECTIVENESS     │  - Quality Manager verifies
          │                          │  - Confirms fix worked
          │                          │  - Documents notes
          │  NCR → VERIFIED          │  - Action → VERIFIED
          │  Status: CLOSED          │  - NCR → CLOSED
          └──────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────┐
│                    DASHBOARD & REPORTING                                     │
└──────────────────────────────────────────────────────────────────────────────┘

Executive Dashboard:
  ┌─────────────────────────────────────┐
  │  Overall Compliance: 75%             │ ◄── Weighted avg of all sections
  │  ████████░░░░░░░░░░░░░░░░░░         │
  └─────────────────────────────────────┘

Section Breakdown (Bar Chart):
  ┌─────────────────────────────────────┐
  │ 4.1 Context      ███████░░░░ 70%    │
  │ 4.2 Leadership   █████████░░░ 80%   │
  │ 5.1 Management   ███░░░░░░░░░ 30%   │
  │ ...more sections...                 │
  └─────────────────────────────────────┘

Compliance Radar Chart:
  Shows visual comparison of section scores

Historical Trends:
  2024-01: 65% → 2024-06: 70% → 2025-01: 75% (trending up ✓)

Non-Conformities Summary:
  - Open: 2 (CRITICAL), 5 (MAJOR), 8 (MINOR)
  - In Progress: 3
  - Closed: 15
  - Verified: 12
```

---

## User Role Access Matrix

```
┌────────────────────────────────────────────────────────────────────────────┐
│                        USER ROLE PERMISSIONS MATRIX                        │
├────────────────────────────────────────────────────────────────────────────┤
│                                                                            │
│ Feature                  Admin    Mgr    Auditor   Head   Viewer          │
│ ────────────────────────────────────────────────────────────────────────  │
│ User Management          ✓        -      -         -      -              │
│ Create Assessment        ✓        ✓      -         -      -              │
│ View All Assessments     ✓        ✓      ✓ own     ✓ own  ✓ own         │
│ Edit Assessment          ✓        ✓      -         -      -              │
│ Archive Assessment       ✓        ✓      -         -      -              │
│ Clone Assessment         ✓        ✓      -         -      -              │
│                                                                            │
│ Record Responses         ✓        ✓      ✓         ✓      -              │
│ View Own Responses       ✓        ✓      ✓         ✓      ✓              │
│ View All Responses       ✓        ✓      ✓         -      ✓              │
│ Upload Evidence          ✓        ✓      ✓         ✓      -              │
│                                                                            │
│ Create Non-Conformity    ✓        ✓      ✓         -      -              │
│ View Non-Conformities    ✓        ✓      ✓         ✓      ✓              │
│ Update NCR Status        ✓        ✓      ✓         -      -              │
│ Classify Severity        ✓        ✓      ✓         -      -              │
│ Root Cause Analysis      ✓        ✓      ✓         -      -              │
│                                                                            │
│ Create Corrective Action ✓        ✓      ✓         -      -              │
│ Assign Action            ✓        ✓      ✓         -      -              │
│ Complete Action          ✓        ✓      ✓         ✓      -              │
│ Verify Action            ✓        ✓      ✓         -      -              │
│                                                                            │
│ Generate Reports         ✓        ✓      ✓         ✓      ✓              │
│ Export Data              ✓        ✓      ✓         ✓      ✓              │
│ View Dashboard           ✓        ✓      ✓         ✓      ✓              │
│ Manage Templates         ✓        -      -         -      -              │
│ Configure Org Settings   ✓        -      -         -      -              │
│                                                                            │
└────────────────────────────────────────────────────────────────────────────┘

Legend:
✓       = Full access
✓ own   = Can only see/edit own records
-       = No access
```

---

## Development Phases Timeline

```
Phase 1: Database Schema (2 weeks)
├── 10 models defined
├── Foreign key relationships
├── Native PostgreSQL enums
└── ✓ Complete

Phase 2: Backend Foundation (2 weeks)
├── Express server setup
├── Auth API (login, register, refresh)
├── Middleware (auth, validation, error)
└── ✓ Complete

Phase 3: Frontend Structure (1.5 weeks)
├── Next.js setup
├── App Router layout
├── Auth pages (login, register)
├── Zustand stores
└── ✓ Complete

Phase 4: Assessment Backend (2 weeks)
├── Assessment CRUD
├── Response recording
├── Scoring logic
├── CSV export
└── ✓ Complete

Phase 5: Assessment Frontend (2 weeks)
├── Assessment list view
├── Create assessment form
├── Audit execution interface
├── Real-time scoring display
└── ✓ Complete

Phase 6: Non-Conformity Management (1.5 weeks)
├── Auto-generate from Score 1
├── Status workflow
├── Root cause analysis
├── Corrective action linking
└── ✓ Complete

Phase 7: Advanced Features (1.5 weeks)
├── Assessment cloning
├── PDF report generation
├── Historical trends
├── Template support
└── ✓ Complete

Phase 8: UI Polish & Refinement (1 week)
├── Error boundaries
├── Loading skeletons
├── Mobile responsiveness
├── Toast notifications
└── ✓ Complete

Phase 9: Integration & Testing (1.5 weeks)
├── End-to-end workflows
├── API integration testing
├── Component integration
└── ✓ Complete

Phase 10: Test Suite Expansion (1 week)
├── 91 backend tests
├── 60 frontend tests
├── Critical path coverage
└── ✓ Complete

Phase 11: Deployment Preparation (1 week)
├── Docker Compose setup
├── PostgreSQL migration
├── Environment configuration
├── Health checks & logging
└── ✓ Complete

Total: 11 phases ≈ 18 weeks
Status: All phases complete ✓✓✓
```

---

## Test Coverage Pyramid

```
                            ╱╲
                           ╱  ╲         E2E Tests
                          ╱────╲        (Integration)
                         ╱      ╲       5-10 scenarios
                        ╱        ╲      (Manual coverage)
                       ╱──────────╲
                      ╱            ╲    API Tests
                     ╱              ╲   (Backend)
                    ╱                ╲  91 tests
                   ╱                  ╲ - Auth (26)
                  ╱────────────────────╲ - Assessments (65)
                 ╱                      ╲
                ╱                        ╲ Component &
               ╱──────────────────────────╲ Store Tests
              ╱                            ╲ (Frontend)
             ╱                              ╲ 60 tests
            ╱────────────────────────────────╲ - Stores (48)
           ╱                                  ╲ - Components (12)
          ╱________________________________________╲

Total: 151 Tests
Backend: 91 (Jest + Supertest)
Frontend: 60 (Jest + React Testing Library)
Coverage: All critical user paths
```

---

## Database Schema (ER-Style Diagram)

```
┌─────────────────┐
│ Organization    │
├─────────────────┤
│ id (PK)         │
│ name            │
│ createdAt       │
└────────┬────────┘
         │1
         │
         │ M
    ┌────┴──────────────────────┬──────────────────────────┬─────────────────┐
    │                           │                          │                 │
    │1                          │1                         │1                │
┌───▼─────────┐        ┌────────▼────────┐       ┌────────▼────────┐    ┌──▼──────────┐
│   User      │        │  Assessment     │       │  ISOStandard    │    │ Template    │
├─────────────┤        ├─────────────────┤       │  Section        │    ├─────────────┤
│ id (PK)     │        │ id (PK)         │       ├─────────────────┤    │ id (PK)     │
│ email       │        │ title           │       │ id (PK)         │    │ name        │
│ passwordH   │        │ status (enum)   │       │ sectionNumber   │    │ isDefault   │
│ role (enum) │        │ overallScore    │       │ title           │    │ createdAt   │
│ createdAt   │        │ createdAt       │       │ parentId (FK)   │    └─────────────┘
└──┬──────────┘        └────┬───────────┘       │ order           │
   │                        │                   └────┬────────────┘
   │                        │1                       │1
   │                        │                        │
   │                   ┌────┴────────────┐           │M
   │                   │                 │      ┌────▼──────────────┐
   │                   │                 │      │  AuditQuestion   │
   │              ┌────▼──────────────┐ │      ├──────────────────┤
   │              │Assessment         │ │      │ id (PK)          │
   │              │TeamMember         │ │      │ questionText     │
   │              ├───────────────────┤ │      │ score1/2/3Crit   │
   │              │ id (PK)           │ │      │ sectionId (FK)   │
   │M             │ assessmentId (FK) │ │      │ standardRef      │
   │              │ userId (FK) ◄─────┼─┘      └────┬─────────────┘
   │              │ role (enum)       │             │1
   │              └───────────────────┘             │
   │                                                │M
   │                                           ┌────▼──────────────┐
   │                                           │Question           │
   │                                           │Response           │
   │                                           ├───────────────────┤
   │                                           │ id (PK)           │
   │                                           │ score (1-3)       │
   │                                           │ justification     │
   │                                           │ assessmentId(FK)  │
   │                                           │ questionId (FK)   │
   │                                           │ userId (FK) ◄─────┼──┐
   │                                           │ createdAt         │  │
   │                                           └────┬──────────────┘  │
   │                                                │1                │
   │                                                │                 │
   │                                           ┌────▼──────────────┐  │
   │                                           │  Evidence         │  │
   │                                           ├───────────────────┤  │
   │                                           │ id (PK)           │  │
   │                                           │ responseId (FK)   │  │
   │                                           │ fileName          │  │
   │                                           │ filePath          │  │
   │                                           │ uploadedById (FK)─┼──┘
   │                                           │ uploadedAt        │
   │                                           └───────────────────┘
   │
   │      ┌──────────────────────┐
   │      │NonConformity         │
   │      ├──────────────────────┤
   │      │ id (PK)              │
   │M     │ responseId (FK)      │
   └─────►│ severity (enum)      │
          │ status (enum)        │
          │ createdAt            │
          └──────┬───────────────┘
                 │1
                 │
                 │M
            ┌────▼──────────────┐
            │CorrectiveAction   │
            ├───────────────────┤
            │ id (PK)           │
            │ nonConformityId   │
            │ description       │
            │ assignedToId (FK) │
            │ priority (enum)   │
            │ status (enum)     │
            │ targetDate        │
            │ createdAt         │
            └───────────────────┘

Key:
PK   = Primary Key
FK   = Foreign Key
enum = PostgreSQL native enum type
1    = One
M    = Many
```

---

## Summary Statistics Visualization

```
╔═══════════════════════════════════════════════════════════╗
║         ISO 9001 Self-Assessment App - Key Stats           ║
╠═══════════════════════════════════════════════════════════╣
║                                                            ║
║  Project Metrics:                                         ║
║  ┌──────────────────────────────────────────────────────┐ ║
║  │ Tasks Completed:        ████████████████████ 108/108 │ ║
║  │ Development Phases:     ████████████████████  11/11  │ ║
║  │ Database Models:        ███████████ 10 models        │ ║
║  │ API Endpoints:          ███████████████ 50+          │ ║
║  └──────────────────────────────────────────────────────┘ ║
║                                                            ║
║  Test Coverage:                                           ║
║  ┌──────────────────────────────────────────────────────┐ ║
║  │ Backend Tests:          ███████████░  91 tests      │ ║
║  │ Frontend Tests:         ██████░░░░░░  60 tests      │ ║
║  │ Total Test Suite:       ███████████░░ 151 tests     │ ║
║  │ Coverage Level:         █████████░░░░ 85%+          │ ║
║  └──────────────────────────────────────────────────────┘ ║
║                                                            ║
║  ISO 9001 Framework:                                      ║
║  ┌──────────────────────────────────────────────────────┐ ║
║  │ ISO Sections:           ███████████░░░░  73 sections│ ║
║  │ Audit Questions:        █████░░░░░░░░░░  27 quest.  │ ║
║  │ Scoring Levels:         ███  1 Red, 2 Yellow, 3 Gre │ ║
║  │ User Roles:             █████  Admin, Mgr, Auditor, │ ║
║  │                              Head, Viewer (5 roles) │ ║
║  └──────────────────────────────────────────────────────┘ ║
║                                                            ║
║  Technology Stack:                                        ║
║  ┌──────────────────────────────────────────────────────┐ ║
║  │ Frontend:   Next.js 14  React 18  TypeScript         │ ║
║  │ Backend:    Express.js  Node.js    TypeScript        │ ║
║  │ Database:   PostgreSQL 12+  with native enums        │ ║
║  │ Deployment: Docker + Docker Compose                 │ ║
║  └──────────────────────────────────────────────────────┘ ║
║                                                            ║
║  Status: ✓ MVP COMPLETE ✓ PRODUCTION READY ✓ TESTED      ║
║                                                            ║
╚═══════════════════════════════════════════════════════════╝
```

---

**END OF VISUAL DIAGRAMS & ARCHITECTURE DOCUMENTATION**
