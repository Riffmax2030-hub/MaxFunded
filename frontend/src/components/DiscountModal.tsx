"use client";

import React, { useState } from "react";
import { X, CheckCircle } from "lucide-react";
import Logo from "@/components/Logo";

export default function DiscountModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-fade-in transition-all">
      <div className="relative w-full max-w-md bg-[#131720]/95 border border-white/10 rounded-3xl p-8 sm:p-10 shadow-[0_20px_60px_rgba(0,0,0,0.9)] text-center overflow-hidden">
        
        {/* Subtle Decorative Floating Coins (matching Pivex style) */}
        <div className="absolute top-4 left-6 w-10 h-10 rounded-full bg-white/[0.04] border border-white/10 flex items-center justify-center text-xs font-mono font-bold text-white/30 rotate-12 pointer-events-none select-none">
          $
        </div>
        <div className="absolute top-16 right-8 w-12 h-12 rounded-full bg-white/[0.04] border border-white/10 flex items-center justify-center text-sm font-mono font-bold text-white/30 -rotate-12 pointer-events-none select-none">
          $
        </div>
        <div className="absolute bottom-16 left-8 w-14 h-14 rounded-full bg-white/[0.04] border border-white/10 flex items-center justify-center text-base font-mono font-bold text-white/30 -rotate-6 pointer-events-none select-none">
          $
        </div>
        <div className="absolute bottom-6 right-6 w-9 h-9 rounded-full bg-white/[0.04] border border-white/10 flex items-center justify-center text-xs font-mono font-bold text-white/30 rotate-45 pointer-events-none select-none">
          $
        </div>

        {/* Ambient Neon Radial Behind Card */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#ccff00]/[0.08] blur-3xl pointer-events-none rounded-full -z-10" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-neutral-400 hover:text-white p-1 rounded-full hover:bg-white/10 transition z-20"
          aria-label="Close discount modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Logo */}
        <div className="flex justify-center mb-6">
          <Logo size="md" />
        </div>

        {!submitted ? (
          <>
            <h3 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white mb-2 leading-tight">
              SUBMIT EMAIL <br />
              <span className="text-[#ccff00]">Get 45% Discount</span>
            </h3>

            <p className="text-xs sm:text-sm text-neutral-400 mb-6 max-w-xs mx-auto leading-relaxed">
              Submit your email to get your discount, trading tips &amp; exclusive offers.
            </p>

            <form onSubmit={handleSubmit} className="space-y-3.5 relative z-10">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full px-4 py-3.5 rounded-xl bg-[#0b0e14] border border-white/15 text-white placeholder-neutral-500 text-sm focus:outline-none focus:border-[#ccff00] transition"
              />

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-[#ccff00] hover:bg-[#b3e600] text-black font-black text-sm uppercase tracking-tight transition shadow-neon"
              >
                Get My Offer
              </button>
            </form>

            <p className="text-[11px] text-neutral-500 mt-4">
              Instant coupon code dispatched to your inbox. No spam ever.
            </p>
          </>
        ) : (
          <div className="py-6 space-y-4 relative z-10">
            <div className="w-16 h-16 bg-[#ccff00]/20 rounded-full flex items-center justify-center mx-auto text-[#ccff00]">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h4 className="text-xl font-bold text-white">Coupon Activated!</h4>
            <div className="p-3 bg-[#08090b] border border-dashed border-[#ccff00]/40 rounded-xl">
              <span className="font-mono text-lg font-black text-[#ccff00] tracking-widest">
                MAX45
              </span>
            </div>
            <p className="text-xs text-neutral-400">
              Use code <strong className="text-white">MAX45</strong> at checkout for 45% off any evaluation challenge.
            </p>
            <button
              onClick={onClose}
              className="mt-4 px-6 py-2.5 rounded-full bg-[#ccff00] hover:bg-[#b3e600] text-black font-extrabold text-xs uppercase tracking-tight transition shadow-neon"
            >
              Continue to Challenges
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
