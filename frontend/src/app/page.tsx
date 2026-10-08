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
      tag: "Best Value",
      isHighlight: true,
      target: "8% / 5%",
      split: "80% – 90%",
      maxLoss: "10% Static",
      dailyLoss: "5% Static",
      minDays: "0 Days (No Min Days)",
      payout: "Bi-Weekly / 1-Day",
      refund: "100% Refundable",
    },
    {
      size: "$50,000",
      fee: "$164.00",
      originalFee: "$299.00",
      discountPct: "45% OFF",
      savings: "Save $135",
      tag: "High Demand",
      isHighlight: false,
      target: "8% / 5%",
      split: "80% – 90%",
      maxLoss: "10% Static",
      dailyLoss: "5% Static",
      minDays: "0 Days (No Min Days)",
      payout: "Bi-Weekly / 1-Day",
      refund: "100% Refundable",
    },
    {
      size: "$25,000",
      fee: "$98.00",
      originalFee: "$179.00",
      discountPct: "45% OFF",
      savings: "Save $81",
      tag: "Most Popular",
      isHighlight: true,
      target: "8% / 5%",
      split: "80% – 90%",
      maxLoss: "10% Static",
      dailyLoss: "5% Static",
      minDays: "0 Days (No Min Days)",
      payout: "Bi-Weekly / 1-Day",
      refund: "100% Refundable",
    },
    {
      size: "$10,000",
      fee: "$49.00",
      originalFee: "$89.00",
      discountPct: "45% OFF",
      savings: "Save $40",
      tag: "Starter",
      isHighlight: false,
      target: "8% / 5%",
      split: "80% – 90%",
      maxLoss: "10% Static",
      dailyLoss: "5% Static",
      minDays: "0 Days (No Min Days)",
      payout: "Bi-Weekly / 1-Day",
      refund: "100% Refundable",
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
      {/* 1. HERO SECTION */}
      {/* ========================================================================= */}
      <section className="relative pt-12 sm:pt-16 pb-16 sm:pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center overflow-hidden">
        {/* Animated ambient glow orbs */}
        <div className="glow-orb absolute top-[-80px] left-[15%] w-[550px] h-[550px] bg-gradient-to-br from-[#ccff00]/[0.09] to-transparent blur-[120px] pointer-events-none -z-10 rounded-full" />
        <div className="glow-orb-delay absolute top-[-60px] right-[15%] w-[500px] h-[500px] bg-gradient-to-bl from-[#ccff00]/[0.07] to-transparent blur-[100px] pointer-events-none -z-10 rounded-full" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[200px] bg-gradient-to-t from-[#ccff00]/[0.04] to-transparent blur-3xl pointer-events-none -z-10" />

        {/* Live Social Proof Badge */}
        <div className="inline-flex flex-wrap items-center justify-center gap-2 px-4 py-1.5 rounded-full bg-[#111418] border border-white/10 text-xs text-neutral-300 mb-8 select-none shadow-lg">
          <div className="flex items-center gap-1.5 pr-2 border-r border-white/10">
            <span className="w-2 h-2 rounded-full bg-[#ccff00] animate-pulse" />
            <span className="font-bold text-white">$1,489,240+ Paid Out</span>
          </div>
          <div className="flex items-center gap-1.5 pl-1">
            <span className="font-bold text-white">4.8 / 5</span>
            <div className="flex items-center space-x-0.5">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="w-3.5 h-3.5 bg-[#00b67a] flex items-center justify-center rounded-[2px]">
                  <Star className="w-2 h-2 text-white fill-current" />
                </div>
              ))}
            </div>
            <span className="font-bold text-neutral-400 text-[11px]">Trustpilot</span>
          </div>
        </div>

        {/* High-Impact Master Headline */}
        <h1 className="animate-fade-up text-4xl sm:text-6xl lg:text-7xl font-black text-white max-w-5xl mx-auto leading-[1.04] uppercase" style={{ letterSpacing: '-0.02em' }}>
          Trade Up To <span className="text-[#ccff00] neon-glow-text">$200,000</span> Capital. <br />
          Keep Up To <span className="text-[#ccff00] neon-glow-text">90% Profits</span>.
        </h1>

        {/* Action Verbs & Value Subtitle */}
        <p className="mt-6 text-base sm:text-xl text-neutral-300 max-w-3xl mx-auto font-medium leading-relaxed">
          Zero personal capital at risk. Trade institutional evaluation capital with raw MT5 spreads,
          transparent static drawdown rules, and on-demand crypto or bank payouts.
        </p>

        {/* Key Guarantee Badges */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs font-bold text-neutral-300">
          <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-[#ccff00]" /> Zero Time Limits
          </span>
          <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#ccff00]" /> 100% Refundable Fee
          </span>
          <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 flex items-center gap-1.5">
            <Coins className="w-3.5 h-3.5 text-[#ccff00]" /> Up to 90% Profit Split
          </span>
          <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-[#ccff00]" /> Scale to $1,000,000
          </span>
        </div>

        {/* Glowing Dual Action Hero CTAs */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/challenges"
            className="btn-neon w-full sm:w-auto px-10 py-4 rounded-xl bg-[#ccff00] hover:bg-[#b3e600] text-black font-black text-sm uppercase tracking-tight shadow-neon transition flex items-center justify-center gap-2"
          >
            <span>Start Evaluation Challenge</span>
            <ChevronRight className="w-5 h-5 stroke-[3]" />
          </Link>

          <Link
            href="/challenges"
            className="btn-neon w-full sm:w-auto px-8 py-4 rounded-xl bg-[#111418] hover:bg-[#181c24] text-white hover:text-[#ccff00] font-black text-sm uppercase tracking-tight border border-white/10 hover:border-[#ccff00]/40 transition flex items-center justify-center gap-2"
          >
            <Zap className="w-4 h-4 text-[#ccff00]" />
            <span>Instant Funded (Skip Evaluation)</span>
          </Link>
        </div>

        {/* 4 Feature Value Pillars */}
        <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto text-center">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 mb-3 flex items-center justify-center text-[#ccff00]">
              <GraduationCap className="w-9 h-9 stroke-[2]" />
            </div>
            <div className="font-black text-base text-white">Institutional MT5</div>
            <div className="text-xs text-neutral-400 mt-1">Raw Spreads from 0.0 Pips</div>
          </div>

          <div className="flex flex-col items-center">
            <div className="w-12 h-12 mb-3 flex items-center justify-center text-[#ccff00]">
              <Bot className="w-9 h-9 stroke-[2]" />
            </div>
            <div className="font-black text-base text-white">AI Risk Guard</div>
            <div className="text-xs text-neutral-400 mt-1">Pre-Breach Drawdown Radar</div>
          </div>

          <div className="flex flex-col items-center">
            <div className="w-12 h-12 mb-3 flex items-center justify-center text-[#ccff00]">
              <DollarSign className="w-9 h-9 stroke-[2]" />
            </div>
            <div className="font-black text-base text-white">Up to $200,000</div>
            <div className="text-xs text-neutral-400 mt-1">Scale up to $1,000,000 VIP</div>
          </div>

          <div className="flex flex-col items-center">
            <div className="w-12 h-12 mb-3 flex items-center justify-center text-[#ccff00]">
              <Coins className="w-9 h-9 stroke-[2]" />
            </div>
            <div className="font-black text-base text-white">Keep 80% to 90%</div>
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
                  Hit a simple 8% profit target with 0 minimum trading days, 10% static drawdown, and zero time pressure.
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
              className={`bento-card reveal p-6 sm:p-7 flex flex-col justify-between relative group ${
                plan.isHighlight
                  ? "pricing-card-highlight border-2 border-[#ccff00]/60 shadow-[0_0_35px_rgba(204,255,0,0.18)]"
                  : ""
              }`}
            >
              <div>
                {/* Top Badge */}
                <div className="h-7 mb-3 flex items-center justify-between">
                  {plan.tag ? (
                    <span className="px-3.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-[#ccff00] text-black">
                      {plan.tag}
                    </span>
                  ) : (
                    <span className="text-[11px] text-neutral-500 font-mono">STANDARD</span>
                  )}
                  <span className="text-[11px] font-mono font-bold text-[#ccff00] bg-[#ccff00]/10 px-2 py-0.5 rounded-md border border-[#ccff00]/25">
                    {plan.discountPct}
                  </span>
                </div>

                <div className="text-center">
                  <div className="text-xs text-neutral-400 uppercase font-bold tracking-wider mb-1">
                    Account Size
                  </div>
                  <div className="text-3xl sm:text-4xl font-black text-white mb-5">
                    {plan.size}
                  </div>

                  {/* Start Now Button */}
                  <Link
                    href={`/challenges`}
                    className="btn-neon w-full py-3.5 rounded-xl bg-[#ccff00] hover:bg-[#b3e600] text-black font-black text-sm uppercase tracking-tight shadow-neon transition block text-center"
                  >
                    Start Now
                  </Link>

                  {/* Catchy Price with Strike-through and Savings */}
                  <div className="mt-4 mb-6 pt-3 border-t border-white/5">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <span className="text-sm line-through text-neutral-500 font-mono font-bold">{plan.originalFee}</span>
                      <span className="text-2xl font-black text-white">{plan.fee}</span>
                    </div>
                    <span className="text-[11px] text-[#ccff00] font-bold block">{plan.savings} • 100% Refundable Fee</span>
                  </div>
                </div>

                {/* Specs Table — Sweet Trader-Desired Rules */}
                <div className="space-y-3 text-xs text-neutral-300 pt-3 border-t border-white/5">
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-400">Profit Target</span>
                    <span className="font-bold text-white">{plan.target}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-neutral-400">Profit Split</span>
                    <span className="font-bold text-[#ccff00]">{plan.split}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-neutral-400">Static Max Loss</span>
                    <span className="font-bold text-white">{plan.maxLoss}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-neutral-400">Daily Loss Limit</span>
                    <span className="font-bold text-white">{plan.dailyLoss}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-neutral-400">Min Trading Days</span>
                    <span className="font-bold text-[#ccff00]">{plan.minDays}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-neutral-400">Challenge Fee Refund</span>
                    <span className="font-bold text-white">{plan.refund}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-neutral-400">Payout Schedule</span>
                    <span className="font-bold text-white">{plan.payout}</span>
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


