import Link from "next/link";
import { ArrowLeft, Shield, Cpu, Activity, Zap, Info } from "lucide-react";

const BRAND = "MaxFunded";
const COMPANY = "MaxFunded Global Ltd.";

const instruments = [
  {
    category: "Forex Majors",
    pairs: ["EUR/USD", "GBP/USD", "USD/JPY", "USD/CHF", "AUD/USD", "USD/CAD", "NZD/USD"],
    maxLeverage: "1:100",
    typicalSpread: "0.1–0.3 pips",
    commission: "None (spread-only)",
    swaps: "Yes (overnight)",
  },
  {
    category: "Forex Minors",
    pairs: ["EUR/GBP", "EUR/JPY", "GBP/JPY", "AUD/JPY", "EUR/AUD", "GBP/CHF"],
    maxLeverage: "1:50",
    typicalSpread: "0.5–1.5 pips",
    commission: "None (spread-only)",
    swaps: "Yes (overnight)",
  },
  {
    category: "Indices",
    pairs: ["US30", "US500", "NAS100", "GER40", "UK100", "AUS200"],
    maxLeverage: "1:20",
    typicalSpread: "1–3 points",
    commission: "None (spread-only)",
    swaps: "Yes (overnight)",
  },
  {
    category: "Commodities",
    pairs: ["XAUUSD (Gold)", "XAGUSD (Silver)", "USOIL (Crude)", "UKOIL (Brent)"],
    maxLeverage: "1:20",
    typicalSpread: "Market-dependent",
    commission: "None (spread-only)",
    swaps: "Yes (overnight)",
  },
  {
    category: "Cryptocurrencies",
    pairs: ["BTCUSD", "ETHUSD", "LTCUSD"],
    maxLeverage: "1:2",
    typicalSpread: "Market-dependent",
    commission: "None (spread-only)",
    swaps: "Not applicable",
  },
];

const conditions = [
  { label: "Trading Platform", value: "MetaTrader 5 (MT5)" },
  { label: "Execution Model", value: "Market Execution (Direct Tier-1 Liquidity)" },
  { label: "Account Currency", value: "USD" },
  { label: "Minimum Lot Size", value: "0.01 lots" },
  { label: "Maximum Open Positions", value: "Unlimited (subject to margin)" },
  { label: "Hedging", value: "Allowed" },
  { label: "Expert Advisors (EAs)", value: "Allowed (Standard non-latency EAs)" },
  { label: "News Trading", value: "Allowed on all standard challenges" },
  { label: "Slippage", value: "Real market simulated slippage" },
  { label: "Server Time", value: "UTC+2 / UTC+3 (DST-adjusted)" },
  { label: "Market Hours", value: "Forex: 24/5 | Crypto: 24/7 | Indices: Exchange hours" },
  { label: "Minimum Trading Days", value: "0 Days (No Minimum Days Required)" },
];

