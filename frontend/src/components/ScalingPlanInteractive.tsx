'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Trophy,
  TrendingUp,
  Shield,
  Zap,
  ArrowRight,
  CheckCircle2,
  DollarSign,
  Sparkles,
  ChevronRight,
} from 'lucide-react';

interface ScalingTier {
  level: number;
  capital: number;
  capitalLabel: string;
  profitSplit: number;
  monthlyGainEstimated: number; // calculated at user selected gain %
  drawdownBuffer: string;
  dailyLossLimit: string;
  quarter: string;
  perks: string[];
}

const TIERS: ScalingTier[] = [
  {
    level: 1,
    capital: 100000,
    capitalLabel: '$100,000',
    profitSplit: 80,
    monthlyGainEstimated: 8000,
    drawdownBuffer: '$10,000 (10%)',
    dailyLossLimit: '$5,000 (5%)',
    quarter: 'Initial Phase',
    perks: ['Standard Bi-Weekly Payouts', '80% Profit Split', 'Raw MT5 Spreads'],
  },
  {
    level: 2,
    capital: 125000,
    capitalLabel: '$125,000',
    profitSplit: 80,
    monthlyGainEstimated: 10000,
    drawdownBuffer: '$12,500 (10%)',
    dailyLossLimit: '$6,250 (5%)',
    quarter: 'Quarter 1 (+25%)',
    perks: ['Bi-Weekly Payouts', '100% Refundable Fee Returned', 'Priority Support'],
  },
  {
    level: 3,
    capital: 160000,
    capitalLabel: '$160,000',
    profitSplit: 85,
    monthlyGainEstimated: 13600,
    drawdownBuffer: '$16,000 (10%)',
    dailyLossLimit: '$8,000 (5%)',
    quarter: 'Quarter 2 (+28%)',
    perks: ['85% Profit Share Boost', 'Weekly Crypto Payouts', 'Direct Discord Desk'],
  },
  {
    level: 4,
    capital: 200000,
    capitalLabel: '$200,000',
    profitSplit: 85,
    monthlyGainEstimated: 17000,
    drawdownBuffer: '$20,000 (10%)',
    dailyLossLimit: '$10,000 (5%)',
    quarter: 'Quarter 3 (+25%)',
    perks: ['Weekly Payouts', 'Zero Commission on FX', 'Institutional Liquidity Pool'],
  },
  {
    level: 5,
    capital: 350000,
    capitalLabel: '$350,000',
    profitSplit: 90,
    monthlyGainEstimated: 31500,
    drawdownBuffer: '$35,000 (10%)',
    dailyLossLimit: '$17,500 (5%)',
    quarter: 'Quarter 4 (+75%)',
    perks: ['90% Max Profit Split', 'On-Demand 24h Payouts', 'Private Institutional Account'],
  },
  {
    level: 6,
    capital: 600000,
    capitalLabel: '$600,000',
    profitSplit: 90,
    monthlyGainEstimated: 54000,
    drawdownBuffer: '$60,000 (10%)',
    dailyLossLimit: '$30,000 (5%)',
    quarter: 'Quarter 5 (+71%)',
    perks: ['90% Profit Split', 'Dedicated Risk Manager', 'Direct FIX API Access'],
  },
  {
    level: 7,
    capital: 1000000,
    capitalLabel: '$1,000,000',
    profitSplit: 90,
    monthlyGainEstimated: 90000,
    drawdownBuffer: '$100,000 (10%)',
    dailyLossLimit: '$50,000 (5%)',
    quarter: 'VIP PRIME APEX',
    perks: ['90% Profit Split', 'Daily On-Demand Payouts', 'Annual All-Inclusive Dubai VIP Retreat'],
  },
];

