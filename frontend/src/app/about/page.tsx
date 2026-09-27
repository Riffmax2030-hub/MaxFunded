"use client";

import React from "react";
import Link from "next/link";
import {
  TrendingUp,
  Headphones,
  Clock,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Users,
  Award,
  Zap,
  Sparkles,
  BarChart3,
  HeartHandshake,
} from "lucide-react";

export default function AboutPage() {
  const principles = [
    {
      icon: Zap,
      title: "Simplified Challenges",
      description:
        "Easy-to-understand rules with low barriers to entry, making trading accessible to everyone regardless of experience level.",
      accent: "text-[#ccff00]",
      bg: "bg-[#ccff00]/10",
      border: "border-[#ccff00]/20",
    },
    {
      icon: Award,
      title: "Real Reward Opportunities",
      description:
        "Get paid up to 90% of profits from simulated trading accounts. We provide a genuine reward opportunity for traders who prove their skills.",
      accent: "text-amber-400",
      bg: "bg-amber-400/10",
      border: "border-amber-400/20",
    },
    {
      icon: BarChart3,
      title: "Simple Learning",
      description:
        "Improve your trading with the best educational materials and real-time dashboard analytics designed to help you succeed from day one.",
      accent: "text-sky-400",
      bg: "bg-sky-400/10",
      border: "border-sky-400/20",
    },
    {
      icon: HeartHandshake,
      title: "Customer First",
      description:
        "We listen and improve with you. Your feedback shapes our platform and helps us serve the trading community better.",
      accent: "text-purple-400",
      bg: "bg-purple-400/10",
      border: "border-purple-400/20",
    },
    {
      icon: Clock,
      title: "No Time Pressure",
      description:
        "Trade at your pace: There is no time pressure or rushed deadlines. Focus on developing your skills and risk management properly.",
      accent: "text-emerald-400",
      bg: "bg-emerald-400/10",
      border: "border-emerald-400/20",
    },
    {
      icon: ShieldCheck,
      title: "Transparent Approach",
      description:
        "Clear, transparent path for traders to prove themselves and access capital through skills, not connections.",
      accent: "text-cyan-400",
      bg: "bg-cyan-400/10",
      border: "border-cyan-400/20",
    },
  ];

  return (
    <div className="min-h-screen bg-[#070809] text-white selection:bg-[#ccff00] selection:text-black">
      {/* ========================================================================= */}
      {/* HERO SECTION */}
      {/* ========================================================================= */}
      <section className="relative pt-24 pb-20 px-4 sm:px-6 lg:px-8 text-center overflow-hidden border-b border-white/[0.06]">
        {/* Soft green ambient glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-[#ccff00]/[0.04] rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.05] border border-white/10 text-neutral-300 text-xs font-bold uppercase tracking-wider mb-8">
            <Sparkles size={13} className="text-[#ccff00]" />
            Empowering Modern Traders
          </div>

          {/* High-Contrast Crisp Heading */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black mb-6 tracking-tight text-white leading-[1.15]">
            Max<span className="text-[#ccff00]">Funded</span>: Empowering Traders Everywhere
          </h1>

          <p className="text-neutral-300 text-lg sm:text-xl leading-relaxed max-w-3xl mx-auto font-medium">
            At MaxFunded, we believe that trading should be accessible, fair, and rewarding - no matter your background or experience level.
          </p>

          {/* 3 Core Highlight Pillars */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-12 max-w-3xl mx-auto">
            <div className="bg-[#0e1014] border border-white/[0.08] rounded-2xl p-6 shadow-xl text-center">
              <p className="text-3xl sm:text-4xl font-black text-[#ccff00]">80% - 90%</p>
              <p className="text-neutral-400 text-sm font-semibold mt-1">Profit Share for Traders</p>
            </div>
            <div className="bg-[#0e1014] border border-white/[0.08] rounded-2xl p-6 shadow-xl text-center">
              <p className="text-3xl sm:text-4xl font-black text-white">24/7</p>
              <p className="text-neutral-400 text-sm font-semibold mt-1">Educational & Live Support</p>
            </div>
            <div className="bg-[#0e1014] border border-white/[0.08] rounded-2xl p-6 shadow-xl text-center">
              <p className="text-3xl sm:text-4xl font-black text-[#ccff00]">No Rush</p>
              <p className="text-neutral-400 text-sm font-semibold mt-1">Trade at Your Own Pace</p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* OUR MISSION */}
      {/* ========================================================================= */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <div className="bg-[#0d0f13] border border-white/[0.08] rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden">
          <div className="max-w-3xl">
            <span className="text-xs font-black uppercase tracking-widest text-[#ccff00] mb-3 block">
              Our Mission
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-6">
              Challenging Outdated Trading Models
            </h2>
            <p className="text-neutral-300 text-base sm:text-lg leading-relaxed mb-6 font-normal">
              MaxFunded was founded to challenge outdated trading models. We give traders a clear, transparent path to prove their skill, get funded, and earn real monetary rewards based on simulated trading profit based on performance.
            </p>
            <p className="text-neutral-400 text-base leading-relaxed mb-8">
              We use smart systems, clear rules, and a transparent reward structure that put traders first. Every rule is calculated deterministically with zero hidden constraints.
            </p>
            <Link
              href="/challenges"
              className="inline-flex items-center gap-2 bg-[#ccff00] hover:bg-[#b3e600] text-black font-extrabold px-8 py-4 rounded-full text-sm sm:text-base transition-all transform hover:scale-[1.02] shadow-[0_0_25px_rgba(204,255,0,0.3)]"
            >
              Start Your Journey <ArrowRight size={17} />
            </Link>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* WHAT MAKES US DIFFERENT */}
      {/* ========================================================================= */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto border-t border-white/[0.06]">
        <div className="text-center mb-14">
          <span className="text-xs font-black uppercase tracking-widest text-[#ccff00] mb-2 block">
            Core Principles
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-3">
            What Makes Us Different
          </h2>
          <p className="text-neutral-400 text-base max-w-xl mx-auto">
            The core principles that set MaxFunded apart in the trading industry.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {principles.map((p) => {
            const Icon = p.icon;
            return (
              <div
                key={p.title}
                className={`bg-[#0d0f13] border ${p.border} rounded-2xl p-7 transition-all duration-200 hover:border-white/20 hover:-translate-y-1 shadow-lg flex flex-col justify-between`}
              >
                <div>
                  <div className={`w-12 h-12 rounded-xl ${p.bg} flex items-center justify-center mb-5`}>
                    <Icon size={22} className={p.accent} />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{p.title}</h3>
                  <p className="text-neutral-400 text-sm leading-relaxed">{p.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* OUR BELIEF & WHERE WE ARE GOING */}
      {/* ========================================================================= */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto border-t border-white/[0.06]">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          {/* Card 1: Our Belief */}
          <div className="bg-[#0d0f13] border border-white/[0.08] rounded-3xl p-8 sm:p-10 shadow-xl flex flex-col justify-between">
            <div>
              <span className="text-xs font-black uppercase tracking-widest text-[#ccff00] mb-2 block">
                Our Belief
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-white mb-4">
                Trading Shouldn&apos;t be Exclusive
              </h3>
              <p className="text-neutral-300 text-base leading-relaxed mb-4">
                At MaxFunded, we are on a mission to democratize trading. From educational materials to expanding our trading tools and programs, everything we do is focused on helping more people turn trading skills into income opportunity.
              </p>
              <p className="text-neutral-400 text-sm leading-relaxed">
                Talent is universal, but capital historically was not. We bridge that gap by funding consistency rather than net worth.
              </p>
            </div>
            <div className="mt-8 pt-6 border-t border-white/5 flex items-center gap-3 text-neutral-400 text-xs font-medium">
              <CheckCircle2 size={16} className="text-[#ccff00]" />
              Skill-driven access for global traders
            </div>
          </div>

          {/* Card 2: The Future We Are Building */}
          <div className="bg-[#0d0f13] border border-white/[0.08] rounded-3xl p-8 sm:p-10 shadow-xl flex flex-col justify-between">
            <div>
              <span className="text-xs font-black uppercase tracking-widest text-[#ccff00] mb-2 block">
                The Future We Are Building
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-white mb-4">
                Where We Are Going
              </h3>
              <p className="text-neutral-300 text-base leading-relaxed mb-4">
                We are building a global trading ecosystem where skill is the only requirement. With expanded funding tiers, advanced analytics tools, and a growing community of profitable traders, our vision is to make MaxFunded the platform where the next generation of traders launches their careers.
              </p>
              <p className="text-neutral-400 text-sm leading-relaxed">
                Our roadmap includes automated MetaTrader integrations, instant payouts, and comprehensive performance analytics.
              </p>
            </div>
            <div className="mt-8 pt-6 border-t border-white/5 flex items-center gap-3 text-neutral-400 text-xs font-medium">
              <CheckCircle2 size={16} className="text-[#ccff00]" />
              Expanding tiers up to $1,000,000 scaling
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* FINAL CTA: JOIN THE MOVEMENT */}
      {/* ========================================================================= */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 text-center bg-[#090b0e] border-t border-white/[0.08]">
        <div className="max-w-2xl mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-[#ccff00]/10 border border-[#ccff00]/20 flex items-center justify-center mx-auto mb-6 text-[#ccff00]">
            <Sparkles size={30} />
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-4">
            Join The Movement
          </h2>
          <p className="text-neutral-300 text-base sm:text-lg mb-8 leading-relaxed">
            Be part of the revolution that is making professional trading accessible to everyone, everywhere.
          </p>
          <Link
            href="/challenges"
            className="inline-flex items-center gap-2 bg-[#ccff00] hover:bg-[#b3e600] text-black font-black px-10 py-4 rounded-full text-base transition-all transform hover:scale-[1.03] shadow-[0_0_35px_rgba(204,255,0,0.35)]"
          >
            Start Challenge Now <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </div>
  );
}
