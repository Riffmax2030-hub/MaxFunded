import React from "react";
import Link from "next/link";
import Logo from "@/components/Logo";
import { BRAND } from "@/lib/branding";
import {
  DiscordIcon,
  TelegramIcon,
  XIcon,
  InstagramIcon,
  YoutubeIcon,
  LinkedinIcon,
} from "@/components/SocialIcons";

export default function Footer() {
  return (
    <footer className="bg-[#050608] border-t border-white/[0.06] pt-16 pb-12 text-neutral-300 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand Col */}
          <div className="md:col-span-1 space-y-4">
            <Link href="/" className="inline-block">
              <Logo size="md" />
            </Link>
            <p className="text-neutral-300 leading-relaxed text-sm">
              Next-generation proprietary trading evaluation firm. Trade simulated institutional capital, pass the objective evaluation, and keep up to 90% of performance rewards.
            </p>

            {/* Official Social Media Channels */}
            <div className="pt-2">
              <p className="text-xs font-mono uppercase tracking-widest text-neutral-400 mb-3">
                Official Channels
              </p>
              <div className="flex items-center gap-2.5">
                <a
                  href={BRAND.socials.discord}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Discord Community"
                  className="w-9 h-9 rounded-xl bg-white/5 hover:bg-[#5865F2] hover:text-white border border-white/10 flex items-center justify-center text-neutral-300 transition-all hover:scale-105"
                >
                  <DiscordIcon className="w-4 h-4" />
                </a>
                <a
                  href={BRAND.socials.telegram}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Telegram Channel"
                  className="w-9 h-9 rounded-xl bg-white/5 hover:bg-[#229ED9] hover:text-white border border-white/10 flex items-center justify-center text-neutral-300 transition-all hover:scale-105"
                >
                  <TelegramIcon className="w-4 h-4" />
                </a>
                <a
                  href={BRAND.socials.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="X (Twitter)"
                  className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white hover:text-black border border-white/10 flex items-center justify-center text-neutral-300 transition-all hover:scale-105"
                >
                  <XIcon className="w-4 h-4" />
                </a>
                <a
                  href={BRAND.socials.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="w-9 h-9 rounded-xl bg-white/5 hover:bg-[#E4405F] hover:text-white border border-white/10 flex items-center justify-center text-neutral-300 transition-all hover:scale-105"
                >
                  <InstagramIcon className="w-4 h-4" />
                </a>
                <a
                  href={BRAND.socials.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="YouTube Channel"
                  className="w-9 h-9 rounded-xl bg-white/5 hover:bg-[#FF0000] hover:text-white border border-white/10 flex items-center justify-center text-neutral-300 transition-all hover:scale-105"
                >
                  <YoutubeIcon className="w-4 h-4" />
                </a>
                <a
                  href={BRAND.socials.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn"
                  className="w-9 h-9 rounded-xl bg-white/5 hover:bg-[#0A66C2] hover:text-white border border-white/10 flex items-center justify-center text-neutral-300 transition-all hover:scale-105"
                >
                  <LinkedinIcon className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-white font-bold mb-4 text-sm uppercase tracking-wider">Evaluation</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/challenges" className="text-neutral-300 hover:text-white transition">Challenges Catalog</Link></li>
              <li><Link href="/how-it-works" className="text-neutral-300 hover:text-white transition">How It Works</Link></li>
              <li><Link href="/rules" className="text-neutral-300 hover:text-white transition">Trading Rules</Link></li>
              <li><Link href="/trading-conditions" className="text-neutral-300 hover:text-white transition">Trading Conditions</Link></li>
              <li><Link href="/faq" className="text-neutral-300 hover:text-white transition">FAQ</Link></li>
              <li><Link href="/about" className="text-neutral-300 hover:text-white transition">About Us</Link></li>
              <li><Link href="/contact" className="text-neutral-300 hover:text-white transition">Contact Support</Link></li>
            </ul>
          </div>

          {/* Compliance & Legal */}
          <div>
            <h4 className="text-white font-bold mb-4 text-sm uppercase tracking-wider">Legal & Compliance</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/terms" className="text-neutral-300 hover:text-white transition">Terms of Service</Link></li>
              <li><Link href="/privacy" className="text-neutral-300 hover:text-white transition">Privacy Policy</Link></li>
              <li><Link href="/risk-disclosure" className="text-neutral-300 hover:text-white transition">Risk Disclosure</Link></li>
              <li><Link href="/refund-policy" className="text-neutral-300 hover:text-white transition">Refund Policy</Link></li>
              <li><Link href="/payout-policy" className="text-neutral-300 hover:text-white transition">Payout Policy</Link></li>
              <li><Link href="/restricted-countries" className="text-neutral-300 hover:text-white transition">Restricted Countries</Link></li>
            </ul>
          </div>

          {/* Regulatory Note */}
          <div>
            <h4 className="text-white font-bold mb-4 text-sm uppercase tracking-wider">Regulatory Disclaimer</h4>
            <p className="text-neutral-400 leading-relaxed text-xs sm:text-sm">
              All accounts provided to participants are simulated evaluation environments with fictitious funds. MaxFunded does not solicit retail deposits or provide retail financial services. Simulated trading results do not represent actual live retail investment performance.
            </p>
          </div>
        </div>

        <div className="border-t border-white/[0.06] pt-8 flex flex-col sm:flex-row items-center justify-between text-neutral-400 text-xs sm:text-sm">
          <p>© 2026 MaxFunded. All rights reserved.</p>
          <p className="mt-4 sm:mt-0 font-mono text-xs text-neutral-500">MaxFunded Execution & Risk Engine v1.0</p>
        </div>
      </div>
    </footer>
  );
}
