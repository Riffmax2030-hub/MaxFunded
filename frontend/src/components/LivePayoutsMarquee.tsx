"use client";

import React from "react";
import Link from "next/link";
import { ArrowUpRight, Zap, CheckCircle2, ShieldCheck } from "lucide-react";

interface ActivityItem {
  id: string;
  type: "payout" | "passed";
  trader: string;
  flag: string;
  country: string;
  amount?: string;
  method?: string;
  challenge?: string;
  time: string;
}

const ACTIVITIES: ActivityItem[] = [
  {
    id: "1",
    type: "payout",
    trader: "Kev B.",
    flag: "🇬🇧",
    country: "UK",
    amount: "$12,160",
    method: "USDT",
    time: "5m ago",
  },
  {
    id: "2",
    type: "passed",
    trader: "Alex S.",
    flag: "🇩🇪",
    country: "Germany",
    challenge: "$100K Funded",
    time: "18m ago",
  },
  {
    id: "3",
    type: "payout",
    trader: "Sherif A.",
    flag: "🇳🇬",
    country: "Nigeria",
    amount: "$4,250",
    method: "Bank Wire",
    time: "32m ago",
  },
  {
    id: "4",
    type: "passed",
    trader: "Lark A.",
    flag: "🇨🇦",
    country: "Canada",
    challenge: "Phase 1 Passed",
    time: "47m ago",
  },
  {
    id: "5",
    type: "payout",
    trader: "Tom de J.",
    flag: "🇳🇱",
    country: "Netherlands",
    amount: "$10,019",
    method: "Crypto",
    time: "1h ago",
  },
  {
    id: "6",
    type: "passed",
    trader: "Elena R.",
    flag: "🇩🇪",
    country: "Germany",
    challenge: "$50K Funded",
    time: "1h ago",
  },
  {
    id: "7",
    type: "payout",
    trader: "Marcus V.",
    flag: "🇺🇸",
    country: "USA",
    amount: "$4,120",
    method: "USDT",
    time: "2h ago",
  },
  {
    id: "8",
    type: "passed",
    trader: "Mateo S.",
    flag: "🇪🇸",
    country: "Spain",
    challenge: "Phase 1 Passed",
    time: "2h ago",
  },
  {
    id: "9",
    type: "payout",
    trader: "Tariq H.",
    flag: "🇦🇪",
    country: "UAE",
    amount: "$2,180",
    method: "Bank Wire",
    time: "3h ago",
  },
];

export default function LivePayoutsMarquee() {
  // Duplicate array for seamless infinite marquee loop
  const duplicated = [...ACTIVITIES, ...ACTIVITIES];

  return (
    <div className="relative w-full border-y border-white/[0.08] bg-[#090b0e] py-3.5 overflow-hidden select-none">
      {/* Edge gradient fade masks */}
      <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[#060709] to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[#060709] to-transparent z-10 pointer-events-none" />

      {/* Floating Live Badge on Left */}
      <div className="hidden lg:flex absolute left-4 top-1/2 -translate-y-1/2 z-20 items-center gap-2 px-3.5 py-2 rounded-full bg-[#11141a] border border-white/10 shadow-lg backdrop-blur-md">
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ccff00] opacity-75" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#ccff00]" />
        </span>
        <span className="text-xs font-black uppercase tracking-wider text-neutral-200">
          Live Payouts
        </span>
      </div>

      {/* Animated Marquee Row */}
      <div className="flex w-max animate-marquee hover:[animation-play-state:paused] items-center gap-4 lg:pl-40">
        {duplicated.map((item, idx) => (
          <div
            key={`${item.id}-${idx}`}
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.08] transition text-sm shrink-0"
          >
            {item.type === "payout" ? (
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shrink-0 shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
            ) : (
              <span className="w-2.5 h-2.5 rounded-full bg-[#ccff00] shrink-0 shadow-[0_0_8px_rgba(204,255,0,0.6)]" />
            )}

            <div className="flex items-center gap-1.5">
              <span className="text-base">{item.flag}</span>
              <span className="font-bold text-white text-sm">{item.trader}</span>
              <span className="text-neutral-400 text-xs">({item.country})</span>
            </div>

            <span className="text-neutral-500">·</span>

            {item.type === "payout" ? (
              <div className="flex items-center gap-1.5">
                <span className="text-neutral-300 text-xs">payout</span>
                <span className="font-black text-emerald-400 font-mono text-sm sm:text-base">
                  {item.amount}
                </span>
                <span className="text-xs text-neutral-400 uppercase px-1.5 py-0.5 rounded bg-white/5 font-mono">
                  {item.method}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <span className="text-neutral-300 text-xs">achieved</span>
                <span className="font-black text-[#ccff00] flex items-center gap-1 text-sm">
                  <Zap size={13} />
                  {item.challenge}
                </span>
              </div>
            )}

            <span className="text-neutral-500">·</span>

            <span className="text-xs text-neutral-400 font-mono">{item.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
