"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { fetchUserPurchases, ChallengePurchase } from "@/lib/api";
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
} from "lucide-react";

export default function TraderDashboard() {
  const [purchases, setPurchases] = useState<ChallengePurchase[]>([]);
  const [selectedPurchase, setSelectedPurchase] = useState<ChallengePurchase | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const session = getSession();
    if (!session) {
      window.location.href = "/login";
      return;
    }

    fetchUserPurchases(session.token)
      .then((data) => {
        setPurchases(data);
        if (data.length > 0) {
          setSelectedPurchase(data[0]);
        }
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Failed to load dashboard data");
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-gray-400">
        <Loader2 className="w-8 h-8 animate-spin text-brand-500 mb-3" />
        <p className="text-sm">Loading trader dashboard...</p>
      </div>
    );
  }

  if (purchases.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 rounded-2xl bg-dark-800 border border-dark-700 mx-auto flex items-center justify-center mb-6">
          <Layers className="w-8 h-8 text-brand-500" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">No Active Challenge</h2>
        <p className="text-sm text-gray-400 max-w-md mx-auto mb-8">
          You haven't enrolled in an evaluation challenge yet. Choose a simulated account scale to begin trading.
        </p>
        <Link
          href="/challenges"
          className="px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm transition shadow-lg shadow-brand-600/30"
        >
          View Evaluation Challenges
        </Link>
      </div>
    );
  }

  const p = selectedPurchase!;
  const ch = p.challenge;
  const startingBal = Number(ch?.starting_balance || 100000);
  const currentBal = Number(p.current_balance || startingBal);
  const currentEq = Number(p.current_equity || startingBal);
  const profit = currentBal - startingBal;
  const profitTargetPerc = Number(ch?.rules?.profit_target_percentage || 10);
  const targetAmount = (startingBal * profitTargetPerc) / 100;
  const progressPerc = Math.min(100, Math.max(0, (profit / targetAmount) * 100));

  const maxDailyLossPerc = Number(ch?.rules?.max_daily_loss_percentage || 5);
  const dailyLossLimit = (startingBal * maxDailyLossPerc) / 100;

  const maxDDPerc = Number(ch?.rules?.max_drawdown_percentage || 10);
  const maxDDLimit = (startingBal * maxDDPerc) / 100;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header & Account Selector */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-dark-700">
        <div>
          <div className="flex items-center space-x-3 mb-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Trader Analytics</h1>
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                p.status === "ACTIVE"
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                  : p.status === "TARGET_REACHED" || p.status === "PASSED"
                  ? "bg-brand-500/10 text-brand-400 border border-brand-500/20"
                  : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
              }`}
            >
              {p.status}
            </span>
          </div>
          <p className="text-xs text-gray-400">
            Challenge: <span className="text-gray-200 font-medium">{ch?.name || "Evaluation Account"}</span>
          </p>
        </div>

        {/* Account Switcher */}
        {purchases.length > 1 && (
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-400">Account:</span>
            <select
              value={p.id}
              onChange={(e) => {
                const found = purchases.find((item) => item.id === e.target.value);
                if (found) setSelectedPurchase(found);
              }}
              className="px-3 py-1.5 rounded-lg bg-dark-800 border border-dark-700 text-xs text-white"
            >
              {purchases.map((item, idx) => (
                <option key={item.id} value={item.id}>
                  #{idx + 1} - {item.challenge?.name} ({item.status})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* MT5 Simulated Credentials Card */}
      <div className="bg-gradient-to-r from-dark-850 to-dark-800 border border-dark-700/80 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-500">
              <Server className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs text-gray-400">Simulated MT5 Credentials</div>
              <div className="text-lg font-bold text-white">
                Login: <span className="font-mono text-brand-400">{p.mt5_login || "Pending Activation"}</span>
              </div>
              <div className="text-xs text-gray-400">
                Server: <span className="text-gray-300">{p.mt5_server || "RiffMax-Simulated-MT5"}</span>
              </div>
            </div>
          </div>

          <div className="text-xs text-gray-400 max-w-sm">
            Deterministic server-side rule engine synchronizes balance, floating P/L, and drawdown continuously.
          </div>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Balance Card */}
        <div className="bg-dark-850 border border-dark-700 p-5 rounded-2xl">
          <div className="text-xs text-gray-400 mb-1">Simulated Balance</div>
          <div className="text-2xl font-extrabold text-white mb-2">
            ${currentBal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-xs text-gray-400">
            Starting: ${startingBal.toLocaleString()}
          </div>
        </div>

        {/* Equity Card */}
        <div className="bg-dark-850 border border-dark-700 p-5 rounded-2xl">
          <div className="text-xs text-gray-400 mb-1">Simulated Equity</div>
          <div className="text-2xl font-extrabold text-white mb-2">
            ${currentEq.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className={`text-xs font-semibold ${profit >= 0 ? "text-emerald-400" : "text-red-400"}`}>
            {profit >= 0 ? `+$${profit.toLocaleString()}` : `-$${Math.abs(profit).toLocaleString()}`} Profit/Loss
          </div>
        </div>

        {/* Daily Loss Gauge */}
        <div className="bg-dark-850 border border-dark-700 p-5 rounded-2xl">
          <div className="text-xs text-gray-400 mb-1">Daily Loss Limit</div>
          <div className="text-2xl font-extrabold text-white mb-2">
            ${dailyLossLimit.toLocaleString()}
          </div>
          <div className="text-xs text-gray-400">
            Method: <span className="text-gray-200">{ch?.rules?.daily_loss_methodology || "STARTING_EQUITY"}</span>
          </div>
        </div>

        {/* Drawdown Gauge */}
        <div className="bg-dark-850 border border-dark-700 p-5 rounded-2xl">
          <div className="text-xs text-gray-400 mb-1">Max Overall Drawdown</div>
          <div className="text-2xl font-extrabold text-white mb-2">
            ${maxDDLimit.toLocaleString()}
          </div>
          <div className="text-xs text-gray-400">
            Method: <span className="text-gray-200">{ch?.rules?.drawdown_methodology || "STATIC"}</span>
          </div>
        </div>
      </div>

      {/* Target Progress Bar & Consistency */}
      <div className="bg-dark-850 border border-dark-700 rounded-2xl p-6 space-y-6">
        <div>
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-semibold text-gray-200">Profit Target Progress ({profitTargetPerc}%)</span>
            <span className="font-mono text-brand-400">{progressPerc.toFixed(1)}%</span>
          </div>
          <div className="w-full h-3 rounded-full bg-dark-900 overflow-hidden border border-dark-700">
            <div
              className="h-full bg-gradient-to-r from-brand-600 to-emerald-400 transition-all duration-500 rounded-full"
              style={{ width: `${progressPerc}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] text-gray-400 mt-2">
            <span>$0</span>
            <span>Target: ${targetAmount.toLocaleString()}</span>
          </div>
        </div>

        <div className="pt-4 border-t border-dark-700/60 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <span className="text-gray-400">Trading Days:</span>{" "}
            <span className="font-bold text-white">
              {p.trading_days_count} / {ch?.rules?.min_trading_days || 5} Min Days
            </span>
          </div>
          <div>
            <span className="text-gray-400">Profit Split:</span>{" "}
            <span className="font-bold text-brand-400">
              {ch?.rules?.profit_split_percentage || 80}% Trader / {100 - Number(ch?.rules?.profit_split_percentage || 80)}% Firm
            </span>
          </div>
          <div>
            <span className="text-gray-400">Leverage:</span>{" "}
            <span className="font-bold text-white">1:{ch?.rules?.leverage || 100}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
