'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Zap,
  Server,
  ChevronRight,
  Clock,
  Layers,
  ArrowUpRight,
  TrendingUp,
} from 'lucide-react';

interface SpreadSpec {
  symbol: string;
  name: string;
  category: string;
  spread: string;
  leverage: string;
  commission: string;
  execution: string;
}

const SPREAD_SPECS: SpreadSpec[] = [
  { symbol: 'EURUSD', name: 'Euro / US Dollar', category: 'Forex Major', spread: '0.0 pips', leverage: '1:100', commission: '$0', execution: '9ms' },
  { symbol: 'GBPUSD', name: 'British Pound / USD', category: 'Forex Major', spread: '0.1 pips', leverage: '1:100', commission: '$0', execution: '11ms' },
  { symbol: 'XAUUSD', name: 'Gold / US Dollar', category: 'Commodities', spread: '0.8 pips', leverage: '1:50', commission: '$0', execution: '8ms' },
  { symbol: 'US100', name: 'Nasdaq 100 Index', category: 'Indices', spread: '0.6 pips', leverage: '1:50', commission: '$0', execution: '12ms' },
  { symbol: 'US30', name: 'Dow Jones 30 Index', category: 'Indices', spread: '1.2 pips', leverage: '1:50', commission: '$0', execution: '14ms' },
  { symbol: 'BTCUSD', name: 'Bitcoin / US Dollar', category: 'Crypto', spread: 'Raw ECN', leverage: '1:5', commission: '$0', execution: '15ms' },
];

export default function InteractiveTerminalShowcase() {
  const [activeCategory, setActiveCategory] = useState<string>('ALL');

  const filteredSpecs = activeCategory === 'ALL'
    ? SPREAD_SPECS
    : SPREAD_SPECS.filter((s) => s.category.toUpperCase().includes(activeCategory));

  return (
    <div className="mt-14 w-full bg-[#0d0e12] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
      {/* Trademark Subtle Neon Accent Glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#ccff00]/[0.03] rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div className="text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ccff00]/10 border border-[#ccff00]/25 text-[#ccff00] font-mono text-xs font-bold uppercase tracking-wider mb-2">
            <Server className="w-3.5 h-3.5" />
            <span>Institutional MetaTrader 5 Infrastructure</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Raw Institutional Spreads &amp; Zero Markup
          </h3>
          <p className="text-sm text-neutral-400 mt-1 max-w-2xl">
            Direct simulated connectivity via Equinix LD4 (London) &amp; NY4 (New York) cross-connects with sub-15ms ultra-low execution latency.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 bg-[#12151c] p-1.5 rounded-2xl border border-white/5 self-start md:self-center">
          {['ALL', 'FOREX', 'COMMODITIES', 'INDICES', 'CRYPTO'].map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                activeCategory === cat
                  ? 'bg-[#ccff00] text-black shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* 4 Core Infrastructure Specs Pillars */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 my-6 text-left">
        <div className="bg-[#12151c] border border-white/5 rounded-2xl p-4">
          <div className="flex items-center gap-2 text-neutral-400 text-xs mb-1 font-mono uppercase">
            <Zap className="w-3.5 h-3.5 text-[#ccff00]" />
            <span>Execution Latency</span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-white font-mono">&lt; 12ms</div>
          <div className="text-[11px] text-neutral-400 mt-1">Equinix LD4 cross-connect</div>
        </div>

        <div className="bg-[#12151c] border border-white/5 rounded-2xl p-4">
          <div className="flex items-center gap-2 text-neutral-400 text-xs mb-1 font-mono uppercase">
            <Layers className="w-3.5 h-3.5 text-[#ccff00]" />
            <span>Spreads From</span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-[#ccff00] font-mono">0.0 Pips</div>
          <div className="text-[11px] text-neutral-400 mt-1">Tier-1 aggregated liquidity</div>
        </div>

        <div className="bg-[#12151c] border border-white/5 rounded-2xl p-4">
          <div className="flex items-center gap-2 text-neutral-400 text-xs mb-1 font-mono uppercase">
            <TrendingUp className="w-3.5 h-3.5 text-[#ccff00]" />
            <span>Max Leverage</span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-white font-mono">1:100</div>
          <div className="text-[11px] text-neutral-400 mt-1">Institutional risk profile</div>
        </div>

        <div className="bg-[#12151c] border border-white/5 rounded-2xl p-4">
          <div className="flex items-center gap-2 text-neutral-400 text-xs mb-1 font-mono uppercase">
            <ShieldCheck className="w-3.5 h-3.5 text-[#ccff00]" />
            <span>Drawdown Model</span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-white">Static (10%)</div>
          <div className="text-[11px] text-neutral-400 mt-1">Balance-based, no trailing traps</div>
        </div>
      </div>

      {/* Clean Straightforward Instruments Spreads Table */}
      <div className="overflow-x-auto rounded-2xl border border-white/10 bg-[#12151c]">
        <table className="w-full text-left text-xs sm:text-sm">
          <thead>
            <tr className="border-b border-white/10 bg-[#08090b]/80 text-[11px] text-neutral-400 uppercase font-mono tracking-wider">
              <th className="py-3 px-4 sm:px-6">Instrument</th>
              <th className="py-3 px-4">Market</th>
              <th className="py-3 px-4">Spread</th>
              <th className="py-3 px-4">Leverage</th>
              <th className="py-3 px-4">Commission</th>
              <th className="py-3 px-4 sm:px-6 text-right">Avg Execution</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredSpecs.map((item, idx) => (
              <tr key={idx} className="hover:bg-white/[0.02] transition">
                <td className="py-3.5 px-4 sm:px-6">
                  <div className="font-mono font-black text-white text-sm">{item.symbol}</div>
                  <div className="text-[11px] text-neutral-400">{item.name}</div>
                </td>
                <td className="py-3.5 px-4 text-neutral-300 font-medium">
                  {item.category}
                </td>
                <td className="py-3.5 px-4 font-mono font-bold text-[#ccff00]">
                  {item.spread}
                </td>
                <td className="py-3.5 px-4 font-mono text-neutral-200">
                  {item.leverage}
                </td>
                <td className="py-3.5 px-4 font-mono text-neutral-300">
                  {item.commission}
                </td>
                <td className="py-3.5 px-4 sm:px-6 text-right font-mono font-bold text-white">
                  {item.execution}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer Info & Action */}
      <div className="mt-6 pt-5 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-400">
        <div className="flex items-center gap-4 text-left">
          <span className="flex items-center gap-1.5 text-neutral-300">
            <span className="w-2 h-2 rounded-full bg-[#ccff00] animate-pulse" />
            MT5 Server Status: <strong className="text-white">Active (100% Uptime)</strong>
          </span>
          <span className="hidden sm:inline text-neutral-600">|</span>
          <span className="hidden sm:inline">Expert Advisors (EAs), Algos &amp; News Trading Allowed</span>
        </div>

        <Link
          href="/challenges"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#ccff00] hover:bg-[#b8e600] text-black font-black text-xs uppercase tracking-tight transition shadow-sm"
        >
          <span>Choose Account Size</span>
          <ChevronRight className="w-4 h-4 stroke-[3]" />
        </Link>
      </div>
    </div>
  );
}
