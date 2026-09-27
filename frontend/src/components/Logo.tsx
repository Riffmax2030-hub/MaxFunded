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
      {/* ICONIC PROFITABLE "M" CHART LOGO WITH BREAKOUT ARROW */}
      {/* ========================================================================= */}
      <div
        className={`relative ${iconDimensions} rounded-xl bg-gradient-to-br from-[#ccff00] via-[#a3e635] to-[#4d7c0f] p-[1.5px] shadow-[0_0_18px_rgba(204,255,0,0.25)] transition-transform duration-300 hover:scale-105 shrink-0`}
      >
        <div className="w-full h-full bg-[#08090b] rounded-[10.5px] flex items-center justify-center relative overflow-hidden">
          {/* Subtle soft green ambient glow behind the chart arrow */}
          <div className="absolute top-0 right-0 w-8 h-8 bg-[#ccff00]/20 rounded-full blur-md pointer-events-none" />

          {/* Clean, Simple, Bold "M" Chart Vector */}
          <svg
            viewBox="0 0 36 36"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-[78%] h-[78%] relative z-10"
          >
            <defs>
              <linearGradient id="mChartFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ccff00" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#ccff00" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Subtle filled area beneath the M chart */}
            <path
              d="M6 27L12 13L18 21L26 8V27H6Z"
              fill="url(#mChartFill)"
            />

            {/* Bold Profitable "M" Line Chart */}
            <path
              d="M6 27L12 13L18 21L27 8"
              stroke="#ccff00"
              strokeWidth="3.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Breakout Arrow Head pointing ↗ */}
            <path
              d="M19 8H27V16"
              stroke="#ccff00"
              strokeWidth="3.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
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
