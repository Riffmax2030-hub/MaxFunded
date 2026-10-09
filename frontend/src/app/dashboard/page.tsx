"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { getSession, clearSession, AuthSession } from "@/lib/auth";
import {
  fetchDashboardSummary,
  fetchEquityCurve,
  DashboardSummaryData,
  EquityPoint,
} from "@/lib/api";
import dynamic from "next/dynamic";
import { useDashboardWebSocket } from "@/hooks/useDashboardWebSocket";
import { BRAND } from "@/lib/branding";
import Logo from "@/components/Logo";
import TraderCalculatorModal, { CalculatorTab } from "@/components/TraderCalculatorModal";
import {
  Bell,
  Sun,
  Moon,
  ChevronDown,
  LogOut,
  User,
  ShieldCheck,
  CreditCard,
  Award,
  RefreshCw,
  ExternalLink,
  Lock,
  Copy,
  CheckCircle2,
  Eye,
  EyeOff,
  Activity,
  BarChart2,
  Calendar,
  Layers,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  Zap,
  HelpCircle,
  Gift,
  FileCheck2,
  Clock,
  Sparkles,
  Info,
  LayoutGrid,
  TrendingDown,
  Repeat2,
  Sigma,
  Newspaper,
} from "lucide-react";

const InteractiveEquityChart = dynamic(() => import("@/components/InteractiveEquityChart"), { ssr: false });
import TradingJournal from "@/components/TradingJournal";
import EconomicCalendar from "@/components/EconomicCalendar";

