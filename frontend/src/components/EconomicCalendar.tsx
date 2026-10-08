"use client";

import React, { useState } from "react";
import { Calendar, AlertCircle, Clock, ShieldAlert, Filter, Globe } from "lucide-react";

interface NewsEvent {
  id: string;
  time: string;
  countdown: string;
  currency: string;
  flag: string;
  event: string;
  impact: "HIGH" | "MEDIUM" | "LOW";
  forecast: string;
  previous: string;
}

const UPCOMING_EVENTS: NewsEvent[] = [
  {
    id: "1",
    time: "12:30 UTC",
    countdown: "in 2h 15m",
    currency: "USD",
    flag: "🇺🇸",
    event: "Consumer Price Index (CPI) YoY",
    impact: "HIGH",
    forecast: "2.5%",
    previous: "2.6%",
  },
  {
    id: "2",
    time: "12:30 UTC",
    countdown: "in 2h 15m",
    currency: "USD",
    flag: "🇺🇸",
    event: "Core CPI MoM",
    impact: "HIGH",
    forecast: "0.2%",
    previous: "0.3%",
  },
  {
    id: "3",
    time: "14:00 UTC",
    countdown: "in 3h 45m",
    currency: "USD",
    flag: "🇺🇸",
    event: "Fed Chair Powell Speech",
    impact: "HIGH",
    forecast: "—",
    previous: "—",
  },
  {
    id: "4",
    time: "08:00 UTC",
    countdown: "Tomorrow",
    currency: "EUR",
    flag: "🇪🇺",
    event: "ECB President Lagarde Speech",
    impact: "MEDIUM",
    forecast: "—",
    previous: "—",
  },
  {
    id: "5",
    time: "12:30 UTC",
    countdown: "Oct 09",
    currency: "USD",
    flag: "🇺🇸",
    event: "Non-Farm Payrolls (NFP)",
    impact: "HIGH",
    forecast: "140K",
    previous: "142K",
  },
  {
    id: "6",
    time: "07:00 UTC",
    countdown: "Oct 10",
    currency: "GBP",
    flag: "🇬🇧",
    event: "GDP MoM",
    impact: "MEDIUM",
    forecast: "0.2%",
    previous: "0.0%",
  },
];

export default function EconomicCalendar() {
  const [filterImpact, setFilterImpact] = useState<"ALL" | "HIGH">("ALL");

  const filtered = UPCOMING_EVENTS.filter((e) =>
    filterImpact === "ALL" ? true : e.impact === "HIGH"
  );

  return (
    <div className="bg-[#0d0e10] border border-white/10 rounded-2xl p-5 shadow-2xl relative overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 mb-4 border-b border-white/[0.06]">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
            <Calendar size={18} />
          </div>
          <div>
            <h3 className="font-bold text-white text-sm">Economic News Calendar</h3>
            <p className="text-[11px] text-neutral-400">High-volatility macroeconomic events</p>
          </div>
        </div>

        {/* Filter Toggle */}
        <div className="flex items-center gap-1.5 bg-[#14161a] border border-white/10 p-1 rounded-xl text-xs">
          <button
            onClick={() => setFilterImpact("ALL")}
            className={`px-3 py-1 rounded-lg transition font-bold ${
              filterImpact === "ALL"
                ? "bg-white/15 text-white"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            All Events
          </button>
          <button
            onClick={() => setFilterImpact("HIGH")}
            className={`px-3 py-1 rounded-lg transition font-bold flex items-center gap-1.5 ${
              filterImpact === "HIGH"
                ? "bg-rose-500 text-white"
                : "text-rose-400 hover:text-white"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-rose-300 animate-pulse" />
            High Impact Only
          </button>
        </div>
      </div>

      {/* Red Folder Rule Notice */}
      <div className="bg-amber-950/20 border border-amber-500/30 rounded-xl p-3 mb-4 flex items-start gap-2.5 text-xs text-amber-300/90">
        <ShieldAlert size={16} className="shrink-0 text-amber-400 mt-0.5" />
        <span>
          <strong>News Trading Reminder:</strong> News trading is allowed on MaxFunded accounts, but please exercise risk management during High-Impact releases to protect your 4% daily loss floor.
        </span>
      </div>

      {/* Event Rows */}
      <div className="space-y-2">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.05] transition text-xs"
          >
            {/* Left: Flag, Currency, Event */}
            <div className="flex items-center gap-3">
              <span className="text-xl shrink-0">{item.flag}</span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-white">{item.currency}</span>
                  <span
                    className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                      item.impact === "HIGH"
                        ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                        : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                    }`}
                  >
                    {item.impact}
                  </span>
                </div>
                <div className="font-semibold text-neutral-200 mt-0.5">{item.event}</div>
              </div>
            </div>

            {/* Right: Time, Forecast, Previous */}
            <div className="flex items-center gap-4 sm:text-right font-mono text-[11px] shrink-0">
              <div>
                <div className="text-neutral-500 text-[10px] uppercase">Forecast / Prev</div>
                <div className="text-neutral-300">
                  {item.forecast} / {item.previous}
                </div>
              </div>

              <div className="border-l border-white/10 pl-4">
                <div className="text-white font-bold">{item.time}</div>
                <div className="text-amber-400 text-[10px] flex items-center gap-1">
                  <Clock size={10} />
                  {item.countdown}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
