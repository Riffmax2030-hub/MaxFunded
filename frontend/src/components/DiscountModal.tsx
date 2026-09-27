"use client";

import React, { useState } from "react";
import { X, CheckCircle, Sparkles } from "lucide-react";
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-[#111418] border border-white/10 rounded-3xl p-8 shadow-2xl text-center overflow-hidden">
        {/* Decorative Neon Glow Backdrop */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-[#ccff00]/15 blur-3xl pointer-events-none rounded-full" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-[#ccff00]/10 blur-3xl pointer-events-none rounded-full" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-neutral-400 hover:text-white p-1 rounded-full hover:bg-white/10 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand */}
        <div className="flex justify-center mb-6">
          <Logo size="md" />
        </div>

        {!submitted ? (
          <>
            <h3 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white mb-2">
              SUBMIT EMAIL <br />
              <span className="text-[#ccff00]">Get 50% Discount</span>
            </h3>

            <p className="text-xs sm:text-sm text-neutral-400 mb-6 max-w-xs mx-auto">
              Submit your email to get your discount, exclusive trading tips & special evaluation offers.
            </p>

            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full px-4 py-3.5 rounded-xl bg-[#08090b] border border-white/10 text-white placeholder-neutral-500 text-sm focus:outline-none focus:border-[#ccff00] transition"
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
          <div className="py-6 space-y-4">
            <div className="w-16 h-16 bg-[#ccff00]/20 rounded-full flex items-center justify-center mx-auto text-[#ccff00]">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h4 className="text-xl font-bold text-white">Coupon Activated!</h4>
            <div className="p-3 bg-[#08090b] border border-dashed border-[#ccff00]/40 rounded-xl">
              <span className="font-mono text-lg font-black text-[#ccff00] tracking-widest">
                MAX50OFF
              </span>
            </div>
            <p className="text-xs text-neutral-400">
              Use code <strong className="text-white">MAX50OFF</strong> at checkout for 50% off any evaluation challenge.
            </p>
            <button
              onClick={onClose}
              className="mt-4 px-6 py-2.5 rounded-full bg-white text-black font-bold text-xs"
            >
              Continue to Challenges
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
