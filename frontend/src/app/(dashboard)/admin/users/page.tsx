'use client';

import { useCallback, useState, useEffect } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { format } from 'date-fns';
import {
  Search,
  AlertCircle,
  Shield,
  ShieldCheck,
  ShieldOff,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Check,
  X,
  Pencil,
  Power,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Pagination } from '@/components/ui/pagination';
import { useUsers, User } from '@/hooks/useUsers';
import { useDebounce } from '@/hooks/useDebounce';
import { useAuthStore } from '@/lib/store';
import { UserEditModal } from '@/components/users/UserEditModal';
import { RoleChangeConfirmationDialog } from '@/components/users/RoleChangeConfirmationDialog';
import { StatusToggleConfirmationDialog } from '@/components/users/StatusToggleConfirmationDialog';
import { UsersListSkeleton } from '@/components/users/UsersListSkeleton';
import { UsersEmptyState } from '@/components/users/UsersEmptyState';

const roleColors: Record<string, string> = {
  SYSTEM_ADMIN: 'bg-purple-100 text-purple-700',
  QUALITY_MANAGER: 'bg-blue-50 text-blue-700',
  INTERNAL_AUDITOR: 'bg-green-50 text-green-700',
  DEPARTMENT_HEAD: 'bg-orange-100 text-orange-700',
  VIEWER: 'bg-gray-100 text-gray-700',
};

const roleLabels: Record<string, string> = {
  SYSTEM_ADMIN: 'System Admin',
  QUALITY_MANAGER: 'Quality Manager',
  INTERNAL_AUDITOR: 'Internal Auditor',
  DEPARTMENT_HEAD: 'Department Head',
  VIEWER: 'Viewer',
};

const roleOptions = [
  { value: 'SYSTEM_ADMIN', label: 'System Admin' },
  { value: 'QUALITY_MANAGER', label: 'Quality Manager' },
  { value: 'INTERNAL_AUDITOR', label: 'Internal Auditor' },
  { value: 'DEPARTMENT_HEAD', label: 'Department Head' },
  { value: 'VIEWER', label: 'Viewer' },
];

const statusOptions = [
  { value: 'true', label: 'Active' },
  { value: 'false', label: 'Inactive' },
];

type SortField = 'email' | 'firstName' | 'role' | 'lastLoginAt' | 'createdAt';
type SortOrder = 'asc' | 'desc';

interface SortableColumnHeaderProps {
  field: SortField;
  label: string;
  currentSortBy: string;
  currentSortOrder: SortOrder;
  onSort: (field: SortField) => void;
}

function SortableColumnHeader({
  field,
  label,
  currentSortBy,
  currentSortOrder,
  onSort,
}: SortableColumnHeaderProps) {
  const isActive = currentSortBy === field;

  return (
    <button
      onClick={() => onSort(field)}
      className="flex items-center gap-1 font-medium text-gray-600 hover:text-gray-900 transition-colors"
      aria-label={`Sort by ${label}`}
    >
      {label}
      {isActive ? (
        currentSortOrder === 'asc' ? (
          <ArrowUp className="h-4 w-4 text-emerald-600" />
        ) : (
          <ArrowDown className="h-4 w-4 text-emerald-600" />
        )
      ) : (
        <ArrowUpDown className="h-4 w-4 text-gray-400" />
      )}
    </button>
  );
}

