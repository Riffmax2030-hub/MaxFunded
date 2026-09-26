"use client";

import { BRAND } from "@/lib/branding";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Hero */}
      <section className="pt-20 pb-16 px-4 text-center bg-gradient-to-b from-slate-900 to-slate-950">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-semibold uppercase tracking-wider mb-6">
            Institutional Evaluation Platform
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-6 tracking-tight">
            About <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-indigo-400">{BRAND.name}</span>
          </h1>
          <p className="text-slate-300 text-lg leading-relaxed">
            We believe that trading talent exists everywhere — and that access
            to capital should not be the barrier standing between a disciplined trader and financial freedom.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="max-w-4xl mx-auto px-4 pb-20 grid md:grid-cols-2 gap-12 items-start">
        <div>
          <h2 className="text-2xl font-bold mb-4 text-brand-400">Our Mission</h2>
          <p className="text-slate-400 leading-relaxed mb-4">
            {BRAND.name} exists to identify, evaluate, and fund skilled
            independent traders globally. We provide structured evaluation
            programmes that measure trading ability, discipline, and risk management — not your starting capital.
          </p>
          <p className="text-slate-400 leading-relaxed">
            Traders who prove consistent, rule-compliant performance are awarded
            funded accounts with up to a 90% profit-sharing split. We make no unrealistic promises — trading requires genuine skill and patience — but we guarantee transparency, deterministic execution, and fast payouts.
          </p>
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-4 text-brand-400">What We Are Not</h2>
          <ul className="space-y-3 text-slate-400 text-sm leading-relaxed">
            <li className="flex gap-3">
              <span className="text-rose-400 mt-0.5">✗</span>
              <span>We are <strong className="text-white">not a broker</strong> — we do not take customer deposits or execute retail brokerage orders.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-rose-400 mt-0.5">✗</span>
              <span>We are <strong className="text-white">not an investment fund</strong> — we do not manage your money or solicit investment capital.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-rose-400 mt-0.5">✗</span>
              <span>We are <strong className="text-white">not a get-rich-quick scheme</strong> — passing an evaluation requires genuine discipline and risk control.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-rose-400 mt-0.5">✗</span>
              <span>We do <strong className="text-white">not guarantee returns</strong> — all market trading carries inherent financial risk.</span>
            </li>
          </ul>
        </div>
      </section>

      {/* How it works summary */}
      <section className="bg-slate-900/60 border-y border-slate-800/80 py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-10 text-white">How the Model Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Evaluation Phase",
                desc: "Choose a simulated challenge tier ($10K–$200K). Prove consistency by hitting the profit target while keeping within daily loss and total drawdown parameters.",
              },
              {
                step: "02",
                title: "Verification & Pass",
                desc: "Complete your KYC identity verification and receive your cryptographic HMAC-SHA256 certificate of achievement.",
              },
              {
                step: "03",
                title: "Funded Trader Rewards",
                desc: "Trade simulated institutional capital and request bi-weekly performance rewards with up to 90% profit splits.",
              },
            ].map((item) => (
              <div key={item.step} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative">
                <span className="text-3xl font-extrabold text-brand-500/30 font-mono mb-2 block">{item.step}</span>
                <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                <p className="text-slate-400 text-xs leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Legal & Compliance */}
      <section className="max-w-3xl mx-auto px-4 py-20">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">
          <h2 className="text-xl font-bold mb-4 text-brand-400">Legal & Compliance</h2>
          <p className="text-slate-400 text-sm leading-relaxed mb-3">
            {BRAND.name} is operated by {BRAND.operatingEntity} under {BRAND.parentCompany}. Our platform operates in strict compliance with applicable global regulatory frameworks.
          </p>
          <p className="text-slate-400 text-sm leading-relaxed mb-3">
            We maintain an institutional compliance programme including KYC (Know Your Customer) and AML (Anti-Money Laundering) checks for all traders who qualify for funded accounts. Traders from restricted jurisdictions are prohibited from purchasing evaluation challenges.
          </p>
          <p className="text-slate-400 text-sm leading-relaxed">
            Use of this platform constitutes acceptance of our{" "}
            <a href="/terms" className="text-brand-400 underline">Terms of Service</a>,{" "}
            <a href="/privacy" className="text-brand-400 underline">Privacy Policy</a>, and{" "}
            <a href="/risk-disclosure" className="text-brand-400 underline">Risk Disclosure</a>.
          </p>
        </div>
      </section>
    </div>
  );
}
