/**
 * Audit logging utility for GDPR and security events.
 *
 * Production recommendation: replace file logging with a database-backed
 * audit table or dedicated audit service to ensure immutability and centralization.
 */

import * as fs from 'fs/promises';
import * as path from 'path';

const AUDIT_DIR = 'C:\\Users\\staff\\anthropicFun\\Boarder_room\\GreiszConsulting\\audit\\ops\\gdpr';

export async function ensureAuditDir(): Promise<void> {
  try {
    await fs.mkdir(AUDIT_DIR, { recursive: true });
  } catch {
    // Ignore if already exists
  }
}

export async function writeGdprAudit(record: {
  action: 'export' | 'erase';
  userId: string;
  email: string;
  status: string;
  reason?: string;
  actorId: string;
  counts?: Record<string, number>;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  await ensureAuditDir();

  const entry = {
    timestamp: new Date().toISOString(),
    ...record,
  };

  const fileName = `gdpr-${record.action}-${record.userId}-${Date.now()}.json`;
  const filePath = path.join(AUDIT_DIR, fileName);

  try {
    await fs.writeFile(filePath, JSON.stringify(entry, null, 2), { mode: 0o600 });
  } catch (error) {
    console.warn('Failed to write GDPR audit log', error);
  }
}
