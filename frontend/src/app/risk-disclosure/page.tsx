import Link from "next/link";

const LAST_UPDATED = "1 September 2025";
const COMPANY = "MaxFunded Global Ltd.";
const BRAND = "MaxFunded";

export default function RiskDisclosurePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Top navigation bar */}
      <div className="border-b border-gray-200 bg-white sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/" className="text-sm font-bold text-gray-900 hover:text-black">
            ← {BRAND}
          </Link>
          <span className="text-xs text-gray-400">Legal Document</span>
        </div>
      </div>

      {/* Hero header */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
          <span className="inline-block bg-black text-white text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded mb-4">Legal</span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-2 text-left">Simulated Trading Risk Disclosure</h1>
          <p className="text-gray-500 text-sm text-left">Last updated: {LAST_UPDATED} &nbsp;·&nbsp; {COMPANY}</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 grid grid-cols-1 lg:grid-cols-4 gap-10">
        {/* Sticky sidebar TOC */}
        <aside className="hidden lg:block lg:col-span-1">
          <div className="sticky top-20">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Contents</p>
            <nav className="space-y-1 text-sm">
              {["Simulated Trading","Capital Not At Risk","Not a Broker","Funded Account Risk","Leverage Risk","Technology Risk","Regulatory Risk","Tax","No Financial Advice"].map((item, i) => (
                <a key={i} href={`#r${i+1}`} className="block text-gray-500 hover:text-black py-0.5 hover:underline transition-colors">
                  {i+1}. {item}
                </a>
              ))}
            </nav>
          </div>
        </aside>

        {/* Main content */}
        <article className="lg:col-span-3 text-gray-700 text-sm leading-7">
          {/* Important notice */}
          <div className="bg-red-50 border-l-4 border-red-400 rounded-r-lg px-5 py-4 mb-10">
            <p className="font-semibold text-red-800 mb-1">Risk Warning</p>
            <p className="text-red-700 text-sm">
              By registering on this platform, you confirm that you have read, understood, and accepted this Risk
              Disclosure in full. Trading carries significant risk. Past performance is not indicative of future results.
            </p>
          </div>

          <section id="r1" className="mb-8">
            <h2 className="text-lg font-bold text-gray-900 mb-3 pb-2 border-b border-gray-100">1. Simulated Trading</h2>
            <p>
              All evaluation accounts provided by {BRAND} are <strong>simulated</strong> trading environments. Market
              prices are sourced from real liquidity providers but all trades are executed in simulation only. No real
              orders are placed on any financial exchange, broker, or market. Profits or losses in an evaluation account
              are not real and have no monetary value unless a funded arrangement is explicitly offered.
            </p>
          </section>

          <section id="r2" className="mb-8">
            <h2 className="text-lg font-bold text-gray-900 mb-3 pb-2 border-b border-gray-100">2. Your Capital Is Not At Risk During Evaluation</h2>
            <p>
              The evaluation fee you pay is a service fee for access to the evaluation programme — not a deposit into a
              trading account. You are not trading with or at risk of losing any personal capital beyond the evaluation
              fee already paid. The evaluation fee is non-refundable (subject to the Refund Policy).
            </p>
          </section>

          <section id="r3" className="mb-8">
            <h2 className="text-lg font-bold text-gray-900 mb-3 pb-2 border-b border-gray-100">3. We Are Not a Broker or Investment Firm</h2>
            <p>
              {COMPANY} is not licensed as a financial services provider, broker, investment adviser, or similar
              regulated entity. This platform does not offer investment services or financial advice. Participation in
              evaluation programmes is a service contract — not an investment.
            </p>
          </section>

          <section id="r4" className="mb-8">
            <h2 className="text-lg font-bold text-gray-900 mb-3 pb-2 border-b border-gray-100">4. Funded Account Risk</h2>
            <p>
              If you are offered and accept a funded arrangement, trading in that arrangement involves real financial risk
              — including but not limited to market volatility, leverage risk, liquidity risk, gap risk, and geopolitical
              event risk. A funded account may be terminated if drawdown rules are breached.
            </p>
          </section>

          <section id="r5" className="mb-8">
            <h2 className="text-lg font-bold text-gray-900 mb-3 pb-2 border-b border-gray-100">5. Leverage Risk</h2>
            <p>
              Trading with leverage magnifies both potential profits and potential losses. A small adverse market movement
              can result in a loss significantly greater than the margin deposited. You must fully understand how leverage
              works before trading.
            </p>
          </section>

          <section id="r6" className="mb-8">
            <h2 className="text-lg font-bold text-gray-900 mb-3 pb-2 border-b border-gray-100">6. Technology Risk</h2>
            <p>
              Trading systems, internet connections, and third-party platforms may experience outages, delays, or errors.
              The Company is not liable for losses arising from technology failures outside its reasonable control.
            </p>
          </section>

          <section id="r7" className="mb-8">
            <h2 className="text-lg font-bold text-gray-900 mb-3 pb-2 border-b border-gray-100">7. Regulatory Risk</h2>
            <p>
              The regulatory environment for proprietary trading evaluation programmes varies by jurisdiction and may
              change. Changes in regulation could affect the availability of this programme in your country. It is your
              responsibility to ensure that participation is lawful in your jurisdiction.
            </p>
          </section>

          <section id="r8" className="mb-8">
            <h2 className="text-lg font-bold text-gray-900 mb-3 pb-2 border-b border-gray-100">8. Tax</h2>
            <p>
              Any payouts or profits you receive may be subject to tax in your jurisdiction. It is your responsibility to
              understand and comply with all applicable tax obligations. The Company does not provide tax advice.
            </p>
          </section>

          <section id="r9" className="mb-8">
            <h2 className="text-lg font-bold text-gray-900 mb-3 pb-2 border-b border-gray-100">9. No Financial Advice</h2>
            <p>
              Nothing on this platform or in any communication from the Company constitutes financial, investment, legal,
              or tax advice. All information is provided for informational purposes only. You should seek independent
              professional advice before making any financial decisions.
            </p>
          </section>

          {/* Acknowledgement box */}
          <div className="mt-8 bg-gray-50 border border-gray-200 rounded-xl px-6 py-5">
            <p className="font-semibold text-gray-800 mb-1 text-sm">Acknowledgement</p>
            <p className="text-gray-600 text-sm">
              By registering on this platform, you confirm that you have read, understood, and accepted this Risk
              Disclosure in full. You acknowledge that trading involves risk and that you are participating voluntarily.
            </p>
          </div>

          <div className="mt-12 pt-6 border-t border-gray-200 text-xs text-gray-400">
            <p>&copy; 2025 {COMPANY}. All rights reserved.</p>
          </div>
        </article>
      </div>
    </div>
  );
}
