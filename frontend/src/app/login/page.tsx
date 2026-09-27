"use client";

import React, { useState } from "react";
import Link from "next/link";
import Logo from "@/components/Logo";
import { saveSession } from "@/lib/auth";
import { Headphones, Trophy, ChevronRight, Loader2, ChevronDown, CheckCircle2, ShieldCheck } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
      const res = await fetch(`${apiUrl}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: "Invalid credentials" }));
        throw new Error(err.detail || "Authentication failed");
      }

      const data = await res.json();
      saveSession(data.access_token, {
        id: data.user_id,
        email: data.email,
        role: data.role,
        is_admin: data.is_admin,
      });

      if (data.is_admin) {
        window.location.href = "/admin/challenges";
      } else {
        window.location.href = "/dashboard";
      }
    } catch (err: any) {
      setError(err.message || "Failed to sign in");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#08090b] bg-grid-pattern text-white flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-[#ccff00]/[0.03] blur-3xl pointer-events-none rounded-full" />

      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
        {/* ========================================================================= */}
        {/* LEFT: PIVEX-STYLE LOGIN CARD (Screenshot 1) */}
        {/* ========================================================================= */}
        <div className="lg:col-span-5 bg-[#111418]/90 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl relative">
          <div className="flex items-center justify-between mb-8">
            <Link href="/">
              <Logo size="md" />
            </Link>
            <div className="flex items-center gap-1.5 text-xs text-neutral-300 font-semibold px-2.5 py-1 rounded-lg bg-white/5 border border-white/5">
              <span>🇬🇧</span>
              <span>English</span>
              <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
            </div>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-1">
            Login to MaxFunded
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400 mb-6">
            Enter your email to continue to your trading dashboard
          </p>

          {error && (
            <div className="mb-5 p-3 rounded-xl bg-red-950/50 border border-red-500/30 text-red-300 text-xs text-center font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-neutral-300 mb-1.5">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full px-4 py-3.5 rounded-xl bg-[#08090b] border border-white/10 text-white placeholder-neutral-500 text-sm focus:outline-none focus:border-[#ccff00] focus:ring-1 focus:ring-[#ccff00] transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-300 mb-1.5">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full px-4 py-3.5 rounded-xl bg-[#08090b] border border-white/10 text-white placeholder-neutral-500 text-sm focus:outline-none focus:border-[#ccff00] focus:ring-1 focus:ring-[#ccff00] transition"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-xl bg-[#ccff00] hover:bg-[#b3e600] text-black font-black text-sm uppercase tracking-tight shadow-neon transition flex items-center justify-center gap-2 disabled:opacity-50 transform hover:scale-[1.01] active:scale-[0.99]"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-black" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Login</span>
                  <ChevronRight className="w-4 h-4 stroke-[3]" />
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-neutral-400">
            Don&apos;t have an account yet?{" "}
            <Link href="/register" className="text-[#ccff00] font-bold hover:underline">
              Create an account
            </Link>
          </p>
        </div>

        {/* ========================================================================= */}
        {/* RIGHT: BENTO SHOWCASE (Screenshot 1) */}
        {/* ========================================================================= */}
        <div className="lg:col-span-7 space-y-4">
          {/* Top Bento: Earn Real Rewards + Certificate with Laurel Wreath */}
          <div className="bg-[#12151c]/90 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-7 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
            <div className="sm:max-w-xs">
              <h3 className="text-xl sm:text-2xl font-black text-white mb-2">Earn Real Rewards</h3>
              <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
                Trade risk-free and earn up to 80% of your performance rewards within clear rules
              </p>
            </div>

            {/* Certificate Preview Card */}
            <div className="w-full sm:w-auto shrink-0 bg-[#08090b] border border-white/10 rounded-2xl p-4 sm:p-5 text-center min-w-[210px] shadow-lg">
              <div className="text-[9px] uppercase tracking-widest text-neutral-400 font-mono">Present to</div>
              <div className="text-base font-black text-white mt-0.5">Alex Smith</div>

              {/* Laurel Wreath */}
              <div className="relative py-2 flex items-center justify-center">
                <svg className="w-6 h-10 text-[#ccff00] mr-1.5 opacity-90" viewBox="0 0 32 48" fill="currentColor">
                  <path d="M16 4C14 10 10 14 6 18C10 18 14 16 16 12C18 16 22 18 26 18C22 14 18 10 16 4Z" />
                  <path d="M14 18C11 24 7 28 3 32C7 32 11 30 13 26C15 30 19 32 23 32C19 28 15 24 14 18Z" />
                </svg>

                <div>
                  <div className="text-[8px] uppercase tracking-wider text-neutral-400">Your Reward</div>
                  <div className="text-2xl font-black text-[#ccff00] leading-none mt-0.5">$24,580</div>
                </div>

                <svg className="w-6 h-10 text-[#ccff00] ml-1.5 opacity-90 scale-x-[-1]" viewBox="0 0 32 48" fill="currentColor">
                  <path d="M16 4C14 10 10 14 6 18C10 18 14 16 16 12C18 16 22 18 26 18C22 14 18 10 16 4Z" />
                  <path d="M14 18C11 24 7 28 3 32C7 32 11 30 13 26C15 30 19 32 23 32C19 28 15 24 14 18Z" />
                </svg>
              </div>

              <div className="text-[9px] text-emerald-400 font-bold uppercase tracking-wider">
                ✓ Payout Confirmed
              </div>
            </div>
          </div>

          {/* Middle Row: 24/7 Support + Trusted Worldwide */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* 24/7 Customer Support with Ripple Rings */}
            <div className="bg-[#12151c]/90 backdrop-blur-xl border border-white/10 rounded-3xl p-6 flex flex-col justify-between shadow-xl">
              {/* Concentric Sonic Rings */}
              <div className="relative w-14 h-14 mb-4 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full bg-[#ccff00]/10 animate-ping opacity-75" />
                <div className="absolute inset-1.5 rounded-full border border-[#ccff00]/30" />
                <div className="w-10 h-10 rounded-full bg-[#ccff00]/20 flex items-center justify-center text-[#ccff00] z-10 shadow-neon-sm">
                  <Headphones className="w-5 h-5" />
                </div>
              </div>

              <div>
                <h4 className="text-base font-black text-white mb-1">24/7 Customer Support</h4>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Get help anytime, our team is always available to assist you
                </p>
              </div>
            </div>

            {/* Trusted Worldwide with Country Pin Markers */}
            <div className="bg-[#12151c]/90 backdrop-blur-xl border border-white/10 rounded-3xl p-6 flex flex-col justify-between shadow-xl">
              <div className="flex items-center gap-1.5 mb-4 text-xs font-bold text-[#ccff00]">
                <span className="p-1 rounded bg-white/5">🇨🇦</span>
                <span className="p-1 rounded bg-white/5">🇺🇸</span>
                <span className="p-1 rounded bg-white/5">🇬🇧</span>
                <span className="p-1 rounded bg-white/5">🇩🇪</span>
                <span className="p-1 rounded bg-white/5">🇦🇪</span>
                <span className="p-1 rounded bg-white/5">🇸🇬</span>
              </div>
              <div>
                <h4 className="text-base font-black text-white mb-1">Trusted Worldwide</h4>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  170+ countries and a 4.8★ rating from traders around the world
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Bento: Scale Up to $1M */}
          <div className="bg-[#12151c]/90 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-7 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
            <div>
              <h3 className="text-xl sm:text-2xl font-black text-white mb-1.5">Scale Up to $1M</h3>
              <p className="text-xs text-neutral-400 max-w-sm leading-relaxed">
                Hit 15% profit, scale by 30% each quarter, and grow your account to $1,000,000
              </p>
            </div>

            <div className="w-full sm:w-56 flex items-end justify-between gap-2 h-20 bg-[#08090b] border border-white/5 rounded-2xl p-3 shrink-0">
              <div className="w-1/5 bg-neutral-800 rounded-t h-1/4 flex items-center justify-center text-[8px] text-neutral-400 font-bold">$100K</div>
              <div className="w-1/5 bg-neutral-700 rounded-t h-2/5 flex items-center justify-center text-[8px] text-neutral-400 font-bold">$200K</div>
              <div className="w-1/5 bg-neutral-600 rounded-t h-3/5 flex items-center justify-center text-[8px] text-neutral-300 font-bold">$300K</div>
              <div className="w-1/5 bg-neutral-500 rounded-t h-4/5 flex items-center justify-center text-[8px] text-neutral-200 font-bold">$750K</div>
              <div className="w-1/5 bg-[#ccff00] rounded-t h-full flex flex-col items-center justify-center text-[9px] text-black font-black shadow-neon-sm">
                <Trophy className="w-3 h-3 text-black" />
                $1M
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
