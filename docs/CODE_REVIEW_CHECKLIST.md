# Code Review Checklist — AuditFlow

Use this for PR reviews to keep changes safe, intentional, and on spec.

## Scope and review strategy
- Review the smallest diff that meets the intent.
- Prefer targeted fixes over rewrites in the same PR.
- Highlight blockers vs polish vs follow-up separately.

## Backend
- Confirm schema, migrations, and seed assumptions still match.
- Verify authorization, org boundaries, and role checks.
- Review new/changed endpoints for validation, errors, and API shape compatibility.
- Check for hardcoded env assumptions, missing secrets handling, or unsafe defaults.

## Frontend
- Review routing and redirect behavior carefully.
- Verify responsive behavior and accessibility basics.
- Check loading, empty, and error states are user-visible.
- Avoid adding UI claims for backend behavior that isn’t implemented.

## Data and legal
- Do not expose fields or dataflows not needed for the feature.
- Align new user-visible wording with `docs/legal/PRIVACY_POLICY.md` and `docs/legal/TERMS_OF_SERVICE.md`.
- Compliance-sensitive changes should include the exact policy/runtime update in the PR.

## Docs and ops
- Keep docs at a professional, developer-grade standard.
- Store project docs under `docs/`, not as internal AI context.
- `.gitignore` and deployment notes should stay aligned with Vercel and backend hosting.
