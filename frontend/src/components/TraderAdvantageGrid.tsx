'use client';

import React from 'react';
import {
  ShieldCheck,
  TrendingUp,
  Zap,
  Calendar,
  Bot,
  RotateCcw,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

const ADVANTAGES = [
  {
    icon: ShieldCheck,
    title: 'Static Balance Drawdown',
    badge: 'ZERO TRAPS',
    description:
      'Unlike firms with trailing drawdown that creeps up and locks your profits in, our drawdown is fixed to your starting balance. Trade with true peace of mind.',
  },
  {
    icon: Zap,
    title: 'No Minimum Trading Days',
    badge: 'FAST PASS',
    description:
      'If your risk management hits the profit target on Day 1 or Day 2, you pass immediately. No waiting around for arbitrary day counters.',
  },
  {
    icon: RotateCcw,
    title: '100% Refundable Challenge Fee',
    badge: 'FEE REFUNDED',
    description:
      'Every penny you pay for your evaluation is credited back automatically into your very first profit payout disbursement. Zero net risk.',
  },
  {
    icon: Calendar,
    title: 'Weekend & News Holding Permitted',
    badge: 'UNRESTRICTED',
    description:
      'Hold your swing trades through the weekend and trade high-impact macroeconomic releases (CPI, NFP, FOMC) without fear of account breaches.',
  },
  {
    icon: Bot,
    title: 'EAs, Bots & Copy-Trading Allowed',
    badge: 'ALGO READY',
    description:
      'Automate your edge using MetaTrader 5 Expert Advisors, algorithmic hedging bots, and custom trading software without restrictive hurdles.',
  },
  {
    icon: TrendingUp,
    title: 'Scale Up To $1,000,000 Capital',
    badge: 'VIP SCALING',
    description:
      'Generate 10% profit over any 3-month window and we automatically scale your live simulated allocation by +25% up to a maximum of $1,000,000.',
  },
];

export default function TraderAdvantageGrid() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/[0.06]">
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#ccff00]/10 border border-[#ccff00]/20 text-xs font-bold text-[#ccff00] uppercase tracking-wider mb-3">
          <Sparkles className="w-4 h-4" />
          The MaxFunded Difference
        </div>
        <h2 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-tight">
          Built By Real Traders. <br />
          <span className="text-[#ccff00]">Zero Unfair Rule Traps.</span>
        </h2>
        <p className="mt-4 text-base sm:text-lg text-neutral-300 max-w-2xl mx-auto font-normal">
          We eliminated the sneaky small-print rules that cause 90% of prop firm failures. Here is why the world&apos;s best traders migrate to MaxFunded.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {ADVANTAGES.map((adv, idx) => {
          const Icon = adv.icon;
          return (
            <div
              key={idx}
              className="bg-[#111418] border border-white/10 hover:border-[#ccff00]/50 rounded-3xl p-7 sm:p-8 transition-all duration-300 group flex flex-col justify-between hover:shadow-[0_0_30px_rgba(204,255,0,0.06)]"
            >
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="w-13 h-13 rounded-2xl bg-[#161a22] border border-white/5 flex items-center justify-center text-[#ccff00] group-hover:scale-110 transition duration-300">
                    <Icon className="w-7 h-7 stroke-[2]" />
                  </div>
                  <span className="text-xs font-black uppercase tracking-wider px-3 py-1.5 rounded-lg border bg-[#ccff00]/10 text-[#ccff00] border-[#ccff00]/25">
                    {adv.badge}
                  </span>
                </div>

                <h3 className="text-xl sm:text-2xl font-black text-white group-hover:text-[#ccff00] transition mb-3">
                  {adv.title}
                </h3>
                <p className="text-sm sm:text-base text-neutral-300 leading-relaxed">
                  {adv.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-white/5 flex items-center gap-2 text-xs sm:text-sm text-neutral-200 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-[#ccff00]" />
                <span>100% Verified Rule Guarantee</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
