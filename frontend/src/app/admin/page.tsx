"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import {
  fetchSystemHealth,
  fetchAdminPoolSummary,
  SystemHealthData,
  MT5AccountPoolSummary,
} from "@/lib/api";
import {
  ShieldCheck,
  Database,
  Users,
  CreditCard,
  FileCheck,
  Bell,
  TrendingUp,
  Activity,
  ArrowRight,
  RefreshCw,
  Loader2,
  Sliders,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

/* ── Module definitions ─────────────────────────────────── */
const getModules = (
  pool: MT5AccountPoolSummary | null,
  health: SystemHealthData | null
) => [
  {
    title: "MT5 Account Pool",
    description: "Pre-generated demo accounts auto-assigned on checkout.",
    href: "/admin/pool",
    icon: Database,
    meta: pool ? `${pool.available_accounts} / ${pool.total_accounts} available` : "—",
    alert: pool?.available_accounts === 0,
  },
  {
    title: "Challenge Tiers & Pricing",
    description: "Configure balances, targets, drawdown rules, and fees.",
    href: "/admin/challenges",
    icon: Sliders,
    meta: health ? `${health.metrics.active_challenge_tiers} tiers active` : "—",
    alert: false,
  },
  {
    title: "Payout Approval Queue",
    description: "Review and process trader profit-split disbursements.",
    href: "/admin/payouts",
    icon: CreditCard,
    meta: health ? `${health.metrics.pending_payout_requests} pending` : "—",
    alert: !!(health && health.metrics.pending_payout_requests > 0),
  },
  {
    title: "Capital Allocation",
    description: "Monitor firm exposure, funded accounts, and reserves.",
    href: "/admin/capital",
    icon: TrendingUp,
    meta: "Risk control",
    alert: false,
  },
  {
    title: "KYC / Compliance",
    description: "Identity proofs, PEP/sanctions screening, AML review.",
    href: "/admin/compliance",
    icon: FileCheck,
    meta: "AML shield",
    alert: false,
  },
  {
    title: "Webhooks & Alerts",
    description: "Discord and Telegram bots for passes, breaches, payouts.",
    href: "/admin/notifications",
    icon: Bell,
    meta: "Discord / TG",
    alert: false,
  },
  {
    title: "System Health & Audit",
    description: "Uptime diagnostics, telemetry, and immutable audit logs.",
    href: "/admin/system",
    icon: Activity,
    meta: health?.status === "healthy" ? "● Operational" : "● Checking…",
    alert: health?.status !== "healthy",
  },
];

/* ── Stat card ──────────────────────────────────────────── */
function Stat({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
}) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">
          {label}
        </span>
        <Icon className="w-4 h-4 text-slate-600" />
      </div>
      <p className="text-2xl font-black text-white">{value}</p>
    </div>
  );
}

/* ── Page ───────────────────────────────────────────────── */
export default function AdminDashboardPage() {
  const [token, setToken] = useState<string | null>(null);
  const [health, setHealth] = useState<SystemHealthData | null>(null);
  const [pool, setPool] = useState<MT5AccountPoolSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const s = getSession();
    if (s?.isAdmin) setToken(s.token);
  }, []);

  const load = useCallback(async (t: string) => {
    setLoading(true);
    try {
      const [h, p] = await Promise.allSettled([
        fetchSystemHealth(),
        fetchAdminPoolSummary(t),
      ]);
      if (h.status === "fulfilled") setHealth(h.value);
      if (p.status === "fulfilled") setPool(p.value);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (token) load(token);
  }, [token, load]);

  const modules = getModules(pool, health);

  return (
    <div className="px-6 xl:px-10 py-8 space-y-8 max-w-[1300px] mx-auto">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-[#ccff00] mb-2">
            <ShieldCheck size={12} /> Mission Control
          </div>
          <h1 className="text-2xl font-extrabold text-white">Platform Administration</h1>
          <p className="text-slate-500 text-sm mt-1">
            Challenges · Account provisioning · Compliance · Payouts
          </p>
        </div>
        <button
          onClick={() => token && load(token)}
          disabled={loading}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition disabled:opacity-40 border border-slate-700 shrink-0"
        >
          {loading ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />}
          Refresh
        </button>
      </div>

      {/* ── Stats row ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat
          label="Registered traders"
          value={health?.metrics.total_registered_traders ?? "—"}
          icon={Users}
        />
        <Stat
          label="Active accounts"
          value={health?.metrics.active_trading_accounts ?? "—"}
          icon={TrendingUp}
        />
        <Stat
          label="Pool available"
          value={pool ? `${pool.available_accounts} / ${pool.total_accounts}` : "—"}
          icon={Database}
        />
        <Stat
          label="Pending payouts"
          value={health?.metrics.pending_payout_requests ?? "—"}
          icon={CreditCard}
        />
      </div>

      {/* ── System status strip ── */}
      {health && (
        <div
          className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border text-sm ${
            health.status === "healthy"
              ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-400"
              : "bg-amber-500/5 border-amber-500/20 text-amber-400"
          }`}
        >
          {health.status === "healthy" ? (
            <CheckCircle2 size={15} className="shrink-0" />
          ) : (
            <AlertTriangle size={15} className="shrink-0" />
          )}
          <span className="font-semibold text-xs">
            System {health.status} — database connected, API online.
          </span>
          <Link
            href="/admin/system"
            className="ml-auto text-xs underline underline-offset-4 opacity-60 hover:opacity-100 transition"
          >
            View diagnostics
          </Link>
        </div>
      )}

      {/* ── Modules grid ── */}
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-3">
        {modules.map((m) => {
          const Icon = m.icon;
          return (
            <Link
              key={m.href}
              href={m.href}
              className="group flex flex-col justify-between bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-5 transition-all duration-150"
            >
              {/* Top */}
              <div className="flex items-start justify-between mb-4">
                <div className="p-2.5 rounded-lg bg-slate-800 border border-slate-700">
                  <Icon className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
                </div>
                {m.alert && (
                  <span className="text-[10px] font-bold text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded-full">
                    Action needed
                  </span>
                )}
              </div>

              {/* Title + description */}
              <div className="flex-1">
                <h3 className="font-bold text-sm text-white group-hover:text-[#ccff00] transition-colors">
                  {m.title}
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">{m.description}</p>
              </div>

              {/* Footer */}
              <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between">
                <span className="text-[11px] text-slate-600 font-medium">{m.meta}</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-[#ccff00] group-hover:translate-x-0.5 transition-all" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
