"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Sparkles,
  TrendingUp,
  DollarSign,
  ShieldCheck,
  Zap,
  Target,
  Percent,
  ChevronDown,
  HelpCircle,
  Clock,
  Layers,
} from "lucide-react";

const ACCOUNT_TIERS = [
  { size: 10000, label: "$10,000", price: 49, slug: "10k-evaluation" },
  { size: 25000, label: "$25,000", price: 98, slug: "25k-evaluation" },
  { size: 50000, label: "$50,000", price: 164, slug: "50k-evaluation" },
  { size: 100000, label: "$100,000", price: 274, slug: "100k-evaluation" },
  { size: 200000, label: "$200,000", price: 539, slug: "200k-evaluation" },
];

const RETURN_PRESETS = [5, 8, 10, 15];

const CALCULATOR_FAQS = [
  {
    q: "How are monthly payouts calculated and paid out?",
    a: "Payouts are determined by your net trading profits multiplied by your profit split (80% standard, or 90% scaled). Once eligible, you request your reward directly from the dashboard to receive on-demand crypto (USDT ERC-20 / TRC-20) or direct international bank wire.",
  },
  {
    q: "What is the difference between 1-Step and 2-Step Evaluations?",
    a: "A 1-Step Evaluation has a single phase with a 10% profit target and a 6% trailing drawdown limit for fast funding. A 2-Step Evaluation has Phase 1 (8% target) and Phase 2 (5% target) with a generous 10% static drawdown and 5% daily loss limit, giving conservative traders more breathing room.",
  },
  {
    q: "Is the evaluation fee really 100% refundable?",
    a: "Yes. Upon completing your evaluation milestones and generating your very first profitable withdrawal on your MaxFunded Trader account, 100% of your initial fee is added to your payout.",
  },
  {
    q: "Are there any minimum or maximum trading day limits?",
    a: "Zero time limits. There are no minimum trading days required to pass either phase, and no maximum expiry deadline. You can trade at your own pace without pressure.",
  },
];

