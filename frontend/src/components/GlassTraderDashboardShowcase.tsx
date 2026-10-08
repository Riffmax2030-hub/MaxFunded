"use client";

import React, { useState } from "react";
import {
  TrendingUp,
  ShieldCheck,
  Zap,
  ArrowUpRight,
  Clock,
  Activity,
  Layers,
  CheckCircle2,
  Lock,
} from "lucide-react";

export default function GlassTraderDashboardShowcase() {
  const [selectedTimeframe, setSelectedTimeframe] = useState<"1D" | "1W" | "1M" | "ALL">("1M");

  return (
    <div className="relative max-w-5xl mx-auto mt-12 sm:mt-16 px-2 sm:px-4">
      {/* Ambient Neon Backlight Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-80 bg-[#ccff00]/[0.07] blur-[110px] pointer-events-none rounded-full -z-10" />

      {/* Main Terminal Frame with Frosted Glassmorphism */}
      <div className="relative rounded-2xl sm:rounded-3xl bg-[#0b0e14]/90 backdrop-blur-xl border border-white/[0.08] shadow-[0_20px_70px_rgba(0,0,0,0.85)] overflow-hidden">
        
        {/* Terminal Window Header Bar */}
        <div className="px-4 sm:px-6 py-3.5 bg-[#07090d]/90 border-b border-white/[0.06] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-rose-500/80" />
            <div className="w-3 h-3 rounded-full bg-amber-500/80" />
            <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
            <span className="hidden sm:inline-block ml-3 font-mono text-xs text-neutral-400 font-semibold tracking-wide">
              maxfunded-trader-terminal · v2.4 (MT5 Raw ECN Feed)
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ccff00]/10 border border-[#ccff00]/30 text-[#ccff00] font-mono text-[11px] font-bold">
              <span className="w-2 h-2 rounded-full bg-[#ccff00] animate-pulse" />
              STATUS: FUNDED · ACTIVE
            </span>
          </div>
        </div>

        {/* Dashboard Interior Layout (Bento Grid) */}
        <div className="p-4 sm:p-7 space-y-5 text-left">
          
          {/* Top Row: Metric Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            
            {/* Metric 1: Account Equity */}
            <div className="p-4 rounded-2xl bg-[#11141c]/90 border border-white/[0.06]">
              <div className="flex items-center justify-between text-neutral-400 text-xs font-mono mb-1">
                <span>ACCOUNT EQUITY</span>
                <TrendingUp className="w-3.5 h-3.5 text-[#ccff00]" />
              </div>
              <div className="text-xl sm:text-2xl font-black text-white font-mono tracking-tight">
                $218,450.00
              </div>
              <div className="text-[11px] font-bold text-[#ccff00] mt-1 flex items-center gap-1">
                <ArrowUpRight size={12} /> +$18,450.00 (+9.22%)
              </div>
            </div>

            {/* Metric 2: Profit Split Target */}
            <div className="p-4 rounded-2xl bg-[#11141c]/90 border border-white/[0.06]">
              <div className="flex items-center justify-between text-neutral-400 text-xs font-mono mb-1">
                <span>PROFIT SPLIT (90%)</span>
                <Zap className="w-3.5 h-3.5 text-[#ccff00]" />
              </div>
              <div className="text-xl sm:text-2xl font-black text-[#ccff00] font-mono tracking-tight">
                $16,605.00
              </div>
              <div className="text-[11px] text-neutral-400 mt-1">
                Eligible for instant withdrawal
              </div>
            </div>

            {/* Metric 3: Max Drawdown Cushion */}
            <div className="p-4 rounded-2xl bg-[#11141c]/90 border border-white/[0.06]">
              <div className="flex items-center justify-between text-neutral-400 text-xs font-mono mb-1">
                <span>DRAWDOWN CUSHION</span>
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <div className="text-xl sm:text-2xl font-black text-white font-mono tracking-tight">
                9.4% Left
              </div>
              <div className="text-[11px] text-emerald-400 mt-1 font-bold">
                ✓ Static 10% model · Safe
              </div>
            </div>

            {/* Metric 4: Win Rate & Profit Factor */}
            <div className="p-4 rounded-2xl bg-[#11141c]/90 border border-white/[0.06]">
              <div className="flex items-center justify-between text-neutral-400 text-xs font-mono mb-1">
                <span>WIN RATE / PF</span>
                <Activity className="w-3.5 h-3.5 text-neutral-400" />
              </div>
              <div className="text-xl sm:text-2xl font-black text-white font-mono tracking-tight">
                73.8% <span className="text-xs text-neutral-400 font-normal">/ 2.45</span>
              </div>
              <div className="text-[11px] text-neutral-400 mt-1">
                48 Closed Trades · 0 Breaches
              </div>
            </div>

          </div>

          {/* Middle Row: Glowing SVG Equity Curve + Real-Time Drawdown Ring */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            
            {/* Left Chart Area (8 cols) */}
            <div className="lg:col-span-8 p-5 rounded-2xl bg-[#0e121a]/95 border border-white/[0.06] flex flex-col justify-between">
              
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div>
                  <h4 className="text-xs uppercase font-mono font-bold text-neutral-400 tracking-wider">
                    Cumulative Equity Curve ($200K Account)
                  </h4>
                  <div className="text-base sm:text-lg font-black text-white mt-0.5">
                    Consistent Compound Growth
                  </div>
                </div>

                {/* Timeframe Toggles */}
                <div className="flex gap-1 p-1 rounded-xl bg-white/[0.04] border border-white/10 text-xs font-mono font-bold">
                  {(["1D", "1W", "1M", "ALL"] as const).map((tf) => (
                    <button
                      key={tf}
                      onClick={() => setSelectedTimeframe(tf)}
                      className={`px-2.5 py-1 rounded-lg transition-all ${
                        selectedTimeframe === tf
                          ? "bg-[#ccff00] text-black shadow-sm"
                          : "text-neutral-400 hover:text-white"
                      }`}
                    >
                      {tf}
                    </button>
                  ))}
                </div>
              </div>

              {/* Glowing SVG Equity Curve */}
              <div className="relative w-full h-44 sm:h-52 pt-2">
                <svg viewBox="0 0 600 200" className="w-full h-full overflow-visible" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="equityGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#ccff00" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#ccff00" stopOpacity="0.0" />
                    </linearGradient>
                    <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
                      <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#ccff00" floodOpacity="0.75" />
                    </filter>
                  </defs>

                  {/* Horizontal Grid lines */}
                  <line x1="0" y1="40" x2="600" y2="40" stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" />
                  <line x1="0" y1="90" x2="600" y2="90" stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" />
                  <line x1="0" y1="140" x2="600" y2="140" stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" />

                  {/* Area Fill */}
                  <path
                    d="M 0 170 Q 70 160, 130 135 T 260 110 T 380 75 T 490 50 T 600 20 L 600 200 L 0 200 Z"
                    fill="url(#equityGradient)"
                  />

                  {/* Neon Equity Line */}
                  <path
                    d="M 0 170 Q 70 160, 130 135 T 260 110 T 380 75 T 490 50 T 600 20"
                    fill="none"
                    stroke="#ccff00"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    filter="url(#neonGlow)"
                  />

                  {/* End Data Point Pulse */}
                  <circle cx="600" cy="20" r="5" fill="#ccff00" className="animate-ping origin-center" />
                  <circle cx="600" cy="20" r="5" fill="#ffffff" stroke="#ccff00" strokeWidth="2.5" />
                </svg>
              </div>

              {/* Chart Footer Sub-Metrics */}
              <div className="pt-3 border-t border-white/[0.05] grid grid-cols-3 text-[11px] font-mono text-neutral-400">
                <div>
                  <span className="block text-neutral-500">START CAPITAL</span>
                  <span className="font-bold text-white">$200,000.00</span>
                </div>
                <div>
                  <span className="block text-neutral-500">PEAK PROFIT</span>
                  <span className="font-bold text-[#ccff00]">+$18,450.00</span>
                </div>
                <div>
                  <span className="block text-neutral-500">NEXT PAYOUT</span>
                  <span className="font-bold text-white">48h (Auto Crypto)</span>
                </div>
              </div>

            </div>

            {/* Right Gauge & Rule Integrity Card (4 cols) */}
            <div className="lg:col-span-4 p-5 rounded-2xl bg-[#0e121a]/95 border border-white/[0.06] flex flex-col justify-between space-y-4">
              <div>
                <span className="text-xs font-mono font-bold text-neutral-400 uppercase tracking-wider block mb-1">
                  Active Risk Radar
                </span>
                <h4 className="text-sm font-extrabold text-white">
                  Drawdown Thresholds
                </h4>
              </div>

              {/* Circular SVG Gauge */}
              <div className="flex flex-col items-center justify-center py-2">
                <div className="relative w-32 h-32 flex items-center justify-center">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                    <circle
                      cx="60"
                      cy="60"
                      r="48"
                      fill="none"
                      stroke="rgba(255,255,255,0.08)"
                      strokeWidth="10"
                    />
                    <circle
                      cx="60"
                      cy="60"
                      r="48"
                      fill="none"
                      stroke="#ccff00"
                      strokeWidth="10"
                      strokeDasharray="301.6"
                      strokeDashoffset="60"
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute text-center">
                    <span className="text-2xl font-black text-white font-mono block leading-none">94%</span>
                    <span className="text-[10px] text-neutral-400 font-mono uppercase tracking-wider">Safe Margin</span>
                  </div>
                </div>
              </div>

              {/* Rule Checks Pill List */}
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-2 rounded-xl bg-black/40 border border-white/5">
                  <span className="text-neutral-400">Daily Loss (5% max)</span>
                  <span className="text-emerald-400 font-mono font-bold">0.6% used</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-xl bg-black/40 border border-white/5">
                  <span className="text-neutral-400">Total Drawdown (10%)</span>
                  <span className="text-emerald-400 font-mono font-bold">0.0% used</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-xl bg-black/40 border border-white/5">
                  <span className="text-neutral-400">News Trading</span>
                  <span className="text-[#ccff00] font-bold">✓ Allowed</span>
                </div>
              </div>

            </div>

          </div>

          {/* Bottom Row: Recent Live Payout Dispatched Receipt */}
          <div className="p-3.5 sm:p-4 rounded-xl bg-[#07090e]/90 border border-[#ccff00]/25 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#ccff00]/15 flex items-center justify-center text-[#ccff00] shrink-0">
                <CheckCircle2 size={16} />
              </div>
              <div>
                <span className="font-bold text-white block">
                  Last Payout Dispatched: <span className="text-[#ccff00] font-mono">$12,160.00 USDT (TRC20)</span>
                </span>
                <span className="text-[11px] text-neutral-400">
                  TX: 0x8a91...4e21 · Confirmed on-chain in 42 seconds
                </span>
              </div>
            </div>

            <div className="shrink-0 flex items-center gap-2">
              <span className="text-[10px] uppercase font-mono font-bold px-2 py-1 rounded-md bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                ✓ Payout Vault Verified
              </span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
