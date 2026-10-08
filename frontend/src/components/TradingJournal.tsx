"use client";

import React, { useState } from "react";
import {
  BookOpen,
  TrendingUp,
  TrendingDown,
  Award,
  AlertTriangle,
  Calendar,
  CheckCircle2,
  XCircle,
  Filter,
  BarChart2,
} from "lucide-react";

interface JournalTrade {
  ticket: string;
  symbol: string;
  type: "BUY" | "SELL";
  lots: number;
  openPrice: number;
  closePrice: number;
  profit: number;
  pnlPct: number;
  date: string;
  result: "WIN" | "LOSS";
}

const SAMPLE_JOURNAL_TRADES: JournalTrade[] = [
  {
    ticket: "10849201",
    symbol: "XAUUSD",
    type: "BUY",
    lots: 1.5,
    openPrice: 2642.50,
    closePrice: 2654.80,
    profit: 1845.00,
    pnlPct: 1.84,
    date: "2026-10-06 14:22",
    result: "WIN",
  },
  {
    ticket: "10849188",
    symbol: "EURUSD",
    type: "SELL",
    lots: 2.0,
    openPrice: 1.0875,
    closePrice: 1.0832,
    profit: 860.00,
    pnlPct: 0.86,
    date: "2026-10-06 09:15",
    result: "WIN",
  },
  {
    ticket: "10849140",
    symbol: "GBPUSD",
    type: "BUY",
    lots: 1.0,
    openPrice: 1.2960,
    closePrice: 1.2925,
    profit: -350.00,
    pnlPct: -0.35,
    date: "2026-10-05 16:40",
    result: "LOSS",
  },
  {
    ticket: "10849092",
    symbol: "US100",
    type: "BUY",
    lots: 0.5,
    openPrice: 20080.0,
    closePrice: 20175.0,
    profit: 950.00,
    pnlPct: 0.95,
    date: "2026-10-05 11:05",
    result: "WIN",
  },
  {
    ticket: "10849033",
    symbol: "BTCUSD",
    type: "SELL",
    lots: 0.1,
    openPrice: 63800.0,
    closePrice: 64210.0,
    profit: -410.00,
    pnlPct: -0.41,
    date: "2026-10-04 18:30",
    result: "LOSS",
  },
  {
    ticket: "10848980",
    symbol: "XAUUSD",
    type: "BUY",
    lots: 1.0,
    openPrice: 2635.00,
    closePrice: 2648.50,
    profit: 1350.00,
    pnlPct: 1.35,
    date: "2026-10-04 08:20",
    result: "WIN",
  },
];

