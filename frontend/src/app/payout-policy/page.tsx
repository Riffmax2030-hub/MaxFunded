import Link from "next/link";

const LAST_UPDATED = "1 September 2025";
const COMPANY = "MaxFunded Global Ltd.";
const BRAND = "MaxFunded";
const EMAIL = "payouts@maxfunded.com";

export default function PayoutPolicyPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="border-b border-gray-200 bg-white sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/" className="text-sm font-bold text-gray-900 hover:text-black">← {BRAND}</Link>
          <span className="text-xs text-gray-400">Legal Document</span>
        </div>
      </div>

      <div className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-block bg-black text-white text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded">Legal</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-2">Payout Policy</h1>
          <p className="text-gray-500 text-sm">Last updated: {LAST_UPDATED} · {COMPANY}</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 grid grid-cols-1 lg:grid-cols-4 gap-10">
        <aside className="hidden lg:block lg:col-span-1">
          <div className="sticky top-20">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Contents</p>
            <nav className="space-y-1 text-sm">
              {["Profit Split","Eligibility","Payout Schedule","Payout Methods","Net Profit","Account Reset","Compliance","Tax","Contact"].map((item, i) => (
                <a key={i} href={`#pp${i+1}`} className="block text-gray-500 hover:text-black py-0.5 hover:underline transition-colors">
                  {i+1}. {item}
                </a>
              ))}
            </nav>
          </div>
        </aside>

        <article className="lg:col-span-3 text-gray-700 text-sm leading-7">
          <section id="pp1" className="mb-8">
            <h2 className="text-lg font-bold text-gray-900 mb-3 pb-2 border-b border-gray-100">1. Profit Split</h2>
            <p>
              Funded traders receive a profit split of up to <strong>80%</strong> of net trading profits generated in
              their funded account. The exact profit split is defined in the funded account agreement provided upon
              passing your evaluation. The Company retains the remaining percentage as its share.
            </p>
          </section>

          <section id="pp2" className="mb-8">
            <h2 className="text-lg font-bold text-gray-900 mb-3 pb-2 border-b border-gray-100">2. Eligibility for Payout Requests</h2>
            <p className="mb-3">To be eligible to request a payout, you must:</p>
            <ul className="space-y-2">
              {[
                "Have an active funded account in good standing",
                "Have traded for a minimum of 14 calendar days since account activation",
                "Have a net profit of at least $100 USD (minimum payout threshold)",
                "Have completed KYC/identity verification (required for first payout)",
                "Have no open compliance flags or investigations on your account",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="mt-2 w-1.5 h-1.5 rounded-full bg-gray-400 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section id="pp3" className="mb-8">
            <h2 className="text-lg font-bold text-gray-900 mb-3 pb-2 border-b border-gray-100">3. Payout Schedule</h2>
            <p>
              After submitting a payout request through your dashboard, requests enter a <strong>compliance review</strong>{" "}
              phase (typically 1–3 business days). Once approved, payouts are processed within{" "}
              <strong>5 business days</strong>. The first payout from a funded account may take up to 7 business days due
              to additional verification steps.
            </p>
          </section>

          <section id="pp4" className="mb-8">
            <h2 className="text-lg font-bold text-gray-900 mb-3 pb-2 border-b border-gray-100">4. Payout Methods</h2>
            <p className="mb-3">Supported payout methods (availability varies by country):</p>
            <ul className="space-y-2">
              {[
                { label: "Cryptocurrency", detail: "BTC, USDT (TRC-20 / ERC-20), ETH — no minimum beyond the $100 threshold" },
                { label: "Bank transfer (SWIFT)", detail: "Available for most countries; minimum $200; processing time 3–7 business days" },
                { label: "Other methods", detail: "May be added in future at the Company's discretion" },
              ].map(({ label, detail }) => (
                <li key={label} className="flex items-start gap-2">
                  <span className="mt-2 w-1.5 h-1.5 rounded-full bg-gray-400 shrink-0" />
                  <p><strong className="text-gray-900">{label}:</strong> {detail}</p>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-gray-600">
              Any fees charged by the receiving bank, crypto network gas fees, or conversion costs are the responsibility
              of the trader and will be deducted from the payout amount where applicable.
            </p>
          </section>

          <section id="pp5" className="mb-8">
            <h2 className="text-lg font-bold text-gray-900 mb-3 pb-2 border-b border-gray-100">5. How Net Profit Is Calculated</h2>
            <p>
              Net profit = closed trade profits − closed trade losses − swap/rollover fees. Open floating positions are
              not included in payout calculations. Profits are calculated from the funded account start balance (not
              including any performance achieved during the evaluation).
            </p>
          </section>

          <section id="pp6" className="mb-8">
            <h2 className="text-lg font-bold text-gray-900 mb-3 pb-2 border-b border-gray-100">6. Account Reset After Payout</h2>
            <p>
              Payouts do not reset your funded account balance. Your account continues from its current equity level.
              However, drawdown limits continue to apply from the original funded account starting balance.
            </p>
          </section>

          <section id="pp7" className="mb-8">
            <h2 className="text-lg font-bold text-gray-900 mb-3 pb-2 border-b border-gray-100">7. Compliance Review</h2>
            <p>
              All payout requests are subject to compliance review. Requests may be delayed or denied if the trading
              activity shows signs of rule gaming, coordinated account abuse, or patterns inconsistent with legitimate
              trading. Denied payouts will be communicated with a reason within 5 business days.
            </p>
          </section>

          <section id="pp8" className="mb-8">
            <h2 className="text-lg font-bold text-gray-900 mb-3 pb-2 border-b border-gray-100">8. Tax Obligations</h2>
            <p>
              Traders are solely responsible for declaring and paying any taxes on payout income in their respective
              jurisdictions. The Company may be required to collect tax information (e.g., W-8/W-9 forms for US persons)
              before processing payouts.
            </p>
          </section>

          <section id="pp9" className="mb-8">
            <h2 className="text-lg font-bold text-gray-900 mb-3 pb-2 border-b border-gray-100">9. Contact</h2>
            <p>For payout enquiries: <a href={`mailto:${EMAIL}`} className="text-blue-600 underline">{EMAIL}</a></p>
          </section>

          <div className="mt-12 pt-6 border-t border-gray-200 text-xs text-gray-400">
            <p>&copy; 2025 {COMPANY}. All rights reserved.</p>
          </div>
        </article>
      </div>
    </div>
  );
}
