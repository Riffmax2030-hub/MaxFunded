"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
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
import dynamic from "next/dynamic";
import { useDashboardWebSocket } from "@/hooks/useDashboardWebSocket";
import { useAnimatedNumber } from "@/hooks/useAnimatedNumber";

const InteractiveEquityChart = dynamic(() => import("@/components/InteractiveEquityChart"), { ssr: false });
const TradingViewChart = dynamic(() => import("@/components/TradingViewChart"), { ssr: false });
const Confetti = dynamic(() => import("react-confetti"), { ssr: false });
import TradingJournal from "@/components/TradingJournal";
import EconomicCalendar from "@/components/EconomicCalendar";
import { BRAND } from "@/lib/branding";
import { DiscordIcon } from "@/components/SocialIcons";
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
  Radio,
  Key,
  Copy,
  Eye,
  EyeOff,
  Settings,
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

function statusBadge(status: string): string {
  const map: Record<string, string> = {
    ACTIVE: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    WARNING: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    BREACHED: "bg-red-500/20 text-red-400 border-red-500/30",
    TARGET_REACHED: "bg-[#ccff00]/20 text-[#ccff00] border-[#ccff00]/30",
    FUNDED: "bg-violet-500/20 text-violet-400 border-violet-500/30",
    PASSED: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  };
  return map[status] ?? "bg-neutral-800 text-neutral-400 border-neutral-700";
}

function phaseLabel(phase: string): string {
  return phase === "FUNDED" ? "Funded Account" : phase === "PHASE_2" ? "Phase 2" : "Phase 1";
}

// ──────────────────────────────────────────
// Sub-components with Framer Motion
// ──────────────────────────────────────────

