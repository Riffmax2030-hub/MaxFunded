"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const LAST_UPDATED = "1 September 2025";

export default function RiskDisclosurePage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Navbar />
      <section className="pt-24 pb-8 px-4 text-center bg-gradient-to-b from-gray-900 to-gray-950">
        <h1 className="text-3xl md:text-4xl font-extrabold mb-2">Risk Disclosure</h1>
        <p className="text-gray-500 text-sm">Last Updated: {LAST_UPDATED}</p>
      </section>

      <article className="max-w-3xl mx-auto px-4 pb-24">
        <div className="bg-red-950/20 border border-red-700/40 rounded-xl p-6 mb-10">
          <p className="text-red-400 font-bold text-sm mb-2">⚠ Important — Read Carefully</p>
          <p className="text-gray-300 text-sm leading-relaxed">
            Trading financial instruments involves significant risk of loss. Past performance —
            including your performance in a simulated evaluation — is not indicative of future
            results. You should not participate in this programme unless you understand and accept
            all risks involved.
          </p>
        </div>

        <div className="space-y-8 text-gray-400 text-sm leading-relaxed">
          <div>
            <h2 className="text-white text-xl font-bold mb-3">1. Nature of the Programme</h2>
            <p>
              RiffMax Funding offers simulated trading evaluation accounts. Simulated trading
              environments do not perfectly replicate live market conditions. Prices, spreads,
              execution speeds, and liquidity in the simulated environment may differ materially
              from real market conditions. Performance in a simulated environment cannot guarantee
              equivalent performance in live trading.
            </p>
          </div>

          <div>
            <h2 className="text-white text-xl font-bold mb-3">2. Evaluation Fee Risk</h2>
            <p>
              All evaluation fees are non-refundable (subject to the Refund Policy). You may
              lose the entire evaluation fee paid if you breach challenge rules, fail to meet
              the profit target, or otherwise do not pass the evaluation. There is no guarantee
              that you will pass any evaluation.
            </p>
          </div>

          <div>
            <h2 className="text-white text-xl font-bold mb-3">3. No Guaranteed Funding</h2>
            <p>
              Passing an evaluation does not create an automatic or unconditional right to a
              funded account. The Company retains the right to decline or withdraw funding offers
              based on compliance review, trading behaviour analysis, or other factors at its
              discretion.
            </p>
          </div>

          <div>
            <h2 className="text-white text-xl font-bold mb-3">4. Market Risk in Funded Accounts</h2>
            <p>
              If you are offered and accept a funded arrangement, trading in that arrangement
              involves real financial risk — including but not limited to market volatility,
              leverage risk, liquidity risk, gap risk, and geopolitical event risk. A funded
              account may be terminated if drawdown rules are breached.
            </p>
          </div>

          <div>
            <h2 className="text-white text-xl font-bold mb-3">5. Leverage Risk</h2>
            <p>
              Trading with leverage magnifies both potential profits and potential losses.
              A small adverse market movement can result in a loss significantly greater than
              the margin deposited. You must fully understand how leverage works before trading.
            </p>
          </div>

          <div>
            <h2 className="text-white text-xl font-bold mb-3">6. Technology Risk</h2>
            <p>
              Trading systems, internet connections, and third-party platforms may experience
              outages, delays, or errors. The Company is not liable for losses arising from
              technology failures outside its reasonable control.
            </p>
          </div>

          <div>
            <h2 className="text-white text-xl font-bold mb-3">7. Regulatory Risk</h2>
            <p>
              The regulatory environment for proprietary trading evaluation programmes varies
              by jurisdiction and may change. Changes in regulation could affect the availability
              of this programme in your country. It is your responsibility to ensure that
              participation is lawful in your jurisdiction.
            </p>
          </div>

          <div>
            <h2 className="text-white text-xl font-bold mb-3">8. Tax</h2>
            <p>
              Any payouts or profits you receive may be subject to tax in your jurisdiction.
              It is your responsibility to understand and comply with all applicable tax
              obligations. The Company does not provide tax advice.
            </p>
          </div>

          <div>
            <h2 className="text-white text-xl font-bold mb-3">9. No Financial Advice</h2>
            <p>
              Nothing on this platform or in any communication from the Company constitutes
              financial, investment, legal, or tax advice. All information is provided for
              informational purposes only. You should seek independent professional advice
              before making any financial decisions.
            </p>
          </div>

          <div className="bg-gray-900 border border-gray-700 rounded-xl p-5">
            <p className="text-gray-300 font-semibold text-sm">
              By registering on this platform, you confirm that you have read, understood,
              and accepted this Risk Disclosure in full.
            </p>
          </div>
        </div>
      </article>

      <Footer />
    </div>
  );
}
