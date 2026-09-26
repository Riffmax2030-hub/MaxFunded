"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const LAST_UPDATED = "1 September 2025";
const COMPANY = "Riffmax Technologies";
const BRAND = "RiffMax Funding";
const EMAIL = "legal@riffmaxfunding.com";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Navbar />
      <section className="pt-24 pb-8 px-4 text-center bg-gradient-to-b from-gray-900 to-gray-950">
        <h1 className="text-3xl md:text-4xl font-extrabold mb-2">Terms of Service</h1>
        <p className="text-gray-500 text-sm">Last Updated: {LAST_UPDATED}</p>
      </section>

      <article className="max-w-3xl mx-auto px-4 pb-24 prose prose-invert prose-sm max-w-none">
        <div className="bg-amber-950/20 border border-amber-700/30 rounded-xl p-5 mb-8 not-prose">
          <p className="text-amber-400 text-sm font-semibold mb-1">Important Notice</p>
          <p className="text-gray-400 text-sm">
            Please read these Terms of Service carefully before registering or purchasing any
            evaluation programme. By using this platform you agree to be bound by these terms.
            If you do not agree, do not register or use the service.
          </p>
        </div>

        <h2 className="text-white text-xl font-bold mt-8 mb-3">1. About Us</h2>
        <p className="text-gray-400">
          {BRAND} is a trading evaluation service operated by {COMPANY} (&ldquo;Company&rdquo;,
          &ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;). We provide structured evaluation
          programmes (&ldquo;Challenges&rdquo;) through which traders may demonstrate their trading
          ability in a simulated environment. We are not a broker, investment firm, or financial
          institution. We do not accept client deposits or manage client funds.
        </p>

        <h2 className="text-white text-xl font-bold mt-8 mb-3">2. Eligibility</h2>
        <p className="text-gray-400">
          You must be at least 18 years old and legally permitted to participate in trading
          evaluation programmes in your jurisdiction. Residents of restricted countries are not
          eligible. A full list of restricted countries is available at{" "}
          <a href="/restricted-countries" className="text-emerald-400">
            /restricted-countries
          </a>
          . By registering you confirm that you meet these requirements.
        </p>

        <h2 className="text-white text-xl font-bold mt-8 mb-3">3. Evaluation Accounts</h2>
        <p className="text-gray-400">
          Upon successful payment, you receive access to a simulated trading account (&ldquo;Evaluation
          Account&rdquo;) for the purpose of completing a Challenge. Evaluation Accounts are not real
          brokerage accounts. All positions and profits in an Evaluation Account are simulated and
          have no monetary value unless and until the Company, at its sole discretion, converts a
          passed evaluation into a funded arrangement.
        </p>

        <h2 className="text-white text-xl font-bold mt-8 mb-3">4. Fees & Payments</h2>
        <p className="text-gray-400">
          Evaluation fees are published on the platform and are due at the time of purchase. All
          fees are non-refundable except as expressly stated in the Refund Policy. Prices are quoted
          in USD. Currency conversion costs, payment processing fees, and taxes are the
          responsibility of the purchaser.
        </p>

        <h2 className="text-white text-xl font-bold mt-8 mb-3">5. Challenge Rules & Compliance</h2>
        <p className="text-gray-400">
          Each Challenge has defined rules (profit target, daily loss limit, maximum drawdown,
          minimum trading days, prohibited practices). These rules are published on the Rules page
          and within your dashboard. Violating any rule results in immediate Challenge termination
          (&ldquo;BREACHED&rdquo; status). No refund is issued for a breached challenge.
        </p>

        <h2 className="text-white text-xl font-bold mt-8 mb-3">6. Funded Accounts & Payouts</h2>
        <p className="text-gray-400">
          Passing an evaluation does not automatically create a contractual entitlement to a funded
          account. The Company will review your trading activity and, if approved, offer a funded
          arrangement under a separate agreement. Payout schedules, conditions, and profit splits
          are defined in the Payout Policy applicable at the time of the offer.
        </p>

        <h2 className="text-white text-xl font-bold mt-8 mb-3">7. Prohibited Conduct</h2>
        <p className="text-gray-400">
          You may not: (a) use prohibited trading strategies as defined in the Rules; (b) submit
          false identity or financial information; (c) share, sell, or transfer your account;
          (d) engage in coordinated trading with other participants to game evaluations; (e)
          attempt to reverse-engineer or exploit platform vulnerabilities; (f) use the platform for
          any unlawful purpose. Violation may result in immediate account termination and legal
          action.
        </p>

        <h2 className="text-white text-xl font-bold mt-8 mb-3">8. Intellectual Property</h2>
        <p className="text-gray-400">
          All platform content, branding, software, and documentation is owned by {COMPANY} or its
          licensors. You are granted a limited, non-exclusive, non-transferable licence to use the
          platform solely for your personal participation in evaluation programmes.
        </p>

        <h2 className="text-white text-xl font-bold mt-8 mb-3">9. Disclaimer of Warranties</h2>
        <p className="text-gray-400">
          THE PLATFORM IS PROVIDED &ldquo;AS IS&rdquo; AND &ldquo;AS AVAILABLE&rdquo; WITHOUT WARRANTIES OF ANY KIND.
          WE DO NOT GUARANTEE UNINTERRUPTED ACCESS, ACCURACY OF SIMULATED DATA, OR ANY PARTICULAR
          OUTCOME FROM YOUR PARTICIPATION.
        </p>

        <h2 className="text-white text-xl font-bold mt-8 mb-3">10. Limitation of Liability</h2>
        <p className="text-gray-400">
          TO THE MAXIMUM EXTENT PERMITTED BY LAW, THE COMPANY SHALL NOT BE LIABLE FOR ANY INDIRECT,
          INCIDENTAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING FROM YOUR USE OF THE PLATFORM.
          OUR AGGREGATE LIABILITY SHALL NOT EXCEED THE EVALUATION FEE PAID BY YOU IN THE PRIOR
          THREE MONTHS.
        </p>

        <h2 className="text-white text-xl font-bold mt-8 mb-3">11. Governing Law & Disputes</h2>
        <p className="text-gray-400">
          These Terms are governed by applicable law. Any disputes shall be resolved through
          good-faith negotiation. If unresolved within 30 days, disputes may be submitted to
          binding arbitration or the competent courts as required by applicable law.
        </p>

        <h2 className="text-white text-xl font-bold mt-8 mb-3">12. Changes to Terms</h2>
        <p className="text-gray-400">
          We may update these Terms. Material changes will be communicated by email and/or platform
          notice. Continued use after the effective date constitutes acceptance.
        </p>

        <h2 className="text-white text-xl font-bold mt-8 mb-3">13. Contact</h2>
        <p className="text-gray-400">
          For legal enquiries: <a href={`mailto:${EMAIL}`} className="text-emerald-400">{EMAIL}</a>
        </p>
      </article>

      <Footer />
    </div>
  );
}
