import Link from "next/link";

const LAST_UPDATED = "1 September 2025";
const COMPANY = "MaxFunded Global Ltd.";
const BRAND = "MaxFunded";
const EMAIL = "support@maxfunded.com";

export default function RefundPolicyPage() {
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
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-2">Refund Policy</h1>
          <p className="text-gray-500 text-sm">Last updated: {LAST_UPDATED} · {COMPANY}</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 grid grid-cols-1 lg:grid-cols-4 gap-10">
        <aside className="hidden lg:block lg:col-span-1">
          <div className="sticky top-20">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Contents</p>
            <nav className="space-y-1 text-sm">
              {["General Rule","Exceptions","Not Eligible","How to Request","Chargebacks"].map((item, i) => (
                <a key={i} href={`#rf${i+1}`} className="block text-gray-500 hover:text-black py-0.5 hover:underline transition-colors">
                  {i+1}. {item}
                </a>
              ))}
            </nav>
          </div>
        </aside>

        <article className="lg:col-span-3 text-gray-700 text-sm leading-7">
          <div className="bg-amber-50 border-l-4 border-amber-400 rounded-r-lg px-5 py-4 mb-10">
            <p className="font-semibold text-amber-800 mb-1">Evaluation Fees Are Non-Refundable</p>
            <p className="text-amber-700 text-sm">As a general rule, all evaluation fees are non-refundable once account credentials have been delivered. Please read the exceptions below.</p>
          </div>

          <section id="rf1" className="mb-8">
            <h2 className="text-lg font-bold text-gray-900 mb-3 pb-2 border-b border-gray-100">1. General Rule — Non-Refundable</h2>
            <p>
              All evaluation fees paid to {BRAND} are <strong>non-refundable</strong> as a general rule. Once an evaluation
              account has been provisioned and credentials delivered, the service has been rendered. This is consistent with
              common practice in the proprietary trading evaluation industry.
            </p>
          </section>

          <section id="rf2" className="mb-8">
            <h2 className="text-lg font-bold text-gray-900 mb-3 pb-2 border-b border-gray-100">2. Exceptions — Refund May Be Considered</h2>
            <p className="mb-3">A refund request may be considered (not guaranteed) in the following limited circumstances:</p>
            <ul className="space-y-3">
              {[
                { label: "Technical failure on our part", detail: "Your account was never provisioned despite payment being confirmed, and the issue was caused by our systems (not your bank or payment processor)." },
                { label: "Duplicate charge", detail: "You were charged more than once for the same order." },
                { label: "Restricted country error", detail: "Your purchase was accepted but you are a resident of a restricted country and should not have been permitted to purchase." },
              ].map(({ label, detail }) => (
                <li key={label} className="flex items-start gap-3">
                  <span className="mt-2 w-1.5 h-1.5 rounded-full bg-gray-400 shrink-0" />
                  <p><strong className="text-gray-900">{label}:</strong> {detail}</p>
                </li>
              ))}
            </ul>
          </section>

          <section id="rf3" className="mb-8">
            <h2 className="text-lg font-bold text-gray-900 mb-3 pb-2 border-b border-gray-100">3. Not Eligible for Refund</h2>
            <ul className="space-y-2">
              {[
                "Challenges that have been breached (rule violation)",
                "Challenges where the trader has already received login credentials",
                "Challenges abandoned voluntarily",
                "Change of mind after purchase",
                "Failure to meet the profit target within a desired timeframe",
                "Chargebacks initiated without prior contact with our support team",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="mt-2 w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section id="rf4" className="mb-8">
            <h2 className="text-lg font-bold text-gray-900 mb-3 pb-2 border-b border-gray-100">4. How to Request a Refund</h2>
            <p>
              Email <a href={`mailto:${EMAIL}`} className="text-blue-600 underline">{EMAIL}</a> with subject line
              "Refund Request — [your order ID]". Include your account email, order ID, amount paid, payment method, and
              a description of the issue. Requests are reviewed within 5 business days. Approved refunds are returned to
              the original payment method within 10 business days.
            </p>
          </section>

          <section id="rf5" className="mb-8">
            <h2 className="text-lg font-bold text-gray-900 mb-3 pb-2 border-b border-gray-100">5. Chargebacks</h2>
            <p>
              Initiating a chargeback without first contacting our support team constitutes a violation of our Terms of
              Service and may result in permanent account suspension. We reserve the right to contest any chargeback and
              to provide evidence to the payment processor.
            </p>
          </section>

          <div className="mt-12 pt-6 border-t border-gray-200 text-xs text-gray-400">
            <p>&copy; 2025 {COMPANY}. All rights reserved.</p>
          </div>
        </article>
      </div>
    </div>
  );
}
