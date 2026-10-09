'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { API_BASE } from '@/lib/api';
import toast from 'react-hot-toast';
import {
  Users,
  Search,
  UserCheck,
  UserX,
  Shield,
  ShieldAlert,
  Crown,
  Eye,
  RefreshCw,
  Mail,
  Phone,
  Globe,
  Calendar,
  X,
  CheckCircle2,
  AlertCircle,
  FileCheck,
} from 'lucide-react';

interface AdminUserRecord {
  id: string;
  email: string;
  full_name: string;
  country: string;
  phone: string | null;
  role: string;
  is_active: boolean;
  is_verified: boolean;
  is_admin: boolean;
  kyc_status: string;
  created_at: string | null;
}

interface UserStats {
  total_users: number;
  active_users: number;
  pending_kyc: number;
  suspended: number;
}

export default function AdminUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<AdminUserRecord[]>([]);
  const [stats, setStats] = useState<UserStats>({
    total_users: 0,
    active_users: 0,
    pending_kyc: 0,
    suspended: 0,
  });
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<AdminUserRecord | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const loadUsers = useCallback(async (query = '', pageNum = 1) => {
    const session = getSession();
    if (!session || !session.token) {
      router.push('/login');
      return;
    }
    if (!session.isAdmin) {
      router.push('/dashboard');
      return;
    }

    setLoading(true);
    try {
      const params = new URLSearchParams({
        search: query,
        page: String(pageNum),
        per_page: '20',
      });
      const res = await fetch(`${API_BASE}/admin/users?${params.toString()}`, {
        headers: { Authorization: `Bearer ${session.token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
        setTotal(data.total || 0);
        if (data.stats) setStats(data.stats);
      } else {
        toast.error('Failed to load user directory');
      }
    } catch {
      toast.error('Connection error fetching users');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    loadUsers(search, page);
  }, [loadUsers, search, page]);

  const handleToggleSuspend = async (user: AdminUserRecord) => {
    const session = getSession();
    const endpoint = user.is_active ? 'suspend' : 'activate';
    const actionLabel = user.is_active ? 'Suspend' : 'Activate';

    if (!confirm(`Are you sure you want to ${actionLabel.toLowerCase()} user ${user.email}?`)) {
      return;
    }

    setActionLoading(true);
    try {
      const res = await fetch(`${API_BASE}/admin/users/${user.id}/${endpoint}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${session?.token}` },
      });

      if (res.ok) {
        toast.success(`User ${user.email} ${user.is_active ? 'suspended' : 'activated'}`);
        loadUsers(search, page);
        if (selectedUser?.id === user.id) {
          setSelectedUser({ ...selectedUser, is_active: !user.is_active });
        }
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.detail || `Failed to ${endpoint} user`);
      }
    } catch {
      toast.error('Network error during operation');
    } finally {
      setActionLoading(false);
    }
  };

  const handleMakeAdmin = async (user: AdminUserRecord) => {
    const session = getSession();
    if (!confirm(`Promote ${user.email} to Administrator? This grants system-wide permissions.`)) {
      return;
    }

    setActionLoading(true);
    try {
      const res = await fetch(`${API_BASE}/admin/users/${user.id}/make-admin`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${session?.token}` },
      });

      if (res.ok) {
        toast.success(`${user.email} is now an Administrator`);
        loadUsers(search, page);
        if (selectedUser?.id === user.id) {
          setSelectedUser({ ...selectedUser, is_admin: true, role: 'SUPER_ADMIN' });
        }
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.detail || 'Failed to promote user');
      }
    } catch {
      toast.error('Network error promoting user');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Title Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-[#ccff00]/10 text-[#ccff00] border border-[#ccff00]/20">
              OPERATIONS
            </span>
            <span className="text-xs text-neutral-500 font-mono">REGISTRY DATABASE</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Trader Management</h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            Browse registered accounts, audit KYC compliance, adjust trading privileges, and manage roles.
          </p>
        </div>

        <button
          onClick={() => loadUsers(search, page)}
          className="self-start sm:self-auto flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white border border-white/10 text-xs font-bold transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* KPI Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-[#111418] border border-white/10 rounded-2xl p-5">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-xs font-semibold">Total Accounts</span>
            <Users className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white">{stats.total_users}</div>
          <span className="text-[11px] text-neutral-500 mt-1 block">Registered in platform</span>
        </div>

        <div className="bg-[#111418] border border-white/10 rounded-2xl p-5">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-xs font-semibold">Active Traders</span>
            <UserCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-400">{stats.active_users}</div>
          <span className="text-[11px] text-neutral-500 mt-1 block">In good standing</span>
        </div>

        <div className="bg-[#111418] border border-white/10 rounded-2xl p-5">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-xs font-semibold">Pending KYC</span>
            <FileCheck className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-400">{stats.pending_kyc}</div>
          <span className="text-[11px] text-neutral-500 mt-1 block">Requires review</span>
        </div>

        <div className="bg-[#111418] border border-white/10 rounded-2xl p-5">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-xs font-semibold">Suspended</span>
            <UserX className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-rose-400">{stats.suspended}</div>
          <span className="text-[11px] text-neutral-500 mt-1 block">Access locked</span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-[#111418] border border-white/10 rounded-2xl p-4">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search traders by email or legal name..."
            className="w-full bg-[#08090b] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-neutral-500 text-sm focus:outline-none focus:border-[#ccff00]/50"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-[#111418] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.02] text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                <th className="py-3.5 px-4">Trader</th>
                <th className="py-3.5 px-4">Country</th>
                <th className="py-3.5 px-4">Role</th>
                <th className="py-3.5 px-4">KYC Status</th>
                <th className="py-3.5 px-4">Account Status</th>
                <th className="py-3.5 px-4">Joined</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-neutral-500">
                    Loading trader records...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-neutral-500">
                    No users matching criteria.
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-white/[0.02] transition">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-neutral-800 border border-white/10 flex items-center justify-center font-bold text-xs text-white">
                          {u.full_name ? u.full_name.charAt(0).toUpperCase() : u.email.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-white flex items-center gap-1.5">
                            {u.full_name || 'Anonymous Trader'}
                            {u.is_admin && (
                              <span title="Administrator">
                                <Crown className="w-3.5 h-3.5 text-amber-400" />
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-neutral-400 font-mono">{u.email}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-mono text-xs text-neutral-300 px-2 py-0.5 rounded bg-white/5 border border-white/5">
                        {u.country}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`text-[11px] font-bold uppercase px-2.5 py-0.5 rounded-md ${
                          u.is_admin
                            ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                            : 'bg-neutral-800 text-neutral-300'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`text-[11px] font-bold uppercase px-2.5 py-0.5 rounded-md ${
                          u.kyc_status === 'APPROVED'
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                            : u.kyc_status === 'PENDING'
                            ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                            : 'bg-neutral-800 text-neutral-400'
                        }`}
                      >
                        {u.kyc_status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1.5 text-xs font-semibold ${
                          u.is_active ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${u.is_active ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                        {u.is_active ? 'Active' : 'Suspended'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-xs text-neutral-400 font-mono">
                      {u.created_at ? new Date(u.created_at).toLocaleDateString() : '—'}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedUser(u)}
                          title="View Details"
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white transition"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleToggleSuspend(u)}
                          disabled={actionLoading}
                          title={u.is_active ? 'Suspend Account' : 'Reactivate Account'}
                          className={`p-1.5 rounded-lg border transition ${
                            u.is_active
                              ? 'bg-rose-500/10 border-rose-500/20 text-rose-400 hover:bg-rose-500/20'
                              : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20'
                          }`}
                        >
                          {u.is_active ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-4 border-t border-white/5 flex items-center justify-between text-xs text-neutral-400">
          <span>
            Showing {users.length} of {total} traders
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white disabled:opacity-30 transition font-bold"
            >
              Previous
            </button>
            <span className="font-mono text-neutral-300">Page {page}</span>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={page * 20 >= total}
              className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white disabled:opacity-30 transition font-bold"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* User Detail Dossier Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111418] border border-white/10 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative">
            <button
              onClick={() => setSelectedUser(null)}
              className="absolute right-4 top-4 text-neutral-400 hover:text-white p-1 rounded-lg hover:bg-white/5"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-[#ccff00]/10 border border-[#ccff00]/30 flex items-center justify-center font-black text-lg text-[#ccff00]">
                {selectedUser.full_name ? selectedUser.full_name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div>
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  {selectedUser.full_name || 'Anonymous Trader'}
                  {selectedUser.is_admin && <Crown className="w-4 h-4 text-amber-400" />}
                </h3>
                <span className="text-xs text-neutral-400 font-mono">{selectedUser.email}</span>
              </div>
            </div>

            <div className="space-y-3 bg-[#08090b] p-4 rounded-xl border border-white/5 mb-6 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-white/5">
                <span className="text-neutral-500">Trader User ID</span>
                <span className="font-mono text-neutral-300 select-all">{selectedUser.id}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-white/5">
                <span className="text-neutral-500">Country of Residence</span>
                <span className="font-bold text-white">{selectedUser.country}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-white/5">
                <span className="text-neutral-500">Phone Number</span>
                <span className="font-mono text-neutral-300">{selectedUser.phone || 'None provided'}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-white/5">
                <span className="text-neutral-500">Platform Role</span>
                <span className="font-bold text-sky-400">{selectedUser.role}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-white/5">
                <span className="text-neutral-500">KYC Status</span>
                <span
                  className={`font-black uppercase ${
                    selectedUser.kyc_status === 'APPROVED' ? 'text-emerald-400' : 'text-amber-400'
                  }`}
                >
                  {selectedUser.kyc_status}
                </span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-neutral-500">Account Standing</span>
                <span className={`font-bold ${selectedUser.is_active ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {selectedUser.is_active ? 'ACTIVE & AUTHORIZED' : 'SUSPENDED'}
                </span>
              </div>
            </div>

            {/* Quick Actions in Modal */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleToggleSuspend(selectedUser)}
                disabled={actionLoading}
                className={`flex-1 py-2.5 rounded-xl font-bold text-xs transition flex items-center justify-center gap-2 ${
                  selectedUser.is_active
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30 hover:bg-rose-500/30'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30'
                }`}
              >
                {selectedUser.is_active ? (
                  <>
                    <UserX className="w-4 h-4" /> Suspend Account
                  </>
                ) : (
                  <>
                    <UserCheck className="w-4 h-4" /> Activate Account
                  </>
                )}
              </button>

              {!selectedUser.is_admin && (
                <button
                  onClick={() => handleMakeAdmin(selectedUser)}
                  disabled={actionLoading}
                  className="py-2.5 px-4 rounded-xl font-bold text-xs bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30 transition flex items-center gap-1.5"
                >
                  <Crown className="w-4 h-4" /> Make Admin
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
