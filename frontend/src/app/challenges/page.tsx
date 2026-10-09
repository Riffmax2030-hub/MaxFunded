"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import ChallengeCard from "@/components/ChallengeCard";
import { fetchChallenges, claimFreeTrial, Challenge } from "@/lib/api";
import { Loader2, Zap, ShieldCheck, Award, Star, CheckCircle2, ArrowRight, Sparkles, Clock } from "lucide-react";

const INSTANT_ACCOUNTS = [
  { size: 10_000, price: 299, label: "$10K" },
  { size: 25_000, price: 549, label: "$25K" },
  { size: 50_000, price: 899, label: "$50K" },
  { size: 100_000, price: 1499, label: "$100K" },
];

const INSTANT_RULES = [
  { label: "Trailing Drawdown", value: "6%" },
  { label: "Daily Loss Limit", value: "3%" },
  { label: "Consistency Score", value: "25% max/day" },
  { label: "Profit Split", value: "80% Trader" },
  { label: "First Payout", value: "From Day 7" },
  { label: "Platform", value: "MetaTrader 5" },
];

function InstantFundedSection() {
  const [selected, setSelected] = useState(1); // index into INSTANT_ACCOUNTS

  return (
    <div className="space-y-10">
      {/* Hero */}
      <div className="text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#ccff00]/10 border border-[#ccff00]/30 text-[#ccff00] text-xs font-bold mb-5">
          <Zap className="w-3.5 h-3.5" />
          SKIP THE EVALUATION
        </div>
        <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-4">
          Trade Funded. <span className="text-[#ccff00]">Immediately.</span>
        </h2>
        <p className="text-neutral-400 text-sm sm:text-base leading-relaxed">
          Pay a premium and receive instant access to a live funded MT5 account. No evaluation phases.
          Stricter consistency rules apply to ensure sustainable, long-term performance.
        </p>
      </div>

      {/* Account size selector */}
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-neutral-400 text-center mb-5">Choose Your Account Size</p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
          {INSTANT_ACCOUNTS.map((acc, i) => {
            const isSelected = selected === i;
            return (
              <button
                key={acc.size}
                onClick={() => setSelected(i)}
                className={`calculator-tab relative p-5 text-left ${isSelected ? "active" : ""}`}
              >
                {i === 1 && (
                  <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-[9px] font-black uppercase tracking-widest bg-[#ccff00] text-black px-2.5 py-0.5 rounded-full whitespace-nowrap shadow-sm">
                    Most Popular
                  </span>
                )}
                <div className="text-2xl font-black text-white mb-1 font-mono">{acc.label}</div>
                <div className={`text-lg font-bold font-mono ${isSelected ? "text-[#ccff00]" : "text-neutral-300"}`}>
                  ${acc.price.toLocaleString()}
                </div>
                <div className="text-xs text-neutral-400 mt-0.5">one-time fee</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Details card */}
      <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Rules */}
        <div className="bg-[#0d0e10] border border-white/[0.08] rounded-2xl p-6">
          <h3 className="text-sm font-bold text-white mb-5 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#ccff00]" /> Account Conditions
          </h3>
          <div className="space-y-0 divide-y divide-white/5">
            {INSTANT_RULES.map(({ label, value }) => (
              <div key={label} className="flex justify-between py-2.5 text-sm">
                <span className="text-neutral-400">{label}</span>
                <span className="font-semibold text-white">{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA summary */}
        <div className="bg-[#0d0e10] border border-white/[0.08] rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <Award className="w-4 h-4 text-[#ccff00]" /> What You Get
            </h3>
            <ul className="space-y-3">
              {[
                "Instant MT5 credentials delivered on payment",
                "Live funded account — no evaluation phases",
                "80% profit split from day one",
                "Weekly payout eligibility from Day 7",
                "Access to scaling plan up to $1M",
                "Full platform dashboard & analytics",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-[#ccff00] shrink-0 mt-0.5" />
                  <span className="text-neutral-300">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-6 pt-5 border-t border-white/[0.06]">
            <div className="flex items-baseline justify-between mb-4">
              <span className="text-neutral-400 text-sm">Selected Account</span>
              <div className="text-right">
                <div className="text-2xl font-black text-white">{INSTANT_ACCOUNTS[selected].label}</div>
                <div className="text-[#ccff00] font-bold">${INSTANT_ACCOUNTS[selected].price.toLocaleString()}</div>
              </div>
            </div>
            <Link
              href={`/register?plan=instant&size=${INSTANT_ACCOUNTS[selected].size}`}
              className="w-full flex items-center justify-center gap-2 bg-[#ccff00] hover:bg-[#b3e600] text-black font-black py-4 rounded-xl transition shadow-lg shadow-[#ccff00]/10 text-sm uppercase tracking-tight"
            >
              <Zap className="w-4 h-4" />
              Get Instant Access — ${INSTANT_ACCOUNTS[selected].price.toLocaleString()}
              <ArrowRight className="w-4 h-4" />
            </Link>
            <p className="text-neutral-600 text-[11px] text-center mt-3">
              Requires identity verification before first payout. Consistency rules apply.
            </p>
          </div>
        </div>
      </div>

      {/* Warning note */}
      <div className="max-w-4xl mx-auto bg-amber-950/20 border border-amber-800/30 rounded-xl px-5 py-4">
        <p className="text-amber-400 text-xs font-semibold mb-1">Important — Consistency Requirement</p>
        <p className="text-amber-300/70 text-xs leading-relaxed">
          Instant funded accounts enforce a strict <strong className="text-amber-300">25% max single-day profit rule</strong>.
          Your most profitable day cannot exceed 25% of your total cumulative profit. This ensures your success
          is built on consistent, sustainable trading — not a single lucky trade. Breaching this rule results in
          account termination.
        </p>
      </div>
    </div>
  );
}

function FreeTrialSection() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleClaim = async () => {
    setLoading(true);
    setError(null);
    const token = typeof window !== "undefined" ? localStorage.getItem("mxf_token") : null;
    if (!token) {
      window.location.href = "/register?trial=true";
      return;
    }
    try {
      await claimFreeTrial(token);
      setSuccess(true);
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 1200);
    } catch (err: any) {
      setError(err.message || "Failed to activate trial");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#ccff00]/10 border border-[#ccff00]/30 text-[#ccff00] text-xs font-bold mb-4">
          <Sparkles className="w-3.5 h-3.5" />
          100% FREE • NO CREDIT CARD REQUIRED
        </div>
        <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-4">
          14-Day Free CFD <span className="text-[#ccff00]">Trial</span>
        </h2>
        <p className="text-neutral-400 text-sm sm:text-base leading-relaxed">
          Test our institutional MT5 server conditions, tight spreads, and execution speed with $100,000 simulated capital with zero financial risk.
        </p>
      </div>

      <div className="bg-[#0c0e15] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <div className="inline-block px-3 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-mono text-xs font-bold uppercase mb-3">
              Standard CFD Specification
            </div>
            <h3 className="text-3xl font-black text-white font-mono">$100,000 Capital</h3>
            <p className="text-xs sm:text-sm text-neutral-400 mt-2 leading-relaxed">
              Experience the exact trading rules, server conditions, and dashboard risk telemetry that our funded traders use daily.
            </p>

            <div className="mt-6 space-y-2.5">
              {[
                { label: "Account Size", val: "$100,000 USD (Simulated)" },
                { label: "Duration", val: "14 Days" },
                { label: "Fee", val: "$0.00 Free" },
                { label: "Profit Target", val: "10% ($10,000)" },
                { label: "Daily Loss Limit", val: "5% ($5,000)" },
                { label: "Max Drawdown", val: "10% Static ($10,000)" },
                { label: "Platform", val: "MetaTrader 5 (CFDs)" },
                { label: "Instruments", val: "Forex, Metals, Indices, Crypto" },
              ].map((item) => (
                <div key={item.label} className="flex justify-between items-center py-1.5 border-b border-white/5 text-xs sm:text-sm">
                  <span className="text-neutral-400">{item.label}</span>
                  <span className="font-bold text-white font-mono">{item.val}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#080a0f] border border-white/10 rounded-2xl p-6 flex flex-col justify-between h-full">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <span className="text-xs uppercase font-mono text-neutral-400">Trial Tier</span>
                <span className="text-xs font-bold font-mono text-[#ccff00] bg-[#ccff00]/10 px-2 py-0.5 rounded">INSTANT ACCESS</span>
              </div>
              <div className="my-6 text-center">
                <span className="text-neutral-400 text-xs uppercase tracking-widest block font-bold">One-Time Fee</span>
                <span className="text-5xl font-black text-white font-mono mt-1 block">$0.00</span>
                <span className="text-xs text-emerald-400 font-bold block mt-1">Zero Financial Risk</span>
              </div>
              <ul className="space-y-2 text-xs text-neutral-300 mb-6">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#ccff00] shrink-0" />
                  <span>Instant MT5 Login &amp; Server IP</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#ccff00] shrink-0" />
                  <span>Full access to live trader dashboard</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#ccff00] shrink-0" />
                  <span>Practice rules with live MT5 telemetry</span>
                </li>
              </ul>
            </div>

            <div>
              {error && (
                <p className="text-xs text-rose-400 mb-3 text-center">{error}</p>
              )}
              {success ? (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold text-center">
                  ✅ Trial Account Activated! Redirecting to dashboard...
                </div>
              ) : (
                <button
                  onClick={handleClaim}
                  disabled={loading}
                  className="w-full py-4 rounded-xl bg-[#ccff00] hover:bg-[#b8e600] text-black font-black text-sm uppercase tracking-tight transition flex items-center justify-center gap-2 shadow-lg shadow-[#ccff00]/20 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Provisioning MT5 Trial...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4" />
                      <span>Start Free 14-Day CFD Trial</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ChallengesPage() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<"evaluation" | "trial" | "instant">("evaluation");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const urlTab = params.get("tab");
      if (urlTab === "trial") setTab("trial");
      else if (urlTab === "instant") setTab("instant");
    }

    fetchChallenges()
      .then((data) => { setChallenges(data); setLoading(false); })
      .catch((err) => { setError(err.message || "Failed to load challenges"); setLoading(false); });
  }, []);

  return (
    <div className="bg-[#08090b] text-white min-h-screen py-16 px-4 sm:px-6 lg:px-8 bg-grid-pattern">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#ccff00]/15 border border-[#ccff00]/30 text-[#ccff00] text-xs font-mono font-bold uppercase tracking-wider mb-5 animate-pulse">
            <span>⚡ LIMITED TIME: 45% OFF FOR NEW USERS • CODE: MAX45</span>
          </div>

          <h1 className="text-3xl sm:text-6xl font-black text-white tracking-tight uppercase mb-4">
            {tab === "evaluation" ? "Select Your Account Balance" : tab === "trial" ? "Free CFD Trial Account" : "Instant Funded Accounts"}
          </h1>
          <p className="text-sm sm:text-base text-neutral-400 max-w-xl mx-auto">
            {tab === "evaluation"
              ? "Choose your starting virtual capital. Transparent rules, fair targets, and instant credential delivery."
              : tab === "trial"
              ? "Practice on our live institutional simulated MT5 server for 14 days with zero commitment."
              : "Skip the evaluation. Get funded immediately with a premium account."}
          </p>

          {/* Quick Pillars */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-neutral-300 font-semibold">
            <div className="flex items-center gap-1.5"><Zap className="w-4 h-4 text-[#ccff00]" /><span>Instant MT5 Credentials</span></div>
            <div className="flex items-center gap-1.5"><Award className="w-4 h-4 text-[#ccff00]" /><span>Up to 90% Profit Split</span></div>
            <div className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-[#ccff00]" /><span>Zero Personal Risk</span></div>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex justify-center mb-10">
          <div className="flex flex-wrap gap-1 bg-[#111418] border border-white/10 rounded-full p-1">
            <button
              onClick={() => setTab("evaluation")}
              className={`px-5 sm:px-6 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all ${
                tab === "evaluation"
                  ? "bg-[#ccff00] text-black shadow"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              Evaluation Challenges
            </button>
            <button
              onClick={() => setTab("trial")}
              className={`px-5 sm:px-6 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 ${
                tab === "trial"
                  ? "bg-[#ccff00] text-black shadow"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> Free CFD Trial
            </button>
            <button
              onClick={() => setTab("instant")}
              className={`px-5 sm:px-6 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 ${
                tab === "instant"
                  ? "bg-[#ccff00] text-black shadow"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              <Zap className="w-3.5 h-3.5" /> Instant Funded
            </button>
          </div>
        </div>

        {/* Content */}
        {tab === "evaluation" ? (
          loading ? (
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
          )
        ) : tab === "trial" ? (
          <FreeTrialSection />
        ) : (
          <InstantFundedSection />
        )}
      </div>
    </div>
  );
}