export default function TradingJournal() {
  const [filter, setFilter] = useState<"ALL" | "WIN" | "LOSS">("ALL");

  const totalTrades = SAMPLE_JOURNAL_TRADES.length;
  const winTrades = SAMPLE_JOURNAL_TRADES.filter((t) => t.result === "WIN");
  const lossTrades = SAMPLE_JOURNAL_TRADES.filter((t) => t.result === "LOSS");

  const winRate = ((winTrades.length / totalTrades) * 100).toFixed(1);
  const totalGain = winTrades.reduce((sum, t) => sum + t.profit, 0);
  const totalLoss = Math.abs(lossTrades.reduce((sum, t) => sum + t.profit, 0));
  const profitFactor = (totalLoss > 0 ? (totalGain / totalLoss) : totalGain).toFixed(2);

  const avgWin = (winTrades.length > 0 ? totalGain / winTrades.length : 0).toFixed(2);
  const avgLoss = (lossTrades.length > 0 ? totalLoss / lossTrades.length : 0).toFixed(2);

  const filteredTrades = SAMPLE_JOURNAL_TRADES.filter((t) =>
    filter === "ALL" ? true : t.result === filter
  );

  return (
    <div className="space-y-6">
      {/* 4 Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Win Rate */}
        <div className="bg-[#0d0e10] border border-white/10 rounded-2xl p-5">
          <div className="flex items-center justify-between text-neutral-400 text-xs mb-2">
            <span>Win Rate</span>
            <span className="p-1.5 rounded-lg bg-[#ccff00]/10 text-[#ccff00]">
              <TrendingUp size={14} />
            </span>
          </div>
          <div className="text-2xl font-black text-white font-mono">{winRate}%</div>
          <div className="text-[11px] text-neutral-500 mt-1">
            {winTrades.length} won / {lossTrades.length} lost
          </div>
        </div>

        {/* Profit Factor */}
        <div className="bg-[#0d0e10] border border-white/10 rounded-2xl p-5">
          <div className="flex items-center justify-between text-neutral-400 text-xs mb-2">
            <span>Profit Factor</span>
            <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
              <BarChart2 size={14} />
            </span>
          </div>
          <div className="text-2xl font-black text-emerald-400 font-mono">{profitFactor}</div>
          <div className="text-[11px] text-neutral-500 mt-1">Gross Wins vs. Losses</div>
        </div>

        {/* Risk / Reward */}
        <div className="bg-[#0d0e10] border border-white/10 rounded-2xl p-5">
          <div className="flex items-center justify-between text-neutral-400 text-xs mb-2">
            <span>Avg Win / Avg Loss</span>
            <span className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400">
              <Award size={14} />
            </span>
          </div>
          <div className="text-xl font-black text-white font-mono">
            ${avgWin} <span className="text-neutral-500 text-sm">/</span> ${avgLoss}
          </div>
          <div className="text-[11px] text-[#ccff00] mt-1 font-semibold">
            {(Number(avgWin) / (Number(avgLoss) || 1)).toFixed(2)} : 1 Reward Ratio
          </div>
        </div>

        {/* Total Net Profit */}
        <div className="bg-[#0d0e10] border border-white/10 rounded-2xl p-5">
          <div className="flex items-center justify-between text-neutral-400 text-xs mb-2">
            <span>Net Trade P&amp;L</span>
            <span className="p-1.5 rounded-lg bg-[#ccff00]/10 text-[#ccff00]">
              <TrendingUp size={14} />
            </span>
          </div>
          <div className="text-2xl font-black text-[#ccff00] font-mono">
            +${(totalGain - totalLoss).toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-neutral-500 mt-1">{totalTrades} Executed Orders</div>
        </div>
      </div>

      {/* Highlights: Best vs Worst Trade */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Award size={20} />
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-emerald-400">Best Performing Trade</div>
              <div className="text-sm font-bold text-white mt-0.5">XAUUSD Buy (+1.5 Lots)</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-lg font-black text-emerald-400 font-mono">+$1,845.00</div>
            <div className="text-[10px] text-neutral-400">Oct 06, 2026</div>
          </div>
        </div>

        <div className="bg-rose-950/20 border border-rose-500/30 rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
              <AlertTriangle size={20} />
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-rose-400">Max Loss Incident</div>
              <div className="text-sm font-bold text-white mt-0.5">BTCUSD Sell (0.1 Lots)</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-lg font-black text-rose-400 font-mono">-$410.00</div>
            <div className="text-[10px] text-neutral-400">Oct 04, 2026</div>
          </div>
        </div>
      </div>

      {/* Trade Log Table */}
      <div className="bg-[#0d0e10] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
        <div className="p-4 sm:p-5 border-b border-white/[0.06] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen size={16} className="text-[#ccff00]" />
            <h3 className="text-sm font-bold text-white">Closed Trades Log</h3>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1 bg-[#14161a] border border-white/10 p-1 rounded-xl text-xs">
            {(["ALL", "WIN", "LOSS"] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setFilter(mode)}
                className={`px-3 py-1 rounded-lg transition font-bold ${
                  filter === mode
                    ? "bg-[#ccff00] text-black"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/[0.06] text-neutral-500 uppercase font-mono">
                <th className="py-3 px-5">Ticket</th>
                <th className="py-3 px-4">Symbol</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Lots</th>
                <th className="py-3 px-4">Open &rarr; Close</th>
                <th className="py-3 px-4 text-right">Profit (USD)</th>
                <th className="py-3 px-5 text-right">Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredTrades.map((t, idx) => (
                <tr
                  key={t.ticket}
                  className={`border-b border-white/[0.03] transition-colors hover:bg-white/[0.02] ${
                    idx % 2 === 0 ? "" : "bg-white/[0.01]"
                  }`}
                >
                  <td className="py-3.5 px-5 font-mono text-neutral-400">#{t.ticket}</td>
                  <td className="py-3.5 px-4 font-bold text-white">{t.symbol}</td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        t.type === "BUY"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                      }`}
                    >
                      {t.type}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-neutral-300">{t.lots}</td>
                  <td className="py-3.5 px-4 font-mono text-neutral-400">
                    {t.openPrice} &rarr; {t.closePrice}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-bold">
                    <span className={t.profit >= 0 ? "text-[#ccff00]" : "text-rose-400"}>
                      {t.profit >= 0 ? "+" : ""}${t.profit.toFixed(2)}
                    </span>
                  </td>
                  <td className="py-3.5 px-5 text-right text-neutral-500 font-mono">
                    {t.date}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
