import React from "react";

// ─── 1. Visa Official Vector Logo ───────────────────────────────────────────
export function VisaLogo({ className = "h-4 w-auto" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 64 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M25.3 1.2L17.2 19.8H12L7.5 5.5C7.2 4.4 6.9 4.0 6.0 3.5C4.5 2.7 2.1 2.0 0 1.5L0.1 0.8H9.7C11.0 0.8 12.1 1.7 12.4 3.0L14.7 14.8L20.4 0.8H25.3V1.2ZM47.6 13.5C47.6 8.3 40.5 8.0 40.5 5.7C40.5 4.9 41.3 4.1 42.9 3.9C43.7 3.8 46.0 3.7 48.4 4.8L49.3 0.6C48.0 0.2 46.3 0 44.1 0C38.8 0 35.1 2.8 35.1 6.8C35.1 12.7 43.4 13.0 43.4 15.6C43.4 16.5 42.5 17.3 40.8 17.5C39.1 17.7 36.2 17.4 33.8 16.0L32.9 20.4C35.0 21.3 37.9 21.7 40.8 21.7C46.4 21.7 47.6 17.7 47.6 13.5ZM61.8 19.8H66.3L62.8 1.2H58.7C57.6 1.2 56.8 1.9 56.4 2.8L48.2 19.8H53.5L54.6 16.9H61.1L61.8 19.8ZM56.0 12.8L58.8 5.2L60.4 12.8H56.0ZM33.5 1.2L29.4 19.8H24.3L28.4 1.2H33.5Z"
        fill="#FFFFFF"
      />
      <path
        d="M25.3 1.2L17.2 19.8H12L7.5 5.5C7.2 4.4 6.9 4.0 6.0 3.5C4.5 2.7 2.1 2.0 0 1.5L0.1 0.8H9.7C11.0 0.8 12.1 1.7 12.4 3.0L14.7 14.8L20.4 0.8H25.3V1.2Z"
        fill="#1434CB"
      />
      <path
        d="M12.4 3.0L14.7 14.8L20.4 0.8H25.3L17.2 19.8H12L7.5 5.5"
        fill="#1434CB"
      />
    </svg>
  );
}

// ─── 2. Mastercard Official Dual-Disc Logo ──────────────────────────────────
export function MastercardLogo({ className = "h-5 w-auto" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 36 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="36" height="24" rx="3" fill="#0A0C10" />
      <circle cx="13" cy="12" r="8" fill="#EB001B" />
      <circle cx="23" cy="12" r="8" fill="#F79E1B" fillOpacity="0.9" />
      <path
        d="M18 6.5C19.8 7.9 21 10.1 21 12C21 13.9 19.8 16.1 18 17.5C16.2 16.1 15 13.9 15 12C15 10.1 16.2 7.9 18 6.5Z"
        fill="#FF5F00"
      />
    </svg>
  );
}

// ─── 3. Walmart Official Spark Logo ─────────────────────────────────────────
export function WalmartLogo({ className = "h-5 w-auto" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 88 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Walmart Yellow Spark */}
      <g transform="translate(4, 2)">
        {/* 6 Radiating Spark Petals */}
        <rect x="9" y="0" width="2" height="6" rx="1" fill="#FFC220" />
        <rect x="9" y="14" width="2" height="6" rx="1" fill="#FFC220" />
        <rect x="14" y="3" width="2" height="6" rx="1" transform="rotate(60 14 3)" fill="#FFC220" />
        <rect x="4" y="15" width="2" height="6" rx="1" transform="rotate(60 4 15)" fill="#FFC220" />
        <rect x="16" y="13" width="2" height="6" rx="1" transform="rotate(120 16 13)" fill="#FFC220" />
        <rect x="6" y="5" width="2" height="6" rx="1" transform="rotate(120 6 5)" fill="#FFC220" />
      </g>
      {/* Walmart Clean Bold Typography */}
      <text
        x="28"
        y="17"
        fill="#FFFFFF"
        fontSize="14"
        fontWeight="800"
        fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
        letterSpacing="-0.02em"
      >
        Walmart<tspan fill="#FFC220">*</tspan>
      </text>
    </svg>
  );
}

// ─── 4. Discover Official Logo ──────────────────────────────────────────────
export function DiscoverLogo({ className = "h-4 w-auto" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 88 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <text
        x="0"
        y="14"
        fill="#FFFFFF"
        fontSize="13"
        fontWeight="900"
        fontFamily="Arial, Helvetica, sans-serif"
        letterSpacing="0.05em"
      >
        DISC
      </text>
      {/* Solid Vibrant Orange Sun O */}
      <circle cx="49" cy="10" r="7" fill="#FF6000" />
      <text
        x="58"
        y="14"
        fill="#FFFFFF"
        fontSize="13"
        fontWeight="900"
        fontFamily="Arial, Helvetica, sans-serif"
        letterSpacing="0.05em"
      >
        VER
      </text>
    </svg>
  );
}

