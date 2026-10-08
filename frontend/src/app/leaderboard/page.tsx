"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { fetchLeaderboard, LeaderboardData, LeaderboardEntry } from "@/lib/api";
import {
  Trophy,
  TrendingUp,
  Users,
  DollarSign,
  Clock,
  ChevronRight,
  Medal,
  Star,
  Zap,
  Award,
} from "lucide-react";

const countryFlags: Record<string, string> = {
  GB: "🇬🇧", NL: "🇳🇱", DE: "🇩🇪", NG: "🇳🇬", US: "🇺🇸",
  CA: "🇨🇦", AE: "🇦🇪", ES: "🇪🇸", FR: "🇫🇷", JP: "🇯🇵",
  ZA: "🇿🇦", BR: "🇧🇷", IN: "🇮🇳", SG: "🇸🇬", AU: "🇦🇺",
};

const BADGE_STYLES: Record<string, string> = {
  MASTER:       "bg-amber-500/20 text-amber-300 border border-amber-500/30",
  ELITE:        "bg-violet-500/20 text-violet-300 border border-violet-500/30",
  PROFESSIONAL: "bg-sky-500/20 text-sky-300 border border-sky-500/30",
  ROOKIE:       "bg-[#ccff00]/10 text-[#ccff00] border border-[#ccff00]/30",
};

const BADGE_ICONS: Record<string, string> = {
  MASTER: "👑", ELITE: "⚡", PROFESSIONAL: "🎯", ROOKIE: "🌱",
};

const CATEGORIES = [
  { id: "monthly", label: "🏆 Monthly Race" },
  { id: "all_time", label: "🌟 All Time" },
  { id: "payouts", label: "💰 Top Payouts" },
] as const;

type Category = "monthly" | "all_time" | "payouts";

function PodiumCard({
  entry,
  size,
}: {
  entry: LeaderboardEntry;
  size: "large" | "small";
}) {
  const isLarge = size === "large";
  const rankColors: Record<number, string> = {
    1: "border-[#ccff00]/60 shadow-[0_0_40px_rgba(204,255,0,0.15)]",
    2: "border-white/20",
    3: "border-amber-600/30",
  };
  const crownColors: Record<number, string> = {
    1: "bg-[#ccff00] text-black",
    2: "bg-slate-600 text-white",
    3: "bg-amber-700 text-white",
  };

  return (
    <div
      className={`flex flex-col items-center gap-3 p-5 rounded-2xl border bg-[#0d0e10] transition ${rankColors[entry.rank] || "border-white/10"} ${isLarge ? "py-8 scale-[1.03] z-10" : ""}`}
    >
      {/* Rank circle */}
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-base ${crownColors[entry.rank] || "bg-slate-700 text-white"}`}
      >
        {entry.rank === 1 ? "🥇" : entry.rank === 2 ? "🥈" : "🥉"}
      </div>

      {/* Trader info */}
      <div className="text-center">
        <div className="text-lg">
          {countryFlags[entry.country] || "🌍"}
        </div>
        <div className={`font-black text-white ${isLarge ? "text-lg" : "text-base"}`}>
          {entry.trader_name}
        </div>
        <div className="text-xs text-neutral-500">{entry.country_name}</div>
      </div>

      {/* Profit */}
      <div className="text-center">
        <div className={`font-black font-mono ${isLarge ? "text-2xl text-[#ccff00]" : "text-xl text-white"}`}>
          +${entry.profit_usd.toLocaleString("en-US", { minimumFractionDigits: 2 })}
        </div>
        <div className="text-xs text-neutral-500">{entry.return_pct.toFixed(2)}% return</div>
      </div>

      {/* Badge */}
      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${BADGE_STYLES[entry.badge]}`}>
        {BADGE_ICONS[entry.badge]} {entry.badge}
      </span>

      {/* Account size */}
      <div className="text-xs text-neutral-400 font-mono bg-white/5 px-2 py-1 rounded-lg">
        {entry.account_size}
      </div>

      {/* Prize */}
      {entry.prize_amount && (
        <div className="bg-[#ccff00]/10 border border-[#ccff00]/20 rounded-xl px-3 py-1.5 text-center">
          <div className="text-[9px] text-neutral-400 uppercase tracking-wider">Prize</div>
          <div className="text-xs font-black text-[#ccff00]">{entry.prize_amount}</div>
        </div>
      )}
    </div>
  );
}

