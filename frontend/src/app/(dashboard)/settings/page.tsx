'use client';

import { useState } from 'react';
import { User, Mail, Building2, Shield, Calendar, Lock, ChevronDown, ChevronUp, Check, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PasswordChangeForm } from '@/components/settings';
import { useAuthStore } from '@/lib/store';

const roleLabels: Record<string, string> = {
  SYSTEM_ADMIN: 'System Administrator',
  QUALITY_MANAGER: 'Quality Manager',
  INTERNAL_AUDITOR: 'Internal Auditor',
  DEPARTMENT_HEAD: 'Department Head',
  VIEWER: 'Viewer',
};

const roleColors: Record<string, string> = {
  SYSTEM_ADMIN: 'bg-purple-100 text-purple-700',
  QUALITY_MANAGER: 'bg-blue-50 text-blue-700',
  INTERNAL_AUDITOR: 'bg-green-50 text-green-700',
  DEPARTMENT_HEAD: 'bg-orange-100 text-orange-700',
  VIEWER: 'bg-gray-100 text-gray-700',
};

// Role permissions matrix
const rolePermissions: Record<string, {
  description: string;
  permissions: {
    category: string;
    access: string[];
  }[];
}> = {
  SYSTEM_ADMIN: {
    description: 'Full system access with all administrative privileges',
    permissions: [
      {
        category: 'User Management',
        access: ['Create, edit, and delete users', 'Manage user roles', 'Activate/deactivate accounts'],
      },
      {
        category: 'Assessments',
        access: ['Full access to all assessments', 'Create, edit, and archive any assessment', 'Assign auditors and teams'],
      },
      {
        category: 'Non-Conformities & Actions',
        access: ['View and manage all NCRs', 'Create and assign corrective actions', 'Verify action completion'],
      },
      {
        category: 'Reports & Standards',
        access: ['Generate reports for any assessment', 'Import and manage ISO standards', 'Export all data'],
      },
    ],
  },
  QUALITY_MANAGER: {
    description: 'Oversee quality management system and audit processes',
    permissions: [
      {
        category: 'Assessments',
        access: ['Create and manage assessments', 'Assign auditors', 'Review completed assessments', 'Archive assessments'],
      },
      {
        category: 'Non-Conformities & Actions',
        access: ['View all NCRs', 'Create and manage corrective actions', 'Assign actions to team members', 'Verify completion'],
      },
      {
        category: 'Reports',
        access: ['Generate reports', 'Export data to CSV/PDF/PowerPoint', 'View all assessment results'],
      },
      {
        category: 'Standards',
        access: ['View ISO standards', 'Import questions from CSV'],
      },
    ],
  },
  INTERNAL_AUDITOR: {
    description: 'Conduct assessments and document findings',
    permissions: [
      {
        category: 'Assessments',
        access: ['Create assessments', 'Conduct audits (assigned or self-created)', 'Score requirements', 'Document findings'],
      },
      {
        category: 'Non-Conformities',
        access: ['View NCRs for assigned assessments', 'Create NCRs from findings', 'Propose corrective actions'],
      },
      {
        category: 'Reports',
        access: ['Generate reports for assigned assessments', 'Export own assessment data'],
      },
      {
        category: 'Standards',
        access: ['View ISO standards and questions'],
      },
    ],
  },
  DEPARTMENT_HEAD: {
    description: 'View departmental compliance and respond to findings',
    permissions: [
      {
        category: 'Assessments',
        access: ['View all assessments', 'View section details', 'Read assessment results'],
      },
      {
        category: 'Non-Conformities',
        access: ['View NCRs', 'Respond to findings', 'View assigned corrective actions'],
      },
      {
        category: 'Reports',
        access: ['View reports', 'Download PDF reports'],
      },
      {
        category: 'Standards',
        access: ['View ISO standards'],
      },
    ],
  },
  VIEWER: {
    description: 'Read-only access to view compliance information',
    permissions: [
      {
        category: 'Assessments',
        access: ['View assessments (read-only)', 'View results and scores'],
      },
      {
        category: 'Non-Conformities',
        access: ['View NCRs (read-only)'],
      },
      {
        category: 'Reports',
        access: ['View reports'],
      },
      {
        category: 'Standards',
        access: ['View ISO standards'],
      },
    ],
  },
};

interface ProfileFieldProps {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}

