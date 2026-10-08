"use client";

import React from "react";
import { Challenge } from "@/lib/api";
import { getSession } from "@/lib/auth";
import { ArrowRight, Zap, Check, Sparkles, ShieldCheck } from "lucide-react";

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

  const isBestOffer = startingBalance === 100000;
  const isMostPopular = startingBalance === 25000;
  const isStarter = startingBalance === 10000;
  const isHighDemand = startingBalance === 50000;

  const tagLabel = isBestOffer
    ? "Best Value"
    : isMostPopular
    ? "Most Popular"
    : isHighDemand
    ? "High Demand"
    : isStarter
    ? "Starter"
    : null;

  return (
    <div
      className={`bento-card p-6 sm:p-7 flex flex-col justify-between relative group ${
        isBestOffer || isMostPopular
          ? "pricing-card-highlight border-2 border-[#ccff00]/60 shadow-[0_0_35px_rgba(204,255,0,0.18)]"
          : ""
      }`}
    >
      <div>
        {/* Top Tag & Promo Badge */}
        <div className="h-7 mb-3 flex items-center justify-between">
          {tagLabel ? (
            <span className="px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#ccff00] text-black">
              {tagLabel}
            </span>
          ) : (
            <span className="text-[10px] text-neutral-500 font-mono font-bold uppercase tracking-wider">
              EVALUATION
            </span>
          )}
          <span className="text-[10px] font-mono font-bold text-[#ccff00] bg-[#ccff00]/10 px-2 py-0.5 rounded-md border border-[#ccff00]/25">
            45% OFF
          </span>
        </div>

        <div className="text-center">
          <div className="text-xs text-neutral-400 uppercase font-bold tracking-wider mb-1">
            Account Size
          </div>
          <div className="text-3xl sm:text-4xl font-black text-white mb-5 font-mono">
            ${startingBalanceNum}
          </div>

          {/* Start Now CTA Button */}
          <button
            onClick={handleSelect}
            className="btn-neon w-full py-3.5 rounded-xl bg-[#ccff00] hover:bg-[#b3e600] text-black font-black text-sm uppercase tracking-tight shadow-neon transition flex items-center justify-center gap-2"
          >
            <span>Start Challenge</span>
            <ArrowRight className="w-4 h-4 stroke-[3]" />
          </button>

          {/* Catchy Price with Strike-through & Instant Savings */}
          <div className="mt-4 mb-6 pt-3 border-t border-white/5">
            <div className="flex items-center justify-center gap-2.5 mb-1">
              <span className="text-neutral-500 line-through text-base font-mono font-semibold">
                ${rawOriginalPrice.toFixed(0)}
              </span>
              <span className="text-2xl sm:text-3xl font-black text-white font-mono">
                ${discountedPrice}.00
              </span>
            </div>
            <div className="inline-flex items-center gap-1 text-[11px] font-mono font-bold text-[#ccff00]">
              <Sparkles className="w-3 h-3" />
              <span>Save ${savings} with code MAX45</span>
            </div>
          </div>
        </div>

        {/* Specs & Rules Table */}
        <div className="space-y-3 text-xs text-neutral-300 pt-3 border-t border-white/5">
          <div className="flex items-center justify-between">
            <span
              className="text-neutral-400 underline decoration-dotted decoration-neutral-600 cursor-help"
              title="Target needed to qualify for funding"
            >
              Profit Target
            </span>
            <span className="font-bold text-white font-mono">
              {challenge.rules?.profit_target_percentage || "8% / 5%"}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span
              className="text-neutral-400 underline decoration-dotted decoration-neutral-600 cursor-help"
              title="Trader share of realized performance rewards"
            >
              Profit Split
            </span>
            <span className="font-bold text-[#ccff00] font-mono">
              {challenge.rules?.profit_split_percentage ? `${challenge.rules.profit_split_percentage}%` : "80% – 90%"}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span
              className="text-neutral-400 underline decoration-dotted decoration-neutral-600 cursor-help"
              title="Static Maximum overall loss limit"
            >
              Maximum Loss Limit
            </span>
            <span className="font-bold text-white font-mono">
              {challenge.rules?.max_drawdown_percentage ? `${challenge.rules.max_drawdown_percentage}% Static` : "10% Static"}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span
              className="text-neutral-400 underline decoration-dotted decoration-neutral-600 cursor-help"
              title="Maximum daily floating or closed loss allowed"
            >
              Daily Loss Limit
            </span>
            <span className="font-bold text-white font-mono">
              {challenge.rules?.max_daily_loss_percentage ? `${challenge.rules.max_daily_loss_percentage}% Static` : "5% Static"}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span
              className="text-neutral-400 underline decoration-dotted decoration-neutral-600 cursor-help"
              title="Minimum days with at least 1 trade opened"
            >
              Min Trading Days
            </span>
            <span className="font-bold text-[#ccff00] font-mono">
              0 Days (No Min Days)
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span
              className="text-neutral-400 underline decoration-dotted decoration-neutral-600 cursor-help"
              title="100% reimbursed on first payout"
            >
              Evaluation Fee
            </span>
            <span className="font-bold text-emerald-400 font-mono">
              100% Refundable
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span
              className="text-neutral-400 underline decoration-dotted decoration-neutral-600 cursor-help"
              title="Maximum trade leverage on MT5"
            >
              Leverage
            </span>
            <span className="font-bold text-white font-mono">
              1:{challenge.rules?.leverage || 100}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
