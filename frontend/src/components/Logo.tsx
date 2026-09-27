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
      {/* Geometric Neon Arrow Emblem */}
      <div className={`relative ${iconDimensions} rounded-xl bg-neon p-[1px] shadow-neon-sm transition-transform duration-300 hover:scale-105`}>
        <div className="w-full h-full bg-[#08090b] rounded-[11px] flex items-center justify-center overflow-hidden">
          <svg
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-5 h-5"
          >
            {/* Dynamic Upward Growth Arrow + Hexagonal Energy */}
            <path
              d="M16 4L6 14H12V28H20V14H26L16 4Z"
              fill="#ccff00"
            />
            <path
              d="M16 8L22 14H18V24H14V14H10L16 8Z"
              fill="#08090b"
              fillOpacity="0.25"
            />
          </svg>
        </div>
      </div>

      {/* Modern Wordmark */}
      {showText && (
        <span className={`${textSizes} font-black tracking-tight text-white flex items-center`}>
          Max<span className="text-neon ml-0.5">Funded</span>
        </span>
      )}
    </div>
  );
}
