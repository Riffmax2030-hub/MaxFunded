"use client";

import Link from "next/link";

const rules = [
  {
    category: "Profit Target",
    icon: "🎯",
    items: [
      {
        label: "Phase Target",
        value: "10% of account size",
        note: "Must be achieved on net equity (profits minus losses).",
      },
      {
        label: "Counting Method",
        value: "Net floating + realized P&L",
        note: "Open positions count toward the target in real time.",
      },
    ],
  },
  {
    category: "Daily Loss Limit",
    icon: "📉",
    items: [
      {
        label: "Maximum Daily Loss",
        value: "5% of account balance",
        note: "Calculated from the start-of-day balance. Resets at 00:00 server time.",
      },
      {
        label: "Trigger",
        value: "Immediate breach",
        note: "Breaching the daily limit at any point during the session — including open positions — results in immediate challenge termination.",
      },
    ],
  },
  {
    category: "Maximum Drawdown",
    icon: "⬇️",
    items: [
      {
        label: "Maximum Total Drawdown",
        value: "10% of initial account balance",
        note: "Trailing maximum drawdown from the highest equity peak reached. Does NOT reset.",
      },
      {
        label: "Calculation Basis",
        value: "From initial balance",
        note: "E.g., for a \$100,000 account, the absolute floor is \$90,000 regardless of profits made.",
      },
    ],
  },
  {
    category: "Minimum Trading Days",
    icon: "📅",
    items: [
      {
        label: "Minimum Days Required",
        value: "5 calendar days with at least one closed trade",
        note: "Days with only open floating positions do not count. You must close at least one trade per counted day.",
      },
    ],
  },
  {
    category: "Time Limit",
    icon: "⏱️",
    items: [
      {
        label: "Maximum Duration",
        value: "No time limit",
        note: "You may trade at your own pace as long as your account remains active.",
      },
    ],
  },
  {
    category: "Leverage",
    icon: "⚡",
    items: [
      {
        label: "Maximum Leverage",
        value: "Defined per instrument (see Trading Conditions)",
        note: "Leverage limits apply to all instruments. Using leverage beyond permitted levels may result in position closure.",
      },
    ],
  },
  {
    category: "Prohibited Practices",
    icon: "🚫",
    items: [
      {
        label: "Latency Arbitrage",
        value: "Prohibited",
        note: "Strategies that exploit quote latency or platform data feeds are not permitted.",
      },
      {
        label: "Coordinated Group Trading",
        value: "Prohibited",
        note: "Multiple accounts placing identical opposing trades to guarantee profits is considered gaming the evaluation.",
      },
      {
        label: "Copy Trading (External Signals)",
        value: "Prohibited",
        note: "Automated copying from external signal services is not allowed. You must be the sole decision-maker.",
      },
      {
        label: "News Trading (High-Impact, Restricted)",
        value: "Restricted",
        note: "Opening new positions within 2 minutes before or after a scheduled high-impact news event may be flagged during review.",
      },
    ],
  },
  {
    category: "Allowed Practices",
    icon: "✅",
    items: [
      {
        label: "EAs / Trading Bots",
        value: "Allowed (with conditions)",
        note: "Personal algorithmic strategies are allowed provided they do not exploit platform latency or engage in prohibited practices.",
      },
      {
        label: "Hedging",
        value: "Allowed",
        note: "Hedging within the same account is permitted.",
      },
      {
        label: "Weekend Holding",
        value: "Allowed",
        note: "You may hold positions over weekends and holidays at your own risk.",
      },
    ],
  },
];

export default function RulesPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">

      {/* Hero */}
      <section className="pt-24 pb-12 px-4 text-center bg-gradient-to-b from-gray-900 to-gray-950">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
          Challenge <span className="text-emerald-400">Rules</span>
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          Every rule is clearly defined before you trade. No surprises. No
          ambiguity. Violate none of these and your path to funding is clear.
        </p>
      </section>

      {/* Rules Grid */}
      <section className="max-w-5xl mx-auto px-4 pb-24 space-y-8">
        {rules.map((section) => (
          <div
            key={section.category}
            className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden"
          >
            <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-800 bg-gray-900/80">
              <span className="text-2xl">{section.icon}</span>
              <h2 className="text-lg font-bold text-white">
                {section.category}
              </h2>
            </div>
            <div className="divide-y divide-gray-800">
              {section.items.map((item) => (
                <div
                  key={item.label}
                  className="px-6 py-5 grid md:grid-cols-3 gap-2"
                >
                  <div className="text-sm font-semibold text-gray-300">
                    {item.label}
                  </div>
                  <div className="text-sm font-bold text-emerald-400">
                    {item.value}
                  </div>
                  <div className="text-xs text-gray-500 leading-relaxed">
                    {item.note}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Disclaimer */}
        <div className="bg-amber-950/20 border border-amber-700/30 rounded-xl p-6">
          <p className="text-amber-400 text-xs font-semibold uppercase tracking-wider mb-2">
            Important Notice
          </p>
          <p className="text-gray-400 text-sm leading-relaxed">
            Rules are subject to change. The version in effect at the time of
            your challenge purchase applies to your evaluation. Any updates
            after your purchase do not retroactively affect your active
            challenge unless otherwise stated. Please read the full{" "}
            <a href="/terms" className="text-emerald-400 underline">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="/trading-conditions" className="text-emerald-400 underline">
              Trading Conditions
            </a>{" "}
            before purchasing.
          </p>
        </div>
      </section>
    </div>
  );
}
