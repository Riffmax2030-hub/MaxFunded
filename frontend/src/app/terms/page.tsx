import Link from "next/link";

const LAST_UPDATED = "1 September 2025";
const COMPANY = "MaxFunded Global Ltd.";
const BRAND = "MaxFunded";
const EMAIL = "legal@maxfunded.com";

export default function TermsPage() {
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
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-2 text-left">Terms of Service</h1>
          <p className="text-gray-500 text-sm text-left">Last updated: {LAST_UPDATED} &nbsp;·&nbsp; {COMPANY}</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 grid grid-cols-1 lg:grid-cols-4 gap-10">
        {/* Sticky sidebar TOC */}
        <aside className="hidden lg:block lg:col-span-1">
          <div className="sticky top-20">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Contents</p>
            <nav className="space-y-1 text-sm">
              {["About Us","Eligibility","Evaluation Accounts","Fees & Payments","Challenge Rules","Funded Accounts","Prohibited Conduct","Intellectual Property","Warranties","Liability","Governing Law","Changes","Contact"].map((item, i) => (
                <a key={i} href={`#s${i+1}`} className="block text-gray-500 hover:text-black py-0.5 hover:underline transition-colors">
                  {i+1}. {item}
                </a>
              ))}
            </nav>
          </div>
        </aside>

        {/* Main content */}
        <article className="lg:col-span-3 text-gray-700 text-sm leading-7">
          {/* Important notice */}
          <div className="bg-amber-50 border-l-4 border-amber-400 rounded-r-lg px-5 py-4 mb-10">
            <p className="font-semibold text-amber-800 mb-1">Important Notice</p>
            <p className="text-amber-700 text-sm">
              Please read these Terms of Service carefully before registering or purchasing any evaluation programme.
              By using this platform you agree to be bound by these terms. If you do not agree, do not register or use the service.
            </p>
          </div>

          <section id="s1" className="mb-8">
            <h2 className="text-lg font-bold text-gray-900 mb-3 pb-2 border-b border-gray-100">1. About Us</h2>
            <p>
              {BRAND} is a trading evaluation service operated by {COMPANY} ("Company", "we", "us", or "our"). We provide
              structured evaluation programmes ("Challenges") through which traders may demonstrate their trading ability in a
              simulated environment. We are not a broker, investment firm, or financial institution. We do not accept client
              deposits or manage client funds.
            </p>
          </section>

          <section id="s2" className="mb-8">
            <h2 className="text-lg font-bold text-gray-900 mb-3 pb-2 border-b border-gray-100">2. Eligibility</h2>
            <p>
              You must be at least 18 years old and legally permitted to participate in trading evaluation programmes in
              your jurisdiction. Residents of restricted countries are not eligible. A full list is available at{" "}
              <Link href="/restricted-countries" className="text-blue-600 underline">/restricted-countries</Link>.
              By registering you confirm that you meet these requirements.
            </p>
          </section>

          <section id="s3" className="mb-8">
            <h2 className="text-lg font-bold text-gray-900 mb-3 pb-2 border-b border-gray-100">3. Evaluation Accounts</h2>
            <p>
              Upon successful payment, you receive access to a simulated trading account ("Evaluation Account") for the purpose
              of completing a Challenge. Evaluation Accounts are not real brokerage accounts. All positions and profits in an
              Evaluation Account are simulated and have no monetary value unless and until the Company, at its sole discretion,
              converts a passed evaluation into a funded arrangement.
            </p>
          </section>

          <section id="s4" className="mb-8">
            <h2 className="text-lg font-bold text-gray-900 mb-3 pb-2 border-b border-gray-100">4. Fees &amp; Payments</h2>
            <p>
              Evaluation fees are published on the platform and are due at the time of purchase. All fees are non-refundable
              except as expressly stated in the Refund Policy. Prices are quoted in USD. Currency conversion costs, payment
              processing fees, and taxes are the responsibility of the purchaser.
            </p>
          </section>

          <section id="s5" className="mb-8">
            <h2 className="text-lg font-bold text-gray-900 mb-3 pb-2 border-b border-gray-100">5. Challenge Rules &amp; Compliance</h2>
            <p>
              Each Challenge has defined rules (profit target, daily loss limit, maximum drawdown, minimum trading days,
              prohibited practices). These rules are published on the Rules page and within your dashboard. Violating any rule
              results in immediate Challenge termination ("BREACHED" status). No refund is issued for a breached challenge.
            </p>
          </section>

          <section id="s6" className="mb-8">
            <h2 className="text-lg font-bold text-gray-900 mb-3 pb-2 border-b border-gray-100">6. Funded Accounts &amp; Payouts</h2>
            <p>
              Passing an evaluation does not automatically create a contractual entitlement to a funded account. The Company
              will review your trading activity and, if approved, offer a funded arrangement under a separate agreement. Payout
              schedules, conditions, and profit splits are defined in the Payout Policy applicable at the time of the offer.
            </p>
          </section>

          <section id="s7" className="mb-8">
            <h2 className="text-lg font-bold text-gray-900 mb-3 pb-2 border-b border-gray-100">7. Prohibited Conduct</h2>
            <p>You may not:</p>
            <ul className="list-none space-y-2 mt-3">
              {[
                "Use prohibited trading strategies as defined in the Rules",
                "Submit false identity or financial information",
                "Share, sell, or transfer your account",
                "Engage in coordinated trading with other participants to game evaluations",
                "Attempt to reverse-engineer or exploit platform vulnerabilities",
                "Use the platform for any unlawful purpose",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-gray-400 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <p className="mt-3">Violation may result in immediate account termination and legal action.</p>
          </section>

          <section id="s8" className="mb-8">
            <h2 className="text-lg font-bold text-gray-900 mb-3 pb-2 border-b border-gray-100">8. Intellectual Property</h2>
            <p>
              All platform content, branding, software, and documentation is owned by {COMPANY} or its licensors. You are
              granted a limited, non-exclusive, non-transferable licence to use the platform solely for your personal
              participation in evaluation programmes.
            </p>
          </section>

          <section id="s9" className="mb-8">
            <h2 className="text-lg font-bold text-gray-900 mb-3 pb-2 border-b border-gray-100">9. Disclaimer of Warranties</h2>
            <p>
              The platform is provided "as is" and "as available" without warranties of any kind. We do not guarantee
              uninterrupted access, accuracy of simulated data, or any particular outcome from your participation.
            </p>
          </section>

          <section id="s10" className="mb-8">
            <h2 className="text-lg font-bold text-gray-900 mb-3 pb-2 border-b border-gray-100">10. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by law, the Company shall not be liable for any indirect, incidental,
              consequential, or punitive damages arising from your use of the platform. Our aggregate liability shall not
              exceed the evaluation fee paid by you in the prior three months.
            </p>
          </section>

          <section id="s11" className="mb-8">
            <h2 className="text-lg font-bold text-gray-900 mb-3 pb-2 border-b border-gray-100">11. Governing Law &amp; Disputes</h2>
            <p>
              These Terms are governed by applicable law. Any disputes shall be resolved through good-faith negotiation. If
              unresolved within 30 days, disputes may be submitted to binding arbitration or the competent courts as required
              by applicable law.
            </p>
          </section>

          <section id="s12" className="mb-8">
            <h2 className="text-lg font-bold text-gray-900 mb-3 pb-2 border-b border-gray-100">12. Changes to Terms</h2>
            <p>
              We may update these Terms. Material changes will be communicated by email and/or platform notice. Continued use
              after the effective date constitutes acceptance.
            </p>
          </section>

          <section id="s13" className="mb-8">
            <h2 className="text-lg font-bold text-gray-900 mb-3 pb-2 border-b border-gray-100">13. Contact</h2>
            <p>
              For legal enquiries:{" "}
              <a href={`mailto:${EMAIL}`} className="text-blue-600 underline">{EMAIL}</a>
            </p>
          </section>

          {/* Footer notice */}
          <div className="mt-12 pt-6 border-t border-gray-200 text-xs text-gray-400">
            <p>&copy; 2025 {COMPANY}. All rights reserved.</p>
          </div>
        </article>
      </div>
    </div>
  );
}