function MetricCard({
  label,
  value,
  numericValue,
  prefix = "$",
  suffix = "",
  sub,
  icon: Icon,
  accent = "emerald",
  danger = false,
}: {
  label: string;
  value?: string;
  numericValue?: number;
  prefix?: string;
  suffix?: string;
  sub?: string;
  icon: React.ElementType;
  accent?: string;
  danger?: boolean;
}) {
  const accentMap: Record<string, string> = {
    emerald: "bg-[#ccff00]/10 text-[#ccff00]",
    blue: "bg-sky-500/10 text-sky-400",
    amber: "bg-amber-500/10 text-amber-400",
    red: "bg-rose-500/10 text-rose-400",
    violet: "bg-violet-500/10 text-violet-400",
    cyan: "bg-cyan-500/10 text-cyan-400",
  };

  const animatedNum = useAnimatedNumber(numericValue !== undefined ? numericValue : 0, 700);

  const displayValue =
    numericValue !== undefined
      ? `${prefix}${animatedNum.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}${suffix}`
      : value;

  return (
    <motion.div
      whileHover={{ y: -3, transition: { duration: 0.15 } }}
      className={`metric-card flex flex-col justify-between relative overflow-hidden ${danger ? "border-rose-500/40" : ""}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-neutral-400 text-xs font-medium uppercase tracking-wider">{label}</span>
        <span className={`p-2 rounded-xl ${accentMap[accent] ?? accentMap.emerald}`}>
          <Icon size={16} />
        </span>
      </div>
      <div className="mt-3">
        <p className={`text-2xl font-black font-mono tracking-tight animate-metric-shift ${danger ? "text-rose-400" : "text-white"}`}>
          {displayValue}
        </p>
        {sub && <p className="text-neutral-500 text-xs mt-1 font-medium">{sub}</p>}
      </div>
    </motion.div>
  );
}

function DrawdownGauge({
  label,
  limit,
  usedPct,
}: {
  label: string;
  limit: number;
  usedPct: number;
}) {
  const isHighDanger = usedPct >= 80;
  const isWarning = usedPct >= 60;
  const color = isHighDanger ? "bg-rose-500" : isWarning ? "bg-amber-500" : "bg-[#ccff00]";

  return (
    <motion.div
      whileHover={{ y: -2, transition: { duration: 0.15 } }}
      className="metric-card shadow-lg"
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-neutral-200 text-sm font-semibold">{label}</span>
        <span
          className={`text-xs font-bold font-mono px-2.5 py-0.5 rounded-full ${
            isHighDanger
              ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
              : isWarning
              ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
              : "bg-[#ccff00]/15 text-[#ccff00] border border-[#ccff00]/30"
          }`}
        >
          {fmtPct(usedPct)} used
        </span>
      </div>
      <div className="w-full bg-[#16181d] rounded-full h-3 mb-3 p-0.5 border border-white/5">
        <motion.div
          className={`${color} h-2 rounded-full`}
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(100, Math.max(0, usedPct))}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
      <div className="flex justify-between text-xs text-neutral-400 font-mono">
        <span>Current Drawdown: {fmtPct(usedPct)}</span>
        <span>Hard Limit: {fmtPct(limit)}</span>
      </div>
    </motion.div>
  );
}

function RuleComplianceCard({ rule }: { rule: RuleComplianceItem }) {
  const pct = rule.percentage_used ?? 0;
  const color = rule.is_breached
    ? "bg-rose-500"
    : rule.is_achieved
    ? "bg-[#ccff00]"
    : pct >= 80
    ? "bg-amber-500"
    : "bg-sky-500";

  return (
    <motion.div
      whileHover={{ y: -2, transition: { duration: 0.15 } }}
      className={`metric-card shadow-lg ${
        rule.is_breached
          ? "border-rose-500/40"
          : rule.is_achieved
          ? "border-[#ccff00]/40"
          : ""
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-white text-sm font-semibold">{rule.rule_name}</span>
        {rule.is_breached ? (
          <span className="flex items-center gap-1 text-xs text-rose-400 font-semibold bg-rose-500/10 px-2 py-0.5 rounded-md">
            <AlertTriangle size={13} /> Breached
          </span>
        ) : rule.is_achieved ? (
          <span className="flex items-center gap-1 text-xs text-[#ccff00] font-semibold bg-[#ccff00]/10 px-2 py-0.5 rounded-md">
            <CheckCircle size={13} /> Passed
          </span>
        ) : (
          <span className="flex items-center gap-1 text-xs text-neutral-400 bg-white/5 px-2 py-0.5 rounded-md">
            <Clock size={13} /> Tracking
          </span>
        )}
      </div>
      <p className="text-neutral-400 text-xs mb-3">{rule.description}</p>
      <div className="w-full bg-[#16181d] rounded-full h-2 mb-2 overflow-hidden border border-white/5">
        <motion.div
          className={`${color} h-2 rounded-full`}
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(100, pct)}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
      <div className="flex justify-between text-xs text-neutral-400 font-mono">
        <span>Current: {rule.current_value ? fmtCurrency(rule.current_value) : `${pct.toFixed(1)}%`}</span>
        <span>Target / Cap: {rule.limit_value ? fmtCurrency(rule.limit_value) : "—"}</span>
      </div>
    </motion.div>
  );
}

// ──────────────────────────────────────────
// Trader Rank system
// ──────────────────────────────────────────

type TraderRankInfo = {
  label: string;
  icon: string;
  color: string;
  bgColor: string;
  borderColor: string;
  barColor: string;
  xp: number;
  maxXp: number;
  nextAt: string;
};

function getTraderRank(phase: string, profit: number): TraderRankInfo {
  if (phase === "FUNDED" && profit >= 5000) {
    return { label: "MASTER", icon: "👑", color: "text-amber-300", bgColor: "bg-amber-500/10", borderColor: "border-amber-500/30", barColor: "bg-amber-400", xp: 1000, maxXp: 1000, nextAt: "Max tier reached" };
  }
  if (phase === "FUNDED") {
    return { label: "ELITE", icon: "⚡", color: "text-violet-400", bgColor: "bg-violet-500/10", borderColor: "border-violet-500/30", barColor: "bg-violet-400", xp: 700, maxXp: 1000, nextAt: `$${(5000 - profit).toLocaleString()} profit to Master` };
  }
  if (phase === "PHASE_2") {
    return { label: "PROFESSIONAL", icon: "🎯", color: "text-sky-400", bgColor: "bg-sky-500/10", borderColor: "border-sky-500/30", barColor: "bg-sky-400", xp: 400, maxXp: 1000, nextAt: "Pass Phase 2 → Elite" };
  }
  return { label: "ROOKIE", icon: "🌱", color: "text-[#ccff00]", bgColor: "bg-[#ccff00]/10", borderColor: "border-[#ccff00]/30", barColor: "bg-[#ccff00]", xp: 100, maxXp: 1000, nextAt: "Pass Phase 1 → Professional" };
}

function TraderRankBadge({ phase, profit }: { phase: string; profit: number }) {
  const rank = getTraderRank(phase, profit);
  const pct = Math.round((rank.xp / rank.maxXp) * 100);

  return (
    <motion.div
      whileHover={{ y: -2, transition: { duration: 0.15 } }}
      className={`${rank.bgColor} border ${rank.borderColor} rounded-2xl p-4 shadow-lg flex flex-col gap-2 min-w-[170px]`}
    >
      <div className="flex items-center gap-2">
        <span className="text-xl">{rank.icon}</span>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">Trader Rank</p>
          <p className={`text-sm font-black ${rank.color} tracking-wide`}>{rank.label}</p>
        </div>
      </div>
      <div>
        <div className="flex justify-between text-[10px] text-neutral-500 mb-1">
          <span>{rank.xp} XP</span><span>{rank.maxXp} XP</span>
        </div>
        <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden border border-white/5">
          <motion.div
            className={`${rank.barColor} h-full rounded-full`}
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.9, ease: "easeOut" }}
          />
        </div>
        <p className="text-[10px] text-neutral-500 mt-1">{rank.nextAt}</p>
      </div>
    </motion.div>
  );
}

