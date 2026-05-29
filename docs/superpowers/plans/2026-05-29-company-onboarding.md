# Company Onboarding Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a self-service company onboarding wizard so new companies register, configure org structure (divisions, departments, roles), and receive an invite link for colleagues to join.

**Architecture:** Wizard state lives in a Zustand store (no partial backend writes). A single `POST /api/onboarding/setup` creates org + all sub-records + admin user in one Prisma transaction and returns auth tokens. Join-via-invite creates a `UserOrgInvite` (PENDING); admin approves and assigns a role before the joinee can log in.

**Tech Stack:** Prisma 5 + PostgreSQL, Express + Zod, Next.js 14, Zustand, react-hook-form + Zod, TailwindCSS, shadcn/ui components.

---

## File Structure

**Backend – new files:**
- `backend/src/services/onboardingService.ts`
- `backend/src/controllers/onboardingController.ts`
- `backend/src/routes/onboardingRoutes.ts`
- `backend/src/services/orgInviteService.ts`
- `backend/src/controllers/orgInviteController.ts`
- `backend/src/routes/orgInviteRoutes.ts`
- `backend/src/__tests__/onboarding.test.ts`
- `backend/src/__tests__/orgInvite.test.ts`

**Backend – modified files:**
- `backend/prisma/schema.prisma` — add 4 new models + 2 enums + fields on Org/User
- `backend/src/proxy/validationProxy.ts` — add onboarding + invite schemas
- `backend/src/routes/index.ts` — register new route files

**Frontend – new files:**
- `frontend/src/stores/onboardingStore.ts`
- `frontend/src/components/onboarding/OnboardingLayout.tsx`
- `frontend/src/components/onboarding/Step1CompanyInfo.tsx`
- `frontend/src/components/onboarding/Step2Divisions.tsx`
- `frontend/src/components/onboarding/Step3Departments.tsx`
- `frontend/src/components/onboarding/Step4Roles.tsx`
- `frontend/src/components/onboarding/OnboardingComplete.tsx`
- `frontend/src/app/onboarding/page.tsx`
- `frontend/src/app/join/[slug]/page.tsx`
- `frontend/src/app/(dashboard)/admin/invites/page.tsx`

**Frontend – modified files:**
- `frontend/src/lib/api.ts` — add `onboardingApi`, `orgInviteApi`
- `frontend/src/app/(auth)/register/page.tsx` — add fork UI
- `frontend/src/components/layout/header.tsx` — add notification dot

---

### Task 1: Prisma Schema Changes

**Files:**
- Modify: `backend/prisma/schema.prisma`

- [ ] **Step 1: Add new enums and models to schema.prisma**

Add after the existing `ActionStatus` enum block (before the `model Organization` block):

```prisma
enum PermissionLevel {
  ADMIN
  MANAGER
  AUDITOR
  DEPT_HEAD
  VIEWER
}

enum InviteStatus {
  PENDING
  APPROVED
  REJECTED
}
```

Add to the `Organization` model (after `updatedAt`):

```prisma
  slug          String?  @unique
  setupComplete Boolean  @default(false)
  divisions     Division[]
  departments   Department[]
  orgRoles      OrgRole[]
  invites       UserOrgInvite[]
```

Add to the `User` model (after `refreshToken`):

```prisma
  orgRoleId     String?
  orgRole       OrgRole?       @relation(fields: [orgRoleId], references: [id])
  invites       UserOrgInvite[]
```

Add the four new models at the end of the file:

```prisma
model Division {
  id             String       @id @default(uuid())
  name           String
  createdAt      DateTime     @default(now())
  organizationId String
  organization   Organization @relation(fields: [organizationId], references: [id])
  departments    Department[]

  @@index([organizationId])
  @@map("divisions")
}

model Department {
  id             String       @id @default(uuid())
  name           String
  createdAt      DateTime     @default(now())
  organizationId String
  organization   Organization @relation(fields: [organizationId], references: [id])
  divisionId     String?
  division       Division?    @relation(fields: [divisionId], references: [id])

  @@index([organizationId])
  @@index([divisionId])
  @@map("departments")
}

model OrgRole {
  id              String          @id @default(uuid())
  name            String
  permissionLevel PermissionLevel
  isDefault       Boolean         @default(false)
  createdAt       DateTime        @default(now())
  organizationId  String
  organization    Organization    @relation(fields: [organizationId], references: [id])
  users           User[]

  @@index([organizationId])
  @@map("org_roles")
}

model UserOrgInvite {
  id             String       @id @default(uuid())
  status         InviteStatus @default(PENDING)
  createdAt      DateTime     @default(now())
  userId         String
  user           User         @relation(fields: [userId], references: [id])
  organizationId String
  organization   Organization @relation(fields: [organizationId], references: [id])

  @@index([userId])
  @@index([organizationId])
  @@map("user_org_invites")
}
```

- [ ] **Step 2: Regenerate Prisma client and create migration**

```bash
cd backend && npm run db:migrate
```

When prompted, name the migration: `add_company_onboarding`

- [ ] **Step 3: Verify generated types**

```bash
cd backend && npm run build 2>&1 | head -30
```

Expected: no errors about missing Prisma types (there may be pre-existing TypeScript errors unrelated to this change — those are OK).

- [ ] **Step 4: Commit**

```bash
git add backend/prisma/schema.prisma backend/prisma/migrations/
git commit -m "feat: add onboarding schema — Division, Department, OrgRole, UserOrgInvite"
```

---

### Task 2: Backend Validation Schemas

**Files:**
- Modify: `backend/src/proxy/validationProxy.ts`

- [ ] **Step 1: Add onboarding and invite schemas at the end of validationProxy.ts**

```typescript
export const onboardingSchemas = {
  setup: z.object({
    firstName: z.string().min(1, 'First name required'),
    lastName: z.string().min(1, 'Last name required'),
    email: z.string().email('Invalid email'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    company: z.object({
      name: z.string().min(1, 'Company name required'),
      slug: z
        .string()
        .min(2, 'Slug must be at least 2 characters')
        .max(50, 'Slug must be at most 50 characters')
        .regex(/^[a-z0-9-]+$/, 'Slug may only contain lowercase letters, numbers, and hyphens'),
      industry: z.string().optional(),
      country: z.string().optional(),
    }),
    divisions: z.array(z.object({ name: z.string().min(1) })),
    departments: z.array(
      z.object({
        name: z.string().min(1),
        divisionIndex: z.number().int().min(0).optional(),
      })
    ),
    roles: z.array(
      z.object({
        name: z.string().min(1),
        permissionLevel: z.enum(['MANAGER', 'AUDITOR', 'DEPT_HEAD', 'VIEWER']),
      })
    ),
  }),
};

export const orgInviteSchemas = {
  join: z.object({
    firstName: z.string().min(1, 'First name required'),
    lastName: z.string().min(1, 'Last name required'),
    email: z.string().email('Invalid email'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
  }),
  approve: z.object({
    orgRoleId: z.string().uuid('Invalid role ID'),
  }),
  slugParam: z.object({
    slug: z.string().min(1),
  }),
  inviteIdParam: z.object({
    id: z.string().uuid('Invalid invite ID'),
  }),
};
```

