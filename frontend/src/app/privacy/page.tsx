"use client";


const LAST_UPDATED = "1 September 2025";
const EMAIL = "privacy@maxfunded.com";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <section className="pt-24 pb-8 px-4 text-center bg-gradient-to-b from-gray-900 to-gray-950">
        <h1 className="text-3xl md:text-4xl font-extrabold mb-2">Privacy Policy</h1>
        <p className="text-slate-500 text-sm">Last Updated: {LAST_UPDATED}</p>
      </section>

      <article className="max-w-3xl mx-auto px-4 pb-24">
        <div className="space-y-8 text-slate-400 text-sm leading-relaxed">
          <div>
            <h2 className="text-white text-xl font-bold mb-3">1. Introduction</h2>
            <p>
              MaxFunded Global Ltd. (&ldquo;Company&rdquo;, &ldquo;we&rdquo;) is committed to protecting your personal data.
              This Privacy Policy explains what data we collect, why we collect it, how we use it,
              and your rights regarding it. It applies to all users of the MaxFunded platform.
            </p>
          </div>

          <div>
            <h2 className="text-white text-xl font-bold mb-3">2. Data We Collect</h2>
            <ul className="list-disc list-inside space-y-2">
              <li><strong className="text-white">Identity data:</strong> Full name, date of birth, nationality, government ID (for KYC-required stages)</li>
              <li><strong className="text-white">Contact data:</strong> Email address, country of residence</li>
              <li><strong className="text-white">Account data:</strong> Login credentials (stored hashed), challenge purchase history, trading performance data</li>
              <li><strong className="text-white">Payment data:</strong> Transaction references (we do not store full card numbers; payments are processed by third-party PCI-compliant providers)</li>
              <li><strong className="text-white">Usage data:</strong> IP address, browser type, pages visited, session duration — collected via cookies and server logs</li>
              <li><strong className="text-white">Communications:</strong> Support tickets and email correspondence</li>
            </ul>
          </div>

          <div>
            <h2 className="text-white text-xl font-bold mb-3">3. Why We Collect It (Legal Bases)</h2>
            <ul className="list-disc list-inside space-y-2">
              <li><strong className="text-white">Contract performance:</strong> To provide the evaluation service you purchased</li>
              <li><strong className="text-white">Legal obligation:</strong> KYC and AML compliance, tax reporting</li>
              <li><strong className="text-white">Legitimate interest:</strong> Platform security, fraud prevention, service improvement</li>
              <li><strong className="text-white">Consent:</strong> Marketing communications (you may opt out at any time)</li>
            </ul>
          </div>

          <div>
            <h2 className="text-white text-xl font-bold mb-3">4. How We Use Your Data</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>To create and manage your account</li>
              <li>To process payments and issue refunds</li>
              <li>To provision and monitor evaluation accounts</li>
              <li>To conduct compliance reviews for funded account candidates</li>
              <li>To communicate service updates and payout notifications</li>
              <li>To prevent fraud and enforce our Terms of Service</li>
            </ul>
          </div>

          <div>
            <h2 className="text-white text-xl font-bold mb-3">5. Data Sharing</h2>
            <p>
              We do not sell your personal data. We share data only with:
            </p>
            <ul className="list-disc list-inside space-y-2 mt-2">
              <li>Payment processors (for transaction processing)</li>
              <li>MT5 server providers (for account provisioning — name and account ID only)</li>
              <li>KYC verification providers (identity documents, for funded candidates only)</li>
              <li>Cloud infrastructure providers (data hosting)</li>
              <li>Legal authorities when required by law</li>
            </ul>
          </div>

          <div>
            <h2 className="text-white text-xl font-bold mb-3">6. International Data Transfers</h2>
            <p>
              Your data may be processed in countries outside your own. Where this occurs, we
              ensure appropriate safeguards are in place (e.g., standard contractual clauses,
              adequacy decisions). By using the platform, you consent to this transfer.
            </p>
          </div>

          <div>
            <h2 className="text-white text-xl font-bold mb-3">7. Data Retention</h2>
            <p>
              We retain account data for as long as your account is active and for 5 years
              thereafter for legal and compliance purposes. KYC documents are retained as required
              by applicable AML regulations. You may request deletion of non-obligatory data at
              any time.
            </p>
          </div>

          <div>
            <h2 className="text-white text-xl font-bold mb-3">8. Your Rights</h2>
            <p>Depending on your jurisdiction, you may have the right to:</p>
            <ul className="list-disc list-inside space-y-2 mt-2">
              <li>Access the personal data we hold about you</li>
              <li>Correct inaccurate data</li>
              <li>Request deletion (&ldquo;right to be forgotten&rdquo;) where applicable</li>
              <li>Object to or restrict certain processing</li>
              <li>Data portability</li>
              <li>Withdraw consent (for consent-based processing)</li>
            </ul>
            <p className="mt-3">Submit requests to: <a href={`mailto:${EMAIL}`} className="text-emerald-400">{EMAIL}</a></p>
          </div>

          <div>
            <h2 className="text-white text-xl font-bold mb-3">9. Cookies</h2>
            <p>
              We use essential cookies for authentication and session management, and optional
              analytics cookies. You may disable non-essential cookies in your browser settings.
              A detailed cookie notice is displayed at first visit.
            </p>
          </div>

          <div>
            <h2 className="text-white text-xl font-bold mb-3">10. Security</h2>
            <p>
              We use industry-standard security measures including encrypted data in transit (TLS),
              encrypted passwords (bcrypt), access controls, and audit logging. No system is
              completely secure; use strong, unique passwords and enable 2FA when available.
            </p>
          </div>

          <div>
            <h2 className="text-white text-xl font-bold mb-3">11. Contact</h2>
            <p>
              For privacy enquiries: <a href={`mailto:${EMAIL}`} className="text-emerald-400">{EMAIL}</a>
            </p>
          </div>
        </div>
      </article>
    </div>
  );
}
