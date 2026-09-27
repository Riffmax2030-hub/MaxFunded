import React from "react";
import Link from "next/link";
import Logo from "@/components/Logo";

export default function Footer() {
  return (
    <footer className="bg-[#050608] border-t border-white/[0.06] pt-16 pb-12 text-neutral-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand Col */}
          <div className="md:col-span-1 space-y-4">
            <Link href="/" className="inline-block">
              <Logo size="md" />
            </Link>
            <p className="text-neutral-400 leading-relaxed text-xs">
              Next-generation proprietary trading evaluation firm. Trade simulated institutional capital, pass the objective evaluation, and keep up to 90% of performance rewards.
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-white font-bold mb-4 text-xs uppercase tracking-wider">Evaluation</h4>
            <ul className="space-y-2.5">
              <li><Link href="/challenges" className="hover:text-white transition">Challenges Catalog</Link></li>
              <li><Link href="/how-it-works" className="hover:text-white transition">How It Works</Link></li>
              <li><Link href="/rules" className="hover:text-white transition">Trading Rules</Link></li>
              <li><Link href="/trading-conditions" className="hover:text-white transition">Trading Conditions</Link></li>
              <li><Link href="/faq" className="hover:text-white transition">FAQ</Link></li>
              <li><Link href="/about" className="hover:text-white transition">About Us</Link></li>
              <li><Link href="/contact" className="hover:text-white transition">Contact Support</Link></li>
            </ul>
          </div>

          {/* Compliance & Legal */}
          <div>
            <h4 className="text-white font-bold mb-4 text-xs uppercase tracking-wider">Legal & Compliance</h4>
            <ul className="space-y-2.5">
              <li><Link href="/terms" className="hover:text-white transition">Terms of Service</Link></li>
              <li><Link href="/privacy" className="hover:text-white transition">Privacy Policy</Link></li>
              <li><Link href="/risk-disclosure" className="hover:text-white transition">Risk Disclosure</Link></li>
              <li><Link href="/refund-policy" className="hover:text-white transition">Refund Policy</Link></li>
              <li><Link href="/payout-policy" className="hover:text-white transition">Payout Policy</Link></li>
              <li><Link href="/restricted-countries" className="hover:text-white transition">Restricted Countries</Link></li>
            </ul>
          </div>

          {/* Regulatory Note */}
          <div>
            <h4 className="text-white font-bold mb-4 text-xs uppercase tracking-wider">Regulatory Disclaimer</h4>
            <p className="text-neutral-400 leading-relaxed text-[11px]">
              All accounts provided to participants are simulated evaluation environments with fictitious funds. MaxFunded does not solicit retail deposits or provide retail financial services. Simulated trading results do not represent actual live retail investment performance.
            </p>
          </div>
        </div>

        <div className="border-t border-white/[0.06] pt-8 flex flex-col sm:flex-row items-center justify-between text-neutral-500 text-xs">
          <p>© 2026 MaxFunded. All rights reserved.</p>
          <p className="mt-4 sm:mt-0 font-mono text-[11px] text-neutral-600">MaxFunded Execution & Risk Engine v1.0</p>
        </div>
      </div>
    </footer>
  );
}
