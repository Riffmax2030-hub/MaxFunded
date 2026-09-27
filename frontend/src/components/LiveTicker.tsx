"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import CountryFlag from "@/components/CountryFlag";

const LIVE_EVENTS = [
  { country: "gb", name: "Red", action: "received a $217.60 reward" },
  { country: "nl", name: "Dion", action: "got a $25,000 MaxFunded Account" },
  { country: "us", name: "Kev B.", action: "received a $12,160 payout" },
  { country: "sg", name: "Karthikeyan", action: "got a $25,000 MaxFunded Account" },
  { country: "ng", name: "Emeka O.", action: "received a $9,450 payout" },
  { country: "ca", name: "Andy L.", action: "received an $8,523 reward" },
  { country: "au", name: "Dary B.", action: "received a $4,735.20 reward" },
  { country: "de", name: "Niklas", action: "passed Phase 2 ($100,000 Account)" },
  { country: "ae", name: "Tariq", action: "received a $6,410 payout" },
  { country: "fr", name: "Julien", action: "got a $50,000 MaxFunded Account" },
  { country: "es", name: "Mateo", action: "received a $3,890 reward" },
];

export default function LiveTicker() {
  const [index, setIndex] = useState(0);

  // 6.5 seconds total cycle:
  // ~1.1s slide in from right to center -> 4.3s resting in the middle -> ~1.1s slide out to left
  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % LIVE_EVENTS.length);
    }, 6500);
    return () => clearInterval(timer);
  }, []);

  const current = LIVE_EVENTS[index];

  return (
    <div className="w-full bg-[#ccff00] text-black font-extrabold text-xs sm:text-[13px] py-2 overflow-hidden select-none relative z-50 border-b border-black/10">
      <div className="w-full max-w-7xl mx-auto relative flex items-center justify-center min-h-[22px] px-4">
        {/* Exactly one message at a time sliding across the entire bar */}
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            // Enters from the far right of the bar
            initial={{ x: "60vw", opacity: 0 }}
            // Glides to the dead center and pauses
            animate={{ x: 0, opacity: 1 }}
            // Exits smoothly to the far left of the bar
            exit={{ x: "-60vw", opacity: 0 }}
            transition={{
              duration: 1.1,
              ease: [0.16, 1, 0.3, 1], // Smooth cubic deceleration into center and acceleration out
            }}
            className="flex items-center justify-center gap-2.5 text-center whitespace-nowrap"
          >
            {/* SVG Country Flag (visible on Windows OS) */}
            <CountryFlag code={current.country} size={15} className="shadow-sm" />
            <span className="text-black font-black tracking-tight">{current.name}</span>
            <span className="text-neutral-900 font-bold">{current.action}</span>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