function fmtCurrency(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return "$0.00";
  const n = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(n)) return "$0.00";
  return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function TraderDashboard() {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [summary, setSummary] = useState<DashboardSummaryData | null>(null);
  const [equityCurve, setEquityCurve] = useState<EquityPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<"overview" | "calendar" | "history" | "platform">("overview");
  const [chartTimeframe, setChartTimeframe] = useState<"7 Days" | "30 Days" | "All">("7 Days");
  const [showBalanceDetails, setShowBalanceDetails] = useState(true);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [showLoginInfoModal, setShowLoginInfoModal] = useState(false);
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [payoutAddress, setPayoutAddress] = useState("");
  const [payoutAmount, setPayoutAmount] = useState("");
  const [payoutSubmitted, setPayoutSubmitted] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showCalcModal, setShowCalcModal] = useState(false);
  const [calcTab, setCalcTab] = useState<CalculatorTab>("margin");
  const [newsExpanded, setNewsExpanded] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const sess = getSession();
      setSession(sess);
      if (!sess) {
        throw new Error("Please log in to access your trading dashboard");
      }

      const sum = await fetchDashboardSummary();
      setSummary(sum);

      try {
        const eq = await fetchEquityCurve();
        setEquityCurve(eq);
      } catch {
        setEquityCurve([]);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // WebSocket Live Stream
  const { wsStatus } = useDashboardWebSocket({
    onUpdate: (data) => {
      if (data.summary) setSummary((prev) => (prev ? { ...prev, ...data.summary } : data.summary));
      if (data.equityCurve) setEquityCurve(data.equityCurve);
    },
  });

  const handleLogout = () => {
    clearSession();
    window.location.href = "/";
  };

  const handleQuickDemoLogin = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:8000/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "sherif@maxfunded.com", password: "Password123!" }),
      });
      if (!res.ok) throw new Error("Demo login failed");
      const data = await res.json();
      localStorage.setItem("mxf_token", data.access_token);
      localStorage.setItem("mxf_session", JSON.stringify(data));
      window.location.reload();
    } catch {
      window.location.href = "/login";
    }
  };

  const userInitial = session?.email ? session.email[0].toUpperCase() : "S";

  // Calculations
  const accountSizeNum = summary ? parseFloat(String(summary.account_size)) || 100000 : 100000;
  const balanceNum = summary ? parseFloat(String(summary.current_balance)) || accountSizeNum : accountSizeNum;
  const equityNum = summary ? parseFloat(String(summary.current_equity)) || balanceNum : balanceNum;
  const netProfit = equityNum - accountSizeNum;
  const profitTargetPct = summary ? summary.profit_target_pct || 10 : 10;
  const profitTargetAmt = Math.round(accountSizeNum * (profitTargetPct / 100));
  const dailyLossLimitPct = summary ? summary.daily_drawdown_limit_pct || 5 : 5;
  const dailyLossLimitAmt = Math.round(accountSizeNum * (dailyLossLimitPct / 100));
  const maxLossLimitPct = summary ? summary.max_drawdown_limit_pct || 10 : 10;
  const maxLossLimitAmt = Math.round(accountSizeNum * (maxLossLimitPct / 100));

  const dailyUsedAmt = Math.max(0, balanceNum - equityNum);
  const dailyRemainingAmt = Math.max(0, dailyLossLimitAmt - dailyUsedAmt);
  const maxUsedAmt = Math.max(0, accountSizeNum - equityNum);
  const maxRemainingAmt = Math.max(0, maxLossLimitAmt - maxUsedAmt);

  const profitProgressPct = Math.min(100, Math.max(0, (netProfit / profitTargetAmt) * 100));

  return (
    <div className="min-h-screen bg-[#07090e] text-white flex flex-col font-sans selection:bg-[#ccff00] selection:text-black">
      {/* ========================================================================= */}
      {/* 1. TOP NAVBAR (FundedNext Style) */}
      {/* ========================================================================= */}
      <header className="h-16 border-b border-white/[0.08] bg-[#090b11] px-4 sm:px-6 flex items-center justify-between sticky top-0 z-40">
        {/* Left: Logo & Sidebar Toggle */}
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center">
            <Logo size="md" />
          </Link>
        </div>

        {/* Center: Start Challenge Action Button */}
        <div className="hidden sm:flex items-center">
          <Link
            href="/challenges"
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#6366f1] to-[#4f46e5] hover:from-[#4f46e5] hover:to-[#4338ca] text-white font-extrabold text-xs sm:text-sm uppercase tracking-wider transition shadow-lg shadow-indigo-500/20 flex items-center gap-2"
          >
            <Zap className="w-4 h-4 fill-current text-[#ccff00]" />
            <span>Start Challenge</span>
          </Link>
        </div>

        {/* Right Corner: Bell, Sun/Moon, Circular Profile Button */}
        <div className="flex items-center gap-3">
          {/* Notification Bell */}
          <button
            className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-white/5 transition relative"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            <span className="w-2 h-2 rounded-full bg-[#ccff00] absolute top-1.5 right-1.5" />
          </button>

          {/* Theme Toggle Button */}
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-white/5 transition"
            title={isDarkMode ? "Light Mode" : "Dark Mode"}
          >
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          {/* Circular Profile Avatar Button & Dropdown */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#1e2330] to-[#2d3345] border-2 border-white/20 hover:border-[#ccff00] text-white font-bold flex items-center justify-center transition shadow-md"
              title="User Menu"
            >
              <span>{userInitial}</span>
            </button>

            {/* Profile Dropdown Menu (FundedNext Exact Spec) */}
            <AnimatePresence>
              {profileDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-64 rounded-2xl bg-[#0f1219] border border-white/10 shadow-2xl py-2 z-50 text-xs overflow-hidden"
                >
                  {/* Registration Email Header */}
                  <div className="px-4 py-3">
                    <p className="text-[10px] text-neutral-400 uppercase tracking-widest font-mono">Signed in as</p>
                    <p className="font-semibold text-white truncate mt-0.5" title={session?.email || "trader@maxfunded.com"}>
                      {session?.email || "trader@maxfunded.com"}
                    </p>
                  </div>

                  <div className="h-px bg-white/[0.08]" />

                  {/* Dark / Light Mode with Arrow */}
                  <button
                    onClick={() => setIsDarkMode(!isDarkMode)}
                    className="w-full px-4 py-3 text-left hover:bg-white/5 flex items-center justify-between text-neutral-300 hover:text-white transition"
                  >
                    <div className="flex items-center gap-2.5">
                      {isDarkMode ? <Moon className="w-4 h-4 text-indigo-400" /> : <Sun className="w-4 h-4 text-amber-400" />}
                      <span>{isDarkMode ? "Dark Mode" : "Light Mode"}</span>
                    </div>
                    <span className="text-[10px] font-mono text-neutral-500 uppercase">On ›</span>
                  </button>

                  <div className="h-px bg-white/[0.08]" />

                  {/* Refer and Earn */}
                  <Link
                    href="/affiliates"
                    onClick={() => setProfileDropdownOpen(false)}
                    className="w-full px-4 py-3 text-left hover:bg-white/5 flex items-center gap-2.5 text-neutral-300 hover:text-white transition"
                  >
                    <Gift className="w-4 h-4 text-[#ccff00]" />
                    <span>Refer & Earn (45% Off)</span>
                  </Link>

                  {/* Profile */}
                  <Link
                    href="/settings"
                    onClick={() => setProfileDropdownOpen(false)}
                    className="w-full px-4 py-3 text-left hover:bg-white/5 flex items-center gap-2.5 text-neutral-300 hover:text-white transition"
                  >
                    <User className="w-4 h-4 text-sky-400" />
                    <span>Profile & Security</span>
                  </Link>

                  <div className="h-px bg-white/[0.08]" />

                  {/* Logout */}
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-3 text-left hover:bg-rose-500/10 flex items-center gap-2.5 text-rose-400 hover:text-rose-300 transition"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Log Out</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. MAIN LAYOUT: SIDEBAR + CONTENT AREA */}
      {/* ========================================================================= */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT SIDEBAR (FundedNext "MENUBAR") */}
        <aside
          className={`border-r border-white/[0.08] bg-[#080a10] p-4 flex flex-col justify-between transition-all duration-300 overflow-y-auto ${
            sidebarCollapsed ? "w-16" : "w-64"
          } hidden lg:flex shrink-0`}
        >
          <div className="space-y-6">
            <div className="px-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-500 font-bold">
                {!sidebarCollapsed && "MENUBAR"}
              </span>
            </div>

            <nav className="space-y-1">
              {[
                { label: "Accounts", href: "/dashboard", icon: Layers, active: true },
                { label: "Payout", href: "/payouts", icon: CreditCard, active: false },
                { label: "Refer & Earn", href: "/affiliates", icon: Gift, active: false },
                { label: "Competitions", href: "/leaderboard", icon: Award, active: false },
                { label: "Certificates", href: "/certificates", icon: FileCheck2, active: false },
                { label: "Trading Rules", href: "/rules", icon: ShieldCheck, active: false },
                { label: "Conditions", href: "/trading-conditions", icon: Activity, active: false },
                { label: "Help & Support", href: "/contact", icon: HelpCircle, active: false },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={`flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs font-semibold transition ${
                      item.active
                        ? "bg-[#6366f1]/20 text-[#a5b4fc] border border-[#6366f1]/30 font-bold"
                        : "text-neutral-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${item.active ? "text-[#ccff00]" : "text-neutral-400"}`} />
                    {!sidebarCollapsed && <span>{item.label}</span>}
                  </Link>
                );
              })}
          </nav>

          {/* ---- ECONOMIC NEWS STRIP (FundedNext sidebar style) ---- */}
          {!sidebarCollapsed && (
            <div className="mt-2">
              <div className="flex items-center justify-between mb-2 px-1">
                <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-500 font-bold flex items-center gap-1.5">
                  <Newspaper className="w-3 h-3" /> News
                </span>
                <button
                  onClick={() => setNewsExpanded(!newsExpanded)}
                  className="text-[10px] text-indigo-400 hover:text-indigo-200 transition font-semibold"
                >
                  {newsExpanded ? "Less ↑" : "More ↓"}
                </button>
              </div>

              {/* Day Strip */}
              <div className="flex gap-1 mb-2.5">
                {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => {
                  const today = new Date().getDay(); // 0=Sun
                  const isToday = i === today;
                  return (
                    <div key={i} className="flex flex-col items-center gap-0.5 flex-1">
                      <span className={`text-[9px] font-bold ${isToday ? "text-[#ccff00]" : "text-neutral-500"}`}>
                        {d}
                      </span>
                      <div
                        className={`w-1.5 h-1.5 rounded-full ${
                          isToday
                            ? "bg-[#ccff00]"
                            : i < today
                            ? "bg-indigo-500"
                            : "bg-neutral-700"
                        }`}
                      />
                    </div>
                  );
                })}
              </div>

              {/* Economic Events List */}
              <div className="space-y-1.5">
                {[
                  { name: "US Nonfarm Payrolls", time: "13:30", ccy: "USD", impact: "high" },
                  { name: "ECB Rate Decision", time: "12:45", ccy: "EUR", impact: "high" },
                  { name: "Japan CPI y/y", time: "23:30", ccy: "JPY", impact: "med" },
                  { name: "UK Retail Sales", time: "06:00", ccy: "GBP", impact: "med" },
                  { name: "CAD GDP m/m", time: "12:30", ccy: "CAD", impact: "low" },
                  { name: "AUS Employment", time: "00:30", ccy: "AUD", impact: "med" },
                ]
                  .slice(0, newsExpanded ? 6 : 3)
                  .map((ev, i) => (
                    <div key={i} className="flex items-center justify-between gap-2 px-2 py-1.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] transition cursor-default">
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-semibold text-neutral-200 truncate leading-tight">
                          {ev.name}
                        </p>
                        <p className="text-[9px] text-neutral-500 font-mono mt-0.5">{ev.time}</p>
                      </div>
                      <span
                        className={`shrink-0 px-1.5 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider ${
                          ev.impact === "high"
                            ? "bg-rose-500/20 text-rose-300"
                            : ev.impact === "med"
                            ? "bg-amber-500/20 text-amber-300"
                            : "bg-neutral-700/40 text-neutral-400"
                        }`}
                      >
                        {ev.ccy}
                      </span>
                    </div>
                  ))}
              </div>

              <button
                onClick={() => setNewsExpanded(!newsExpanded)}
                className="mt-2 w-full text-center text-[10px] text-indigo-400 hover:text-indigo-200 transition font-semibold py-1"
              >
                {newsExpanded ? "Show less" : "+ 12 upcoming news"}
              </button>
            </div>
          )}

          {/* ---- CALCULATOR LAUNCHER (FundedNext sidebar style) ---- */}
          {!sidebarCollapsed && (
            <div className="mt-1">
              <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-500 font-bold px-1 mb-2 block">
                Calculator
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { tab: "margin" as CalculatorTab, label: "Margin", Icon: LayoutGrid },
                  { tab: "profit" as CalculatorTab, label: "Profit/Loss", Icon: TrendingDown },
                  { tab: "lotsize" as CalculatorTab, label: "Lot Size", Icon: Sigma },
                  { tab: "swap" as CalculatorTab, label: "Swap", Icon: Repeat2 },
                ].map(({ tab, label, Icon }) => (
                  <button
                    key={tab}
                    onClick={() => { setCalcTab(tab); setShowCalcModal(true); }}
                    className="flex flex-col items-center gap-1.5 py-2.5 px-2 rounded-2xl bg-white/[0.03] hover:bg-indigo-500/10 hover:border-indigo-500/30 border border-white/5 transition group"
                  >
                    <Icon className="w-4 h-4 text-neutral-400 group-hover:text-indigo-300 transition" />
                    <span className="text-[9px] font-semibold text-neutral-400 group-hover:text-white transition leading-tight text-center">
                      {label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Brokerage Bottom Pill (FundedNext Style) */}
        {!sidebarCollapsed && (
          <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between text-xs">
            <div>
              <p className="font-bold text-white text-xs flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#ccff00] animate-pulse" />
                MaxFunded LP
              </p>
              <p className="text-[10px] text-neutral-400 mt-0.5">Tier-1 MT5 Liquidity</p>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-neutral-500" />
          </div>
        )}
      </aside>

      {/* Calculator Modal — rendered at root level to overlay everything */}
      <TraderCalculatorModal
        isOpen={showCalcModal}
        onClose={() => setShowCalcModal(false)}
        defaultTab={calcTab}
        accountSize={accountSizeNum}
      />

      {/* MAIN WORKSPACE */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-xs text-neutral-400 font-medium">
          <Link href="/" className="hover:text-white">Accounts</Link>
          <span>›</span>
          <span className="text-white font-semibold">Account Overview</span>
        </div>


          {/* Auth State Warning if no session */}
          {error && !summary && (
            <div className="p-6 rounded-2xl bg-[#0e1017] border border-white/10 text-center space-y-4">
              <h3 className="text-lg font-bold text-white">Sign In to View Live Account</h3>
              <p className="text-neutral-400 text-xs max-w-md mx-auto">
                Connect your MaxFunded credentials to monitor your live MT5 balance, drawdown limits, and request payouts.
              </p>
              <div className="flex justify-center gap-3">
                <button
                  onClick={handleQuickDemoLogin}
                  className="px-6 py-2.5 rounded-xl bg-[#ccff00] hover:bg-[#b8e600] text-black font-extrabold text-xs uppercase"
                >
                  ⚡ Fill Demo Account (1-Click)
                </button>
                <Link
                  href="/login"
                  className="px-6 py-2.5 rounded-xl bg-white/10 text-white font-bold text-xs"
                >
                  Log In
                </Link>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 3. ACCOUNT HEADER CARD (FundedNext Style) */}
          {/* ========================================================================= */}
          <div className="rounded-3xl bg-[#0c0e15] border border-white/[0.08] p-5 sm:p-6 shadow-xl relative overflow-hidden">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              {/* Left & Middle Info */}
              <div className="flex flex-wrap items-center gap-5">
                {/* Purple Challenge Badge Box */}
                <div className="w-36 h-24 rounded-2xl bg-gradient-to-br from-[#3b1754] to-[#1c0d2b] border border-[#a855f7]/30 p-3.5 flex flex-col justify-between shadow-lg">
                  <div>
                    <span className="text-[10px] font-bold text-purple-300 uppercase tracking-widest block">
                      {summary?.phase === "FUNDED" ? "Funded Tier" : "Evaluation"}
                    </span>
                    <span className="text-xl font-black text-white font-mono">
                      {summary ? `$${(accountSizeNum / 1000).toFixed(0)}K` : "$100K"}
                    </span>
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-wider text-purple-400">
                    CHALLENGE
                  </span>
                </div>

                {/* Account Details */}
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-xl sm:text-2xl font-black text-white font-mono tracking-tight">
                      Login ID : {summary?.mt5_login || "35172367"}
                    </h2>
                    <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase">
                      {summary?.account_status || "Active"}
                    </span>
                    <span className="text-xs text-neutral-400 font-mono font-semibold flex items-center gap-1">
                      <BarChart2 className="w-3 h-3 text-[#ccff00]" /> MT5
                    </span>
                    <span className="text-xs text-neutral-400 font-mono font-semibold">
                      ⇄ Swap Free
                    </span>
                  </div>

                  <p className="text-xs text-neutral-400 flex items-center gap-1.5 font-mono">
                    <Clock className="w-3.5 h-3.5 text-neutral-500" />
                    <span>Trading Cycle: Zero Time Limits • 0 Minimum Trading Days Required</span>
                  </p>
                </div>
              </div>

              {/* Right Action: Login Info Button */}
              <div className="flex items-center gap-3 self-start lg:self-center">
                <button
                  onClick={() => setShowLoginInfoModal(true)}
                  className="px-5 py-3 rounded-2xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 hover:border-white/20 text-white font-bold text-xs flex items-center gap-2 transition"
                >
                  <Lock className="w-3.5 h-3.5 text-[#ccff00]" />
                  <span>Login Info</span>
                </button>

                <button
                  onClick={loadData}
                  className="p-3 rounded-2xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-neutral-400 hover:text-white transition"
                  title="Refresh metrics"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
                </button>
              </div>
            </div>

            {/* Secondary Sub-Tabs Strip (Overview, Calendar, History, Platform) */}
            <div className="mt-6 pt-4 border-t border-white/[0.06] flex items-center gap-6 text-xs font-bold">
              {[
                { id: "overview", label: "Overview" },
                { id: "calendar", label: "Calendar" },
                { id: "history", label: "History" },
                { id: "platform", label: "Platform" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveSubTab(tab.id as any)}
                  className={`pb-2 relative transition ${
                    activeSubTab === tab.id
                      ? "text-[#ccff00]"
                      : "text-neutral-400 hover:text-white"
                  }`}
                >
                  <span>{tab.label}</span>
                  {activeSubTab === tab.id && (
                    <motion.div
                      layoutId="subTabIndicator"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#ccff00]"
                    />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 4. TRADING OBJECTIVES 4-CARD STRIP (FundedNext Exact Layout) */}
          {/* ========================================================================= */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-2 text-neutral-400">
                <span className="font-bold text-white uppercase tracking-wider">Trading Objectives</span>
                <span>•</span>
                <span className="px-2 py-0.5 rounded-md bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 font-semibold">
                  Refresh in 4 Min : 19 Sec
                </span>
              </div>
              <button
                onClick={loadData}
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-300 text-xs transition"
              >
                <RefreshCw className="w-3 h-3 text-[#ccff00]" />
                <span>Refresh</span>
              </button>
            </div>

            {/* 4 Objective Bento Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Card 1: Profit Target */}
              <div className="bento-card bg-[#0b0d13] border border-white/10 rounded-2xl p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-neutral-400 text-xs mb-1">
                    <span className="font-medium flex items-center gap-1">Profit target <Info className="w-3 h-3 text-neutral-500" /></span>
                  </div>
                  <div className="text-2xl font-black text-white font-mono mb-4">
                    ${profitTargetAmt.toLocaleString()}
                  </div>

                  {/* Tick Marks Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-[10px] font-mono text-neutral-500 mb-1">
                      <span className="text-[#ccff00] font-bold">{profitProgressPct.toFixed(0)}%</span>
                      <span>100%</span>
                    </div>
                    <div className="h-4 rounded-md bg-white/[0.04] p-0.5 border border-white/5 flex items-center overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-[#ccff00] rounded-sm transition-all duration-500"
                        style={{ width: `${profitProgressPct}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-white/5 text-xs text-neutral-400 flex justify-between font-mono">
                  <span>Result:</span>
                  <span className="font-bold text-white">${Math.max(0, netProfit).toLocaleString()}</span>
                </div>
              </div>

              {/* Card 2: Min Trading Days */}
              <div className="bento-card bg-[#0b0d13] border border-white/10 rounded-2xl p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-neutral-400 text-xs mb-1">
                    <span className="font-medium flex items-center gap-1">Min trading days <Info className="w-3 h-3 text-neutral-500" /></span>
                  </div>
                  <div className="text-2xl font-black text-white font-mono mb-4">
                    0 Days <span className="text-xs font-normal text-[#ccff00]">(No Min)</span>
                  </div>

                  {/* Segmented Progress Pills */}
                  <div className="mb-4 pt-3">
                    <div className="grid grid-cols-3 gap-2">
                      <div className="h-4 rounded-md bg-[#ccff00]/20 border border-[#ccff00]/40 flex items-center justify-center">
                        <CheckCircle2 className="w-3 h-3 text-[#ccff00]" />
                      </div>
                      <div className="h-4 rounded-md bg-[#ccff00]/20 border border-[#ccff00]/40 flex items-center justify-center">
                        <CheckCircle2 className="w-3 h-3 text-[#ccff00]" />
                      </div>
                      <div className="h-4 rounded-md bg-[#ccff00]/20 border border-[#ccff00]/40 flex items-center justify-center">
                        <CheckCircle2 className="w-3 h-3 text-[#ccff00]" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-white/5 text-xs text-neutral-400 flex justify-between font-mono">
                  <span>Result:</span>
                  <span className="font-bold text-[#ccff00]">Pass Immediately</span>
                </div>
              </div>

              {/* Card 3: Daily Loss Limit (-5%) */}
              <div className="bento-card bg-[#0b0d13] border border-white/10 rounded-2xl p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-neutral-400 text-xs mb-1">
                    <span className="font-medium flex items-center gap-1">Daily loss limit (-5%) <Info className="w-3 h-3 text-neutral-500" /></span>
                  </div>
                  <div className="text-2xl font-black text-white font-mono mb-4">
                    ${dailyLossLimitAmt.toLocaleString()}
                  </div>

                  {/* Gauge Tick Bars */}
                  <div className="mb-4">
                    <div className="flex justify-between text-[10px] font-mono text-neutral-500 mb-1">
                      <span>0%</span>
                      <span>Safe Buffer</span>
                    </div>
                    <div className="h-4 rounded-md bg-white/[0.04] p-0.5 border border-white/5 flex items-center overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-sm"
                        style={{ width: `${Math.min(100, (dailyUsedAmt / dailyLossLimitAmt) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-white/5 text-xs text-neutral-400 flex justify-between font-mono">
                  <span>Remaining:</span>
                  <span className="font-bold text-white">${dailyRemainingAmt.toLocaleString()}</span>
                </div>
              </div>

              {/* Card 4: Max Loss Limit (-10%) */}
              <div className="bento-card bg-[#0b0d13] border border-white/10 rounded-2xl p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-neutral-400 text-xs mb-1">
                    <span className="font-medium flex items-center gap-1">Max loss limit (-10%) <Info className="w-3 h-3 text-neutral-500" /></span>
                  </div>
                  <div className="text-2xl font-black text-white font-mono mb-4">
                    ${maxLossLimitAmt.toLocaleString()}
                  </div>

                  {/* Gauge Tick Bars */}
                  <div className="mb-4">
                    <div className="flex justify-between text-[10px] font-mono text-neutral-500 mb-1">
                      <span>0%</span>
                      <span>Static 10% Buffer</span>
                    </div>
                    <div className="h-4 rounded-md bg-white/[0.04] p-0.5 border border-white/5 flex items-center overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-sm"
                        style={{ width: `${Math.min(100, (maxUsedAmt / maxLossLimitAmt) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-white/5 text-xs text-neutral-400 flex justify-between font-mono">
                  <span>Remaining:</span>
                  <span className="font-bold text-white">${maxRemainingAmt.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 5. CURRENT BALANCE & EQUITY OVERVIEW PANEL */}
          {/* ========================================================================= */}
          <div className="bento-card bg-[#0b0d13] border border-white/10 rounded-3xl p-6 shadow-xl">
            <div className="flex items-center justify-between pb-4 border-b border-white/5 mb-5">
              <h3 className="text-base font-extrabold text-white">Current balance</h3>
              <button
                onClick={() => setShowBalanceDetails(!showBalanceDetails)}
                className="text-xs text-neutral-400 hover:text-white flex items-center gap-1 font-mono transition"
              >
                <span>{showBalanceDetails ? "Hide details" : "Show details"}</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showBalanceDetails ? "rotate-180" : ""}`} />
              </button>
            </div>

            {showBalanceDetails && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 font-mono text-sm">
                <div>
                  <span className="text-neutral-500 text-xs block mb-1">Initial balance</span>
                  <span className="text-white font-bold text-base sm:text-lg">
                    {fmtCurrency(accountSizeNum)}
                  </span>
                </div>
                <div>
                  <span className="text-neutral-500 text-xs block mb-1">Equity</span>
                  <span className="text-white font-bold text-base sm:text-lg">
                    {fmtCurrency(equityNum)}
                  </span>
                </div>
                <div>
                  <span className="text-neutral-500 text-xs block mb-1">Profit/Loss</span>
                  <span className={`font-bold text-base sm:text-lg ${netProfit >= 0 ? "text-[#ccff00]" : "text-rose-400"}`}>
                    {netProfit >= 0 ? "+" : ""}{fmtCurrency(netProfit)}
                  </span>
                </div>
                <div>
                  <span className="text-neutral-500 text-xs block mb-1">Floating Profit/Loss</span>
                  <span className={`font-bold text-base sm:text-lg ${(equityNum - balanceNum) >= 0 ? "text-[#ccff00]" : "text-rose-400"}`}>
                    {(equityNum - balanceNum) >= 0 ? "+" : ""}{fmtCurrency(equityNum - balanceNum)}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* ========================================================================= */}
          {/* 6. ACCOUNT STATUS & EQUITY CHART CONTAINER */}
          {/* ========================================================================= */}
          <div className="bento-card bg-[#0b0d13] border border-white/10 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-white">Account Status</h3>
              <div className="flex items-center gap-2">
                <select
                  value={chartTimeframe}
                  onChange={(e) => setChartTimeframe(e.target.value as any)}
                  className="bg-[#14161f] border border-white/10 rounded-xl px-3 py-1.5 text-xs font-mono text-white outline-none"
                >
                  <option value="7 Days">7 Days</option>
                  <option value="30 Days">30 Days</option>
                  <option value="All">All Time</option>
                </select>
              </div>
            </div>

            {/* When No Trades Have Occurred (FundedNext Empty State) */}
            {equityCurve.length === 0 ? (
              <div className="h-72 rounded-2xl bg-[#07090e] border border-white/5 flex flex-col items-center justify-center text-center p-6">
                <BarChart2 className="w-12 h-12 text-neutral-600 mb-3 stroke-[1.5]" />
                <p className="text-neutral-300 font-mono text-sm font-bold">No data available</p>
                <p className="text-neutral-500 text-xs mt-1 max-w-sm">
                  Execute your first position on your MetaTrader 5 account to populate real-time equity curves and drawdown analytics.
                </p>
              </div>
            ) : (
              <InteractiveEquityChart points={equityCurve} startingBalance={accountSizeNum} />
            )}
          </div>

          {/* Sub-Tab Viewers for Calendar & History */}
          {activeSubTab === "calendar" && (
            <div className="bento-card bg-[#0b0d13] border border-white/10 rounded-3xl p-6">
              <EconomicCalendar />
            </div>
          )}

          {activeSubTab === "history" && (
            <div className="bento-card bg-[#0b0d13] border border-white/10 rounded-3xl p-6">
              <TradingJournal />
            </div>
          )}
        </main>
      </div>

      {/* ========================================================================= */}
      {/* 7. LOGIN INFO MODAL (MT5 CREDENTIALS) */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {showLoginInfoModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
            onClick={() => setShowLoginInfoModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#0e1118] border border-white/15 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative"
            >
              <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
                <div className="flex items-center gap-2.5">
                  <Lock className="w-5 h-5 text-[#ccff00]" />
                  <h3 className="text-lg font-bold text-white">MetaTrader 5 Credentials</h3>
                </div>
                <button
                  onClick={() => setShowLoginInfoModal(false)}
                  className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4 font-mono text-xs">
                {/* Server */}
                <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-neutral-500 uppercase block mb-0.5">Server Name</span>
                    <span className="text-white font-bold">{summary?.mt5_server || "RoboForex-Demo"}</span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(summary?.mt5_server || "RoboForex-Demo", "server")}
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-300"
                  >
                    {copiedField === "server" ? <CheckCircle2 className="w-4 h-4 text-[#ccff00]" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>

                {/* Login ID */}
                <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-neutral-500 uppercase block mb-0.5">Account Login</span>
                    <span className="text-[#ccff00] font-black text-sm">{summary?.mt5_login || "35172367"}</span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(summary?.mt5_login || "35172367", "login")}
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-300"
                  >
                    {copiedField === "login" ? <CheckCircle2 className="w-4 h-4 text-[#ccff00]" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>

                {/* Master Password */}
                <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-neutral-500 uppercase block mb-0.5">Master Trader Password</span>
                    <span className="text-white font-bold">
                      {showPassword ? (summary?.mt5_password || "Mxf_LivePass2026!") : "••••••••••••"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setShowPassword(!showPassword)}
                      className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-300"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => copyToClipboard(summary?.mt5_password || "Mxf_LivePass2026!", "pass")}
                      className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-300"
                    >
                      {copiedField === "pass" ? <CheckCircle2 className="w-4 h-4 text-[#ccff00]" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Investor Password */}
                <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-neutral-500 uppercase block mb-0.5">Investor Password (Read-Only)</span>
                    <span className="text-neutral-300 font-bold">{summary?.mt5_investor_password || "Inv_ReadOnly2026"}</span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(summary?.mt5_investor_password || "Inv_ReadOnly2026", "inv")}
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-300"
                  >
                    {copiedField === "inv" ? <CheckCircle2 className="w-4 h-4 text-[#ccff00]" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-white/10 flex gap-3">
                <a
                  href="https://www.metatrader5.com/en/download"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-3 rounded-xl bg-[#ccff00] hover:bg-[#b8e600] text-black font-extrabold text-xs text-center uppercase tracking-wider transition"
                >
                  Download MetaTrader 5
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
