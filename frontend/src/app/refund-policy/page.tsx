"use client";


const LAST_UPDATED = "1 September 2025";
const EMAIL = "support@maxfunded.com";

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <section className="pt-24 pb-8 px-4 text-center bg-gradient-to-b from-gray-900 to-gray-950">
        <h1 className="text-3xl md:text-4xl font-extrabold mb-2">Refund Policy</h1>
        <p className="text-slate-500 text-sm">Last Updated: {LAST_UPDATED}</p>
      </section>

      <article className="max-w-3xl mx-auto px-4 pb-24">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 space-y-8 text-slate-400 text-sm leading-relaxed">

          <div>
            <h2 className="text-white text-lg font-bold mb-3">General Rule — Non-Refundable</h2>
            <p>
              All evaluation fees paid to MaxFunded are <strong className="text-white">non-refundable</strong> as a
              general rule. Once an evaluation account has been provisioned and credentials delivered,
              the service has been rendered. This is consistent with common practice in the
              proprietary trading evaluation industry.
            </p>
          </div>

          <div>
            <h2 className="text-white text-lg font-bold mb-3">Exceptions — Refund May Be Considered</h2>
            <p className="mb-3">A refund request may be considered (not guaranteed) in the following limited circumstances:</p>
            <ul className="list-disc list-inside space-y-2">
              <li>
                <strong className="text-white">Technical failure on our part:</strong> Your account was never provisioned despite
                payment being confirmed, and the issue was caused by our systems (not your bank or
                payment processor).
              </li>
              <li>
                <strong className="text-white">Duplicate charge:</strong> You were charged more than once for the same order.
              </li>
              <li>
                <strong className="text-white">Restricted country error:</strong> Your purchase was accepted but you are a resident
                of a restricted country and should not have been permitted to purchase. (This situation
                should not occur under normal platform operation.)
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-white text-lg font-bold mb-3">Not Eligible for Refund</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>Challenges that have been breached (rule violation)</li>
              <li>Challenges where the trader has already received login credentials</li>
              <li>Challenges abandoned voluntarily</li>
              <li>Change of mind after purchase</li>
              <li>Failure to meet the profit target within a desired timeframe</li>
              <li>Chargebacks initiated without prior contact with our support team</li>
            </ul>
          </div>

          <div>
            <h2 className="text-white text-lg font-bold mb-3">How to Request a Refund</h2>
            <p>
              Email <a href={`mailto:${EMAIL}`} className="text-emerald-400">{EMAIL}</a> with subject
              line &ldquo;Refund Request — [your order ID]&rdquo;. Include your account email, order ID,
              amount paid, payment method, and a description of the issue. Requests are reviewed
              within 5 business days. Approved refunds are returned to the original payment method
              within 10 business days.
            </p>
          </div>

          <div>
            <h2 className="text-white text-lg font-bold mb-3">Chargebacks</h2>
            <p>
              Initiating a chargeback without first contacting our support team constitutes a
              violation of our Terms of Service and may result in permanent account suspension.
              We reserve the right to contest any chargeback and to provide evidence to the
              payment processor.
            </p>
          </div>

        </div>
      </article>
    </div>
  );
}