export default function LeaderboardPage() {
  const [category, setCategory] = useState<Category>("monthly");
  const [data, setData] = useState<LeaderboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetchLeaderboard(category)
      .then(setData)
      .catch(() => setError("Failed to load leaderboard."))
      .finally(() => setLoading(false));
  }, [category]);

  const top3 = data?.entries.filter((e) => e.rank <= 3) ?? [];
  const rest = data?.entries.filter((e) => e.rank > 3) ?? [];

  const podiumOrder = [
    top3.find((e) => e.rank === 2),
    top3.find((e) => e.rank === 1),
    top3.find((e) => e.rank === 3),
  ].filter(Boolean) as LeaderboardEntry[];

  return (
    <div className="min-h-screen bg-[#08090b]">
        {/* Hero */}
        <section className="relative pt-20 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#ccff00]/[0.05] blur-3xl pointer-events-none -z-10 rounded-full" />

          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#ccff00]/10 border border-[#ccff00]/20 text-xs text-[#ccff00] font-bold mb-6">
            <Trophy size={12} />
            Live Competition Standings
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white mb-4">
            🏆 Top Funded Traders
          </h1>
          <p className="text-neutral-400 text-base max-w-xl mx-auto mb-10">
            Live competition standings — Top 3 traders win monthly cash prizes.
            <span className="text-[#ccff00] font-semibold"> Can you claim your spot?</span>
          </p>

          {/* Stats row */}
          {data && (
            <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto mb-10">
              {[
                {
                  icon: <Users size={16} className="text-[#ccff00]" />,
                  label: "Participants",
                  value: data.total_participants.toLocaleString(),
                },
                {
                  icon: <DollarSign size={16} className="text-emerald-400" />,
                  label: "Payouts Distributed",
                  value: data.total_payouts_distributed,
                },
                {
                  icon: <Clock size={16} className="text-amber-400" />,
                  label: "Competition Ends In",
                  value: `${data.competition_ends_in_days} days`,
                },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="bg-[#0d0e10] border border-white/10 rounded-2xl p-4 flex flex-col items-center gap-1.5"
                >
                  {stat.icon}
                  <div className="text-base sm:text-xl font-black text-white">{stat.value}</div>
                  <div className="text-[10px] text-neutral-500 uppercase tracking-wide">{stat.label}</div>
                </div>
              ))}
            </div>
          )}

          {/* Category switcher */}
          <div className="flex gap-1 bg-[#111418] border border-white/10 rounded-full p-1 mx-auto w-fit">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.id)}
                className={`px-5 py-2 rounded-full text-xs font-bold transition ${
                  category === cat.id
                    ? "bg-[#ccff00] text-black"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </section>

        {/* Content */}
        <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-24">
          {loading && (
            <div className="flex justify-center items-center py-24">
              <div className="w-10 h-10 border-2 border-[#ccff00]/30 border-t-[#ccff00] rounded-full animate-spin" />
            </div>
          )}

          {error && (
            <div className="text-center py-16 text-rose-400">
              <p className="font-bold">{error}</p>
              <button onClick={() => setCategory(category)} className="mt-4 text-sm text-neutral-400 underline">
                Retry
              </button>
            </div>
          )}

          {!loading && !error && data && (
            <>
              {/* Podium */}
              {podiumOrder.length === 3 && (
                <div className="mb-12">
                  <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto items-end">
                    <PodiumCard entry={podiumOrder[0]} size="small" />
                    <PodiumCard entry={podiumOrder[1]} size="large" />
                    <PodiumCard entry={podiumOrder[2]} size="small" />
                  </div>
                </div>
              )}

              {/* Full table */}
              {rest.length > 0 && (
                <div className="bg-[#0d0e10] border border-white/10 rounded-2xl overflow-hidden">
                  <div className="px-6 py-4 border-b border-white/[0.07] flex items-center gap-2">
                    <Medal size={16} className="text-[#ccff00]" />
                    <h2 className="text-sm font-bold text-white">Full Rankings</h2>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-white/[0.07] text-neutral-500 text-xs uppercase tracking-wider">
                          <th className="px-6 py-3 text-left">Rank</th>
                          <th className="px-4 py-3 text-left">Trader</th>
                          <th className="px-4 py-3 text-left hidden sm:table-cell">Country</th>
                          <th className="px-4 py-3 text-right hidden md:table-cell">Account</th>
                          <th className="px-4 py-3 text-right">Profit</th>
                          <th className="px-4 py-3 text-right hidden md:table-cell">Return</th>
                          <th className="px-4 py-3 text-right hidden lg:table-cell">Win Rate</th>
                          <th className="px-4 py-3 text-left hidden sm:table-cell">Badge</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rest.map((entry, idx) => (
                          <tr
                            key={entry.rank}
                            className={`border-b border-white/[0.04] transition hover:bg-white/[0.025] ${
                              idx % 2 === 0 ? "" : "bg-white/[0.015]"
                            }`}
                          >
                            <td className="px-6 py-4">
                              <span className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center font-black text-xs text-neutral-300">
                                {entry.rank}
                              </span>
                            </td>
                            <td className="px-4 py-4">
                              <div className="font-semibold text-white">{entry.trader_name}</div>
                            </td>
                            <td className="px-4 py-4 hidden sm:table-cell">
                              <span className="text-base">{countryFlags[entry.country] || "🌍"}</span>
                              <span className="text-xs text-neutral-500 ml-1.5">{entry.country_name}</span>
                            </td>
                            <td className="px-4 py-4 text-right hidden md:table-cell">
                              <span className="text-xs font-mono text-neutral-400">{entry.account_size}</span>
                            </td>
                            <td className="px-4 py-4 text-right">
                              <span className="font-black font-mono text-[#ccff00]">
                                +${entry.profit_usd.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                              </span>
                            </td>
                            <td className="px-4 py-4 text-right hidden md:table-cell">
                              <span className="text-xs text-emerald-400 font-semibold">+{entry.return_pct.toFixed(2)}%</span>
                            </td>
                            <td className="px-4 py-4 text-right hidden lg:table-cell">
                              <span className="text-xs text-neutral-300">{entry.win_rate_pct.toFixed(1)}%</span>
                            </td>
                            <td className="px-4 py-4 hidden sm:table-cell">
                              <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${BADGE_STYLES[entry.badge]}`}>
                                {BADGE_ICONS[entry.badge]} {entry.badge}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Prize pool banner */}
              <div className="mt-12 bg-[#0d0e10] border border-[#ccff00]/20 rounded-3xl p-8 text-center relative overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-32 bg-[#ccff00]/[0.04] blur-3xl pointer-events-none" />
                <Trophy size={32} className="text-[#ccff00] mx-auto mb-4" />
                <h3 className="text-2xl font-black text-white mb-2">Monthly Prize Pool</h3>
                <p className="text-neutral-500 text-sm mb-8">
                  Top traders are rewarded with cash bonuses every month
                </p>

                <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto mb-8">
                  {[
                    { rank: "1st", prize: "$5,000", icon: "🥇", color: "border-[#ccff00]/40 bg-[#ccff00]/5" },
                    { rank: "2nd", prize: "$3,000", icon: "🥈", color: "border-white/15 bg-white/3" },
                    { rank: "3rd", prize: "$1,500", icon: "🥉", color: "border-amber-600/30 bg-amber-500/5" },
                  ].map((p) => (
                    <div key={p.rank} className={`rounded-2xl border p-4 ${p.color}`}>
                      <div className="text-2xl mb-1">{p.icon}</div>
                      <div className="text-xs text-neutral-500 uppercase tracking-wide">{p.rank} Place</div>
                      <div className="text-lg font-black text-white">{p.prize}</div>
                    </div>
                  ))}
                </div>

                <Link
                  href="/challenges"
                  className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-[#ccff00] hover:bg-[#b3e600] text-black font-extrabold text-sm uppercase tracking-tight transition"
                >
                  <Zap size={16} />
                  Start Your Challenge
                  <ChevronRight size={16} className="stroke-[3]" />
                </Link>
              </div>
            </>
          )}
        </section>
      </div>
  );
}
