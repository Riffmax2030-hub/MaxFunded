"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ShieldCheck, X } from "lucide-react";

export default function CookieConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Check if consent has already been saved in localStorage
    const consent = localStorage.getItem("maxfunded_cookie_consent");
    if (!consent) {
      // Delay display slightly for smooth page load experience
      const timer = setTimeout(() => {
        setVisible(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem("maxfunded_cookie_consent", "all");
    setVisible(false);
  };

  const handleEssentialOnly = () => {
    localStorage.setItem("maxfunded_cookie_consent", "essential");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-5 left-4 sm:left-6 z-[99998] max-w-md w-[calc(100%-2rem)] sm:w-auto animate-fade-up">
      <div className="bento-card p-5 sm:p-6 shadow-[0_15px_40px_rgba(0,0,0,0.8)] border border-white/[0.12] bg-[#0c0e14]/95 backdrop-blur-xl relative overflow-hidden">
        {/* Subtle Neon Top Edge Accent */}
        <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#ccff00] to-transparent" />

        <div className="flex items-start justify-between gap-3 mb-2.5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#ccff00]/10 border border-[#ccff00]/25 flex items-center justify-center text-[#ccff00]">
              <ShieldCheck size={16} />
            </div>
            <h4 className="text-sm font-black text-white uppercase tracking-wider">Cookie &amp; Security Privacy</h4>
          </div>
          <button
            onClick={handleEssentialOnly}
            className="text-neutral-500 hover:text-white transition p-1"
            aria-label="Dismiss cookie notice"
          >
            <X size={15} />
          </button>
        </div>

        <p className="text-xs text-neutral-400 leading-relaxed mb-4">
          We utilize essential session cookies and telemetry tokens to ensure MT5 credential security, live websocket metrics, and regulatory compliance. Read our{" "}
          <Link href="/privacy" className="text-[#ccff00] underline hover:text-[#b3e600] transition">
            Privacy Policy
          </Link>
          .
        </p>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleAcceptAll}
            className="btn-neon flex-1 py-2.5 px-4 bg-[#ccff00] hover:bg-[#b3e600] text-black font-black text-xs uppercase tracking-tight rounded-xl shadow-neon transition text-center"
          >
            Accept All
          </button>
          <button
            onClick={handleEssentialOnly}
            className="py-2.5 px-4 bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] text-neutral-300 hover:text-white font-bold text-xs rounded-xl transition text-center"
          >
            Essential Only
          </button>
        </div>
      </div>
    </div>
  );
}
