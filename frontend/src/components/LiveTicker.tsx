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

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % LIVE_EVENTS.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const current = LIVE_EVENTS[index];

  return (
    <div className="w-full bg-[#ccff00] text-black font-extrabold text-xs sm:text-[13px] py-2 overflow-hidden select-none relative z-50 border-b border-black/10">
      <div className="max-w-4xl mx-auto flex items-center justify-center px-4 min-h-[22px]">
        {/* Exactly one message at a time sliding from right to left */}
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ x: 60, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -60, opacity: 0 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            className="flex items-center justify-center gap-2.5 text-center"
          >
            {/* Country Flag (SVG - 100% visible on Windows) */}
            <CountryFlag code={current.country} size={14} className="shadow-sm" />
            <span className="text-black font-black">{current.name}</span>
            <span className="text-neutral-900 font-semibold">{current.action}</span>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