- [ ] **Step 2: Commit**

```bash
git add backend/src/proxy/validationProxy.ts
git commit -m "feat: add onboarding and org invite validation schemas"
```

---

### Task 3: Onboarding Service

**Files:**
- Create: `backend/src/services/onboardingService.ts`

- [ ] **Step 1: Write failing tests first — create `backend/src/__tests__/onboarding.test.ts`**

```typescript
import request from 'supertest';
import app from '../index';
import { prisma } from '../config/database';

const VALID_PAYLOAD = {
  firstName: 'Alice',
  lastName: 'Admin',
  email: 'alice@testcorp.com',
  password: 'password123',
  company: { name: 'Test Corp', slug: 'test-corp' },
  divisions: [{ name: 'Engineering' }],
  departments: [{ name: 'Backend', divisionIndex: 0 }],
  roles: [{ name: 'Quality Manager', permissionLevel: 'MANAGER' }],
};

async function cleanup() {
  await prisma.userOrgInvite.deleteMany();
  await prisma.user.deleteMany({ where: { email: { contains: 'testcorp' } } });
  await prisma.orgRole.deleteMany();
  await prisma.department.deleteMany();
  await prisma.division.deleteMany();
  await prisma.organization.deleteMany({ where: { slug: { not: null } } });
}

beforeEach(cleanup);
afterAll(cleanup);

describe('POST /api/onboarding/setup', () => {
  it('creates org, user, and sub-records; returns tokens', async () => {
    const res = await request(app).post('/api/onboarding/setup').send(VALID_PAYLOAD);
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('accessToken');
    expect(res.body.data).toHaveProperty('orgSlug', 'test-corp');

    const org = await prisma.organization.findUnique({ where: { slug: 'test-corp' } });
    expect(org).not.toBeNull();
    expect(org!.setupComplete).toBe(true);

    const divisions = await prisma.division.findMany({ where: { organizationId: org!.id } });
    expect(divisions).toHaveLength(1);
    expect(divisions[0].name).toBe('Engineering');

    const departments = await prisma.department.findMany({ where: { organizationId: org!.id } });
    expect(departments).toHaveLength(1);
    expect(departments[0].divisionId).toBe(divisions[0].id);
  });

  it('returns 409 when slug is taken', async () => {
    await request(app).post('/api/onboarding/setup').send(VALID_PAYLOAD);
    const res = await request(app)
      .post('/api/onboarding/setup')
      .send({ ...VALID_PAYLOAD, email: 'other@testcorp.com' });
    expect(res.status).toBe(409);
  });

  it('returns 409 when email is taken', async () => {
    await request(app).post('/api/onboarding/setup').send(VALID_PAYLOAD);
    const res = await request(app)
      .post('/api/onboarding/setup')
      .send({ ...VALID_PAYLOAD, company: { name: 'Other Corp', slug: 'other-corp' } });
    expect(res.status).toBe(409);
  });
});

describe('GET /api/onboarding/check-slug/:slug', () => {
  it('returns available: true for an unused slug', async () => {
    const res = await request(app).get('/api/onboarding/check-slug/unused-slug-xyz');
    expect(res.status).toBe(200);
    expect(res.body.data.available).toBe(true);
  });

  it('returns available: false for a taken slug', async () => {
    await request(app).post('/api/onboarding/setup').send(VALID_PAYLOAD);
    const res = await request(app).get('/api/onboarding/check-slug/test-corp');
    expect(res.status).toBe(200);
    expect(res.body.data.available).toBe(false);
  });
});
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
cd backend && npx jest src/__tests__/onboarding.test.ts --forceExit 2>&1 | tail -20
```

Expected: FAIL — routes don't exist yet.

- [ ] **Step 3: Create `backend/src/services/onboardingService.ts`**

```typescript
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/database';
import { config } from '../config';
import { ValidationError } from '../utils/errors';
import { UserRole } from '../types/enums';

interface SetupOrgData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  company: { name: string; slug: string; industry?: string; country?: string };
  divisions: { name: string }[];
  departments: { name: string; divisionIndex?: number }[];
  roles: { name: string; permissionLevel: 'MANAGER' | 'AUDITOR' | 'DEPT_HEAD' | 'VIEWER' }[];
}

export class OnboardingService {
  async setupOrganization(data: SetupOrgData) {
    const [existingEmail, existingSlug] = await Promise.all([
      prisma.user.findUnique({ where: { email: data.email } }),
      prisma.organization.findUnique({ where: { slug: data.company.slug } }),
    ]);
    if (existingEmail) throw new ValidationError('Email already registered');
    if (existingSlug) throw new ValidationError('Company URL is already taken');

    const passwordHash = await bcrypt.hash(data.password, 12);

    return prisma.$transaction(async (tx) => {
      const org = await tx.organization.create({
        data: {
          name: data.company.name,
          slug: data.company.slug,
          setupComplete: true,
        },
      });

      const divisionIds: string[] = [];
      for (const div of data.divisions) {
        const created = await tx.division.create({
          data: { name: div.name, organizationId: org.id },
        });
        divisionIds.push(created.id);
      }

      for (const dept of data.departments) {
        await tx.department.create({
          data: {
            name: dept.name,
            organizationId: org.id,
            divisionId:
              dept.divisionIndex !== undefined ? divisionIds[dept.divisionIndex] : null,
          },
        });
      }

      const adminRole = await tx.orgRole.create({
        data: {
          name: 'Admin',
          permissionLevel: 'ADMIN',
          isDefault: false,
          organizationId: org.id,
        },
      });

      for (const role of data.roles) {
        await tx.orgRole.create({
          data: {
            name: role.name,
            permissionLevel: role.permissionLevel,
            isDefault: true,
            organizationId: org.id,
          },
        });
      }

      const user = await tx.user.create({
        data: {
          email: data.email,
          passwordHash,
          firstName: data.firstName,
          lastName: data.lastName,
          role: UserRole.SYSTEM_ADMIN,
          organizationId: org.id,
          orgRoleId: adminRole.id,
        },
      });

      const payload = { userId: user.id, email: user.email, role: user.role, organizationId: org.id };
      const accessToken = jwt.sign(payload, config.jwt.secret, { expiresIn: config.jwt.expiresIn });
      const refreshToken = jwt.sign(payload, config.jwt.refreshSecret, { expiresIn: config.jwt.refreshExpiresIn });

      await tx.user.update({ where: { id: user.id }, data: { refreshToken } });

      return {
        user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName },
        accessToken,
        refreshToken,
        expiresIn: 3600,
        orgSlug: org.slug,
        inviteUrl: `/join/${org.slug}`,
      };
    });
  }

  async checkSlugAvailable(slug: string): Promise<boolean> {
    const org = await prisma.organization.findUnique({ where: { slug } });
    return org === null;
  }
}

export const onboardingService = new OnboardingService();
```

- [ ] **Step 4: Commit service**

```bash
git add backend/src/services/onboardingService.ts
git commit -m "feat: add onboarding service (setup org transaction + slug check)"
```

---

### Task 4: Onboarding Controller + Routes

