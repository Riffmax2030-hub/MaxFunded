"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const faqCategories = [
  {
    category: "General",
    items: [
      {
        q: "What is RiffMax Funding?",
        a: "RiffMax Funding is a proprietary trading evaluation firm. We offer traders the opportunity to demonstrate their trading ability through a structured evaluation. Traders who pass the evaluation may be offered a funded trading arrangement with a profit split.",
      },
      {
        q: "Is RiffMax Funding a broker?",
        a: "No. We are not a broker, investment firm, or financial adviser. We do not hold client funds, take deposits, or offer investment products. We sell access to evaluation programmes.",
      },
      {
        q: "Who can participate?",
        a: "Eligible traders from most countries worldwide can participate, subject to local regulations and our restricted country list. You must be at least 18 years old and legally permitted to engage in trading activities in your jurisdiction.",
      },
      {
        q: "Which countries are restricted?",
        a: "A full list of restricted countries is available on the Restricted Countries page. Restrictions are based on legal, regulatory, and compliance requirements and may change. Purchases from restricted countries will be declined.",
      },
    ],
  },
  {
    category: "Evaluation & Challenges",
    items: [
      {
        q: "How many phases does the evaluation have?",
        a: "Currently, the RiffMax Funding evaluation is a single-phase process. You must reach the profit target while respecting all rules within the required minimum trading days.",
      },
      {
        q: "Can I trade any strategy?",
        a: "Yes, as long as it does not violate the prohibited practices listed in the Rules and Terms of Service. Hedging, scalping, swing trading, and personal EAs are all permitted within the stated limits.",
      },
      {
        q: "What happens if I breach a rule?",
        a: "Your challenge is immediately marked as BREACHED and deactivated. You may purchase a new challenge to try again. Evaluation fees are non-refundable.",
      },
      {
        q: "Is there a maximum duration for the challenge?",
        a: "No. You may trade at your own pace. There is no expiry date, only the minimum trading day requirement.",
      },
    ],
  },
  {
    category: "Payments & Fees",
    items: [
      {
        q: "How do I pay for a challenge?",
        a: "Challenge fees can be paid via supported payment methods at checkout. Accepted methods include card payments and crypto (where available). We support multiple currencies. All prices are displayed in USD.",
      },
      {
        q: "Are evaluation fees refundable?",
        a: "Evaluation fees are non-refundable. Please review our Refund Policy for the specific cases in which a refund may be considered.",
      },
      {
        q: "Will I get the fee back if I pass?",
        a: "Fee reimbursement upon passing is not guaranteed. The evaluation fee is a service fee for access to the evaluation programme, not a deposit. Some plans may offer a fee credit — check the specific challenge details.",
      },
    ],
  },
  {
    category: "Payouts & Funded Accounts",
    items: [
      {
        q: "How are payouts calculated?",
        a: "Payouts are calculated as a percentage of net profits generated in the funded account, according to the profit split rate in your plan (default: 80% to the trader). Payouts are subject to compliance review.",
      },
      {
        q: "How often can I request a payout?",
        a: "Payout schedules and eligibility windows are defined in the Payout Policy. You must have a minimum profit threshold and a minimum number of funded trading days before requesting a payout.",
      },
      {
        q: "What payout methods are available?",
        a: "Payouts are made via bank transfer, cryptocurrency, or other supported methods depending on your jurisdiction. Processing times vary by method.",
      },
      {
        q: "Can my funded account be terminated?",
        a: "Yes. Funded accounts are subject to the same rule structure as evaluations (daily loss, max drawdown). Violations may result in account termination. Suspected rule gaming or fraud will result in immediate termination and account banning.",
      },
    ],
  },
  {
    category: "Technical",
    items: [
      {
        q: "Which platform do you use?",
        a: "MetaTrader 5 (MT5). After your purchase is confirmed and provisioned, you will receive login credentials and server details by email and in your dashboard.",
      },
      {
        q: "Can I use an Expert Advisor (EA)?",
        a: "Yes. Personal algorithmic strategies are permitted. EAs must not exploit latency, use external signal copying, or engage in any prohibited practice.",
      },
      {
        q: "What if I have technical issues with my account?",
        a: "Open a support ticket from the dashboard. Our team responds within 1 business day (usually faster). Platform downtime on the simulated environment is typically mirrored from your MT5 server provider's scheduled maintenance.",
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
    <div className="min-h-screen bg-gray-950 text-white">
      <Navbar />

      {/* Hero */}
      <section className="pt-24 pb-12 px-4 text-center bg-gradient-to-b from-gray-900 to-gray-950">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
          Frequently Asked <span className="text-emerald-400">Questions</span>
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          Can&apos;t find your answer? Contact our support team via the dashboard or email.
        </p>
      </section>

      {/* Category Tabs */}
      <section className="max-w-4xl mx-auto px-4 pb-4">
        <div className="flex flex-wrap gap-2 justify-center mb-10">
          {faqCategories.map((cat) => (
            <button
              key={cat.category}
              onClick={() => { setActiveCategory(cat.category); setOpenIndex(null); }}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                activeCategory === cat.category
                  ? "bg-emerald-500 text-white"
                  : "bg-gray-800 text-gray-400 hover:bg-gray-700"
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
              className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden"
            >
              <button
                className="w-full flex items-center justify-between px-6 py-5 text-left"
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
              >
                <span className="font-semibold text-white pr-4">{item.q}</span>
                <span className="text-emerald-400 text-xl flex-shrink-0">
                  {openIndex === i ? "−" : "+"}
                </span>
              </button>
              {openIndex === i && (
                <div className="px-6 pb-5">
                  <p className="text-gray-400 text-sm leading-relaxed">{item.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-2xl mx-auto px-4 py-16 text-center">
        <p className="text-gray-400 mb-4">Still have questions?</p>
        <a
          href="/contact"
          className="inline-block bg-emerald-500 hover:bg-emerald-400 text-white font-bold px-8 py-3 rounded-full transition-colors"
        >
          Contact Support
        </a>
      </section>

      <Footer />
    </div>
  );
}
