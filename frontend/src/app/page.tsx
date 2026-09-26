import React from "react";
import Link from "next/link";
import ChallengeCard from "@/components/ChallengeCard";
import { fetchChallenges, Challenge } from "@/lib/api";
import {
  ShieldCheck,
  TrendingUp,
  Cpu,
  Award,
  CheckCircle2,
  Clock,
  BarChart3,
  HelpCircle,
} from "lucide-react";

export const revalidate = 0;

export default async function HomePage() {
  let challenges: Challenge[] = [];
  try {
    challenges = await fetchChallenges();
  } catch (err) {
    // Fallback if backend server is not running during build
    challenges = [];
  }

  return (
    <div className="space-y-24 pb-20">
      {/* HERO SECTION */}
      <section className="relative pt-20 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center overflow-hidden">
        <div className="absolute inset-0 -z-10 flex items-center justify-center">
          <div className="w-[600px] h-[350px] bg-brand-600/15 blur-[140px] rounded-full pointer-events-none" />
        </div>

        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-semibold mb-8">
          <Cpu className="w-3.5 h-3.5" />
          <span>Next-Generation Evaluation Infrastructure</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight sm:leading-none">
          Trade Your Strategy. <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-500 via-indigo-300 to-indigo-500">
            Prove Your Skill.
          </span>
        </h1>

        <p className="mt-6 text-base sm:text-lg text-gray-300 max-w-2xl mx-auto leading-relaxed">
          Complete our objective simulated trading evaluation according to published risk rules.
          Eligible traders who meet performance criteria may qualify for up to 80%–90% performance rewards.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/challenges"
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-sm bg-brand-600 hover:bg-brand-500 text-white shadow-xl shadow-brand-600/30 transition transform hover:-translate-y-0.5 active:translate-y-0 text-center"
          >
            Start Challenge
          </Link>
          <Link
            href="#how-it-works"
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-semibold text-sm bg-dark-800 hover:bg-dark-700 text-gray-200 border border-dark-700 transition text-center"
          >
            How It Works
          </Link>
        </div>

        {/* Quick Highlights */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 pt-10 border-t border-dark-800 text-left">
          <div className="p-4 rounded-xl bg-dark-850/50 border border-dark-800">
            <div className="text-xl font-bold text-white mb-1">Up to $200,000</div>
            <div className="text-xs text-gray-400">Simulated Account Balance</div>
          </div>
          <div className="p-4 rounded-xl bg-dark-850/50 border border-dark-800">
            <div className="text-xl font-bold text-emerald-400 mb-1">Up to 90%</div>
            <div className="text-xs text-gray-400">Performance Reward Split</div>
          </div>
          <div className="p-4 rounded-xl bg-dark-850/50 border border-dark-800">
            <div className="text-xl font-bold text-white mb-1">Deterministic</div>
            <div className="text-xs text-gray-400">Server-Side Risk Engine</div>
          </div>
          <div className="p-4 rounded-xl bg-dark-850/50 border border-dark-800">
            <div className="text-xl font-bold text-brand-500 mb-1">MT5 Compatible</div>
            <div className="text-xs text-gray-400">Simulated Institutional Feeds</div>
          </div>
        </div>
      </section>

      {/* CHALLENGES CATALOG SECTION */}
      <section id="challenges" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-white tracking-tight sm:text-4xl">
            Evaluation Challenges
          </h2>
          <p className="mt-3 text-sm text-gray-400 max-w-xl mx-auto">
            Select your preferred account scale. Transparent rules, fair profit targets, and verifiable evaluation stages.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {challenges.map((c) => (
            <ChallengeCard key={c.id} challenge={c} />
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-extrabold text-white tracking-tight sm:text-4xl">
            How The Evaluation Works
          </h2>
          <p className="mt-3 text-sm text-gray-400 max-w-xl mx-auto">
            A transparent 4-step trader journey from registration to reward qualification.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="bg-dark-850 border border-dark-700 p-6 rounded-2xl relative">
            <div className="w-10 h-10 rounded-xl bg-brand-500/10 text-brand-500 border border-brand-500/20 flex items-center justify-center font-bold mb-4">
              01
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Choose Challenge</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Select your simulated account scale ($10,000 to $200,000) and complete checkout.
            </p>
          </div>

          <div className="bg-dark-850 border border-dark-700 p-6 rounded-2xl relative">
            <div className="w-10 h-10 rounded-xl bg-brand-500/10 text-brand-500 border border-brand-500/20 flex items-center justify-center font-bold mb-4">
              02
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Trade By Rules</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Execute your trading strategy on MT5 while adhering to daily loss and maximum drawdown limits.
            </p>
          </div>

          <div className="bg-dark-850 border border-dark-700 p-6 rounded-2xl relative">
            <div className="w-10 h-10 rounded-xl bg-brand-500/10 text-brand-500 border border-brand-500/20 flex items-center justify-center font-bold mb-4">
              03
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Pass & Verify</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Achieve the 10% target with at least 5 trading days. Automated risk validation confirms your pass.
            </p>
          </div>

          <div className="bg-dark-850 border border-dark-700 p-6 rounded-2xl relative">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center font-bold mb-4">
              04
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Earn Rewards</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Advance to the funded stage and qualify for performance rewards up to 80%–90% of eligible gains.
            </p>
          </div>
        </div>
      </section>

      {/* TRADING RULES OVERVIEW */}
      <section id="rules" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-dark-850 to-dark-800 border border-dark-700 rounded-3xl p-8 sm:p-12">
          <div className="max-w-3xl">
            <span className="text-brand-500 text-xs font-semibold uppercase tracking-wider">Risk Architecture</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-2 mb-4">
              Objective & Transparent Trading Rules
            </h2>
            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed mb-8">
              Our Risk Engine operates deterministically on the server. Your rules are identical in code and practice.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="flex items-start space-x-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-white">5% Maximum Daily Loss</h4>
                  <p className="text-xs text-gray-400 mt-1">Calculated from starting-of-day equity. Never breach your intraday buffer.</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-white">10% Maximum Overall Drawdown</h4>
                  <p className="text-xs text-gray-400 mt-1">Static drawdown limit anchored to your initial virtual balance.</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-white">5 Minimum Trading Days</h4>
                  <p className="text-xs text-gray-400 mt-1">Ensures consistent trading discipline rather than singular luck.</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-white">No Hidden Time Limits</h4>
                  <p className="text-xs text-gray-400 mt-1">Take the time your strategy requires to reach the 10% target.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section id="faq" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-white tracking-tight">Frequently Asked Questions</h2>
          <p className="mt-2 text-xs text-gray-400">Everything you need to know about the evaluation model.</p>
        </div>

        <div className="space-y-4">
          <div className="p-5 rounded-xl bg-dark-850 border border-dark-700/70">
            <h4 className="text-sm font-semibold text-white mb-2">Is this a retail investment platform?</h4>
            <p className="text-xs text-gray-400 leading-relaxed">
              No. MaxFunded is a proprietary trading evaluation firm. All participant accounts operate in a simulated market environment with fictitious capital. We do not manage customer deposits or offer retail investment products.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-dark-850 border border-dark-700/70">
            <h4 className="text-sm font-semibold text-white mb-2">How are performance rewards funded?</h4>
            <p className="text-xs text-gray-400 leading-relaxed">
              Rewards are paid from company revenue, liquid reserves, and company-owned real trading profits according to our published Terms and Conditions.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-dark-850 border border-dark-700/70">
            <h4 className="text-sm font-semibold text-white mb-2">Can I trade using EAs and algorithmic bots?</h4>
            <p className="text-xs text-gray-400 leading-relaxed">
              Yes, algorithmic strategies and Expert Advisors (EAs) that execute legitimate trading logic are permitted. Arbitrage exploitation and latency spoofing are strictly prohibited.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
