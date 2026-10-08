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
  // SVG dimensions by size
  const svgSize = { sm: 28, md: 34, lg: 40, xl: 46 }[size];

  // Text sizes by size
  const textStyle = {
    sm: { fontSize: "16px", letterSpacing: "-0.03em" },
    md: { fontSize: "20px", letterSpacing: "-0.03em" },
    lg: { fontSize: "24px", letterSpacing: "-0.03em" },
    xl: { fontSize: "28px", letterSpacing: "-0.03em" },
  }[size];

  return (
    <div
      className={`inline-flex items-center select-none cursor-pointer group ${className}`}
      style={{ gap: "10px", fontFamily: "'Space Grotesk', 'Inter', sans-serif" }}
    >
      {/* ── Neon Chart / M Mark ── */}
      <svg
        width={svgSize}
        height={svgSize}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          transition: "transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
          flexShrink: 0,
        }}
        className="group-hover:[transform:scale(1.08)_rotate(-3deg)]"
      >
        {/* Background glow layer — soft neon green trace */}
        <path
          d="M6 24V14L12 20L18 10L24 16V24"
          stroke="#ccff00"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            filter: "drop-shadow(0px 0px 8px #ccff00)",
            opacity: 0.55,
          }}
        />
        {/* Main crisp white structural layer */}
        <path
          d="M6 24V14L12 20L18 10L24 16V24"
          stroke="#FFFFFF"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Upward breakthrough arrow — profit breakout motif */}
        <path
          d="M21 9H27V15"
          stroke="#ccff00"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ filter: "drop-shadow(0px 0px 5px #ccff00)" }}
        />
        <path
          d="M18 10L26 9"
          stroke="#ccff00"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ filter: "drop-shadow(0px 0px 5px #ccff00)" }}
        />
      </svg>

      {/* ── Wordmark ── */}
      {showText && (
        <div
          className="flex items-center relative"
          style={{ lineHeight: 1 }}
        >
          {/* MAX — ultra bold white */}
          <span
            style={{
              ...textStyle,
              fontWeight: 800,
              color: "#FFFFFF",
            }}
          >
            MAX
          </span>

          {/* FUNDED — neon, slightly lighter weight for contrast */}
          <span
            style={{
              ...textStyle,
              fontWeight: 500,
              color: "#ccff00",
              letterSpacing: "0.02em",
              textShadow: "0 0 12px rgba(204, 255, 0, 0.5)",
            }}
          >
            FUNDED
          </span>

          {/* Terminal dot — blinking green beacon */}
          <span
            className="animate-pulse"
            style={{
              display: "inline-block",
              width: "5px",
              height: "5px",
              background: "#ccff00",
              borderRadius: "50%",
              boxShadow: "0 0 8px #ccff00",
              alignSelf: "flex-end",
              marginBottom: "3px",
              marginLeft: "4px",
              flexShrink: 0,
            }}
          />
        </div>
      )}
    </div>
  );
}