function ProfileField({ icon, label, value }: ProfileFieldProps) {
  return (
    <div className="flex items-start gap-4 py-4">
      <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-500">{label}</p>
        <div className="mt-1 text-gray-900">{value}</div>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const { user } = useAuthStore();
  const [showAllRoles, setShowAllRoles] = useState(false);

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600" />
      </div>
    );
  }

  const currentRolePermissions = rolePermissions[user.role];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500">View your profile information</p>
      </div>

      {/* Profile Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-emerald-600 flex items-center justify-center text-white text-xl font-semibold">
              {user.firstName?.[0]?.toUpperCase() || ''}
              {user.lastName?.[0]?.toUpperCase() || ''}
            </div>
            <div>
              <CardTitle className="text-xl">
                {user.firstName} {user.lastName}
              </CardTitle>
              <CardDescription className="mt-1">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    roleColors[user.role] || 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {roleLabels[user.role] || user.role}
                </span>
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="divide-y divide-gray-100">
            <ProfileField
              icon={<User className="h-5 w-5" />}
              label="Full Name"
              value={`${user.firstName} ${user.lastName}`}
            />
            <ProfileField
              icon={<Mail className="h-5 w-5" />}
              label="Email Address"
              value={user.email}
            />
            <ProfileField
              icon={<Shield className="h-5 w-5" />}
              label="Role"
              value={
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    roleColors[user.role] || 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {roleLabels[user.role] || user.role}
                </span>
              }
            />
            <ProfileField
              icon={<Building2 className="h-5 w-5" />}
              label="Organization"
              value={user.organization?.name || 'Not assigned'}
            />
          </div>
        </CardContent>
      </Card>

      {/* Account Info Card */}
      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
          <CardDescription>Your account details and membership information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="divide-y divide-gray-100">
            <ProfileField
              icon={<Calendar className="h-5 w-5" />}
              label="Account ID"
              value={
                <span className="font-mono text-sm text-gray-600">
                  {user.id}
                </span>
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Role-Based Access Control Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-emerald-600" />
            <CardTitle>Role-Based Access Control</CardTitle>
          </div>
          <CardDescription>Your current role and permissions in the system</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current Role Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-1">Your Current Role</h3>
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    roleColors[user.role] || 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {roleLabels[user.role] || user.role}
                </span>
              </div>
            </div>

            {currentRolePermissions && (
              <div>
                <p className="text-sm text-gray-600 mb-4">{currentRolePermissions.description}</p>

                {/* Permissions Breakdown */}
                <div className="space-y-4">
                  {currentRolePermissions.permissions.map((perm, idx) => (
                    <div key={idx} className="border-l-2 border-emerald-200 pl-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">{perm.category}</h4>
                      <ul className="space-y-1">
                        {perm.access.map((item, itemIdx) => (
                          <li key={itemIdx} className="flex items-start gap-2 text-sm text-gray-600">
                            <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* All Roles Comparison */}
          <div className="pt-6 border-t border-gray-200">
            <button
              onClick={() => setShowAllRoles(!showAllRoles)}
              className="flex items-center justify-between w-full text-left"
            >
              <h3 className="text-sm font-semibold text-gray-900">All Roles & Permissions</h3>
              {showAllRoles ? (
                <ChevronUp className="h-5 w-5 text-gray-400" />
              ) : (
                <ChevronDown className="h-5 w-5 text-gray-400" />
              )}
            </button>

            {showAllRoles && (
              <div className="mt-4 space-y-6">
                {Object.entries(rolePermissions).map(([role, data]) => (
                  <div
                    key={role}
                    className={`rounded-xl border-2 p-4 ${
                      role === user.role ? 'border-emerald-300 bg-emerald-50' : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                          roleColors[role] || 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {roleLabels[role] || role}
                      </span>
                      {role === user.role && (
                        <span className="text-xs font-medium text-emerald-700">(Your Role)</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{data.description}</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {data.permissions.map((perm, idx) => (
                        <div key={idx}>
                          <h4 className="text-xs font-semibold text-gray-700 mb-1">{perm.category}</h4>
                          <ul className="space-y-0.5">
                            {perm.access.map((item, itemIdx) => (
                              <li key={itemIdx} className="flex items-start gap-1.5 text-xs text-gray-600">
                                <Check className="h-3 w-3 text-green-600 mt-0.5 flex-shrink-0" />
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Help Text */}
          <div className="pt-6 border-t border-gray-200">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <h4 className="text-sm font-semibold text-blue-900 mb-2">Need Different Access?</h4>
              <p className="text-sm text-blue-800">
                Contact your System Administrator or Quality Manager to request a role change. Role changes require approval and will be reviewed based on your responsibilities.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Password Change Card */}
      <PasswordChangeForm />
    </div>
  );
}
