"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Navbar />

      {/* Hero */}
      <section className="pt-24 pb-20 px-4 text-center bg-gradient-to-b from-gray-900 to-gray-950">
        <div className="max-w-3xl mx-auto">
          <div className="text-5xl mb-6">🌍</div>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-6">
            About <span className="text-emerald-400">RiffMax Funding</span>
          </h1>
          <p className="text-gray-300 text-lg leading-relaxed">
            We believe that trading talent exists everywhere — and that access
            to capital should not be the barrier that stands between a skilled
            trader and a serious career.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="max-w-4xl mx-auto px-4 pb-20 grid md:grid-cols-2 gap-12 items-start">
        <div>
          <h2 className="text-2xl font-bold mb-4 text-emerald-400">Our Mission</h2>
          <p className="text-gray-400 leading-relaxed mb-4">
            RiffMax Funding exists to identify, evaluate, and support skilled
            independent traders globally. We provide structured evaluation
            programmes that measure trading ability — not starting capital.
          </p>
          <p className="text-gray-400 leading-relaxed">
            Traders who prove consistent, rule-compliant performance are offered
            funded arrangements with profit-sharing. We make no promises about
            earnings — trading is inherently risky — but we do promise
            transparency, fairness, and clearly defined rules.
          </p>
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-4 text-emerald-400">What We Are Not</h2>
          <ul className="space-y-3 text-gray-400 text-sm leading-relaxed">
            <li className="flex gap-3">
              <span className="text-red-400 mt-0.5">✗</span>
              <span>We are <strong className="text-white">not a broker</strong> — we do not execute live trades on your behalf.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-red-400 mt-0.5">✗</span>
              <span>We are <strong className="text-white">not an investment platform</strong> — we do not manage your money or accept deposits.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-red-400 mt-0.5">✗</span>
              <span>We are <strong className="text-white">not a get-rich-quick scheme</strong> — passing an evaluation requires genuine skill and discipline.</span>
            </li>
            <li className="flex gap-3">
              <span className="text-red-400 mt-0.5">✗</span>
              <span>We do <strong className="text-white">not guarantee returns</strong> — all trading involves risk.</span>
            </li>
          </ul>
        </div>
      </section>

      {/* Values */}
      <section className="bg-gray-900 border-y border-gray-800 py-20 px-4 mb-20">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-12">Our Values</h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: "🔎", title: "Transparency", desc: "Every rule, fee, and condition is published in full before you commit." },
              { icon: "⚖️", title: "Fairness", desc: "Consistent rule enforcement for every trader, regardless of origin or background." },
              { icon: "🌐", title: "Accessibility", desc: "Designed for international traders — not limited by geography." },
              { icon: "🛡️", title: "Integrity", desc: "We operate with a strict compliance framework and zero tolerance for fraud." },
            ].map((v) => (
              <div key={v.title} className="bg-gray-800/60 rounded-2xl p-6 text-center border border-gray-700/50">
                <div className="text-4xl mb-4">{v.icon}</div>
                <h3 className="font-bold text-white mb-2">{v.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Legal */}
      <section className="max-w-3xl mx-auto px-4 pb-24">
        <div className="bg-gray-900 border border-gray-700 rounded-2xl p-8">
          <h2 className="text-xl font-bold mb-4 text-emerald-400">Legal & Compliance</h2>
          <p className="text-gray-400 text-sm leading-relaxed mb-3">
            RiffMax Funding is operated by Riffmax Technologies and related
            entities. The company is incorporated and registered as required
            by applicable law. Our platform is designed to operate in
            compliance with the regulatory environments of the jurisdictions we
            serve.
          </p>
          <p className="text-gray-400 text-sm leading-relaxed mb-3">
            We maintain an active compliance programme including KYC (Know Your
            Customer) and AML (Anti-Money Laundering) checks for all traders
            who reach the funded stage. Traders from restricted jurisdictions
            are not eligible.
          </p>
          <p className="text-gray-400 text-sm leading-relaxed">
            Use of this platform constitutes acceptance of our{" "}
            <a href="/terms" className="text-emerald-400 underline">Terms of Service</a>,{" "}
            <a href="/privacy" className="text-emerald-400 underline">Privacy Policy</a>, and{" "}
            <a href="/risk-disclosure" className="text-emerald-400 underline">Risk Disclosure</a>.
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
