"use client";

import React, { useState } from "react";
import { Challenge, purchaseChallenge } from "@/lib/api";
import { getSession } from "@/lib/auth";
import { Check, ArrowRight, Zap, Loader2 } from "lucide-react";

interface Props {
  challenge: Challenge;
  onPurchased?: () => void;
}

export default function ChallengeCard({ challenge, onPurchased }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSelect = async () => {
    setError(null);
    const session = getSession();
    if (!session) {
      window.location.href = `/register?redirect=/challenges`;
      return;
    }

    try {
      setLoading(true);
      await purchaseChallenge(challenge.id, session.token);
      if (onPurchased) {
        onPurchased();
      } else {
        window.location.href = "/dashboard";
      }
    } catch (err: any) {
      setError(err.message || "Failed to purchase challenge");
    } finally {
      setLoading(false);
    }
  };

  const startingBalanceNum = Number(challenge.starting_balance).toLocaleString();
  const priceNum = Number(challenge.price).toFixed(0);

  return (
    <div className="relative rounded-2xl bg-gradient-to-b from-dark-800 to-dark-850 border border-dark-700 p-6 flex flex-col justify-between hover:border-brand-500/80 transition-all duration-300 shadow-xl group">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-brand-500/10 text-brand-500 border border-brand-500/20">
            Evaluation Tier
          </span>
          <div className="flex items-center space-x-1 text-xs text-gray-400">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>1:{challenge.rules?.leverage || 100} Leverage</span>
          </div>
        </div>

        <h3 className="text-xl font-bold text-white mb-1">{challenge.name}</h3>
        <p className="text-xs text-gray-400 mb-6">{challenge.description || "Simulated trading evaluation account"}</p>

        {/* Pricing & Virtual Capital */}
        <div className="bg-dark-900/60 rounded-xl p-4 mb-6 border border-dark-700/50">
          <div className="text-xs text-gray-400 mb-1">Simulated Starting Capital</div>
          <div className="text-2xl font-extrabold text-white mb-3">${startingBalanceNum}</div>

          <div className="flex items-baseline space-x-1">
            <span className="text-3xl font-extrabold text-brand-500">${priceNum}</span>
            <span className="text-xs text-gray-400">/ One-time fee</span>
          </div>
        </div>

        {/* Challenge Metrics Checklist */}
        <div className="space-y-3 mb-6 text-xs text-gray-300">
          <div className="flex items-center justify-between pb-2 border-b border-dark-700/40">
            <span className="text-gray-400">Profit Target</span>
            <span className="font-semibold text-emerald-400">{challenge.rules?.profit_target_percentage || 10}%</span>
          </div>
          <div className="flex items-center justify-between pb-2 border-b border-dark-700/40">
            <span className="text-gray-400">Max Daily Loss</span>
            <span className="font-semibold text-red-400">{challenge.rules?.max_daily_loss_percentage || 5}%</span>
          </div>
          <div className="flex items-center justify-between pb-2 border-b border-dark-700/40">
            <span className="text-gray-400">Max Overall Drawdown</span>
            <span className="font-semibold text-red-400">{challenge.rules?.max_drawdown_percentage || 10}%</span>
          </div>
          <div className="flex items-center justify-between pb-2 border-b border-dark-700/40">
            <span className="text-gray-400">Min Trading Days</span>
            <span className="font-semibold text-gray-200">{challenge.rules?.min_trading_days || 5} Days</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Profit Split</span>
            <span className="font-semibold text-brand-500">{challenge.rules?.profit_split_percentage || 80}%</span>
          </div>
        </div>
      </div>

      <div>
        {error && (
          <div className="mb-3 p-2.5 rounded bg-red-950/40 border border-red-800 text-red-400 text-xs text-center">
            {error}
          </div>
        )}

        <button
          onClick={handleSelect}
          disabled={loading}
          className="w-full py-3 px-4 rounded-xl font-semibold text-sm bg-brand-600 hover:bg-brand-500 text-white flex items-center justify-center space-x-2 transition shadow-lg shadow-brand-600/30 group-hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Provisioning...</span>
            </>
          ) : (
            <>
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
