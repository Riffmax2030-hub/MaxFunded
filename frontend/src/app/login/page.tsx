"use client";

import React, { useState } from "react";
import Link from "next/link";
import Logo from "@/components/Logo";
import { saveSession } from "@/lib/auth";
import { Headphones, Trophy, ChevronRight, Loader2, Star, ChevronDown } from "lucide-react";

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
    <div className="min-h-screen bg-[#08090b] text-white flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* ========================================================================= */}
        {/* LEFT: PIVEX-STYLE LOGIN CARD (Screenshot 1) */}
        {/* ========================================================================= */}
        <div className="lg:col-span-5 bg-[#111418] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl relative">
          <div className="flex items-center justify-between mb-8">
            <Link href="/">
              <Logo size="md" />
            </Link>
            <div className="flex items-center gap-1 text-xs text-neutral-400 font-semibold px-2 py-1 rounded-lg bg-white/5">
              <span>🇬🇧</span>
              <span>English</span>
              <ChevronDown className="w-3 h-3 text-neutral-500" />
            </div>
          </div>

          <h2 className="text-2xl font-black text-white tracking-tight mb-1">
            Login to MaxFunded
          </h2>
          <p className="text-xs text-neutral-400 mb-6">
            Enter your credentials to continue to your trading portal
          </p>

          {error && (
            <div className="mb-5 p-3 rounded-xl bg-red-950/40 border border-red-500/30 text-red-300 text-xs text-center font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-neutral-400 mb-1.5">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full px-4 py-3 rounded-xl bg-[#08090b] border border-white/10 text-white placeholder-neutral-500 text-sm focus:outline-none focus:border-[#ccff00] transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-400 mb-1.5">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full px-4 py-3 rounded-xl bg-[#08090b] border border-white/10 text-white placeholder-neutral-500 text-sm focus:outline-none focus:border-[#ccff00] transition"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-[#ccff00] hover:bg-[#b3e600] text-black font-black text-sm uppercase tracking-tight shadow-neon transition flex items-center justify-center gap-2 disabled:opacity-50"
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
          {/* Top Bento: Earn Real Rewards + Certificate */}
          <div className="bg-[#12151c] border border-white/10 rounded-3xl p-6 sm:p-7 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="sm:max-w-xs">
              <h3 className="text-xl font-black text-white mb-2">Earn Real Rewards</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Trade risk-free and earn up to 80% of your performance rewards within clear rules
              </p>
            </div>

            <div className="w-full sm:w-auto shrink-0 bg-[#08090b] border border-white/5 rounded-2xl p-4 text-center">
              <div className="text-[9px] uppercase tracking-widest text-neutral-400">Present to</div>
              <div className="text-sm font-bold text-white">Alex Smith</div>
              <div className="text-[10px] text-neutral-400 mt-2">Your Reward</div>
              <div className="text-2xl font-black text-[#ccff00]">$24,580</div>
              <div className="text-[9px] text-[#ccff00] font-bold mt-1">★ Verified Payout ★</div>
            </div>
          </div>

          {/* Middle Row: 24/7 Support + Trusted Worldwide */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* 24/7 Customer Support */}
            <div className="bg-[#12151c] border border-white/10 rounded-3xl p-6 flex flex-col justify-between">
              <div className="w-12 h-12 rounded-full bg-[#ccff00]/15 flex items-center justify-center text-[#ccff00] mb-4">
                <Headphones className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-base font-black text-white mb-1">24/7 Customer Support</h4>
                <p className="text-xs text-neutral-400">
                  Get help anytime, our team is always available to assist you
                </p>
              </div>
            </div>

            {/* Trusted Worldwide */}
            <div className="bg-[#12151c] border border-white/10 rounded-3xl p-6 flex flex-col justify-between">
              <div className="flex items-center gap-1.5 mb-4 text-xs font-bold text-[#ccff00]">
                <span>🇨🇦</span>
                <span>🇺🇸</span>
                <span>🇬🇧</span>
                <span>🇩🇪</span>
                <span>🇦🇪</span>
                <span>🇸🇬</span>
              </div>
              <div>
                <h4 className="text-base font-black text-white mb-1">Trusted Worldwide</h4>
                <p className="text-xs text-neutral-400">
                  170+ countries and a 4.8★ rating from traders around the world
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Bento: Scale Up to $1M */}
          <div className="bg-[#12151c] border border-white/10 rounded-3xl p-6 sm:p-7 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-xl font-black text-white mb-2">Scale Up to $1M</h3>
              <p className="text-xs text-neutral-400 max-w-sm leading-relaxed">
                Hit 15% profit, scale by 30% each quarter, and grow your account to $1,000,000
              </p>
            </div>

            <div className="w-full sm:w-56 flex items-end justify-between gap-2 h-20 bg-[#08090b] border border-white/5 rounded-2xl p-3">
              <div className="w-1/5 bg-neutral-800 rounded-t h-1/4 flex items-center justify-center text-[8px] text-neutral-400">$100K</div>
              <div className="w-1/5 bg-neutral-700 rounded-t h-2/5 flex items-center justify-center text-[8px] text-neutral-400">$200K</div>
              <div className="w-1/5 bg-neutral-600 rounded-t h-3/5 flex items-center justify-center text-[8px] text-neutral-300">$300K</div>
              <div className="w-1/5 bg-neutral-500 rounded-t h-4/5 flex items-center justify-center text-[8px] text-neutral-200">$750K</div>
              <div className="w-1/5 bg-[#ccff00] rounded-t h-full flex flex-col items-center justify-center text-[9px] text-black font-black">
                <Trophy className="w-3 h-3" />
                $1M
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
