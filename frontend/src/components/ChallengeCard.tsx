"use client";

import React from "react";
import { Challenge } from "@/lib/api";
import { getSession } from "@/lib/auth";
import { ArrowRight, Zap, Check } from "lucide-react";

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

  const startingBalanceNum = Number(challenge.starting_balance).toLocaleString();
  const priceNum = Number(challenge.price).toFixed(2);
  const isBestOffer = Number(challenge.starting_balance) === 100000;
  const isMostPopular = Number(challenge.starting_balance) === 25000;

  return (
    <div
      className={`rounded-3xl p-6 flex flex-col justify-between bg-[#12151c] transition-all duration-300 relative group hover:scale-[1.02] ${
        isBestOffer || isMostPopular
          ? "border-2 border-[#ccff00]/60 shadow-[0_0_35px_rgba(204,255,0,0.18)]"
          : "border border-white/10 hover:border-white/20"
      }`}
    >
      <div>
        {/* Top Tag Badge */}
        <div className="h-7 mb-2 flex items-center justify-center">
          {isBestOffer && (
            <span className="px-4 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-[#ccff00] text-black">
              Best Offer
            </span>
          )}
          {isMostPopular && (
            <span className="px-4 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-[#ccff00] text-black">
              Most Popular
            </span>
          )}
        </div>

        <div className="text-center">
          <div className="text-xs text-neutral-400 uppercase font-bold tracking-wider mb-1">
            Account Size
          </div>
          <div className="text-3xl font-black text-white mb-6">
            ${startingBalanceNum}
          </div>

          {/* Start Now Button */}
          <button
            onClick={handleSelect}
            className="w-full py-3.5 rounded-xl bg-[#ccff00] hover:bg-[#b3e600] text-black font-black text-sm uppercase tracking-tight shadow-neon transition block text-center"
          >
            Start Now
          </button>

          {/* Price */}
          <div className="mt-4 mb-8">
            <span className="text-xs text-neutral-400 block mb-0.5">One-time challenge fee</span>
            <span className="text-2xl font-black text-white">${priceNum}</span>
          </div>
        </div>

        {/* Specs Table */}
        <div className="space-y-3.5 text-xs text-neutral-300 pt-4 border-t border-white/5">
          <div className="flex items-center justify-between">
            <span
              className="text-neutral-400 underline decoration-dotted decoration-neutral-600 cursor-help"
              title="Target needed to qualify for funding"
            >
              Profit Target
            </span>
            <span className="font-bold text-white">
              {challenge.rules?.profit_target_percentage || 10}%
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span
              className="text-neutral-400 underline decoration-dotted decoration-neutral-600 cursor-help"
              title="Trader share of realized performance rewards"
            >
              Profit Split
            </span>
            <span className="font-bold text-[#ccff00]">
              {challenge.rules?.profit_split_percentage || 80}%
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span
              className="text-neutral-400 underline decoration-dotted decoration-neutral-600 cursor-help"
              title="Total equity drawdown limit"
            >
              Maximum Loss Limit
            </span>
            <span className="font-bold text-white">
              {challenge.rules?.max_drawdown_percentage || 6}%
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span
              className="text-neutral-400 underline decoration-dotted decoration-neutral-600 cursor-help"
              title="Maximum allowable daily floating or closed loss"
            >
              Daily Loss Limit
            </span>
            <span className="font-bold text-white">
              {challenge.rules?.max_daily_loss_percentage || 4}%
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span
              className="text-neutral-400 underline decoration-dotted decoration-neutral-600 cursor-help"
              title="Minimum days with at least 1 trade opened"
            >
              Minimum Trading Days
            </span>
            <span className="font-bold text-white">
              {challenge.rules?.min_trading_days || 5} Days
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span
              className="text-neutral-400 underline decoration-dotted decoration-neutral-600 cursor-help"
              title="Maximum trade leverage on MT5"
            >
              Leverage
            </span>
            <span className="font-bold text-white">
              1:{challenge.rules?.leverage || 100}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
