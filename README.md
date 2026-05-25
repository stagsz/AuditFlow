# AuditFlow

**Streamline your audit journey.**

AuditFlow is an enterprise-grade ISO 9001 Quality Management & Audit Platform designed to simplify self-assessments, audit workflows, non-conformity tracking, and corrective action management.

## 🎯 Features

### Core Capabilities
- **Self-Assessment Management**: Create and manage ISO 9001 self-assessments with guided workflows
- **Audit Planning & Execution**: Schedule audits, assign auditors, and track audit progress
- **Non-Conformity Tracking**: Document, categorize, and manage non-conformities
- **Corrective Actions**: Define and monitor corrective and preventive actions (CAPA)
- **Reporting & Analytics**: Generate compliance reports and visual analytics
- **Role-Based Access Control**: Admin, Auditor, and User roles with granular permissions

### Technical Features
- Real-time data synchronization
- Secure authentication with JWT tokens
- PostgreSQL database with row-level security
- RESTful API backend
- Responsive Next.js frontend
- Comprehensive error handling and logging

## 🏗️ Architecture

AuditFlow is built with a modern, scalable architecture:

```
┌─────────────────────────────────────────────────────┐
│                    AuditFlow                         │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Frontend (Next.js 14)    Backend (Express.js)     │
│  ├─ React Components      ├─ REST API              │
│  ├─ TypeScript            ├─ Authentication        │
│  ├─ TailwindCSS           ├─ Business Logic        │
│  └─ Zustand State         └─ Middleware            │
│                                                     │
├─────────────────────────────────────────────────────┤
│          Supabase PostgreSQL Database               │
│  ├─ Assessments            ├─ Audits               │
│  ├─ Non-Conformities       ├─ Corrective Actions   │
│  ├─ Users & Roles          └─ Audit Evidence       │
└─────────────────────────────────────────────────────┘
```

## 🛠️ Technology Stack

### Frontend
- **Framework**: Next.js 14.2
- **Language**: TypeScript
- **UI Framework**: React 18
- **Styling**: TailwindCSS
- **State Management**: Zustand
- **Form Handling**: React Hook Form
- **API Client**: Axios
- **Testing**: Jest

### Backend
- **Runtime**: Node.js v22
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL (via Supabase)
- **ORM**: Prisma
- **Authentication**: JWT
- **Validation**: Zod
- **Testing**: Jest

### Infrastructure
- **Database**: Supabase (PostgreSQL)
- **Deployment**: Vercel (Frontend & Backend)
- **Version Control**: Git/GitHub

## 📦 Project Structure

```
AuditFlow/
├── frontend/                 # Next.js application
│   ├── src/
│   │   ├── app/             # Next.js App Router
│   │   ├── components/      # React components
│   │   ├── hooks/           # Custom hooks
│   │   ├── lib/             # Utilities & helpers
│   │   ├── pages/           # Legacy pages (if any)
│   │   └── utils/
│   │       └── supabase/    # Supabase clients
│   ├── public/              # Static assets
│   ├── .env.local           # Frontend env variables
│   └── package.json
│
├── backend/                  # Express.js API
│   ├── src/
│   │   ├── controllers/     # Route controllers
│   │   ├── middlewares/     # Express middlewares
│   │   ├── models/          # Data models
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic
│   │   ├── utils/           # Utilities
│   │   └── index.ts         # Entry point
│   ├── prisma/
│   │   └── schema.prisma    # Database schema
│   ├── tests/               # Test files
│   ├── .env.local           # Backend env variables
│   └── package.json
│
├── shared/                   # Shared types & utilities
│   ├── types/               # TypeScript types
│   └── utils/               # Shared utilities
│
├── docker/                   # Docker configuration
├── docs/                     # Documentation
├── scripts/                  # Utility scripts
├── vercel.json             # Vercel configuration
├── package.json            # Root package.json
└── README.md              # This file
```

## 🚀 Getting Started

### Prerequisites
- Node.js v22 or higher
- npm or yarn
- Git
- GitHub account (for version control)
- Supabase account (for database)
- Vercel account (for deployment)

