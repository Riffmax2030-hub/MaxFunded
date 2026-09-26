"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const steps = [
  {
    number: "01",
    title: "Choose Your Challenge",
    description:
      "Select a funded account size from \$10,000 to \$200,000. Each tier has transparent rules — profit targets, drawdown limits, and minimum trading days — all set before you begin.",
    icon: "🎯",
  },
  {
    number: "02",
    title: "Pay the Evaluation Fee",
    description:
      "A one-time, non-refundable evaluation fee grants access to your simulated trading account. Fees vary by account size. No subscriptions, no hidden charges.",
    icon: "💳",
  },
  {
    number: "03",
    title: "Receive Your Simulated Account",
    description:
      "You receive MT5 login credentials for a fully simulated trading environment. Trade during the evaluation exactly as you would with real capital.",
    icon: "📊",
  },
  {
    number: "04",
    title: "Trade & Hit Your Target",
    description:
      "Reach the profit target while respecting the daily loss limit and maximum drawdown. Meet the minimum trading days requirement. Your performance is monitored in real time.",
    icon: "📈",
  },
  {
    number: "05",
    title: "Pass Review",
    description:
      "Once your target is reached, our compliance team reviews your trading activity. We check for consistency, rule adherence, and prohibited strategy usage.",
    icon: "✅",
  },
  {
    number: "06",
    title: "Get Funded & Earn Payouts",
    description:
      "Approved traders receive a funded account and begin earning profit splits according to their plan. Payouts are processed on a defined schedule after payout requests are submitted and approved.",
    icon: "💰",
  },
];

const faqs = [
  {
    q: "Is this real money trading?",
    a: "No. The evaluation phase is conducted on a fully simulated platform. Your performance is assessed, and if you pass, you may be offered a funded account where profits are shared with you according to the payout policy.",
  },
  {
    q: "Can I retake a failed challenge?",
    a: "Yes. If you violate any rule (daily loss, drawdown, or prohibited strategy), your challenge is marked breached. You may purchase a new challenge at any time.",
  },
  {
    q: "Are there any prohibited strategies?",
    a: "Yes. Strategies including high-frequency algorithmic scalping designed to exploit platform latency, copy trading from signal services, and coordinated group trading intended to manipulate results are prohibited. Full details are in the Trading Conditions and Terms of Service.",
  },
  {
    q: "How long does the evaluation take?",
    a: "There is no maximum time limit. You must meet the minimum trading days requirement and achieve the profit target before requesting a review. Most traders complete evaluations within 30–90 days.",
  },
  {
    q: "What markets can I trade?",
    a: "Available instruments include forex pairs, indices, commodities, and cryptocurrencies — as listed in your account's trading conditions. Instrument availability may vary by jurisdiction.",
  },
];

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Navbar />

      {/* Hero */}
      <section className="pt-24 pb-16 px-4 text-center bg-gradient-to-b from-gray-900 to-gray-950">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
          How <span className="text-emerald-400">RiffMax Funding</span> Works
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          A transparent, merit-based evaluation process. Prove your edge,
          follow the rules, and earn a funded account.
        </p>
      </section>

      {/* Steps */}
      <section className="max-w-5xl mx-auto px-4 pb-20">
        <div className="grid md:grid-cols-2 gap-8">
          {steps.map((step) => (
            <div
              key={step.number}
              className="bg-gray-900 border border-gray-800 rounded-2xl p-8 flex gap-5 hover:border-emerald-500/40 transition-colors"
            >
              <div className="text-4xl flex-shrink-0 mt-1">{step.icon}</div>
              <div>
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">
                  Step {step.number}
                </span>
                <h3 className="text-xl font-bold mt-1 mb-2">{step.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Process Diagram */}
      <section className="bg-gray-900 border-y border-gray-800 py-16 px-4 mb-20">
        <div className="max-w-4xl mx-auto text-center mb-10">
          <h2 className="text-2xl font-bold mb-2">The Evaluation Lifecycle</h2>
          <p className="text-gray-400 text-sm">
            Every purchase follows a defined state machine — no ambiguity.
          </p>
        </div>
        <div className="max-w-4xl mx-auto overflow-x-auto">
          <div className="flex items-center justify-center gap-2 flex-wrap">
            {[
              "Payment Confirmed",
              "Provisioning",
              "Active",
              "Target Reached",
              "Under Review",
              "Passed",
              "Funded",
              "Payout Paid",
            ].map((state, i, arr) => (
              <div key={state} className="flex items-center gap-2">
                <div className="bg-gray-800 border border-emerald-500/30 rounded-lg px-3 py-2 text-xs font-semibold text-emerald-300 whitespace-nowrap">
                  {state}
                </div>
                {i < arr.length - 1 && (
                  <span className="text-gray-600 text-lg">→</span>
                )}
              </div>
            ))}
          </div>
          <p className="text-center text-xs text-gray-600 mt-4">
            A violation at any active stage results in a BREACHED status. Traders may purchase a new challenge.
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-4 pb-24">
        <h2 className="text-2xl font-bold text-center mb-10">
          Common Questions
        </h2>
        <div className="space-y-4">
          {faqs.map((item, i) => (
            <div
              key={i}
              className="bg-gray-900 border border-gray-800 rounded-xl p-6"
            >
              <h3 className="font-semibold text-white mb-2">{item.q}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{item.a}</p>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}
