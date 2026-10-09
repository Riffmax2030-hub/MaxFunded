"use client";

import React from "react";
import Link from "next/link";
import { Check, X, Zap, ShieldCheck, ChevronRight } from "lucide-react";

interface ComparisonRow {
  feature: string;
  maxFunded: string | boolean;
  ftmo: string | boolean;
  fundedNext: string | boolean;
  highlight?: boolean;
}

const COMPARISON_DATA: ComparisonRow[] = [
  {
    feature: "Profit Split",
    maxFunded: "Up to 90%",
    ftmo: "80% – 90%",
    fundedNext: "80% – 90%",
    highlight: true,
  },
  {
    feature: "Trading Time Limit",
    maxFunded: "Unlimited Days",
    ftmo: "Unlimited",
    fundedNext: "Unlimited",
  },
  {
    feature: "First Payout Timeline",
    maxFunded: "7 Days (Fastest)",
    ftmo: "14 Days",
    fundedNext: "14 Days",
    highlight: true,
  },
  {
    feature: "Pay With Profits Option",
    maxFunded: "Yes (10% upfront)",
    ftmo: "No (100% upfront)",
    fundedNext: "No (100% upfront)",
    highlight: true,
  },
  {
    feature: "News Trading Allowed",
    maxFunded: true,
    ftmo: "Restricted (Swing only)",
    fundedNext: true,
  },
  {
    feature: "Weekend Holding Allowed",
    maxFunded: true,
    ftmo: "Restricted (Swing only)",
    fundedNext: true,
  },
  {
    feature: "Refundable Evaluation Fee",
    maxFunded: "100% on 1st Payout",
    ftmo: "100% on 1st Payout",
    fundedNext: "100% on 1st Payout",
  },
  {
    feature: "EA / Algo Trading",
    maxFunded: true,
    ftmo: true,
    fundedNext: true,
  },
  {
    feature: "Scaling Up to",
    maxFunded: "$1,000,000 USD",
    ftmo: "$2,000,000 USD",
    fundedNext: "$300,000 USD",
  },
];

export default function CompetitionComparison() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/[0.06]">
      {/* Header */}
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#ccff00]/10 border border-[#ccff00]/20 text-xs text-[#ccff00] font-bold mb-4">
          <Zap size={13} />
          <span>Industry Benchmark</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-tight">
          Why Traders Choose <span className="text-[#ccff00]">MaxFunded</span>
        </h2>
        <p className="mt-3 text-sm sm:text-base text-neutral-400 max-w-2xl mx-auto">
          See how our trader-friendly evaluation rules compare against other major prop trading firms.
        </p>
      </div>

      {/* Comparison Table */}
      <div className="bg-[#0d0e10] border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-base">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.02]">
                <th className="py-5 px-6 font-bold text-neutral-300 text-sm uppercase tracking-wider">
                  Features &amp; Rules
                </th>
                {/* MaxFunded Column Highlight */}
                <th className="py-5 px-6 font-black text-black bg-[#ccff00] text-center text-base uppercase tracking-tight relative">
                  <div className="flex items-center justify-center gap-1.5">
                    <Zap size={18} fill="black" />
                    <span>MaxFunded</span>
                  </div>
                </th>
                <th className="py-5 px-6 font-bold text-neutral-300 text-center text-sm uppercase tracking-wider">
                  FTMO
                </th>
                <th className="py-5 px-6 font-bold text-neutral-300 text-center text-sm uppercase tracking-wider">
                  FundedNext
                </th>
              </tr>
            </thead>
            <tbody>
              {COMPARISON_DATA.map((row, idx) => (
                <tr
                  key={row.feature}
                  className={`border-b border-white/[0.06] transition-colors hover:bg-white/[0.02] ${
                    idx % 2 === 0 ? "bg-transparent" : "bg-white/[0.01]"
                  }`}
                >
                  {/* Feature Name */}
                  <td className="py-4.5 px-6 font-semibold text-white text-sm sm:text-base">
                    {row.feature}
                  </td>

                  {/* MaxFunded (Elevated Column) */}
                  <td className="py-4.5 px-6 text-center bg-[#ccff00]/[0.04] border-x border-[#ccff00]/20 font-black text-sm sm:text-base">
                    {typeof row.maxFunded === "boolean" ? (
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-[#ccff00]/20 text-[#ccff00]">
                        <Check size={16} className="stroke-[3]" />
                      </span>
                    ) : (
                      <span className="text-[#ccff00] font-black">{row.maxFunded}</span>
                    )}
                  </td>

                  {/* FTMO */}
                  <td className="py-4.5 px-6 text-center text-neutral-300 text-sm sm:text-base">
                    {typeof row.ftmo === "boolean" ? (
                      row.ftmo ? (
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-emerald-500/10 text-emerald-400">
                          <Check size={16} />
                        </span>
                      ) : (
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-rose-500/10 text-rose-400">
                          <X size={16} />
                        </span>
                      )
                    ) : (
                      row.ftmo
                    )}
                  </td>

                  {/* FundedNext */}
                  <td className="py-4.5 px-6 text-center text-neutral-300 text-sm sm:text-base">
                    {typeof row.fundedNext === "boolean" ? (
                      row.fundedNext ? (
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-emerald-500/10 text-emerald-400">
                          <Check size={16} />
                        </span>
                      ) : (
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-rose-500/10 text-rose-400">
                          <X size={16} />
                        </span>
                      )
                    ) : (
                      row.fundedNext
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Bottom CTA bar */}
        <div className="p-6 bg-[#0a0c10] border-t border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-neutral-400">
            <ShieldCheck size={16} className="text-[#ccff00]" />
            <span>Fair rules with zero hidden traps. Built by real traders for real traders.</span>
          </div>
          <Link
            href="/challenges"
            className="px-6 py-2.5 rounded-full bg-[#ccff00] hover:bg-[#b3e600] text-black font-extrabold text-xs uppercase tracking-tight shadow-neon transition flex items-center gap-2"
          >
            <span>Choose Your Challenge</span>
            <ChevronRight size={14} className="stroke-[3]" />
          </Link>
        </div>
      </div>
    </section>
  );
}
