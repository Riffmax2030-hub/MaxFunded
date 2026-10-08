"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getSession } from "@/lib/auth";
import {
  fetchAdminPoolSummary,
  fetchAdminPoolAccounts,
  addPoolAccount,
  deletePoolAccount,
  adminResendCredentials,
  MT5AccountPoolSummary,
  MT5AccountPoolItem,
  MT5AccountPoolCreate,
} from "@/lib/api";
import {
  Database,
  Plus,
  Trash2,
  Mail,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Loader2,
  Server,
  ChevronDown,
  ChevronUp,
  Shield,
  X,
} from "lucide-react";

// ── Status Badge ────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    AVAILABLE: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    ASSIGNED: "bg-blue-500/15 text-blue-400 border-blue-500/30",
    BREACHED: "bg-red-500/15 text-red-400 border-red-500/30",
    PASSED: "bg-purple-500/15 text-purple-400 border-purple-500/30",
    ARCHIVED: "bg-slate-700/50 text-slate-400 border-slate-600/30",
  };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase border ${
        map[status] ?? "bg-slate-800 text-slate-300 border-slate-700"
      }`}
    >
      {status}
    </span>
  );
}

// ── Add Account Modal ────────────────────────────────────────────────────────

function AddAccountModal({
  onClose,
  onSuccess,
  token,
}: {
  onClose: () => void;
  onSuccess: () => void;
  token: string;
}) {
  const [form, setForm] = useState<MT5AccountPoolCreate>({
    broker_name: "RoboForex",
    server_name: "RoboForex-Demo",
    account_tier: 10000,
    mt5_login: "",
    mt5_password: "",
    mt5_investor_password: "",
    notes: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const tiers = [10000, 25000, 50000, 100000, 200000];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await addPoolAccount(token, form);
      onSuccess();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to add account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 w-full max-w-lg shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
            <Plus className="w-5 h-5 text-[#ccff00]" /> Add MT5 Account to Pool
          </h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-800 transition">
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        {error && (
          <div className="bg-red-950/40 border border-red-500/30 rounded-xl p-3 mb-4 text-red-300 text-sm flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">Broker Name</label>
              <input
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#ccff00]/60"
                value={form.broker_name}
                onChange={(e) => setForm((f) => ({ ...f, broker_name: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">Server Name</label>
              <input
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#ccff00]/60"
                value={form.server_name}
                onChange={(e) => setForm((f) => ({ ...f, server_name: e.target.value }))}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">Account Tier (Balance)</label>
            <select
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#ccff00]/60"
              value={form.account_tier}
              onChange={(e) => setForm((f) => ({ ...f, account_tier: Number(e.target.value) }))}
            >
              {tiers.map((t) => (
                <option key={t} value={t}>
                  ${t.toLocaleString()}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">MT5 Login ID</label>
            <input
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-[#ccff00]/60"
              value={form.mt5_login}
              onChange={(e) => setForm((f) => ({ ...f, mt5_login: e.target.value }))}
              placeholder="e.g. 7012345"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">Master Password</label>
            <input
              type="password"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-[#ccff00]/60"
              value={form.mt5_password}
              onChange={(e) => setForm((f) => ({ ...f, mt5_password: e.target.value }))}
              placeholder="Strong password"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">
              Investor Password <span className="text-slate-600">(optional)</span>
            </label>
            <input
              type="password"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-[#ccff00]/60"
              value={form.mt5_investor_password ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, mt5_investor_password: e.target.value }))}
              placeholder="Read-only password"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5">
              Notes <span className="text-slate-600">(optional)</span>
            </label>
            <input
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#ccff00]/60"
              value={form.notes ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              placeholder="e.g. Created 2026-09-28"
            />
          </div>

          <div className="flex gap-3 pt-1">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 bg-[#ccff00] hover:bg-[#d4ff33] text-black rounded-xl font-bold text-sm transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              {loading ? "Adding..." : "Add Account"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold text-sm transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────

export default function AdminPoolPage() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);

  const [summary, setSummary] = useState<MT5AccountPoolSummary | null>(null);
  const [accounts, setAccounts] = useState<MT5AccountPoolItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Actions
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [actionMsg, setActionMsg] = useState<{ id: string; msg: string; ok: boolean } | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    const session = getSession();
    if (!session || !session.isAdmin) {
      router.push("/dashboard");
      return;
    }
    setToken(session.token);
  }, [router]);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const [sum, accs] = await Promise.all([
        fetchAdminPoolSummary(token),
        fetchAdminPoolAccounts(token, statusFilter || undefined),
      ]);
      setSummary(sum);
      setAccounts(accs);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load pool data");
    } finally {
      setLoading(false);
    }
  }, [token, statusFilter]);

  useEffect(() => {
    if (token) load();
  }, [token, load]);

  const handleDelete = async (acc: MT5AccountPoolItem) => {
    if (!token) return;
    if (!window.confirm(`Delete account ${acc.mt5_login} from pool? This cannot be undone.`)) return;
    setActionLoading(acc.id);
    try {
      await deletePoolAccount(token, acc.id);
      setActionMsg({ id: acc.id, msg: "Account deleted from pool.", ok: true });
      load();
    } catch (err: unknown) {
      setActionMsg({ id: acc.id, msg: err instanceof Error ? err.message : "Delete failed", ok: false });
    } finally {
      setActionLoading(null);
    }
  };

  const handleResend = async (acc: MT5AccountPoolItem) => {
    if (!token || !acc.assigned_purchase_id) return;
    setActionLoading(acc.id);
    try {
      const result = await adminResendCredentials(token, acc.assigned_purchase_id);
      setActionMsg({ id: acc.id, msg: `Credentials resent to ${result.recipient}`, ok: true });
    } catch (err: unknown) {
      setActionMsg({ id: acc.id, msg: err instanceof Error ? err.message : "Resend failed", ok: false });
    } finally {
      setActionLoading(null);
    }
  };

  if (!token) return null;

  return (
    <>
      {showAddModal && token && (
        <AddAccountModal
          token={token}
          onClose={() => setShowAddModal(false)}
          onSuccess={load}
        />
      )}

      <main className="pb-20 px-6 xl:px-10 pt-8">
        <div className="max-w-7xl mx-auto space-y-8">

          {/* ── Header ──────────────────────────────────────────────── */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ccff00]/10 border border-[#ccff00]/30 text-[#ccff00] text-xs font-semibold uppercase tracking-wider mb-2">
                <Database size={13} /> MT5 Account Pool
              </div>
              <h1 className="text-3xl font-extrabold text-white">Account Pool Manager</h1>
              <p className="text-slate-400 text-sm mt-1">
                Manage pre-generated MT5 demo accounts. Accounts are auto-assigned to traders on payment confirmation.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#ccff00] hover:bg-[#d4ff33] text-black font-bold text-xs transition shadow-lg shadow-[#ccff00]/20"
              >
                <Plus size={14} /> Add Account
              </button>
              <button
                onClick={load}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition"
              >
                <RefreshCw size={14} /> Refresh
              </button>
            </div>
          </div>

          {/* ── Summary Cards ────────────────────────────────────────── */}
          {summary && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Total Accounts", value: summary.total_accounts, color: "text-white", bg: "bg-slate-800" },
                { label: "Available", value: summary.available_accounts, color: "text-emerald-400", bg: "bg-emerald-950/30 border-emerald-500/20" },
                { label: "Assigned", value: summary.assigned_accounts, color: "text-blue-400", bg: "bg-blue-950/30 border-blue-500/20" },
                { label: "Tier Count", value: summary.tiers.length, color: "text-[#ccff00]", bg: "bg-[#ccff00]/5 border-[#ccff00]/20" },
              ].map((card) => (
                <div key={card.label} className={`rounded-2xl p-5 border border-slate-800 ${card.bg}`}>
                  <p className={`text-3xl font-black ${card.color}`}>{card.value}</p>
                  <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mt-1">{card.label}</p>
                </div>
              ))}
            </div>
          )}

          {/* ── Tier Breakdown ───────────────────────────────────────── */}
          {summary && summary.tiers.length > 0 && (
            <section className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6">
              <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Server className="w-4 h-4 text-[#ccff00]" /> Inventory by Balance Tier
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {summary.tiers.map((tier) => (
                  <div
                    key={tier.tier}
                    className={`rounded-xl p-3 border ${
                      tier.available === 0
                        ? "bg-red-950/20 border-red-500/20"
                        : tier.available <= 2
                        ? "bg-amber-950/20 border-amber-500/20"
                        : "bg-slate-800/60 border-slate-700/40"
                    }`}
                  >
                    <p className="text-lg font-black text-white">
                      ${(tier.tier / 1000).toFixed(0)}K
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      <span className="text-emerald-400 font-bold">{tier.available}</span> avail /{" "}
                      <span className="text-blue-400 font-bold">{tier.assigned}</span> assigned
                    </p>
                    {tier.available === 0 && (
                      <p className="text-[10px] text-red-400 font-semibold mt-1 uppercase">Pool Empty!</p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ── Account List ─────────────────────────────────────────── */}
          <section className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Shield className="w-5 h-5 text-indigo-400" /> Pool Accounts
                {accounts.length > 0 && (
                  <span className="text-sm font-normal text-slate-400">({accounts.length} shown)</span>
                )}
              </h2>
              <div className="flex items-center gap-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#ccff00]/50"
                >
                  <option value="">All Statuses</option>
                  <option value="AVAILABLE">Available</option>
                  <option value="ASSIGNED">Assigned</option>
                  <option value="BREACHED">Breached</option>
                  <option value="PASSED">Passed</option>
                  <option value="ARCHIVED">Archived</option>
                </select>
              </div>
            </div>

            {error && (
              <div className="bg-red-950/30 border border-red-500/30 rounded-xl p-4 text-red-300 text-sm flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" /> {error}
              </div>
            )}

            {loading ? (
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-14 bg-slate-800/40 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : accounts.length === 0 ? (
              <div className="text-center py-16">
                <Database className="w-10 h-10 mx-auto text-slate-600 mb-3" />
                <p className="text-slate-400 font-medium">No accounts in pool yet</p>
                <p className="text-slate-600 text-sm mt-1">Click "Add Account" to seed the pool</p>
              </div>
            ) : (
              <div className="space-y-2">
                {accounts.map((acc) => (
                  <div
                    key={acc.id}
                    className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-slate-700 transition"
                  >
                    {/* Row header */}
                    <div className="flex items-center gap-3 px-4 py-3">
                      <div className="flex-1 grid grid-cols-2 md:grid-cols-5 gap-2 items-center">
                        <div>
                          <p className="text-xs text-slate-500 uppercase tracking-wide">Login</p>
                          <p className="text-sm font-mono font-bold text-white">{acc.mt5_login}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 uppercase tracking-wide">Tier</p>
                          <p className="text-sm font-bold text-[#ccff00]">
                            ${Number(acc.account_tier).toLocaleString()}
                          </p>
                        </div>
                        <div className="hidden md:block">
                          <p className="text-xs text-slate-500 uppercase tracking-wide">Broker</p>
                          <p className="text-xs text-slate-300">{acc.broker_name}</p>
                        </div>
                        <div className="hidden md:block">
                          <p className="text-xs text-slate-500 uppercase tracking-wide">Server</p>
                          <p className="text-xs text-slate-300 font-mono">{acc.server_name}</p>
                        </div>
                        <div>
                          <StatusBadge status={acc.status} />
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {acc.status === "ASSIGNED" && acc.assigned_purchase_id && (
                          <button
                            onClick={() => handleResend(acc)}
                            disabled={actionLoading === acc.id}
                            title="Resend credentials to trader"
                            className="p-2 rounded-lg bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 transition disabled:opacity-40"
                          >
                            {actionLoading === acc.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Mail className="w-4 h-4" />
                            )}
                          </button>
                        )}
                        {acc.status === "AVAILABLE" && (
                          <button
                            onClick={() => handleDelete(acc)}
                            disabled={actionLoading === acc.id}
                            title="Remove from pool"
                            className="p-2 rounded-lg bg-red-600/20 hover:bg-red-600/40 text-red-400 transition disabled:opacity-40"
                          >
                            {actionLoading === acc.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
                        )}
                        <button
                          onClick={() => setExpandedId(expandedId === acc.id ? null : acc.id)}
                          className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 transition"
                        >
                          {expandedId === acc.id ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Action feedback */}
                    {actionMsg?.id === acc.id && (
                      <div
                        className={`mx-4 mb-3 px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                          actionMsg.ok
                            ? "bg-emerald-950/40 text-emerald-400 border border-emerald-500/30"
                            : "bg-red-950/40 text-red-400 border border-red-500/30"
                        }`}
                      >
                        {actionMsg.ok ? (
                          <CheckCircle className="w-3.5 h-3.5" />
                        ) : (
                          <AlertTriangle className="w-3.5 h-3.5" />
                        )}
                        {actionMsg.msg}
                      </div>
                    )}

                    {/* Expanded detail row */}
                    {expandedId === acc.id && (
                      <div className="border-t border-slate-800 bg-slate-950/50 px-4 py-3 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                        <div>
                          <p className="text-slate-500 uppercase tracking-wide mb-1">Password</p>
                          <p className="font-mono text-slate-300">{acc.mt5_password}</p>
                        </div>
                        <div>
                          <p className="text-slate-500 uppercase tracking-wide mb-1">Investor PW</p>
                          <p className="font-mono text-slate-300">{acc.mt5_investor_password ?? "N/A"}</p>
                        </div>
                        {acc.assigned_at && (
                          <div>
                            <p className="text-slate-500 uppercase tracking-wide mb-1">Assigned At</p>
                            <p className="text-slate-300">{new Date(acc.assigned_at).toLocaleString()}</p>
                          </div>
                        )}
                        {acc.assigned_purchase_id && (
                          <div>
                            <p className="text-slate-500 uppercase tracking-wide mb-1">Purchase ID</p>
                            <p className="font-mono text-slate-400 text-[10px]">{acc.assigned_purchase_id}</p>
                          </div>
                        )}
                        {acc.notes && (
                          <div className="col-span-2 md:col-span-4">
                            <p className="text-slate-500 uppercase tracking-wide mb-1">Notes</p>
                            <p className="text-slate-300">{acc.notes}</p>
                          </div>
                        )}
                        <div>
                          <p className="text-slate-500 uppercase tracking-wide mb-1">Created</p>
                          <p className="text-slate-400">{new Date(acc.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* ── How It Works ─────────────────────────────────────────── */}
          <section className="bg-[#ccff00]/5 border border-[#ccff00]/20 rounded-3xl p-6">
            <h3 className="text-sm font-bold text-[#ccff00] uppercase tracking-wider mb-3">How the Pool Works</h3>
            <ol className="text-sm text-slate-300 space-y-2 list-decimal list-inside">
              <li>You pre-create MT5 demo accounts on RoboForex (or any broker) and add them here.</li>
              <li>When a trader pays for a challenge, the system auto-picks the first <span className="text-[#ccff00] font-semibold">AVAILABLE</span> account matching the balance tier.</li>
              <li>The account status changes to <span className="text-blue-400 font-semibold">ASSIGNED</span> and login credentials are emailed to the trader automatically.</li>
              <li>If the pool runs empty for a tier, the system falls back to generated placeholder credentials. Keep the pool stocked!</li>
            </ol>
          </section>

        </div>
      </main>
    </>
  );
}
