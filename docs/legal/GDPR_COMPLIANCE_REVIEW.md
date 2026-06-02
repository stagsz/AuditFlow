GDPR Compliance Review — AuditFlow Operations Note

Purpose
  Document the AuditFlow GDPR compliance review performed with the
  `auditflow-gdpr` skill, findings, and recommended follow-up actions.

Scope reviewed
  - docs/legal/PRIVACY_POLICY.md
  - docs/PAYMENT_LEGAL_PLAN.md
  - backend/src/controllers/userController.ts
  - backend/src/controllers/authController.ts
  - backend/src/controllers/orgInviteController.ts
  - docs/STRIPE_SETUP.md

Findings (high level)
  1. The current privacy policy is largely GDPR-aligned.
  2. Three minor gaps remain:
     - No explicit note that subject-rights requests are handled manually
       via email (privacy@auditflow.io) today.
     - No internal checklist/memo to retain Stripe DPA/SCC transfer docs.
     - No documented note regarding automatic post-cancellation deletion
       behavior from the provider side.

Recommended actions
  - Update PRIVACY_POLICY.md to state clearly:
      * subject-rights requests are filed via privacy@auditflow.io today
      * response will be within applicable legal deadlines
    (Do not promise automated endpoints that are not implemented.)
  - Retain or reference Stripe DPA/SCC evidence under docs/legal/.
  - Confirm Stripe/other processors' data-retention behavior post-cancellation
    so the privacy policy can describe deletion timelines accurately.
  - Consider future backend work for automated subject-rights endpoints
    (access, rectification, erasure, restriction) if volume warrants.

Compliance baseline
  - AuditFlow contacts: privacy@auditflow.io, dpo@auditflow.io
  - No advertising cookies or cross-site tracking are used.
  - GDPR compliance path is documented; the policy should match actual
    product data flows only.
