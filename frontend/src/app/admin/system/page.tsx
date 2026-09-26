"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getSession } from "@/lib/auth";
import {
  fetchSystemHealth,
  fetchAdminAuditLogs,
  SystemHealthData,
  AuditLogListResponse,
} from "@/lib/api";
import {
  Shield,
  Database,
  Activity,
  Users,
  TrendingUp,
  Clock,
  RefreshCw,
  Filter,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  CheckCircle,
  Loader2,
  Server,
  Layers,
} from "lucide-react";

// ─── Metric Card ────────────────────────────────────────────────────────────

function MetricCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: number | string;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex items-center gap-4 shadow-sm">
      <div className={`p-3.5 rounded-xl ${color}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div>
        <p className="text-2xl font-black text-white">{value}</p>
        <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mt-0.5">{label}</p>
      </div>
    </div>
  );
}

// ─── Action Badge ────────────────────────────────────────────────────────────

function ActionBadge({ action }: { action: string }) {
  const colors: Record<string, string> = {
    ADMIN: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    KYC: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    PAYOUT: "bg-green-500/20 text-green-400 border-green-500/30",
    CERTIFICATE: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    AFFILIATE: "bg-orange-500/20 text-orange-400 border-orange-500/30",
    RULE: "bg-red-500/20 text-red-400 border-red-500/30",
  };
  const prefix = Object.keys(colors).find((k) => action.startsWith(k));
  const cls = prefix ? colors[prefix] : "bg-slate-800 text-slate-300 border-slate-700";
  return (
    <span className={`px-2.5 py-1 rounded-md text-xs font-mono font-semibold border ${cls}`}>
      {action}
    </span>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function AdminSystemPage() {
  const router = useRouter();

  // Health state
  const [health, setHealth] = useState<SystemHealthData | null>(null);
  const [healthLoading, setHealthLoading] = useState(true);
  const [healthError, setHealthError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  // Audit log state
  const [logs, setLogs] = useState<AuditLogListResponse | null>(null);
  const [logsLoading, setLogsLoading] = useState(true);
  const [logsError, setLogsError] = useState<string | null>(null);

  // Filters
  const [filterAction, setFilterAction] = useState("");
  const [filterTargetType, setFilterTargetType] = useState("");
  const [filterActorId, setFilterActorId] = useState("");
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 20;

  // ── Fetch health ──────────────────────────────────────────────────────────
  const loadHealth = useCallback(async () => {
    setHealthLoading(true);
    setHealthError(null);
    try {
      const data = await fetchSystemHealth();
      setHealth(data);
      setLastRefresh(new Date());
    } catch (e: unknown) {
      setHealthError(e instanceof Error ? e.message : "Failed to load health");
    } finally {
      setHealthLoading(false);
    }
  }, []);

  // ── Fetch audit logs ──────────────────────────────────────────────────────
  const loadLogs = useCallback(async () => {
    const session = getSession();
    if (!session || !session.isAdmin) {
      router.push("/dashboard");
      return;
    }
    setLogsLoading(true);
    setLogsError(null);
    try {
      const data = await fetchAdminAuditLogs(session.token, {
        action: filterAction || undefined,
        target_type: filterTargetType || undefined,
        actor_id: filterActorId || undefined,
        limit: PAGE_SIZE,
        offset: page * PAGE_SIZE,
      });
      setLogs(data);
    } catch (e: unknown) {
      setLogsError(e instanceof Error ? e.message : "Failed to load audit logs");
    } finally {
      setLogsLoading(false);
    }
  }, [filterAction, filterTargetType, filterActorId, page, router]);

  // ── Initial load ──────────────────────────────────────────────────────────
  useEffect(() => {
    loadHealth();
    loadLogs();
  }, [loadHealth, loadLogs]);

  // ── Auto-refresh health every 60 s ────────────────────────────────────────
  useEffect(() => {
    const id = setInterval(loadHealth, 60_000);
    return () => clearInterval(id);
  }, [loadHealth]);

  const applyFilters = () => {
    setPage(0);
    loadLogs();
  };

  const totalPages = logs ? Math.ceil(logs.total / PAGE_SIZE) : 0;

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-slate-950 text-white pt-24 pb-20 px-4">
        <div className="max-w-7xl mx-auto space-y-8">

          {/* ── Top Header & Navigation ──────────────────────────────────── */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-2">
                <Server size={14} /> Mission Control Diagnostics
              </div>
              <h1 className="text-3xl font-extrabold text-white">System Health & Immutable Audit Logs</h1>
              <p className="text-slate-400 text-sm mt-1">
                Real-time operational pulse, database telemetry, and immutable audit logs across administrative actions.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href="/admin/challenges"
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition"
              >
                Challenges
              </Link>
              <Link
                href="/admin/compliance"
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition"
              >
                Compliance KYC
              </Link>
              <Link
                href="/admin/payouts"
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition"
              >
                Payouts
              </Link>
              <Link
                href="/admin/notifications"
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition"
              >
                Webhooks
              </Link>
              <button
                onClick={() => { loadHealth(); loadLogs(); }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition shadow-lg shadow-emerald-600/20"
              >
                <RefreshCw size={14} /> Refresh
              </button>
            </div>
          </div>

          {/* ── System Health Diagnostics ───────────────────────────────── */}
          <section className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold flex items-center gap-2 text-white">
                <Activity className="w-5 h-5 text-emerald-400" />
                Live Telemetry Pulse
              </h2>
              <span className="text-xs text-slate-500 font-mono">
                Updated: {lastRefresh.toLocaleTimeString()} · 60s auto-cycle
              </span>
            </div>

            {healthError && (
              <div className="bg-red-950/40 border border-red-500/30 rounded-xl p-4 mb-4 flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
                <span className="text-red-300 text-sm">{healthError}</span>
              </div>
            )}

            {healthLoading && !health ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-pulse">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-24 bg-slate-800/60 rounded-2xl" />
                ))}
              </div>
            ) : health ? (
              <div className="space-y-4">
                {/* Status banner */}
                <div
                  className={`flex items-center justify-between p-4 rounded-2xl border ${
                    health.status === "healthy"
                      ? "bg-emerald-950/30 border-emerald-500/30 text-emerald-300"
                      : "bg-amber-950/30 border-amber-500/30 text-amber-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {health.status === "healthy" ? (
                      <CheckCircle className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-amber-400" />
                    )}
                    <div>
                      <p className="font-bold text-sm capitalize">
                        Platform Status: {health.status} (Release {health.version})
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Database Engine:{" "}
                        <span className={`font-semibold ${health.database === "connected" ? "text-emerald-400" : "text-red-400"}`}>
                          {health.database.toUpperCase()}
                        </span>
                        {" · "}Telemetry polled at {new Date(health.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  <div className="hidden sm:flex items-center gap-2 text-xs font-mono bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-700">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    ONLINE
                  </div>
                </div>

                {/* Metrics grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <MetricCard
                    label="Registered Traders"
                    value={health.metrics.total_registered_traders.toLocaleString()}
                    icon={Users}
                    color="bg-blue-600"
                  />
                  <MetricCard
                    label="Active Trading Accounts"
                    value={health.metrics.active_trading_accounts.toLocaleString()}
                    icon={TrendingUp}
                    color="bg-emerald-600"
                  />
                  <MetricCard
                    label="Pending Payout Requests"
                    value={health.metrics.pending_payout_requests.toLocaleString()}
                    icon={Clock}
                    color="bg-amber-600"
                  />
                  <MetricCard
                    label="Active Challenge Tiers"
                    value={health.metrics.active_challenge_tiers.toLocaleString()}
                    icon={Database}
                    color="bg-purple-600"
                  />
                </div>
              </div>
            ) : null}
          </section>

          {/* ── Immutable Audit Trail ──────────────────────────────────── */}
          <section className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 backdrop-blur-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h2 className="text-lg font-bold flex items-center gap-2 text-white">
                <Shield className="w-5 h-5 text-indigo-400" />
                Immutable Administrative Audit Trail
              </h2>
              <span className="text-xs text-slate-400">
                {logs ? `${logs.total} Total Ledger Entries` : "Loading..."}
              </span>
            </div>

            {/* Filter Bar */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-wrap gap-3 items-end">
              <div className="flex flex-col gap-1.5 flex-1 min-w-[180px]">
                <label className="text-xs font-semibold text-slate-400 flex items-center gap-1">
                  <Filter className="w-3 h-3 text-indigo-400" /> Action Filter
                </label>
                <input
                  className="bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
                  placeholder="e.g. ADMIN_PAYOUT_APPROVED"
                  value={filterAction}
                  onChange={(e) => setFilterAction(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1.5 flex-1 min-w-[150px]">
                <label className="text-xs font-semibold text-slate-400">Target Type</label>
                <input
                  className="bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
                  placeholder="e.g. USER, PAYOUT, CHALLENGE"
                  value={filterTargetType}
                  onChange={(e) => setFilterTargetType(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1.5 flex-1 min-w-[150px]">
                <label className="text-xs font-semibold text-slate-400">Actor UUID</label>
                <input
                  className="bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
                  placeholder="Filter by Actor ID"
                  value={filterActorId}
                  onChange={(e) => setFilterActorId(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={applyFilters}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition shadow-sm"
                >
                  Apply
                </button>
                <button
                  onClick={() => { setFilterAction(""); setFilterTargetType(""); setFilterActorId(""); setPage(0); }}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition"
                >
                  Clear
                </button>
              </div>
            </div>

            {/* Log Table */}
            {logsError && (
              <div className="bg-red-950/40 border border-red-500/30 rounded-xl p-4 text-red-300 text-sm">
                {logsError}
              </div>
            )}

            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 uppercase tracking-wider font-semibold">
                      <th className="px-4 py-3.5">Timestamp</th>
                      <th className="px-4 py-3.5">Action</th>
                      <th className="px-4 py-3.5">Actor</th>
                      <th className="px-4 py-3.5">Target Entity</th>
                      <th className="px-4 py-3.5">Change Delta</th>
                      <th className="px-4 py-3.5">Audit Reason</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {logsLoading ? (
                      [...Array(6)].map((_, i) => (
                        <tr key={i} className="animate-pulse">
                          {[...Array(6)].map((_, j) => (
                            <td key={j} className="px-4 py-3.5">
                              <div className="h-3.5 bg-slate-800 rounded w-24" />
                            </td>
                          ))}
                        </tr>
                      ))
                    ) : logs && logs.items.length > 0 ? (
                      logs.items.map((log) => (
                        <tr key={log.id} className="hover:bg-slate-800/40 transition">
                          <td className="px-4 py-3.5 font-mono text-slate-400 whitespace-nowrap">
                            {new Date(log.created_at).toLocaleString()}
                          </td>
                          <td className="px-4 py-3.5">
                            <ActionBadge action={log.action} />
                          </td>
                          <td className="px-4 py-3.5 text-slate-300">
                            <div className="font-semibold text-white">{log.actor_email ?? "System Task"}</div>
                            <div className="font-mono text-slate-500 text-[10px] mt-0.5">{log.actor_id.slice(0, 8)}…</div>
                          </td>
                          <td className="px-4 py-3.5 text-slate-300">
                            <div className="font-semibold text-slate-200">{log.target_type}</div>
                            <div className="font-mono text-slate-500 text-[10px] mt-0.5">{log.target_id.slice(0, 8)}…</div>
                          </td>
                          <td className="px-4 py-3.5 max-w-[180px]">
                            {log.new_value ? (
                              <span className="text-emerald-400 font-mono block truncate" title={log.new_value}>
                                + {log.new_value.slice(0, 45)}
                              </span>
                            ) : "—"}
                            {log.previous_value ? (
                              <span className="text-rose-400 font-mono block truncate text-[10px] mt-0.5" title={log.previous_value}>
                                - {log.previous_value.slice(0, 45)}
                              </span>
                            ) : null}
                          </td>
                          <td className="px-4 py-3.5 text-slate-400 max-w-[160px]">
                            <span className="block truncate" title={log.reason ?? ""}>
                              {log.reason ?? "—"}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="px-4 py-12 text-center text-slate-500">
                          <Layers className="w-8 h-8 mx-auto mb-2 text-slate-600 opacity-60" />
                          No audit log records match the current filter.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {logs && logs.total > PAGE_SIZE && (
                <div className="flex items-center justify-between px-5 py-3.5 border-t border-slate-800 text-xs text-slate-400 bg-slate-950/40">
                  <span>
                    Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, logs.total)} of {logs.total}
                  </span>
                  <div className="flex items-center gap-2 font-semibold">
                    <button
                      onClick={() => setPage((p) => Math.max(0, p - 1))}
                      disabled={page === 0}
                      className="p-1.5 rounded-lg hover:bg-slate-800 disabled:opacity-30 transition border border-slate-800"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span>
                      Page {page + 1} of {totalPages}
                    </span>
                    <button
                      onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                      disabled={page >= totalPages - 1}
                      className="p-1.5 rounded-lg hover:bg-slate-800 disabled:opacity-30 transition border border-slate-800"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </section>

        </div>
      </main>
      <Footer />
    </>
  );
}
