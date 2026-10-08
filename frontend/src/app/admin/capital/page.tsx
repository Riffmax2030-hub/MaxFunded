"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Loader2, RefreshCw } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface BrokerAccount {
  id: string;
  broker_name: string;
  broker_type: string;
  account_number: string;
  server_address: string | null;
  currency: string;
  balance: number;
  equity: number;
  margin_used: number;
  free_margin: number;
  max_capital_allocation: number;
  current_allocation: number;
  status: "CONNECTED" | "DISCONNECTED" | "MAINTENANCE" | "ERROR";
  is_active: boolean;
}

interface LeaderboardEntry {
  rank: number;
  purchase_id: string;
  user_id: string;
  signal_score: number;
  win_rate_percentage: number;
  profit_factor: number;
  consistency_rating: string;
  is_eligible_for_copy: boolean;
  total_trades_analyzed: number;
}

interface AllocationStrategy {
  id: string;
  name: string;
  description: string | null;
  broker_account_id: string;
  min_signal_score: number;
  max_allocated_capital: number;
  lot_multiplier: number;
  status: "ACTIVE" | "PAUSED" | "STOPPED";
  allowed_symbols: string[];
}

interface OrderExecution {
  id: string;
  symbol: string;
  side: string;
  executed_lots: number;
  open_price: number;
  close_price: number | null;
  realized_profit: number;
  status: string;
  open_time: string;
  broker_ticket: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function apiFetch<T>(path: string, token: string): Promise<T> {
  const res = await fetch(`${API}/api/v1${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json();
}

async function apiPatch<T>(path: string, token: string, body: object): Promise<T> {
  const res = await fetch(`${API}/api/v1${path}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json();
}

function fmt(val: number, decimals = 2) {
  return val?.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    CONNECTED: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    ACTIVE: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    DISCONNECTED: "bg-red-500/20 text-red-400 border-red-500/30",
    ERROR: "bg-red-500/20 text-red-400 border-red-500/30",
    PAUSED: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    STOPPED: "bg-slate-500/20 text-slate-400 border-slate-500/30",
    MAINTENANCE: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    OPEN: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    CLOSED: "bg-slate-500/20 text-slate-400 border-slate-500/30",
  };
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${
        colors[status] ?? "bg-slate-500/20 text-slate-400 border-slate-500/30"
      }`}
    >
      {status}
    </span>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AdminCapitalPage() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"brokers" | "leaderboard" | "strategies" | "executions">("brokers");

  const [brokers, setBrokers] = useState<BrokerAccount[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [strategies, setStrategies] = useState<AllocationStrategy[]>([]);
  const [executions, setExecutions] = useState<OrderExecution[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load token from localStorage
  useEffect(() => {
    const t = localStorage.getItem("access_token");
    if (!t) router.push("/login");
    else setToken(t);
  }, [router]);

  const loadAll = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const [b, lb, s, e] = await Promise.all([
        apiFetch<BrokerAccount[]>("/capital/broker-accounts", token),
        apiFetch<LeaderboardEntry[]>("/capital/leaderboard?limit=20", token),
        apiFetch<AllocationStrategy[]>("/capital/strategies", token),
        apiFetch<OrderExecution[]>("/capital/executions?limit=50", token),
      ]);
      setBrokers(b);
      setLeaderboard(lb);
      setStrategies(s);
      setExecutions(e);
    } catch (err: any) {
      setError(err.message ?? "Failed to load capital data");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  async function toggleStrategy(strategyId: string, currentStatus: string) {
    if (!token) return;
    const next = currentStatus === "ACTIVE" ? "PAUSED" : "ACTIVE";
    try {
      await apiPatch(`/capital/strategies/${strategyId}/status`, token, { status: next });
      await loadAll();
    } catch {
      alert("Failed to update strategy status");
    }
  }

  // ─── Summary Cards ──────────────────────────────────────────────────────────

  const totalBalance = brokers.reduce((s, b) => s + b.balance, 0);
  const totalEquity = brokers.reduce((s, b) => s + b.equity, 0);
  const totalMarginUsed = brokers.reduce((s, b) => s + b.margin_used, 0);
  const eligibleSignals = leaderboard.filter((e) => e.is_eligible_for_copy).length;
  const totalRealizedPnl = executions
    .filter((e) => e.status === "CLOSED")
    .reduce((s, e) => s + e.realized_profit, 0);

  const tabs = [
    { key: "brokers", label: "Broker Accounts", count: brokers.length },
    { key: "leaderboard", label: "Signal Leaderboard", count: leaderboard.length },
    { key: "strategies", label: "Strategies", count: strategies.length },
    { key: "executions", label: "Execution Journal", count: executions.length },
  ];

  if (!token) return null;

  return (
    <div className="pb-20 px-6 xl:px-10 pt-8 text-slate-100">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Capital Allocation Console</h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Internal company capital operations — isolated from retail trader evaluation
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={loadAll}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold transition disabled:opacity-40"
          >
            {loading ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />}
            Refresh
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto space-y-6">
        {/* ── Warning Banner ── */}
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
          <div className="flex items-start gap-3">
            <span className="text-amber-400 text-lg mt-0.5">⚠</span>
            <div>
              <p className="text-amber-300 font-semibold text-sm">Company Capital — Strictly Isolated System</p>
              <p className="text-amber-400/80 text-xs mt-1">
                This panel manages real company funds on connected broker accounts. Profits generated
                here belong exclusively to company capital reserves and are{" "}
                <strong>never automatically paid to traders</strong>. Shadow copy orders are triggered
                by internal signal scoring only.
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* ── Summary Cards ── */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { label: "Total Balance", value: `$${fmt(totalBalance)}`, color: "text-emerald-400" },
            { label: "Total Equity", value: `$${fmt(totalEquity)}`, color: "text-blue-400" },
            { label: "Margin Used", value: `$${fmt(totalMarginUsed)}`, color: "text-amber-400" },
            { label: "Eligible Signals", value: String(eligibleSignals), color: "text-violet-400" },
            {
              label: "Realized P&L",
              value: `${totalRealizedPnl >= 0 ? "+" : ""}$${fmt(Math.abs(totalRealizedPnl))}`,
              color: totalRealizedPnl >= 0 ? "text-emerald-400" : "text-red-400",
            },
          ].map((card) => (
            <div key={card.label} className="rounded-xl border border-slate-700 bg-slate-900 p-4">
              <p className="text-xs text-slate-500 mb-1">{card.label}</p>
              <p className={`text-xl font-bold ${card.color}`}>{card.value}</p>
            </div>
          ))}
        </div>

        {/* ── Tabs ── */}
        <div className="flex gap-1 border-b border-slate-800">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-4 py-2.5 text-sm font-medium rounded-t-lg transition-colors ${
                activeTab === tab.key
                  ? "text-white border-b-2 border-blue-500 bg-slate-900"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {tab.label}
              <span className="ml-2 text-xs bg-slate-700 px-1.5 py-0.5 rounded-full">
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* ── Broker Accounts ── */}
        {activeTab === "brokers" && (
          <div className="space-y-4">
            <h2 className="text-base font-semibold text-slate-200">Company Broker Accounts</h2>
            {brokers.length === 0 ? (
              <p className="text-slate-500 text-sm">No broker accounts registered.</p>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-slate-700">
                <table className="w-full text-sm">
                  <thead className="bg-slate-900 text-slate-400 text-xs uppercase tracking-wide">
                    <tr>
                      {["Broker", "Type", "Account #", "Currency", "Balance", "Equity", "Margin Used", "Free Margin", "Status"].map((h) => (
                        <th key={h} className="px-4 py-3 text-left font-medium">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {brokers.map((b) => (
                      <tr key={b.id} className="hover:bg-slate-900/50 transition-colors">
                        <td className="px-4 py-3 font-medium text-white">{b.broker_name}</td>
                        <td className="px-4 py-3 text-slate-400 font-mono text-xs">{b.broker_type}</td>
                        <td className="px-4 py-3 text-slate-300 font-mono text-xs">{b.account_number}</td>
                        <td className="px-4 py-3 text-slate-400">{b.currency}</td>
                        <td className="px-4 py-3 text-emerald-400 font-mono">${fmt(b.balance)}</td>
                        <td className="px-4 py-3 text-blue-400 font-mono">${fmt(b.equity)}</td>
                        <td className="px-4 py-3 text-amber-400 font-mono">${fmt(b.margin_used)}</td>
                        <td className="px-4 py-3 text-slate-300 font-mono">${fmt(b.free_margin)}</td>
                        <td className="px-4 py-3">
                          <StatusBadge status={b.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── Signal Leaderboard ── */}
        {activeTab === "leaderboard" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-slate-200">Trader Signal Leaderboard</h2>
              <p className="text-xs text-slate-500">
                Scores derived from win rate, profit factor &amp; trade consistency. Does not trigger payouts.
              </p>
            </div>
            {leaderboard.length === 0 ? (
              <p className="text-slate-500 text-sm">No signal profiles yet. Profiles are created automatically after simulated trades.</p>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-slate-700">
                <table className="w-full text-sm">
                  <thead className="bg-slate-900 text-slate-400 text-xs uppercase tracking-wide">
                    <tr>
                      {["Rank", "Purchase ID", "Score", "Win Rate", "Profit Factor", "Rating", "Trades", "Copy Eligible"].map((h) => (
                        <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {leaderboard.map((e) => (
                      <tr key={e.purchase_id} className="hover:bg-slate-900/50 transition-colors">
                        <td className="px-4 py-3 font-bold text-slate-300">#{e.rank}</td>
                        <td className="px-4 py-3 font-mono text-xs text-slate-400">{e.purchase_id.slice(0, 12)}…</td>
                        <td className="px-4 py-3">
                          <span
                            className={`font-bold text-lg ${
                              e.signal_score >= 85
                                ? "text-emerald-400"
                                : e.signal_score >= 75
                                ? "text-blue-400"
                                : e.signal_score >= 65
                                ? "text-amber-400"
                                : "text-red-400"
                            }`}
                          >
                            {Number(e.signal_score).toFixed(1)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-300">{Number(e.win_rate_percentage).toFixed(1)}%</td>
                        <td className="px-4 py-3 text-slate-300">{Number(e.profit_factor).toFixed(2)}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`font-semibold ${
                              e.consistency_rating === "A+"
                                ? "text-emerald-400"
                                : e.consistency_rating === "A"
                                ? "text-blue-400"
                                : e.consistency_rating === "B"
                                ? "text-amber-400"
                                : "text-red-400"
                            }`}
                          >
                            {e.consistency_rating}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-400">{e.total_trades_analyzed}</td>
                        <td className="px-4 py-3">
                          <StatusBadge status={e.is_eligible_for_copy ? "ACTIVE" : "PAUSED"} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── Allocation Strategies ── */}
        {activeTab === "strategies" && (
          <div className="space-y-4">
            <h2 className="text-base font-semibold text-slate-200">Allocation Strategies</h2>
            {strategies.length === 0 ? (
              <p className="text-slate-500 text-sm">No strategies found.</p>
            ) : (
              <div className="grid gap-4">
                {strategies.map((s) => (
                  <div
                    key={s.id}
                    className="rounded-xl border border-slate-700 bg-slate-900 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold text-white">{s.name}</h3>
                        <StatusBadge status={s.status} />
                      </div>
                      {s.description && (
                        <p className="text-xs text-slate-400">{s.description}</p>
                      )}
                      <div className="flex flex-wrap gap-4 pt-1 text-xs text-slate-400">
                        <span>Min Score: <strong className="text-slate-200">{Number(s.min_signal_score).toFixed(0)}</strong></span>
                        <span>Max Capital: <strong className="text-slate-200">${fmt(s.max_allocated_capital, 0)}</strong></span>
                        <span>Lot Multiplier: <strong className="text-slate-200">{Number(s.lot_multiplier).toFixed(2)}x</strong></span>
                        <span>Symbols: <strong className="text-slate-200">{s.allowed_symbols.join(", ")}</strong></span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => toggleStrategy(s.id, s.status)}
                        className={`px-4 py-2 text-xs rounded-lg font-medium transition-colors ${
                          s.status === "ACTIVE"
                            ? "bg-amber-500/20 text-amber-400 border border-amber-500/30 hover:bg-amber-500/30"
                            : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30"
                        }`}
                      >
                        {s.status === "ACTIVE" ? "Pause" : "Activate"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Execution Journal ── */}
        {activeTab === "executions" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-slate-200">Company Order Execution Journal</h2>
              <p className="text-xs text-slate-500">Real trades executed on company broker accounts using company capital</p>
            </div>
            {executions.length === 0 ? (
              <div className="rounded-xl border border-slate-700 bg-slate-900/50 p-12 text-center">
                <p className="text-slate-400 text-sm">No executions yet.</p>
                <p className="text-slate-500 text-xs mt-1">
                  Shadow copy orders appear here once a trader achieves sufficient signal score.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-slate-700">
                <table className="w-full text-sm">
                  <thead className="bg-slate-900 text-slate-400 text-xs uppercase tracking-wide">
                    <tr>
                      {["Ticket", "Symbol", "Side", "Lots", "Open Price", "Close Price", "P&L", "Status", "Opened"].map((h) => (
                        <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {executions.map((ex) => (
                      <tr key={ex.id} className="hover:bg-slate-900/50 transition-colors">
                        <td className="px-4 py-3 font-mono text-xs text-slate-400">{ex.broker_ticket}</td>
                        <td className="px-4 py-3 font-semibold text-slate-200">{ex.symbol}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`font-semibold ${
                              ex.side === "BUY" ? "text-emerald-400" : "text-red-400"
                            }`}
                          >
                            {ex.side}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-300 font-mono">{Number(ex.executed_lots).toFixed(2)}</td>
                        <td className="px-4 py-3 text-slate-300 font-mono">{Number(ex.open_price).toFixed(5)}</td>
                        <td className="px-4 py-3 text-slate-400 font-mono">
                          {ex.close_price ? Number(ex.close_price).toFixed(5) : "—"}
                        </td>
                        <td
                          className={`px-4 py-3 font-mono font-semibold ${
                            ex.realized_profit > 0
                              ? "text-emerald-400"
                              : ex.realized_profit < 0
                              ? "text-red-400"
                              : "text-slate-400"
                          }`}
                        >
                          {ex.realized_profit > 0 ? "+" : ""}${fmt(ex.realized_profit)}
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge status={ex.status} />
                        </td>
                        <td className="px-4 py-3 text-slate-400 text-xs">
                          {new Date(ex.open_time).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
