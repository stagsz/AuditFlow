import { Request, Response } from 'express';
import { z } from 'zod';
import '../types/express';
import { prisma } from '../config/database';
import { withValidation } from '../proxy/validationProxy';
import { UserRole } from '../types/enums';
import { writeGdprAudit } from '../utils/gdprAudit';

const userIdParam = z.object({ id: z.string().uuid('Invalid user ID format') });
const actionBody = z.object({ action: z.enum(['export', 'erase']) });

export class GdprController {
  exportOrErase = withValidation(
    { params: userIdParam, body: actionBody },
    async (req: Request, res: Response): Promise<void> => {
      const targetUserId = req.params.id;
      const requestingUserId = req.user!.userId;
      const requestingRole = req.user!.role;
      const requestingOrgId = req.user!.organizationId;

      const targetUser = await prisma.user.findUnique({
        where: { id: targetUserId },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
          organizationId: true,
          organization: {
            select: {
              id: true,
              name: true,
              slug: true,
              allowedDomains: true,
            },
          },
        },
      });
      if (!targetUser) {
        res.status(404).json({ success: false, error: 'User not found' });
        return;
      }

      const isSelf = requestingUserId === targetUserId;
      const isAdmin = requestingRole === UserRole.SYSTEM_ADMIN;
      const isSameOrg = targetUser.organizationId === requestingOrgId;
      if (!isSelf && !isAdmin && !isSameOrg) {
        res.status(403).json({ success: false, error: 'Access denied' });
        return;
      }

      const action = req.body.action as 'export' | 'erase';
      const actorId = requestingUserId;

      if (action === 'export') {
        const [assessments, directResponses, teamMemberships, receivedInvites, createdInvites, inviteUsages] =
          await Promise.all([
            prisma.assessment.findMany({
              where: { organizationId: targetUser.organizationId },
              include: {
                leadAuditor: { select: { id: true } },
                teamMembers: { where: { userId: targetUserId } },
                responses: {
                  where: { userId: targetUserId },
                  include: {
                    evidence: {
                      where: { uploadedById: targetUserId },
                    },
                  },
                },
                nonConformities: {
                  include: {
                    correctiveActions: {
                      where: {
                        OR: [
                          { assignedToId: targetUserId },
                          { verifiedById: targetUserId },
                        ],
                      },
                    },
                  },
                },
              },
            }),
            prisma.questionResponse.findMany({
              where: { userId: targetUserId },
              include: {
                assessment: { select: { id: true, title: true } },
                evidence: { where: { uploadedById: targetUserId } },
              },
            }),
            prisma.assessmentTeamMember.findMany({ where: { userId: targetUserId } }),
            prisma.userOrgInvite.findMany({ where: { userId: targetUserId } }),
            prisma.betaInvite.findMany({ where: { createdById: targetUserId } }),
            prisma.betaInviteUsage.findMany({ where: { userId: targetUserId } }),
          ]);

        const payload = {
          user: targetUser,
          counts: { assessments: directResponses.length, responses: directResponses.length, teamMemberships: teamMemberships.length, receivedInvites: receivedInvites.length, createdInvites: createdInvites.length, inviteUsages: inviteUsages.length },
          assessments: assessments.map((a) => ({
            id: a.id,
            title: a.title,
            status: a.status,
            leadAuditorId: a.leadAuditorId,
            teamMembers: a.teamMembers.map((m) => ({ id: m.id, role: m.role })),
            nonConformities: a.nonConformities.map((n) => ({
              id: n.id,
              status: n.status,
              correctiveActions: n.correctiveActions
                .filter((c) => c.assignedToId === targetUserId || c.verifiedById === targetUserId)
                .map((c) => ({ id: c.id, status: c.status, assignedToId: c.assignedToId, verifiedById: c.verifiedById })),
            })),
          })),
          responses: directResponses.map((r) => ({ id: r.id, assessmentId: r.assessmentId, questionId: r.questionId, score: r.score, isDraft: r.isDraft, evidence: r.evidence.map((e) => ({ id: e.id, fileName: e.fileName, mimeType: e.mimeType, uploadedAt: e.uploadedAt })) })),
          teamMemberships,
          receivedInvites: receivedInvites.map((inv) => ({ id: inv.id, status: inv.status })),
          createdInvites: createdInvites.map((inv) => ({ id: inv.code, status: inv.status })),
          inviteUsages: inviteUsages.map((usage) => ({ id: usage.id })),
          metadata: { exportedAt: new Date().toISOString(), actorId, retentionReference: 'GDPR data-export request' },
        };

        await writeGdprAudit({
          action: 'export',
          userId: targetUserId,
          email: targetUser.email,
          status: 'exported',
          actorId,
          metadata: { exportedAt: payload.metadata.exportedAt, retentionReference: payload.metadata.retentionReference },
        });

        res.json({ success: true, data: payload });
        return;
      }

      if (action === 'erase') {
        if (isSelf) {
          res.status(400).json({ success: false, error: 'Self-erasure is not allowed via this endpoint' });
          return;
        }
        if (!isAdmin && !isSameOrg) {
          res.status(403).json({ success: false, error: 'Access denied' });
          return;
        }

        const counts = {
          userOrgInvites: 0,
          assessmentTeamMembers: 0,
          directResponses: 0,
          questionResponses: 0,
          evidence: 0,
          nonConformities: 0,
          correctiveActions: 0,
          assessments: 0,
          users: 0,
          betaInvitesCreated: 0,
          betaInviteUsages: 0,
        };

        await writeGdprAudit({
          action: 'erase',
          userId: targetUserId,
          email: targetUser.email,
          status: 'planned-not-executed',
          actorId,
          counts,
          reason: 'Erasure is disabled pending manual prod review',
          metadata: { requestedAt: new Date().toISOString(), retentionReference: 'GDPR erasure request' },
        });

        res.json({
          success: true,
          data: {
            userId: targetUserId,
            email: targetUser.email,
            status: 'planned-not-executed',
            reason: 'Erasure is disabled pending manual prod review',
            counts,
            metadata: { requestedAt: new Date().toISOString(), actorId, retentionReference: 'GDPR erasure request' },
          },
        });
      }

      res.status(400).json({ success: false, error: 'Unsupported action' });
    }
  );
}
