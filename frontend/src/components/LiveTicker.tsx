"use client";

import React from "react";
import CountryFlag from "@/components/CountryFlag";

const LIVE_EVENTS = [
  { country: "gb", text: "Red received a $217.60 reward" },
  { country: "nl", text: "Dion got a $25,000 MaxFunded Account" },
  { country: "us", text: "Kev B. received a $12,160 payout" },
  { country: "sg", text: "Karthikeyan got a $25,000 MaxFunded Account" },
  { country: "ng", text: "Emeka O. received a $9,450 payout" },
  { country: "ca", text: "Andy L. received an $8,523 reward" },
  { country: "au", text: "Dary B. received a $4,735.20 reward" },
  { country: "de", text: "Niklas passed Phase 2 ($100,000 Account)" },
  { country: "ae", text: "Tariq received a $6,410 payout" },
  { country: "fr", text: "Julien got a $50,000 MaxFunded Account" },
  { country: "es", text: "Mateo received a $3,890 reward" },
];

export default function LiveTicker() {
  // Duplicate list to achieve continuous, seamless marquee loop from right to left
  const displayEvents = [...LIVE_EVENTS, ...LIVE_EVENTS];

  return (
    <div className="w-full bg-[#ccff00] text-black font-extrabold text-xs sm:text-[13px] py-2 overflow-hidden select-none relative z-50 border-b border-black/10">
      {/* Edge gradient masks for smooth fade in/out on the sides */}
      <div className="absolute left-0 inset-y-0 w-8 sm:w-16 bg-gradient-to-r from-[#ccff00] to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 inset-y-0 w-8 sm:w-16 bg-gradient-to-l from-[#ccff00] to-transparent z-10 pointer-events-none" />

      {/* Marquee Track moving from Right to Left */}
      <div className="animate-marquee flex items-center">
        {displayEvents.map((item, index) => (
          <div
            key={index}
            className="flex items-center gap-2.5 mx-5 sm:mx-8 whitespace-nowrap shrink-0 hover:opacity-85 transition-opacity"
          >
            {/* SVG Flag visible on Windows OS */}
            <CountryFlag code={item.country} size={13} className="shadow-sm" />
            <span className="tracking-tight text-neutral-950 font-bold">{item.text}</span>
            {/* Dot Separator */}
            <span className="w-1.5 h-1.5 rounded-full bg-black/40 ml-3" />
          </div>
        ))}
      </div>
    </div>
  );
}
