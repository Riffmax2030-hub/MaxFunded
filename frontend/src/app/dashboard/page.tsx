"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import {
  fetchDashboardSummary,
  fetchEquityCurve,
  fetchPerformanceReport,
  DashboardSummaryData,
  EquityPoint,
  PerformanceReportData,
  RuleComplianceItem,
} from "@/lib/api";
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Shield,
  Loader2,
  Target,
  BarChart2,
  Calendar,
  Award,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  CreditCard,
  Activity,
  Zap,
} from "lucide-react";

// ──────────────────────────────────────────
// Utility helpers
// ──────────────────────────────────────────

function fmt(value: string | number | null | undefined, decimals = 2): string {
  if (value === null || value === undefined) return "—";
  const n = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(n)) return "—";
  return n.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

function fmtCurrency(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return "—";
  const n = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(n)) return "—";
  return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtPct(value: number | null | undefined): string {
  if (value === null || value === undefined) return "—";
  return value.toFixed(2) + "%";
}

function statusColor(status: string): string {
  const map: Record<string, string> = {
    ACTIVE: "text-emerald-400",
    WARNING: "text-amber-400",
    BREACHED: "text-red-400",
    TARGET_REACHED: "text-cyan-400",
    FUNDED: "text-violet-400",
    PASSED: "text-blue-400",
  };
  return map[status] ?? "text-slate-400";
}

function statusBadge(status: string): string {
  const map: Record<string, string> = {
    ACTIVE: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    WARNING: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    BREACHED: "bg-red-500/20 text-red-400 border-red-500/30",
    TARGET_REACHED: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
    FUNDED: "bg-violet-500/20 text-violet-400 border-violet-500/30",
    PASSED: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  };
  return map[status] ?? "bg-slate-700 text-slate-400 border-slate-600";
}

function phaseLabel(phase: string): string {
  return phase === "FUNDED" ? "Funded Account" : phase === "PHASE_2" ? "Phase 2" : "Phase 1";
}

// ──────────────────────────────────────────
// Sub-components
// ──────────────────────────────────────────

