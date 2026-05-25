'use client';

import { useState, useEffect, useRef } from 'react';
import { clsx } from 'clsx';
import { Search, X, Users, ChevronDown } from 'lucide-react';
import { usersApi } from '@/lib/api';

export interface TeamMember {
  userId: string;
  role: string;
}

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

const teamMemberRoleOptions = [
  { value: 'LEAD_AUDITOR', label: 'Lead Auditor' },
  { value: 'AUDITOR', label: 'Auditor' },
  { value: 'OBSERVER', label: 'Observer' },
];

interface TeamMemberSelectProps {
  value: TeamMember[];
  onChange: (members: TeamMember[]) => void;
  error?: string;
}

export function TeamMemberSelect({ value, onChange, error }: TeamMemberSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch users when search changes
  useEffect(() => {
    const fetchUsers = async () => {
      if (search.length < 2) {
        setUsers([]);
        setHasSearched(false);
        return;
      }

      setLoading(true);
      try {
        const response = await usersApi.list({
          search,
          isActive: true,
          limit: 10,
        });
        setUsers(response.data.users || []);
        setHasSearched(true);
      } catch {
        setUsers([]);
        setHasSearched(true);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchUsers, 300);
    return () => clearTimeout(debounceTimer);
  }, [search]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const addMember = (user: User) => {
    if (!value.find((m) => m.userId === user.id)) {
      onChange([...value, { userId: user.id, role: 'AUDITOR' }]);
    }
    setSearch('');
    setIsOpen(false);
  };

  const removeMember = (userId: string) => {
    onChange(value.filter((m) => m.userId !== userId));
  };

  const updateMemberRole = (userId: string, role: string) => {
    onChange(
      value.map((m) => (m.userId === userId ? { ...m, role } : m))
    );
  };

  const selectedUserIds = value.map((m) => m.userId);
  const availableUsers = users.filter((u) => !selectedUserIds.includes(u.id));

  return (
    <div className="w-full" ref={containerRef}>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          Team Members
          <span className="text-gray-400 font-normal">(optional)</span>
        </div>
      </label>

      {/* Search input */}
      <div className="relative">
        <div
          className={clsx(
            'flex items-center border rounded-md bg-white px-3 py-2 gap-2',
            error ? 'border-red-400' : 'border-gray-300',
            'focus-within:ring-2 focus-within:ring-emerald-500 focus-within:border-transparent'
          )}
        >
          <Search className="h-4 w-4 text-gray-400 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search users by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onFocus={() => setIsOpen(true)}
            className="flex-1 text-sm outline-none placeholder:text-gray-400"
          />
          {loading && (
            <svg
              className="h-4 w-4 animate-spin text-gray-400"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          )}
        </div>

        {/* Dropdown */}
        {isOpen && search.length >= 2 && (
          <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
            {availableUsers.length > 0 ? (
              availableUsers.map((user) => (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => addMember(user)}
                  className="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center gap-2"
                >
                  <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 text-sm font-medium">
                    {user.firstName[0]}{user.lastName[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                  </div>
                </button>
              ))
            ) : hasSearched ? (
              <div className="px-3 py-4 text-sm text-gray-500 text-center">
                No users found
              </div>
            ) : null}
          </div>
        )}
      </div>

      {/* Selected members */}
      {value.length > 0 && (
        <div className="mt-3 space-y-2">
          {value.map((member) => (
            <SelectedMember
              key={member.userId}
              member={member}
              onRemove={() => removeMember(member.userId)}
              onRoleChange={(role) => updateMemberRole(member.userId, role)}
            />
          ))}
        </div>
      )}

      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
}

interface SelectedMemberProps {
  member: TeamMember;
  onRemove: () => void;
  onRoleChange: (role: string) => void;
}

function SelectedMember({ member, onRemove, onRoleChange }: SelectedMemberProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await usersApi.getById(member.userId);
        setUser(response.data.data || response.data);
      } catch {
        // User not found
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [member.userId]);

  if (loading) {
    return (
      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-md animate-pulse">
        <div className="h-8 w-8 rounded-full bg-gray-200" />
        <div className="flex-1">
          <div className="h-4 w-32 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const roleLabel = teamMemberRoleOptions.find((r) => r.value === member.role)?.label || member.role;

  return (
    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-md">
      <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 text-sm font-medium flex-shrink-0">
        {user.firstName[0]}{user.lastName[0]}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">
          {user.firstName} {user.lastName}
        </p>
        <p className="text-xs text-gray-500 truncate">{user.email}</p>
      </div>
      <div className="relative">
        <select
          value={member.role}
          onChange={(e) => onRoleChange(e.target.value)}
          className="appearance-none bg-white border border-gray-300 rounded-md px-3 py-1.5 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent"
        >
          {teamMemberRoleOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown
          className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
          aria-hidden="true"
        />
      </div>
      <button
        type="button"
        onClick={onRemove}
        className="text-gray-400 hover:text-red-500 transition-colors"
        title="Remove member"
      >
        <X className="h-5 w-5" />
      </button>
    </div>
  );
}
