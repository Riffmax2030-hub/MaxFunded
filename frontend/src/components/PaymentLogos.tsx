import React from "react";

export function VisaLogo({ className = "h-5 w-auto" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M19.1 1.2L13.1 15H9.2L5.8 4.3C5.6 3.5 5.4 3.2 4.7 2.8C3.6 2.2 1.7 1.7 0 1.3L0.1 0.8H7.3C8.2 0.8 9 1.4 9.2 2.4L11 11.5L15.3 0.8H19.1V1.2ZM35.9 10.3C35.9 6.4 30.5 6.2 30.5 4.4C30.5 3.8 31.1 3.2 32.3 3C32.9 2.9 34.6 2.8 36.4 3.7L37.1 0.4C36.1 0.1 34.8 0 33.2 0C29.2 0 26.4 2.1 26.4 5.2C26.4 9.7 32.7 9.9 32.7 11.9C32.7 12.6 32 13.2 30.7 13.4C29.4 13.5 27.2 13.3 25.4 12.2L24.7 15.6C26.3 16.3 28.5 16.6 30.7 16.6C34.9 16.6 35.9 13.5 35.9 10.3ZM46.6 15H50L47.4 0.8H44.3C43.5 0.8 42.9 1.3 42.6 2L36.4 15H40.4L41.2 12.8H46.1L46.6 15ZM42.3 9.7L44.4 3.9L45.6 9.7H42.3ZM25.2 0.8L22.1 15H18.3L21.4 0.8H25.2Z" fill="#2563EB" />
    </svg>
  );
}

export function MastercardLogo({ className = "h-5 w-auto" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 36 22" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="11" r="10" fill="#EB001B" />
      <circle cx="24" cy="11" r="10" fill="#F79E1B" fillOpacity="0.9" />
      <path d="M18 4.2C19.9 5.8 21.1 8.3 21.1 11C21.1 13.7 19.9 16.2 18 17.8C16.1 16.2 14.9 13.7 14.9 11C14.9 8.3 16.1 5.8 18 4.2Z" fill="#FF5F00" />
    </svg>
  );
}

export function DiscoverLogo({ className = "h-5 w-auto" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 72 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M0 0.5H5.8C8.5 0.5 10.4 2.2 10.4 5.3C10.4 8.4 8.5 10.1 5.8 10.1H2.4V15H0V0.5ZM2.4 8H5.6C7.1 8 8 7 8 5.3C8 3.6 7.1 2.6 5.6 2.6H2.4V8Z" fill="#FF6000" />
      <circle cx="27" cy="8" r="7.5" fill="#FF6000" />
      <text x="37" y="12" fill="#FFFFFF" fontSize="11" fontWeight="bold" fontFamily="sans-serif">DISCOVER</text>
    </svg>
  );
}

export function AmexLogo({ className = "h-5 w-auto" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 40 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="40" height="16" rx="3" fill="#006FCF" />
      <text x="4" y="11.5" fill="#FFFFFF" fontSize="8" fontWeight="900" fontFamily="sans-serif">AMEX</text>
    </svg>
  );
}

export function PaypalLogo({ className = "h-5 w-auto" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 68 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M6.3 0.5H1.4C1 0.5 0.7 0.8 0.6 1.2L0 17.3H3.6L4.5 11.6H6.1C10.2 11.6 12.6 9.6 13.2 5.6C13.5 3.7 13 2.2 11.8 1.4C10.5 0.8 8.6 0.5 6.3 0.5ZM7.1 5.6C6.8 7.5 5.3 7.5 4 7.5L3.3 11.6H2.1L3.3 3.6C3.4 3.4 3.6 3.3 3.8 3.3H5.8C7.1 3.3 8 3.5 8.3 4.2C8.5 4.6 8.4 5.2 7.1 5.6Z" fill="#003087" />
      <path d="M10.8 5.6C10.5 7.5 9 7.5 7.7 7.5L7 11.6H5.8L7 3.6C7.1 3.4 7.3 3.3 7.5 3.3H9.5C10.8 3.3 11.7 3.5 12 4.2C12.2 4.6 12.1 5.2 10.8 5.6Z" fill="#0079C1" fillOpacity="0.8" />
      <text x="16" y="13.5" fill="#FFFFFF" fontSize="13" fontWeight="900" fontFamily="sans-serif">PayPal</text>
    </svg>
  );
}
