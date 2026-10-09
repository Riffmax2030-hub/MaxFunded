"use client";

import React from "react";
import { Challenge } from "@/lib/api";
import { getSession } from "@/lib/auth";
import { ArrowRight, Sparkles } from "lucide-react";

interface Props {
  challenge: Challenge;
  onPurchased?: () => void;
}

export default function ChallengeCard({ challenge }: Props) {
  const handleSelect = () => {
    const session = getSession();
    if (!session) {
      window.location.href = `/register?redirect=/checkout?challenge=${challenge.id}`;
      return;
    }
    window.location.href = `/checkout?challenge=${challenge.id}`;
  };

  const startingBalance = Number(challenge.starting_balance);
  const startingBalanceNum = startingBalance.toLocaleString();
  const rawOriginalPrice = Number(challenge.price);
  
  // Calculate 45% discounted price (MAX45 promo)
  const discountedPrice = Math.round(rawOriginalPrice * 0.55);
  const savings = Math.round(rawOriginalPrice - discountedPrice);

  const profitTargetPct = Number(challenge.rules?.profit_target_percentage) || 10;
  const profitTargetAmt = Math.round(startingBalance * (profitTargetPct / 100));
  const profitSplitPct = Number(challenge.rules?.profit_split_percentage) || 80;
  const potentialTraderReward = Math.round(profitTargetAmt * 0.90); // Up to 90%
  const maxLossPct = Number(challenge.rules?.max_drawdown_percentage) || 10;
  const maxLossAmt = Math.round(startingBalance * (maxLossPct / 100));
  const dailyLossPct = Number(challenge.rules?.max_daily_loss_percentage) || 5;
  const dailyLossAmt = Math.round(startingBalance * (dailyLossPct / 100));

  const isBestOffer = startingBalance === 100000;
  const isMostPopular = startingBalance === 25000;
  const isStarter = startingBalance === 10000;
  const isHighDemand = startingBalance === 50000;

  const topPill = isBestOffer
    ? "Best Offer"
    : isMostPopular
    ? "Most Popular"
    : isHighDemand
    ? "High Demand"
    : isStarter
    ? "Starter"
    : null;

  return (
    <div
      className={`bento-card relative rounded-3xl p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 group hover:translate-y-[-4px] ${
        isBestOffer || isMostPopular
          ? "border-2 border-[#ccff00]/60 shadow-[0_0_35px_rgba(204,255,0,0.18)] bg-[#0d0f14]"
          : "border border-white/10 bg-[#0c0e12] hover:border-white/25"
      }`}
    >
      {/* Centered Top Badge Banner (PIVEX Style) */}
      {topPill && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-20">
          <span className="px-5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-[#ccff00] text-black shadow-lg shadow-[#ccff00]/20 whitespace-nowrap block">
            {topPill}
          </span>
        </div>
      )}

      <div>
        {/* Header Block */}
        <div className="text-center pt-2 mb-6">
          <div className="text-xs text-neutral-400 uppercase font-bold tracking-widest mb-1.5">
            Account Size
          </div>
          <div className="text-3xl sm:text-4xl lg:text-5xl font-black text-white font-mono tracking-tight mb-5">
            ${startingBalanceNum}
          </div>

          {/* Large Solid Start Now Button (PIVEX Style) */}
          <button
            onClick={handleSelect}
            className="w-full py-4 rounded-2xl bg-[#ccff00] hover:bg-[#b8e600] text-black font-black text-sm uppercase tracking-tight shadow-[0_0_25px_rgba(204,255,0,0.25)] hover:shadow-[0_0_35px_rgba(204,255,0,0.4)] transition-all flex items-center justify-center gap-2 transform active:scale-[0.98]"
          >
            <span>Start Now</span>
            <ArrowRight className="w-4 h-4 stroke-[3]" />
          </button>

          {/* Pricing area */}
          <div className="mt-5 pt-4 border-t border-white/[0.08]">
            <div className="text-[11px] uppercase tracking-wider font-mono text-neutral-400 mb-1">
              One-Time Evaluation Fee
            </div>
            <div className="flex items-center justify-center gap-2.5">
              <span className="text-neutral-500 line-through text-base font-mono font-semibold">
                ${rawOriginalPrice.toFixed(0)}.00
              </span>
              <span className="text-2xl sm:text-3xl font-black text-white font-mono">
                ${discountedPrice}.00
              </span>
            </div>
            <div className="mt-1.5 inline-flex items-center gap-1.5 text-xs font-mono font-bold text-[#ccff00]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Save ${savings} • Code: MAX45</span>
            </div>
          </div>
        </div>

        {/* Elongated Specs & Rules Table with 100% White Uniform Values */}
        <div className="space-y-0 divide-y divide-white/[0.07] pt-2 border-t border-white/[0.08] text-xs sm:text-sm">
          {/* Profit Target */}
          <div className="flex items-center justify-between py-3">
            <span
              className="text-neutral-300 font-medium underline decoration-dotted decoration-neutral-500 cursor-help"
              title="Target needed to qualify for funding"
            >
              Profit Target
            </span>
            <span className="font-bold text-white font-mono">
              {profitTargetPct}% (${profitTargetAmt.toLocaleString()})
            </span>
          </div>

          {/* Potential Profit */}
          <div className="flex items-center justify-between py-3">
            <span
              className="text-neutral-300 font-medium underline decoration-dotted decoration-neutral-500 cursor-help"
              title="Potential performance rewards achievable upon hitting target"
            >
              Potential Profit
            </span>
            <span className="font-bold text-white font-mono">
              ${profitTargetAmt.toLocaleString()} (Up to ${potentialTraderReward.toLocaleString()})
            </span>
          </div>

          {/* Profit Split */}
          <div className="flex items-center justify-between py-3">
            <span
              className="text-neutral-300 font-medium underline decoration-dotted decoration-neutral-500 cursor-help"
              title="Trader share of realized performance rewards"
            >
              Profit Split
            </span>
            <span className="font-bold text-white font-mono">
              80% – 90%
            </span>
          </div>

          {/* Maximum Loss Limit */}
          <div className="flex items-center justify-between py-3">
            <span
              className="text-neutral-300 font-medium underline decoration-dotted decoration-neutral-500 cursor-help"
              title="Static Maximum overall loss limit"
            >
              Maximum Loss Limit
            </span>
            <span className="font-bold text-white font-mono">
              {maxLossPct}% Static (${maxLossAmt.toLocaleString()})
            </span>
          </div>

          {/* Daily Loss Limit */}
          <div className="flex items-center justify-between py-3">
            <span
              className="text-neutral-300 font-medium underline decoration-dotted decoration-neutral-500 cursor-help"
              title="Maximum daily floating or closed loss allowed"
            >
              Daily Loss Limit
            </span>
            <span className="font-bold text-white font-mono">
              {dailyLossPct}% Static (${dailyLossAmt.toLocaleString()})
            </span>
          </div>

          {/* Minimum Trading Days */}
          <div className="flex items-center justify-between py-3">
            <span
              className="text-neutral-300 font-medium underline decoration-dotted decoration-neutral-500 cursor-help"
              title="Minimum days required before passing evaluation"
            >
              Minimum Trading Days
            </span>
            <span className="font-bold text-white font-mono">
              0 Days (No Min Days)
            </span>
          </div>

          {/* Evaluation Fee Refund */}
          <div className="flex items-center justify-between py-3">
            <span
              className="text-neutral-300 font-medium underline decoration-dotted decoration-neutral-500 cursor-help"
              title="100% reimbursed on first payout"
            >
              Evaluation Fee
            </span>
            <span className="font-bold text-white font-mono">
              100% Refundable
            </span>
          </div>

          {/* Payout Schedule */}
          <div className="flex items-center justify-between py-3">
            <span
              className="text-neutral-300 font-medium underline decoration-dotted decoration-neutral-500 cursor-help"
              title="Payout eligibility and turnaround timeframe"
            >
              Payout Schedule
            </span>
            <span className="font-bold text-white font-mono">
              Bi-Weekly / 1-Day Express
            </span>
          </div>

          {/* Leverage */}
          <div className="flex items-center justify-between py-3">
            <span
              className="text-neutral-300 font-medium underline decoration-dotted decoration-neutral-500 cursor-help"
              title="Maximum trade leverage on MT5"
            >
              Leverage
            </span>
            <span className="font-bold text-white font-mono">
              1:100
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
