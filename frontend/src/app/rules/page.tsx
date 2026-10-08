"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowRight,
  HelpCircle,
  Scale,
  Calendar,
  Clock,
  TrendingUp,
  Percent,
  Zap,
} from "lucide-react";

export default function RulesPage() {
  const [activeTier, setActiveTier] = useState<"standard" | "scaling">("standard");

  const matrixRules = [
    {
      objective: "Trading Period",
      phase1: "Unlimited",
      phase2: "Unlimited",
      funded: "Unlimited",
      notes: "No rushed deadlines. Take as much time as you need to pass.",
      highlight: false,
    },
    {
      objective: "Minimum Trading Days",
      phase1: "0 Days (No Minimum)",
      phase2: "0 Days (No Minimum)",
      funded: "None",
      notes: "Pass as fast as your trading allows. No artificial waiting periods.",
      highlight: true,
    },
    {
      objective: "Maximum Daily Loss",
      phase1: "5%",
      phase2: "5%",
      funded: "5%",
      notes: "Calculated based on daily starting equity. Resets at 00:00 server time.",
      highlight: true,
    },
    {
      objective: "Maximum Total Drawdown",
      phase1: "10%",
      phase2: "10%",
      funded: "10%",
      notes: "Calculated from initial balance or high-water mark.",
      highlight: true,
    },
    {
      objective: "Profit Target",
      phase1: "10%",
      phase2: "5%",
      funded: "No Target",
      notes: "Reach target while staying within daily and overall drawdown limits.",
      highlight: true,
    },
    {
      objective: "Profit Split",
      phase1: "N/A",
      phase2: "N/A",
      funded: "80% to 90%",
      notes: "Keep up to 90% of your earnings on all funded accounts.",
      highlight: true,
    },
    {
      objective: "Leverage",
      phase1: "1:100",
      phase2: "1:100",
      funded: "1:100",
      notes: "Up to 1:100 on Forex pairs, 1:30 on major indices and commodities.",
      highlight: false,
    },
    {
      objective: "Weekend Holding",
      phase1: "Allowed",
      phase2: "Allowed",
      funded: "Allowed",
      notes: "Hold swing positions over weekends and market closes without penalty.",
      highlight: false,
    },
    {
      objective: "News Trading",
      phase1: "Allowed",
      phase2: "Allowed",
      funded: "Allowed",
      notes: "Trade before, during, and after high-impact macroeconomic news.",
      highlight: false,
    },
    {
      objective: "Expert Advisors (EAs)",
      phase1: "Allowed",
      phase2: "Allowed",
      funded: "Allowed",
      notes: "Personal algorithms, risk managers, and trading bots are permitted.",
      highlight: false,
    },
    {
      objective: "Evaluation Fee Refund",
      phase1: "N/A",
      phase2: "N/A",
      funded: "100% Refund",
      notes: "Your one-time evaluation fee is credited back with your first payout.",
      highlight: true,
    },
  ];

  const tradingPolicies = [
    {
      style: "Swing Trading & Holding",
      status: "Allowed",
      detail: "Hold positions overnight and across market weekends without restrictions.",
      isAllowed: true,
    },
    {
      style: "Hedging Within Same Account",
      status: "Allowed",
      detail: "Take opposite positions on the same instrument inside your account.",
      isAllowed: true,
    },
    {
      style: "Automated Algorithmic EAs",
      status: "Allowed",
      detail: "Use personal Expert Advisors that follow fair execution parameters.",
      isAllowed: true,
    },
    {
      style: "News Event Trading",
      status: "Allowed",
      detail: "Position yourself around major rate announcements and NFP releases.",
      isAllowed: true,
    },
    {
      style: "Latency & Price Arbitrage",
      status: "Prohibited",
      detail: "Exploiting server feed latency or delayed broker quotes is strictly forbidden.",
      isAllowed: false,
    },
    {
      style: "High-Frequency Toxic Scalping",
      status: "Prohibited",
      detail: "Placing hundreds of sub-second orders designed to exploit demo execution.",
      isAllowed: false,
    },
    {
      style: "Account Passing & Copy Services",
      status: "Prohibited",
      detail: "Third-party account management or synchronized mirror copying across multiple users.",
      isAllowed: false,
    },
  ];

  return (
    <div className="min-h-screen bg-[#070809] text-white selection:bg-[#ccff00] selection:text-black">
      {/* ========================================================================= */}
      {/* HERO SECTION */}
      {/* ========================================================================= */}
      <section className="relative pt-24 pb-16 px-4 sm:px-6 lg:px-8 text-center overflow-hidden border-b border-white/[0.06]">
        {/* Ambient glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-[#ccff00]/[0.04] rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.05] border border-white/10 text-neutral-300 text-xs font-bold uppercase tracking-wider mb-6">
            <Scale size={14} className="text-[#ccff00]" />
            Transparent Evaluation Parameters
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black mb-5 tracking-tight text-white">
            Challenge <span className="text-[#ccff00]">Rules & Objectives</span>
          </h1>

          <p className="text-neutral-300 text-base sm:text-lg max-w-2xl mx-auto font-medium leading-relaxed">
            Every objective is clearly laid out before you place a trade. Follow the parameters below to pass your evaluation and unlock funded capital.
          </p>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* MAIN FORMATTED TABULAR RULES MATRIX */}
      {/* ========================================================================= */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Evaluation Matrix
            </h2>
            <p className="text-neutral-400 text-sm mt-1">
              Side-by-side comparison across all challenge stages.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#ccff00] animate-pulse" />
            <span className="text-xs text-neutral-400 font-medium">Deterministic Rule Engine v1.0</span>
          </div>
        </div>

        {/* Tabular Table Container */}
        <div className="bg-[#0d0f13] border border-white/[0.08] rounded-3xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#12151b] border-b border-white/[0.08] text-xs sm:text-sm font-black uppercase tracking-wider">
                  <th className="py-4.5 px-6 text-white min-w-[200px]">Trading Objective</th>
                  <th className="py-4.5 px-6 text-neutral-300 min-w-[140px]">Phase 1 (Evaluation)</th>
                  <th className="py-4.5 px-6 text-neutral-300 min-w-[140px]">Phase 2 (Verification)</th>
                  <th className="py-4.5 px-6 text-[#ccff00] min-w-[160px]">Funded Account</th>
                  <th className="py-4.5 px-6 text-neutral-400 min-w-[240px]">Rule Guidelines</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.05] text-sm">
                {matrixRules.map((row, idx) => (
                  <tr
                    key={row.objective}
                    className={`transition-colors hover:bg-white/[0.02] ${
                      idx % 2 === 0 ? "bg-transparent" : "bg-white/[0.01]"
                    }`}
                  >
                    {/* Objective Name */}
                    <td className="py-4 px-6 font-bold text-white flex items-center gap-2">
                      <span>{row.objective}</span>
                    </td>

                    {/* Phase 1 */}
                    <td className="py-4 px-6 font-mono font-semibold text-neutral-200">
                      {row.highlight ? (
                        <span className="inline-block px-2.5 py-1 rounded-lg bg-white/[0.06] text-white font-bold text-xs sm:text-sm">
                          {row.phase1}
                        </span>
                      ) : (
                        <span>{row.phase1}</span>
                      )}
                    </td>

                    {/* Phase 2 */}
                    <td className="py-4 px-6 font-mono font-semibold text-neutral-200">
                      {row.highlight ? (
                        <span className="inline-block px-2.5 py-1 rounded-lg bg-white/[0.06] text-white font-bold text-xs sm:text-sm">
                          {row.phase2}
                        </span>
                      ) : (
                        <span>{row.phase2}</span>
                      )}
                    </td>

                    {/* Funded Stage */}
                    <td className="py-4 px-6 font-mono font-bold text-[#ccff00]">
                      <span className="inline-block px-2.5 py-1 rounded-lg bg-[#ccff00]/10 border border-[#ccff00]/25 text-[#ccff00] font-extrabold text-xs sm:text-sm">
                        {row.funded}
                      </span>
                    </td>

                    {/* Notes & Description */}
                    <td className="py-4 px-6 text-neutral-400 text-xs sm:text-sm leading-relaxed">
                      {row.notes}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* DETAILED RULE BREAKDOWNS (TABULAR CARDS) */}
      {/* ========================================================================= */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-8">
          Trading Strategy & Conduct Table
        </h2>

        <div className="bg-[#0d0f13] border border-white/[0.08] rounded-3xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#12151b] border-b border-white/[0.08] text-xs sm:text-sm font-bold uppercase tracking-wider text-neutral-400">
                  <th className="py-4 px-6 min-w-[220px]">Strategy / Practice</th>
                  <th className="py-4 px-6 min-w-[130px]">Policy Status</th>
                  <th className="py-4 px-6">Specification Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.05] text-sm">
                {tradingPolicies.map((item) => (
                  <tr key={item.style} className="hover:bg-white/[0.02] transition">
                    <td className="py-4 px-6 font-bold text-white">{item.style}</td>
                    <td className="py-4 px-6">
                      {item.isAllowed ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#ccff00]/10 text-[#ccff00] border border-[#ccff00]/30">
                          <CheckCircle2 size={13} /> Allowed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30">
                          <XCircle size={13} /> Prohibited
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-neutral-400 text-xs sm:text-sm">{item.detail}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* CRITICAL RISK GUIDELINES CALLOUT */}
      {/* ========================================================================= */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="bg-amber-500/[0.06] border border-amber-500/25 rounded-3xl p-8 sm:p-10 shadow-lg">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-400 shrink-0 mt-1">
              <AlertTriangle size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-2">
                Understanding Daily Loss & Maximum Drawdown Limits
              </h3>
              <p className="text-neutral-300 text-sm leading-relaxed mb-3">
                Daily Loss Limit (5%) is calculated based on the starting equity of each trading day at 00:00 server time. If your equity falls by 5% at any moment during the day (including floating losses), the challenge is automatically breached.
              </p>
              <p className="text-neutral-400 text-xs leading-relaxed">
                Total Drawdown (10%) provides an overall protective cushion. You can monitor your live drawdown gauges in real time inside your MaxFunded Trader Dashboard.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* FINAL CALL TO ACTION */}
      {/* ========================================================================= */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 text-center border-t border-white/[0.08] mt-12">
        <div className="max-w-xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
            Ready to Prove Your Consistency?
          </h2>
          <p className="text-neutral-400 text-base mb-8">
            Choose your account balance, trade according to the rules, and scale up to $1,000,000.
          </p>
          <Link
            href="/challenges"
            className="inline-flex items-center gap-2 bg-[#ccff00] hover:bg-[#b3e600] text-black font-extrabold px-8 py-4 rounded-full text-base transition-all transform hover:scale-[1.03] shadow-[0_0_30px_rgba(204,255,0,0.35)]"
          >
            Select Your Challenge <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </div>
  );
}
