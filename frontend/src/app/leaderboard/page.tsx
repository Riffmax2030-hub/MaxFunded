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
  const isFirst = entry.rank === 1;
  const isSecond = entry.rank === 2;
  const isThird = entry.rank === 3;

  const cardStyle = isFirst
    ? "border-[#ccff00]/60 bg-[#0d1014] shadow-[0_0_50px_rgba(204,255,0,0.2)] ring-1 ring-[#ccff00]/30"
    : isSecond
    ? "border-slate-500/40 bg-[#0d0e12] shadow-[0_0_30px_rgba(148,163,184,0.1)]"
    : "border-amber-600/40 bg-[#0f0d10] shadow-[0_0_30px_rgba(217,119,6,0.1)]";

  const crownBadge = isFirst
    ? "bg-[#ccff00] text-black shadow-[0_0_20px_rgba(204,255,0,0.6)]"
    : isSecond
    ? "bg-slate-300 text-slate-900 shadow-[0_0_15px_rgba(203,213,225,0.4)]"
    : "bg-amber-600 text-white shadow-[0_0_15px_rgba(217,119,6,0.4)]";

  return (
    <div
      className={`metric-card flex flex-col items-center gap-3 p-6 rounded-3xl transition-all duration-300 ${cardStyle} ${
        isLarge ? "py-10 scale-[1.05] z-10 -translate-y-2" : "opacity-95"
      }`}
    >
      {/* Top neon glow bar for #1 */}
      {isFirst && (
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#ccff00] to-transparent" />
      )}

      {/* Rank circle badge */}
      <div
        className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl transition-transform hover:scale-110 ${crownBadge}`}
      >
        {isFirst ? "🥇" : isSecond ? "🥈" : "🥉"}
      </div>

      {/* Trader info */}
      <div className="text-center">
        <div className="text-2xl filter drop-shadow">
          {countryFlags[entry.country] || "🌍"}
        </div>
        <div className={`font-black text-white tracking-tight mt-1 ${isLarge ? "text-xl" : "text-base"}`}>
          {entry.trader_name}
        </div>
        <div className="text-[11px] text-neutral-400 font-medium tracking-wide">{entry.country_name}</div>
      </div>

      {/* Profit metrics */}
      <div className="text-center my-1">
        <div className={`font-black font-mono tracking-tight ${isLarge ? "text-3xl text-[#ccff00] text-glow" : "text-xl text-white"}`}>
          +${entry.profit_usd.toLocaleString("en-US", { minimumFractionDigits: 2 })}
        </div>
        <div className="text-xs text-emerald-400 font-bold mt-0.5 font-mono">+{entry.return_pct.toFixed(2)}% ROI</div>
      </div>

      {/* Badge */}
      <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full ${BADGE_STYLES[entry.badge]}`}>
        {BADGE_ICONS[entry.badge]} {entry.badge}
      </span>

      {/* Account size */}
      <div className="text-xs text-neutral-300 font-mono bg-white/[0.04] border border-white/[0.08] px-3 py-1 rounded-xl">
        {entry.account_size}
      </div>

      {/* Prize */}
      {entry.prize_amount && (
        <div className="w-full bg-[#ccff00]/10 border border-[#ccff00]/25 rounded-2xl p-2.5 text-center mt-1">
          <div className="text-[9px] text-neutral-400 uppercase tracking-widest font-bold">Prize Allocation</div>
          <div className="text-sm font-black text-[#ccff00] font-mono">{entry.prize_amount}</div>
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
        <section className="relative pt-16 sm:pt-20 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center overflow-hidden">
          {/* Ambient Glow Orbs */}
          <div className="glow-orb absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-b from-[#ccff00]/[0.08] to-transparent blur-3xl pointer-events-none -z-10 rounded-full" />

          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#ccff00]/10 border border-[#ccff00]/25 text-xs text-[#ccff00] font-bold mb-6 select-none shadow-[0_0_20px_rgba(204,255,0,0.15)]">
            <Trophy size={14} className="text-[#ccff00]" />
            Live Competition Standings
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white mb-4 uppercase">
            Top Funded <span className="text-[#ccff00] neon-glow-text">Traders</span>
          </h1>
          <p className="text-neutral-400 text-base sm:text-lg max-w-xl mx-auto mb-10 leading-relaxed">
            Live competition leaderboard — Top verified performers earn monthly prize distributions.
            <span className="text-[#ccff00] font-semibold"> Can you break into the Top 3?</span>
          </p>

          {/* Stats row with Metric Cards */}
          {data && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto mb-10">
              {[
                {
                  icon: <Users size={18} className="text-[#ccff00]" />,
                  label: "Active Participants",
                  value: data.total_participants.toLocaleString(),
                },
                {
                  icon: <DollarSign size={18} className="text-emerald-400" />,
                  label: "Payouts Distributed",
                  value: data.total_payouts_distributed,
                },
                {
                  icon: <Clock size={18} className="text-amber-400" />,
                  label: "Competition Closes In",
                  value: `${data.competition_ends_in_days} Days`,
                },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="metric-card p-5 flex flex-col items-center justify-center gap-1.5"
                >
                  <div className="p-2 rounded-xl bg-white/[0.04] mb-1">{stat.icon}</div>
                  <div className="text-xl sm:text-2xl font-black font-mono text-white tracking-tight">{stat.value}</div>
                  <div className="text-[10px] text-neutral-400 uppercase tracking-widest font-bold">{stat.label}</div>
                </div>
              ))}
            </div>
          )}

          {/* Category switcher with Liquid Calculator Tabs */}
          <div className="flex flex-wrap gap-2 justify-center mx-auto w-fit p-1.5 bg-[#0b0c10] border border-white/[0.08] rounded-2xl">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.id)}
                className={`calculator-tab text-xs sm:text-sm font-bold ${
                  category === cat.id ? "active" : ""
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
            <div className="flex flex-col justify-center items-center py-24 gap-4">
              <div className="w-10 h-10 border-2 border-[#ccff00]/20 border-t-[#ccff00] rounded-full animate-spin" />
              <p className="text-xs text-neutral-400 font-mono uppercase tracking-wider">Syncing live standings...</p>
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
                <div className="mb-14">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto items-end">
                    <PodiumCard entry={podiumOrder[0]} size="small" />
                    <PodiumCard entry={podiumOrder[1]} size="large" />
                    <PodiumCard entry={podiumOrder[2]} size="small" />
                  </div>
                </div>
              )}

              {/* Full table with Bento Glass styling */}
              {rest.length > 0 && (
                <div className="bento-card overflow-hidden shadow-2xl p-0">
                  <div className="px-6 py-4 border-b border-white/[0.07] flex items-center justify-between bg-white/[0.02]">
                    <div className="flex items-center gap-2">
                      <Medal size={16} className="text-[#ccff00]" />
                      <h2 className="text-sm font-bold text-white uppercase tracking-wider">All Verified Rankings</h2>
                    </div>
                    <span className="text-xs text-neutral-500 font-mono">Updated in real-time</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-white/[0.06] text-neutral-500 text-[11px] font-bold uppercase tracking-wider bg-white/[0.01]">
                          <th className="px-6 py-3.5 text-left">Rank</th>
                          <th className="px-4 py-3.5 text-left">Trader</th>
                          <th className="px-4 py-3.5 text-left hidden sm:table-cell">Country</th>
                          <th className="px-4 py-3.5 text-right hidden md:table-cell">Account</th>
                          <th className="px-4 py-3.5 text-right">Profit</th>
                          <th className="px-4 py-3.5 text-right hidden md:table-cell">ROI</th>
                          <th className="px-4 py-3.5 text-right hidden lg:table-cell">Win Rate</th>
                          <th className="px-4 py-3.5 text-left hidden sm:table-cell">Tier</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/[0.03]">
                        {rest.map((entry, idx) => (
                          <tr
                            key={entry.rank}
                            className={`transition-colors hover:bg-white/[0.03] ${
                              idx % 2 === 0 ? "" : "bg-white/[0.01]"
                            }`}
                          >
                            <td className="px-6 py-4">
                              <span className="w-8 h-8 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center font-black text-xs font-mono text-neutral-300">
                                #{entry.rank}
                              </span>
                            </td>
                            <td className="px-4 py-4">
                              <div className="font-bold text-white text-sm">{entry.trader_name}</div>
                            </td>
                            <td className="px-4 py-4 hidden sm:table-cell">
                              <span className="text-base">{countryFlags[entry.country] || "🌍"}</span>
                              <span className="text-xs text-neutral-400 font-medium ml-1.5">{entry.country_name}</span>
                            </td>
                            <td className="px-4 py-4 text-right hidden md:table-cell">
                              <span className="text-xs font-mono text-neutral-400 bg-white/[0.03] border border-white/[0.06] px-2 py-0.5 rounded-md">
                                {entry.account_size}
                              </span>
                            </td>
                            <td className="px-4 py-4 text-right">
                              <span className="font-black font-mono text-[#ccff00] text-sm">
                                +${entry.profit_usd.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                              </span>
                            </td>
                            <td className="px-4 py-4 text-right hidden md:table-cell">
                              <span className="text-xs text-emerald-400 font-bold font-mono">+{entry.return_pct.toFixed(2)}%</span>
                            </td>
                            <td className="px-4 py-4 text-right hidden lg:table-cell">
                              <span className="text-xs text-neutral-300 font-mono font-bold">{entry.win_rate_pct.toFixed(1)}%</span>
                            </td>
                            <td className="px-4 py-4 hidden sm:table-cell">
                              <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${BADGE_STYLES[entry.badge]}`}>
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
              <div className="mt-14 bento-card border border-[#ccff00]/30 rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden shadow-[0_0_60px_rgba(204,255,0,0.08)]">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-36 bg-[#ccff00]/[0.08] blur-3xl pointer-events-none" />
                <div className="w-14 h-14 rounded-2xl bg-[#ccff00]/10 border border-[#ccff00]/25 flex items-center justify-center mx-auto mb-5 text-[#ccff00]">
                  <Trophy size={28} />
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-white mb-2 tracking-tight">Monthly Performance Allocation</h3>
                <p className="text-neutral-400 text-sm max-w-lg mx-auto mb-8">
                  Verified traders holding top ranks at month close receive direct capital bonuses credited directly to their payout balance.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-xl mx-auto mb-8">
                  {[
                    { rank: "1st", prize: "$5,000", icon: "🥇", color: "border-[#ccff00]/40 bg-[#ccff00]/[0.04]" },
                    { rank: "2nd", prize: "$3,000", icon: "🥈", color: "border-slate-500/30 bg-white/[0.02]" },
                    { rank: "3rd", prize: "$1,500", icon: "🥉", color: "border-amber-600/30 bg-amber-500/[0.04]" },
                  ].map((p) => (
                    <div key={p.rank} className={`rounded-2xl border p-5 ${p.color} transition hover:scale-105`}>
                      <div className="text-3xl mb-1">{p.icon}</div>
                      <div className="text-[11px] text-neutral-400 uppercase tracking-widest font-bold">{p.rank} Place</div>
                      <div className="text-2xl font-black font-mono text-white mt-1">{p.prize}</div>
                    </div>
                  ))}
                </div>

                <Link
                  href="/challenges"
                  className="btn-neon inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-[#ccff00] hover:bg-[#b3e600] text-black font-black text-sm uppercase tracking-tight transition shadow-neon"
                >
                  <Zap size={16} />
                  Claim Your Trading Account
                  <ChevronRight size={16} className="stroke-[3]" />
                </Link>
              </div>
            </>
          )}
        </section>
      </div>
  );
}
