# AuditFlow — GDPR / Privacy Policy

Effective date: 2026-07-11
Contact: privacy@auditflow.io / dpo@auditflow.io
Controller: Greisz Consulting

## 1. Scope
This policy applies to all personal data processed by AuditFlow on behalf of customer organizations in quality-management, audit, NCR, corrective-action, and compliance workflows.

## 2. Data We Process
- Identity data: name, email, role, organization affiliation.
- Operational data: assessment responses, evidence files, non-conformities, corrective actions, team memberships, invites.
- Metadata: timestamps, role changes, org context.

## 3. Lawful Basis
- Contract / legitimate interest: operating the customer’s quality-management system.
- Compliance obligation: supporting ISO 9001 audit evidence and traceability requirements.
- Consent: not used as the primary basis for core QM processing.

## 4. Data Minimization and Access Control
- AuditFlow enforces allowed email domains at registration, profile updates, and onboarding.
- Each record carries org ownership; cross-tenant access is blocked in the database layer using RLS tied to `app.current_org_id`.
- No advertising cookies or cross-site tracking are used.

## 5. Subject Rights
- Access: request a full export of your personal records.
- Rectification: update profile/email using org-allowed domains.
- Erasure: we perform FK-safe deletion and anonymization of dependent assessment data.
- Restriction/objection: submit manual requests for review.

Subject-rights requests today are handled manually via privacy@auditflow.io. Automated fulfillment endpoints may be added in future releases.

## 6. Data Retention and Deletion
- Retain customer data while the account is active and as needed for legal/tax/accounting obligations.
- Upon account deletion or erasure request, we remove or anonymize records in dependency order and verify completion.
- Audit logs are retained for accountability and incident traceability.

## 7. Security Controls
- Passwords and tokens are stored hashed; API roles are restricted from exposing auth secrets.
- Tenant isolation is enforced through database policies.
- FK-safe user deletion prevents orphan/integrity errors and reduces data-risk surface.

## 8. Changes to This Policy
Material changes are published at audit-flow.org and reflected in the repository at AuditFlow/docs/legal/GDPR_POLICY.md.

## 9. Contact
Privacy inquiries: privacy@auditflow.io
DPO: dpo@auditflow.io
