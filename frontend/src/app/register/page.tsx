"use client";

import React, { useState } from "react";
import Link from "next/link";
import Logo from "@/components/Logo";
import { saveSession } from "@/lib/auth";
import { ShieldCheck, Loader2, CheckCircle2, ChevronRight, Zap, Trophy, Award } from "lucide-react";

const SUPPORTED_COUNTRIES = [
  { code: "US", name: "United States" },
  { code: "GB", name: "United Kingdom" },
  { code: "CA", name: "Canada" },
  { code: "DE", name: "Germany" },
  { code: "FR", name: "France" },
  { code: "NG", name: "Nigeria" },
  { code: "ZA", name: "South Africa" },
  { code: "AE", name: "United Arab Emirates" },
  { code: "SG", name: "Singapore" },
  { code: "AU", name: "Australia" },
  { code: "NL", name: "Netherlands" },
];

export default function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [country, setCountry] = useState("US");
  const [phone, setPhone] = useState("");
  const [acceptedAll, setAcceptedAll] = useState(false);
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!acceptedAll) {
      setError("Please agree to the Terms of Service, Privacy Policy, and Risk Disclosure.");
      return;
    }
    if (!captchaVerified) {
      setError("Please verify that you are not a robot.");
      return;
    }

    setLoading(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
      const res = await fetch(`${apiUrl}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          full_name: fullName,
          country,
          phone: phone || undefined,
          accepted_terms: acceptedAll,
          accepted_privacy: acceptedAll,
          accepted_risk_disclosure: acceptedAll,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: "Registration failed" }));
        throw new Error(err.detail || "Registration failed");
      }

      const data = await res.json();
      saveSession(data.access_token, {
        id: data.user_id,
        email: data.email,
        role: data.role,
        is_admin: data.is_admin,
      });

      window.location.href = "/dashboard";
    } catch (err: any) {
      setError(err.message || "Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#08090b] bg-grid-pattern text-white flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/3 left-1/3 w-[600px] h-[600px] bg-[#ccff00]/[0.03] blur-3xl pointer-events-none rounded-full" />

      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
        {/* ========================================================================= */}
        {/* LEFT: REGISTER FORM CARD */}
        {/* ========================================================================= */}
        <div className="lg:col-span-6 bg-[#111418]/90 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <Link href="/">
              <Logo size="md" />
            </Link>
            <span className="text-[11px] font-black uppercase text-[#ccff00] bg-[#ccff00]/10 px-3 py-1 rounded-full border border-[#ccff00]/25">
              Trader Registration
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-1 text-left">
            Create Your Account
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400 mb-6 text-left">
            Get instant access to your simulated MT5 accounts and performance dashboard
          </p>

          {error && (
            <div className="mb-5 p-3 rounded-xl bg-red-950/50 border border-red-500/30 text-red-300 text-xs text-center font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Alex Smith"
                  className="w-full px-4 py-3 rounded-xl bg-[#08090b] border border-white/10 text-white placeholder-neutral-500 text-xs sm:text-sm focus:outline-none focus:border-[#ccff00] focus:ring-1 focus:ring-[#ccff00] transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1.5">
                  Country of Residence
                </label>
                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-[#08090b] border border-white/10 text-white text-xs sm:text-sm focus:outline-none focus:border-[#ccff00] focus:ring-1 focus:ring-[#ccff00] transition"
                >
                  {SUPPORTED_COUNTRIES.map((c) => (
                    <option key={c.code} value={c.code} className="bg-[#111418] text-white">
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-300 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="trader@example.com"
                className="w-full px-4 py-3 rounded-xl bg-[#08090b] border border-white/10 text-white placeholder-neutral-500 text-xs sm:text-sm focus:outline-none focus:border-[#ccff00] focus:ring-1 focus:ring-[#ccff00] transition"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1.5">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-xl bg-[#08090b] border border-white/10 text-white placeholder-neutral-500 text-xs sm:text-sm focus:outline-none focus:border-[#ccff00] focus:ring-1 focus:ring-[#ccff00] transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-300 mb-1.5">
                  Phone (Optional)
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full px-4 py-3 rounded-xl bg-[#08090b] border border-white/10 text-white placeholder-neutral-500 text-xs sm:text-sm focus:outline-none focus:border-[#ccff00] focus:ring-1 focus:ring-[#ccff00] transition"
                />
              </div>
            </div>

            {/* ── Single Agreement Checkbox ── */}
            <div className="pt-2">
              <label className="flex items-start gap-3 cursor-pointer group">
                <div className="relative mt-0.5 shrink-0">
                  <input
                    type="checkbox"
                    checked={acceptedAll}
                    onChange={(e) => setAcceptedAll(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div
                    onClick={() => setAcceptedAll(!acceptedAll)}
                    className={`w-4.5 h-4.5 w-[18px] h-[18px] rounded border-2 flex items-center justify-center transition-all cursor-pointer ${
                      acceptedAll
                        ? "bg-[#ccff00] border-[#ccff00]"
                        : "border-white/30 bg-transparent hover:border-[#ccff00]/60"
                    }`}
                  >
                    {acceptedAll && (
                      <svg className="w-2.5 h-2.5 text-black" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </div>
                <span className="text-[11px] text-neutral-400 leading-relaxed">
                  I agree to the{" "}
                  <Link href="/terms" target="_blank" className="text-white underline underline-offset-2 hover:text-[#ccff00] transition-colors">
                    Terms of Service
                  </Link>
                  ,{" "}
                  <Link href="/privacy" target="_blank" className="text-white underline underline-offset-2 hover:text-[#ccff00] transition-colors">
                    Privacy Policy
                  </Link>
                  , and acknowledge the{" "}
                  <Link href="/risk-disclosure" target="_blank" className="text-white underline underline-offset-2 hover:text-[#ccff00] transition-colors">
                    Simulated Trading Risk Disclosure
                  </Link>
                </span>
              </label>
            </div>

            {/* ── CAPTCHA widget ── */}
            <div
              className={`flex items-center justify-between px-4 py-3 rounded-xl border transition-all ${
                captchaVerified
                  ? "bg-[#0d1a0d] border-[#ccff00]/40"
                  : "bg-[#08090b] border-white/10 hover:border-white/20"
              }`}
            >
              <label className="flex items-center gap-3 cursor-pointer select-none" onClick={() => setCaptchaVerified(!captchaVerified)}>
                <div
                  className={`w-[22px] h-[22px] rounded border-2 flex items-center justify-center transition-all ${
                    captchaVerified
                      ? "bg-[#ccff00] border-[#ccff00]"
                      : "border-white/30 bg-transparent"
                  }`}
                >
                  {captchaVerified && (
                    <svg className="w-3 h-3 text-black" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <span className={`text-sm font-medium transition-colors ${captchaVerified ? "text-[#ccff00]" : "text-neutral-300"}`}>
                  {captchaVerified ? "Verified" : "I'm not a robot"}
                </span>
              </label>
              {/* reCAPTCHA branding */}
              <div className="flex flex-col items-center opacity-60 shrink-0">
                <svg className="w-8 h-8" viewBox="0 0 64 64" fill="none">
                  <path d="M32 8C18.7 8 8 18.7 8 32s10.7 24 24 24 24-10.7 24-24S45.3 8 32 8z" fill="#4A90D9" opacity="0.15"/>
                  <path d="M32 14c-9.9 0-18 8.1-18 18s8.1 18 18 18 18-8.1 18-18-8.1-18-18-18z" fill="#4A90D9" opacity="0.25"/>
                  <path d="M42 28h-8v-8l-12 12 12 12v-8h8V28z" fill="#4A90D9"/>
                </svg>
                <span className="text-[8px] text-neutral-500 mt-0.5">reCAPTCHA</span>
                <span className="text-[7px] text-neutral-600">Privacy · Terms</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-xl bg-[#ccff00] hover:bg-[#b3e600] text-black font-black text-sm uppercase tracking-tight shadow-neon transition flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-black" />
                  <span>Provisioning Account...</span>
                </>
              ) : (
                <>
                  <span>Create MaxFunded Account</span>
                  <ChevronRight className="w-4 h-4 stroke-[3]" />
                </>
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-neutral-400">
            Already have an account?{" "}
            <Link href="/login" className="text-[#ccff00] font-bold hover:underline">
              Log in
            </Link>
          </p>
        </div>

        {/* ========================================================================= */}
        {/* RIGHT: BENTO HIGHLIGHTS */}
        {/* ========================================================================= */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-[#12151c]/90 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-7 shadow-xl">
            <div className="flex items-center gap-3 mb-3 text-[#ccff00]">
              <Zap className="w-6 h-6" />
              <h3 className="text-xl font-black text-white">Instant Account Provisioning</h3>
            </div>
            <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
              Your simulated MT5 credentials are automatically generated upon challenge confirmation. No waiting, no human verification delays.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-[#12151c]/90 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-xl">
              <Award className="w-6 h-6 text-[#ccff00] mb-3" />
              <h4 className="text-base font-black text-white mb-1">80% to 90% Split</h4>
              <p className="text-xs text-neutral-400">
                Keep the majority of your performance rewards with bi-weekly or on-demand payouts.
              </p>
            </div>

            <div className="bg-[#12151c]/90 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-xl">
              <Trophy className="w-6 h-6 text-[#ccff00] mb-3" />
              <h4 className="text-base font-black text-white mb-1">Scale Up to $1M</h4>
              <p className="text-xs text-neutral-400">
                Quarterly 30% capital compounding scaling plan for consistent profitable traders.
              </p>
            </div>
          </div>

          <div className="bg-[#12151c]/90 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-8 h-8 text-emerald-400 shrink-0" />
              <div>
                <div className="text-sm font-bold text-white">Zero Personal Capital Risk</div>
                <div className="text-xs text-neutral-400">Strictly simulated environment with real rewards</div>
              </div>
            </div>
            <span className="text-xs font-black text-[#ccff00] font-mono shrink-0">100% SECURE</span>
          </div>
        </div>
      </div>
    </div>
  );
}
