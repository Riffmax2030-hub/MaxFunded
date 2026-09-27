"use client";

import React from "react";

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  className?: string;
}

export default function Logo({
  size = "md",
  showText = true,
  className = "",
}: LogoProps) {
  const iconDimensions = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12",
    xl: "w-16 h-16",
  }[size];

  const textSizes = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
    xl: "text-3xl",
  }[size];

  const subTextSizes = {
    sm: "text-[7.5px]",
    md: "text-[9px]",
    lg: "text-[10px]",
    xl: "text-[11px]",
  }[size];

  return (
    <div className={`inline-flex items-center space-x-3 select-none ${className}`}>
      {/* ========================================================================= */}
      {/* PROFITABLE CHART "M" EMBLEM WITH UPWARD BREAKOUT ARROW */}
      {/* ========================================================================= */}
      <div
        className={`relative ${iconDimensions} rounded-xl bg-gradient-to-br from-[#ccff00] via-[#84cc16] to-[#15803d] p-[1.5px] shadow-[0_0_20px_rgba(204,255,0,0.3)] transition-transform duration-300 hover:scale-105 shrink-0`}
      >
        <div className="w-full h-full bg-[#090b0e] rounded-[10.5px] flex items-center justify-center overflow-hidden relative">
          {/* Subtle chart grid background lines */}
          <div className="absolute inset-0 opacity-[0.08] pointer-events-none">
            <div className="w-full h-full grid grid-cols-3 grid-rows-3 border-neutral-500 divide-x divide-y divide-neutral-500" />
          </div>

          {/* Upward green gradient aura */}
          <div className="absolute bottom-0 inset-x-0 h-2/3 bg-gradient-to-t from-[#ccff00]/15 to-transparent pointer-events-none" />

          <svg
            viewBox="0 0 38 38"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-[82%] h-[82%] relative z-10"
          >
            {/* Candlestick support stems / wicks for authentic trading chart feel */}
            <line x1="11" y1="9" x2="11" y2="28" stroke="#ccff00" strokeWidth="1" strokeOpacity="0.3" strokeDasharray="1.5 1.5" />
            <line x1="22" y1="12" x2="22" y2="28" stroke="#ccff00" strokeWidth="1" strokeOpacity="0.3" strokeDasharray="1.5 1.5" />

            {/* Support baseline */}
            <line x1="4" y1="30" x2="34" y2="30" stroke="#ffffff" strokeWidth="1" strokeOpacity="0.1" />

            {/* 
              THE PROFITABLE "M" CHART PATH:
              Starts at bottom-left support (5, 28)
              Rallies UP to Peak 1 (11, 12)
              Pulls back to higher low (16, 21)
              Rallies UP to Peak 2 (22, 14)
              EXPLODES UPWARD as a soaring breakout arrow to (33, 5)
            */}
            <path
              d="M5 28L11 12L16 21L22 14L33 5"
              stroke="#ccff00"
              strokeWidth="3.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Upward Breakout Arrow Head pointing ↗ */}
            <path
              d="M23 5H33V15"
              stroke="#ccff00"
              strokeWidth="3.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Glowing breakout vertex nodes on chart peaks */}
            <circle cx="11" cy="12" r="1.8" fill="#ffffff" />
            <circle cx="16" cy="21" r="1.6" fill="#ccff00" />
            <circle cx="22" cy="14" r="1.8" fill="#ffffff" />
          </svg>
        </div>
      </div>

      {/* Modern Wordmark */}
      {showText && (
        <div className="flex flex-col leading-none">
          <div className={`${textSizes} font-black tracking-tight text-white flex items-center`}>
            MAX<span className="text-[#ccff00] ml-0.5">FUNDED</span>
          </div>
          <span
            className={`${subTextSizes} font-bold uppercase tracking-[0.26em] text-neutral-400 mt-1`}
          >
            Proprietary Firm
          </span>
        </div>
      )}
    </div>
  );
}