**Files:**
- Create: `backend/src/controllers/onboardingController.ts`
- Create: `backend/src/routes/onboardingRoutes.ts`
- Modify: `backend/src/routes/index.ts`

- [ ] **Step 1: Create `backend/src/controllers/onboardingController.ts`**

```typescript
import { Request, Response } from 'express';
import { onboardingService } from '../services/onboardingService';

export class OnboardingController {
  async setup(req: Request, res: Response): Promise<void> {
    const data = req.body;
    const result = await onboardingService.setupOrganization(data);
    res.status(201).json({ success: true, data: result });
  }

  async checkSlug(req: Request, res: Response): Promise<void> {
    const { slug } = req.params;
    const available = await onboardingService.checkSlugAvailable(slug);
    res.json({ success: true, data: { available } });
  }
}

export const onboardingController = new OnboardingController();
```

- [ ] **Step 2: Create `backend/src/routes/onboardingRoutes.ts`**

```typescript
import { Router } from 'express';
import { onboardingController } from '../controllers/onboardingController';
import { withValidation, onboardingSchemas } from '../proxy/validationProxy';
import { asyncHandler } from '../proxy';

const router = Router();

router.post(
  '/setup',
  withValidation(
    { body: onboardingSchemas.setup },
    asyncHandler(onboardingController.setup.bind(onboardingController))
  )
);

router.get(
  '/check-slug/:slug',
  asyncHandler(onboardingController.checkSlug.bind(onboardingController))
);

export default router;
```

- [ ] **Step 3: Register routes in `backend/src/routes/index.ts`**

Add after the existing imports:

```typescript
import onboardingRoutes from './onboardingRoutes';
```

Add after `router.use('/health', healthRoutes);`:

```typescript
router.use('/onboarding', onboardingRoutes);
```

- [ ] **Step 4: Run onboarding tests — expect them to pass now**

```bash
cd backend && npx jest src/__tests__/onboarding.test.ts --forceExit 2>&1 | tail -20
```

Expected: all 4 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add backend/src/controllers/onboardingController.ts backend/src/routes/onboardingRoutes.ts backend/src/routes/index.ts
git commit -m "feat: add onboarding controller and routes"
```

---

### Task 5: Org Invite Service + Controller + Routes

**Files:**
- Create: `backend/src/services/orgInviteService.ts`
- Create: `backend/src/controllers/orgInviteController.ts`
- Create: `backend/src/routes/orgInviteRoutes.ts`
- Modify: `backend/src/routes/index.ts`

- [ ] **Step 1: Write failing tests — create `backend/src/__tests__/orgInvite.test.ts`**

```typescript
import request from 'supertest';
import app from '../index';
import { prisma } from '../config/database';
import { createTestUser, authenticatedRequest } from './helpers';
import { UserRole } from '../types/enums';

let orgId: string;
let orgSlug: string;
let adminToken: string;

async function cleanup() {
  await prisma.userOrgInvite.deleteMany();
  await prisma.user.deleteMany({ where: { email: { contains: 'invitetest' } } });
  await prisma.orgRole.deleteMany({ where: { organization: { slug: 'invite-test-corp' } } });
  await prisma.organization.deleteMany({ where: { slug: 'invite-test-corp' } });
}

beforeEach(async () => {
  await cleanup();
  const org = await prisma.organization.create({
    data: { name: 'Invite Test Corp', slug: 'invite-test-corp', setupComplete: true },
  });
  orgId = org.id;
  orgSlug = org.slug!;
  const admin = await createTestUser({
    email: 'admin@invitetest.com',
    role: UserRole.SYSTEM_ADMIN,
    organizationId: orgId,
  });
  const loginRes = await request(app)
    .post('/api/auth/login')
    .send({ email: admin.email, password: admin.password });
  adminToken = loginRes.body.data.accessToken;
});

afterAll(cleanup);

describe('GET /api/org/invite/:slug', () => {
  it('returns company name for a valid slug', async () => {
    const res = await request(app).get(`/api/org/invite/${orgSlug}`);
    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe('Invite Test Corp');
  });

  it('returns 404 for unknown slug', async () => {
    const res = await request(app).get('/api/org/invite/no-such-org');
    expect(res.status).toBe(404);
  });
});

describe('POST /api/org/invite/:slug/join', () => {
  it('creates a pending invite for a new user', async () => {
    const res = await request(app).post(`/api/org/invite/${orgSlug}/join`).send({
      firstName: 'Bob',
      lastName: 'Joiner',
      email: 'bob@invitetest.com',
      password: 'password123',
    });
    expect(res.status).toBe(201);
    const invite = await prisma.userOrgInvite.findFirst({
      where: { organizationId: orgId },
    });
    expect(invite).not.toBeNull();
    expect(invite!.status).toBe('PENDING');
    const user = await prisma.user.findUnique({ where: { email: 'bob@invitetest.com' } });
    expect(user!.isActive).toBe(false);
  });
});

describe('GET /api/org/invites', () => {
  it('returns pending invites for admin', async () => {
    await request(app).post(`/api/org/invite/${orgSlug}/join`).send({
      firstName: 'Bob',
      lastName: 'Joiner',
      email: 'bob@invitetest.com',
      password: 'password123',
    });
    const res = await request(app)
      .get('/api/org/invites')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.data.invites).toHaveLength(1);
  });

  it('returns 401 without auth', async () => {
    const res = await request(app).get('/api/org/invites');
    expect(res.status).toBe(401);
  });
});

