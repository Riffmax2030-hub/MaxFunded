'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Zap, ChevronRight, Copy, Check, Sparkles, X } from 'lucide-react';
import toast from 'react-hot-toast';

export default function StickyBottomBar() {
  const [isVisible, setIsVisible] = useState(false);
  const [copied, setCopied] = useState(false);
  const [closed, setClosed] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Appear once scrolled 300px
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleCopyCode = () => {
    navigator.clipboard.writeText('MAX45');
    setCopied(true);
    toast.success('Promo code MAX45 copied to clipboard!');
    setTimeout(() => setCopied(false), 2500);
  };

  if (closed || !isVisible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-40 max-w-4xl mx-auto animate-fade-in-up">
      <div className="bg-[#0e1117]/95 border border-[#ccff00]/40 rounded-2xl px-4 py-3 sm:px-6 sm:py-3.5 shadow-[0_10px_40px_rgba(0,0,0,0.8)] backdrop-blur-xl flex items-center justify-between gap-4">
        {/* Left Side: Live Ticker & Coupon */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="hidden sm:flex w-9 h-9 rounded-xl bg-[#ccff00]/10 border border-[#ccff00]/30 items-center justify-center text-[#ccff00] shrink-0">
            <Zap className="w-5 h-5 fill-[#ccff00]" />
          </div>

          <div className="truncate">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              <span className="text-xs sm:text-sm font-black text-white truncate">
                Limited Launch Promotion: <span className="text-[#ccff00]">45% OFF All Evaluation Tiers</span>
              </span>
            </div>

            <div className="flex items-center gap-2 mt-0.5 text-[11px] text-neutral-400">
              <span>Use discount coupon:</span>
              <button
                onClick={handleCopyCode}
                className="inline-flex items-center gap-1 font-mono font-bold text-white bg-white/10 hover:bg-white/15 px-2 py-0.5 rounded-md border border-white/10 transition"
              >
                <span>MAX45</span>
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-neutral-400" />}
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: CTA Button + Dismiss */}
        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/challenges"
            className="px-4 py-2 sm:px-6 sm:py-2.5 rounded-xl bg-[#ccff00] hover:bg-[#b8e600] text-black font-black text-xs sm:text-sm uppercase tracking-tight shadow-neon transition flex items-center gap-1.5 transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>Get Funded</span>
            <ChevronRight className="w-4 h-4 stroke-[3]" />
          </Link>

          <button
            onClick={() => setClosed(true)}
            className="text-neutral-500 hover:text-white p-1 rounded-lg transition"
            title="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
