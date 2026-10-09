"use client";

import React, { useState, useEffect } from "react";
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
  BarChart3,
  Bot,
  Star,
  Zap,
  Sparkles,
} from "lucide-react";
import DiscountModal from "@/components/DiscountModal";
import LivePayoutsMarquee from "@/components/LivePayoutsMarquee";
import PayoutCalculator from "@/components/PayoutCalculator";
import CompetitionComparison from "@/components/CompetitionComparison";
import TraderAdvantageGrid from "@/components/TraderAdvantageGrid";
import StickyBottomBar from "@/components/StickyBottomBar";
import ScalingPlanInteractive from "@/components/ScalingPlanInteractive";
import GlassTraderDashboardShowcase from "@/components/GlassTraderDashboardShowcase";
import DiscordCommunityBento from "@/components/DiscordCommunityBento";

export default function HomePage() {
  const [discountOpen, setDiscountOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Automatically pop up discount modal on load with blurred background to grab user's attention
  useEffect(() => {
    const timer = setTimeout(() => {
      setDiscountOpen(true);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  // Scroll-reveal: add .visible class when .reveal elements enter the viewport
  useEffect(() => {
    const els = document.querySelectorAll('.reveal');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const toggleFaq = (idx: number) => {
    setOpenFaq(openFaq === idx ? null : idx);
  };

  const PLANS = [
    {
      size: "$100,000",
      fee: "$274.00",
      originalFee: "$499.00",
      discountPct: "45% OFF",
      savings: "Save $225",
      tag: "Best Offer",
      isHighlight: true,
      target: "10% ($10,000)",
      potentialProfit: "$10,000 (Keep up to $9,000)",
      split: "80% – 90%",
      maxLoss: "10% Static ($10,000)",
      dailyLoss: "5% Static ($5,000)",
      minDays: "0 Days (No Min Days)",
      payout: "Bi-Weekly / 1-Day",
      refund: "100% Refundable",
      leverage: "1:100",
    },
    {
      size: "$50,000",
      fee: "$164.00",
      originalFee: "$299.00",
      discountPct: "45% OFF",
      savings: "Save $135",
      tag: "High Demand",
      isHighlight: false,
      target: "10% ($5,000)",
      potentialProfit: "$5,000 (Keep up to $4,500)",
      split: "80% – 90%",
      maxLoss: "10% Static ($5,000)",
      dailyLoss: "5% Static ($2,500)",
      minDays: "0 Days (No Min Days)",
      payout: "Bi-Weekly / 1-Day",
      refund: "100% Refundable",
      leverage: "1:100",
    },
    {
      size: "$25,000",
      fee: "$98.00",
      originalFee: "$179.00",
      discountPct: "45% OFF",
      savings: "Save $81",
      tag: "Most Popular",
      isHighlight: true,
      target: "10% ($2,500)",
      potentialProfit: "$2,500 (Keep up to $2,250)",
      split: "80% – 90%",
      maxLoss: "10% Static ($2,500)",
      dailyLoss: "5% Static ($1,250)",
      minDays: "0 Days (No Min Days)",
      payout: "Bi-Weekly / 1-Day",
      refund: "100% Refundable",
      leverage: "1:100",
    },
    {
      size: "$10,000",
      fee: "$49.00",
      originalFee: "$89.00",
      discountPct: "45% OFF",
      savings: "Save $40",
      tag: "Starter",
      isHighlight: false,
      target: "10% ($1,000)",
      potentialProfit: "$1,000 (Keep up to $900)",
      split: "80% – 90%",
      maxLoss: "10% Static ($1,000)",
      dailyLoss: "5% Static ($500)",
      minDays: "0 Days (No Min Days)",
      payout: "Bi-Weekly / 1-Day",
      refund: "100% Refundable",
      leverage: "1:100",
    },
  ];

  const FAQS = [
    {
      q: "What happens after I purchase the challenge?",
      a: "After you purchase the Challenge, you'll get an email with your MT5 evaluation account login details. You can start trading right away, track your progress in the MaxFunded Dashboard, and access risk analytics. Once you reach your goals and pass verification, you'll receive a MaxFunded funded trading account and get 80-90% of realized performance rewards upon eligibility.",
    },
    {
      q: "What if I don't pass the trading challenge?",
      a: "If you exceed the Maximum Loss or Daily Loss limits, the account is automatically closed by our risk engine. You can purchase a new evaluation at any time with an exclusive discounted reset offer.",
    },
    {
      q: "What happens after I complete Stage 1?",
      a: "Upon completing Phase 1 with the required profit target and static drawdown limits, your metrics are verified instantly. You will receive your funded account credentials within minutes.",
    },
    {
      q: "How fast can I receive my first reward?",
      a: "Your first payout can be requested after 14 days of trading on your MaxFunded Trader account. Payouts are processed instantly via automated crypto or direct bank transfer.",
    },
    {
      q: "How does Membership billing work?",
      a: "All challenges feature straightforward one-time evaluation fees with zero hidden recurring charges or monthly subscriptions. What you see is what you pay, and successful funded traders receive an 80% to 90% performance reward split.",
    },
    {
      q: "What happens if my Membership payment fails?",
      a: "If an online payment fails, no funds will be deducted from your payment method. You can retry with a different card or cryptocurrency gateway, or contact our 24/7 live support for instant billing help.",
    },
    {
      q: "Can I cancel my Membership?",
      a: "You may request a full refund within 14 calendar days of purchase provided that no trades have been executed on the trading account yet.",
    },
  ];

  return (
    <div className="bg-[#060709] text-white selection:bg-[#ccff00] selection:text-black min-h-screen">
      {/* 50% DISCOUNT LEAD CAPTURE MODAL */}
      <DiscountModal isOpen={discountOpen} onClose={() => setDiscountOpen(false)} />



      {/* ========================================================================= */}
      {/* 1. HERO SECTION (Left-Aligned, Tight Spacing From Navbar) */}
      {/* ========================================================================= */}
      <section className="relative pt-4 sm:pt-8 pb-12 sm:pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden">
        {/* Terminal Dot Matrix Grid Overlay */}
        <div 
          className="absolute inset-0 pointer-events-none -z-10 opacity-50"
          style={{
            backgroundImage: "radial-gradient(rgba(204, 255, 0, 0.10) 1px, transparent 0), radial-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 0)",
            backgroundSize: "32px 32px",
            backgroundPosition: "0 0, 16px 16px",
            maskImage: "radial-gradient(ellipse at center, black 40%, transparent 80%)",
            WebkitMaskImage: "radial-gradient(ellipse at center, black 40%, transparent 80%)"
          }}
        />

        {/* Animated ambient glow orbs */}
        <div className="glow-orb absolute top-[-40px] left-[5%] w-[450px] h-[450px] bg-gradient-to-br from-[#ccff00]/[0.08] to-transparent blur-[100px] pointer-events-none -z-10 rounded-full" />
        <div className="glow-orb-delay absolute top-[10px] right-[5%] w-[400px] h-[400px] bg-gradient-to-bl from-[#ccff00]/[0.06] to-transparent blur-[90px] pointer-events-none -z-10 rounded-full" />

        {/* Two-Column Responsive Hero Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Headlines, Trust, and CTAs (7 cols) */}
          <div className="lg:col-span-7 text-left">
            {/* Live Social Proof Badge & Dynamic Payout Pill */}
            <div className="inline-flex flex-wrap items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-[#111418] border border-white/10 text-xs text-neutral-300 mb-6 select-none shadow-md">
              <div className="flex items-center gap-1.5 pr-2.5 border-r border-white/10">
                <span className="w-2 h-2 rounded-full bg-[#ccff00] animate-ping" />
                <span className="font-mono font-bold text-white">$1,489,240+ Disbursed</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-white">4.8 / 5</span>
                <div className="flex items-center space-x-0.5">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="w-3 h-3 bg-[#00b67a] flex items-center justify-center rounded-[2px]">
                      <Star className="w-1.5 h-1.5 text-white fill-current" />
                    </div>
                  ))}
                </div>
                <span className="font-bold text-neutral-400 text-[11px]">Trustpilot</span>
              </div>
            </div>

            {/* High-Impact Master Headline (Left-Aligned) */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-[1.05] tracking-tight uppercase" style={{ letterSpacing: '-0.02em' }}>
              Trade Up To <span className="text-[#ccff00] neon-glow-text">$200,000</span> Capital.
              <br />
              Keep Up To <span className="text-[#ccff00] neon-glow-text">90% Profits</span>.
            </h1>

            {/* Action Verbs & Value Subtitle */}
            <p className="mt-5 text-sm sm:text-base lg:text-lg text-neutral-300 max-w-2xl font-normal leading-relaxed">
              Zero personal liability. Trade institutional simulated capital on raw MetaTrader 5 feeds. 
              Enjoy 0 minimum trading days, static drawdown protection, and rapid USDT or direct bank payouts.
            </p>

            {/* Key Guarantee Badges */}
            <div className="mt-6 flex flex-wrap items-center gap-2 sm:gap-2.5 text-xs font-bold text-neutral-300">
              <span className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 flex items-center gap-1.5 hover:border-[#ccff00]/40 transition">
                <Zap className="w-3.5 h-3.5 text-[#ccff00]" /> 0 Min Trading Days
              </span>
              <span className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 flex items-center gap-1.5 hover:border-[#ccff00]/40 transition">
                <ShieldCheck className="w-3.5 h-3.5 text-[#ccff00]" /> 100% Refundable Fee
              </span>
              <span className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 flex items-center gap-1.5 hover:border-[#ccff00]/40 transition">
                <Coins className="w-3.5 h-3.5 text-[#ccff00]" /> Up to 90% Profit Split
              </span>
              <span className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 flex items-center gap-1.5 hover:border-[#ccff00]/40 transition">
                <TrendingUp className="w-3.5 h-3.5 text-[#ccff00]" /> Scale to $1,000,000
              </span>
            </div>

            {/* Glowing Dual Action Hero CTAs */}
            <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
              <Link
                href="/challenges"
                className="btn-neon px-8 py-4 rounded-xl bg-[#ccff00] hover:bg-[#b3e600] text-black font-black text-sm uppercase tracking-tight shadow-neon transition flex items-center justify-center gap-2"
              >
                <span>Start Evaluation Challenge</span>
                <ChevronRight className="w-4 h-4 stroke-[3]" />
              </Link>

              <Link
                href="/challenges"
                className="px-6 py-4 rounded-xl bg-[#111418] hover:bg-[#181c24] text-white hover:text-[#ccff00] font-black text-sm uppercase tracking-tight border border-white/10 hover:border-[#ccff00]/40 transition flex items-center justify-center gap-2"
              >
                <Zap className="w-4 h-4 text-[#ccff00]" />
                <span>Instant Funded (Skip Evaluation)</span>
              </Link>
            </div>

            {/* Trust Badges Strip */}
            <div className="mt-6 flex flex-wrap items-center gap-5 text-neutral-400 text-xs font-mono">
              <span className="flex items-center gap-1.5"><ShieldCheck size={14} className="text-[#ccff00]" /> MT5 Institutional Bridge</span>
              <span className="flex items-center gap-1.5"><Zap size={14} className="text-[#ccff00]" /> &lt;20ms Execution Speed</span>
              <span className="flex items-center gap-1.5"><Coins size={14} className="text-[#ccff00]" /> Direct USDT / Wire Payouts</span>
            </div>
          </div>

          {/* Right Column: Live Institutional Terminal Card Showcase (5 cols) */}
          <div className="lg:col-span-5">
            <div className="bento-card bg-[#0b0d12] border border-white/10 rounded-3xl p-6 shadow-2xl relative overflow-hidden group hover:border-[#ccff00]/40 transition">
              <div className="flex items-center justify-between pb-4 border-b border-white/5 mb-5">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#ccff00] animate-pulse" />
                  <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                    MT5 Server • Live Account Feed
                  </span>
                </div>
                <span className="text-[10px] font-mono font-bold text-[#ccff00] bg-[#ccff00]/10 px-2 py-0.5 rounded border border-[#ccff00]/25">
                  Phase 1 Evaluation
                </span>
              </div>

              {/* Account Stats Preview */}
              <div className="space-y-4 font-mono">
                <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                  <div className="text-[11px] text-neutral-400 uppercase tracking-widest mb-1">
                    Simulated Capital
                  </div>
                  <div className="text-3xl font-black text-white">$100,000.00</div>
                  <div className="text-xs text-[#ccff00] font-bold mt-1">
                    +$8,420.00 Net PnL (8.42% ROI)
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                    <span className="text-neutral-400 text-[10px] uppercase block mb-0.5">Profit Target</span>
                    <span className="text-white font-bold">$10,000 (10%)</span>
                    <span className="text-[10px] text-[#ccff00] block mt-0.5">84.2% Reached</span>
                  </div>
                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                    <span className="text-neutral-400 text-[10px] uppercase block mb-0.5">Daily Loss Limit</span>
                    <span className="text-white font-bold">$5,000 (5%)</span>
                    <span className="text-[10px] text-emerald-400 block mt-0.5">0.2% Used (Safe)</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between text-xs">
                  <span className="text-neutral-400">Trading Days Required:</span>
                  <span className="text-[#ccff00] font-bold">0 Days (Pass Instantly)</span>
                </div>

                <Link
                  href="/challenges"
                  className="w-full py-3 rounded-xl bg-[#ccff00]/15 hover:bg-[#ccff00] text-[#ccff00] hover:text-black font-extrabold text-xs uppercase tracking-wider border border-[#ccff00]/30 transition text-center block"
                >
                  Select $100K Account →
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* 4 Feature Value Pillars formatted as Metric Cards */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="metric-card p-5 flex flex-col items-center">
            <div className="w-11 h-11 mb-2 flex items-center justify-center text-[#ccff00] rounded-xl bg-[#ccff00]/10 border border-[#ccff00]/20">
              <GraduationCap className="w-6 h-6 stroke-[2]" />
            </div>
            <div className="font-black text-sm sm:text-base text-white">Institutional MT5</div>
            <div className="text-xs text-neutral-400 mt-1">Raw Spreads from 0.0 Pips</div>
          </div>

          <div className="metric-card p-5 flex flex-col items-center">
            <div className="w-11 h-11 mb-2 flex items-center justify-center text-[#ccff00] rounded-xl bg-[#ccff00]/10 border border-[#ccff00]/20">
              <Bot className="w-6 h-6 stroke-[2]" />
            </div>
            <div className="font-black text-sm sm:text-base text-white">AI Risk Guard</div>
            <div className="text-xs text-neutral-400 mt-1">Pre-Breach Drawdown Radar</div>
          </div>

          <div className="metric-card p-5 flex flex-col items-center">
            <div className="w-11 h-11 mb-2 flex items-center justify-center text-[#ccff00] rounded-xl bg-[#ccff00]/10 border border-[#ccff00]/20">
              <DollarSign className="w-6 h-6 stroke-[2]" />
            </div>
            <div className="font-black text-sm sm:text-base text-white">Up to $200,000</div>
            <div className="text-xs text-neutral-400 mt-1">Scale up to $1,000,000 VIP</div>
          </div>

          <div className="metric-card p-5 flex flex-col items-center">
            <div className="w-11 h-11 mb-2 flex items-center justify-center text-[#ccff00] rounded-xl bg-[#ccff00]/10 border border-[#ccff00]/20">
              <Coins className="w-6 h-6 stroke-[2]" />
            </div>
            <div className="font-black text-sm sm:text-base text-white">Keep 80% to 90%</div>
            <div className="text-xs text-neutral-400 mt-1">Bi-Weekly USDT or Wire</div>
          </div>
        </div>

        {/* High-Converting Glassmorphic Trader Terminal Preview */}
        <GlassTraderDashboardShowcase />

      </section>

      {/* Live Social Proof Payouts & Passes Marquee */}
      <LivePayoutsMarquee />

      {/* ========================================================================= */}
      {/* 2. "HOW DOES IT WORK?" 3-STEP FLOW (Screenshot 5) */}
      {/* ========================================================================= */}
      <section id="how-it-works" className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/[0.06]">
        <div className="text-center mb-16 reveal">
          <h2 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-tight">
            How Does It Work?
          </h2>
          <p className="mt-3 text-sm sm:text-base text-neutral-400 max-w-2xl mx-auto">
            We find the best traders and give opportunity to get access to significant virtual trading capital
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative reveal-stagger">
          {/* Card 1: EVALUATION STAGE */}
          <div className="bento-card p-8 flex flex-col justify-between relative group reveal">

            <div>
              <div className="w-10 h-10 rounded-full bg-white text-black font-black text-sm flex items-center justify-center mx-auto mb-6 shadow-sm">
                1
              </div>

              <div className="text-center">
                <div className="text-[11px] font-black uppercase text-neutral-400 tracking-wider mb-1">
                  STAGE 1: EVALUATION
                </div>
                <h3 className="text-2xl font-black text-white mb-3">
                  Pass Trading Challenge
                </h3>
                <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed mb-8">
                  Hit a simple 10% profit target with 0 minimum trading days, 10% static drawdown, and zero time pressure.
                </p>
              </div>
            </div>

            {/* Trading Graphic Mockup */}
            <div className="bg-[#08090b] border border-white/5 rounded-2xl p-5 relative overflow-hidden">
              <div className="flex items-center justify-between text-xs text-neutral-400 mb-2 font-bold font-mono">
                <span>EVALUATION ACCOUNT</span>
                <span className="text-[#ccff00]">+8.2% TARGET HIT</span>
              </div>
              <svg viewBox="0 0 200 65" className="w-full h-16 stroke-[#ccff00] fill-none">
                <path
                  d="M0 55 Q 35 48, 70 42 T 130 26 T 170 30 T 200 10"
                  strokeWidth="3.2"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            {/* Connecting arrow for desktop */}
            <div className="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#181d26] border border-white/10 items-center justify-center z-10 text-neutral-400">
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>

          {/* Card 2: MAXFUNDED TRADER STAGE (Solid Bright Neon Card) */}
          <div className="bg-[#ccff00] text-black rounded-3xl p-8 flex flex-col justify-between relative shadow-neon group transform md:-translate-y-2 reveal transition-all duration-300 hover:-translate-y-4 hover:shadow-[0_20px_60px_rgba(204,255,0,0.4)]">
            <div>
              <div className="w-10 h-10 rounded-full bg-black text-[#ccff00] font-black text-sm flex items-center justify-center mx-auto mb-6 shadow-md">
                2
              </div>

              <div className="text-center">
                <div className="text-[11px] font-black uppercase text-neutral-900 tracking-wider mb-1">
                  STAGE 2: FUNDED TRADER
                </div>
                <h3 className="text-2xl font-black text-black mb-3">
                  Earn Real Rewards
                </h3>
                <p className="text-xs sm:text-sm text-neutral-900 font-semibold leading-relaxed mb-8">
                  Trade funded capital, keep 80% to 90% of profits, withdraw bi-weekly or on-demand, with 100% fee refunded.
                </p>
              </div>
            </div>

            {/* Performance Reward Payout Mockup */}
            <div className="bg-[#090c14] border border-white/10 text-white rounded-2xl p-4 shadow-2xl">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10 text-[10px] font-mono">
                <span className="text-neutral-400">PAYOUT CONFIRMATION</span>
                <span className="text-[#ccff00] font-bold">INSTANT CRYPTO / WIRE</span>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-neutral-400">Profit Share (90%)</span>
                <span className="text-lg font-black text-[#ccff00] font-mono">$18,450.00</span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-neutral-400 border-t border-white/5 pt-2">
                <span>Evaluation Fee</span>
                <span className="text-emerald-400 font-bold">100% Refunded (+$499)</span>
              </div>
              <div className="mt-3 py-1 px-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold text-center">
                ✓ Payout Dispatched in &lt; 60 seconds
              </div>
            </div>

            {/* Connecting arrow for desktop */}
            <div className="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#181d26] border border-white/10 items-center justify-center z-10 text-neutral-400">
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>

          {/* Card 3: SCALING STAGE */}
          <div className="bento-card p-8 flex flex-col justify-between relative group reveal">
            <div>
              <div className="w-10 h-10 rounded-full bg-white text-black font-black text-sm flex items-center justify-center mx-auto mb-6 shadow-sm">
                3
              </div>

              <div className="text-center">
                <div className="text-[11px] font-black uppercase text-neutral-400 tracking-wider mb-1">
                  STAGE 3: CAPITAL SCALING
                </div>
                <h3 className="text-2xl font-black text-white mb-3">
                  Scale Up To $1,000,000
                </h3>
                <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed mb-8">
                  Hit 10% profit on funded stage, scale by 25%-30% every cycle, and grow your account up to $1,000,000.
                </p>
              </div>
            </div>

            {/* Scaling Stepped Bars Graphic */}
            <div className="bg-[#08090b] border border-white/5 rounded-2xl p-4 flex items-end justify-between gap-2 h-28">
              <div className="w-1/5 bg-neutral-800 rounded-t-md h-1/4 flex items-center justify-center text-[9px] text-neutral-400 font-bold">
                $100K
              </div>
              <div className="w-1/5 bg-neutral-700 rounded-t-md h-2/5 flex items-center justify-center text-[9px] text-neutral-400 font-bold">
                $200K
              </div>
              <div className="w-1/5 bg-neutral-600 rounded-t-md h-3/5 flex items-center justify-center text-[9px] text-neutral-300 font-bold">
                $300K
              </div>
              <div className="w-1/5 bg-neutral-500 rounded-t-md h-4/5 flex items-center justify-center text-[9px] text-neutral-200 font-bold">
                $750K
              </div>
              <div className="w-1/5 bg-[#ccff00] rounded-t-md h-full flex flex-col items-center justify-center text-[10px] text-black font-black shadow-neon-sm">
                <Trophy className="w-3.5 h-3.5 mb-1" />
                $1M
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Compounding $1,000,000 Scaling Engine */}
      <ScalingPlanInteractive />

      {/* The MaxFunded Trader-First Advantage Section */}
      <TraderAdvantageGrid />

      {/* ========================================================================= */}
      {/* 3. "TRUSTED BY THOUSANDS OF TRADERS" (Screenshot 6) */}
      {/* ========================================================================= */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/[0.06]">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#ccff00]/10 border border-[#ccff00]/30 text-[#ccff00] font-black text-xs uppercase tracking-wider mb-4">
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Trader Video Interviews</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-tight">
            Trusted By Thousands Of Traders
          </h2>
          <p className="mt-3 text-sm sm:text-base text-neutral-400 max-w-2xl mx-auto">
            Real traders, authentic payouts, verified on-chain and bank receipts. Watch their full video interviews below.
          </p>

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
              country: "United States",
              flag: "🇺🇸",
              rewards: "$12,160",
              account: "$100,000",
              youtubeId: "WwK4_iQyV54",
              duration: "6:42",
              strategy: "London Breakout & ICT",
              payoutDate: "Sep 2026",
              quote: "MaxFunded delivers the most responsive trading dashboard in the industry. MT5 execution is instantaneous with ultra-low spreads, and my first reward of $12,160 arrived in my wallet in under 60 seconds.",
              badge: "Record Payout",
            },
            {
              name: "Tom J.",
              country: "Netherlands",
              flag: "🇳🇱",
              rewards: "$10,019",
              account: "$100,000",
              youtubeId: "kJQP7kiw5Fk",
              duration: "8:15",
              strategy: "Order Flow & VWAP",
              payoutDate: "Aug 2026",
              quote: "Passed Phase 1 and Phase 2 in under 9 trading days. The static drawdown rule is honest—no trailing drawdown traps that eat your profits.",
              badge: "2-Step Graduate",
            },
            {
              name: "Andy L.",
              country: "Canada",
              flag: "🇨🇦",
              rewards: "$8,523",
              account: "$100,000",
              youtubeId: "_rE9u8U7rNk",
              duration: "5:30",
              strategy: "Gold Scalping & Supply/Demand",
              payoutDate: "Jul 2026",
              quote: "The live MT5 spreads on XAUUSD during London open are unmatched. Zero commission markups and their AI Risk Guard warned me before CPI release.",
              badge: "Verified Trader",
            },
            {
              name: "Dary B.",
              country: "Australia",
              flag: "🇦🇺",
              rewards: "$4,735",
              account: "$50,000",
              youtubeId: "u1Z0fQjG-sM",
              duration: "4:48",
              strategy: "Algo Trading & Mean Reversion",
              payoutDate: "Jun 2026",
              quote: "Got my 100% refundable fee returned on my very first payout plus 80% profit split. Scaling to the $125K tier next quarter!",
              badge: "Fee Refunded + Payout",
            },
          ].map((trader, i) => (
            <div
              key={i}
              onClick={() => window.open(`https://www.youtube.com/watch?v=${trader.youtubeId}`, '_blank', 'noopener,noreferrer')}
              className="bg-[#12151c] border border-white/10 hover:border-[#ccff00]/60 rounded-2xl p-4 transition-all duration-300 group cursor-pointer hover:shadow-[0_0_25px_rgba(204,255,0,0.12)] flex flex-col justify-between"
            >
              <div>
                {/* Video Preview Frame */}
                <div
                  className="relative h-44 rounded-xl bg-[#090b10] border border-white/10 flex flex-col justify-between p-3.5 overflow-hidden mb-4 group-hover:border-[#ccff00]/40 transition"
                >
                  <div className="flex items-center justify-between z-10">
                    <span className="px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-sm text-[10px] font-black text-[#ccff00] border border-[#ccff00]/30 uppercase tracking-wider">
                      {trader.badge}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-sm text-[10px] font-mono text-white/90 border border-white/10 flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5" />
                      {trader.duration}
                    </span>
                  </div>

                  {/* Center Play Button with ripple effect */}
                  <div className="w-12 h-12 rounded-full bg-[#ccff00] text-black flex items-center justify-center self-center shadow-neon transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_0_25px_#ccff00]">
                    <Play className="w-5 h-5 fill-current ml-0.5" />
                  </div>

                  {/* Bottom indicator */}
                  <div className="flex items-center justify-between text-[10px] font-mono text-white/70 z-10">
                    <span className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      HD 1080p
                    </span>
                    <span className="text-[#ccff00] font-bold group-hover:underline">Play Video →</span>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{trader.flag}</span>
                    <span className="font-extrabold text-white text-sm">{trader.name}</span>
                  </div>
                  <span className="text-[11px] text-neutral-400 font-medium">{trader.country}</span>
                </div>

                <p className="text-[11px] text-neutral-400 line-clamp-2 italic mb-3 leading-relaxed">
                  &quot;{trader.quote}&quot;
                </p>
              </div>

              <div>
                <div className="grid grid-cols-2 gap-2 pt-3 border-t border-white/5 text-left mb-3">
                  <div>
                    <div className="text-[9px] uppercase font-bold text-neutral-400 tracking-wider">PAYOUT EARNED</div>
                    <div className="text-base font-black text-[#ccff00]">{trader.rewards}</div>
                  </div>
                  <div>
                    <div className="text-[9px] uppercase font-bold text-neutral-400 tracking-wider">ACCOUNT</div>
                    <div className="text-sm font-bold text-white">{trader.account}</div>
                  </div>
                </div>

                <div className="w-full py-2 rounded-xl bg-white/5 group-hover:bg-[#ccff00] text-neutral-300 group-hover:text-black font-extrabold text-xs uppercase tracking-tight text-center transition flex items-center justify-center gap-1.5">
                  <Play className="w-3 h-3 fill-current" />
                  <span>Watch Video Review</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. "FAST & SAFE REWARDS" (Screenshot 7) */}
      {/* ========================================================================= */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/[0.06]">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-tight">
            Fast & Safe Rewards
          </h2>

          <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto text-left">
            <div className="flex items-center gap-4 p-5 rounded-2xl bg-[#12151c] border border-white/5">
              <div className="w-12 h-12 rounded-full bg-[#ccff00]/15 flex items-center justify-center text-[#ccff00] shrink-0">
                <DollarSign className="w-6 h-6" />
              </div>
              <div>
                <div className="text-2xl font-black text-white">$12,160</div>
                <div className="text-xs text-neutral-400">Highest single reward</div>
              </div>
            </div>

            <div className="flex items-center gap-4 p-5 rounded-2xl bg-[#12151c] border border-white/5">
              <div className="w-12 h-12 rounded-full bg-[#ccff00]/15 flex items-center justify-center text-[#ccff00] shrink-0">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <div className="text-2xl font-black text-white">Instant</div>
                <div className="text-xs text-neutral-400">Crypto payout processing</div>
              </div>
            </div>

            <div className="flex items-center gap-4 p-5 rounded-2xl bg-[#12151c] border border-white/5">
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

        {/* Recent Verified Payouts Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

          {/* Payout 1 */}
          <div className="bg-[#0d0e12] border border-white/10 hover:border-[#ccff00]/30 rounded-2xl p-5 flex flex-col gap-3 transition">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">🇦🇺</span>
                <div>
                  <div className="text-sm font-black text-white">Lark A.</div>
                  <div className="text-[11px] text-neutral-500">Australia · \$100,000 Account</div>
                </div>
              </div>
              <span className="text-[10px] font-bold text-[#ccff00] bg-[#ccff00]/10 border border-[#ccff00]/20 px-2 py-0.5 rounded-full">✓ Verified</span>
            </div>
            <div className="border-t border-white/5 pt-3 flex items-end justify-between">
              <div>
                <div className="text-[10px] text-neutral-500 uppercase font-mono">Amount Paid Out</div>
                <div className="text-2xl font-black text-white">$2,396</div>
              </div>
              <div className="text-right text-[10px] text-neutral-500 font-mono">
                <div>MXF-2026-0081</div>
                <div className="text-neutral-600">2 Oct 2026</div>
              </div>
            </div>
          </div>

          {/* Payout 2 — Featured */}
          <div className="bg-[#0d0e12] border-2 border-[#ccff00]/50 rounded-2xl p-5 flex flex-col gap-3 shadow-[0_0_30px_rgba(204,255,0,0.08)]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">🇬🇧</span>
                <div>
                  <div className="text-sm font-black text-white">Kev B.</div>
                  <div className="text-[11px] text-neutral-500">United Kingdom · \$200,000 Account</div>
                </div>
              </div>
              <span className="text-[10px] font-bold text-[#ccff00] bg-[#ccff00]/10 border border-[#ccff00]/30 px-2 py-0.5 rounded-full">✓ On-Chain</span>
            </div>
            <div className="border-t border-[#ccff00]/10 pt-3 flex items-end justify-between">
              <div>
                <div className="text-[10px] text-neutral-500 uppercase font-mono">Amount Paid Out</div>
                <div className="text-3xl font-black text-[#ccff00]">$12,160</div>
              </div>
              <div className="text-right text-[10px] text-neutral-500 font-mono">
                <div>MXF-2026-0049</div>
                <div className="text-neutral-600">6 Jul 2026</div>
              </div>
            </div>
          </div>

          {/* Payout 3 */}
          <div className="bg-[#0d0e12] border border-white/10 hover:border-[#ccff00]/30 rounded-2xl p-5 flex flex-col gap-3 transition">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">🇳🇱</span>
                <div>
                  <div className="text-sm font-black text-white">Tom de J.</div>
                  <div className="text-[11px] text-neutral-500">Netherlands · \$100,000 Account</div>
                </div>
              </div>
              <span className="text-[10px] font-bold text-[#ccff00] bg-[#ccff00]/10 border border-[#ccff00]/20 px-2 py-0.5 rounded-full">✓ Verified</span>
            </div>
            <div className="border-t border-white/5 pt-3 flex items-end justify-between">
              <div>
                <div className="text-[10px] text-neutral-500 uppercase font-mono">Amount Paid Out</div>
                <div className="text-2xl font-black text-white">$10,019</div>
              </div>
              <div className="text-right text-[10px] text-neutral-500 font-mono">
                <div>MXF-2026-0033</div>
                <div className="text-neutral-600">6 Feb 2026</div>
              </div>
            </div>
          </div>
        </div>
      </section>



      {/* Interactive Payout Calculator */}
      <PayoutCalculator />

      {/* ========================================================================= */}
      {/* 6. "SELECT YOUR ACCOUNT BALANCE" (Screenshot 9) */}
      {/* ========================================================================= */}
      <section id="challenges" className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/[0.06]">
        <div className="text-center mb-14 reveal">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#ccff00]/15 border border-[#ccff00]/30 text-[#ccff00] text-xs font-mono font-bold uppercase tracking-wider mb-4 animate-pulse">
            <span>⚡ LIMITED TIME: 45% OFF FOR NEW USERS • CODE: MAX45</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-tight">
            Select Your Account Balance
          </h2>
          <p className="mt-3 text-sm sm:text-base text-neutral-400 max-w-2xl mx-auto">
            Trade institutional evaluation capital with raw spreads. No hidden rules, zero time limits, and 100% refundable fee on your first payout.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 reveal-stagger">
          {PLANS.map((plan, i) => (
            <div
              key={i}
              className={`bento-card reveal rounded-3xl p-6 sm:p-8 flex flex-col justify-between relative group transition-all duration-300 hover:translate-y-[-4px] ${
                plan.isHighlight
                  ? "pricing-card-highlight border-2 border-[#ccff00]/60 shadow-[0_0_35px_rgba(204,255,0,0.18)] bg-[#0d0f14]"
                  : "border border-white/10 bg-[#0c0e12] hover:border-white/25"
              }`}
            >
              {/* Centered Top Badge Banner (PIVEX Style) */}
              {plan.tag && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-20">
                  <span className="px-5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-[#ccff00] text-black shadow-lg shadow-[#ccff00]/20 whitespace-nowrap block">
                    {plan.tag}
                  </span>
                </div>
              )}

              <div>
                {/* Header Block */}
                <div className="text-center pt-2 mb-6">
                  <div className="text-xs text-neutral-400 uppercase font-bold tracking-widest mb-1.5">
                    Account Size
                  </div>
                  <div className="text-3xl sm:text-4xl lg:text-5xl font-black text-white font-mono tracking-tight mb-5">
                    {plan.size}
                  </div>

                  {/* Start Now CTA Button (PIVEX Style) */}
                  <Link
                    href={`/challenges`}
                    className="w-full py-4 rounded-2xl bg-[#ccff00] hover:bg-[#b8e600] text-black font-black text-sm uppercase tracking-tight shadow-[0_0_25px_rgba(204,255,0,0.25)] hover:shadow-[0_0_35px_rgba(204,255,0,0.4)] transition-all flex items-center justify-center gap-2 transform active:scale-[0.98]"
                  >
                    <span>Start Now</span>
                    <ChevronRight className="w-4 h-4 stroke-[3]" />
                  </Link>

                  {/* Pricing with Strike-through and Instant Savings */}
                  <div className="mt-5 pt-4 border-t border-white/[0.08]">
                    <div className="text-[11px] uppercase tracking-wider font-mono text-neutral-400 mb-1">
                      One-Time Evaluation Fee
                    </div>
                    <div className="flex items-center justify-center gap-2.5">
                      <span className="text-neutral-500 line-through text-base font-mono font-semibold">
                        {plan.originalFee}
                      </span>
                      <span className="text-2xl sm:text-3xl font-black text-white font-mono">
                        {plan.fee}
                      </span>
                    </div>
                    <div className="mt-1.5 inline-flex items-center gap-1.5 text-xs font-mono font-bold text-[#ccff00]">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{plan.savings} • Code: MAX45</span>
                    </div>
                  </div>
                </div>

                {/* Elongated Specs Table with 100% Pure White Uniform Values */}
                <div className="space-y-0 divide-y divide-white/[0.07] pt-2 border-t border-white/[0.08] text-xs sm:text-sm">
                  <div className="flex items-center justify-between py-3">
                    <span className="text-neutral-300 font-medium underline decoration-dotted decoration-neutral-500 cursor-help" title="Profit target needed to pass evaluation">
                      Profit Target
                    </span>
                    <span className="font-bold text-white font-mono">{plan.target}</span>
                  </div>

                  <div className="flex items-center justify-between py-3">
                    <span className="text-neutral-300 font-medium underline decoration-dotted decoration-neutral-500 cursor-help" title="Potential reward on hitting target">
                      Potential Profit
                    </span>
                    <span className="font-bold text-white font-mono">{plan.potentialProfit}</span>
                  </div>

                  <div className="flex items-center justify-between py-3">
                    <span className="text-neutral-300 font-medium underline decoration-dotted decoration-neutral-500 cursor-help" title="Trader percentage of realized profits">
                      Profit Split
                    </span>
                    <span className="font-bold text-white font-mono">{plan.split}</span>
                  </div>

                  <div className="flex items-center justify-between py-3">
                    <span className="text-neutral-300 font-medium underline decoration-dotted decoration-neutral-500 cursor-help" title="Maximum static loss limit">
                      Maximum Loss Limit
                    </span>
                    <span className="font-bold text-white font-mono">{plan.maxLoss}</span>
                  </div>

                  <div className="flex items-center justify-between py-3">
                    <span className="text-neutral-300 font-medium underline decoration-dotted decoration-neutral-500 cursor-help" title="Maximum daily equity loss buffer">
                      Daily Loss Limit
                    </span>
                    <span className="font-bold text-white font-mono">{plan.dailyLoss}</span>
                  </div>

                  <div className="flex items-center justify-between py-3">
                    <span className="text-neutral-300 font-medium underline decoration-dotted decoration-neutral-500 cursor-help" title="No minimum trading days requirement">
                      Minimum Trading Days
                    </span>
                    <span className="font-bold text-white font-mono">{plan.minDays}</span>
                  </div>

                  <div className="flex items-center justify-between py-3">
                    <span className="text-neutral-300 font-medium underline decoration-dotted decoration-neutral-500 cursor-help" title="100% refundable upon passing">
                      Evaluation Fee
                    </span>
                    <span className="font-bold text-white font-mono">{plan.refund}</span>
                  </div>

                  <div className="flex items-center justify-between py-3">
                    <span className="text-neutral-300 font-medium underline decoration-dotted decoration-neutral-500 cursor-help" title="Bi-weekly or on-demand payouts">
                      Payout Schedule
                    </span>
                    <span className="font-bold text-white font-mono">{plan.payout}</span>
                  </div>

                  <div className="flex items-center justify-between py-3">
                    <span className="text-neutral-300 font-medium underline decoration-dotted decoration-neutral-500 cursor-help" title="MT5 execution leverage">
                      Leverage
                    </span>
                    <span className="font-bold text-white font-mono">{plan.leverage}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Industry Comparison Matrix */}
      <CompetitionComparison />

      {/* Official MaxFunded Discord Trading Floor & Community Bento Grid */}
      <DiscordCommunityBento />

      {/* ========================================================================= */}
      {/* 7. "TRADING & CHALLENGE CONDITIONS" FAQ ACCORDION (Screenshot 11) */}
      {/* ========================================================================= */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto border-t border-white/[0.06]">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-tight">
            Trading & Challenge Conditions:
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

      {/* Sticky Floating Conversion Bar */}
      <StickyBottomBar />
    </div>
  );
}


