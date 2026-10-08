import Link from "next/link";

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
  { label: "Execution Model", value: "Market Execution (No Dealing Desk)" },
  { label: "Account Currency", value: "USD" },
  { label: "Minimum Lot Size", value: "0.01 lots" },
  { label: "Maximum Open Positions", value: "Unlimited (subject to margin)" },
  { label: "Hedging", value: "Allowed" },
  { label: "Expert Advisors (EAs)", value: "Allowed (non-prohibited strategies only)" },
  { label: "News Trading", value: "Restricted within 2 min of high-impact events" },
  { label: "Slippage", value: "Market-standard slippage applies" },
  { label: "Server Time", value: "UTC+2 / UTC+3 (DST-adjusted)" },
  { label: "Market Hours", value: "Forex: 24/5 | Crypto: 24/7 | Indices: Exchange hours" },
  { label: "Rollover / Swap", value: "Standard broker swap rates on overnight positions" },
];

const categoryColors: Record<string, string> = {
  "Forex Majors": "bg-blue-50 text-blue-700 border-blue-200",
  "Forex Minors": "bg-indigo-50 text-indigo-700 border-indigo-200",
  "Indices": "bg-purple-50 text-purple-700 border-purple-200",
  "Commodities": "bg-amber-50 text-amber-700 border-amber-200",
  "Cryptocurrencies": "bg-orange-50 text-orange-700 border-orange-200",
};

export default function TradingConditionsPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="border-b border-gray-200 bg-white sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/" className="text-sm font-bold text-gray-900 hover:text-black">← {BRAND}</Link>
          <span className="text-xs text-gray-400">Platform Info</span>
        </div>
      </div>

      <div className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-block bg-black text-white text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded">Platform</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-2">Trading Conditions</h1>
          <p className="text-gray-500 text-sm max-w-2xl">
            Full instrument specifications, leverage limits, execution model, and platform details for all {BRAND} evaluation accounts.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 space-y-12">

        {/* General conditions table */}
        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-5">General Account Conditions</h2>
          <div className="border border-gray-200 rounded-xl overflow-hidden">
            <div className="divide-y divide-gray-100">
              {conditions.map((row, i) => (
                <div key={row.label} className={`flex flex-col sm:flex-row sm:items-center px-6 py-3.5 gap-1 ${i % 2 === 0 ? "bg-white" : "bg-gray-50"}`}>
                  <div className="sm:w-1/2 text-sm text-gray-500 font-medium">{row.label}</div>
                  <div className="sm:w-1/2 text-sm text-gray-900 font-semibold">{row.value}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Instruments */}
        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-2">Available Instruments</h2>
          <p className="text-gray-500 text-sm mb-6">
            Instrument availability may vary by jurisdiction. Spreads are variable and widen during low-liquidity periods.
          </p>
          <div className="space-y-5">
            {instruments.map((inst) => (
              <div key={inst.category} className="border border-gray-200 rounded-xl overflow-hidden">
                <div className="px-6 py-3.5 border-b border-gray-100 bg-gray-50 flex items-center gap-3">
                  <h3 className="font-bold text-gray-900 text-sm">{inst.category}</h3>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${categoryColors[inst.category] || "bg-gray-100 text-gray-700 border-gray-200"}`}>
                    {inst.maxLeverage} max
                  </span>
                </div>
                <div className="px-6 py-4">
                  <div className="flex flex-wrap gap-2 mb-4">
                    {inst.pairs.map((p) => (
                      <span key={p} className="bg-gray-100 text-gray-700 text-xs px-3 py-1 rounded-full border border-gray-200 font-mono">
                        {p}
                      </span>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm pt-3 border-t border-gray-100">
                    {[
                      { label: "Max Leverage", value: inst.maxLeverage },
                      { label: "Typical Spread", value: inst.typicalSpread },
                      { label: "Commission", value: inst.commission },
                      { label: "Swaps", value: inst.swaps },
                    ].map(({ label, value }) => (
                      <div key={label}>
                        <div className="text-gray-400 text-xs mb-1">{label}</div>
                        <div className="text-gray-900 font-semibold text-sm">{value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Disclaimer */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <p className="text-blue-700 text-xs font-bold uppercase tracking-wider mb-2">Disclaimer</p>
          <p className="text-blue-900 text-sm leading-relaxed">
            All trading conditions described apply exclusively to simulated evaluation accounts. Conditions are subject
            to change without notice. Spreads, leverage, and commissions reflect the simulated environment and may differ
            from live market conditions. {BRAND} is not a broker and does not hold client funds.
          </p>
        </div>

        <div className="pt-6 border-t border-gray-200 text-xs text-gray-400">
          <p>&copy; 2025 {COMPANY}. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
