/**
 * Re-export Prisma enums for use throughout the application.
 *
 * With PostgreSQL, enums are defined natively in the database schema (schema.prisma)
 * and exported by Prisma Client. This file re-exports them for convenience and
 * maintains backward compatibility with existing imports.
 */

export {
  UserRole,
  AssessmentStatus,
  AuditType,
  TeamMemberRole,
  Severity,
  NCRStatus,
  ActionStatus,
  Priority,
  EvidenceType,
} from '@prisma/client';

// Re-export types for TypeScript usage
export type {
  UserRole as UserRoleType,
  AssessmentStatus as AssessmentStatusType,
  AuditType as AuditTypeType,
  TeamMemberRole as TeamMemberRoleType,
  Severity as SeverityType,
  NCRStatus as NCRStatusType,
  ActionStatus as ActionStatusType,
  Priority as PriorityType,
  EvidenceType as EvidenceTypeType,
} from '@prisma/client';