function MetricCard({
  label,
  value,
  sub,
  icon: Icon,
  accent = "emerald",
  danger = false,
}: {
  label: string;
  value: string;
  sub?: string;
  icon: React.ElementType;
  accent?: string;
  danger?: boolean;
}) {
  const accentMap: Record<string, string> = {
    emerald: "bg-emerald-500/10 text-emerald-400",
    blue: "bg-blue-500/10 text-blue-400",
    amber: "bg-amber-500/10 text-amber-400",
    red: "bg-red-500/10 text-red-400",
    violet: "bg-violet-500/10 text-violet-400",
    cyan: "bg-cyan-500/10 text-cyan-400",
  };
  return (
    <div className={`bg-slate-800 border ${danger ? "border-red-500/40" : "border-slate-700"} rounded-xl p-5 flex flex-col gap-3`}>
      <div className="flex items-center justify-between">
        <span className="text-slate-400 text-sm">{label}</span>
        <span className={`p-2 rounded-lg ${accentMap[accent] ?? accentMap.emerald}`}>
          <Icon size={16} />
        </span>
      </div>
      <div>
        <p className={`text-2xl font-bold ${danger ? "text-red-400" : "text-white"}`}>{value}</p>
        {sub && <p className="text-slate-500 text-xs mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

function DrawdownGauge({
  label,
  used,
  limit,
  usedPct,
}: {
  label: string;
  used: number;
  limit: number;
  usedPct: number;
}) {
  const color =
    usedPct >= 80 ? "bg-red-500" : usedPct >= 60 ? "bg-amber-500" : "bg-emerald-500";
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-slate-300 text-sm font-medium">{label}</span>
        <span
          className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
            usedPct >= 80
              ? "bg-red-500/20 text-red-400"
              : usedPct >= 60
              ? "bg-amber-500/20 text-amber-400"
              : "bg-emerald-500/20 text-emerald-400"
          }`}
        >
          {fmtPct(usedPct)} used
        </span>
      </div>
      <div className="w-full bg-slate-700 rounded-full h-2.5 mb-3">
        <div
          className={`${color} h-2.5 rounded-full transition-all duration-500`}
          style={{ width: `${Math.min(100, usedPct)}%` }}
        />
      </div>
      <div className="flex justify-between text-xs text-slate-500">
        <span>Used: {fmtPct(usedPct)}</span>
        <span>Limit: {fmtPct(limit)}</span>
      </div>
    </div>
  );
}

function RuleComplianceCard({ rule }: { rule: RuleComplianceItem }) {
  const pct = rule.percentage_used ?? 0;
  const color = rule.is_breached
    ? "bg-red-500"
    : rule.is_achieved
    ? "bg-emerald-500"
    : pct >= 80
    ? "bg-amber-500"
    : "bg-blue-500";

  return (
    <div
      className={`bg-slate-800 border rounded-xl p-4 ${
        rule.is_breached
          ? "border-red-500/40"
          : rule.is_achieved
          ? "border-emerald-500/40"
          : "border-slate-700"
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-slate-300 text-sm font-medium">{rule.rule_name}</span>
        {rule.is_breached ? (
          <AlertTriangle size={14} className="text-red-400" />
        ) : rule.is_achieved ? (
          <CheckCircle size={14} className="text-emerald-400" />
        ) : (
          <Clock size={14} className="text-slate-500" />
        )}
      </div>
      <p className="text-slate-500 text-xs mb-3">{rule.description}</p>
      <div className="w-full bg-slate-700 rounded-full h-1.5 mb-2">
        <div
          className={`${color} h-1.5 rounded-full transition-all duration-500`}
          style={{ width: `${Math.min(100, pct)}%` }}
        />
      </div>
      <div className="flex justify-between text-xs text-slate-500">
        <span>{rule.current_value ? fmtCurrency(rule.current_value) : `${pct.toFixed(1)}%`}</span>
        <span>{rule.limit_value ? fmtCurrency(rule.limit_value) : "—"}</span>
      </div>
    </div>
  );
}

function SimpleEquityChart({ points }: { points: EquityPoint[] }) {
  if (points.length < 2) {
    return (
      <div className="h-40 flex items-center justify-center text-slate-500 text-sm">
        No equity history yet — start trading to see your curve.
      </div>
    );
  }

  const equities = points.map((p) => parseFloat(p.equity));
  const min = Math.min(...equities);
  const max = Math.max(...equities);
  const range = max - min || 1;

  const w = 100;
  const h = 100;
  const step = w / (points.length - 1);

  const path = equities
    .map((v, i) => {
      const x = i * step;
      const y = h - ((v - min) / range) * h;
      return `${i === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ");

  const isPositive = equities[equities.length - 1] >= equities[0];
  const strokeColor = isPositive ? "#10b981" : "#ef4444";

  return (
    <div className="h-40 w-full">
      <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="w-full h-full">
        <defs>
          <linearGradient id="eq-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={strokeColor} stopOpacity="0.3" />
            <stop offset="100%" stopColor={strokeColor} stopOpacity="0.02" />
          </linearGradient>
        </defs>
        <path
          d={path + ` L ${((points.length - 1) * step).toFixed(2)} ${h} L 0 ${h} Z`}
          fill="url(#eq-grad)"
        />
        <path d={path} fill="none" stroke={strokeColor} strokeWidth="1.5" />
      </svg>
      <div className="flex justify-between text-xs text-slate-500 mt-1">
        <span>{points[0].recorded_at.slice(0, 10)}</span>
        <span>{points[points.length - 1].recorded_at.slice(0, 10)}</span>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────
// Main page
// ──────────────────────────────────────────

export default function TraderDashboard() {
  const [summary, setSummary] = useState<DashboardSummaryData | null>(null);
  const [equityCurve, setEquityCurve] = useState<EquityPoint[]>([]);
  const [performance, setPerformance] = useState<PerformanceReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "compliance" | "performance">("overview");
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const loadData = useCallback(async () => {
    const session = getSession();
    if (!session) {
      setError("Please log in to view your dashboard.");
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const [sum, curve, perf] = await Promise.all([
        fetchDashboardSummary(session.token),
        fetchEquityCurve(session.token, 30),
        fetchPerformanceReport(session.token),
      ]);
      setSummary(sum);
      setEquityCurve(curve);
      setPerformance(perf);
      setLastRefresh(new Date());
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Dashboard unavailable";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    // Auto-refresh every 60 seconds
    const interval = setInterval(loadData, 60_000);
    return () => clearInterval(interval);
  }, [loadData]);

  // ── Render states ───────────────────────
  const renderContent = () => {
    if (loading && !summary) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <Loader2 size={40} className="text-emerald-400 animate-spin" />
          <p className="text-slate-400">Loading dashboard…</p>
        </div>
      );
    }

    if (error) {
      const isNoAccount = error.toLowerCase().includes("no active challenge");
      return (
        <div className="max-w-lg mx-auto mt-24 text-center">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-10">
            {isNoAccount ? (
              <>
                <Activity size={48} className="mx-auto text-slate-500 mb-4" />
                <h2 className="text-xl font-bold text-white mb-2">No Active Challenge</h2>
                <p className="text-slate-400 mb-6">
                  Purchase a challenge to unlock your live trading dashboard.
                </p>
                <Link
                  href="/challenges"
                  className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-lg font-semibold transition"
                >
                  <Zap size={16} /> Browse Challenges
                </Link>
              </>
            ) : (
              <>
                <AlertTriangle size={48} className="mx-auto text-amber-400 mb-4" />
                <h2 className="text-xl font-bold text-white mb-2">Dashboard Error</h2>
                <p className="text-slate-400 mb-6">{error}</p>
                <button
                  onClick={loadData}
                  className="inline-flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white px-6 py-3 rounded-lg font-semibold transition"
                >
                  <RefreshCw size={16} /> Retry
                </button>
              </>
            )}
          </div>
        </div>
      );
    }

    if (!summary) return null;

    const profit = parseFloat(summary.total_profit);
    const profitPositive = profit >= 0;

    return (
      <div className="space-y-6">
        {/* ── Account header banner ── */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-800/50 border border-slate-700 rounded-2xl p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <span
                  className={`text-xs font-semibold px-3 py-1 rounded-full border ${statusBadge(summary.account_status)}`}
                >
                  {summary.account_status}
                </span>
                <span className="text-xs text-slate-500 bg-slate-700 px-2 py-0.5 rounded-full">
                  {phaseLabel(summary.phase)}
                </span>
              </div>
              <h1 className="text-2xl font-bold text-white">{summary.challenge_name}</h1>
              <p className="text-slate-400 text-sm">
                Account Size: {fmtCurrency(summary.account_size)}
                {summary.challenge_start_date && (
                  <> &nbsp;·&nbsp; Started {summary.challenge_start_date}</>
                )}
                {summary.days_remaining !== null && (
                  <> &nbsp;·&nbsp; {summary.days_remaining} days remaining</>
                )}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {/* Quick links */}
              {summary.kyc_status !== "APPROVED" && (
                <Link
                  href="/kyc"
                  className="flex items-center gap-1.5 text-xs bg-amber-500/20 text-amber-400 border border-amber-500/30 px-3 py-2 rounded-lg hover:bg-amber-500/30 transition"
                >
                  <ShieldCheck size={13} /> Complete KYC
                </Link>
              )}
              {!summary.has_pending_payout && summary.kyc_status === "APPROVED" && (
                <Link
                  href="/payouts"
                  className="flex items-center gap-1.5 text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3 py-2 rounded-lg hover:bg-emerald-500/30 transition"
                >
                  <CreditCard size={13} /> Request Payout
                </Link>
              )}
              {summary.has_pending_payout && (
                <Link
                  href="/payouts"
                  className="flex items-center gap-1.5 text-xs bg-violet-500/20 text-violet-400 border border-violet-500/30 px-3 py-2 rounded-lg hover:bg-violet-500/30 transition"
                >
                  <Clock size={13} /> Payout Pending
                </Link>
              )}
              <button
                onClick={loadData}
                title="Refresh"
                className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-400 hover:text-white transition"
              >
                <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
              </button>
            </div>
          </div>
        </div>

        {/* ── Core metrics row ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetricCard
            label="Current Balance"
            value={fmtCurrency(summary.current_balance)}
            icon={DollarSign}
            accent="emerald"
          />
          <MetricCard
            label="Current Equity"
            value={fmtCurrency(summary.current_equity)}
            sub={`${summary.open_positions} open position${summary.open_positions !== 1 ? "s" : ""}`}
            icon={Activity}
            accent="blue"
          />
          <MetricCard
            label="Total Profit"
            value={fmtCurrency(summary.total_profit)}
            sub={`${profitPositive ? "+" : ""}${fmtPct(summary.total_profit_pct)}`}
            icon={profitPositive ? TrendingUp : TrendingDown}
            accent={profitPositive ? "emerald" : "red"}
            danger={!profitPositive}
          />
          <MetricCard
            label="Win Rate"
            value={fmtPct(summary.win_rate_pct)}
            sub={`${summary.winning_trades}W / ${summary.losing_trades}L — ${summary.total_trades} closed`}
            icon={Target}
            accent="cyan"
          />
        </div>

        {/* ── Profit target progress ── */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Award size={16} className="text-amber-400" />
              <span className="text-slate-300 font-medium">Profit Target Progress</span>
            </div>
            <span
              className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                summary.profit_target_achieved
                  ? "bg-emerald-500/20 text-emerald-400"
                  : "bg-slate-700 text-slate-400"
              }`}
            >
              {summary.profit_target_achieved ? "✓ Target Achieved!" : `${fmtPct(summary.profit_target_reached_pct)} of target`}
            </span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all duration-700 ${
                summary.profit_target_achieved ? "bg-emerald-400" : "bg-amber-500"
              }`}
              style={{ width: `${Math.min(100, summary.profit_target_reached_pct)}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-slate-500 mt-2">
            <span>
              Current profit: {fmtCurrency(summary.total_profit)} ({fmtPct(summary.total_profit_pct)})
            </span>
            <span>Target: {fmtPct(summary.profit_target_pct)}</span>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="flex gap-2 border-b border-slate-700 pb-0">
          {(["overview", "compliance", "performance"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 text-sm font-medium rounded-t-lg transition capitalize ${
                activeTab === tab
                  ? "bg-slate-800 text-white border border-b-slate-800 border-slate-700 -mb-px"
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              {tab === "overview" ? "Overview & Drawdown" : tab === "compliance" ? "Rule Compliance" : "Performance"}
            </button>
          ))}
        </div>

        {/* ── Tab content ── */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Drawdown gauges */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DrawdownGauge
                label="Daily Loss Drawdown"
                used={summary.daily_drawdown_used_pct}
                limit={summary.daily_drawdown_limit_pct}
                usedPct={summary.daily_drawdown_used_pct}
              />
              <DrawdownGauge
                label="Maximum Drawdown"
                used={summary.max_drawdown_used_pct}
                limit={summary.max_drawdown_limit_pct}
                usedPct={summary.max_drawdown_used_pct}
              />
            </div>

            {/* Equity curve */}
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <BarChart2 size={16} className="text-blue-400" />
                <span className="text-slate-300 font-medium">30-Day Equity Curve</span>
              </div>
              <SimpleEquityChart points={equityCurve} />
            </div>

            {/* Trade statistics */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <MetricCard
                label="Avg. Profit / Trade"
                value={fmtCurrency(summary.avg_profit_per_trade)}
                icon={ArrowUpRight}
                accent="emerald"
              />
              <MetricCard
                label="Avg. Loss / Trade"
                value={fmtCurrency(summary.avg_loss_per_trade)}
                icon={ArrowDownRight}
                accent="red"
                danger={parseFloat(summary.avg_loss_per_trade) > 0}
              />
              <MetricCard
                label="Profit Factor"
                value={summary.profit_factor !== null ? summary.profit_factor.toFixed(2) : "—"}
                sub={summary.profit_factor !== null && summary.profit_factor >= 1.5 ? "Excellent" : summary.profit_factor !== null && summary.profit_factor >= 1 ? "Profitable" : "Unprofitable"}
                icon={TrendingUp}
                accent={summary.profit_factor !== null && summary.profit_factor >= 1 ? "emerald" : "red"}
              />
            </div>
          </div>
        )}

        {activeTab === "compliance" && (
          <div>
            <p className="text-slate-400 text-sm mb-4">
              All rules must be satisfied before a payout can be requested.
              <Link href="/rules" className="text-emerald-400 ml-1 hover:underline inline-flex items-center gap-1">
                View full rules <ExternalLink size={11} />
              </Link>
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {summary.rule_compliance.map((rule) => (
                <RuleComplianceCard key={rule.rule_name} rule={rule} />
              ))}
            </div>
          </div>
        )}

        {activeTab === "performance" && performance && (
          <div className="space-y-6">
            {/* Summary stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <MetricCard
                label="Trading Days"
                value={String(performance.trading_days)}
                icon={Calendar}
                accent="blue"
              />
              <MetricCard
                label="Best Day P&L"
                value={fmtCurrency(performance.best_day_pnl)}
                icon={ArrowUpRight}
                accent="emerald"
              />
              <MetricCard
                label="Worst Day P&L"
                value={fmtCurrency(performance.worst_day_pnl)}
                icon={ArrowDownRight}
                accent="red"
              />
              <MetricCard
                label="Avg. Daily P&L"
                value={fmtCurrency(performance.avg_daily_pnl)}
                icon={BarChart2}
                accent="cyan"
              />
            </div>

            {/* Daily breakdown table */}
            {performance.daily_breakdown.length > 0 ? (
              <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-slate-700/50">
                    <tr>
                      <th className="text-left px-4 py-3 text-slate-400 font-medium">Date</th>
                      <th className="text-right px-4 py-3 text-slate-400 font-medium">P&L</th>
                      <th className="text-right px-4 py-3 text-slate-400 font-medium">Trades</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700">
                    {performance.daily_breakdown.map((d) => {
                      const pnl = parseFloat(d.realized_pnl);
                      return (
                        <tr key={d.trade_date} className="hover:bg-slate-700/30 transition">
                          <td className="px-4 py-3 text-slate-300">{d.trade_date}</td>
                          <td
                            className={`px-4 py-3 text-right font-medium ${
                              pnl >= 0 ? "text-emerald-400" : "text-red-400"
                            }`}
                          >
                            {pnl >= 0 ? "+" : ""}{fmtCurrency(d.realized_pnl)}
                          </td>
                          <td className="px-4 py-3 text-right text-slate-400">{d.trades_count}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="bg-slate-800 border border-slate-700 rounded-xl p-10 text-center text-slate-500">
                No trading days recorded yet. Complete your first trading day to see breakdown here.
              </div>
            )}
          </div>
        )}

        {/* ── Footer row ── */}
        <div className="flex items-center justify-between text-xs text-slate-600">
          <span>Last updated: {lastRefresh.toLocaleTimeString()} &nbsp;·&nbsp; Auto-refreshes every 60s</span>
          <div className="flex gap-4">
            <Link href="/kyc" className="hover:text-slate-400 transition flex items-center gap-1">
              <Shield size={11} /> KYC Status: <span className={
                summary.kyc_status === "APPROVED" ? "text-emerald-500" : "text-amber-500"
              }>{summary.kyc_status}</span>
            </Link>
            <Link href="/payouts" className="hover:text-slate-400 transition">Payouts →</Link>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white pt-6 pb-16">
      <div className="max-w-6xl mx-auto px-4 py-4">
        {renderContent()}
      </div>
    </div>
  );
}
