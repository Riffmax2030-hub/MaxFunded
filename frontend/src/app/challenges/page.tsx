"use client";

import React, { useEffect, useState } from "react";
import ChallengeCard from "@/components/ChallengeCard";
import { fetchChallenges, Challenge } from "@/lib/api";
import { Loader2, Zap, ShieldCheck, Award, Star } from "lucide-react";

export default function ChallengesPage() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchChallenges()
      .then((data) => {
        setChallenges(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Failed to load challenges");
        setLoading(false);
      });
  }, []);

  return (
    <div className="bg-[#08090b] text-white min-h-screen py-16 px-4 sm:px-6 lg:px-8 bg-grid-pattern">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#111418] border border-white/10 text-xs text-neutral-300 mb-6 select-none">
            <span className="font-bold text-white">4.9 ★ Rating</span>
            <span className="text-neutral-500">•</span>
            <span className="text-[#ccff00] font-bold">Instant MT5 Delivery</span>
          </div>

          <h1 className="text-3xl sm:text-6xl font-black text-white tracking-tight uppercase mb-4">
            Select Your Account Balance
          </h1>
          <p className="text-sm sm:text-base text-neutral-400 max-w-xl mx-auto">
            Choose your starting virtual capital. Transparent rules, fair targets, and instant credential delivery upon checkout.
          </p>

          {/* Quick Pillars */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-neutral-300 font-semibold">
            <div className="flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-[#ccff00]" />
              <span>Instant MT5 Credentials</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Award className="w-4 h-4 text-[#ccff00]" />
              <span>Up to 90% Profit Split</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#ccff00]" />
              <span>Zero Personal Risk</span>
            </div>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-neutral-400">
            <Loader2 className="w-8 h-8 animate-spin text-[#ccff00] mb-3" />
            <p className="text-sm font-medium">Loading evaluation tiers...</p>
          </div>
        ) : error ? (
          <div className="max-w-md mx-auto p-5 rounded-2xl bg-red-950/40 border border-red-500/30 text-center text-red-300 text-sm">
            {error}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {challenges.map((c) => (
              <ChallengeCard key={c.id} challenge={c} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
