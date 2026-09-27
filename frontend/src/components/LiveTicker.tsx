"use client";

import React, { useState, useEffect } from "react";

const LIVE_EVENTS = [
  { flag: "🇬🇧", text: "Red received a $217.60 reward" },
  { flag: "🇳🇱", text: "Dion got a $25,000 MaxFunded Account" },
  { flag: "🇺🇸", text: "Kev B. received a $12,160 payout" },
  { flag: "🇸🇬", text: "Karthikeyan got a $25,000 MaxFunded Account" },
  { flag: "🇨🇦", text: "Andy L. received an $8,523 reward" },
  { flag: "🇦🇺", text: "Dary B. received a $4,735.20 reward" },
  { flag: "🇩🇪", text: "Niklas passed Phase 2 ($100,000 Account)" },
  { flag: "🇦🇪", text: "Tariq received a $6,410 payout" },
];

export default function LiveTicker() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % LIVE_EVENTS.length);
    }, 4200);
    return () => clearInterval(timer);
  }, []);

  const current = LIVE_EVENTS[index];

  return (
    <div className="w-full bg-[#ccff00] text-black font-bold text-xs sm:text-[13px] py-1.5 px-4 overflow-hidden select-none transition-colors duration-500">
      <div className="max-w-7xl mx-auto flex items-center justify-center text-center">
        <div key={index} className="flex items-center gap-2 animate-fade-in transition-all duration-300">
          <span className="text-base leading-none">{current.flag}</span>
          <span className="tracking-tight">{current.text}</span>
        </div>
      </div>
    </div>
  );
}