### Local Development

#### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/auditflow.git
cd auditflow
```

#### 2. Install Dependencies

Frontend:
```bash
cd frontend
npm install
```

Backend:
```bash
cd backend
npm install
```

#### 3. Configure Environment Variables

Frontend (.env.local):
```bash
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_SUPABASE_URL=https://fqnorsqggyshqfmihivw.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_4hBVz1TFzEwD5cMH0G1cbQ_8uX8KGpR
NEXT_PUBLIC_APP_NAME=AuditFlow
```

Backend (.env.local):
```bash
DATABASE_URL=postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres
JWT_SECRET=your-secret-key
NODE_ENV=development
PORT=3001
```

#### 4. Database Setup

```bash
cd backend
npx prisma migrate dev
```

#### 5. Run Development Servers

Frontend (from frontend directory):
```bash
npm run dev
# Runs on http://localhost:3000
```

Backend (from backend directory, in another terminal):
```bash
npm run dev
# Runs on http://localhost:3001
```

## 📝 Available Scripts

### Frontend
```bash
npm run dev        # Start development server
npm run build      # Build for production
npm start          # Start production server
npm run lint       # Run ESLint
npm test           # Run tests
npm test:watch     # Run tests in watch mode
npm test:coverage  # Generate test coverage report
```

### Backend
```bash
npm run dev        # Start development server with hot reload
npm run build      # Build TypeScript
npm start          # Start production server
npm run lint       # Run ESLint
npm test           # Run tests
npm test:watch     # Run tests in watch mode
npm test:coverage  # Generate test coverage report
```

## 🧪 Testing

AuditFlow includes comprehensive test coverage:

- **Total Tests**: 151 passing
- **Backend Tests**: 91
- **Frontend Tests**: 60
- **Coverage**: Extensive coverage of critical paths
- **Test Framework**: Jest

Run tests:
```bash
# Frontend tests
cd frontend && npm test

# Backend tests
cd backend && npm test

# All tests
npm test (from root)
```

## 📚 API Documentation

### Authentication
All API endpoints require JWT authentication. Include the token in the Authorization header:

```bash
Authorization: Bearer <your-jwt-token>
```

### Base URL
- Development: `http://localhost:3001/api`
- Production: `https://auditflow-api.vercel.app/api`

### Endpoints

#### Assessments
- `GET /api/assessments` - List all assessments
- `POST /api/assessments` - Create new assessment
- `GET /api/assessments/:id` - Get assessment details
- `PUT /api/assessments/:id` - Update assessment
- `DELETE /api/assessments/:id` - Delete assessment

#### Audits
- `GET /api/audits` - List all audits
- `POST /api/audits` - Create new audit
- `GET /api/audits/:id` - Get audit details
- `PUT /api/audits/:id` - Update audit
- `DELETE /api/audits/:id` - Delete audit

#### Non-Conformities
- `GET /api/non-conformities` - List all NCRs
- `POST /api/non-conformities` - Create new NCR
- `GET /api/non-conformities/:id` - Get NCR details
- `PUT /api/non-conformities/:id` - Update NCR
- `DELETE /api/non-conformities/:id` - Delete NCR

#### Corrective Actions
- `GET /api/corrective-actions` - List all CAs
- `POST /api/corrective-actions` - Create new CA
- `GET /api/corrective-actions/:id` - Get CA details
- `PUT /api/corrective-actions/:id` - Update CA
- `DELETE /api/corrective-actions/:id` - Delete CA

## 🎨 Design System

