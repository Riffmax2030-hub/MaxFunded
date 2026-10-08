"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Target,
  CreditCard,
  BarChart2,
  TrendingUp,
  CheckCircle2,
  DollarSign,
  ChevronDown,
  ArrowRight,
  ShieldCheck,
  Zap,
  Clock,
} from "lucide-react";

const steps = [
  {
    number: "01",
    title: "Choose Your Challenge",
    description:
      "Select a funded account size from $10,000 to $200,000. Transparent rules — profit targets, drawdown limits, and 0 minimum trading days — all set before you begin.",
    icon: Target,
    color: "text-[#ccff00]",
    bg: "bg-[#ccff00]/10",
    border: "border-[#ccff00]/20",
  },
  {
    number: "02",
    title: "Pay the Evaluation Fee",
    description:
      "A one-time fee grants access to your simulated trading account. Fees vary by account size. No subscriptions, no hidden charges, no tricks.",
    icon: CreditCard,
    color: "text-blue-400",
    bg: "bg-blue-400/10",
    border: "border-blue-400/20",
  },
  {
    number: "03",
    title: "Receive MT5 Credentials",
    description:
      "You receive MetaTrader 5 login credentials for a fully simulated trading environment. Trade exactly as you would with real capital — instantly.",
    icon: Zap,
    color: "text-violet-400",
    bg: "bg-violet-400/10",
    border: "border-violet-400/20",
  },
  {
    number: "04",
    title: "Trade & Hit Your Target",
    description:
      "Reach the profit target while respecting the daily loss limit and maximum drawdown. Zero minimum trading days — pass whenever you are ready.",
    icon: TrendingUp,
    color: "text-amber-400",
    bg: "bg-amber-400/10",
    border: "border-amber-400/20",
  },
  {
    number: "05",
    title: "Pass Compliance Review",
    description:
      "Our compliance team reviews your trading activity — consistency, rule adherence, and prohibited strategy checks. Fast review, transparent decisions.",
    icon: ShieldCheck,
    color: "text-cyan-400",
    bg: "bg-cyan-400/10",
    border: "border-cyan-400/20",
  },
  {
    number: "06",
    title: "Get Funded & Earn Payouts",
    description:
      "Approved traders receive a funded account and begin earning profit splits up to 90%. Payouts processed on a defined schedule — your money, your terms.",
    icon: DollarSign,
    color: "text-[#ccff00]",
    bg: "bg-[#ccff00]/10",
    border: "border-[#ccff00]/20",
  },
];

const faqs = [
  {
    q: "Is this real money trading?",
    a: "No. The evaluation phase is conducted on a fully simulated platform. Your performance is assessed, and if you pass, you may be offered a funded account where profits are shared with you according to the payout policy.",
  },
  {
    q: "Can I retake a failed challenge?",
    a: "Yes. If you violate any rule (daily loss, drawdown, or prohibited strategy), your challenge is marked breached. You may purchase a new challenge at any time and start fresh.",
  },
  {
    q: "Are there any prohibited strategies?",
    a: "Yes. High-frequency algorithmic scalping designed to exploit platform latency, copy trading from signal services, and coordinated group trading to manipulate results are prohibited. Full details are in Trading Conditions.",
  },
  {
    q: "How long does the evaluation take?",
    a: "There is no maximum time limit and zero minimum trading days. As soon as you hit your profit target without breaching drawdown rules, your evaluation passes.",
  },
  {
    q: "What markets can I trade?",
    a: "Forex pairs, indices, commodities, and cryptocurrencies — as listed in your account's trading conditions. Instrument availability may vary by jurisdiction.",
  },
  {
    q: "When do I get paid?",
    a: "Once funded and compliant, you may request a payout after the minimum payout period (typically 14 days). Payouts are processed within 1–3 business days.",
  },
];

const lifecycle = [
  "Payment Confirmed",
  "Provisioning",
  "Active",
  "Target Reached",
  "Under Review",
  "Passed",
  "Funded",
  "Payout Paid",
];

const stats = [
  { value: "$2.4M+", label: "Total Payouts" },
  { value: "4,800+", label: "Funded Traders" },
  { value: "90%", label: "Max Profit Split" },
  { value: "14 Days", label: "Avg. Payout Time" },
];