export default function AdminUsersPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user: currentUser } = useAuthStore();

  // Route guard: SYSTEM_ADMIN and QUALITY_MANAGER only
  const canAccessPage = currentUser?.role === 'SYSTEM_ADMIN' || currentUser?.role === 'QUALITY_MANAGER';

  // Get filter values from URL
  const roleFilter = searchParams.get('role') || '';
  const statusFilter = searchParams.get('isActive') || '';
  const searchTermFromUrl = searchParams.get('search') || '';
  const page = parseInt(searchParams.get('page') || '1', 10);
  const pageSize = parseInt(searchParams.get('pageSize') || '10', 10);
  const sortBy = (searchParams.get('sortBy') || 'createdAt') as SortField;
  const sortOrder = (searchParams.get('sortOrder') || 'desc') as SortOrder;

  // Local state for search input (for immediate feedback)
  const [searchInput, setSearchInput] = useState(searchTermFromUrl);

  // Debounce the search input (300ms delay)
  const debouncedSearch = useDebounce(searchInput, 300);

  // Update URL with new filter values
  const updateQueryParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(updates).forEach(([key, value]) => {
        if (value === null || value === '') {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      });

      // Reset to page 1 when filters change (but not when sorting)
      if (
        !updates.hasOwnProperty('page') &&
        (updates.role !== undefined ||
          updates.isActive !== undefined ||
          updates.search !== undefined) &&
        updates.sortBy === undefined &&
        updates.sortOrder === undefined
      ) {
        params.delete('page');
      }

      const queryString = params.toString();
      router.push(queryString ? `${pathname}?${queryString}` : pathname);
    },
    [router, pathname, searchParams]
  );

  // Sync URL when debounced search value changes
  useEffect(() => {
    if (debouncedSearch !== searchTermFromUrl) {
      updateQueryParams({ search: debouncedSearch });
    }
  }, [debouncedSearch, searchTermFromUrl, updateQueryParams]);

  // Sync local state when URL changes externally
  useEffect(() => {
    if (searchTermFromUrl !== searchInput && searchTermFromUrl !== debouncedSearch) {
      setSearchInput(searchTermFromUrl);
    }
  }, [searchTermFromUrl]);

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateQueryParams({ role: e.target.value });
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateQueryParams({ isActive: e.target.value });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
  };

  const handlePageChange = (newPage: number) => {
    updateQueryParams({ page: String(newPage) });
  };

  const handlePageSizeChange = (newPageSize: number) => {
    updateQueryParams({ pageSize: String(newPageSize), page: '1' });
  };

  const handleSort = (field: SortField) => {
    if (sortBy === field) {
      updateQueryParams({ sortOrder: sortOrder === 'asc' ? 'desc' : 'asc' });
    } else {
      updateQueryParams({ sortBy: field, sortOrder: 'desc' });
    }
  };

  // Check if any filters are active
  const hasFilters = Boolean(searchTermFromUrl || roleFilter || statusFilter);

  // Clear all filters
  const handleClearFilters = useCallback(() => {
    setSearchInput('');
    router.push(pathname);
  }, [router, pathname]);

  // Modal state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [roleChangeDialogOpen, setRoleChangeDialogOpen] = useState(false);
  const [statusToggleDialogOpen, setStatusToggleDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setEditModalOpen(false);
    setSelectedUser(null);
  };

  const handleChangeRole = (user: User) => {
    setSelectedUser(user);
    setRoleChangeDialogOpen(true);
  };

  const handleCloseRoleChangeDialog = () => {
    setRoleChangeDialogOpen(false);
    setSelectedUser(null);
  };

  const handleToggleStatus = (user: User) => {
    setSelectedUser(user);
    setStatusToggleDialogOpen(true);
  };

  const handleCloseStatusToggleDialog = () => {
    setStatusToggleDialogOpen(false);
    setSelectedUser(null);
  };

  // Check if current user can manage users (SYSTEM_ADMIN only)
  const canManageUsers = currentUser?.role === 'SYSTEM_ADMIN';

  const { data, isLoading, isError } = useUsers({
    page,
    limit: pageSize,
    role: roleFilter || undefined,
    isActive: statusFilter ? statusFilter === 'true' : undefined,
    search: searchTermFromUrl || undefined,
  });

  const users = data?.data || [];
  const pagination = data?.pagination;

  // Show full-page skeleton while loading (before access check for better UX)
  if (isLoading) {
    return <UsersListSkeleton />;
  }

  // Access denied for non-admin users
  if (!canAccessPage) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="py-12 text-center">
            <ShieldOff className="mx-auto h-12 w-12 text-red-400 mb-4" />
            <p className="text-gray-700 font-medium">Access Denied</p>
            <p className="text-gray-500 text-sm mt-1">
              You do not have permission to access this page.
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => router.push('/dashboard')}
            >
              Return to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-500">
            Manage user accounts, roles, and permissions
          </p>
        </div>
        <div className="flex items-center gap-2">
          {currentUser?.role === 'SYSTEM_ADMIN' && (
            <div className="flex items-center gap-1 text-sm text-purple-700 bg-purple-50 px-3 py-1.5 rounded-full">
              <ShieldCheck className="h-4 w-4" />
              System Admin
            </div>
          )}
          {currentUser?.role === 'QUALITY_MANAGER' && (
            <div className="flex items-center gap-1 text-sm text-blue-700 bg-blue-50 px-3 py-1.5 rounded-full">
              <Shield className="h-4 w-4" />
              Quality Manager
            </div>
          )}
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <Input
                  placeholder="Search by name or email..."
                  value={searchInput}
                  onChange={handleSearchChange}
                  className="pl-10"
                  aria-label="Search users"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <div className="w-44">
                <Select
                  value={roleFilter}
                  onChange={handleRoleChange}
                  options={roleOptions}
                  placeholder="All Roles"
                  aria-label="Filter by role"
                />
              </div>
              <div className="w-36">
                <Select
                  value={statusFilter}
                  onChange={handleStatusChange}
                  options={statusOptions}
                  placeholder="All Status"
                  aria-label="Filter by status"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      {isError ? (
        <Card>
          <CardContent className="py-12 text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-red-400 mb-4" />
            <p className="text-gray-700 font-medium">Failed to load users</p>
            <p className="text-gray-500 text-sm mt-1">Please try refreshing the page</p>
          </CardContent>
        </Card>
      ) : users.length === 0 ? (
        <Card>
          <CardContent className="py-6">
            <UsersEmptyState
              hasFilters={hasFilters}
              onClearFilters={handleClearFilters}
            />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <SortableColumnHeader
                        field="email"
                        label="User"
                        currentSortBy={sortBy}
                        currentSortOrder={sortOrder}
                        onSort={handleSort}
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <SortableColumnHeader
                        field="role"
                        label="Role"
                        currentSortBy={sortBy}
                        currentSortOrder={sortOrder}
                        onSort={handleSort}
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <SortableColumnHeader
                        field="lastLoginAt"
                        label="Last Login"
                        currentSortBy={sortBy}
                        currentSortOrder={sortOrder}
                        onSort={handleSort}
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <SortableColumnHeader
                        field="createdAt"
                        label="Created"
                        currentSortBy={sortBy}
                        currentSortOrder={sortOrder}
                        onSort={handleSort}
                      />
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr
                      key={user.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                              <span className="text-sm font-medium text-gray-600">
                                {user.firstName?.[0]?.toUpperCase() || ''}
                                {user.lastName?.[0]?.toUpperCase() || ''}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {user.firstName} {user.lastName}
                              {user.id === currentUser?.id && (
                                <span className="ml-2 text-xs text-gray-400">(You)</span>
                              )}
                            </div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            roleColors[user.role] || 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {roleLabels[user.role] || user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {user.isActive ? (
                          <span className="inline-flex items-center gap-1 text-sm text-green-600">
                            <Check className="h-4 w-4" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-sm text-gray-400">
                            <X className="h-4 w-4" />
                            Inactive
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {user.lastLoginAt
                          ? format(new Date(user.lastLoginAt), 'MMM d, yyyy HH:mm')
                          : 'Never'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {format(new Date(user.createdAt), 'MMM d, yyyy')}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEditUser(user)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-sm font-medium text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors"
                            aria-label={`Edit ${user.firstName} ${user.lastName}`}
                          >
                            <Pencil className="h-4 w-4" />
                            Edit
                          </button>
                          {canManageUsers && user.id !== currentUser?.id && (
                            <>
                              <button
                                onClick={() => handleChangeRole(user)}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-sm font-medium text-gray-600 hover:text-amber-600 hover:bg-amber-50 rounded-md transition-colors"
                                aria-label={`Change role for ${user.firstName} ${user.lastName}`}
                              >
                                <Shield className="h-4 w-4" />
                                Role
                              </button>
                              <button
                                onClick={() => handleToggleStatus(user)}
                                className={`inline-flex items-center gap-1 px-2.5 py-1.5 text-sm font-medium rounded-md transition-colors ${
                                  user.isActive
                                    ? 'text-gray-600 hover:text-red-600 hover:bg-red-50'
                                    : 'text-gray-600 hover:text-green-600 hover:bg-green-50'
                                }`}
                                aria-label={`${user.isActive ? 'Deactivate' : 'Activate'} ${user.firstName} ${user.lastName}`}
                              >
                                <Power className="h-4 w-4" />
                                {user.isActive ? 'Deactivate' : 'Activate'}
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pagination */}
      {!isLoading && !isError && users.length > 0 && pagination && (
        <Card>
          <CardContent className="py-4">
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              totalItems={pagination.total}
              pageSize={pagination.limit}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
              pageSizeOptions={[10, 25, 50]}
            />
          </CardContent>
        </Card>
      )}

      {/* Edit User Modal */}
      <UserEditModal
        isOpen={editModalOpen}
        onClose={handleCloseEditModal}
        user={selectedUser}
      />

      {/* Role Change Confirmation Dialog */}
      <RoleChangeConfirmationDialog
        isOpen={roleChangeDialogOpen}
        onClose={handleCloseRoleChangeDialog}
        user={selectedUser}
      />

      {/* Status Toggle Confirmation Dialog */}
      <StatusToggleConfirmationDialog
        isOpen={statusToggleDialogOpen}
        onClose={handleCloseStatusToggleDialog}
        user={selectedUser}
      />
    </div>
  );
}