export default function PayoutCalculator() {
  const [selectedTier, setSelectedTier] = useState(ACCOUNT_TIERS[3]); // Default $100K
  const [returnPct, setReturnPct] = useState(8); // Default 8% profit
  const [splitPct, setSplitPct] = useState(90); // 90% default
  const [evalType, setEvalType] = useState<"2-step" | "1-step">("2-step");
  const [activeFaq, setActiveFaq] = useState<number | null>(0);

  // Calculations
  const grossProfit = (selectedTier.size * returnPct) / 100;
  const traderPayout = (grossProfit * splitPct) / 100;
  const roiPct = Math.round((traderPayout / selectedTier.price) * 100);

  // Dynamic Rule calculations based on tier & eval type
  const profitTargetPhase1 = evalType === "2-step" ? selectedTier.size * 0.08 : selectedTier.size * 0.10;
  const profitTargetPhase2 = evalType === "2-step" ? selectedTier.size * 0.05 : 0;
  const maxDrawdownAmount = evalType === "2-step" ? selectedTier.size * 0.10 : selectedTier.size * 0.06;
  const dailyLossAmount = selectedTier.size * 0.05;

  return (
    <section className="calculator-section py-20 sm:py-28 px-4 sm:px-6 lg:px-8 border-t border-white/[0.06] relative">
      <div className="max-w-7xl mx-auto">
        
        {/* Section Header */}
        <div className="text-center mb-14 reveal">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#ccff00]/10 border border-[#ccff00]/30 text-[#ccff00] text-xs font-mono font-bold uppercase tracking-wider mb-4">
            <Sparkles size={12} />
            <span>Interactive Profit Simulation Engine</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-tight">
            How Much Can You <span className="text-[#ccff00] neon-glow-text">Earn?</span>
          </h2>
          <p className="mt-3 text-sm sm:text-base text-neutral-400 max-w-2xl mx-auto">
            Select your funded balance, estimate monthly performance, and see your exact take-home profit payouts.
          </p>
        </div>

        {/* Main Calculator Terminal Card */}
        <div className="bg-[#0b0d12]/95 border border-white/10 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden backdrop-blur-xl">
          {/* Subtle Ambient Glow */}
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#ccff00]/[0.04] blur-3xl pointer-events-none rounded-full -z-10" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Controls Column (7 cols) */}
            <div className="lg:col-span-7 space-y-7">
              {/* 1. Account Size Selector with Liquid Active State Glow */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-xs font-black uppercase tracking-wider text-neutral-300 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#ccff00]/20 text-[#ccff00] text-[10px] flex items-center justify-center font-mono font-black">1</span>
                    Select Evaluation Capital
                  </label>
                  <span className="text-xs font-bold text-[#ccff00] font-mono">
                    ${selectedTier.size.toLocaleString()} Funded Tier
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-2.5">
                  {ACCOUNT_TIERS.map((tier) => {
                    const isActive = selectedTier.size === tier.size;
                    return (
                      <button
                        key={tier.size}
                        onClick={() => setSelectedTier(tier)}
                        className={`calculator-tab p-3 text-center ${isActive ? "active" : ""}`}
                      >
                        <div className="text-xs sm:text-sm font-black">{tier.label}</div>
                        <div className="text-[10px] text-neutral-400 mt-0.5">${tier.price}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Monthly Return Slider + Quick Presets */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-xs font-black uppercase tracking-wider text-neutral-300 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-[#ccff00]/20 text-[#ccff00] text-[10px] flex items-center justify-center font-mono font-black">2</span>
                    Monthly Profit Performance
                  </label>
                  <span className="text-sm font-black text-[#ccff00] font-mono px-3 py-1 rounded-lg bg-[#ccff00]/10 border border-[#ccff00]/30 shadow-[0_0_15px_rgba(204,255,0,0.1)]">
                    +{returnPct}% Profit Target
                  </span>
                </div>

                {/* Slider Input */}
                <input
                  type="range"
                  min="2"
                  max="20"
                  step="1"
                  value={returnPct}
                  onChange={(e) => setReturnPct(Number(e.target.value))}
                  className="w-full h-2.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-[#ccff00]"
                />

                {/* Quick Presets */}
                <div className="flex items-center justify-between mt-3 gap-2">
                  <span className="text-[11px] text-neutral-400 font-semibold">Performance Presets:</span>
                  <div className="flex gap-1.5">
                    {RETURN_PRESETS.map((preset) => (
                      <button
                        key={preset}
                        onClick={() => setReturnPct(preset)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition border ${
                          returnPct === preset
                            ? "bg-[#ccff00] text-black border-[#ccff00] shadow-[0_0_12px_rgba(204,255,0,0.3)] font-black"
                            : "bg-white/5 text-neutral-400 border-white/10 hover:text-white hover:border-white/20"
                        }`}
                      >
                        {preset}%
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 3. Profit Split Toggle */}
              <div className="flex flex-wrap items-center justify-between pt-4 border-t border-white/[0.08] gap-3">
                <div>
                  <span className="text-xs font-bold text-white block">Performance Profit Split</span>
                  <span className="text-[11px] text-neutral-400">Standard 80% vs Scaled 90% VIP</span>
                </div>
                <div className="flex gap-1.5 p-1 rounded-xl bg-black/40 border border-white/10">
                  <button
                    onClick={() => setSplitPct(80)}
                    className={`calculator-tab px-4 py-1.5 text-xs font-bold ${
                      splitPct === 80 ? "active" : ""
                    }`}
                  >
                    80% Split
                  </button>
                  <button
                    onClick={() => setSplitPct(90)}
                    className={`calculator-tab px-4 py-1.5 text-xs font-bold flex items-center gap-1 ${
                      splitPct === 90 ? "active" : ""
                    }`}
                  >
                    <Sparkles size={11} className="text-[#ccff00]" />
                    90% Scale
                  </button>
                </div>
              </div>
            </div>

            {/* Result Card Column (5 cols) with Animated Shift */}
            <div className="lg:col-span-5 bg-[#0f1218] border-2 border-[#ccff00]/50 rounded-3xl p-6 sm:p-8 text-center relative shadow-[0_0_45px_rgba(204,255,0,0.14)]">
              <div className="text-[10px] uppercase font-black tracking-widest text-neutral-400 mb-1">
                Estimated Monthly Reward Payout
              </div>
              
              {/* Big Cash Number with Matrix Slide-Up Fade Animation */}
              <div
                key={`${selectedTier.size}-${returnPct}-${splitPct}`}
                className="animate-metric-shift text-4xl sm:text-5xl font-black text-[#ccff00] font-mono tracking-tight my-3 neon-glow-text"
              >
                ${traderPayout.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>

              <p className="text-xs text-neutral-400 mb-6">
                Withdrawn directly via USDT or Bank Wire on-demand
              </p>

              {/* Metric Breakdown Rows with Animated Key Shift */}
              <div
                key={`metrics-${selectedTier.size}-${returnPct}-${splitPct}`}
                className="animate-metric-shift space-y-2.5 text-xs border-y border-white/10 py-4 mb-6"
              >
                <div className="flex justify-between items-center text-neutral-300">
                  <span>Gross Trading Gain ({returnPct}%):</span>
                  <span className="font-mono font-bold text-white">
                    +${grossProfit.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between items-center text-neutral-300">
                  <span>Trader Take-Home ({splitPct}%):</span>
                  <span className="font-mono font-bold text-[#ccff00]">
                    ${traderPayout.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between items-center text-neutral-300">
                  <span>One-Time Evaluation Fee:</span>
                  <span className="font-mono text-neutral-300">
                    ${selectedTier.price} <span className="text-[10px] text-emerald-400 font-bold">(100% Refundable)</span>
                  </span>
                </div>
                <div className="flex justify-between items-center text-neutral-300">
                  <span>Fee Return on 1st Payout:</span>
                  <span className="font-mono font-black text-[#ccff00]">
                    +{roiPct}% Return
                  </span>
                </div>
              </div>

              {/* CTA Button */}
              <Link
                href="/challenges"
                className="btn-neon w-full py-3.5 px-6 rounded-2xl bg-[#ccff00] hover:bg-[#b3e600] text-black font-black text-xs sm:text-sm uppercase tracking-tight shadow-neon transition flex items-center justify-center gap-2"
              >
                <span>Get Your {selectedTier.label} Account</span>
                <ArrowRight size={16} className="stroke-[3]" />
              </Link>

              <div className="flex items-center justify-center gap-2 mt-4 text-[10px] text-neutral-400">
                <CheckCircle2 size={12} className="text-[#ccff00]" />
                <span>100% fee refunded with your first profit payout</span>
              </div>
            </div>

          </div>
        </div>

        {/* ── BENTO RULES BOX ────────────────────────────────────────────── */}
        <div className="mt-16 reveal">
          <div className="flex flex-wrap items-center justify-between mb-8 gap-4">
            <div>
              <h3 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
                Active Rules for <span className="text-[#ccff00]">{selectedTier.label}</span> Evaluation
              </h3>
              <p className="text-xs sm:text-sm text-neutral-400 mt-1">
                Transparent static drawdown limits and zero hidden restrictions.
              </p>
            </div>
            {/* 1-Step vs 2-Step Evaluation Mode Switcher */}
            <div className="flex gap-1.5 p-1 rounded-xl bg-black/60 border border-white/10">
              <button
                onClick={() => setEvalType("2-step")}
                className={`calculator-tab px-4 py-2 text-xs font-bold ${
                  evalType === "2-step" ? "active" : ""
                }`}
              >
                2-Step Evaluation (Standard)
              </button>
              <button
                onClick={() => setEvalType("1-step")}
                className={`calculator-tab px-4 py-2 text-xs font-bold flex items-center gap-1.5 ${
                  evalType === "1-step" ? "active" : ""
                }`}
              >
                <Zap size={12} className="text-[#ccff00]" />
                1-Step Rapid (Express)
              </button>
            </div>
          </div>

          <div
            key={`bento-${selectedTier.size}-${evalType}`}
            className="animate-metric-shift grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {/* Bento Card 1: Profit Target */}
            <div className="metric-card">
              <div className="flex items-center justify-between text-xs text-neutral-400">
                <span className="font-bold uppercase tracking-wider">Profit Target</span>
                <Target size={16} className="text-[#ccff00]" />
              </div>
              <div className="text-2xl font-black text-white font-mono mt-1">
                {evalType === "2-step" ? "8% / 5%" : "10%"}
              </div>
              <div className="text-xs text-neutral-400 mt-1">
                {evalType === "2-step"
                  ? `Phase 1: $${profitTargetPhase1.toLocaleString()} • Phase 2: $${profitTargetPhase2.toLocaleString()}`
                  : `Single Phase: $${profitTargetPhase1.toLocaleString()}`}
              </div>
            </div>

            {/* Bento Card 2: Maximum Overall Drawdown */}
            <div className="metric-card">
              <div className="flex items-center justify-between text-xs text-neutral-400">
                <span className="font-bold uppercase tracking-wider">Overall Max Loss</span>
                <ShieldCheck size={16} className="text-emerald-400" />
              </div>
              <div className="text-2xl font-black text-white font-mono mt-1">
                {evalType === "2-step" ? "10% Static" : "6% Trailing"}
              </div>
              <div className="text-xs text-neutral-400 mt-1">
                Max drawdown limit: ${maxDrawdownAmount.toLocaleString()} from initial balance
              </div>
            </div>

            {/* Bento Card 3: Maximum Daily Loss */}
            <div className="metric-card">
              <div className="flex items-center justify-between text-xs text-neutral-400">
                <span className="font-bold uppercase tracking-wider">Daily Drawdown</span>
                <Clock size={16} className="text-[#ccff00]" />
              </div>
              <div className="text-2xl font-black text-white font-mono mt-1">
                5% Static
              </div>
              <div className="text-xs text-neutral-400 mt-1">
                Daily safety guard: ${dailyLossAmount.toLocaleString()} per calendar day
              </div>
            </div>

            {/* Bento Card 4: Minimum Trading Days */}
            <div className="metric-card">
              <div className="flex items-center justify-between text-xs text-neutral-400">
                <span className="font-bold uppercase tracking-wider">Min Trading Days</span>
                <Zap size={16} className="text-[#ccff00]" />
              </div>
              <div className="text-2xl font-black text-[#ccff00] font-mono mt-1">
                0 Days (No Minimum)
              </div>
              <div className="text-xs text-neutral-400 mt-1">
                Pass in 1 day or take as long as you need. No time limit.
              </div>
            </div>

            {/* Bento Card 5: Profit Split */}
            <div className="metric-card">
              <div className="flex items-center justify-between text-xs text-neutral-400">
                <span className="font-bold uppercase tracking-wider">Profit Split</span>
                <Percent size={16} className="text-[#ccff00]" />
              </div>
              <div className="text-2xl font-black text-white font-mono mt-1">
                80% – 90%
              </div>
              <div className="text-xs text-neutral-400 mt-1">
                Scale to 90% after your first successful evaluation cycle
              </div>
            </div>

            {/* Bento Card 6: Refundable Fee */}
            <div className="metric-card">
              <div className="flex items-center justify-between text-xs text-neutral-400">
                <span className="font-bold uppercase tracking-wider">Evaluation Fee</span>
                <DollarSign size={16} className="text-emerald-400" />
              </div>
              <div className="text-2xl font-black text-emerald-400 font-mono mt-1">
                100% Refundable
              </div>
              <div className="text-xs text-neutral-400 mt-1">
                ${selectedTier.price} fully reimbursed on your 1st profit payout
              </div>
            </div>
          </div>
        </div>

        {/* ── NEON-STYLED DATA TABLE: 1-STEP VS 2-STEP EVALUATION COMPARISON ── */}
        <div className="mt-20 reveal">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-neutral-400 mb-3">
              <Layers size={13} className="text-[#ccff00]" />
              <span>Program Architecture</span>
            </div>
            <h3 className="text-2xl sm:text-4xl font-black text-white uppercase tracking-tight">
              Compare <span className="text-[#ccff00]">1-Step</span> vs <span className="text-white">2-Step</span> Evaluations
            </h3>
            <p className="text-xs sm:text-sm text-neutral-400 max-w-xl mx-auto mt-2">
              Choose the program that best matches your risk management and trading style.
            </p>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-white/10 bg-[#0c0e14] shadow-2xl">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-[#121620]">
                  <th className="py-4 px-6 font-black uppercase text-xs tracking-wider text-neutral-400">Rule / Feature</th>
                  <th className="py-4 px-6 font-black uppercase text-xs tracking-wider text-[#ccff00] bg-[#ccff00]/5 border-x border-[#ccff00]/20">
                    <div className="flex items-center gap-2">
                      <span>2-Step Standard</span>
                      <span className="px-2 py-0.5 rounded text-[10px] bg-[#ccff00] text-black font-extrabold">Popular</span>
                    </div>
                  </th>
                  <th className="py-4 px-6 font-black uppercase text-xs tracking-wider text-white">
                    <div className="flex items-center gap-2">
                      <span>1-Step Rapid</span>
                      <span className="px-2 py-0.5 rounded text-[10px] bg-white/10 text-neutral-300 font-bold">Fast-Track</span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-neutral-300 font-medium">
                <tr className="hover:bg-white/[0.02] transition">
                  <td className="py-4 px-6 text-white font-bold">Profit Target</td>
                  <td className="py-4 px-6 font-mono font-bold text-white bg-[#ccff00]/[0.02] border-x border-[#ccff00]/15">
                    Phase 1: 8% / Phase 2: 5%
                  </td>
                  <td className="py-4 px-6 font-mono font-bold text-white">Phase 1: 10% (Single Step)</td>
                </tr>
                <tr className="hover:bg-white/[0.02] transition">
                  <td className="py-4 px-6 text-white font-bold">Maximum Overall Drawdown</td>
                  <td className="py-4 px-6 font-mono font-bold text-[#ccff00] bg-[#ccff00]/[0.02] border-x border-[#ccff00]/15">
                    10% Static Drawdown
                  </td>
                  <td className="py-4 px-6 font-mono font-bold text-neutral-300">6% Trailing Drawdown</td>
                </tr>
                <tr className="hover:bg-white/[0.02] transition">
                  <td className="py-4 px-6 text-white font-bold">Daily Drawdown Limit</td>
                  <td className="py-4 px-6 font-mono font-bold text-white bg-[#ccff00]/[0.02] border-x border-[#ccff00]/15">
                    5% Static
                  </td>
                  <td className="py-4 px-6 font-mono font-bold text-white">4% Static</td>
                </tr>
                <tr className="hover:bg-white/[0.02] transition">
                  <td className="py-4 px-6 text-white font-bold">Minimum Trading Days</td>
                  <td className="py-4 px-6 font-mono font-bold text-emerald-400 bg-[#ccff00]/[0.02] border-x border-[#ccff00]/15">
                    0 Days (No Min Days)
                  </td>
                  <td className="py-4 px-6 font-mono font-bold text-emerald-400">0 Days (No Min Days)</td>
                </tr>
                <tr className="hover:bg-white/[0.02] transition">
                  <td className="py-4 px-6 text-white font-bold">Trading Period (Time Limit)</td>
                  <td className="py-4 px-6 font-mono font-bold text-white bg-[#ccff00]/[0.02] border-x border-[#ccff00]/15">
                    Unlimited / No Expiry
                  </td>
                  <td className="py-4 px-6 font-mono font-bold text-white">Unlimited / No Expiry</td>
                </tr>
                <tr className="hover:bg-white/[0.02] transition">
                  <td className="py-4 px-6 text-white font-bold">Profit Split</td>
                  <td className="py-4 px-6 font-mono font-bold text-[#ccff00] bg-[#ccff00]/[0.02] border-x border-[#ccff00]/15">
                    80% Standard → 90% Scaled
                  </td>
                  <td className="py-4 px-6 font-mono font-bold text-white">80% Standard → 90% Scaled</td>
                </tr>
                <tr className="hover:bg-white/[0.02] transition">
                  <td className="py-4 px-6 text-white font-bold">Refundable Evaluation Fee</td>
                  <td className="py-4 px-6 font-mono font-bold text-emerald-400 bg-[#ccff00]/[0.02] border-x border-[#ccff00]/15">
                    100% on First Payout
                  </td>
                  <td className="py-4 px-6 font-mono font-bold text-emerald-400">100% on First Payout</td>
                </tr>
                <tr className="hover:bg-white/[0.02] transition">
                  <td className="py-4 px-6 text-white font-bold">Weekend & News Holding</td>
                  <td className="py-4 px-6 font-mono font-bold text-white bg-[#ccff00]/[0.02] border-x border-[#ccff00]/15">
                    Allowed (Crypto, FX, Indices)
                  </td>
                  <td className="py-4 px-6 font-mono font-bold text-white">Allowed</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* ── GLOWING FAQ DROPDOWN COMPONENT (BENEATH CALCULATOR) ────────── */}
        <div className="mt-20 reveal">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ccff00]/10 border border-[#ccff00]/25 text-[#ccff00] text-xs font-mono font-bold uppercase tracking-wider mb-3">
              <HelpCircle size={13} />
              <span>Calculator & Payout FAQs</span>
            </div>
            <h3 className="text-2xl sm:text-4xl font-black text-white uppercase tracking-tight">
              Frequently Asked <span className="text-[#ccff00]">Questions</span>
            </h3>
            <p className="text-xs sm:text-sm text-neutral-400 max-w-xl mx-auto mt-2">
              Everything you need to know about profit payouts, account scaling, and evaluation rules.
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-3">
            {CALCULATOR_FAQS.map((faq, idx) => {
              const isOpen = activeFaq === idx;
              return (
                <div
                  key={idx}
                  className={`faq-glowing-card ${isOpen ? "active" : ""}`}
                >
                  <button
                    onClick={() => setActiveFaq(isOpen ? null : idx)}
                    className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 hover:bg-white/[0.02] transition"
                  >
                    <span className="font-bold text-sm sm:text-base text-white">
                      {faq.q}
                    </span>
                    <ChevronDown
                      className={`w-5 h-5 text-neutral-400 shrink-0 transition-transform duration-300 ${
                        isOpen ? "rotate-180 text-[#ccff00]" : ""
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 sm:px-6 pb-6 text-xs sm:text-sm text-neutral-300 leading-relaxed border-t border-white/5 pt-4 animate-fade-up">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
}