// ─── 5. Bitcoin (BTC) Official Emblem ────────────────────────────────────────
export function BitcoinLogo({ className = "h-5 w-auto" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="12" fill="#F7931A" />
      <path
        d="M16.6 9.8C16.8 8.4 15.9 7.6 14.5 7.2L14.9 5.6L13.9 5.3L13.5 6.9C13.2 6.8 13.0 6.8 12.7 6.7L13.1 5.1L12.1 4.9L11.7 6.5C11.5 6.5 11.2 6.4 11.0 6.3L11.0 6.3L9.6 5.9L9.3 7.1C9.3 7.1 10.1 7.3 10.0 7.3C10.5 7.4 10.6 7.7 10.5 8.0L9.9 10.4C10.0 10.4 10.1 10.5 10.2 10.5L10.0 10.5L9.2 13.7C9.1 14.0 8.9 14.2 8.5 14.1C8.5 14.1 7.8 13.9 7.8 13.9L7.2 15.2L8.5 15.6C8.8 15.6 9.0 15.7 9.3 15.8L8.9 17.4L9.9 17.7L10.3 16.1C10.6 16.2 10.8 16.2 11.1 16.3L10.7 17.9L11.7 18.1L12.1 16.5C13.8 16.8 15.1 16.6 15.7 15.2C16.2 14.1 15.8 13.4 14.9 13.0C15.5 12.6 16.0 11.8 16.6 9.8ZM13.8 14.2C13.4 15.8 10.8 15.0 9.9 14.8L10.6 12.0C11.5 12.2 14.2 12.7 13.8 14.2ZM14.3 10.1C13.9 11.5 11.7 10.8 11.0 10.6L11.6 8.1C12.3 8.3 14.7 8.7 14.3 10.1Z"
        fill="#FFFFFF"
      />
    </svg>
  );
}

// ─── 6. Ethereum (ETH) Official Emblem ───────────────────────────────────────
export function EthereumLogo({ className = "h-5 w-auto" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="12" fill="#627EEA" />
      <path d="M12 3.5L11.8 4.2V14.5L12 14.7L16.4 12.1L12 3.5Z" fill="#FFFFFF" fillOpacity="0.75" />
      <path d="M12 3.5L7.5 12.1L12 14.7V3.5Z" fill="#FFFFFF" />
      <path d="M12 15.6L11.9 15.7V19.7L12 20L16.4 13.9L12 15.6Z" fill="#FFFFFF" fillOpacity="0.75" />
      <path d="M12 20V15.6L7.5 13.9L12 20Z" fill="#FFFFFF" />
      <path d="M12 14.7L16.4 12.1L12 10.1V14.7Z" fill="#FFFFFF" fillOpacity="0.35" />
      <path d="M7.5 12.1L12 14.7V10.1L7.5 12.1Z" fill="#FFFFFF" fillOpacity="0.5" />
    </svg>
  );
}

// ─── 7. Tether (USDT) Official Emblem ───────────────────────────────────────
export function TetherLogo({ className = "h-5 w-auto" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="12" fill="#26A17B" />
      <path
        d="M13.2 11.5V9.9H16.8V7.5H7.2V9.9H10.8V11.5C7.9 11.7 5.7 12.3 5.7 13.0C5.7 13.8 8.1 14.4 11.2 14.5V18H12.8V14.5C15.9 14.4 18.3 13.8 18.3 13.0C18.3 12.3 16.1 11.7 13.2 11.5ZM12 13.7C9.3 13.7 7.4 13.2 7.4 12.8C7.4 12.4 9.3 11.9 12 11.9C14.7 11.9 16.6 12.4 16.6 12.8C16.6 13.2 14.7 13.7 12 13.7Z"
        fill="#FFFFFF"
      />
    </svg>
  );
}

// ─── 8. PayPal Official Vector Logo ─────────────────────────────────────────
export function PaypalLogo({ className = "h-5 w-auto" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 80 22" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g transform="translate(0, 1)">
        {/* Dark Blue P */}
        <path
          d="M8.2 0.5H1.8C1.3 0.5 0.9 0.9 0.8 1.4L0 19.5H4.6L5.7 12.3H7.8C13.0 12.3 16.1 9.7 16.9 4.6C17.2 2.2 16.6 0.5 14.0 0.5H8.2Z"
          fill="#003087"
        />
        {/* Light Blue P Overlay */}
        <path
          d="M13.8 6.5C13.4 8.9 11.5 8.9 9.8 8.9L8.9 14.1H6.4L7.8 4.6C7.9 4.3 8.2 4.1 8.5 4.1H11.0C12.7 4.1 13.8 4.4 14.2 5.3C14.5 5.8 14.4 6.6 13.8 6.5Z"
          fill="#0079C1"
        />
      </g>
      <text
        x="22"
        y="16"
        fill="#FFFFFF"
        fontSize="15"
        fontWeight="900"
        fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
        letterSpacing="-0.03em"
      >
        PayPal
      </text>
    </svg>
  );
}

// ─── 9. Bank Wire / SWIFT / SEPA Institutional Logo ──────────────────────────
export function BankWireLogo({ className = "h-5 w-auto" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="12" fill="#1E293B" />
      {/* Classical Institutional Bank Portico */}
      <path d="M12 5L4 9H20L12 5Z" fill="#ccff00" />
      <rect x="5.5" y="10.5" width="2" height="6" rx="0.5" fill="#FFFFFF" />
      <rect x="9.5" y="10.5" width="2" height="6" rx="0.5" fill="#FFFFFF" />
      <rect x="13.5" y="10.5" width="2" height="6" rx="0.5" fill="#FFFFFF" />
      <rect x="17.5" y="10.5" width="2" height="6" rx="0.5" fill="#FFFFFF" />
      <rect x="3" y="17" width="18" height="2" rx="0.5" fill="#ccff00" />
    </svg>
  );
}
