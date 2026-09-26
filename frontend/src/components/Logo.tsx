import React from "react";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  className?: string;
}

export default function Logo({ size = "md", showText = true, className = "" }: LogoProps) {
  const iconDimensions = {
    sm: "w-7 h-7",
    md: "w-9 h-9",
    lg: "w-11 h-11",
  }[size];

  const textSizes = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
  }[size];

  return (
    <div className={`inline-flex items-center space-x-2.5 select-none ${className}`}>
      {/* Geometric Vector Emblem */}
      <div className={`relative ${iconDimensions} rounded-xl bg-gradient-to-tr from-brand-600 via-indigo-600 to-cyan-400 p-[1.5px] shadow-lg shadow-brand-600/25 transition-transform duration-300 hover:scale-105`}>
        <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center overflow-hidden">
          <svg
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-5 h-5 text-white"
          >
            {/* Background subtle grid glow */}
            <path
              d="M6 24V10L12 18L16 13L20 18L26 10V24"
              stroke="url(#logo-grad)"
              strokeWidth="2.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Ascending Performance Arrow Accent */}
            <circle cx="26" cy="10" r="2.2" fill="#38BDF8" />
            <defs>
              <linearGradient id="logo-grad" x1="6" y1="24" x2="26" y2="10" gradientUnits="userSpaceOnUse">
                <stop stopColor="#3B82F6" />
                <stop offset="0.5" stopColor="#6366F1" />
                <stop offset="1" stopColor="#38BDF8" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>

      {/* Modern Wordmark */}
      {showText && (
        <span className={`${textSizes} font-black tracking-tight text-white flex items-center`}>
          MAX<span className="text-brand-500 font-extralight ml-0.5 tracking-normal">FUNDED</span>
        </span>
      )}
    </div>
  );
}
