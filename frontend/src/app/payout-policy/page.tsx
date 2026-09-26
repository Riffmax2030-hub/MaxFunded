"use client";


const LAST_UPDATED = "1 September 2025";
const EMAIL = "payouts@maxfunded.com";

export default function PayoutPolicyPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <section className="pt-24 pb-8 px-4 text-center bg-gradient-to-b from-gray-900 to-gray-950">
        <h1 className="text-3xl md:text-4xl font-extrabold mb-2">Payout Policy</h1>
        <p className="text-slate-500 text-sm">Last Updated: {LAST_UPDATED}</p>
      </section>

      <article className="max-w-3xl mx-auto px-4 pb-24">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 space-y-8 text-slate-400 text-sm leading-relaxed">

          <div>
            <h2 className="text-white text-lg font-bold mb-3">1. Profit Split</h2>
            <p>
              Funded traders receive a profit split of up to <strong className="text-white">80%</strong> of net
              trading profits generated in their funded account. The exact profit split is defined
              in the funded account agreement provided upon passing your evaluation. The Company
              retains the remaining percentage as its share.
            </p>
          </div>

          <div>
            <h2 className="text-white text-lg font-bold mb-3">2. Eligibility for Payout Requests</h2>
            <p className="mb-3">To be eligible to request a payout, you must:</p>
            <ul className="list-disc list-inside space-y-2">
              <li>Have an active funded account in good standing</li>
              <li>Have traded for a minimum of <strong className="text-white">14 calendar days</strong> since account activation</li>
              <li>Have a net profit of at least <strong className="text-white">\$100 USD</strong> (minimum payout threshold)</li>
              <li>Have completed KYC/identity verification (required for first payout)</li>
              <li>Have no open compliance flags or investigations on your account</li>
            </ul>
          </div>

          <div>
            <h2 className="text-white text-lg font-bold mb-3">3. Payout Schedule</h2>
            <p>
              After submitting a payout request through your dashboard, requests enter a{" "}
              <strong className="text-white">compliance review</strong> phase (typically 1–3 business days). Once
              approved, payouts are processed within <strong className="text-white">5 business days</strong>. The first
              payout from a funded account may take up to 7 business days due to additional
              verification steps.
            </p>
          </div>

          <div>
            <h2 className="text-white text-lg font-bold mb-3">4. Payout Methods</h2>
            <p className="mb-3">Supported payout methods (availability varies by country):</p>
            <ul className="list-disc list-inside space-y-2">
              <li><strong className="text-white">Cryptocurrency:</strong> BTC, USDT (TRC-20 / ERC-20), ETH — no minimum beyond the \$100 threshold</li>
              <li><strong className="text-white">Bank transfer (SWIFT):</strong> Available for most countries; minimum \$200; processing time 3–7 business days</li>
              <li><strong className="text-white">Other methods:</strong> May be added in future at the Company&apos;s discretion</li>
            </ul>
            <p className="mt-3">
              Any fees charged by the receiving bank, crypto network gas fees, or conversion costs
              are the responsibility of the trader and will be deducted from the payout amount
              where applicable.
            </p>
          </div>

          <div>
            <h2 className="text-white text-lg font-bold mb-3">5. How Net Profit is Calculated</h2>
            <p>
              Net profit = closed trade profits − closed trade losses − swap/rollover fees.
              Open floating positions are not included in payout calculations. Profits are
              calculated from the funded account start balance (not including any performance
              achieved during the evaluation).
            </p>
          </div>

          <div>
            <h2 className="text-white text-lg font-bold mb-3">6. Account Reset After Payout</h2>
            <p>
              Payouts do not reset your funded account balance. Your account continues from its
              current equity level. However, drawdown limits continue to apply from the original
              funded account starting balance.
            </p>
          </div>

          <div>
            <h2 className="text-white text-lg font-bold mb-3">7. Compliance Review</h2>
            <p>
              All payout requests are subject to compliance review. Requests may be delayed or
              denied if: the trading activity shows signs of rule gaming, coordinated account
              abuse, or patterns inconsistent with legitimate trading. Denied payouts will be
              communicated with a reason within 5 business days.
            </p>
          </div>

          <div>
            <h2 className="text-white text-lg font-bold mb-3">8. Tax Obligations</h2>
            <p>
              Traders are solely responsible for declaring and paying any taxes on payout income
              in their respective jurisdictions. The Company may be required to collect tax
              information (e.g., W-8/W-9 forms for US persons) before processing payouts.
            </p>
          </div>

          <div>
            <h2 className="text-white text-lg font-bold mb-3">9. Contact</h2>
            <p>
              For payout enquiries: <a href={`mailto:${EMAIL}`} className="text-emerald-400">{EMAIL}</a>
            </p>
          </div>

        </div>
      </article>
    </div>
  );
}
