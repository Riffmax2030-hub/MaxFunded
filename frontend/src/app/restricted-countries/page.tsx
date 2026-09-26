"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

// This list is configurable in the backend via RESTRICTED_COUNTRIES env var.
// This page displays a human-readable version. Keep in sync with backend config.
const RESTRICTED_COUNTRIES = [
  { code: "AF", name: "Afghanistan" },
  { code: "BY", name: "Belarus" },
  { code: "BI", name: "Burundi" },
  { code: "CF", name: "Central African Republic" },
  { code: "CU", name: "Cuba" },
  { code: "CD", name: "Democratic Republic of the Congo" },
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

const LAST_UPDATED = "1 September 2025";

export default function RestrictedCountriesPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Navbar />

      <section className="pt-24 pb-8 px-4 text-center bg-gradient-to-b from-gray-900 to-gray-950">
        <h1 className="text-3xl md:text-4xl font-extrabold mb-2">Restricted Countries</h1>
        <p className="text-gray-500 text-sm">Last Updated: {LAST_UPDATED}</p>
      </section>

      <section className="max-w-3xl mx-auto px-4 pb-24">
        <div className="bg-red-950/20 border border-red-700/30 rounded-xl p-5 mb-8">
          <p className="text-red-400 text-sm font-semibold mb-2">⚠ Access Not Available</p>
          <p className="text-gray-400 text-sm leading-relaxed">
            Residents and citizens of the following countries are not eligible to register for or
            participate in RiffMax Funding evaluation programmes. Restrictions are based on
            international sanctions, AML/CFT obligations, regulatory compliance requirements, and
            payment processing limitations. This list may be updated at any time without prior notice.
          </p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-gray-800 bg-gray-800/50">
            <h2 className="text-sm font-bold text-gray-300 uppercase tracking-wider">
              Currently Restricted Jurisdictions ({RESTRICTED_COUNTRIES.length})
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 divide-gray-800">
            {RESTRICTED_COUNTRIES.map((country) => (
              <div
                key={country.code}
                className="flex items-center gap-3 px-6 py-3 border-b border-gray-800/50"
              >
                <span className="text-gray-600 font-mono text-xs w-8">{country.code}</span>
                <span className="text-gray-300 text-sm">{country.name}</span>
                <span className="ml-auto text-red-500 text-xs">Restricted</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 space-y-4 text-gray-400 text-sm leading-relaxed">
          <p>
            <strong className="text-white">Why is my country restricted?</strong> Restrictions are
            applied based on OFAC (US Treasury), UN Security Council, FATF high-risk jurisdiction
            designations, EU sanctions lists, and payment processor limitations. These restrictions
            are not based on nationality or personal circumstances — they apply to all residents
            of listed jurisdictions.
          </p>
          <p>
            <strong className="text-white">Can restrictions change?</strong> Yes. Countries may be
            added or removed from this list as regulatory conditions change. If your country is
            currently restricted, you may not register. If your country is removed from the list
            in the future, you will be able to register at that time.
          </p>
          <p>
            <strong className="text-white">I believe my country should not be restricted.</strong> Contact
            us at <a href="mailto:compliance@riffmaxfunding.com" className="text-emerald-400">
              compliance@riffmaxfunding.com
            </a> with jurisdiction-specific information. We cannot make exceptions to active
            sanctions-based restrictions.
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
