"use client";

import { useState } from "react";
import Link from "next/link";
import { BRAND } from "@/lib/branding";

const faqCategories = [
  {
    category: "General",
    items: [
      {
        q: `What is ${BRAND.name}?`,
        a: `${BRAND.name} is a next-generation proprietary trading evaluation firm. We provide skilled traders the opportunity to demonstrate their ability through an objective evaluation. Traders who pass manage simulated funded capital with up to 90% profit-sharing splits.`,
      },
      {
        q: `Is ${BRAND.name} a broker?`,
        a: `No. We are not a broker, investment fund, or financial adviser. We do not hold client deposits or execute live retail brokerage orders. All accounts operate on simulated institutional feeds.`,
      },
      {
        q: "Who can participate?",
        a: "Eligible traders from most countries worldwide can participate, subject to international sanctions and our restricted country list. You must be at least 18 years old and legally permitted to engage in simulated trading in your jurisdiction.",
      },
      {
        q: "Which countries are restricted?",
        a: "A full list of restricted countries is available on our Restricted Countries page. Restrictions are based on international sanctions, AML standards, and regulatory directives. Purchases from sanctioned countries will be rejected.",
      },
    ],
  },
  {
    category: "Evaluation & Challenges",
    items: [
      {
        q: "How many phases does the evaluation have?",
        a: `Currently, the standard ${BRAND.name} evaluation is a streamlined single-phase process. You must reach the 10% profit target while adhering to the 5% daily loss and 10% maximum drawdown limits with 0 minimum trading days required.`,
      },
      {
        q: "Can I trade any strategy?",
        a: "Yes! Discretionary manual trading, algorithmic Expert Advisors (EAs), swing trading, and scalping are fully allowed. High-frequency latency arbitrage, toxic order flow, and exploiting feed delays are strictly prohibited.",
      },
      {
        q: "What happens if I breach a rule?",
        a: "Your challenge is automatically flagged as BREACHED by our server-side risk engine and deactivated. You are welcome to purchase a new evaluation at any time. Evaluation fees are non-refundable.",
      },
      {
        q: "Is there a maximum time limit for the challenge?",
        a: "No! There are no hidden countdown timers or maximum trading day limits. You trade at your own pace.",
      },
    ],
  },
  {
    category: "Payments & Fees",
    items: [
      {
        q: "How do I pay for a challenge?",
        a: "We support instant card payments, bank wire transfers, and cryptocurrency checkout (including USDT, BTC, and ETH). All challenge fees are one-time with no recurring monthly subscriptions.",
      },
      {
        q: "Are evaluation fees refundable?",
        a: "Evaluation fees cover the cost of technology, server infrastructure, and simulated trading account provisioning. Once account credentials have been accessed or trading has commenced, fees are non-refundable according to our Refund Policy.",
      },
    ],
  },
  {
    category: "Trading Rules & Risk",
    items: [
      {
        q: "How is the 5% Maximum Daily Loss calculated?",
        a: "Daily loss is calculated relative to the starting equity at 00:00 server time. If your account equity falls below this 5% buffer at any point during the trading day, a breach occurs.",
      },
      {
        q: "Is the Maximum Drawdown trailing or static?",
        a: "Our standard evaluation challenges use a transparent static drawdown limit (10% of initial starting capital), giving you the maximum breathing room for swing trades.",
      },
      {
        q: "Can I hold positions over weekends?",
        a: "Yes, holding positions over the weekend and during news announcements is fully permitted on standard accounts.",
      },
    ],
  },
  {
    category: "Funded Accounts & Payouts",
    items: [
      {
        q: "What profit split do funded traders receive?",
        a: "Funded traders start with an 80% profit split, with eligibility to scale up to a 90% profit split based on consistent quarterly performance.",
      },
      {
        q: "How often can I request a payout?",
        a: "Payouts can be requested bi-weekly once your funded account reaches eligible profit milestones and your KYC identity verification is approved.",
      },
      {
        q: "How are payouts sent?",
        a: "We support direct crypto transfers (USDT TRC20/ERC20) and international bank wire transfers.",
      },
    ],
  },
];

export default function FAQPage() {
  const [activeCategory, setActiveCategory] = useState("General");
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const currentItems =
    faqCategories.find((c) => c.category === activeCategory)?.items || [];

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Hero */}
      <section className="pt-20 pb-12 px-4 text-center bg-gradient-to-b from-slate-900 to-slate-950">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight">
          Frequently Asked <span className="text-[#ccff00]">Questions</span>
        </h1>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto">
          Everything you need to know about {BRAND.name}, evaluation rules, and trader rewards.
        </p>
      </section>

      {/* Category Tabs */}
      <section className="max-w-4xl mx-auto px-4 pb-4">
        <div className="flex flex-wrap gap-2 justify-center mb-10">
          {faqCategories.map((cat) => (
            <button
              key={cat.category}
              onClick={() => { setActiveCategory(cat.category); setOpenIndex(null); }}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                activeCategory === cat.category
                  ? "bg-[#ccff00] text-black shadow-lg shadow-[#ccff00]/10"
                  : "bg-slate-900 text-slate-400 hover:bg-slate-800 border border-slate-800"
              }`}
            >
              {cat.category}
            </button>
          ))}
        </div>

        {/* Accordion */}
        <div className="space-y-3">
          {currentItems.map((item, i) => (
            <div
              key={i}
              className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden transition-colors"
            >
              <button
                className="w-full flex items-center justify-between px-6 py-5 text-left"
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
              >
                <span className="font-semibold text-white pr-4 text-sm">{item.q}</span>
                <span className="text-[#ccff00] text-xl flex-shrink-0 font-mono">
                  {openIndex === i ? "−" : "+"}
                </span>
              </button>
              {openIndex === i && (
                <div className="px-6 pb-5 border-t border-slate-800/60 pt-3">
                  <p className="text-slate-400 text-xs leading-relaxed">{item.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-2xl mx-auto px-4 py-16 text-center">
        <p className="text-slate-400 mb-4 text-sm">Still have questions?</p>
        <Link
          href="/contact"
          className="inline-block bg-[#ccff00] hover:bg-[#b3e600] text-black font-black text-xs px-8 py-3 rounded-xl transition shadow-lg shadow-[#ccff00]/10"
        >
          Contact Support Team
        </Link>
      </section>
    </div>
  );
}
