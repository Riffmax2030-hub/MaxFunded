import Link from "next/link";

const BRAND = "MaxFunded";
const COMPANY = "MaxFunded Global Ltd.";
const LAST_UPDATED = "1 September 2025";

const RESTRICTED_COUNTRIES = [
  { code: "AF", name: "Afghanistan" },
  { code: "BY", name: "Belarus" },
  { code: "BI", name: "Burundi" },
  { code: "CF", name: "Central African Republic" },
  { code: "CU", name: "Cuba" },
  { code: "CD", name: "DR Congo" },
  { code: "ER", name: "Eritrea" },
  { code: "ET", name: "Ethiopia" },
  { code: "GN", name: "Guinea" },
  { code: "GW", name: "Guinea-Bissau" },
  { code: "HT", name: "Haiti" },
  { code: "IR", name: "Iran" },
  { code: "IQ", name: "Iraq" },
  { code: "KP", name: "North Korea (DPRK)" },
  { code: "LB", name: "Lebanon" },
  { code: "LY", name: "Libya" },
  { code: "ML", name: "Mali" },
  { code: "MM", name: "Myanmar" },
  { code: "NI", name: "Nicaragua" },
  { code: "RU", name: "Russia" },
  { code: "SO", name: "Somalia" },
  { code: "SS", name: "South Sudan" },
  { code: "SD", name: "Sudan" },
  { code: "SY", name: "Syria" },
  { code: "VE", name: "Venezuela" },
  { code: "YE", name: "Yemen" },
  { code: "ZW", name: "Zimbabwe" },
];

export default function RestrictedCountriesPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="border-b border-gray-200 bg-white sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/" className="text-sm font-bold text-gray-900 hover:text-black">← {BRAND}</Link>
          <span className="text-xs text-gray-400">Compliance</span>
        </div>
      </div>

      <div className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-block bg-black text-white text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded">Compliance</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-2">Restricted Countries</h1>
          <p className="text-gray-500 text-sm">Last updated: {LAST_UPDATED} · {COMPANY}</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-8">

        {/* Warning banner */}
        <div className="bg-red-50 border-l-4 border-red-500 rounded-r-xl px-5 py-4">
          <p className="font-semibold text-red-800 mb-1">Access Restricted</p>
          <p className="text-red-700 text-sm leading-relaxed">
            Residents and citizens of the following countries are not eligible to register for or participate in{" "}
            {BRAND} evaluation programmes. Restrictions are based on international sanctions, AML/CFT obligations,
            regulatory compliance requirements, and payment processing limitations. This list may be updated at any
            time without prior notice.
          </p>
        </div>

        {/* Country list */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-gray-900">
              Restricted Jurisdictions
            </h2>
            <span className="text-xs font-bold text-gray-500 bg-gray-100 border border-gray-200 px-2.5 py-1 rounded-full">
              {RESTRICTED_COUNTRIES.length} countries
            </span>
          </div>

          <div className="border border-gray-200 rounded-xl overflow-hidden">
            <div className="grid grid-cols-1 sm:grid-cols-2">
              {RESTRICTED_COUNTRIES.map((country, i) => (
                <div
                  key={country.code}
                  className={`flex items-center gap-3 px-5 py-3 border-b border-gray-100 ${
                    i % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                  }`}
                >
                  <span className="text-gray-400 font-mono text-xs w-7 shrink-0">{country.code}</span>
                  <span className="text-gray-800 text-sm flex-1">{country.name}</span>
                  <span className="shrink-0 text-[10px] font-bold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
                    Restricted
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* FAQs */}
        <div className="space-y-4">
          <h2 className="text-base font-bold text-gray-900">Frequently Asked Questions</h2>

          {[
            {
              q: "Why is my country restricted?",
              a: "Restrictions are applied based on OFAC (US Treasury), UN Security Council, FATF high-risk jurisdiction designations, EU sanctions lists, and payment processor limitations. These restrictions apply to all residents of listed jurisdictions — not based on nationality or personal circumstances.",
            },
            {
              q: "Can restrictions change?",
              a: "Yes. Countries may be added or removed from this list as regulatory conditions change. If your country is currently restricted, you may not register. If your country is removed from the list in the future, you will be able to register at that time.",
            },
            {
              q: "I believe my country should not be restricted.",
              a: null,
              contact: "compliance@maxfunded.com",
            },
          ].map(({ q, a, contact }) => (
            <div key={q} className="border border-gray-200 rounded-xl px-6 py-5 bg-white">
              <p className="font-semibold text-gray-900 mb-2">{q}</p>
              {a ? (
                <p className="text-gray-600 text-sm leading-relaxed">{a}</p>
              ) : (
                <p className="text-gray-600 text-sm leading-relaxed">
                  Contact us at{" "}
                  <a href={`mailto:${contact}`} className="text-blue-600 underline">{contact}</a>{" "}
                  with jurisdiction-specific information. We cannot make exceptions to active sanctions-based restrictions.
                </p>
              )}
            </div>
          ))}
        </div>

        <div className="pt-6 border-t border-gray-200 text-xs text-gray-400">
          <p>&copy; 2025 {COMPANY}. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