export default function HowItWorksPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-[#070809] text-white">
      {/* ── Hero ── */}
      <section className="relative pt-28 pb-20 px-4 text-center overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#ccff00]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-[#ccff00]/10 border border-[#ccff00]/20 text-[#ccff00] text-xs font-semibold px-4 py-1.5 rounded-full mb-6 uppercase tracking-widest">
            <BarChart2 size={12} /> How It Works
          </div>
          <h1 className="text-4xl md:text-6xl font-black leading-tight mb-5">
            Prove Your Edge.{" "}
            <span className="text-[#ccff00]">Get Funded.</span>
          </h1>
          <p className="text-neutral-400 text-lg max-w-xl mx-auto mb-8">
            A transparent, merit-based evaluation. No politics — just your
            trading performance. Six steps to capital.
          </p>
          <Link
            href="/challenges"
            className="inline-flex items-center gap-2 bg-[#ccff00] hover:bg-[#b3e600] text-black font-bold px-8 py-3.5 rounded-full text-sm transition-all hover:shadow-[0_0_30px_rgba(204,255,0,0.4)]"
          >
            Start Your Challenge <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* ── Stats Banner ── */}
      <section className="border-y border-white/5 bg-white/[0.02] py-10 px-4">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map((s) => (
            <div key={s.label}>
              <p className="text-3xl font-black text-[#ccff00]">{s.value}</p>
              <p className="text-neutral-500 text-sm mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Steps ── */}
      <section className="max-w-6xl mx-auto px-4 py-24">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-black mb-3">
            6 Steps to a <span className="text-[#ccff00]">Funded Account</span>
          </h2>
          <p className="text-neutral-500 max-w-lg mx-auto">
            Every step is transparent. No surprises, no hidden gates.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.number}
                className={`relative bg-[#0d0e10] border ${step.border} rounded-2xl p-7 hover:border-opacity-60 transition-all group`}
              >
                {/* Step number watermark */}
                <span className="absolute top-4 right-5 text-5xl font-black text-white/[0.04] select-none">
                  {step.number}
                </span>
                <div className={`w-11 h-11 rounded-xl ${step.bg} flex items-center justify-center mb-5`}>
                  <Icon size={20} className={step.color} />
                </div>
                <span className={`text-xs font-bold uppercase tracking-widest ${step.color} mb-2 block`}>
                  Step {step.number}
                </span>
                <h3 className="text-lg font-bold text-white mb-3">{step.title}</h3>
                <p className="text-neutral-500 text-sm leading-relaxed">{step.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Evaluation Lifecycle ── */}
      <section className="bg-[#0a0b0d] border-y border-white/5 py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-black mb-2">The Evaluation Lifecycle</h2>
            <p className="text-neutral-500 text-sm">
              Every challenge follows a defined state machine — no ambiguity.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {lifecycle.map((state, i, arr) => (
              <div key={state} className="flex items-center gap-3">
                <div
                  className={`rounded-lg px-4 py-2 text-xs font-semibold border whitespace-nowrap ${
                    state === "Funded" || state === "Payout Paid"
                      ? "bg-[#ccff00]/10 border-[#ccff00]/30 text-[#ccff00]"
                      : state === "Active"
                      ? "bg-blue-500/10 border-blue-500/30 text-blue-300"
                      : "bg-white/[0.04] border-white/10 text-neutral-400"
                  }`}
                >
                  {state}
                </div>
                {i < arr.length - 1 && (
                  <span className="text-neutral-700 text-sm">→</span>
                )}
              </div>
            ))}
          </div>
          <p className="text-center text-xs text-neutral-700 mt-6">
            A violation at any active stage results in a BREACHED status. Traders may purchase a new challenge at any time.
          </p>
        </div>
      </section>

      {/* ── Trust Pillars ── */}
      <section className="max-w-5xl mx-auto px-4 py-20">
        <div className="grid md:grid-cols-3 gap-5">
          {[
            { icon: Zap, title: "Instant MT5 Credentials", desc: "Provisioned automatically within minutes of payment. No waiting, no manual setup." },
            { icon: ShieldCheck, title: "Zero Personal Risk", desc: "All trading is simulated. Your personal capital is never at risk during evaluation." },
            { icon: Clock, title: "Fast Payouts", desc: "Funded traders receive payouts within 14 days on average. Transparent, reliable, always on time." },
          ].map((p) => {
            const Icon = p.icon;
            return (
              <div key={p.title} className="bg-[#0d0e10] border border-white/[0.06] rounded-2xl p-7 text-center">
                <div className="w-12 h-12 bg-[#ccff00]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon size={20} className="text-[#ccff00]" />
                </div>
                <h3 className="text-white font-bold mb-2">{p.title}</h3>
                <p className="text-neutral-500 text-sm leading-relaxed">{p.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="max-w-3xl mx-auto px-4 pb-28">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-black mb-2">Common Questions</h2>
          <p className="text-neutral-500 text-sm">Everything you need to know before you start.</p>
        </div>
        <div className="space-y-3">
          {faqs.map((item, i) => (
            <div
              key={i}
              className="bg-[#0d0e10] border border-white/[0.06] rounded-xl overflow-hidden"
            >
              <button
                className="w-full text-left px-6 py-5 flex items-center justify-between gap-4 hover:bg-white/[0.02] transition"
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
              >
                <span className="font-semibold text-white text-sm">{item.q}</span>
                <ChevronDown
                  size={16}
                  className={`text-neutral-500 flex-shrink-0 transition-transform ${openFaq === i ? "rotate-180 text-[#ccff00]" : ""}`}
                />
              </button>
              {openFaq === i && (
                <div className="px-6 pb-5 text-neutral-400 text-sm leading-relaxed border-t border-white/[0.04]">
                  <div className="pt-4">{item.a}</div>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="bg-[#0a0b0d] border-t border-white/5 py-20 px-4 text-center">
        <div className="max-w-xl mx-auto">
          <CheckCircle2 size={48} className="text-[#ccff00] mx-auto mb-5" />
          <h2 className="text-3xl font-black mb-4">
            Ready to Prove Your Edge?
          </h2>
          <p className="text-neutral-400 mb-8">
            Join thousands of funded traders already earning with MaxFunded.
            Zero personal risk. Up to 90% profit split.
          </p>
          <Link
            href="/challenges"
            className="inline-flex items-center gap-2 bg-[#ccff00] hover:bg-[#b3e600] text-black font-bold px-10 py-4 rounded-full text-base transition-all hover:shadow-[0_0_40px_rgba(204,255,0,0.4)]"
          >
            Get Started Now <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </div>
  );
}
