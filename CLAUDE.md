# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
```bash
# Backend (port 3001)
cd backend && npm run dev

# Frontend (port 3000)
cd frontend && npm run dev
```

### Build & Type Check
```bash
cd backend && npm run build        # prisma generate && tsc
cd frontend && npm run build       # next build
```

### Tests
```bash
cd backend && npm test             # jest --forceExit
cd backend && npm run test:watch
cd backend && npm run test:coverage
# Run a single test file:
cd backend && npx jest src/__tests__/auth.test.ts
```

### Lint
```bash
cd backend && npm run lint
cd frontend && npm run lint
```

### Database
```bash
cd backend && npm run db:migrate   # prisma migrate dev
cd backend && npm run db:push      # prisma db push (no migration files)
cd backend && npm run db:seed      # tsx prisma/seed.ts
cd backend && npm run db:studio    # prisma studio
```

## Architecture

### Monorepo Deployment (Vercel)
This is a monorepo deployed as a **single Vercel project** using `experimentalServices` in `vercel.json`. The frontend (Next.js) serves `/` and the backend (Express) is mounted at `/_/backend`. The Vercel entrypoint for the backend is `backend/api/index.ts` — this file connects the database and exports the Express app.

Frontend calls the backend via `NEXT_PUBLIC_API_URL` which is set to `/_/backend/api` in production. Locally the frontend points at `http://localhost:3001/api`.

### Backend Layer Pattern
Requests flow through: `Route → withValidation/withAuth proxy wrappers → asyncHandler → Controller → Service → Prisma`

- **`src/proxy/`** — reusable Express middleware factories: `withAuth`, `withRoles`, `withValidation`, `withOrgAccess`. Validation schemas live in `proxy/validationProxy.ts` (Zod).
- **`src/controllers/`** — thin handlers that destructure `req.body` and call services.
- **`src/services/`** — all business logic and Prisma queries.
- **`src/proxy/errorProxy.ts`** — global error handler and 404 handler mounted last in `index.ts`.

The `Request` type is augmented with `req.user` via `backend/src/types/express.d.ts`. A triple-slash reference `/// <reference path="./types/express.d.ts" />` at the top of `src/index.ts` is required for Vercel's type checker to pick it up.

### Frontend Auth Flow
- Tokens stored in `localStorage` (`accessToken`, `refreshToken`).
- Axios instance in `frontend/src/lib/api.ts` adds the Bearer token on every request and auto-refreshes on 401.
- Protected routes check auth state; unauthenticated users are redirected to `/login`.

### Database
- **Supabase PostgreSQL** via Prisma ORM.
- Use the **pooler URL** (`aws-0-eu-west-1.pooler.supabase.com:6543`) for the production `DATABASE_URL` on Vercel, with `?pgbouncer=true&connection_limit=1` appended.
- Use the **direct URL** (`db.fqnorsqggyshqfmihivw.supabase.co:5432`) for migrations and seeding — PgBouncer in transaction mode doesn't support prepared statements.
- Default seeded org ID: `00000000-0000-4000-8000-000000000001`. Seed credentials: `admin@example.com / admin123`, `quality.manager@example.com / quality123`, `auditor@example.com / auditor123`.

### Key Non-Obvious Config
- `app.set('trust proxy', 1)` in `backend/src/index.ts` — required for `express-rate-limit` to work behind Vercel's proxy.
- Winston file transports are disabled on Vercel (`process.env.VERCEL`) because the serverless filesystem is read-only.
- `backend/tsconfig.json` intentionally has no `rootDir` — Vercel's `@vercel/backends` type checker adds `api/index.ts` as a root file outside `src/`.
- Rate limiting is skipped when `NODE_ENV === 'test'`; `startServer()` is skipped when `NODE_ENV === 'test'` or `VERCEL` is set.
