"use client";

import React, { useState, useMemo } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from "recharts";
import { EquityPoint } from "@/lib/api";
import { TrendingUp, TrendingDown, Maximize2, Activity } from "lucide-react";

interface InteractiveEquityChartProps {
  points: EquityPoint[];
  startingBalance?: number;
}

export default function InteractiveEquityChart({
  points,
  startingBalance = 100000,
}: InteractiveEquityChartProps) {
  const [timeRange, setTimeRange] = useState<"7D" | "14D" | "30D" | "ALL">("30D");
  const [metricView, setMetricView] = useState<"both" | "equity" | "balance">("both");

  // Format data for Recharts
  const chartData = useMemo(() => {
    if (!points || points.length === 0) {
      // If no points yet, provide a baseline entry so chart renders cleanly
      const today = new Date().toISOString().slice(0, 10);
      return [
        {
          date: today,
          equity: startingBalance,
          balance: startingBalance,
          pnl: 0,
        },
      ];
    }

    const filtered = [...points];
    const len = filtered.length;

    let sliceCount = len;
    if (timeRange === "7D") sliceCount = Math.min(len, 7);
    else if (timeRange === "14D") sliceCount = Math.min(len, 14);
    else if (timeRange === "30D") sliceCount = Math.min(len, 30);

    const slice = filtered.slice(-sliceCount);

    return slice.map((p) => {
      const eq = typeof p.equity === "string" ? parseFloat(p.equity) : Number(p.equity);
      const bal = typeof p.balance === "string" ? parseFloat(p.balance) : Number(p.balance);
      const pnl = p.daily_pnl ? (typeof p.daily_pnl === "string" ? parseFloat(p.daily_pnl) : Number(p.daily_pnl)) : 0;
      const dateStr = p.recorded_at ? p.recorded_at.slice(5, 10) : ""; // MM-DD
      return {
        date: dateStr,
        fullDate: p.recorded_at,
        equity: isNaN(eq) ? startingBalance : eq,
        balance: isNaN(bal) ? startingBalance : bal,
        pnl: isNaN(pnl) ? 0 : pnl,
      };
    });
  }, [points, timeRange, startingBalance]);

  // Compute key stats
  const latest = chartData[chartData.length - 1];
  const earliest = chartData[0];
  const netChange = latest && earliest ? latest.equity - earliest.equity : 0;
  const netChangePct = earliest && earliest.equity > 0 ? (netChange / earliest.equity) * 100 : 0;
  const isPositive = netChange >= 0;

  const minVal = Math.min(...chartData.map((d) => Math.min(d.equity, d.balance)));
  const maxVal = Math.max(...chartData.map((d) => Math.max(d.equity, d.balance)));
  const yPadding = (maxVal - minVal) * 0.1 || startingBalance * 0.02;
  const yDomain = [Math.floor(minVal - yPadding), Math.ceil(maxVal + yPadding)];

  const strokeNeon = isPositive ? "#ccff00" : "#f43f5e";
  const strokeBalance = "#38bdf8"; // Light sky blue for balance line

  return (
    <div className="bg-[#0d0e10] border border-white/[0.08] rounded-2xl p-5 shadow-2xl relative overflow-hidden">
      {/* Background ambient glow */}
      <div
        className="absolute top-0 right-0 w-80 h-80 rounded-full blur-3xl pointer-events-none opacity-10"
        style={{ background: strokeNeon }}
      />

      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 relative z-10">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-[#ccff00]/10 text-[#ccff00]">
              <Activity size={16} />
            </span>
            <h3 className="font-bold text-white text-base tracking-wide">
              Equity & Balance Curve
            </h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-white/[0.05] border border-white/10 text-neutral-400 font-mono">
              Live MT5 Sync
            </span>
          </div>
          <div className="flex items-baseline gap-3 mt-1">
            <span className="text-2xl font-black text-white font-mono">
              ${latest ? latest.equity.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "—"}
            </span>
            <span
              className={`text-xs font-semibold px-2 py-0.5 rounded-md flex items-center gap-1 ${
                isPositive
                  ? "bg-[#ccff00]/10 text-[#ccff00] border border-[#ccff00]/20"
                  : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
              }`}
            >
              {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              {isPositive ? "+" : ""}
              ${netChange.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ({netChangePct.toFixed(2)}%)
            </span>
          </div>
        </div>

        {/* Controls: Metric toggle & Timeframe */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Metric toggle */}
          <div className="bg-[#14161a] border border-white/10 p-1 rounded-xl flex items-center text-xs">
            <button
              onClick={() => setMetricView("both")}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                metricView === "both"
                  ? "bg-white/15 text-white font-semibold"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              Both
            </button>
            <button
              onClick={() => setMetricView("equity")}
              className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ${
                metricView === "equity"
                  ? "bg-[#ccff00]/20 text-[#ccff00] font-semibold"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-[#ccff00]" />
              Equity
            </button>
            <button
              onClick={() => setMetricView("balance")}
              className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ${
                metricView === "balance"
                  ? "bg-sky-500/20 text-sky-400 font-semibold"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-sky-400" />
              Balance
            </button>
          </div>

          {/* Time range */}
          <div className="bg-[#14161a] border border-white/10 p-1 rounded-xl flex items-center text-xs">
            {(["7D", "14D", "30D", "ALL"] as const).map((r) => (
              <button
                key={r}
                onClick={() => setTimeRange(r)}
                className={`px-2.5 py-1 rounded-lg transition-all font-medium ${
                  timeRange === r
                    ? "bg-[#ccff00] text-black font-bold shadow-sm"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chart container */}
      <div className="w-full h-72 sm:h-80 select-none relative z-10">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
            <defs>
              <linearGradient id="neonEquityGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={strokeNeon} stopOpacity={0.35} />
                <stop offset="95%" stopColor={strokeNeon} stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="skyBalanceGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={strokeBalance} stopOpacity={0.25} />
                <stop offset="95%" stopColor={strokeBalance} stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#22252c" vertical={false} />

            <XAxis
              dataKey="date"
              stroke="#555a66"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: "#22252c" }}
            />
            <YAxis
              domain={yDomain}
              stroke="#555a66"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: "#22252c" }}
              tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
            />

            <Tooltip
              content={<CustomTooltip />}
              cursor={{ stroke: "#ffffff25", strokeWidth: 1.5, strokeDasharray: "4 4" }}
            />

            {/* Baseline reference line */}
            <ReferenceLine
              y={startingBalance}
              stroke="#444955"
              strokeDasharray="4 4"
              label={{
                value: "Start",
                fill: "#777e90",
                fontSize: 10,
                position: "insideTopLeft",
              }}
            />

            {/* Balance Area */}
            {(metricView === "both" || metricView === "balance") && (
              <Area
                type="monotone"
                dataKey="balance"
                stroke={strokeBalance}
                strokeWidth={2}
                fill="url(#skyBalanceGrad)"
                name="Balance"
                dot={false}
                activeDot={{ r: 5, fill: strokeBalance, stroke: "#0d0e10", strokeWidth: 2 }}
              />
            )}

            {/* Equity Area */}
            {(metricView === "both" || metricView === "equity") && (
              <Area
                type="monotone"
                dataKey="equity"
                stroke={strokeNeon}
                strokeWidth={2.5}
                fill="url(#neonEquityGrad)"
                name="Equity"
                dot={false}
                activeDot={{ r: 6, fill: strokeNeon, stroke: "#0d0e10", strokeWidth: 2 }}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Footer legend */}
      <div className="flex items-center justify-between text-xs text-neutral-400 mt-4 pt-3 border-t border-white/[0.05]">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: strokeNeon }} />
            <span>Equity (Floating P&L)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-400" />
            <span>Balance (Closed Trades)</span>
          </div>
        </div>
        <span className="hidden sm:inline font-mono text-[11px] text-neutral-400">
          Max High-Water Mark: ${maxVal.toLocaleString("en-US", { maximumFractionDigits: 0 })}
        </span>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────
// Custom Dark Glassmorphism Tooltip
// ──────────────────────────────────────────
function CustomTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-[#121418]/95 backdrop-blur-md border border-white/15 rounded-xl p-3.5 shadow-2xl text-xs space-y-1.5 min-w-[170px]">
        <p className="text-neutral-400 font-medium border-b border-white/10 pb-1">
          {data.fullDate || label}
        </p>
        <div className="flex items-center justify-between gap-3">
          <span className="flex items-center gap-1.5 text-neutral-300">
            <span className="w-2 h-2 rounded-full bg-[#ccff00]" />
            Equity:
          </span>
          <span className="font-mono font-bold text-white">
            ${Number(data.equity).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="flex items-center gap-1.5 text-neutral-300">
            <span className="w-2 h-2 rounded-full bg-sky-400" />
            Balance:
          </span>
          <span className="font-mono font-bold text-white">
            ${Number(data.balance).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
        {data.pnl !== undefined && data.pnl !== 0 && (
          <div className="flex items-center justify-between gap-3 pt-1 border-t border-white/10">
            <span className="text-neutral-400">Day P&L:</span>
            <span
              className={`font-mono font-semibold ${
                data.pnl >= 0 ? "text-[#ccff00]" : "text-rose-400"
              }`}
            >
              {data.pnl >= 0 ? "+" : ""}${Number(data.pnl).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        )}
      </div>
    );
  }
  return null;
}