describe('PATCH /api/org/invites/:id', () => {
  it('approves invite and activates user', async () => {
    await request(app).post(`/api/org/invite/${orgSlug}/join`).send({
      firstName: 'Bob',
      lastName: 'Joiner',
      email: 'bob@invitetest.com',
      password: 'password123',
    });
    const adminRole = await prisma.orgRole.create({
      data: { name: 'Viewer', permissionLevel: 'VIEWER', organizationId: orgId },
    });
    const invite = await prisma.userOrgInvite.findFirst({ where: { organizationId: orgId } });

    const res = await request(app)
      .patch(`/api/org/invites/${invite!.id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ orgRoleId: adminRole.id, action: 'approve' });
    expect(res.status).toBe(200);

    const user = await prisma.user.findUnique({ where: { email: 'bob@invitetest.com' } });
    expect(user!.isActive).toBe(true);
    expect(user!.orgRoleId).toBe(adminRole.id);
  });
});
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
cd backend && npx jest src/__tests__/orgInvite.test.ts --forceExit 2>&1 | tail -20
```

Expected: FAIL.

- [ ] **Step 3: Create `backend/src/services/orgInviteService.ts`**

```typescript
import bcrypt from 'bcryptjs';
import { prisma } from '../config/database';
import { NotFoundError, ValidationError } from '../utils/errors';
import { UserRole } from '../types/enums';

export class OrgInviteService {
  async getOrgBySlug(slug: string) {
    const org = await prisma.organization.findUnique({ where: { slug } });
    if (!org) throw new NotFoundError('Organization not found');
    return { id: org.id, name: org.name };
  }

  async joinOrg(
    slug: string,
    data: { firstName: string; lastName: string; email: string; password: string }
  ) {
    const org = await prisma.organization.findUnique({ where: { slug } });
    if (!org) throw new NotFoundError('Organization not found');

    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) throw new ValidationError('Email already registered');

    const passwordHash = await bcrypt.hash(data.password, 12);

    await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: data.email,
          passwordHash,
          firstName: data.firstName,
          lastName: data.lastName,
          role: UserRole.VIEWER,
          organizationId: org.id,
          isActive: false,
        },
      });
      await tx.userOrgInvite.create({
        data: { userId: user.id, organizationId: org.id },
      });
    });
  }

  async listInvites(organizationId: string) {
    const invites = await prisma.userOrgInvite.findMany({
      where: { organizationId, status: 'PENDING' },
      include: { user: { select: { id: true, firstName: true, lastName: true, email: true } } },
      orderBy: { createdAt: 'asc' },
    });
    const orgRoles = await prisma.orgRole.findMany({
      where: { organizationId },
      select: { id: true, name: true, permissionLevel: true },
    });
    return { invites, orgRoles };
  }

  async resolveInvite(
    inviteId: string,
    organizationId: string,
    action: 'approve' | 'reject',
    orgRoleId?: string
  ) {
    const invite = await prisma.userOrgInvite.findUnique({ where: { id: inviteId } });
    if (!invite || invite.organizationId !== organizationId)
      throw new NotFoundError('Invite not found');
    if (invite.status !== 'PENDING') throw new ValidationError('Invite already resolved');

    if (action === 'approve') {
      if (!orgRoleId) throw new ValidationError('orgRoleId required for approval');
      await prisma.$transaction([
        prisma.userOrgInvite.update({ where: { id: inviteId }, data: { status: 'APPROVED' } }),
        prisma.user.update({
          where: { id: invite.userId },
          data: { isActive: true, orgRoleId },
        }),
      ]);
    } else {
      await prisma.userOrgInvite.update({ where: { id: inviteId }, data: { status: 'REJECTED' } });
    }
  }

  async pendingCount(organizationId: string): Promise<number> {
    return prisma.userOrgInvite.count({ where: { organizationId, status: 'PENDING' } });
  }
}

export const orgInviteService = new OrgInviteService();
```

- [ ] **Step 4: Create `backend/src/controllers/orgInviteController.ts`**

```typescript
import { Request, Response } from 'express';
import { orgInviteService } from '../services/orgInviteService';

export class OrgInviteController {
  async getOrg(req: Request, res: Response): Promise<void> {
    const org = await orgInviteService.getOrgBySlug(req.params.slug);
    res.json({ success: true, data: org });
  }

  async join(req: Request, res: Response): Promise<void> {
    await orgInviteService.joinOrg(req.params.slug, req.body);
    res.status(201).json({ success: true, message: 'Request submitted. Await admin approval.' });
  }

  async listInvites(req: Request, res: Response): Promise<void> {
    const result = await orgInviteService.listInvites(req.user!.organizationId);
    res.json({ success: true, data: result });
  }

  async resolveInvite(req: Request, res: Response): Promise<void> {
    const { action, orgRoleId } = req.body;
    await orgInviteService.resolveInvite(
      req.params.id,
      req.user!.organizationId,
      action,
      orgRoleId
    );
    res.json({ success: true });
  }

  async pendingCount(req: Request, res: Response): Promise<void> {
    const count = await orgInviteService.pendingCount(req.user!.organizationId);
    res.json({ success: true, data: { count } });
  }
}

export const orgInviteController = new OrgInviteController();
```

- [ ] **Step 5: Create `backend/src/routes/orgInviteRoutes.ts`**

```typescript
import { Router } from 'express';
import { orgInviteController } from '../controllers/orgInviteController';
import { withAuth, withValidation, asyncHandler } from '../proxy';
import { orgInviteSchemas } from '../proxy/validationProxy';

const router = Router();

// Public
router.get(
  '/invite/:slug',
  asyncHandler(orgInviteController.getOrg.bind(orgInviteController))
);

router.post(
  '/invite/:slug/join',
  withValidation(
    { body: orgInviteSchemas.join },
    asyncHandler(orgInviteController.join.bind(orgInviteController))
  )
);

// Protected
router.get(
  '/invites',
  withAuth(asyncHandler(orgInviteController.listInvites.bind(orgInviteController)))
);

router.get(
  '/invites/pending-count',
  withAuth(asyncHandler(orgInviteController.pendingCount.bind(orgInviteController)))
);

router.patch(
  '/invites/:id',
  withAuth(
    withValidation(
      { body: orgInviteSchemas.approve, params: orgInviteSchemas.inviteIdParam },
      asyncHandler(orgInviteController.resolveInvite.bind(orgInviteController))
    )
  )
);

export default router;
```

Note: the `approve` schema needs an `action` field. Update `orgInviteSchemas.approve` in `validationProxy.ts`:

```typescript
approve: z.object({
  action: z.enum(['approve', 'reject']),
  orgRoleId: z.string().uuid().optional(),
}),
```

- [ ] **Step 6: Register in `backend/src/routes/index.ts`**

Add import:

```typescript
import orgInviteRoutes from './orgInviteRoutes';
```

Add route registration after the onboarding line:

```typescript
router.use('/org', orgInviteRoutes);
```

- [ ] **Step 7: Run all invite tests**

```bash
cd backend && npx jest src/__tests__/orgInvite.test.ts --forceExit 2>&1 | tail -20
```

Expected: all PASS.

- [ ] **Step 8: Run full test suite to confirm no regressions**

```bash
cd backend && npm test 2>&1 | tail -20
```

Expected: all existing tests still pass.

- [ ] **Step 9: Commit**

```bash
git add backend/src/services/orgInviteService.ts backend/src/controllers/orgInviteController.ts backend/src/routes/orgInviteRoutes.ts backend/src/routes/index.ts backend/src/proxy/validationProxy.ts
git commit -m "feat: add org invite service, controller, and routes"
```

---

### Task 6: Frontend API Client Extensions

**Files:**
- Modify: `frontend/src/lib/api.ts`

- [ ] **Step 1: Add onboardingApi and orgInviteApi to api.ts**

After the last existing API export, add:

```typescript
export const onboardingApi = {
  checkSlug: (slug: string) =>
    api.get<{ success: boolean; data: { available: boolean } }>(
      `/onboarding/check-slug/${slug}`
    ),
  setup: (data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    company: { name: string; slug: string; industry?: string; country?: string };
    divisions: { name: string }[];
    departments: { name: string; divisionIndex?: number }[];
    roles: { name: string; permissionLevel: string }[];
  }) => api.post('/onboarding/setup', data),
};

export const orgInviteApi = {
  getOrg: (slug: string) =>
    api.get<{ success: boolean; data: { id: string; name: string } }>(
      `/org/invite/${slug}`
    ),
  join: (
    slug: string,
    data: { firstName: string; lastName: string; email: string; password: string }
  ) => api.post(`/org/invite/${slug}/join`, data),
  listInvites: () =>
    api.get<{
      success: boolean;
      data: {
        invites: Array<{
          id: string;
          createdAt: string;
          user: { id: string; firstName: string; lastName: string; email: string };
        }>;
        orgRoles: Array<{ id: string; name: string; permissionLevel: string }>;
      };
    }>('/org/invites'),
  pendingCount: () =>
    api.get<{ success: boolean; data: { count: number } }>('/org/invites/pending-count'),
  resolve: (id: string, action: 'approve' | 'reject', orgRoleId?: string) =>
    api.patch(`/org/invites/${id}`, { action, orgRoleId }),
};
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/lib/api.ts
git commit -m "feat: add onboardingApi and orgInviteApi to frontend API client"
```

---

### Task 7: Zustand Onboarding Store

**Files:**
- Create: `frontend/src/stores/onboardingStore.ts`

- [ ] **Step 1: Create the store**

```typescript
import { create } from 'zustand';

export type PermissionLevel = 'MANAGER' | 'AUDITOR' | 'DEPT_HEAD' | 'VIEWER';

export interface Division {
  id: string;
  name: string;
}

export interface Department {
  id: string;
  name: string;
  divisionId?: string;
}

export interface OrgRoleDraft {
  id: string;
  name: string;
  permissionLevel: PermissionLevel;
  locked?: boolean;
}

export interface PersonalInfo {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface CompanyInfo {
  name: string;
  slug: string;
  industry?: string;
  country?: string;
}

interface OnboardingState {
  step: number;
  personal: PersonalInfo;
  company: CompanyInfo;
  divisions: Division[];
  departments: Department[];
  roles: OrgRoleDraft[];
  inviteUrl: string;
  setStep: (step: number) => void;
  setPersonal: (info: PersonalInfo) => void;
  setCompany: (info: CompanyInfo) => void;
  addDivision: (name: string) => void;
  removeDivision: (id: string) => void;
  addDepartment: (name: string, divisionId?: string) => void;
  removeDepartment: (id: string) => void;
  updateDepartment: (id: string, updates: Partial<Department>) => void;
  addRole: (name: string, permissionLevel: PermissionLevel) => void;
  removeRole: (id: string) => void;
  updateRole: (id: string, updates: Partial<OrgRoleDraft>) => void;
  setInviteUrl: (url: string) => void;
  reset: () => void;
}

const DEFAULT_ROLES: OrgRoleDraft[] = [
  { id: 'default-1', name: 'Quality Manager', permissionLevel: 'MANAGER' },
  { id: 'default-2', name: 'Internal Auditor', permissionLevel: 'AUDITOR' },
  { id: 'default-3', name: 'Department Head', permissionLevel: 'DEPT_HEAD' },
  { id: 'default-4', name: 'Viewer', permissionLevel: 'VIEWER' },
];

const INITIAL_STATE = {
  step: 1,
  personal: { firstName: '', lastName: '', email: '', password: '' },
  company: { name: '', slug: '' },
  divisions: [] as Division[],
  departments: [] as Department[],
  roles: DEFAULT_ROLES,
  inviteUrl: '',
};

let nextId = 1;
const uid = () => `local-${nextId++}`;

export const useOnboardingStore = create<OnboardingState>((set) => ({
  ...INITIAL_STATE,
  setStep: (step) => set({ step }),
  setPersonal: (personal) => set({ personal }),
  setCompany: (company) => set({ company }),
  addDivision: (name) =>
    set((s) => ({ divisions: [...s.divisions, { id: uid(), name }] })),
  removeDivision: (id) =>
    set((s) => ({
      divisions: s.divisions.filter((d) => d.id !== id),
      departments: s.departments.map((dept) =>
        dept.divisionId === id ? { ...dept, divisionId: undefined } : dept
      ),
    })),
  addDepartment: (name, divisionId) =>
    set((s) => ({ departments: [...s.departments, { id: uid(), name, divisionId }] })),
  removeDepartment: (id) =>
    set((s) => ({ departments: s.departments.filter((d) => d.id !== id) })),
  updateDepartment: (id, updates) =>
    set((s) => ({
      departments: s.departments.map((d) => (d.id === id ? { ...d, ...updates } : d)),
    })),
  addRole: (name, permissionLevel) =>
    set((s) => ({ roles: [...s.roles, { id: uid(), name, permissionLevel }] })),
  removeRole: (id) =>
    set((s) => ({ roles: s.roles.filter((r) => r.id !== id || r.locked) })),
  updateRole: (id, updates) =>
    set((s) => ({
      roles: s.roles.map((r) => (r.id === id ? { ...r, ...updates } : r)),
    })),
  setInviteUrl: (inviteUrl) => set({ inviteUrl }),
  reset: () => set({ ...INITIAL_STATE, roles: DEFAULT_ROLES }),
}));
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/stores/onboardingStore.ts
git commit -m "feat: add Zustand onboarding store"
```

---

### Task 8: Register Page Fork

**Files:**
- Modify: `frontend/src/app/(auth)/register/page.tsx`

- [ ] **Step 1: Replace the register page with a fork**

```tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { useOnboardingStore } from '@/stores/onboardingStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getAuthErrorInfo, isNetworkError } from '@/lib/auth-errors';

type Mode = 'choose' | 'create' | 'join';

const personalSchema = z
  .object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

const joinSchema = z.object({
  slug: z.string().min(1, 'Enter the company invite link or slug'),
});

type PersonalFormData = z.infer<typeof personalSchema>;
type JoinFormData = z.infer<typeof joinSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>('choose');
  const setPersonal = useOnboardingStore((s) => s.setPersonal);
  const reset = useOnboardingStore((s) => s.reset);

  const personalForm = useForm<PersonalFormData>({ resolver: zodResolver(personalSchema) });
  const joinForm = useForm<JoinFormData>({ resolver: zodResolver(joinSchema) });

  const onCreateSubmit = (data: PersonalFormData) => {
    reset();
    setPersonal({ firstName: data.firstName, lastName: data.lastName, email: data.email, password: data.password });
    router.push('/onboarding');
  };

  const onJoinSubmit = (data: JoinFormData) => {
    const slug = data.slug.replace(/^.*\/join\//, '').trim();
    router.push(`/join/${slug}`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mb-4 shadow-sm">
            <svg className="w-10 h-10 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <CardTitle className="text-2xl">Get Started</CardTitle>
          <CardDescription>Create a new company account or join an existing one</CardDescription>
        </CardHeader>
        <CardContent>
          {mode === 'choose' && (
            <div className="space-y-3">
              <Button className="w-full" onClick={() => setMode('create')}>
                Create a company account
              </Button>
              <Button variant="outline" className="w-full" onClick={() => setMode('join')}>
                Join an existing company
              </Button>
              <p className="text-center text-sm text-gray-600">
                Already have an account?{' '}
                <Link href="/login" className="text-emerald-600 font-medium">Sign in</Link>
              </p>
            </div>
          )}

          {mode === 'create' && (
            <form onSubmit={personalForm.handleSubmit(onCreateSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input {...personalForm.register('firstName')} label="First name" placeholder="John" error={personalForm.formState.errors.firstName?.message} autoComplete="given-name" />
                <Input {...personalForm.register('lastName')} label="Last name" placeholder="Doe" error={personalForm.formState.errors.lastName?.message} autoComplete="family-name" />
              </div>
              <Input {...personalForm.register('email')} type="email" label="Email address" placeholder="you@company.com" error={personalForm.formState.errors.email?.message} autoComplete="email" />
              <Input {...personalForm.register('password')} type="password" label="Password" placeholder="At least 8 characters" error={personalForm.formState.errors.password?.message} autoComplete="new-password" />
              <Input {...personalForm.register('confirmPassword')} type="password" label="Confirm password" placeholder="Repeat password" error={personalForm.formState.errors.confirmPassword?.message} autoComplete="new-password" />
              <Button type="submit" className="w-full" loading={personalForm.formState.isSubmitting}>Continue to company setup</Button>
              <Button type="button" variant="ghost" className="w-full" onClick={() => setMode('choose')}>Back</Button>
            </form>
          )}

          {mode === 'join' && (
            <form onSubmit={joinForm.handleSubmit(onJoinSubmit)} className="space-y-4">
              <Input {...joinForm.register('slug')} label="Invite link or company slug" placeholder="acme-corp or full invite URL" error={joinForm.formState.errors.slug?.message} />
              <Button type="submit" className="w-full">Continue</Button>
              <Button type="button" variant="ghost" className="w-full" onClick={() => setMode('choose')}>Back</Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/app/(auth)/register/page.tsx
git commit -m "feat: add create/join fork to register page"
```

---

### Task 9: Onboarding Wizard

**Files:**
- Create: `frontend/src/components/onboarding/OnboardingLayout.tsx`
- Create: `frontend/src/components/onboarding/Step1CompanyInfo.tsx`
- Create: `frontend/src/components/onboarding/Step2Divisions.tsx`
- Create: `frontend/src/components/onboarding/Step3Departments.tsx`
- Create: `frontend/src/components/onboarding/Step4Roles.tsx`
- Create: `frontend/src/components/onboarding/OnboardingComplete.tsx`
- Create: `frontend/src/app/onboarding/page.tsx`

- [ ] **Step 1: Create `OnboardingLayout.tsx`**

```tsx
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const STEP_LABELS = ['Company Info', 'Divisions', 'Departments', 'Roles'];

export default function OnboardingLayout({
  step,
  children,
}: {
  step: number;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="text-xl">Set up your company</CardTitle>
          <CardDescription>Step {step} of 4 — {STEP_LABELS[step - 1]}</CardDescription>
          <div className="flex gap-1 mt-2">
            {STEP_LABELS.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 flex-1 rounded-full ${i < step ? 'bg-emerald-500' : 'bg-gray-200'}`}
              />
            ))}
          </div>
        </CardHeader>
        <CardContent>{children}</CardContent>
      </Card>
    </div>
  );
}
```

- [ ] **Step 2: Create `Step1CompanyInfo.tsx`**

```tsx
'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useOnboardingStore } from '@/stores/onboardingStore';
import { onboardingApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const schema = z.object({
  name: z.string().min(1, 'Company name is required'),
  slug: z
    .string()
    .min(2, 'At least 2 characters')
    .max(50)
    .regex(/^[a-z0-9-]+$/, 'Lowercase letters, numbers, and hyphens only'),
  industry: z.string().optional(),
  country: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

function generateSlug(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export default function Step1CompanyInfo() {
  const { company, setCompany, setStep } = useOnboardingStore();
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);
  const [checkingSlug, setCheckingSlug] = useState(false);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: company,
  });

  const nameValue = watch('name');
  const slugValue = watch('slug');

  useEffect(() => {
    if (nameValue && !company.slug) {
      setValue('slug', generateSlug(nameValue));
    }
  }, [nameValue]);

  const checkSlug = async (slug: string) => {
    if (!slug || slug.length < 2) return;
    setCheckingSlug(true);
    try {
      const res = await onboardingApi.checkSlug(slug);
      setSlugAvailable(res.data.data.available);
    } catch {
      setSlugAvailable(null);
    } finally {
      setCheckingSlug(false);
    }
  };

  const onSubmit = (data: FormData) => {
    if (slugAvailable === false) return;
    setCompany(data);
    setStep(2);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input {...register('name')} label="Company name" placeholder="Acme Corp" error={errors.name?.message} />
      <div>
        <Input
          {...register('slug')}
          label="Company URL"
          placeholder="acme-corp"
          error={errors.slug?.message}
          onBlur={(e) => checkSlug(e.target.value)}
        />
        {checkingSlug && <p className="text-xs text-gray-400 mt-1">Checking availability…</p>}
        {!checkingSlug && slugAvailable === true && (
          <p className="text-xs text-emerald-600 mt-1">✓ Available — your invite link will be /join/{slugValue}</p>
        )}
        {!checkingSlug && slugAvailable === false && (
          <p className="text-xs text-red-500 mt-1">This URL is already taken</p>
        )}
      </div>
      <Input {...register('industry')} label="Industry (optional)" placeholder="Manufacturing" />
      <Input {...register('country')} label="Country (optional)" placeholder="Sweden" />
      <Button type="submit" className="w-full">Next</Button>
    </form>
  );
}
```

- [ ] **Step 3: Create `Step2Divisions.tsx`**

```tsx
'use client';

import { useState } from 'react';
import { useOnboardingStore } from '@/stores/onboardingStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function Step2Divisions() {
  const { divisions, addDivision, removeDivision, setStep } = useOnboardingStore();
  const [newName, setNewName] = useState('');

  const handleAdd = () => {
    const trimmed = newName.trim();
    if (trimmed) {
      addDivision(trimmed);
      setNewName('');
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">
        Divisions group departments into larger units (e.g. Europe, Manufacturing). This step is optional.
      </p>
      <div className="space-y-2">
        {divisions.map((div) => (
          <div key={div.id} className="flex items-center gap-2">
            <span className="flex-1 text-sm border rounded px-3 py-2 bg-gray-50">{div.name}</span>
            <Button type="button" variant="ghost" size="sm" onClick={() => removeDivision(div.id)}>
              Remove
            </Button>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <Input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Division name"
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAdd())}
        />
        <Button type="button" variant="outline" onClick={handleAdd}>Add</Button>
      </div>
      <div className="flex justify-between pt-2">
        <Button type="button" variant="ghost" onClick={() => setStep(1)}>Back</Button>
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={() => setStep(3)}>Skip</Button>
          <Button type="button" onClick={() => setStep(3)}>Next</Button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Create `Step3Departments.tsx`**

```tsx
'use client';

import { useState } from 'react';
import { useOnboardingStore } from '@/stores/onboardingStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const SUGGESTIONS = ['Quality', 'Operations', 'HR', 'Finance', 'IT'];

export default function Step3Departments() {
  const { departments, divisions, addDepartment, removeDepartment, updateDepartment, setStep } =
    useOnboardingStore();
  const [newName, setNewName] = useState('');
  const [newDivisionId, setNewDivisionId] = useState('');

  const handleAdd = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    addDepartment(trimmed, newDivisionId || undefined);
    setNewName('');
    setNewDivisionId('');
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">Add departments within your company.</p>
      {departments.length === 0 && (
        <div className="flex flex-wrap gap-2">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => addDepartment(s)}
              className="text-xs border rounded-full px-3 py-1 hover:bg-emerald-50 hover:border-emerald-300 transition-colors"
            >
              + {s}
            </button>
          ))}
        </div>
      )}
      <div className="space-y-2">
        {departments.map((dept) => (
          <div key={dept.id} className="flex items-center gap-2">
            <span className="flex-1 text-sm border rounded px-3 py-2 bg-gray-50">{dept.name}</span>
            {divisions.length > 0 && (
              <select
                className="text-sm border rounded px-2 py-2 bg-white"
                value={dept.divisionId ?? ''}
                onChange={(e) => updateDepartment(dept.id, { divisionId: e.target.value || undefined })}
              >
                <option value="">No division</option>
                {divisions.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            )}
            <Button type="button" variant="ghost" size="sm" onClick={() => removeDepartment(dept.id)}>
              Remove
            </Button>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <Input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Department name"
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAdd(newName))}
        />
        {divisions.length > 0 && (
          <select
            className="text-sm border rounded px-2 py-2 bg-white"
            value={newDivisionId}
            onChange={(e) => setNewDivisionId(e.target.value)}
          >
            <option value="">No division</option>
            {divisions.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        )}
        <Button type="button" variant="outline" onClick={() => handleAdd(newName)}>Add</Button>
      </div>
      <div className="flex justify-between pt-2">
        <Button type="button" variant="ghost" onClick={() => setStep(2)}>Back</Button>
        <Button type="button" onClick={() => setStep(4)}>Next</Button>
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Create `Step4Roles.tsx`**

```tsx
'use client';

import { useState } from 'react';
import { useOnboardingStore, PermissionLevel } from '@/stores/onboardingStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { onboardingApi } from '@/lib/api';

const PERMISSION_LABELS: Record<PermissionLevel, string> = {
  MANAGER: 'Manager',
  AUDITOR: 'Auditor',
  DEPT_HEAD: 'Department Head',
  VIEWER: 'Viewer',
};

export default function Step4Roles() {
  const { roles, addRole, removeRole, updateRole, personal, company, divisions, departments, setStep, setInviteUrl } =
    useOnboardingStore();
  const [newName, setNewName] = useState('');
  const [newLevel, setNewLevel] = useState<PermissionLevel>('VIEWER');
  const [submitting, setSubmitting] = useState(false);

  const handleAdd = () => {
    if (newName.trim()) {
      addRole(newName.trim(), newLevel);
      setNewName('');
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const divisionList = divisions.map((d) => ({ name: d.name }));
      const deptList = departments.map((d) => ({
        name: d.name,
        divisionIndex: d.divisionId
          ? divisions.findIndex((div) => div.id === d.divisionId)
          : undefined,
      }));
      const roleList = roles.map((r) => ({ name: r.name, permissionLevel: r.permissionLevel }));

      const res = await onboardingApi.setup({
        ...personal,
        company,
        divisions: divisionList,
        departments: deptList,
        roles: roleList,
      });

      const { accessToken, refreshToken, inviteUrl } = res.data.data;
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      setInviteUrl(inviteUrl);
      setStep(5);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: { message?: string } } } })
        ?.response?.data?.error?.message ?? 'Setup failed. Please try again.';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">
        Define roles for your team. The Admin role is created automatically for you.
      </p>
      <div className="space-y-2">
        <div className="flex items-center gap-2 opacity-60">
          <span className="flex-1 text-sm border rounded px-3 py-2 bg-gray-100 font-medium">Admin</span>
          <span className="text-xs text-gray-400 px-2">Locked</span>
        </div>
        {roles.map((role) => (
          <div key={role.id} className="flex items-center gap-2">
            <input
              className="flex-1 text-sm border rounded px-3 py-2"
              value={role.name}
              onChange={(e) => updateRole(role.id, { name: e.target.value })}
            />
            <select
              className="text-sm border rounded px-2 py-2 bg-white"
              value={role.permissionLevel}
              onChange={(e) => updateRole(role.id, { permissionLevel: e.target.value as PermissionLevel })}
            >
              {(Object.keys(PERMISSION_LABELS) as PermissionLevel[]).map((level) => (
                <option key={level} value={level}>{PERMISSION_LABELS[level]}</option>
              ))}
            </select>
            <Button type="button" variant="ghost" size="sm" onClick={() => removeRole(role.id)}>
              Remove
            </Button>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="New role name" onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAdd())} />
        <select className="text-sm border rounded px-2 py-2 bg-white" value={newLevel} onChange={(e) => setNewLevel(e.target.value as PermissionLevel)}>
          {(Object.keys(PERMISSION_LABELS) as PermissionLevel[]).map((level) => (
            <option key={level} value={level}>{PERMISSION_LABELS[level]}</option>
          ))}
        </select>
        <Button type="button" variant="outline" onClick={handleAdd}>Add</Button>
      </div>
      <div className="flex justify-between pt-2">
        <Button type="button" variant="ghost" onClick={() => setStep(3)}>Back</Button>
        <Button type="button" onClick={handleSubmit} loading={submitting}>Finish setup</Button>
      </div>
    </div>
  );
}
```

- [ ] **Step 6: Create `OnboardingComplete.tsx`**

```tsx
'use client';

import { useRouter } from 'next/navigation';
import { useOnboardingStore } from '@/stores/onboardingStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';

export default function OnboardingComplete() {
  const router = useRouter();
  const { inviteUrl, reset } = useOnboardingStore();
  const fullUrl = typeof window !== 'undefined' ? `${window.location.origin}${inviteUrl}` : inviteUrl;

  const copy = async () => {
    await navigator.clipboard.writeText(fullUrl);
    toast.success('Invite link copied!');
  };

  const goToDashboard = () => {
    reset();
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mb-3">
            <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <CardTitle>Company set up!</CardTitle>
          <CardDescription>Share this link with colleagues so they can request to join.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-gray-50 border rounded px-4 py-3 text-sm font-mono break-all text-gray-700">
            {fullUrl}
          </div>
          <Button variant="outline" className="w-full" onClick={copy}>Copy invite link</Button>
          <Button className="w-full" onClick={goToDashboard}>Go to dashboard</Button>
        </CardContent>
      </Card>
    </div>
  );
}
```

- [ ] **Step 7: Create `frontend/src/app/onboarding/page.tsx`**

```tsx
'use client';

import { useOnboardingStore } from '@/stores/onboardingStore';
import OnboardingLayout from '@/components/onboarding/OnboardingLayout';
import Step1CompanyInfo from '@/components/onboarding/Step1CompanyInfo';
import Step2Divisions from '@/components/onboarding/Step2Divisions';
import Step3Departments from '@/components/onboarding/Step3Departments';
import Step4Roles from '@/components/onboarding/Step4Roles';
import OnboardingComplete from '@/components/onboarding/OnboardingComplete';

export default function OnboardingPage() {
  const step = useOnboardingStore((s) => s.step);

  if (step === 5) return <OnboardingComplete />;

  return (
    <OnboardingLayout step={step}>
      {step === 1 && <Step1CompanyInfo />}
      {step === 2 && <Step2Divisions />}
      {step === 3 && <Step3Departments />}
      {step === 4 && <Step4Roles />}
    </OnboardingLayout>
  );
}
```

- [ ] **Step 8: Commit**

```bash
git add frontend/src/components/onboarding/ frontend/src/app/onboarding/
git commit -m "feat: add onboarding wizard components and page"
```

---

### Task 10: Join Page

**Files:**
- Create: `frontend/src/app/join/[slug]/page.tsx`

- [ ] **Step 1: Create the join page**

```tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { orgInviteApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const schema = z
  .object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type FormData = z.infer<typeof schema>;

export default function JoinPage() {
  const { slug } = useParams<{ slug: string }>();
  const [companyName, setCompanyName] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    orgInviteApi
      .getOrg(slug)
      .then((res) => setCompanyName(res.data.data.name))
      .catch(() => setNotFound(true));
  }, [slug]);

  const onSubmit = async (data: FormData) => {
    try {
      await orgInviteApi.join(slug, {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
      });
      setSubmitted(true);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: { message?: string } } } })
        ?.response?.data?.error?.message ?? 'Something went wrong. Please try again.';
      toast.error(msg);
    }
  };

  if (notFound) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-8 pb-8">
            <p className="text-gray-500">This invite link is invalid or has expired.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle>Request sent</CardTitle>
            <CardDescription>
              The admin at {companyName} will review your request. You'll be able to log in once approved.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">
            {companyName ? `Join ${companyName}` : 'Loading…'}
          </CardTitle>
          <CardDescription>Create your account to request access</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input {...register('firstName')} label="First name" placeholder="John" error={errors.firstName?.message} autoComplete="given-name" />
              <Input {...register('lastName')} label="Last name" placeholder="Doe" error={errors.lastName?.message} autoComplete="family-name" />
            </div>
            <Input {...register('email')} type="email" label="Email address" placeholder="you@company.com" error={errors.email?.message} autoComplete="email" />
            <Input {...register('password')} type="password" label="Password" placeholder="At least 8 characters" error={errors.password?.message} autoComplete="new-password" />
            <Input {...register('confirmPassword')} type="password" label="Confirm password" placeholder="Repeat password" error={errors.confirmPassword?.message} autoComplete="new-password" />
            <Button type="submit" className="w-full" loading={isSubmitting}>Request to join</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/app/join/
