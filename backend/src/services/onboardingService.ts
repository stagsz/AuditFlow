import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/database';
import { config } from '../config';
import { ConflictError } from '../utils/errors';
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
    if (existingEmail) throw new ConflictError('Email already registered');
    if (existingSlug) throw new ConflictError('Company URL is already taken');

    const passwordHash = await bcrypt.hash(data.password, 12);

    return prisma.$transaction(async (tx) => {
      const org = await tx.organization.create({
        data: { name: data.company.name, slug: data.company.slug, setupComplete: true },
      });

      const divisionIds: string[] = [];
      for (const div of data.divisions) {
        const created = await tx.division.create({ data: { name: div.name, organizationId: org.id } });
        divisionIds.push(created.id);
      }

      for (const dept of data.departments) {
        await tx.department.create({
          data: {
            name: dept.name,
            organizationId: org.id,
            divisionId: dept.divisionIndex !== undefined ? (divisionIds[dept.divisionIndex] ?? null) : null,
          },
        });
      }

      const adminRole = await tx.orgRole.create({
        data: { name: 'Admin', permissionLevel: 'ADMIN', isDefault: false, organizationId: org.id },
      });

      for (const role of data.roles) {
        await tx.orgRole.create({
          data: { name: role.name, permissionLevel: role.permissionLevel, isDefault: true, organizationId: org.id },
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
      const accessToken = jwt.sign(payload, config.jwt.secret, { expiresIn: config.jwt.expiresIn as jwt.SignOptions['expiresIn'] });
      const refreshToken = jwt.sign(payload, config.jwt.refreshSecret, { expiresIn: config.jwt.refreshExpiresIn as jwt.SignOptions['expiresIn'] });

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

  // Setup org structure for an already-authenticated user
  async setupOrgForExistingUser(
    userId: string,
    data: {
      company: { name: string; slug: string; industry?: string; country?: string };
      divisions: { name: string }[];
      departments: { name: string; divisionIndex?: number }[];
      roles: { name: string; permissionLevel: 'MANAGER' | 'AUDITOR' | 'DEPT_HEAD' | 'VIEWER' }[];
    }
  ) {
    const existingSlug = await prisma.organization.findUnique({ where: { slug: data.company.slug } });
    if (existingSlug) throw new ConflictError('Company URL is already taken');

    return prisma.$transaction(async (tx) => {
      const org = await tx.organization.create({
        data: { name: data.company.name, slug: data.company.slug, setupComplete: true },
      });

      const divisionIds: string[] = [];
      for (const div of data.divisions) {
        const created = await tx.division.create({ data: { name: div.name, organizationId: org.id } });
        divisionIds.push(created.id);
      }

      for (const dept of data.departments) {
        await tx.department.create({
          data: {
            name: dept.name,
            organizationId: org.id,
            divisionId: dept.divisionIndex !== undefined ? (divisionIds[dept.divisionIndex] ?? null) : null,
          },
        });
      }

      const adminRole = await tx.orgRole.create({
        data: { name: 'Admin', permissionLevel: 'ADMIN', isDefault: false, organizationId: org.id },
      });

      for (const role of data.roles) {
        await tx.orgRole.create({
          data: { name: role.name, permissionLevel: role.permissionLevel, isDefault: true, organizationId: org.id },
        });
      }

      // Move the existing user to the new org as SYSTEM_ADMIN
      await tx.user.update({
        where: { id: userId },
        data: {
          organizationId: org.id,
          role: UserRole.SYSTEM_ADMIN,
          orgRoleId: adminRole.id,
        },
      });

      return { orgSlug: org.slug, inviteUrl: `/join/${org.slug}` };
    });
  }
}

export const onboardingService = new OnboardingService();
