import React from "react";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-dark-900 border-t border-dark-700/60 pt-16 pb-12 text-gray-400 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand Col */}
          <div className="md:col-span-1 space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold text-white tracking-tight">RIFFMAX FUNDING</span>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              Global proprietary trading evaluation firm. Trade simulated capital, demonstrate consistency, and become eligible for performance rewards.
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-xs uppercase tracking-wider">Evaluation</h4>
            <ul className="space-y-2 text-xs">
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
            <h4 className="text-white font-semibold mb-4 text-xs uppercase tracking-wider">Legal</h4>
            <ul className="space-y-2 text-xs">
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
            <h4 className="text-white font-semibold mb-4 text-xs uppercase tracking-wider">Regulatory Disclaimer</h4>
            <p className="text-xs text-gray-400 leading-relaxed">
              All accounts provided to participants are simulated evaluation environments. RiffMax Funding does not solicit deposits or provide retail financial services. Simulated results do not represent actual live retail investments.
            </p>
          </div>
        </div>

        <div className="border-t border-dark-800 pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-400">
          <p>© {new Date().getFullYear()} RiffMax Funding. All rights reserved. Incorporated in Nigeria with global operational mandate.</p>
          <p className="mt-4 sm:mt-0 font-mono text-[10px]">Deterministic Server-Side Risk Engine v1.0</p>
        </div>
      </div>
    </footer>
  );
}
