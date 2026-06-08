'use client';

import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { betaInviteApi } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { useAuthStore } from '@/lib/store';
import { toast } from 'sonner';
import { Plus, Search, Mail, Copy, Trash2, Send, BarChart2, Loader2, Calendar, Users, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

interface BetaInvite {
  id: string;
  code: string;
  email: string | null;
  status: 'ACTIVE' | 'EXPIRED' | 'USED_UP' | 'REVOKED';
  expiresAt: string;
  maxUses: number;
  usedCount: number;
  createdAt: string;
  createdBy: { id: string; firstName: string; lastName: string; email: string };
  organization: { id: string; name: string; slug: string } | null;
  usages: Array<{ id: string; converted: boolean; createdAt: string }>;
}

interface Pagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

interface Analytics {
  totalInvites: number;
  totalUsages: number;
  totalConverted: number;
  activeInvites: number;
  conversionRate: number;
  byStatus: Record<string, number>;
}

export default function AdminBetaInvitesPage() {
  const { user } = useAuthStore();
  const [invites, setInvites] = useState<BetaInvite[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, pageSize: 20, total: 0, totalPages: 0 });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [actioning, setActioning] = useState<string | null>(null);
  const [createMode, setCreateMode] = useState<'single' | 'bulk' | null>(null);
  const [createForm, setCreateForm] = useState({ email: '', expiresInDays: 30, maxUses: 1, count: 10 });
  const [sendInviteId, setSendInviteId] = useState<string | null>(null);
  const [sendForm, setSendForm] = useState({ email: '', message: '' });
  const [revokeId, setRevokeId] = useState<string | null>(null);
  const [reminderId, setReminderId] = useState<string | null>(null);

  const statusColors: Record<string, string> = {
    ACTIVE: 'sage',
    EXPIRED: 'default',
    USED_UP: 'info',
    REVOKED: 'danger',
  };

  const statusLabels: Record<string, string> = {
    ACTIVE: 'Active',
    EXPIRED: 'Expired',
    USED_UP: 'Used Up',
    REVOKED: 'Revoked',
  };

  const fetchInvites = async () => {
    setLoading(true);
    try {
      const res = await betaInviteApi.list({
        page: pagination.page,
        pageSize: pagination.pageSize,
        search: search || undefined,
        status: statusFilter.length > 0 ? statusFilter : undefined,
      });
      const data = res.data?.data;
      setInvites(data?.invites ?? []);
      setPagination((prev) => ({ ...prev, ...data?.pagination }));
    } catch {
      toast.error('Failed to load beta invites');
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    setAnalyticsLoading(true);
    try {
      const res = await betaInviteApi.getAnalytics(30);
      const data = res.data?.data;
      setAnalytics(data);
    } catch {
      console.error('Failed to load analytics');
    } finally {
      setAnalyticsLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    fetchInvites();
    fetchAnalytics();
  }, [user, pagination.page, search, statusFilter]);

  const handleCreate = async () => {
    setActioning('create');
    try {
      if (createMode === 'single') {
        await betaInviteApi.create({
          email: createForm.email || undefined,
          expiresInDays: createForm.expiresInDays,
          maxUses: createForm.maxUses,
        });
        toast.success('Beta invite created');
      } else {
        await betaInviteApi.bulkCreate({
          count: createForm.count,
          expiresInDays: createForm.expiresInDays,
          maxUses: createForm.maxUses,
        });
        toast.success(`${createForm.count} beta invites created`);
      }
      setCreateMode(null);
      setCreateForm({ email: '', expiresInDays: 30, maxUses: 1, count: 10 });
      fetchInvites();
      fetchAnalytics();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to create invite';
      toast.error(msg);
    } finally {
      setActioning(null);
    }
  };

  const handleSend = async () => {
    if (!sendInviteId) return;
    setActioning('send');
    try {
      await betaInviteApi.send(sendInviteId, sendForm.email, sendForm.message);
      toast.success('Invitation sent');
      setSendInviteId(null);
      setSendForm({ email: '', message: '' });
      fetchInvites();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to send invitation';
      toast.error(msg);
    } finally {
      setActioning(null);
    }
  };

  const handleRevoke = async () => {
    if (!revokeId) return;
    setActioning(revokeId);
    try {
      await betaInviteApi.revoke(revokeId);
      toast.success('Invite revoked');
      setRevokeId(null);
      fetchInvites();
      fetchAnalytics();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to revoke invite';
      toast.error(msg);
    } finally {
      setActioning(null);
    }
  };

  const handleSendReminder = async () => {
    if (!reminderId) return;
    setActioning(reminderId);
    try {
      await betaInviteApi.sendReminder(reminderId);
      toast.success('Reminder sent');
      setReminderId(null);
      fetchInvites();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to send reminder';
      toast.error(msg);
    } finally {
      setActioning(null);
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success('Code copied to clipboard');
  };

  const openSendDialog = (invite: BetaInvite) => {
    setSendInviteId(invite.id);
    setSendForm({ email: invite.email ?? '', message: '' });
  };

  const actionButtons = (
    <div className="flex gap-2">
      <Button variant="outline" size="sm" onClick={() => { setCreateMode('single'); setCreateForm({ email: '', expiresInDays: 30, maxUses: 1, count: 10 }); }}>
        <Plus size={14} className="mr-1" />
        Create Invite
      </Button>
      <Button variant="outline" size="sm" onClick={() => { setCreateMode('bulk'); setCreateForm({ email: '', expiresInDays: 30, maxUses: 1, count: 10 }); }}>
        <Plus size={14} className="mr-1" />
        Bulk Create
      </Button>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Beta Invitations</h1>
            <p className="text-gray-500">Manage beta invite codes and track conversions</p>
          </div>
          <div className="flex gap-2">{actionButtons}</div>
        </div>

        {/* Create Form */}
        {createMode && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>{createMode === 'single' ? 'Create Beta Invite' : 'Bulk Create Beta Invites'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {createMode === 'single' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input
                    type="email"
                    label="Email (optional)"
                    placeholder="invitee@company.com"
                    value={createForm.email}
                    onChange={(e) => setCreateForm((prev) => ({ ...prev, email: e.target.value }))}
                  />
                  <Input
                    type="number"
                    label="Expires in (days)"
                    value={createForm.expiresInDays}
                    onChange={(e) => setCreateForm((prev) => ({ ...prev, expiresInDays: parseInt(e.target.value) || 30 }))}
                    min={1}
                    max={365}
                  />
                  <Input
                    type="number"
                    label="Max Uses"
                    value={createForm.maxUses}
                    onChange={(e) => setCreateForm((prev) => ({ ...prev, maxUses: parseInt(e.target.value) || 1 }))}
                    min={1}
                    max={100}
                  />
                </div>
              )}
              {createMode === 'bulk' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input
                    type="number"
                    label="Count"
                    value={createForm.count}
                    onChange={(e) => setCreateForm((prev) => ({ ...prev, count: parseInt(e.target.value) || 10 }))}
                    min={1}
                    max={100}
                  />
                  <Input
                    type="number"
                    label="Expires in (days)"
                    value={createForm.expiresInDays}
                    onChange={(e) => setCreateForm((prev) => ({ ...prev, expiresInDays: parseInt(e.target.value) || 30 }))}
                    min={1}
                    max={365}
                  />
                  <Input
                    type="number"
                    label="Max Uses"
                    value={createForm.maxUses}
                    onChange={(e) => setCreateForm((prev) => ({ ...prev, maxUses: parseInt(e.target.value) || 1 }))}
                    min={1}
                    max={100}
                  />
                </div>
              )}
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" onClick={() => setCreateMode(null)}>Cancel</Button>
                <Button onClick={handleCreate} loading={actioning === 'create'}>
                  {createMode === 'single' ? 'Create' : 'Create All'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Analytics Cards */}
        {!analyticsLoading && analytics && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Total Invites</p>
                    <p className="text-2xl font-bold text-gray-900">{analytics.totalInvites}</p>
                  </div>
                  <div className="p-3 bg-emerald-100 rounded-lg">
                    <Plus size={20} className="text-emerald-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Total Usages</p>
                    <p className="text-2xl font-bold text-gray-900">{analytics.totalUsages}</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <Users size={20} className="text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Converted</p>
                    <p className="text-2xl font-bold text-gray-900">{analytics.totalConverted}</p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <CheckCircle size={20} className="text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Conversion Rate</p>
                    <p className="text-2xl font-bold text-gray-900">{analytics.conversionRate}%</p>
                  </div>
                  <div className="p-3 bg-orange-100 rounded-lg">
                    <BarChart2 size={20} className="text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters */}
        <Card className="mb-4">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <Input
                  placeholder="Search by code or email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select
                options={[
                  { value: 'ACTIVE', label: 'Active' },
                  { value: 'EXPIRED', label: 'Expired' },
                  { value: 'USED_UP', label: 'Used Up' },
                  { value: 'REVOKED', label: 'Revoked' },
                ]}
                placeholder="Filter by status"
                value={statusFilter.join(',')}
                onChange={(e) => setStatusFilter(e.target.value ? e.target.value.split(',') : [])}
                className="w-48"
              />
            </div>
          </CardContent>
        </Card>

        {/* Invites List */}
        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="py-12 flex items-center justify-center">
                <Loader2 className="animate-spin text-gray-400" size={32} />
              </div>
            ) : invites.length === 0 ? (
              <div className="py-12 text-center">
                <Mail className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                <p className="text-gray-500">No beta invites found</p>
                <p className="text-sm text-gray-400 mt-1">Create your first invite to get started</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50">
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Uses</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expires</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {invites.map((invite) => (
                      <tr key={invite.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <code className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">{invite.code}</code>
                            <Button variant="ghost" size="icon" onClick={() => handleCopyCode(invite.code)} className="h-7 w-7">
                              <Copy size={14} />
                            </Button>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {invite.email ? (
                            <span className="text-sm text-gray-900">{invite.email}</span>
                          ) : (
                            <span className="text-sm text-gray-400">(any email)</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant={statusColors[invite.status] as any}>
                            {statusLabels[invite.status]}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {invite.usedCount} / {invite.maxUses}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {format(new Date(invite.expiresAt), 'MMM d, yyyy')}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {format(new Date(invite.createdAt), 'MMM d, yyyy HH:mm')}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {invite.status === 'ACTIVE' && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => openSendDialog(invite)}
                                  disabled={actioning === 'send'}
                                  className="h-7 w-7 text-emerald-600 hover:bg-emerald-50"
                                  title="Send invitation"
                                >
                                  <Send size={14} />
                                </Button>
                                {invite.email && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => setReminderId(invite.id)}
                                    disabled={actioning === invite.id}
                                    className="h-7 w-7 text-blue-600 hover:bg-blue-50"
                                    title="Send reminder"
                                  >
                                    <Mail size={14} />
                                  </Button>
                                )}
                              </>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setRevokeId(invite.id)}
                              disabled={actioning === invite.id || invite.status === 'REVOKED'}
                              className="h-7 w-7 text-red-600 hover:bg-red-50"
                              title="Revoke invite"
                            >
                              <Trash2 size={14} />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                <p className="text-sm text-gray-500">
                  Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
                    disabled={pagination.page === 1 || loading}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
                    disabled={pagination.page === pagination.totalPages || loading}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Send Invitation Dialog */}
      {sendInviteId && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center z-50 p-4 animate-fade-in"
          onClick={(e) => { if (e.target === e.currentTarget) setSendInviteId(null); }}
          role="dialog"
          aria-modal="true"
        >
          <Card className="w-full max-w-md shadow-xl animate-enter">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 rounded-t-2xl bg-emerald-50">
              <CardTitle id="send-dialog-title" className="flex items-center gap-2 text-emerald-600">
                <Send className="h-5 w-5" />
                Send Invitation
              </CardTitle>
              <button
                type="button"
                onClick={() => setSendInviteId(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors rounded-lg p-1 hover:bg-gray-100"
                aria-label="Close dialog"
              >
                <X className="h-5 w-5" />
              </button>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <p className="text-gray-600">Enter the recipient's email to send the invitation link.</p>
              <Input
                type="email"
                label="Recipient Email"
                placeholder="invitee@company.com"
                value={sendForm.email}
                onChange={(e) => setSendForm((prev) => ({ ...prev, email: e.target.value }))}
              />
              <Input
                label="Custom Message (optional)"
                placeholder="Add a personal message..."
                value={sendForm.message}
                onChange={(e) => setSendForm((prev) => ({ ...prev, message: e.target.value }))}
              />
              <div className="flex justify-end gap-3 pt-2">
                <Button variant="outline" onClick={() => setSendInviteId(null)}>Cancel</Button>
                <Button onClick={handleSend} loading={actioning === 'send'} variant="success">Send</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Revoke Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={!!revokeId}
        onClose={() => setRevokeId(null)}
        onConfirm={handleRevoke}
        title="Revoke Invite"
        description="Are you sure you want to revoke this beta invite? This action cannot be undone."
        confirmText="Revoke"
        variant="destructive"
        isLoading={actioning === revokeId}
      />
    </div>
  );
}