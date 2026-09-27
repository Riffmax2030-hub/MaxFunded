"use client";

import React from "react";

interface CountryFlagProps {
  code: string;
  className?: string;
  size?: number;
}

/**
 * Universal SVG Country Flags for 100% cross-platform compatibility
 * (Solves the issue where Windows OS cannot render country flag emojis).
 */
export default function CountryFlag({
  code,
  className = "",
  size = 18,
}: CountryFlagProps) {
  const norm = (code || "").toLowerCase();

  // Width = size * 1.4 for standard 4:3 or 3:2 flag ratio
  const width = Math.round(size * 1.35);
  const height = size;

  switch (norm) {
    case "gb":
    case "en":
    case "en-gb":
    case "uk":
      // United Kingdom / England Flag (Union Jack)
      return (
        <svg
          width={width}
          height={height}
          viewBox="0 0 60 40"
          className={`inline-block rounded-[3px] shadow-sm shrink-0 overflow-hidden ${className}`}
        >
          <clipPath id="gb-clip">
            <rect width="60" height="40" rx="3" />
          </clipPath>
          <g clipPath="url(#gb-clip)">
            {/* Blue background */}
            <rect width="60" height="40" fill="#012169" />
            {/* White diagonals */}
            <path d="M0 0 L60 40 M60 0 L0 40" stroke="#ffffff" strokeWidth="8" />
            {/* Red diagonals */}
            <path d="M0 0 L60 40" stroke="#C8102E" strokeWidth="4" />
            <path d="M60 0 L0 40" stroke="#C8102E" strokeWidth="4" />
            {/* White cross */}
            <path d="M30 0 v40 M0 20 h60" stroke="#ffffff" strokeWidth="12" />
            {/* Red cross */}
            <path d="M30 0 v40 M0 20 h60" stroke="#C8102E" strokeWidth="7" />
          </g>
        </svg>
      );

    case "us":
    case "en-us":
      // United States Flag
      return (
        <svg
          width={width}
          height={height}
          viewBox="0 0 60 40"
          className={`inline-block rounded-[3px] shadow-sm shrink-0 overflow-hidden ${className}`}
        >
          <clipPath id="us-clip">
            <rect width="60" height="40" rx="3" />
          </clipPath>
          <g clipPath="url(#us-clip)">
            {/* Red background with white stripes */}
            <rect width="60" height="40" fill="#B22234" />
            {[1, 3, 5, 7, 9, 11].map((i) => (
              <rect key={i} y={i * (40 / 13)} width="60" height={40 / 13} fill="#ffffff" />
            ))}
            {/* Blue canton */}
            <rect width="25" height={40 * (7 / 13)} fill="#3C3B6E" />
            {/* Stylized stars grid */}
            <circle cx="6" cy="6" r="1.2" fill="#ffffff" />
            <circle cx="12.5" cy="6" r="1.2" fill="#ffffff" />
            <circle cx="19" cy="6" r="1.2" fill="#ffffff" />
            <circle cx="9.2" cy="11" r="1.2" fill="#ffffff" />
            <circle cx="15.8" cy="11" r="1.2" fill="#ffffff" />
            <circle cx="6" cy="16" r="1.2" fill="#ffffff" />
            <circle cx="12.5" cy="16" r="1.2" fill="#ffffff" />
            <circle cx="19" cy="16" r="1.2" fill="#ffffff" />
          </g>
        </svg>
      );

    case "de":
      // Germany Flag (Black, Red, Gold)
      return (
        <svg
          width={width}
          height={height}
          viewBox="0 0 60 40"
          className={`inline-block rounded-[3px] shadow-sm shrink-0 overflow-hidden ${className}`}
        >
          <rect width="60" height="13.33" fill="#000000" />
          <rect y="13.33" width="60" height="13.33" fill="#DD0000" />
          <rect y="26.66" width="60" height="13.34" fill="#FFCE00" />
        </svg>
      );

    case "fr":
      // France Flag (Blue, White, Red)
      return (
        <svg
          width={width}
          height={height}
          viewBox="0 0 60 40"
          className={`inline-block rounded-[3px] shadow-sm shrink-0 overflow-hidden ${className}`}
        >
          <rect width="20" height="40" fill="#002395" />
          <rect x="20" width="20" height="40" fill="#ffffff" />
          <rect x="40" width="20" height="40" fill="#ED2939" />
        </svg>
      );

    case "es":
      // Spain Flag (Red, Yellow, Red)
      return (
        <svg
          width={width}
          height={height}
          viewBox="0 0 60 40"
          className={`inline-block rounded-[3px] shadow-sm shrink-0 overflow-hidden ${className}`}
        >
          <rect width="60" height="10" fill="#AA151B" />
          <rect y="10" width="60" height="20" fill="#F1BF00" />
          <rect y="30" width="60" height="10" fill="#AA151B" />
          <circle cx="15" cy="20" r="3" fill="#AA151B" opacity="0.6" />
        </svg>
      );

    case "ae":
      // United Arab Emirates Flag
      return (
        <svg
          width={width}
          height={height}
          viewBox="0 0 60 40"
          className={`inline-block rounded-[3px] shadow-sm shrink-0 overflow-hidden ${className}`}
        >
          <rect x="15" width="45" height="13.33" fill="#00732f" />
          <rect x="15" y="13.33" width="45" height="13.33" fill="#ffffff" />
          <rect x="15" y="26.66" width="45" height="13.34" fill="#000000" />
          <rect width="15" height="40" fill="#ff0000" />
        </svg>
      );

    case "ng":
      // Nigeria Flag (Green, White, Green)
      return (
        <svg
          width={width}
          height={height}
          viewBox="0 0 60 40"
          className={`inline-block rounded-[3px] shadow-sm shrink-0 overflow-hidden ${className}`}
        >
          <rect width="20" height="40" fill="#008751" />
          <rect x="20" width="20" height="40" fill="#ffffff" />
          <rect x="40" width="20" height="40" fill="#008751" />
        </svg>
      );

    case "jp":
      // Japan Flag (White with Red Sun)
      return (
        <svg
          width={width}
          height={height}
          viewBox="0 0 60 40"
          className={`inline-block rounded-[3px] shadow-sm shrink-0 overflow-hidden ${className}`}
        >
          <rect width="60" height="40" fill="#ffffff" stroke="#e5e7eb" strokeWidth="0.5" />
          <circle cx="30" cy="20" r="11" fill="#bc002d" />
        </svg>
      );

    case "nl":
      // Netherlands Flag (Red, White, Blue)
      return (
        <svg
          width={width}
          height={height}
          viewBox="0 0 60 40"
          className={`inline-block rounded-[3px] shadow-sm shrink-0 overflow-hidden ${className}`}
        >
          <rect width="60" height="13.33" fill="#AE1C28" />
          <rect y="13.33" width="60" height="13.33" fill="#FFFFFF" />
          <rect y="26.66" width="60" height="13.34" fill="#21468B" />
        </svg>
      );

    case "ca":
      // Canada Flag (Red, White, Red with stylized leaf)
      return (
        <svg
          width={width}
          height={height}
          viewBox="0 0 60 40"
          className={`inline-block rounded-[3px] shadow-sm shrink-0 overflow-hidden ${className}`}
        >
          <rect width="15" height="40" fill="#FF0000" />
          <rect x="15" width="30" height="40" fill="#FFFFFF" />
          <rect x="45" width="15" height="40" fill="#FF0000" />
          <path
            d="M30 11 L32 17 L38 16 L35 21 L38 24 L32 24 L31 29 L29 29 L28 24 L22 24 L25 21 L22 16 L28 17 Z"
            fill="#FF0000"
          />
        </svg>
      );

    case "au":
      // Australia Flag
      return (
        <svg
          width={width}
          height={height}
          viewBox="0 0 60 40"
          className={`inline-block rounded-[3px] shadow-sm shrink-0 overflow-hidden ${className}`}
        >
          <rect width="60" height="40" fill="#00008B" />
          <rect width="25" height="18" fill="#012169" />
          <path d="M0 0 L25 18 M25 0 L0 18" stroke="#ffffff" strokeWidth="2.5" />
          <path d="M0 0 L25 18 M25 0 L0 18" stroke="#C8102E" strokeWidth="1.2" />
          <path d="M12.5 0 v18 M0 9 h25" stroke="#ffffff" strokeWidth="4" />
          <path d="M12.5 0 v18 M0 9 h25" stroke="#C8102E" strokeWidth="2" />
          {/* Southern cross stars */}
          <circle cx="45" cy="8" r="1.5" fill="#ffffff" />
          <circle cx="50" cy="15" r="1.5" fill="#ffffff" />
          <circle cx="45" cy="24" r="1.5" fill="#ffffff" />
          <circle cx="40" cy="18" r="1.5" fill="#ffffff" />
          <circle cx="12.5" cy="29" r="2.5" fill="#ffffff" />
        </svg>
      );

    case "sg":
      // Singapore Flag
      return (
        <svg
          width={width}
          height={height}
          viewBox="0 0 60 40"
          className={`inline-block rounded-[3px] shadow-sm shrink-0 overflow-hidden ${className}`}
        >
          <rect width="60" height="20" fill="#ED2939" />
          <rect y="20" width="60" height="20" fill="#FFFFFF" />
          <circle cx="10" cy="10" r="5" fill="#FFFFFF" />
          <circle cx="11.5" cy="10" r="4.2" fill="#ED2939" />
        </svg>
      );

    default:
      return (
        <span className="w-5 h-3.5 bg-neutral-700 rounded-[2px] inline-flex items-center justify-center text-[9px] font-bold text-neutral-300">
          {norm.slice(0, 2).toUpperCase()}
        </span>
      );
  }
}