### Colors
- **Primary**: Teal (#0F766E)
- **Secondary**: Deep Blue (#1E3A8A)
- **Accent**: Red (#DC2626)
- **Background**: Dark theme optimized for readability

### Typography
- **Body**: 17px minimum for accessibility
- **Headings**: 56px (H1), 40px (H2), 28px (H3)
- **Labels**: 14-15px minimum

### UI Components
AuditFlow uses a custom component library built with React and TailwindCSS, featuring:
- Form controls
- Data tables
- Modal dialogs
- Navigation components
- Cards and layouts
- Charts and graphs (via Recharts)

## 🔐 Security

### Authentication & Authorization
- JWT-based authentication
- Secure password hashing
- Role-based access control (RBAC)
- Session management via HTTP-only cookies
- Supabase Row-Level Security (RLS)

### Data Protection
- HTTPS/TLS encryption in transit
- PostgreSQL encryption at rest
- SQL injection prevention (Prisma ORM)
- XSS protection
- CORS configuration
- Rate limiting on API endpoints

### Best Practices
- Environment variables for sensitive data
- No secrets in code repositories
- Secure JWT secret generation
- Audit logging for compliance
- Regular security updates

## 📖 Documentation

Additional documentation is available in the `docs/` directory:
- `SUPABASE_SETUP_GUIDE.txt` - Database setup instructions
- `VERCEL_DEPLOYMENT_GUIDE.md` - Deployment guide
- `AUDITFLOW_BRANDING_GUIDE.md` - Brand guidelines
- `API_REFERENCE.md` - Detailed API documentation

## 🚢 Deployment

### Deploying to Vercel

#### Frontend
1. Connect GitHub repository to Vercel
2. Set root directory: `./frontend`
3. Add environment variables
4. Deploy

#### Backend
1. Create new Vercel project for backend
2. Set root directory: `./backend`
3. Add environment variables
4. Deploy

See `VERCEL_DEPLOYMENT_COMPLETE_GUIDE.txt` for detailed instructions.

### Environment Variables (Production)

Frontend:
```
NEXT_PUBLIC_API_URL=https://auditflow-api.vercel.app/api
NEXT_PUBLIC_SUPABASE_URL=https://fqnorsqggyshqfmihivw.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_4hBVz1TFzEwD5cMH0G1cbQ_8uX8KGpR
```

Backend:
```
DATABASE_URL=postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres
JWT_SECRET=your-secure-secret-key
NODE_ENV=production
```

## 🔄 CI/CD

AuditFlow uses GitHub Actions for:
- Automated testing on push
- Linting and code quality checks
- Build verification
- Deployment automation to Vercel

## 📊 Project Status

- **Version**: 1.0.0
- **Status**: Production Ready
- **MVP Tasks**: 108/108 ✅
- **Tests Passing**: 151/151 ✅
- **Vulnerabilities**: 0 ✅
- **Code Quality**: Excellent ✅

## 🤝 Contributing

### Development Workflow
1. Create a feature branch: `git checkout -b feature/your-feature`
2. Commit changes: `git commit -m "Add your feature"`
3. Push to branch: `git push origin feature/your-feature`
4. Open a Pull Request

### Code Standards
- TypeScript strict mode enabled
- ESLint configuration enforced
- Prettier for code formatting
- Comprehensive test coverage required
- All tests must pass before merge

## 📋 License

AuditFlow is proprietary software. All rights reserved.

## 👥 Team

**Project Lead**: Staffan Greisz

## 🐛 Bug Reports

Found a bug? Please create an issue on GitHub with:
- Description of the bug
- Steps to reproduce
- Expected behavior
- Actual behavior
- Screenshots (if applicable)

## 💡 Feature Requests

Have a feature idea? Open an issue with:
- Clear description of the feature
- Use case and benefit
- Proposed implementation (optional)
- Mockups or examples (if applicable)

## 📞 Support

For support, please:
1. Check existing documentation in `docs/`
2. Search existing GitHub issues
3. Create a new issue with detailed information

## 🔗 Useful Links

- **Live Application**: https://auditflow.vercel.app
- **API Endpoint**: https://auditflow-api.vercel.app
- **GitHub Repository**: https://github.com/yourusername/auditflow
- **Supabase Dashboard**: https://app.supabase.com
- **Vercel Dashboard**: https://vercel.com/dashboard

## 📅 Changelog

### Version 1.0.0 (May 2026)
- Initial release
- Complete MVP implementation
- All core features functional
- 151 tests passing
- Production deployment ready

---

**Made with ❤️ by Staffan Greisz**

**Tagline**: Streamline your audit journey.
