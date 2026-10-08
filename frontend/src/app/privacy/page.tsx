import Link from "next/link";

const LAST_UPDATED = "1 September 2025";
const COMPANY = "MaxFunded Global Ltd.";
const BRAND = "MaxFunded";
const EMAIL = "privacy@maxfunded.com";

export default function PrivacyPage() {
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
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-2 text-left">Privacy Policy</h1>
          <p className="text-gray-500 text-sm text-left">Last updated: {LAST_UPDATED} &nbsp;·&nbsp; {COMPANY}</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 grid grid-cols-1 lg:grid-cols-4 gap-10">
        {/* Sticky sidebar TOC */}
        <aside className="hidden lg:block lg:col-span-1">
          <div className="sticky top-20">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Contents</p>
            <nav className="space-y-1 text-sm">
              {["Introduction","Data We Collect","Why We Collect It","How We Use It","Data Sharing","International Transfers","Data Retention","Your Rights","Cookies","Security","Contact"].map((item, i) => (
                <a key={i} href={`#p${i+1}`} className="block text-gray-500 hover:text-black py-0.5 hover:underline transition-colors">
                  {i+1}. {item}
                </a>
              ))}
            </nav>
          </div>
        </aside>

        {/* Main content */}
        <article className="lg:col-span-3 text-gray-700 text-sm leading-7">
          <section id="p1" className="mb-8">
            <h2 className="text-lg font-bold text-gray-900 mb-3 pb-2 border-b border-gray-100">1. Introduction</h2>
            <p>
              {COMPANY} ("Company", "we") is committed to protecting your personal data. This Privacy Policy explains what
              data we collect, why we collect it, how we use it, and your rights regarding it. It applies to all users of
              the {BRAND} platform.
            </p>
          </section>

          <section id="p2" className="mb-8">
            <h2 className="text-lg font-bold text-gray-900 mb-3 pb-2 border-b border-gray-100">2. Data We Collect</h2>
            <div className="space-y-3">
              {[
                { label: "Identity data", value: "Full name, date of birth, nationality, government ID (for KYC-required stages)" },
                { label: "Contact data", value: "Email address, country of residence" },
                { label: "Account data", value: "Login credentials (stored hashed), challenge purchase history, trading performance data" },
                { label: "Payment data", value: "Transaction references (we do not store full card numbers; payments processed by third-party PCI-compliant providers)" },
                { label: "Usage data", value: "IP address, browser type, pages visited, session duration — collected via cookies and server logs" },
                { label: "Communications", value: "Support tickets and email correspondence" },
              ].map(({ label, value }) => (
                <div key={label} className="flex gap-3">
                  <div className="shrink-0 w-1 mt-2 bg-gray-200 rounded-full" />
                  <p><strong className="text-gray-900">{label}:</strong> {value}</p>
                </div>
              ))}
            </div>
          </section>

          <section id="p3" className="mb-8">
            <h2 className="text-lg font-bold text-gray-900 mb-3 pb-2 border-b border-gray-100">3. Why We Collect It (Legal Bases)</h2>
            <div className="space-y-3">
              {[
                { label: "Contract performance", value: "To provide the evaluation service you purchased" },
                { label: "Legal obligation", value: "KYC and AML compliance, tax reporting" },
                { label: "Legitimate interest", value: "Platform security, fraud prevention, service improvement" },
                { label: "Consent", value: "Marketing communications (you may opt out at any time)" },
              ].map(({ label, value }) => (
                <div key={label} className="flex gap-3">
                  <div className="shrink-0 w-1 mt-2 bg-gray-200 rounded-full" />
                  <p><strong className="text-gray-900">{label}:</strong> {value}</p>
                </div>
              ))}
            </div>
          </section>

          <section id="p4" className="mb-8">
            <h2 className="text-lg font-bold text-gray-900 mb-3 pb-2 border-b border-gray-100">4. How We Use Your Data</h2>
            <ul className="space-y-2">
              {[
                "To create and manage your account",
                "To process payments and issue refunds",
                "To provision and monitor evaluation accounts",
                "To conduct compliance reviews for funded account candidates",
                "To communicate service updates and payout notifications",
                "To prevent fraud and enforce our Terms of Service",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="mt-2 w-1.5 h-1.5 rounded-full bg-gray-400 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section id="p5" className="mb-8">
            <h2 className="text-lg font-bold text-gray-900 mb-3 pb-2 border-b border-gray-100">5. Data Sharing</h2>
            <p className="mb-3">We do not sell your personal data. We share data only with:</p>
            <ul className="space-y-2">
              {[
                "Payment processors (for transaction processing)",
                "MT5 server providers (for account provisioning — name and account ID only)",
                "KYC verification providers (identity documents, for funded candidates only)",
                "Cloud infrastructure providers (data hosting)",
                "Legal authorities when required by law",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="mt-2 w-1.5 h-1.5 rounded-full bg-gray-400 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section id="p6" className="mb-8">
            <h2 className="text-lg font-bold text-gray-900 mb-3 pb-2 border-b border-gray-100">6. International Data Transfers</h2>
            <p>
              Your data may be processed in countries outside your own. Where this occurs, we ensure appropriate safeguards
              are in place (e.g., standard contractual clauses, adequacy decisions). By using the platform, you consent to
              this transfer.
            </p>
          </section>

          <section id="p7" className="mb-8">
            <h2 className="text-lg font-bold text-gray-900 mb-3 pb-2 border-b border-gray-100">7. Data Retention</h2>
            <p>
              We retain account data for as long as your account is active and for 5 years thereafter for legal and
              compliance purposes. KYC documents are retained as required by applicable AML regulations. You may request
              deletion of non-obligatory data at any time.
            </p>
          </section>

          <section id="p8" className="mb-8">
            <h2 className="text-lg font-bold text-gray-900 mb-3 pb-2 border-b border-gray-100">8. Your Rights</h2>
            <p className="mb-3">Depending on your jurisdiction, you may have the right to:</p>
            <ul className="space-y-2">
              {[
                "Access the personal data we hold about you",
                "Correct inaccurate data",
                'Request deletion ("right to be forgotten") where applicable',
                "Object to or restrict certain processing",
                "Data portability",
                "Withdraw consent (for consent-based processing)",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="mt-2 w-1.5 h-1.5 rounded-full bg-gray-400 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <p className="mt-4">
              Submit requests to:{" "}
              <a href={`mailto:${EMAIL}`} className="text-blue-600 underline">{EMAIL}</a>
            </p>
          </section>

          <section id="p9" className="mb-8">
            <h2 className="text-lg font-bold text-gray-900 mb-3 pb-2 border-b border-gray-100">9. Cookies</h2>
            <p>
              We use essential cookies for authentication and session management, and optional analytics cookies. You may
              disable non-essential cookies in your browser settings. A detailed cookie notice is displayed at first visit.
            </p>
          </section>

          <section id="p10" className="mb-8">
            <h2 className="text-lg font-bold text-gray-900 mb-3 pb-2 border-b border-gray-100">10. Security</h2>
            <p>
              We use industry-standard security measures including encrypted data in transit (TLS), encrypted passwords
              (bcrypt), access controls, and audit logging. No system is completely secure; use strong, unique passwords
              and enable 2FA when available.
            </p>
          </section>

          <section id="p11" className="mb-8">
            <h2 className="text-lg font-bold text-gray-900 mb-3 pb-2 border-b border-gray-100">11. Contact</h2>
            <p>
              For privacy enquiries:{" "}
              <a href={`mailto:${EMAIL}`} className="text-blue-600 underline">{EMAIL}</a>
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
