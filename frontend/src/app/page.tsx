"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  GraduationCap,
  DollarSign,
  Coins,
  ChevronRight,
  ChevronDown,
  Play,
  Clock,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  Trophy,
  ArrowRight,
  Laptop,
  Headphones,
  BarChart3,
  Bot,
  Star,
  QrCode,
  Sparkles,
  Zap,
  Activity,
  Layers,
  Award,
} from "lucide-react";
import DiscountModal from "@/components/DiscountModal";

export default function HomePage() {
  const [discountOpen, setDiscountOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"app" | "ai" | "platform" | "support">("app");
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [selectedVideo, setSelectedVideo] = useState<{
    name: string;
    country: string;
    flag: string;
    reward: string;
    account: string;
  } | null>(null);

  const toggleFaq = (idx: number) => {
    setOpenFaq(openFaq === idx ? null : idx);
  };

  const PLANS = [
    {
      size: "$100,000",
      amount: 100000,
      fee: "$299.99",
      tag: "Best Offer",
      tagClass: "bg-[#ccff00] text-black font-black",
      borderClass: "border-[#ccff00]/60 shadow-[0_0_35px_rgba(204,255,0,0.18)] ring-1 ring-[#ccff00]/40",
      target: "10%",
      split: "80%",
      maxLoss: "6%",
      dailyLoss: "4%",
      minDays: "5 Days",
      payout: "14 Days",
      leverage: "1:100",
    },
    {
      size: "$50,000",
      amount: 50000,
      fee: "$199.99",
      tag: null,
      borderClass: "border-white/10 hover:border-white/20",
      target: "10%",
      split: "80%",
      maxLoss: "6%",
      dailyLoss: "4%",
      minDays: "5 Days",
      payout: "14 Days",
      leverage: "1:100",
    },
    {
      size: "$25,000",
      amount: 25000,
      fee: "$99.99",
      tag: "Most Popular",
      tagClass: "bg-[#ccff00] text-black font-black",
      borderClass: "border-[#ccff00]/60 shadow-[0_0_35px_rgba(204,255,0,0.18)] ring-1 ring-[#ccff00]/40",
      target: "10%",
      split: "80%",
      maxLoss: "6%",
      dailyLoss: "4%",
      minDays: "5 Days",
      payout: "14 Days",
      leverage: "1:100",
    },
    {
      size: "$10,000",
      amount: 10000,
      fee: "$49.99",
      tag: null,
      borderClass: "border-white/10 hover:border-white/20",
      target: "10%",
      split: "80%",
      maxLoss: "6%",
      dailyLoss: "4%",
      minDays: "5 Days",
      payout: "14 Days",
      leverage: "1:100",
    },
  ];

  const FAQS = [
    {
      q: "What happens after I purchase the challenge?",
      a: "After you purchase the Challenge, you'll immediately receive an email with your MT5 simulated trading credentials and dashboard access. You can begin trading right away, monitor your drawdown and profit targets in the MaxFunded Dashboard, and access all risk analytics. Once you reach the profit target while respecting platform rules, you receive your simulated MaxFunded Trader Account and become eligible for 80% to 90% real profit rewards.",
    },
    {
      q: "What if I don't pass the trading challenge?",
      a: "If you breach the Maximum Loss or Daily Loss limits, the evaluation account is automatically paused by our server-side risk engine. You can reset or restart a new challenge at any time with a discounted retry fee.",
    },
    {
      q: "What happens after I complete Stage 1?",
      a: "Upon completing Phase 1 with the required profit target and minimum trading days, your metrics are verified instantly. You will receive an automated Certificate of Achievement and credentials for Stage 2 (or your funded MaxFunded Trader account for 1-step challenges) within minutes.",
    },
    {
      q: "How fast can I receive my first reward?",
      a: "Your first payout can be requested after 14 days of trading on your MaxFunded Trader account. Subsequent payouts are eligible on bi-weekly or on-demand schedules and processed in under 1 minute via automated crypto or direct bank transfer.",
    },
    {
      q: "How does challenge billing work?",
      a: "All challenges feature straightforward one-time evaluation fees with zero hidden recurring charges or monthly subscriptions. What you see is what you pay, and successful funded traders receive an 80% to 90% performance reward split.",
    },
    {
      q: "What happens if my payment fails?",
      a: "If an online payment fails, no funds will be deducted from your payment method. You can retry with a different card or cryptocurrency gateway, or contact our 24/7 live support for instant billing help.",
    },
    {
      q: "Can I cancel my challenge?",
      a: "You may request a full refund within 14 calendar days of purchase provided that no trades have been executed on the trading account yet.",
    },
  ];

  return (
    <div className="bg-[#08090b] text-white selection:bg-[#ccff00] selection:text-black min-h-screen">
      {/* 50% DISCOUNT LEAD CAPTURE MODAL */}
      <DiscountModal isOpen={discountOpen} onClose={() => setDiscountOpen(false)} />

      {/* VIDEO TESTIMONIAL MODAL */}
      {selectedVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-lg bg-[#111418] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl text-center">
            <button
              onClick={() => setSelectedVideo(null)}
              className="absolute top-5 right-5 text-neutral-400 hover:text-white p-1 rounded-full hover:bg-white/10 transition"
            >
              ✕
            </button>
            <div className="w-16 h-16 rounded-full bg-[#ccff00]/15 flex items-center justify-center mx-auto mb-4 text-[#ccff00]">
              <Play className="w-8 h-8 fill-current ml-1" />
            </div>
            <h3 className="text-2xl font-black text-white flex items-center justify-center gap-2 mb-1">
              <span>{selectedVideo.flag}</span>
              <span>{selectedVideo.name}</span>
            </h3>
            <p className="text-xs text-neutral-400 mb-5">
              {selectedVideo.country} • {selectedVideo.account} Account
            </p>
            <div className="bg-[#08090b] border border-white/5 rounded-2xl p-5 text-left space-y-3 mb-6 text-xs sm:text-sm text-neutral-300 leading-relaxed">
              <p>
                &quot;MaxFunded delivers the most responsive trading dashboard in the industry. The simulated MT5 execution is instantaneous with zero slippage, and my first reward of{" "}
                <strong className="text-[#ccff00]">{selectedVideo.reward}</strong> arrived in my wallet in under 60 seconds.&quot;
              </p>
            </div>
            <div className="flex items-center justify-between px-5 py-3.5 bg-[#171b22] border border-white/5 rounded-xl text-xs">
              <span className="text-neutral-400 font-semibold">Total Reward Received</span>
              <span className="font-extrabold text-[#ccff00] text-base">{selectedVideo.reward}</span>
            </div>
            <button
              onClick={() => setSelectedVideo(null)}
              className="mt-6 w-full py-3.5 rounded-full bg-white hover:bg-neutral-200 text-black font-black text-xs uppercase tracking-tight transition"
            >
              Close Story
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. HERO SECTION (Screenshots 2 & 4) */}
      {/* ========================================================================= */}
      <section className="relative pt-10 sm:pt-16 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center overflow-hidden bg-grid-pattern">
        {/* Subtle radial ambient neon glows */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[750px] h-[480px] bg-[#ccff00]/[0.05] blur-[160px] rounded-full pointer-events-none -z-10" />

        {/* Trustpilot Widget Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#111418] border border-white/10 text-xs text-neutral-300 mb-8 select-none shadow-sm">
          <span className="font-bold text-white">Excellent</span>
          <div className="flex items-center space-x-0.5">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="w-4 h-4 bg-[#00b67a] flex items-center justify-center rounded-[2px]">
                <Star className="w-2.5 h-2.5 text-white fill-current" />
              </div>
            ))}
          </div>
          <span className="font-extrabold text-white text-[13px] tracking-tight">Trustpilot</span>
        </div>

        {/* Big Bold Headline */}
        <h1 className="text-4xl sm:text-6xl lg:text-[76px] font-black tracking-tight text-white max-w-5xl mx-auto leading-[1.06] uppercase">
          We Give You <span className="text-[#ccff00]">$100K</span> To Trade, <br />
          You Keep <span className="text-[#ccff00]">80% Of Rewards</span>.
        </h1>

        {/* Action Verbs Subtitle */}
        <p className="mt-6 text-base sm:text-xl text-neutral-300 max-w-2xl mx-auto font-medium leading-relaxed">
          <span className="text-[#ccff00] font-bold">Get</span> simulated account.{" "}
          <span className="text-[#ccff00] font-bold">Pass</span> trading challenge.{" "}
          <span className="text-[#ccff00] font-bold">Get</span> Real Rewards.
        </p>

        {/* 4 Feature Value Pillars */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 max-w-4xl mx-auto text-center">
          <div className="flex flex-col items-center p-3 sm:p-4 rounded-2xl bg-white/[0.02] border border-white/[0.04]">
            <div className="w-11 h-11 mb-2 flex items-center justify-center text-[#ccff00]">
              <GraduationCap className="w-8 h-8" />
            </div>
            <div className="font-black text-sm sm:text-base text-white">Learn Trading</div>
            <div className="text-xs text-neutral-400 mt-0.5">In our Trading Academy</div>
          </div>

          <div className="flex flex-col items-center p-3 sm:p-4 rounded-2xl bg-white/[0.02] border border-white/[0.04]">
            <div className="w-11 h-11 mb-2 flex items-center justify-center text-[#ccff00]">
              <Bot className="w-8 h-8" />
            </div>
            <div className="font-black text-sm sm:text-base text-white">Use AI Assistant</div>
            <div className="text-xs text-neutral-400 mt-0.5">In Your Trading Challenge</div>
          </div>

          <div className="flex flex-col items-center p-3 sm:p-4 rounded-2xl bg-white/[0.02] border border-white/[0.04]">
            <div className="w-11 h-11 mb-2 flex items-center justify-center text-[#ccff00]">
              <DollarSign className="w-8 h-8" />
            </div>
            <div className="font-black text-sm sm:text-base text-white">Get up to $100k</div>
            <div className="text-xs text-neutral-400 mt-0.5">Of Simulated Trading Funds</div>
          </div>

          <div className="flex flex-col items-center p-3 sm:p-4 rounded-2xl bg-white/[0.02] border border-white/[0.04]">
            <div className="w-11 h-11 mb-2 flex items-center justify-center text-[#ccff00]">
              <Coins className="w-8 h-8" />
            </div>
            <div className="font-black text-sm sm:text-base text-white">Get 80%</div>
            <div className="text-xs text-neutral-400 mt-0.5">Of Profit Rewards</div>
          </div>
        </div>

        {/* Glowing Hero CTA Button */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/challenges"
            className="w-full sm:w-auto px-10 py-4 rounded-xl bg-[#ccff00] hover:bg-[#b3e600] text-black font-black text-base uppercase tracking-tight shadow-neon transition transform hover:scale-105 active:scale-95 text-center flex items-center justify-center gap-2"
          >
            <span>Start Now</span>
            <ChevronRight className="w-5 h-5 stroke-[3]" />
          </Link>

          <button
            onClick={() => setDiscountOpen(true)}
            className="w-full sm:w-auto px-7 py-4 rounded-xl bg-[#111418] hover:bg-white/10 text-neutral-300 hover:text-white font-bold text-xs uppercase tracking-tight border border-white/10 transition flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-[#ccff00]" />
            <span>Get 50% Off Coupon</span>
          </button>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. "HOW DOES IT WORK?" 3-STEP FLOW (Screenshot 5) */}
      {/* ========================================================================= */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-tight">
            How Does It Work?
          </h2>
          <p className="mt-3 text-sm sm:text-base text-neutral-400 max-w-2xl mx-auto">
            We find the best traders and give opportunity to get access to significant virtual trading capital
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          {/* ==================== CARD 1: EVALUATION STAGE ==================== */}
          <div className="bg-[#12151c] border border-white/10 rounded-3xl p-6 sm:p-8 flex flex-col justify-between relative group hover:border-white/20 transition">
            <div>
              {/* Step Badge */}
              <div className="w-10 h-10 rounded-full bg-white text-black font-black text-sm flex items-center justify-center mb-6 shadow-sm">
                1
              </div>

              <div className="text-[11px] font-black uppercase text-neutral-400 tracking-wider mb-1">
                EVALUATION STAGE
              </div>
              <h3 className="text-2xl font-black text-white mb-3">
                Pass Trading Challenge
              </h3>
              <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed mb-6">
                Trade a simulated trading account of up to $200,000 and hit 10% profit target within the platform rules
              </p>
            </div>

            {/* Rich Candlestick / Trading Terminal Graphic */}
            <div className="bg-[#08090b] border border-white/10 rounded-2xl p-4 relative overflow-hidden">
              <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400 mb-2">
                <span className="font-bold text-white">EUR/USD 1H</span>
                <span className="text-[#ccff00] font-black flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#ccff00] animate-ping" />
                  +10.2% TARGET HIT
                </span>
              </div>

              {/* Order Execution Flag */}
              <div className="mb-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-950/60 border border-emerald-500/40 text-[10px] font-mono text-emerald-300">
                <span>🟢 BUY 10.00 @ 1.08420</span>
                <span className="text-neutral-500">•</span>
                <span className="text-white font-bold">+$10,250.00</span>
              </div>

              {/* Candlestick & Glowing Trendline Visual */}
              <div className="relative h-20 w-full flex items-end justify-between px-1 pt-2">
                {/* Candlestick bars */}
                <div className="flex items-end gap-1.5 w-full h-full justify-between">
                  <div className="w-2.5 bg-emerald-500/40 rounded-sm h-[35%] relative flex justify-center"><div className="w-[1px] bg-emerald-400 h-14 absolute -top-2" /></div>
                  <div className="w-2.5 bg-red-500/40 rounded-sm h-[25%] relative flex justify-center"><div className="w-[1px] bg-red-400 h-10 absolute -top-1" /></div>
                  <div className="w-2.5 bg-emerald-500/60 rounded-sm h-[48%] relative flex justify-center"><div className="w-[1px] bg-emerald-400 h-16 absolute -top-3" /></div>
                  <div className="w-2.5 bg-emerald-500/80 rounded-sm h-[65%] relative flex justify-center"><div className="w-[1px] bg-emerald-400 h-18 absolute -top-2" /></div>
                  <div className="w-2.5 bg-emerald-400 rounded-sm h-[85%] relative flex justify-center"><div className="w-[1px] bg-[#ccff00] h-20 absolute -top-2" /></div>
                  <div className="w-2.5 bg-[#ccff00] rounded-sm h-[98%] shadow-neon-sm relative flex justify-center"><div className="w-[1px] bg-white h-20 absolute -top-1" /></div>
                </div>

                {/* Ascending Trendline overlay */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 240 80" fill="none">
                  <path
                    d="M 5 65 Q 60 50, 110 40 T 180 20 T 235 8"
                    stroke="#ccff00"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                  <circle cx="235" cy="8" r="3.5" fill="#ffffff" stroke="#ccff00" strokeWidth="2" />
                </svg>
              </div>

              <div className="flex justify-between text-[9px] font-mono text-neutral-500 mt-2 pt-1 border-t border-white/5">
                <span>09:00</span>
                <span>12:00</span>
                <span>15:00</span>
                <span>18:00 (CLOSED)</span>
              </div>
            </div>

            {/* Connecting arrow for desktop */}
            <div className="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#181d26] border border-white/10 items-center justify-center z-10 text-neutral-400">
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>

          {/* ==================== CARD 2: MAXFUNDED TRADER STAGE (Bright Neon Hero Card) ==================== */}
          <div className="bg-[#ccff00] text-black rounded-3xl p-6 sm:p-8 flex flex-col justify-between relative shadow-neon group transform md:-translate-y-2">
            <div>
              {/* Step Badge */}
              <div className="w-10 h-10 rounded-full bg-black text-[#ccff00] font-black text-sm flex items-center justify-center mb-6 shadow-md">
                2
              </div>

              <div className="text-[11px] font-black uppercase text-neutral-900 tracking-wider mb-1">
                MAXFUNDED TRADER STAGE
              </div>
              <h3 className="text-2xl font-black text-black mb-3">
                Earn Real Rewards
              </h3>
              <p className="text-xs sm:text-sm text-neutral-900 font-semibold leading-relaxed mb-6">
                Trade risk-free, earn 80% of trading performance rewards, and get paid instantly*
              </p>
            </div>

            {/* Laurel Wreath Certificate Preview Mockup */}
            <div className="bg-[#0c0e12] text-white border border-black/80 rounded-2xl p-5 relative overflow-hidden text-center shadow-xl">
              <div className="text-[9px] text-[#ccff00] font-mono uppercase tracking-[0.2em] mb-1 font-bold">
                OFFICIAL REWARD CERTIFICATE
              </div>

              <div className="text-[10px] text-neutral-400 uppercase tracking-widest mt-1">Present to</div>
              <div className="text-xl font-black text-white">Alex Smith</div>

              {/* Laurel Wreath + Reward Amount Container */}
              <div className="relative py-3 flex items-center justify-center">
                {/* Left Laurel Leaves SVG */}
                <svg className="w-8 h-12 text-[#ccff00] mr-2 shrink-0 opacity-90" viewBox="0 0 32 48" fill="currentColor">
                  <path d="M16 4C14 10 10 14 6 18C10 18 14 16 16 12C18 16 22 18 26 18C22 14 18 10 16 4Z" />
                  <path d="M14 18C11 24 7 28 3 32C7 32 11 30 13 26C15 30 19 32 23 32C19 28 15 24 14 18Z" />
                  <path d="M12 32C9 38 5 42 1 46C5 46 9 44 11 40C13 44 17 46 21 46C17 42 13 38 12 32Z" />
                </svg>

                <div className="text-center">
                  <div className="text-[9px] uppercase tracking-wider text-neutral-400">Your Reward</div>
                  <div className="text-3xl font-black text-[#ccff00] tracking-tight leading-none mt-1">
                    $24,580
                  </div>
                </div>

                {/* Right Laurel Leaves SVG */}
                <svg className="w-8 h-12 text-[#ccff00] ml-2 shrink-0 opacity-90 scale-x-[-1]" viewBox="0 0 32 48" fill="currentColor">
                  <path d="M16 4C14 10 10 14 6 18C10 18 14 16 16 12C18 16 22 18 26 18C22 14 18 10 16 4Z" />
                  <path d="M14 18C11 24 7 28 3 32C7 32 11 30 13 26C15 30 19 32 23 32C19 28 15 24 14 18Z" />
                  <path d="M12 32C9 38 5 42 1 46C5 46 9 44 11 40C13 44 17 46 21 46C17 42 13 38 12 32Z" />
                </svg>
              </div>

              <div className="flex items-center justify-between text-[9px] text-neutral-400 pt-2 border-t border-white/5 font-mono">
                <span>SERIAL: MF-8849-PASS</span>
                <span className="text-[#ccff00] font-bold">✓ INSTANT PAYOUT</span>
              </div>
            </div>

            {/* Connecting arrow for desktop */}
            <div className="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#181d26] border border-white/10 items-center justify-center z-10 text-neutral-400">
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>

          {/* ==================== CARD 3: SCALING STAGE ==================== */}
          <div className="bg-[#12151c] border border-white/10 rounded-3xl p-6 sm:p-8 flex flex-col justify-between relative group hover:border-white/20 transition">
            <div>
              {/* Step Badge */}
              <div className="w-10 h-10 rounded-full bg-white text-black font-black text-sm flex items-center justify-center mb-6 shadow-sm">
                3
              </div>

              <div className="text-[11px] font-black uppercase text-neutral-400 tracking-wider mb-1">
                SCALING STAGE
              </div>
              <h3 className="text-2xl font-black text-white mb-3">
                Scale Up To $1,000,000
              </h3>
              <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed mb-6">
                Hit 15% profit on MaxFunded Trader stage, scale by 30% each quarter, and grow your account to $1,000,000
              </p>
            </div>

            {/* Institutional Scaling Stepped Pillar Visual */}
            <div className="bg-[#08090b] border border-white/10 rounded-2xl p-4 flex flex-col justify-between h-44">
              <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400">
                <span className="font-bold text-white">CAPITAL LADDER</span>
                <span className="text-[#ccff00] font-bold">+30% EVERY QUARTER</span>
              </div>

              <div className="flex items-end justify-between gap-2 h-28 pt-2">
                <div className="w-1/5 bg-neutral-800/80 rounded-t-lg h-[28%] flex flex-col items-center justify-end pb-1 border-t border-white/10">
                  <span className="text-[9px] text-neutral-400 font-bold">$100K</span>
                  <span className="text-[7px] text-neutral-500 font-mono">Q1</span>
                </div>
                <div className="w-1/5 bg-neutral-700/80 rounded-t-lg h-[46%] flex flex-col items-center justify-end pb-1 border-t border-white/15">
                  <span className="text-[9px] text-neutral-300 font-bold">$200K</span>
                  <span className="text-[7px] text-neutral-500 font-mono">Q2</span>
                </div>
                <div className="w-1/5 bg-neutral-600/80 rounded-t-lg h-[64%] flex flex-col items-center justify-end pb-1 border-t border-white/20">
                  <span className="text-[9px] text-neutral-200 font-bold">$300K</span>
                  <span className="text-[7px] text-neutral-500 font-mono">Q3</span>
                </div>
                <div className="w-1/5 bg-neutral-500/80 rounded-t-lg h-[82%] flex flex-col items-center justify-end pb-1 border-t border-white/25">
                  <span className="text-[9px] text-white font-bold">$750K</span>
                  <span className="text-[7px] text-neutral-400 font-mono">Q4</span>
                </div>
                <div className="w-1/5 bg-gradient-to-t from-[#a3e635] to-[#ccff00] rounded-t-lg h-full flex flex-col items-center justify-center text-black font-black shadow-neon-sm">
                  <Trophy className="w-4 h-4 mb-0.5 text-black" />
                  <span className="text-[11px] leading-tight">$1M</span>
                  <span className="text-[7px] uppercase tracking-wider font-extrabold text-neutral-900">MAX</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. "TRUSTED BY THOUSANDS OF TRADERS" / TESTIMONIALS (Screenshot 6) */}
      {/* ========================================================================= */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/[0.06]">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-tight">
            Trusted By Thousands Of Traders
          </h2>

          {/* 3 Counter Stats */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-8 sm:gap-16">
            <div>
              <span className="text-2xl sm:text-4xl font-black text-white">30K+</span>
              <span className="text-xs sm:text-sm text-neutral-400 ml-2 font-medium">Customers worldwide</span>
            </div>
            <div>
              <span className="text-2xl sm:text-4xl font-black text-white">$500M+</span>
              <span className="text-xs sm:text-sm text-neutral-400 ml-2 font-medium">In trading accounts</span>
            </div>
            <div>
              <span className="text-2xl sm:text-4xl font-black text-white">170+</span>
              <span className="text-xs sm:text-sm text-neutral-400 ml-2 font-medium">Countries served</span>
            </div>
          </div>
        </div>

        {/* Video / Trader Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              name: "Kev B.",
              country: "USA",
              flag: "🇺🇸",
              rewards: "$12,160",
              account: "$100,000",
              bg: "from-blue-950/70 to-neutral-950",
            },
            {
              name: "Tom J.",
              country: "Netherlands",
              flag: "🇳🇱",
              rewards: "$10,019",
              account: "$100,000",
              bg: "from-amber-950/70 to-neutral-950",
            },
            {
              name: "Andy L.",
              country: "Canada",
              flag: "🇨🇦",
              rewards: "$8,523",
              account: "$100,000",
              bg: "from-emerald-950/70 to-neutral-950",
            },
            {
              name: "Dary B.",
              country: "Australia",
              flag: "🇦🇺",
              rewards: "$4,735",
              account: "$50,000",
              bg: "from-purple-950/70 to-neutral-950",
            },
          ].map((trader, i) => (
            <div
              key={i}
              onClick={() =>
                setSelectedVideo({
                  name: trader.name,
                  country: trader.country,
                  flag: trader.flag,
                  reward: trader.rewards,
                  account: trader.account,
                })
              }
              className="bg-[#12151c] border border-white/10 hover:border-[#ccff00]/60 rounded-2xl p-4 transition-all duration-300 group cursor-pointer hover:shadow-neon-sm"
            >
              {/* Video Thumbnail Frame */}
              <div
                className={`relative h-44 rounded-xl bg-gradient-to-b ${trader.bg} border border-white/5 flex items-center justify-center overflow-hidden mb-4`}
              >
                <div className="w-12 h-12 rounded-full bg-white/15 group-hover:bg-[#ccff00] text-white group-hover:text-black flex items-center justify-center transition-all duration-300 shadow-lg group-hover:scale-110">
                  <Play className="w-5 h-5 fill-current ml-0.5" />
                </div>
              </div>

              {/* Trader Details */}
              <div className="flex items-center gap-2 mb-3">
                <span className="text-base">{trader.flag}</span>
                <span className="font-bold text-white text-sm">{trader.name}</span>
                <span className="text-xs text-neutral-400">({trader.country})</span>
              </div>

              {/* Rewards Earned & Account Size */}
              <div className="grid grid-cols-2 gap-2 pt-3 border-t border-white/5 text-left">
                <div>
                  <div className="text-[10px] uppercase font-bold text-neutral-400">REWARDS EARNED</div>
                  <div className="text-sm font-black text-[#ccff00]">{trader.rewards}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-neutral-400">ACCOUNT SIZE</div>
                  <div className="text-sm font-black text-white">{trader.account}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. "FAST & SAFE REWARDS" / CERTIFICATES SHOWCASE (Screenshot 7) */}
      {/* ========================================================================= */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/[0.06]">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-tight">
            Fast & Safe Rewards
          </h2>

          {/* 3 Metric Highlights */}
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto text-left">
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-[#12151c] border border-white/5 shadow-sm">
              <div className="w-12 h-12 rounded-full bg-[#ccff00]/15 flex items-center justify-center text-[#ccff00] shrink-0">
                <DollarSign className="w-6 h-6" />
              </div>
              <div>
                <div className="text-2xl font-black text-white">$12,160</div>
                <div className="text-xs text-neutral-400">Highest single reward</div>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-2xl bg-[#12151c] border border-white/5 shadow-sm">
              <div className="w-12 h-12 rounded-full bg-[#ccff00]/15 flex items-center justify-center text-[#ccff00] shrink-0">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <div className="text-2xl font-black text-white">&lt; 1 min*</div>
                <div className="text-xs text-neutral-400">Reward payout time</div>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-2xl bg-[#12151c] border border-white/5 shadow-sm">
              <div className="w-12 h-12 rounded-full bg-[#ccff00]/15 flex items-center justify-center text-[#ccff00] shrink-0">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <div className="text-2xl font-black text-white">$3,455</div>
                <div className="text-xs text-neutral-400">Average reward amount</div>
              </div>
            </div>
          </div>
        </div>

        {/* 3 Certificates of Profit Reward */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          {/* Certificate 1: Lark A. */}
          <div className="bg-[#111418] border border-white/10 rounded-2xl p-6 text-left relative overflow-hidden group hover:border-white/25 transition">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] text-neutral-400 uppercase font-semibold">Certificate of Profit Reward</span>
              <span className="text-xs font-black text-[#ccff00]">MaxFunded</span>
            </div>
            <div className="text-base font-bold text-white">Lark A.</div>
            <div className="text-xs text-neutral-400 mt-2">Total Profit Received:</div>
            <div className="text-2xl font-black text-[#ccff00] mt-0.5">$2,396</div>
            <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-[10px] text-neutral-400">
              <span>Date: 2 Oct 2026</span>
              <QrCode className="w-5 h-5 text-neutral-500" />
            </div>
          </div>

          {/* Certificate 2: Kev B. (Center Highlight) */}
          <div className="bg-[#12151c] border-2 border-[#ccff00]/60 rounded-3xl p-8 text-left relative overflow-hidden shadow-neon transform md:-translate-y-2">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[11px] text-[#ccff00] uppercase font-bold tracking-wider">
                Official Reward Certificate
              </span>
              <span className="text-sm font-black text-[#ccff00]">MaxFunded</span>
            </div>
            <div className="text-xl font-black text-white">Kev B.</div>
            <div className="text-xs text-neutral-400 mt-3">Total Profit Received:</div>
            <div className="text-4xl font-black text-[#ccff00] mt-1">$12,160</div>
            <div className="mt-8 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-neutral-400">
              <div>
                <div>Date: 6 Jul 2026</div>
                <div className="text-[10px] text-emerald-400 font-bold mt-0.5">Verified On-Chain</div>
              </div>
              <QrCode className="w-8 h-8 text-[#ccff00]" />
            </div>
          </div>

          {/* Certificate 3: Tom de J. */}
          <div className="bg-[#111418] border border-white/10 rounded-2xl p-6 text-left relative overflow-hidden group hover:border-white/25 transition">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] text-neutral-400 uppercase font-semibold">Certificate of Profit Reward</span>
              <span className="text-xs font-black text-[#ccff00]">MaxFunded</span>
            </div>
            <div className="text-base font-bold text-white">Tom de J.</div>
            <div className="text-xs text-neutral-400 mt-2">Total Profit Received:</div>
            <div className="text-2xl font-black text-[#ccff00] mt-0.5">$10,019</div>
            <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-[10px] text-neutral-400">
              <span>Date: 6 Feb 2026</span>
              <QrCode className="w-5 h-5 text-neutral-500" />
            </div>
          </div>
        </div>

        <div className="text-center mt-10">
          <Link
            href="/certificates"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-[#ccff00] hover:bg-[#b3e600] text-black font-extrabold text-xs uppercase tracking-tight shadow-neon transition"
          >
            <span>See more results</span>
            <ChevronRight className="w-4 h-4 stroke-[3]" />
          </Link>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. "WHY PEOPLE CHOOSE MAXFUNDED" / INTERACTIVE TABS (Screenshots 8 & 10) */}
      {/* ========================================================================= */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/[0.06]">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-tight">
            Why People Choose MaxFunded
          </h2>
          <p className="mt-3 text-sm sm:text-base text-neutral-400 max-w-2xl mx-auto">
            Everything you need to trade, grow, and earn rewards in one place
          </p>

          {/* Interactive Tab Selectors */}
          <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-3 max-w-4xl mx-auto">
            <button
              onClick={() => setActiveTab("app")}
              className={`p-4 rounded-2xl border text-left transition-all ${
                activeTab === "app"
                  ? "bg-[#12151c] border-[#ccff00] shadow-neon-sm"
                  : "bg-[#0f1115] border-white/5 hover:border-white/15"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <Laptop className={`w-4 h-4 ${activeTab === "app" ? "text-[#ccff00]" : "text-neutral-400"}`} />
                <span className="font-bold text-sm text-white">Personal Web App</span>
              </div>
              <p className="text-[11px] text-neutral-400">Manage, analyze, and withdraw</p>
            </button>

            <button
              onClick={() => setActiveTab("ai")}
              className={`p-4 rounded-2xl border text-left transition-all ${
                activeTab === "ai"
                  ? "bg-[#12151c] border-[#ccff00] shadow-neon-sm"
                  : "bg-[#0f1115] border-white/5 hover:border-white/15"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <Bot className={`w-4 h-4 ${activeTab === "ai" ? "text-[#ccff00]" : "text-neutral-400"}`} />
                <span className="font-bold text-sm text-white">AI Challenge Assistant</span>
              </div>
              <p className="text-[11px] text-neutral-400">Check trading rules & track limits</p>
            </button>

            <button
              onClick={() => setActiveTab("platform")}
              className={`p-4 rounded-2xl border text-left transition-all ${
                activeTab === "platform"
                  ? "bg-[#12151c] border-[#ccff00] shadow-neon-sm"
                  : "bg-[#0f1115] border-white/5 hover:border-white/15"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <BarChart3 className={`w-4 h-4 ${activeTab === "platform" ? "text-[#ccff00]" : "text-neutral-400"}`} />
                <span className="font-bold text-sm text-white">Trading Platform</span>
              </div>
              <p className="text-[11px] text-neutral-400">Trade 100+ assets with MT5</p>
            </button>

            <button
              onClick={() => setActiveTab("support")}
              className={`p-4 rounded-2xl border text-left transition-all ${
                activeTab === "support"
                  ? "bg-[#12151c] border-[#ccff00] shadow-neon-sm"
                  : "bg-[#0f1115] border-white/5 hover:border-white/15"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <Headphones className={`w-4 h-4 ${activeTab === "support" ? "text-[#ccff00]" : "text-neutral-400"}`} />
                <span className="font-bold text-sm text-white">24/7 Support</span>
              </div>
              <p className="text-[11px] text-neutral-400">Fast response & live agent chat</p>
            </button>
          </div>
        </div>

        {/* Feature Display Area */}
        <div className="bg-[#12151c] border border-white/10 rounded-3xl p-6 sm:p-10 relative overflow-hidden">
          {activeTab === "app" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div>
                <span className="px-3 py-1 rounded-full bg-[#ccff00]/15 text-[#ccff00] font-black text-xs uppercase tracking-wider">
                  Personal Web App
                </span>
                <h3 className="text-3xl sm:text-4xl font-black text-white mt-4 mb-4">
                  Institutional Risk & Account Management
                </h3>
                <p className="text-neutral-300 text-sm leading-relaxed mb-6">
                  Log in to monitor your daily drawdown thresholds, profit target milestones, win rates, and profit factor in real time. Request instant profit payouts in just two clicks.
                </p>
                <div className="flex flex-wrap gap-2 text-xs font-bold">
                  <span className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-neutral-200">
                    + Trading lessons
                  </span>
                  <span className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-neutral-200">
                    + Real-time progress tracking
                  </span>
                  <span className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-neutral-200">
                    + Payout vault
                  </span>
                </div>
              </div>

              {/* Realistic Risk Dashboard Widget Mockup */}
              <div className="bg-[#08090b] border border-white/10 rounded-2xl p-6 shadow-2xl space-y-4">
                <div className="flex items-center justify-between text-xs pb-3 border-b border-white/5">
                  <span className="text-neutral-400 font-mono">ACCOUNT: #MF-109482</span>
                  <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" /> ACTIVE EVALUATION
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#111418] p-4 rounded-xl border border-white/5">
                    <div className="text-[10px] font-mono text-neutral-400 uppercase">CURRENT BALANCE</div>
                    <div className="text-2xl font-black text-white mt-1">$107,480.00</div>
                    <div className="text-[10px] text-emerald-400 font-bold mt-1">+$7,480.00 (+7.48%)</div>
                  </div>
                  <div className="bg-[#111418] p-4 rounded-xl border border-white/5">
                    <div className="text-[10px] font-mono text-neutral-400 uppercase">DAILY DRAWDOWN SAFE ZONE</div>
                    <div className="text-2xl font-black text-[#ccff00] mt-1">1.2% / 4.0%</div>
                    <div className="text-[10px] text-neutral-400 mt-1">Max buffer: $2,800.00</div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-mono text-neutral-400 mb-1.5">
                    <span>PROFIT TARGET PROGRESS</span>
                    <span className="text-[#ccff00] font-bold">74.8% OF GOAL</span>
                  </div>
                  <div className="w-full bg-neutral-800 rounded-full h-2.5 overflow-hidden">
                    <div className="bg-[#ccff00] h-2.5 rounded-full" style={{ width: "74.8%" }} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "ai" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div>
                <span className="px-3 py-1 rounded-full bg-[#ccff00]/15 text-[#ccff00] font-black text-xs uppercase tracking-wider">
                  AI Challenge Assistant
                </span>
                <h3 className="text-3xl sm:text-4xl font-black text-white mt-4 mb-4">
                  24/7 Automated Risk & Rules Guard
                </h3>
                <p className="text-neutral-300 text-sm leading-relaxed mb-6">
                  Our embedded risk AI checks your open positions against maximum allowable lot sizes, detects news trading windows, and alerts you before daily drawdown breaches can occur.
                </p>
                <div className="flex flex-wrap gap-2 text-xs font-bold">
                  <span className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-neutral-200">
                    + News event alerts
                  </span>
                  <span className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-neutral-200">
                    + Lot size validator
                  </span>
                </div>
              </div>

              <div className="bg-[#08090b] border border-white/10 rounded-2xl p-6 shadow-2xl space-y-3 font-mono">
                <div className="flex items-center gap-3 p-3.5 bg-emerald-950/40 border border-emerald-500/30 rounded-xl text-xs text-emerald-300">
                  <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />
                  <span>Rule check passed: Max daily loss limit safe (1.2% / 4.0% consumed)</span>
                </div>
                <div className="flex items-center gap-3 p-3.5 bg-[#111418] border border-white/5 rounded-xl text-xs text-neutral-300">
                  <Bot className="w-5 h-5 text-[#ccff00] shrink-0" />
                  <span>AI Monitor: Next major volatility event (US CPI) in 3h 15m. Lot limits confirmed.</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === "platform" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div>
                <span className="px-3 py-1 rounded-full bg-[#ccff00]/15 text-[#ccff00] font-black text-xs uppercase tracking-wider">
                  Trading Platform
                </span>
                <h3 className="text-3xl sm:text-4xl font-black text-white mt-4 mb-4">
                  High-Speed MetaTrader 5 Terminal
                </h3>
                <p className="text-neutral-300 text-sm leading-relaxed mb-6">
                  Trade FX pairs, indices, gold, and digital assets on MT5 with raw spreads, sub-millisecond execution, and zero artificial restrictions on your trading style.
                </p>
                <div className="flex flex-wrap gap-2 text-xs font-bold">
                  <span className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-neutral-200">
                    + Raw ECN spreads from 0.0 pips
                  </span>
                  <span className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-neutral-200">
                    + 1:100 institutional leverage
                  </span>
                </div>
              </div>

              <div className="bg-[#08090b] border border-white/10 rounded-2xl p-6 shadow-2xl space-y-3">
                <div className="text-xs text-neutral-400 font-mono flex items-center justify-between pb-2 border-b border-white/5">
                  <span>LIVE INSTITUTIONAL SPREADS</span>
                  <span className="text-[#ccff00] font-bold">RAW ECN FEED</span>
                </div>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-3 bg-[#111418] rounded-xl border border-white/5">
                    <div className="text-xs font-mono font-bold text-white">EURUSD</div>
                    <div className="text-[11px] text-[#ccff00] font-mono font-bold mt-1">0.0 pips</div>
                  </div>
                  <div className="p-3 bg-[#111418] rounded-xl border border-white/5">
                    <div className="text-xs font-mono font-bold text-white">XAUUSD</div>
                    <div className="text-[11px] text-[#ccff00] font-mono font-bold mt-1">0.8 pips</div>
                  </div>
                  <div className="p-3 bg-[#111418] rounded-xl border border-white/5">
                    <div className="text-xs font-mono font-bold text-white">US100</div>
                    <div className="text-[11px] text-[#ccff00] font-mono font-bold mt-1">0.5 pips</div>
                  </div>
                  <div className="p-3 bg-[#111418] rounded-xl border border-white/5">
                    <div className="text-xs font-mono font-bold text-white">BTCUSD</div>
                    <div className="text-[11px] text-[#ccff00] font-mono font-bold mt-1">5.0 pips</div>
                  </div>
                  <div className="p-3 bg-[#111418] rounded-xl border border-white/5">
                    <div className="text-xs font-mono font-bold text-white">GBPUSD</div>
                    <div className="text-[11px] text-[#ccff00] font-mono font-bold mt-1">0.2 pips</div>
                  </div>
                  <div className="p-3 bg-[#111418] rounded-xl border border-white/5">
                    <div className="text-xs font-mono font-bold text-white">US30</div>
                    <div className="text-[11px] text-[#ccff00] font-mono font-bold mt-1">1.2 pips</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "support" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div>
                <span className="px-3 py-1 rounded-full bg-[#ccff00]/15 text-[#ccff00] font-black text-xs uppercase tracking-wider">
                  24/7 Human Support
                </span>
                <h3 className="text-3xl sm:text-4xl font-black text-white mt-4 mb-4">
                  Response Time &lt; 1 Minute
                </h3>
                <p className="text-neutral-300 text-sm leading-relaxed mb-6">
                  Our dedicated live support engineers are available 24/7 around the clock to answer rule questions, verify challenge milestones, and assist with payout requests.
                </p>
                <div className="inline-flex items-center gap-2 p-3 bg-black/60 border border-[#ccff00]/40 rounded-xl text-xs font-black text-[#ccff00]">
                  <span>RESPONSE TIME &lt; 1 MIN</span>
                </div>
              </div>

              <div className="bg-[#08090b] border border-white/10 rounded-2xl p-6 shadow-2xl space-y-3 text-left">
                <div className="text-xs text-neutral-400 pb-2 border-b border-white/5 flex items-center justify-between font-mono">
                  <span>LIVE SUPPORT TICKET #9948</span>
                  <span className="text-[#ccff00] font-bold">ONLINE</span>
                </div>
                <div className="p-3.5 bg-[#111418] rounded-xl text-xs text-neutral-300">
                  <span className="text-[#ccff00] font-bold">MaxFunded Support:</span> Hello! Your Phase 1 target is confirmed. Your Phase 2 login credentials have been dispatched to your email!
                </div>
                <div className="p-3.5 bg-[#171b22] rounded-xl text-xs text-neutral-300 text-right">
                  <span className="text-white font-bold">Trader:</span> Perfect! Just received the credentials, logging in right now.
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. "SELECT YOUR ACCOUNT BALANCE" / PRICING CARDS (Screenshot 9) */}
      {/* ========================================================================= */}
      <section id="challenges" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/[0.06]">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-tight">
            Select Your Account Balance
          </h2>
          <p className="mt-3 text-sm sm:text-base text-neutral-400 max-w-xl mx-auto">
            Choose your starting virtual capital. Transparent rules, fair targets, and instant credential delivery.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {PLANS.map((plan, i) => (
            <div
              key={i}
              className={`bg-[#12151c] rounded-3xl p-6 flex flex-col justify-between border ${plan.borderClass} relative transition-all duration-300 group hover:scale-[1.02]`}
            >
              <div>
                {/* Top Badge */}
                <div className="h-7 mb-2 flex items-center justify-center">
                  {plan.tag && (
                    <span className={`px-4 py-1 rounded-full text-xs font-black uppercase tracking-wider ${plan.tagClass}`}>
                      {plan.tag}
                    </span>
                  )}
                </div>

                <div className="text-center">
                  <div className="text-xs text-neutral-400 uppercase font-bold tracking-wider mb-1">
                    Account Size
                  </div>
                  <div className="text-3xl font-black text-white mb-6">
                    {plan.size}
                  </div>

                  {/* Start Now Button */}
                  <Link
                    href={`/challenges`}
                    className="w-full py-3.5 rounded-xl bg-[#ccff00] hover:bg-[#b3e600] text-black font-black text-sm uppercase tracking-tight shadow-neon transition block text-center"
                  >
                    Start Now
                  </Link>

                  {/* Price */}
                  <div className="mt-4 mb-8">
                    <span className="text-xs text-neutral-400 block mb-0.5">One-time challenge fee</span>
                    <span className="text-xl font-black text-white">{plan.fee}</span>
                  </div>
                </div>

                {/* Specs Table */}
                <div className="space-y-3.5 text-xs text-neutral-300 pt-4 border-t border-white/5">
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-400 underline decoration-dotted decoration-neutral-600 cursor-help" title="Target for evaluation phase">
                      Profit Target
                    </span>
                    <span className="font-bold text-white">{plan.target}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-neutral-400 underline decoration-dotted decoration-neutral-600 cursor-help" title="Percentage of profit paid to trader">
                      Profit Split
                    </span>
                    <span className="font-bold text-[#ccff00]">{plan.split}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-neutral-400 underline decoration-dotted decoration-neutral-600 cursor-help" title="Total drawdown limit">
                      Maximum Loss Limit
                    </span>
                    <span className="font-bold text-white">{plan.maxLoss}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-neutral-400 underline decoration-dotted decoration-neutral-600 cursor-help" title="Daily drawdown threshold">
                      Daily Loss Limit
                    </span>
                    <span className="font-bold text-white">{plan.dailyLoss}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-neutral-400 underline decoration-dotted decoration-neutral-600 cursor-help" title="Required trading days to qualify">
                      Minimum Trading Days
                    </span>
                    <span className="font-bold text-white">{plan.minDays}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-neutral-400 underline decoration-dotted decoration-neutral-600 cursor-help" title="Time to withdraw rewards">
                      Payout Schedule
                    </span>
                    <span className="font-bold text-white">{plan.payout}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7. "TRADING & CHALLENGE CONDITIONS" FAQ ACCORDION (Screenshot 11) */}
      {/* ========================================================================= */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto border-t border-white/[0.06]">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-tight">
            Trading & Challenge Conditions
          </h2>
        </div>

        <div className="space-y-3">
          {FAQS.map((faq, idx) => (
            <div
              key={idx}
              className="bg-[#12151c] border border-white/5 rounded-2xl overflow-hidden transition-all duration-200"
            >
              <button
                onClick={() => toggleFaq(idx)}
                className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 hover:bg-white/[0.02] transition"
              >
                <span className="font-bold text-sm sm:text-base text-white">{faq.q}</span>
                <ChevronDown
                  className={`w-5 h-5 text-neutral-400 shrink-0 transition-transform duration-200 ${
                    openFaq === idx ? "rotate-180 text-[#ccff00]" : ""
                  }`}
                />
              </button>

              {openFaq === idx && (
                <div className="px-5 sm:px-6 pb-6 text-xs sm:text-sm text-neutral-300 leading-relaxed border-t border-white/5 pt-4">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