export default function TradingConditionsPage() {
  return (
    <div className="min-h-screen bg-[#070809] text-white">
      {/* Top Navbar Header */}
      <header className="border-b border-white/10 bg-[#070809]/80 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm font-bold text-neutral-300 hover:text-[#ccff00] transition"
          >
            <ArrowLeft className="w-4 h-4 text-[#ccff00]" /> Back to MaxFunded
          </Link>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#ccff00] animate-pulse" />
            <span className="text-xs font-mono text-neutral-400 uppercase tracking-widest">
              Live MT5 Specifications
            </span>
          </div>
        </div>
      </header>

      {/* Hero Banner */}
      <section className="relative overflow-hidden py-16 px-4 sm:px-6 border-b border-white/5">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-[#ccff00]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-6xl mx-auto relative z-10 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 bg-[#ccff00]/10 border border-[#ccff00]/20 text-[#ccff00] text-xs font-mono px-3.5 py-1.5 rounded-full mb-4">
            <Cpu className="w-3.5 h-3.5" /> INSTITUTIONAL LIQUIDITY FEED
          </div>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight mb-4">
            Trading <span className="text-[#ccff00]">Conditions</span>
          </h1>
          <p className="text-neutral-400 text-base max-w-3xl leading-relaxed">
            Institutional spreads from 0.0 pips, up to 1:100 leverage, ultra-fast execution on MetaTrader 5, and zero minimum trading days. Everything you need to scale your simulated edge.
          </p>
        </div>
      </section>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-12 space-y-12">
        {/* General conditions bento card */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-5 h-5 text-[#ccff00]" />
            <h2 className="text-xl font-bold tracking-tight text-white">General Account Specifications</h2>
          </div>
          <div className="bento-card bg-[#0b0c0e] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
            <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-white/5">
              <div className="divide-y divide-white/5">
                {conditions.slice(0, 6).map((row) => (
                  <div key={row.label} className="flex items-center justify-between px-6 py-4 hover:bg-white/[0.02] transition">
                    <span className="text-sm text-neutral-400 font-medium">{row.label}</span>
                    <span className="text-sm font-semibold text-white font-mono text-right">{row.value}</span>
                  </div>
                ))}
              </div>
              <div className="divide-y divide-white/5">
                {conditions.slice(6).map((row) => (
                  <div key={row.label} className="flex items-center justify-between px-6 py-4 hover:bg-white/[0.02] transition">
                    <span className="text-sm text-neutral-400 font-medium">{row.label}</span>
                    <span className={`text-sm font-semibold font-mono text-right ${row.label === "Minimum Trading Days" ? "text-[#ccff00] font-bold" : "text-white"}`}>
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Instruments Breakdown */}
        <section>
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-5 h-5 text-[#ccff00]" />
            <h2 className="text-xl font-bold tracking-tight text-white">Available Instruments & Margins</h2>
          </div>
          <p className="text-neutral-400 text-sm mb-6">
            All evaluation accounts offer access to major global markets with institutional simulated fills.
          </p>

          <div className="grid grid-cols-1 gap-5">
            {instruments.map((inst) => (
              <div
                key={inst.category}
                className="bento-card bg-[#0b0c0e] border border-white/10 rounded-2xl p-6 hover:border-[#ccff00]/30 transition group"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-white/5 gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#ccff00]" />
                    <h3 className="font-bold text-white text-lg tracking-tight">{inst.category}</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="bg-[#ccff00]/10 text-[#ccff00] border border-[#ccff00]/20 text-xs font-mono font-bold px-3 py-1 rounded-full">
                      Leverage: {inst.maxLeverage}
                    </span>
                  </div>
                </div>

                <div className="py-4">
                  <span className="text-xs text-neutral-500 uppercase tracking-widest font-mono block mb-2.5">
                    Tradable Assets
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {inst.pairs.map((p) => (
                      <span
                        key={p}
                        className="bg-white/5 hover:bg-white/10 text-neutral-200 text-xs px-3 py-1 rounded-lg border border-white/10 font-mono transition"
                      >
                        {p}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-white/5 text-sm">
                  <div>
                    <div className="text-neutral-500 text-xs font-mono mb-1">Max Leverage</div>
                    <div className="text-white font-semibold font-mono text-sm">{inst.maxLeverage}</div>
                  </div>
                  <div>
                    <div className="text-neutral-500 text-xs font-mono mb-1">Typical Spread</div>
                    <div className="text-[#ccff00] font-semibold font-mono text-sm">{inst.typicalSpread}</div>
                  </div>
                  <div>
                    <div className="text-neutral-500 text-xs font-mono mb-1">Commission</div>
                    <div className="text-white font-semibold font-mono text-sm">{inst.commission}</div>
                  </div>
                  <div>
                    <div className="text-neutral-500 text-xs font-mono mb-1">Overnight Swaps</div>
                    <div className="text-white font-semibold font-mono text-sm">{inst.swaps}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Disclaimer / Notice */}
        <section className="bento-card bg-neutral-900/40 border border-white/10 rounded-2xl p-6 sm:p-8 relative overflow-hidden">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-[#ccff00] flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold uppercase tracking-wider text-neutral-200 mb-2">
                Simulated Execution & Risk Notice
              </h4>
              <p className="text-neutral-400 text-xs sm:text-sm leading-relaxed">
                All trading activities described apply exclusively to simulated evaluation and performance-based accounts. 
                {BRAND} is a proprietary trading technology provider and not an investment fund, bank, or live retail broker. 
                Simulated liquidity models replicate live market volatility, spreads, and market depth without exposing clients to real capital market loss during the evaluation stage.
              </p>
            </div>
          </div>
        </section>

        <div className="pt-8 border-t border-white/10 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500 font-mono">
          <p>&copy; {new Date().getFullYear()} {COMPANY}. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/rules" className="hover:text-[#ccff00] transition">Trading Rules</Link>
            <Link href="/terms" className="hover:text-[#ccff00] transition">Terms of Service</Link>
            <Link href="/privacy" className="hover:text-[#ccff00] transition">Privacy Policy</Link>
          </div>
        </div>
      </main>
    </div>
  );
}
