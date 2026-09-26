"use client";


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
  { label: "Account Currency", value: "USD (evaluation accounts denominated in USD)" },
  { label: "Minimum Lot Size", value: "0.01 lots" },
  { label: "Maximum Open Positions", value: "Unlimited (subject to margin)" },
  { label: "Hedging", value: "Allowed" },
  { label: "Expert Advisors (EAs)", value: "Allowed (non-prohibited strategies only)" },
  { label: "News Trading", value: "Restricted within 2 min of high-impact events" },
  { label: "Slippage", value: "Market-standard slippage applies" },
  { label: "Server Time", value: "UTC+2 / UTC+3 (DST-adjusted)" },
  { label: "Market Hours", value: "Forex: 24/5 | Crypto: 24/7 | Indices/Commodities: Exchange hours" },
  { label: "Rollover / Swap", value: "Standard broker swap rates apply on overnight positions" },
];

export default function TradingConditionsPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">

      {/* Hero */}
      <section className="pt-24 pb-12 px-4 text-center bg-gradient-to-b from-gray-900 to-gray-950">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
          Trading <span className="text-emerald-400">Conditions</span>
        </h1>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto">
          Full instrument specifications, leverage limits, execution model, and
          platform details for all MaxFunded evaluation accounts.
        </p>
      </section>

      {/* General Conditions Table */}
      <section className="max-w-4xl mx-auto px-4 pb-16">
        <h2 className="text-xl font-bold mb-6">General Account Conditions</h2>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <div className="divide-y divide-gray-800">
            {conditions.map((row) => (
              <div key={row.label} className="flex flex-col sm:flex-row sm:items-center px-6 py-4 gap-1">
                <div className="sm:w-1/2 text-sm text-slate-400 font-medium">{row.label}</div>
                <div className="sm:w-1/2 text-sm text-white font-semibold">{row.value}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Instruments */}
      <section className="max-w-5xl mx-auto px-4 pb-24 space-y-8">
        <h2 className="text-xl font-bold mb-2">Available Instruments</h2>
        <p className="text-slate-500 text-sm mb-6">
          Instrument availability may vary by jurisdiction. Spreads are variable and widen during low-liquidity periods.
        </p>
        {instruments.map((inst) => (
          <div key={inst.category} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-800 bg-slate-900/80">
              <h3 className="font-bold text-emerald-400">{inst.category}</h3>
            </div>
            <div className="px-6 py-4">
              <div className="flex flex-wrap gap-2 mb-4">
                {inst.pairs.map((p) => (
                  <span key={p} className="bg-slate-800 text-gray-200 text-xs px-3 py-1 rounded-full border border-slate-700">
                    {p}
                  </span>
                ))}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                <div>
                  <div className="text-slate-500 text-xs mb-1">Max Leverage</div>
                  <div className="text-white font-semibold">{inst.maxLeverage}</div>
                </div>
                <div>
                  <div className="text-slate-500 text-xs mb-1">Typical Spread</div>
                  <div className="text-white font-semibold">{inst.typicalSpread}</div>
                </div>
                <div>
                  <div className="text-slate-500 text-xs mb-1">Commission</div>
                  <div className="text-white font-semibold">{inst.commission}</div>
                </div>
                <div>
                  <div className="text-slate-500 text-xs mb-1">Swaps</div>
                  <div className="text-white font-semibold">{inst.swaps}</div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Disclaimer */}
        <div className="bg-blue-950/20 border border-blue-700/30 rounded-xl p-6">
          <p className="text-blue-400 text-xs font-semibold uppercase tracking-wider mb-2">
            Disclaimer
          </p>
          <p className="text-slate-400 text-sm leading-relaxed">
            All trading conditions described apply exclusively to simulated evaluation accounts.
            Conditions are subject to change. Spreads, leverage, and commissions reflect the
            simulated environment and may differ from live market conditions. Cryptocurrency
            instruments are available 24/7 but liquidity may be reduced during certain hours.
            MaxFunded is not a broker and does not hold client funds.
          </p>
        </div>
      </section>
    </div>
  );
}