export default function ScalingPlanInteractive() {
  const [selectedIdx, setSelectedIdx] = useState<number>(3); // Default at $200K
  const [targetGainPct, setTargetGainPct] = useState<number>(8); // 8% average gain

  const currentTier = TIERS[selectedIdx];
  const monthlyProfitGross = (currentTier.capital * (targetGainPct / 100));
  const traderTakeHome = monthlyProfitGross * (currentTier.profitSplit / 100);

  return (
    <section id="scaling-plan" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/[0.06]">
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#ccff00]/10 border border-[#ccff00]/20 text-[11px] font-black text-[#ccff00] uppercase tracking-wider mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          Interactive Scaling Engine
        </div>
        <h2 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-tight">
          Scale Up To <span className="text-[#ccff00]">$1,000,000</span> Capital.
        </h2>
        <p className="mt-4 text-sm sm:text-base text-neutral-400 max-w-2xl mx-auto">
          Prove consistency on our funded accounts and we automatically inject 25% to 75% more capital every 3 months.
          Calculate your compounded earning curve below.
        </p>
      </div>

      <div className="bg-[#0d0e12] border border-white/10 rounded-3xl p-6 sm:p-10 shadow-2xl backdrop-blur-xl relative overflow-hidden">
        {/* Ambient glow */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#ccff00]/[0.05] blur-3xl pointer-events-none rounded-full" />

        {/* Level Step Selector Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3 text-xs text-neutral-400">
            <span className="font-bold uppercase tracking-wider text-neutral-300">Compounding Tier Progression</span>
            <span className="font-mono text-[#ccff00]">STAGE {currentTier.level} OF 7</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
            {TIERS.map((tier, idx) => {
              const isActive = idx === selectedIdx;
              const isPast = idx < selectedIdx;
              return (
                <button
                  key={tier.level}
                  onClick={() => setSelectedIdx(idx)}
                  className={`p-3 rounded-2xl border text-left transition-all duration-200 relative ${
                    isActive
                      ? 'bg-[#ccff00] text-black border-[#ccff00] shadow-[0_0_20px_rgba(204,255,0,0.3)] scale-[1.03] z-10'
                      : isPast
                      ? 'bg-[#151922] text-white border-white/10 hover:border-white/20'
                      : 'bg-[#10131a] text-neutral-400 border-white/5 hover:border-white/15'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-[10px] font-black uppercase ${isActive ? 'text-black' : 'text-neutral-500'}`}>
                      Lvl {tier.level}
                    </span>
                    {tier.level === 7 && (
                      <Trophy className={`w-3 h-3 ${isActive ? 'text-black' : 'text-amber-400'}`} />
                    )}
                  </div>
                  <div className={`text-base font-black tracking-tight ${isActive ? 'text-black' : 'text-white'}`}>
                    {tier.capitalLabel}
                  </div>
                  <div className={`text-[10px] mt-0.5 font-semibold truncate ${isActive ? 'text-neutral-900' : 'text-neutral-500'}`}>
                    {tier.profitSplit}% Split
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Compounding Curve Graphical Representation */}
        <div className="bg-[#08090c] border border-white/5 rounded-2xl p-6 sm:p-8 mb-8 relative">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-6 pb-6 border-b border-white/5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[11px] font-mono text-neutral-400 uppercase">{currentTier.quarter}</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-[#ccff00]/15 text-[#ccff00]">
                  ACTIVE LEVEL
                </span>
              </div>
              <h3 className="text-3xl sm:text-4xl font-black text-white flex items-baseline gap-3">
                <span>{currentTier.capitalLabel}</span>
                <span className="text-xs text-neutral-500 font-normal">Simulated Institutional Capital</span>
              </h3>
            </div>

            {/* Simulated Gain Percentage Slider */}
            <div className="bg-[#12161f] border border-white/10 rounded-2xl p-4 sm:w-80">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="text-neutral-400 font-semibold">Simulated Monthly Gain:</span>
                <span className="font-mono font-black text-[#ccff00] text-sm">{targetGainPct}%</span>
              </div>
              <input
                type="range"
                min="3"
                max="15"
                step="1"
                value={targetGainPct}
                onChange={(e) => setTargetGainPct(Number(e.target.value))}
                className="w-full accent-[#ccff00] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-neutral-500 font-mono mt-1">
                <span>3% Conservative</span>
                <span>8% Average</span>
                <span>15% Aggressive</span>
              </div>
            </div>
          </div>

          {/* Stepped Compounding Heights Graph Visual */}
          <div className="h-44 sm:h-52 flex items-end justify-between gap-2 sm:gap-4 pt-6 px-2 sm:px-6">
            {TIERS.map((t, i) => {
              const heightPct = Math.round((t.capital / 1000000) * 100);
              const isSelected = i === selectedIdx;
              return (
                <div
                  key={t.level}
                  onClick={() => setSelectedIdx(i)}
                  className="flex-1 flex flex-col items-center justify-end h-full group cursor-pointer"
                >
                  <div
                    className={`text-[10px] font-mono font-bold mb-2 transition-all ${
                      isSelected ? 'text-[#ccff00] scale-110 font-black' : 'text-neutral-500 opacity-60'
                    }`}
                  >
                    {t.capitalLabel}
                  </div>

                  <div
                    style={{ height: `${Math.max(14, heightPct)}%` }}
                    className={`w-full rounded-t-xl transition-all duration-300 relative flex items-center justify-center ${
                      isSelected
                        ? 'bg-gradient-to-t from-[#ccff00]/60 via-[#ccff00] to-[#ffffff] shadow-[0_0_25px_rgba(204,255,0,0.4)]'
                        : i < selectedIdx
                        ? 'bg-gradient-to-t from-[#1b2230] to-[#2e3b52] hover:bg-neutral-600'
                        : 'bg-neutral-900 border-t border-white/10 hover:bg-neutral-800'
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute -top-3 w-3 h-3 bg-[#ccff00] rounded-full animate-ping" />
                    )}
                  </div>

                  <span
                    className={`text-[9px] uppercase tracking-wider font-bold mt-2 truncate w-full text-center ${
                      isSelected ? 'text-[#ccff00]' : 'text-neutral-600'
                    }`}
                  >
                    Lvl {t.level}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 3 Value Output Columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-[#12161f] border border-white/5 rounded-2xl p-5">
            <span className="text-[11px] uppercase font-bold text-neutral-400 tracking-wider">
              YOUR PROJECTED MONTHLY REWARD ({currentTier.profitSplit}% SPLIT)
            </span>
            <div className="text-3xl sm:text-4xl font-black text-[#ccff00] font-mono mt-1">
              ${traderTakeHome.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </div>
            <p className="text-xs text-neutral-400 mt-2">
              Based on {targetGainPct}% monthly performance (${monthlyProfitGross.toLocaleString('en-US')} gross gain).
            </p>
          </div>

          <div className="bg-[#12161f] border border-white/5 rounded-2xl p-5">
            <span className="text-[11px] uppercase font-bold text-neutral-400 tracking-wider">
              RISK SAFEGUARDS ALLOCATED
            </span>
            <div className="space-y-1.5 mt-2 text-xs">
              <div className="flex justify-between">
                <span className="text-neutral-400">Max Drawdown Room:</span>
                <span className="font-bold text-white font-mono">{currentTier.drawdownBuffer}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Daily Loss Limit:</span>
                <span className="font-bold text-white font-mono">{currentTier.dailyLossLimit}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Drawdown Nature:</span>
                <span className="font-bold text-emerald-400">Static (Never Trails)</span>
              </div>
            </div>
          </div>

          <div className="bg-[#12161f] border border-white/5 rounded-2xl p-5 flex flex-col justify-between">
            <div>
              <span className="text-[11px] uppercase font-bold text-neutral-400 tracking-wider">
                TIER PRIVILEGES
              </span>
              <ul className="space-y-1.5 mt-2">
                {currentTier.perks.map((perk, pi) => (
                  <li key={pi} className="text-xs text-neutral-300 flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#ccff00] shrink-0" />
                    <span>{perk}</span>
                  </li>
                ))}
              </ul>
            </div>

            <Link
              href="/challenges"
              className="mt-4 w-full py-2.5 rounded-xl bg-[#ccff00] hover:bg-[#b8e600] text-black font-black text-xs uppercase tracking-wider text-center transition flex items-center justify-center gap-1.5"
            >
              <span>Unlock This Scale Stage</span>
              <ChevronRight className="w-3.5 h-3.5 stroke-[3]" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