git commit -m "feat: add join page for invite-based self-registration"
```

---

### Task 11: Admin Invites Page + Notification Bell

**Files:**
- Create: `frontend/src/app/(dashboard)/admin/invites/page.tsx`
- Modify: `frontend/src/components/layout/header.tsx`

- [ ] **Step 1: Create `frontend/src/app/(dashboard)/admin/invites/page.tsx`**

```tsx
'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { orgInviteApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Invite {
  id: string;
  createdAt: string;
  user: { id: string; firstName: string; lastName: string; email: string };
}

interface OrgRole {
  id: string;
  name: string;
  permissionLevel: string;
}

export default function InvitesPage() {
  const [invites, setInvites] = useState<Invite[]>([]);
  const [orgRoles, setOrgRoles] = useState<OrgRole[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  const loadInvites = async () => {
    try {
      const res = await orgInviteApi.listInvites();
      setInvites(res.data.data.invites);
      setOrgRoles(res.data.data.orgRoles);
    } catch {
      toast.error('Failed to load pending invites');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadInvites(); }, []);

  const resolve = async (id: string, action: 'approve' | 'reject') => {
    const orgRoleId = selectedRoles[id];
    if (action === 'approve' && !orgRoleId) {
      toast.error('Select a role before approving');
      return;
    }
    try {
      await orgInviteApi.resolve(id, action, orgRoleId);
      toast.success(action === 'approve' ? 'User approved' : 'Request rejected');
      setInvites((prev) => prev.filter((inv) => inv.id !== id));
    } catch {
      toast.error('Failed to update invite');
    }
  };

  if (loading) return <div className="p-8 text-gray-400">Loading…</div>;

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Pending Join Requests</h1>
      {invites.length === 0 && (
        <p className="text-gray-500">No pending requests.</p>
      )}
      {invites.map((invite) => (
        <Card key={invite.id}>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <p className="font-medium">{invite.user.firstName} {invite.user.lastName}</p>
                <p className="text-sm text-gray-500">{invite.user.email}</p>
                <p className="text-xs text-gray-400">Requested {new Date(invite.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="flex items-center gap-2">
                <select
                  className="text-sm border rounded px-2 py-1.5 bg-white"
                  value={selectedRoles[invite.id] ?? ''}
                  onChange={(e) => setSelectedRoles((prev) => ({ ...prev, [invite.id]: e.target.value }))}
                >
                  <option value="">Select role…</option>
                  {orgRoles.map((r) => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
                <Button size="sm" onClick={() => resolve(invite.id, 'approve')}>Approve</Button>
                <Button size="sm" variant="ghost" onClick={() => resolve(invite.id, 'reject')}>Reject</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Read `frontend/src/components/layout/header.tsx` to understand its current structure**

```bash
cat frontend/src/components/layout/header.tsx
```

- [ ] **Step 3: Add notification dot to header**

In `header.tsx`, import `orgInviteApi` and add a `pendingCount` state. Add a `useEffect` that fetches the count on mount (only when user role is `SYSTEM_ADMIN` or `QUALITY_MANAGER`). Add a bell icon with a red dot next to the existing header controls:

```tsx
// Add after existing imports:
import { orgInviteApi } from '@/lib/api';
import Link from 'next/link';

// Add inside the component, after existing state:
const [pendingInvites, setPendingInvites] = useState(0);

useEffect(() => {
  if (user?.role === 'SYSTEM_ADMIN' || user?.role === 'QUALITY_MANAGER') {
    orgInviteApi.pendingCount().then((res) => {
      setPendingInvites(res.data.data.count);
    }).catch(() => {});
  }
}, [user]);

// Add in the JSX near the existing user controls (adapt to match existing layout):
<Link href="/admin/invites" className="relative p-2 rounded-md hover:bg-gray-100">
  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
  </svg>
  {pendingInvites > 0 && (
    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
  )}
</Link>
```

Note: Read the full header file before making this edit to match the exact JSX structure and avoid breaking existing markup.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/app/(dashboard)/admin/invites/ frontend/src/components/layout/header.tsx
git commit -m "feat: add admin invites page and notification bell"
```

---

### Task 12: Final Verification

- [ ] **Step 1: Run full backend test suite**

```bash
cd backend && npm test 2>&1 | tail -30
```

Expected: all tests pass including the new onboarding and orgInvite tests.

- [ ] **Step 2: Run frontend type check**

```bash
cd frontend && npm run build 2>&1 | tail -30
```

Expected: no new type errors introduced by this feature.

- [ ] **Step 3: Run backend lint**

```bash
cd backend && npm run lint 2>&1 | tail -20
```

Expected: no new lint errors.

- [ ] **Step 4: Final commit**

```bash
git add .
git commit -m "feat: complete company onboarding wizard with invite flow"
```
