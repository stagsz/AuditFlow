# Company Onboarding Design

**Date:** 2026-05-29  
**Status:** Approved  
**Topic:** Self-service company onboarding wizard with invite link flow

---

## Overview

When a new company wants to use AuditFlow, the person setting it up registers as the company admin and is walked through a 4-step onboarding wizard. After completing setup they receive a unique invite URL to share with colleagues, who self-register and await admin approval before gaining access.

---

## Registration Entry Point

The existing `/register` page gets a fork at the top:

- **Create a company account** → enters the onboarding wizard
- **Join an existing company** → redirects to `/join/[slug]` (or prompts for invite URL)

---

## Onboarding Wizard (`/onboarding`)

4-step wizard with a progress indicator. All state is held in a Zustand store (`useOnboardingStore`) and nothing is persisted to the backend until step 4 is submitted. Abandoning mid-wizard leaves no partial records.

### Step 1 — Company Info
- Company name (required)
- Slug: auto-generated from name (e.g. "Acme Corp" → `acme-corp`), editable, real-time availability check
- Industry (optional)
- Country (optional)

### Step 2 — Divisions *(skippable)*
- Add/remove named division rows
- "Skip this step" button — departments will belong directly to the org

### Step 3 — Departments
- Add/remove named department rows
- Optional assignment to a division (dropdown populated from Step 2)
- Pre-populated placeholder suggestions: Quality, Operations, HR, etc.

### Step 4 — Roles
- Role cards: name input + permission level selector
- Pre-populated suggestions:
  - Quality Manager → `MANAGER`
  - Internal Auditor → `AUDITOR`
  - Department Head → `DEPT_HEAD`
  - Viewer → `VIEWER`
- One locked "Admin" card (non-deletable, assigned to the registering user)
- Companies can rename, add, or delete any non-locked role

### Completion Screen
- Displays generated invite URL: `/join/acme-corp`
- Copy-to-clipboard button
- "Go to dashboard" CTA

On completion, the entire setup (org + divisions + departments + roles + user) is committed in a single backend transaction.

---

## Data Model

### Organization (existing, modified)
New fields:
- `slug` — unique string, used in invite URL
- `setupComplete` — boolean, false until wizard completes

### Division (new)
| Field | Type | Notes |
|---|---|---|
| id | UUID | PK |
| name | String | |
| organizationId | UUID | FK → Organization |
| createdAt | DateTime | |

### Department (new)
| Field | Type | Notes |
|---|---|---|
| id | UUID | PK |
| name | String | |
| organizationId | UUID | FK → Organization |
| divisionId | UUID? | Nullable FK → Division |
| createdAt | DateTime | |

### OrgRole (new)
| Field | Type | Notes |
|---|---|---|
| id | UUID | PK |
| name | String | Company-defined label |
| organizationId | UUID | FK → Organization |
| permissionLevel | Enum | `ADMIN`, `MANAGER`, `AUDITOR`, `DEPT_HEAD`, `VIEWER` |
| isDefault | Boolean | Pre-populated suggestion |
| createdAt | DateTime | |

Permission levels map to existing access control logic. Companies choose the label; the platform uses the level.

### User (existing, modified)
New fields:
- `orgRoleId` — nullable FK → OrgRole (replaces enum `role` over time; enum kept as fallback during migration)

### UserOrgInvite (new)
| Field | Type | Notes |
|---|---|---|
| id | UUID | PK |
| userId | UUID | FK → User |
| organizationId | UUID | FK → Organization |
| status | Enum | `PENDING`, `APPROVED`, `REJECTED` |
| createdAt | DateTime | |

---

## Backend API

### Onboarding
| Method | Path | Description |
|---|---|---|
| POST | `/api/onboarding/setup` | Full wizard payload → creates org + all sub-records + user in one transaction |
| GET | `/api/onboarding/check-slug/:slug` | Real-time slug availability check (public) |

### Invite Flow
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/org/invite/:slug` | None | Returns company name for join page display |
| POST | `/api/org/invite/:slug/join` | None | Self-register via invite link, creates `UserOrgInvite` with `PENDING` status |
| GET | `/api/org/invites` | Admin | List pending join requests |
| PATCH | `/api/org/invites/:id` | Admin | Approve (assign OrgRole) or reject |

---

## Invite Link Flow (User Journey)

1. New user visits `/join/acme-corp`
2. Page displays "You're joining Acme Corp" with a registration form
3. User submits → `POST /api/org/invite/acme-corp/join` creates user + `UserOrgInvite (PENDING)`
4. User sees confirmation: "Request sent — waiting for admin approval"
5. Admin sees notification dot on header bell icon
6. Admin visits `/admin/invites`, approves and assigns a role
7. User can now log in with full access

---

## Frontend Pages & Components

### New Pages
- `/register` — updated with the two-path fork
- `/onboarding` — wizard (protected, only accessible after company registration)
- `/join/[slug]` — public join page
- `/admin/invites` — admin pending approvals list

### Wizard Components
- `OnboardingLayout` — progress bar, back/next navigation
- `Step1CompanyInfo` — name + slug input
- `Step2Divisions` — add/remove rows, skip button
- `Step3Departments` — add/remove rows, optional division assignment
- `Step4Roles` — role cards with name + permission level, locked Admin card
- `OnboardingComplete` — invite URL + copy button

### Notifications
- Red dot on header bell icon when `PENDING` invites exist for the org
- Clicking navigates to `/admin/invites`
- Email notification is a future enhancement

---

## Out of Scope (future)
- Email notifications for invite approvals
- Industry-based org structure templates
- Bulk user import
- SSO / SAML integration
