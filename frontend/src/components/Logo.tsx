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
    sm: "w-7 h-7",
    md: "w-9 h-9",
    lg: "w-11 h-11",
    xl: "w-14 h-14",
  }[size];

  const textSizes = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
    xl: "text-3xl",
  }[size];

  const subTextSizes = {
    sm: "text-[7px]",
    md: "text-[8px]",
    lg: "text-[9px]",
    xl: "text-[10px]",
  }[size];

  return (
    <div className={`inline-flex items-center space-x-3 select-none ${className}`}>
      {/* Institutional Geometric Emblem */}
      <div
        className={`relative ${iconDimensions} rounded-xl bg-gradient-to-br from-[#ccff00] via-[#a3e635] to-[#65a30d] p-[1.5px] shadow-[0_0_20px_rgba(204,255,0,0.3)] transition-transform duration-300 hover:scale-105 group-hover:shadow-[0_0_28px_rgba(204,255,0,0.5)] shrink-0`}
      >
        <div className="w-full h-full bg-[#0a0c0f] rounded-[10.5px] flex items-center justify-center overflow-hidden relative">
          {/* Subtle inner ambient glow */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#ccff00]/15 to-transparent pointer-events-none" />

          <svg
            viewBox="0 0 36 36"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-[72%] h-[72%] relative z-10"
          >
            {/* Dynamic Ascending Apex "M" with Rocket Chevrons */}
            <path
              d="M5 28V12L13 21L18 15L23 21L31 12V28"
              stroke="#ccff00"
              strokeWidth="3.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Ascending Performance Arrow Head */}
            <path
              d="M18 6L23 11H13L18 6Z"
              fill="#ccff00"
            />
            {/* Pulse Indicator Core */}
            <circle cx="18" cy="15" r="2" fill="#ffffff" />
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
            className={`${subTextSizes} font-bold uppercase tracking-[0.25em] text-neutral-400 mt-0.5`}
          >
            Proprietary Firm
          </span>
        </div>
      )}
    </div>
  );
}
