"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getSession } from "@/lib/auth";
import {
  fetchTradingAccounts,
  fetchAccountTrades,
  fetchAccountSnapshots,
  simulateTrade,
  AccountMetrics,
  TradeItem,
  DailySnapshotItem,
} from "@/lib/api";
import {
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Layers,
  Server,
  DollarSign,
  ArrowUpRight,
  Shield,
  Loader2,
  Copy,
  Play,
  RotateCcw,
  Key,
  ShieldAlert,
  Calendar,
} from "lucide-react";

export default function TraderDashboard() {
  const [accounts, setAccounts] = useState<AccountMetrics[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<AccountMetrics | null>(null);
  const [trades, setTrades] = useState<TradeItem[]>([]);
  const [snapshots, setSnapshots] = useState<DailySnapshotItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [simulating, setSimulating] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    const session = getSession();
    if (!session) {
      window.location.href = "/login?redirect=/dashboard";
      return;
    }

    async function loadDashboard() {
      try {
        setLoading(true);
        const accs = await fetchTradingAccounts(session!.token);
        setAccounts(accs);
        if (accs.length > 0) {
          setSelectedAccount(accs[0]);
          // Load trades & snapshots for first account
          const [tData, sData] = await Promise.all([
            fetchAccountTrades(accs[0].purchase_id, session!.token).catch(() => []),
            fetchAccountSnapshots(accs[0].purchase_id, session!.token).catch(() => []),
          ]);
          setTrades(tData);
          setSnapshots(sData);
        }
      } catch (err: any) {
        setError(err.message || "Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  const handleAccountSelect = async (purchaseId: string) => {
    const session = getSession();
    if (!session) return;
    const acc = accounts.find((a) => a.purchase_id === purchaseId);
    if (!acc) return;
    setSelectedAccount(acc);
    try {
      const [tData, sData] = await Promise.all([
        fetchAccountTrades(acc.purchase_id, session.token).catch(() => []),
        fetchAccountSnapshots(acc.purchase_id, session.token).catch(() => []),
      ]);
      setTrades(tData);
      setSnapshots(sData);
    } catch (_) {}
  };

  const handleSimulate = async (profitAmount: number, isWin: boolean) => {
    const session = getSession();
    if (!session || !selectedAccount) return;
    try {
      setSimulating(true);
      const updated = await simulateTrade(
        selectedAccount.purchase_id,
        {
          symbol: isWin ? "EURUSD" : "XAUUSD",
          trade_type: isWin ? "BUY" : "SELL",
          lots: 1.0,
          open_price: 1.08500,
          close_price: isWin ? 1.09000 : 1.07000,
          profit: profitAmount,
          is_closed: true,
        },
        session.token
      );
      setSelectedAccount(updated);
      // Refresh accounts list & trades
      const [accs, tData, sData] = await Promise.all([
        fetchTradingAccounts(session.token),
        fetchAccountTrades(selectedAccount.purchase_id, session.token),
        fetchAccountSnapshots(selectedAccount.purchase_id, session.token),
      ]);
      setAccounts(accs);
      setTrades(tData);
      setSnapshots(sData);
    } catch (err: any) {
      alert(err.message || "Simulation failed");
    } finally {
      setSimulating(false);
    }
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-950 text-white flex flex-col justify-between">
        <Navbar />
        <div className="flex flex-col items-center justify-center py-32 space-y-4">
          <Loader2 className="w-10 h-10 text-brand-500 animate-spin" />
          <p className="text-gray-400 text-sm">Syncing with Risk Engine & MT5 Server...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (accounts.length === 0) {
    return (
      <div className="min-h-screen bg-dark-950 text-white flex flex-col justify-between">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-24 text-center">
          <div className="w-16 h-16 rounded-2xl bg-dark-800 border border-dark-700 mx-auto flex items-center justify-center mb-6 text-brand-500">
            <Layers className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">No Active Evaluation Account</h2>
          <p className="text-sm text-gray-400 max-w-md mx-auto mb-8">
            You don&apos;t have an active simulated challenge account yet. Select an evaluation tier to begin your prop firm journey.
          </p>
          <Link
            href="/challenges"
            className="px-6 py-3.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm transition shadow-lg shadow-brand-600/30"
          >
            Explore Evaluation Challenges
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const acc = selectedAccount!;
  const isBreached = acc.status === "BREACHED";
  const isPassed = acc.status === "TARGET_REACHED" || acc.status === "PASSED" || acc.status === "FUNDED";
  const profit = acc.current_equity - acc.starting_balance;

  return (
    <div className="min-h-screen bg-dark-950 text-white flex flex-col justify-between">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-grow w-full space-y-8">
        {/* Header & Account Switcher */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-dark-700">
          <div>
            <div className="flex items-center space-x-3 mb-1">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Trader Analytics
              </h1>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                  isBreached
                    ? "bg-red-950/80 text-red-400 border border-red-700/60"
                    : isPassed
                    ? "bg-emerald-950/80 text-emerald-400 border border-emerald-700/60"
                    : "bg-brand-950/80 text-brand-400 border border-brand-700/60"
                }`}
              >
                {acc.status}
              </span>
            </div>
            <p className="text-xs text-gray-400">
              Account: <span className="text-white font-medium">{acc.challenge_name}</span> &bull; MT5 Login:{" "}
              <span className="font-mono text-brand-400">{acc.mt5_login || "Pending"}</span>
            </p>
          </div>

          {/* Account Selector */}
          {accounts.length > 1 && (
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-400 font-semibold">Account:</span>
              <select
                value={acc.purchase_id}
                onChange={(e) => handleAccountSelect(e.target.value)}
                className="px-3 py-2 rounded-xl bg-dark-800 border border-dark-700 text-xs text-white font-medium focus:outline-none focus:border-brand-500"
              >
                {accounts.map((a, idx) => (
                  <option key={a.purchase_id} value={a.purchase_id}>
                    #{idx + 1} - {a.challenge_name} ({a.status})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Breach Alert Banner */}
        {isBreached && (
          <div className="p-5 rounded-2xl bg-red-950/40 border border-red-700/80 flex items-start space-x-4 shadow-xl">
            <ShieldAlert className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h3 className="font-bold text-red-300 text-sm">Evaluation Challenge Breached</h3>
              <p className="text-xs text-red-200/80 leading-relaxed">
                {acc.breached_reason || "Trading rule limit was exceeded. The account has been deactivated."}
              </p>
              <div className="pt-2">
                <Link
                  href="/challenges"
                  className="inline-block text-xs font-bold text-white bg-red-800 hover:bg-red-700 px-3 py-1.5 rounded-lg transition"
                >
                  Start New Evaluation →
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Target Reached Banner */}
        {isPassed && (
          <div className="p-5 rounded-2xl bg-emerald-950/40 border border-emerald-700/80 flex items-start space-x-4 shadow-xl">
            <CheckCircle className="w-6 h-6 text-emerald-400 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h3 className="font-bold text-emerald-300 text-sm">Profit Target Achieved!</h3>
              <p className="text-xs text-emerald-200/80 leading-relaxed">
                Congratulations! You met the profit target while complying with all risk guidelines. Our compliance team is finalizing review for funded account transition.
              </p>
            </div>
          </div>
        )}

        {/* MT5 Simulated Credentials Card */}
        <div className="bg-gradient-to-r from-dark-900 to-dark-850 border border-dark-700/80 rounded-2xl p-6 shadow-xl">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-xl bg-brand-600/10 border border-brand-500/20 flex items-center justify-center text-brand-500 flex-shrink-0">
                <Server className="w-6 h-6" />
              </div>
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                  Simulated MetaTrader 5 Terminal Credentials
                </div>
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-1">
                  <div>
                    <span className="text-xs text-gray-500">Login: </span>
                    <span className="font-mono text-sm font-bold text-brand-400">{acc.mt5_login || "N/A"}</span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">Server: </span>
                    <span className="text-sm font-bold text-white">{acc.mt5_server || "RiffMax-Simulated-MT5"}</span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500">Leverage: </span>
                    <span className="text-sm font-bold text-emerald-400">1:{acc.leverage}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Investor & Master Passwords with copy */}
            <div className="flex flex-wrap items-center gap-3">
              {acc.mt5_investor_password && (
                <div className="bg-dark-950 px-3 py-1.5 rounded-lg border border-dark-700 flex items-center space-x-2 text-xs">
                  <Key className="w-3.5 h-3.5 text-gray-400" />
                  <span className="text-gray-400">Investor:</span>
                  <span className="font-mono font-bold text-white">{acc.mt5_investor_password}</span>
                  <button
                    onClick={() => copyToClipboard(acc.mt5_investor_password!, "investor")}
                    className="text-gray-400 hover:text-white"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
              {acc.mt5_password && (
                <div className="bg-dark-950 px-3 py-1.5 rounded-lg border border-dark-700 flex items-center space-x-2 text-xs">
                  <Key className="w-3.5 h-3.5 text-brand-400" />
                  <span className="text-gray-400">Master:</span>
                  <span className="font-mono font-bold text-white">{acc.mt5_password}</span>
                  <button
                    onClick={() => copyToClipboard(acc.mt5_password!, "master")}
                    className="text-gray-400 hover:text-white"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Real-Time Risk Gauges Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Equity & Balance */}
          <div className="bg-dark-900 border border-dark-700/60 rounded-2xl p-6 shadow-xl space-y-3">
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span>Account Equity</span>
              <DollarSign className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-3xl font-extrabold text-white">
              ${acc.current_equity.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="flex items-center justify-between text-xs pt-1 border-t border-dark-800 text-gray-400">
              <span>Balance: ${acc.current_balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              <span className={profit >= 0 ? "text-emerald-400 font-bold" : "text-red-400 font-bold"}>
                {profit >= 0 ? `+$${profit.toFixed(2)}` : `-$${Math.abs(profit).toFixed(2)}`}
              </span>
            </div>
          </div>

          {/* Daily Loss Gauge */}
          <div className="bg-dark-900 border border-dark-700/60 rounded-2xl p-6 shadow-xl space-y-3">
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span>Daily Loss Buffer</span>
              <span className="text-[10px] font-semibold text-gray-500">Floor: ${acc.daily_loss_floor.toFixed(0)}</span>
            </div>
            <div className="text-3xl font-extrabold text-emerald-400">
              ${acc.daily_loss_remaining_usd.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
            <div className="w-full bg-dark-800 h-2 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  acc.daily_loss_percent_remaining > 50
                    ? "bg-emerald-500"
                    : acc.daily_loss_percent_remaining > 20
                    ? "bg-amber-500"
                    : "bg-red-500"
                }`}
                style={{ width: `${Math.min(100, acc.daily_loss_percent_remaining * 20)}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-gray-400">
              <span>Remaining allowance</span>
              <span className="font-semibold text-white">{acc.daily_loss_percent_remaining.toFixed(1)}%</span>
            </div>
          </div>

          {/* Max Drawdown Gauge */}
          <div className="bg-dark-900 border border-dark-700/60 rounded-2xl p-6 shadow-xl space-y-3">
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span>Max Drawdown Buffer</span>
              <span className="text-[10px] font-semibold text-gray-500">Floor: ${acc.max_drawdown_floor.toFixed(0)}</span>
            </div>
            <div className="text-3xl font-extrabold text-emerald-400">
              ${acc.max_drawdown_remaining_usd.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
            <div className="w-full bg-dark-800 h-2 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  acc.max_drawdown_percent_remaining > 50
                    ? "bg-emerald-500"
                    : acc.max_drawdown_percent_remaining > 20
                    ? "bg-amber-500"
                    : "bg-red-500"
                }`}
                style={{ width: `${Math.min(100, acc.max_drawdown_percent_remaining * 10)}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-gray-400">
              <span>Cushion from floor</span>
              <span className="font-semibold text-white">{acc.max_drawdown_percent_remaining.toFixed(1)}%</span>
            </div>
          </div>

          {/* Profit Target Gauge */}
          <div className="bg-dark-900 border border-dark-700/60 rounded-2xl p-6 shadow-xl space-y-3">
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span>Target: ${acc.profit_target_amount.toLocaleString()}</span>
              <span className="text-xs font-bold text-brand-400">{acc.profit_target_progress_percent}%</span>
            </div>
            <div className="text-3xl font-extrabold text-white">
              ${acc.profit_target_distance_usd > 0 ? acc.profit_target_distance_usd.toLocaleString(undefined, { minimumFractionDigits: 2 }) : "0.00"}
            </div>
            <div className="w-full bg-dark-800 h-2 rounded-full overflow-hidden">
              <div
                className="h-full bg-brand-500 rounded-full transition-all"
                style={{ width: `${Math.min(100, acc.profit_target_progress_percent)}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-gray-400">
              <span>Distance to target</span>
              <span className="flex items-center space-x-1">
                <Calendar className="w-3 h-3 text-gray-400" />
                <span>{acc.trading_days_completed}/{acc.trading_days_required} days</span>
              </span>
            </div>
          </div>
        </div>

        {/* Sandbox Trade Simulator (Interactive Testing Panel) */}
        <div className="bg-dark-900 border border-dark-700/60 rounded-2xl p-6 shadow-xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <Play className="w-4 h-4 text-brand-500" />
                <span>Sandbox Trade Simulator</span>
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">
                Simulate instant MT5 trades to test the Deterministic Risk Engine, daily loss triggers, and target milestones.
              </p>
            </div>
            {simulating && (
              <div className="flex items-center space-x-2 text-xs text-brand-400 font-semibold">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Executing & Calculating Limits...</span>
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => handleSimulate(500, true)}
              disabled={simulating || isBreached}
              className="px-4 py-2 rounded-xl bg-emerald-950/60 border border-emerald-700/60 hover:bg-emerald-900/60 disabled:opacity-40 text-emerald-300 font-bold text-xs transition flex items-center space-x-1.5"
            >
              <span>+ Simulate Win (+$500)</span>
            </button>
            <button
              onClick={() => handleSimulate(2000, true)}
              disabled={simulating || isBreached}
              className="px-4 py-2 rounded-xl bg-emerald-950/60 border border-emerald-700/60 hover:bg-emerald-900/60 disabled:opacity-40 text-emerald-300 font-bold text-xs transition flex items-center space-x-1.5"
            >
              <span>+ Simulate Big Win (+$2,000)</span>
            </button>
            <button
              onClick={() => handleSimulate(-400, false)}
              disabled={simulating || isBreached}
              className="px-4 py-2 rounded-xl bg-amber-950/60 border border-amber-700/60 hover:bg-amber-900/60 disabled:opacity-40 text-amber-300 font-bold text-xs transition flex items-center space-x-1.5"
            >
              <span>- Simulate Loss (-$400)</span>
            </button>
            <button
              onClick={() => handleSimulate(-6000, false)}
              disabled={simulating || isBreached}
              className="px-4 py-2 rounded-xl bg-red-950/60 border border-red-700/60 hover:bg-red-900/60 disabled:opacity-40 text-red-300 font-bold text-xs transition flex items-center space-x-1.5"
            >
              <span>⚠ Trigger Daily Breach (-$6,000)</span>
            </button>
          </div>
        </div>

        {/* Trade History Table */}
        <div className="bg-dark-900 border border-dark-700/60 rounded-2xl overflow-hidden shadow-xl">
          <div className="px-6 py-4 border-b border-dark-700 flex items-center justify-between">
            <h3 className="font-bold text-sm text-white">Closed Trades History ({trades.length})</h3>
            <span className="text-xs text-gray-500 font-mono">Live MT5 Execution Journal</span>
          </div>

          {trades.length === 0 ? (
            <div className="py-12 text-center text-gray-500 text-xs">
              No trades recorded yet. Connect to MT5 or use the simulator above to open positions.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs divide-y divide-dark-800">
                <thead className="bg-dark-850/80 text-gray-400 font-semibold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="px-6 py-3">Ticket</th>
                    <th className="px-6 py-3">Symbol</th>
                    <th className="px-6 py-3">Type</th>
                    <th className="px-6 py-3">Lots</th>
                    <th className="px-6 py-3">Open Price</th>
                    <th className="px-6 py-3">Close Price</th>
                    <th className="px-6 py-3">Profit (USD)</th>
                    <th className="px-6 py-3">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-800 font-medium">
                  {trades.map((t) => (
                    <tr key={t.id} className="hover:bg-dark-850/50 transition">
                      <td className="px-6 py-3 font-mono text-gray-400">{t.ticket}</td>
                      <td className="px-6 py-3 font-bold text-white">{t.symbol}</td>
                      <td className="px-6 py-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            t.trade_type === "BUY"
                              ? "bg-emerald-950 text-emerald-400 border border-emerald-800/40"
                              : "bg-red-950 text-red-400 border border-red-800/40"
                          }`}
                        >
                          {t.trade_type}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-gray-300">{t.lots.toFixed(2)}</td>
                      <td className="px-6 py-3 font-mono text-gray-400">{t.open_price.toFixed(5)}</td>
                      <td className="px-6 py-3 font-mono text-gray-400">{t.close_price?.toFixed(5) || "Open"}</td>
                      <td
                        className={`px-6 py-3 font-bold ${
                          t.profit >= 0 ? "text-emerald-400" : "text-red-400"
                        }`}
                      >
                        {t.profit >= 0 ? `+$${t.profit.toFixed(2)}` : `-$${Math.abs(t.profit).toFixed(2)}`}
                      </td>
                      <td className="px-6 py-3 text-gray-500 font-mono text-[11px]">
                        {new Date(t.open_time).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