function DangerZoneBanner({ dailyUsedPct, maxUsedPct }: { dailyUsedPct: number; maxUsedPct: number }) {
  const worstPct = Math.max(dailyUsedPct, maxUsedPct);
  const which = dailyUsedPct >= maxUsedPct ? "daily loss" : "max drawdown";
  if (worstPct < 80) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-rose-950/50 border border-rose-500/50 rounded-2xl p-4 flex items-start gap-3"
    >
      <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5 animate-pulse" />
      <div className="flex-1">
        <p className="text-rose-300 font-bold text-sm">⚠ Danger Zone — Account at Risk</p>
        <p className="text-rose-400/80 text-xs mt-1 leading-relaxed">
          Your {which} limit is <strong className="text-rose-300">{worstPct.toFixed(1)}% used</strong>. You are dangerously
          close to a breach. Consider closing open positions and reducing exposure immediately to protect your account.
        </p>
      </div>
      <div className="shrink-0 text-rose-400 font-black text-xl font-mono">{worstPct.toFixed(0)}%</div>
    </motion.div>
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
  const [activeTab, setActiveTab] = useState<"overview" | "compliance" | "journal" | "news" | "performance">("overview");
  const [chartMode, setChartMode] = useState<"equity" | "candles">("equity");
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [showPassword, setShowPassword] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState("");
  const [payoutAddress, setPayoutAddress] = useState("");
  const [payoutSubmitted, setPayoutSubmitted] = useState(false);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Real-time WebSocket hook
  const { data: wsData, status: wsStatus } = useDashboardWebSocket();

  // Load initial data via REST API
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

  // Update summary when WebSocket pushes live data
  useEffect(() => {
    if (wsData) {
      setSummary(wsData as unknown as DashboardSummaryData);
      setLastRefresh(new Date());
      setLoading(false);
    }
  }, [wsData]);

  // Initial fetch and 60-second background polling fallback
  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 60_000);
    return () => clearInterval(interval);
  }, [loadData]);

  // Quick 1-click test login for reviewers
  const handleQuickDemoLogin = async () => {
    try {
      setLoading(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
      const res = await fetch(`${apiUrl}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "trader@maxfunded.com", password: "Trader2026!" }),
      });
      if (res.ok) {
        const data = await res.json();
        const { saveSession } = await import("@/lib/auth");
        saveSession(data.access_token, {
          id: data.user_id,
          email: data.email,
          role: data.role,
          is_admin: data.is_admin,
        });
        await loadData();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // ── Render states ───────────────────────
  const renderContent = () => {
    if (loading && !summary) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <Loader2 size={40} className="text-[#ccff00] animate-spin" />
          <p className="text-neutral-400 text-sm font-medium">Synchronizing MT5 trading metrics…</p>
        </div>
      );
    }

    if (error && !summary) {
      const isAuthError =
        error.toLowerCase().includes("log in") ||
        error.toLowerCase().includes("not authenticated");
      const isNoAccount = error.toLowerCase().includes("no active challenge");

      if (isAuthError) {
        return (
          <div className="max-w-md mx-auto mt-20 text-center">
            <div className="bg-[#0d0e10] border border-white/[0.08] rounded-3xl p-8 sm:p-10 shadow-2xl relative overflow-hidden">
              <div className="w-16 h-16 rounded-2xl bg-[#ccff00]/10 border border-[#ccff00]/20 flex items-center justify-center mx-auto mb-6 text-[#ccff00]">
                <ShieldCheck size={32} />
              </div>
              <h2 className="text-2xl font-black text-white mb-2 tracking-tight">Trader Portal Access</h2>
              <p className="text-neutral-400 text-sm mb-8 leading-relaxed">
                Sign in to your MaxFunded account to view your live MetaTrader 5 balance, real-time equity curve, and drawdown objectives.
              </p>

              <div className="space-y-3">
                <Link
                  href="/login"
                  className="w-full inline-flex items-center justify-center gap-2 bg-[#ccff00] hover:bg-[#b3e600] text-black font-bold px-6 py-3.5 rounded-xl transition shadow-[0_0_25px_rgba(204,255,0,0.3)] text-sm"
                >
                  Sign In to Account
                </Link>

                <button
                  onClick={handleQuickDemoLogin}
                  className="w-full inline-flex items-center justify-center gap-2 bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-white font-semibold px-6 py-3.5 rounded-xl transition text-sm"
                >
                  <Zap size={15} className="text-[#ccff00]" />
                  Instant Demo Mode (1-Click)
                </button>
              </div>

              <div className="mt-6 pt-6 border-t border-white/5 text-xs text-neutral-500">
                Don&apos;t have an account yet?{" "}
                <Link href="/register" className="text-[#ccff00] hover:underline font-semibold">
                  Register here
                </Link>
              </div>
            </div>
          </div>
        );
      }

      return (
        <div className="max-w-lg mx-auto mt-24 text-center">
          <div className="bg-[#0d0e10] border border-white/[0.08] rounded-2xl p-10 shadow-2xl">
            {isNoAccount ? (
              <>
                <Activity size={48} className="mx-auto text-[#ccff00] mb-4 opacity-80" />
                <h2 className="text-xl font-bold text-white mb-2">No Active Challenge</h2>
                <p className="text-neutral-400 mb-6 text-sm">
                  Start an evaluation challenge to unlock your real-time institutional dashboard.
                </p>
                <Link
                  href="/challenges"
                  className="inline-flex items-center gap-2 bg-[#ccff00] hover:bg-[#b3e600] text-black font-bold px-6 py-3 rounded-full transition shadow-[0_0_25px_rgba(204,255,0,0.3)]"
                >
                  <Zap size={16} /> Browse Challenges
                </Link>
              </>
            ) : (
              <>
                <AlertTriangle size={48} className="mx-auto text-amber-400 mb-4" />
                <h2 className="text-xl font-bold text-white mb-2">Dashboard Error</h2>
                <p className="text-neutral-400 mb-6 text-sm">{error}</p>
                <button
                  onClick={loadData}
                  className="inline-flex items-center gap-2 bg-[#1b1e24] hover:bg-[#252932] text-white px-6 py-3 rounded-lg font-semibold transition"
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

    const profit = parseFloat(String(summary.total_profit));
    const profitPositive = profit >= 0;
    const balanceNum = parseFloat(String(summary.current_balance));
    const equityNum = parseFloat(String(summary.current_equity));
    const accountSizeNum = parseFloat(String(summary.account_size)) || 100000;

    const dailyLossPct = Math.abs(((balanceNum - equityNum) / accountSizeNum) * 100);
    const maxDrawdownPct = Math.abs(((accountSizeNum - equityNum) / accountSizeNum) * 100);

    return (
      <div className="space-y-6">
        {summary.profit_target_achieved && (
          <Confetti recycle={false} numberOfPieces={350} gravity={0.15} />
        )}
        <DangerZoneBanner dailyUsedPct={dailyLossPct} maxUsedPct={maxDrawdownPct} />
        {/* ── Account header banner with Live Streaming Status ── */}
        <div className="bg-[#0d0e10] border border-white/[0.08] rounded-2xl p-6 shadow-xl relative overflow-hidden">
          {/* Neon glow orb top-right */}
          <div className="absolute -top-8 -right-8 w-48 h-48 rounded-full bg-[#ccff00]/[0.06] blur-3xl pointer-events-none" />
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 relative z-10">
            <div>
              <div className="flex flex-wrap items-center gap-2.5 mb-2">
                <span className={`text-xs font-bold px-3 py-1 rounded-full border ${statusBadge(summary.account_status)}`}>
                  {summary.account_status}
                </span>
                <span className="text-xs text-neutral-300 bg-white/[0.07] px-2.5 py-0.5 rounded-full font-medium">
                  {phaseLabel(summary.phase)}
                </span>

                {/* Real-time WebSocket connection badge */}
                {wsStatus === "connected" ? (
                  <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#ccff00]/10 border border-[#ccff00]/30 text-[#ccff00] text-xs font-semibold">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ccff00] opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-[#ccff00]"></span>
                    </span>
                    LIVE STREAM
                  </div>
                ) : wsStatus === "connecting" ? (
                  <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold">
                    <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
                    CONNECTING
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/[0.05] border border-white/10 text-neutral-400 text-xs font-semibold">
                    <span className="h-2 w-2 rounded-full bg-neutral-500" />
                    REST POLLING (60s)
                  </div>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">{summary.challenge_name}</h1>
              <p className="text-neutral-400 text-sm mt-1">
                Account Size: <span className="font-semibold text-white">{fmtCurrency(summary.account_size)}</span>
                {summary.challenge_start_date && (
                  <> &nbsp;·&nbsp; Started {summary.challenge_start_date}</>
                )}
                {summary.days_remaining !== null && (
                  <> &nbsp;·&nbsp; <span className="text-neutral-300">{summary.days_remaining} days remaining</span></>
                )}
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center gap-3">
              <TraderRankBadge phase={summary.phase} profit={profit} />
              <a
                href={BRAND.socials.discord}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs bg-[#5865F2]/15 text-[#c2c6fc] border border-[#5865F2]/30 px-3 py-2 rounded-xl font-bold hover:bg-[#5865F2]/25 hover:text-white transition"
                title="Join Official Discord Trading Floor"
              >
                <DiscordIcon className="w-3.5 h-3.5 text-[#858df9]" />
                <span className="hidden sm:inline">Discord Floor</span>
              </a>
              {summary.kyc_status !== "APPROVED" && (
                <Link
                  href="/kyc"
                  className="flex items-center gap-1.5 text-xs bg-amber-500/20 text-amber-400 border border-amber-500/30 px-3.5 py-2 rounded-xl font-medium hover:bg-amber-500/30 transition"
                >
                  <ShieldCheck size={14} /> Complete KYC
                </Link>
              )}
              {!summary.has_pending_payout && summary.kyc_status === "APPROVED" && (
                <button
                  onClick={() => { setPayoutSubmitted(false); setPayoutAmount(""); setPayoutAddress(""); setShowPayoutModal(true); }}
                  className="flex items-center gap-1.5 text-xs bg-[#ccff00]/15 text-[#ccff00] border border-[#ccff00]/30 px-3.5 py-2 rounded-xl font-bold hover:bg-[#ccff00]/25 transition"
                >
                  <CreditCard size={14} /> Request Payout
                </button>
              )}
              {summary.has_pending_payout && (
                <Link
                  href="/payouts"
                  className="flex items-center gap-1.5 text-xs bg-violet-500/20 text-violet-400 border border-violet-500/30 px-3.5 py-2 rounded-xl font-medium hover:bg-violet-500/30 transition"
                >
                  <Clock size={14} /> Payout Pending
                </Link>
              )}
              <Link
                href="/settings"
                title="Account Settings"
                className="flex items-center gap-1.5 text-xs bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-neutral-300 hover:text-white px-3 py-2 rounded-xl transition"
              >
                <Settings size={14} /> Settings
              </Link>
              <button
                onClick={loadData}
                title="Refresh Metrics"
                className="p-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-neutral-400 hover:text-white transition"
              >
                <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
              </button>
            </div>
          </div>
        </div>

        {/* ── MT5 Trading Account Credentials Card ── */}
        {summary.mt5_login && (
          <div className="bg-[#030712] border border-white/[0.08] border-l-4 border-l-[#ccff00] rounded-2xl p-5 shadow-xl">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[#ccff00] font-bold text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <Key size={13} /> MetaTrader 5 Account
                  </span>
                  <span className="text-neutral-500 text-xs">·</span>
                  <span className="text-neutral-400 text-xs font-mono">{summary.mt5_server || "RoboForex-Demo"}</span>
                </div>
                <p className="text-neutral-400 text-xs">
                  Connect using these credentials directly on the official MetaTrader 5 app (Windows, Mac, iOS, Android).
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#0d0e10] p-3 rounded-xl border border-white/[0.05]">
                <div>
                  <span className="text-neutral-500 text-[10px] uppercase font-bold block">Server</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="font-mono text-white text-xs font-bold truncate max-w-[110px]" title={summary.mt5_server || "RoboForex-Demo"}>
                      {summary.mt5_server || "RoboForex-Demo"}
                    </span>
                    <button
                      onClick={() => copyToClipboard(summary.mt5_server || "RoboForex-Demo", "server")}
                      className="text-neutral-500 hover:text-white transition"
                      title="Copy Server"
                    >
                      {copiedField === "server" ? <CheckCircle size={12} className="text-[#ccff00]" /> : <Copy size={12} />}
                    </button>
                  </div>
                </div>

                <div>
                  <span className="text-neutral-500 text-[10px] uppercase font-bold block">Login ID</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="font-mono text-[#ccff00] text-xs font-bold">{summary.mt5_login}</span>
                    <button
                      onClick={() => copyToClipboard(summary.mt5_login || "", "login")}
                      className="text-neutral-500 hover:text-white transition"
                      title="Copy Login"
                    >
                      {copiedField === "login" ? <CheckCircle size={12} className="text-[#ccff00]" /> : <Copy size={12} />}
                    </button>
                  </div>
                </div>

                <div>
                  <span className="text-neutral-500 text-[10px] uppercase font-bold block">Master Password</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="font-mono text-white text-xs font-semibold">
                      {showPassword ? (summary.mt5_password || "••••••••") : "••••••••"}
                    </span>
                    <button
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-neutral-500 hover:text-white transition"
                      title={showPassword ? "Hide Password" : "Show Password"}
                    >
                      {showPassword ? <EyeOff size={12} /> : <Eye size={12} />}
                    </button>
                    {summary.mt5_password && (
                      <button
                        onClick={() => copyToClipboard(summary.mt5_password || "", "pass")}
                        className="text-neutral-500 hover:text-white transition"
                        title="Copy Password"
                      >
                        {copiedField === "pass" ? <CheckCircle size={12} className="text-[#ccff00]" /> : <Copy size={12} />}
                      </button>
                    )}
                  </div>
                </div>

                <div>
                  <span className="text-neutral-500 text-[10px] uppercase font-bold block">Investor Pass</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="font-mono text-neutral-300 text-xs font-semibold">
                      {summary.mt5_investor_password || "Inv_ReadOnly"}
                    </span>
                    <button
                      onClick={() => copyToClipboard(summary.mt5_investor_password || "", "inv")}
                      className="text-neutral-500 hover:text-white transition"
                      title="Copy Investor Password"
                    >
                      {copiedField === "inv" ? <CheckCircle size={12} className="text-[#ccff00]" /> : <Copy size={12} />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Core metrics row with Framer Motion & Number Counters ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetricCard
            label="Current Balance"
            numericValue={balanceNum}
            icon={DollarSign}
            accent="blue"
          />
          <MetricCard
            label="Current Equity"
            numericValue={equityNum}
            sub={`${summary.open_positions} open position${summary.open_positions !== 1 ? "s" : ""}`}
            icon={Activity}
            accent="emerald"
          />
          <MetricCard
            label="Total Profit"
            numericValue={profit}
            prefix={profitPositive ? "+$" : "-$"}
            sub={`${profitPositive ? "+" : ""}${fmtPct(summary.total_profit_pct)} gain`}
            icon={profitPositive ? TrendingUp : TrendingDown}
            accent={profitPositive ? "emerald" : "red"}
            danger={!profitPositive}
          />
          <MetricCard
            label="Win Rate"
            numericValue={summary.win_rate_pct}
            prefix=""
            suffix="%"
            sub={`${summary.winning_trades}W / ${summary.losing_trades}L (${summary.total_trades} trades)`}
            icon={Target}
            accent="cyan"
          />
        </div>

        {/* ── Profit target progress ── */}
        <div className={`metric-card shadow-lg ${summary.profit_target_achieved ? "border-[#ccff00]/40" : ""}`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Award size={16} className="text-[#ccff00]" />
              <span className="text-white font-semibold text-sm">Profit Target Progress</span>
            </div>
            <span
              className={`text-xs font-bold font-mono px-2.5 py-0.5 rounded-full ${
                summary.profit_target_achieved
                  ? "bg-[#ccff00]/20 text-[#ccff00] border border-[#ccff00]/30"
                  : "bg-white/[0.05] text-neutral-400"
              }`}
            >
              {summary.profit_target_achieved ? "✓ Target Achieved!" : `${fmtPct(summary.profit_target_reached_pct)} completed`}
            </span>
          </div>
          <div className="w-full bg-[#16181d] rounded-full h-3 p-0.5 border border-white/5">
            <motion.div
              className={`h-2 rounded-full ${summary.profit_target_achieved ? "bg-[#ccff00]" : "bg-amber-400"}`}
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, Math.max(0, summary.profit_target_reached_pct))}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>
          <div className="flex justify-between text-xs text-neutral-400 mt-2 font-mono">
            <span>
              Realized P&L: {fmtCurrency(summary.total_profit)} ({fmtPct(summary.total_profit_pct)})
            </span>
            <span>Target Goal: {fmtPct(summary.profit_target_pct)}</span>
          </div>
        </div>

        {/* ── Navigation Tabs ── */}
        <div className="flex flex-wrap gap-2 pb-2 border-b border-white/[0.06]">
          {(
            [
              { id: "overview", label: "Overview & Charts", icon: "📊" },
              { id: "compliance", label: "Rule Compliance", icon: "🛡️" },
              { id: "journal", label: "Trading Journal", icon: "📓" },
              { id: "news", label: "Economic Calendar", icon: "📅" },
              { id: "performance", label: "Trade Ledger", icon: "📈" },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`calculator-tab text-xs sm:text-sm ${activeTab === t.id ? "active" : ""}`}
            >
              <span className="hidden sm:inline mr-1.5">{t.icon}</span>{t.label}
            </button>
          ))}
        </div>


        {/* ── Animated Tab Content ── */}
        <AnimatePresence mode="wait">
          {activeTab === "overview" && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {/* Drawdown gauges */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <DrawdownGauge
                  label="Daily Loss Drawdown"
                  limit={summary.daily_drawdown_limit_pct}
                  usedPct={summary.daily_drawdown_used_pct}
                />
                <DrawdownGauge
                  label="Maximum Overall Drawdown"
                  limit={summary.max_drawdown_limit_pct}
                  usedPct={summary.max_drawdown_used_pct}
                />
              </div>

              {/* Chart Switcher & View */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 bg-[#14161a] border border-white/10 p-1 rounded-xl text-xs">
                    <button
                      onClick={() => setChartMode("equity")}
                      className={`px-3 py-1.5 rounded-lg transition font-bold flex items-center gap-1.5 ${
                        chartMode === "equity"
                          ? "bg-[#ccff00] text-black shadow-sm"
                          : "text-neutral-400 hover:text-white"
                      }`}
                    >
                      <Activity size={13} />
                      <span>Equity Curve</span>
                    </button>
                    <button
                      onClick={() => setChartMode("candles")}
                      className={`px-3 py-1.5 rounded-lg transition font-bold flex items-center gap-1.5 ${
                        chartMode === "candles"
                          ? "bg-[#ccff00] text-black shadow-sm"
                          : "text-neutral-400 hover:text-white"
                      }`}
                    >
                      <BarChart2 size={13} />
                      <span>TradingView Candlesticks</span>
                    </button>
                  </div>
                </div>

                {chartMode === "equity" ? (
                  <InteractiveEquityChart
                    points={equityCurve}
                    startingBalance={accountSizeNum}
                  />
                ) : (
                  <TradingViewChart />
                )}
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
                  danger={parseFloat(String(summary.avg_loss_per_trade)) > 0}
                />
                <MetricCard
                  label="Profit Factor"
                  value={summary.profit_factor !== null ? summary.profit_factor.toFixed(2) : "—"}
                  sub={
                    summary.profit_factor !== null && summary.profit_factor >= 1.5
                      ? "High Edge"
                      : summary.profit_factor !== null && summary.profit_factor >= 1
                      ? "Profitable"
                      : "Developing"
                  }
                  icon={TrendingUp}
                  accent={summary.profit_factor !== null && summary.profit_factor >= 1 ? "emerald" : "red"}
                />
              </div>
            </motion.div>
          )}

          {activeTab === "compliance" && (
            <motion.div
              key="compliance"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center justify-between mb-4">
                <p className="text-neutral-400 text-sm">
                  All challenge objectives must remain in full compliance to qualify for funded allocation or payouts.
                </p>
                <Link href="/rules" className="text-[#ccff00] text-sm hover:underline inline-flex items-center gap-1 font-semibold">
                  Rule Handbook <ExternalLink size={13} />
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {summary.rule_compliance.map((rule) => (
                  <RuleComplianceCard key={rule.rule_name} rule={rule} />
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === "performance" && performance && (
            <motion.div
              key="performance"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
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
                <div className="bg-[#0d0e10] border border-white/[0.08] rounded-2xl overflow-hidden shadow-xl">
                  <table className="w-full text-sm">
                    <thead className="bg-white/[0.03]">
                      <tr>
                        <th className="text-left px-5 py-3.5 text-neutral-400 font-medium">Date</th>
                        <th className="text-right px-5 py-3.5 text-neutral-400 font-medium">Realized P&L</th>
                        <th className="text-right px-5 py-3.5 text-neutral-400 font-medium">Trades Executed</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.04]">
                      {performance.daily_breakdown.map((d) => {
                        const pnl = parseFloat(String(d.realized_pnl));
                        return (
                          <tr key={d.trade_date} className="hover:bg-white/[0.02] transition">
                            <td className="px-5 py-3.5 text-neutral-300 font-mono">{d.trade_date}</td>
                            <td
                              className={`px-5 py-3.5 text-right font-mono font-bold ${
                                pnl >= 0 ? "text-[#ccff00]" : "text-rose-400"
                              }`}
                            >
                              {pnl >= 0 ? "+" : ""}{fmtCurrency(d.realized_pnl)}
                            </td>
                            <td className="px-5 py-3.5 text-right text-neutral-400 font-mono">{d.trades_count}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="bg-[#0d0e10] border border-white/[0.08] rounded-2xl p-10 text-center text-neutral-500">
                  No trading days recorded yet. Open and close positions on MetaTrader 5 to populate this ledger.
                </div>
              )}
            </motion.div>
          )}

          {/* Trading Journal Tab */}
          {activeTab === "journal" && (
            <motion.div
              key="journal"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <TradingJournal />
            </motion.div>
          )}

          {/* Economic Calendar Tab */}
          {activeTab === "news" && (
            <motion.div
              key="news"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <EconomicCalendar />
            </motion.div>
          )}
        </AnimatePresence>


        {/* ── Footer row ── */}
        <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-neutral-500 pt-4 border-t border-white/[0.05] gap-2">
          <span>
            Last synced: <span className="font-mono text-neutral-400">{lastRefresh.toLocaleTimeString()}</span>
            &nbsp;·&nbsp; {wsStatus === "connected" ? "Real-time WebSocket streaming active" : "Auto-polling every 60s"}
          </span>
          <div className="flex gap-5">
            <Link href="/kyc" className="hover:text-neutral-300 transition flex items-center gap-1.5">
              <Shield size={12} /> KYC:{" "}
              <span className={summary.kyc_status === "APPROVED" ? "text-[#ccff00] font-semibold" : "text-amber-400 font-semibold"}>
                {summary.kyc_status}
              </span>
            </Link>
            <Link href="/payouts" className="hover:text-neutral-300 transition font-semibold text-[#ccff00]">
              Payouts Hub →
            </Link>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#070809] text-white pt-6 pb-16">
      <div className="max-w-6xl mx-auto px-4 py-4">{renderContent()}</div>

      {/* ── Payout Request Modal ── */}
      <AnimatePresence>
        {showPayoutModal && (
          <motion.div
            key="payout-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[99999] flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(12px)" }}
            onClick={() => setShowPayoutModal(false)}
          >
            <motion.div
              key="payout-modal-card"
              initial={{ opacity: 0, scale: 0.92, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 24 }}
              transition={{ type: "spring", stiffness: 280, damping: 24 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#0c0e12] border border-[#ccff00]/25 rounded-3xl p-8 shadow-[0_0_60px_rgba(204,255,0,0.12)] max-w-md w-full relative overflow-hidden"
            >
              {/* Glow orb */}
              <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-[#ccff00]/10 blur-3xl pointer-events-none" />

              {!payoutSubmitted ? (
                <>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-[#ccff00]/10 border border-[#ccff00]/30 flex items-center justify-center text-[#ccff00]">
                      <CreditCard size={18} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">Withdraw Profits</p>
                      <h3 className="text-xl font-black text-white tracking-tight">Request Payout</h3>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-neutral-400 block mb-1.5">USDT (TRC-20) Wallet Address</label>
                      <input
                        type="text"
                        value={payoutAddress}
                        onChange={(e) => setPayoutAddress(e.target.value)}
                        placeholder="T..."
                        className="w-full bg-[#14161c] border border-white/[0.08] focus:border-[#ccff00]/50 rounded-xl px-4 py-3 text-white font-mono text-sm outline-none transition placeholder-neutral-600"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-neutral-400 block mb-1.5">Payout Amount (USD)</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 font-bold text-sm">$</span>
                        <input
                          type="number"
                          value={payoutAmount}
                          onChange={(e) => setPayoutAmount(e.target.value)}
                          placeholder="0.00"
                          min="100"
                          className="w-full bg-[#14161c] border border-white/[0.08] focus:border-[#ccff00]/50 rounded-xl pl-8 pr-4 py-3 text-white font-mono text-sm outline-none transition placeholder-neutral-600"
                        />
                      </div>
                      <p className="text-[11px] text-neutral-500 mt-1.5">Minimum payout: \$100 · Processed within 24–48h</p>
                    </div>

                    <div className="bg-[#ccff00]/[0.04] border border-[#ccff00]/15 rounded-xl p-3.5 text-xs text-neutral-400 leading-relaxed">
                      ⚡ Payouts are processed in <span className="text-[#ccff00] font-semibold">USDT (TRC-20)</span>. Ensure your wallet address is correct — transactions are irreversible.
                    </div>

                    <button
                      onClick={() => {
                        if (!payoutAddress || !payoutAmount) return;
                        setPayoutSubmitted(true);
                      }}
                      disabled={!payoutAddress || !payoutAmount}
                      className="w-full bg-[#ccff00] hover:bg-[#b3e600] disabled:opacity-40 disabled:cursor-not-allowed text-black font-black py-3.5 rounded-xl transition shadow-[0_0_30px_rgba(204,255,0,0.3)] text-sm mt-1"
                    >
                      Submit Payout Request →
                    </button>
                    <button
                      onClick={() => setShowPayoutModal(false)}
                      className="w-full text-neutral-500 hover:text-neutral-300 text-xs py-2 transition"
                    >
                      Cancel
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center py-4">
                  <div className="w-16 h-16 rounded-full bg-[#ccff00]/10 border border-[#ccff00]/30 flex items-center justify-center mx-auto mb-5 text-[#ccff00]">
                    <CheckCircle size={32} />
                  </div>
                  <h3 className="text-2xl font-black text-white mb-2">Request Submitted!</h3>
                  <p className="text-neutral-400 text-sm mb-1">Your payout of <span className="text-[#ccff00] font-bold">\${payoutAmount}</span> USDT is being reviewed.</p>
                  <p className="text-neutral-500 text-xs mb-6">You will receive a confirmation email within 24–48 hours.</p>
                  <button
                    onClick={() => setShowPayoutModal(false)}
                    className="bg-[#ccff00] hover:bg-[#b3e600] text-black font-bold px-8 py-3 rounded-xl transition text-sm"
                  >
                    Done
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
