"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calculator, X, DollarSign, ArrowRight, Percent, RefreshCw, AlertTriangle, Info } from "lucide-react";

export type CalculatorTab = "margin" | "profit" | "lotsize" | "swap";

export interface InstrumentSpec {
  symbol: string;
  name: string;
  contractSize: number;
  dollarPerPointPerLot: number;
  unitLabel: string;
  note: string;
  isIndex?: boolean;
}

export const INSTRUMENT_SPECS: Record<string, InstrumentSpec> = {
  US30: {
    symbol: "US30",
    name: "Dow Jones 30",
    contractSize: 10,
    dollarPerPointPerLot: 10.0,
    unitLabel: "Points",
    isIndex: true,
    note: "Institutional Spec: 1 Lot = 10 Contracts ($10.00/point). 10x larger than retail broker accounts like Exness ($1/pt).",
  },
  NAS100: {
    symbol: "NAS100",
    name: "Nasdaq 100",
    contractSize: 10,
    dollarPerPointPerLot: 10.0,
    unitLabel: "Points",
    isIndex: true,
    note: "Institutional Spec: 1 Lot = 10 Contracts ($10.00/point).",
  },
  SPX500: {
    symbol: "SPX500",
    name: "S&P 500",
    contractSize: 10,
    dollarPerPointPerLot: 10.0,
    unitLabel: "Points",
    isIndex: true,
    note: "Institutional Spec: 1 Lot = 10 Contracts ($10.00/point).",
  },
  XAUUSD: {
    symbol: "XAUUSD",
    name: "Gold / USD",
    contractSize: 100,
    dollarPerPointPerLot: 10.0,
    unitLabel: "Pips ($0.10)",
    note: "1 Lot = 100 Troy Oz ($10.00 per pip / $100 per $1.00 move).",
  },
  EURUSD: {
    symbol: "EURUSD",
    name: "Euro / US Dollar",
    contractSize: 100000,
    dollarPerPointPerLot: 10.0,
    unitLabel: "Pips",
    note: "Standard Forex: 1 Lot = 100,000 Units ($10.00 per pip).",
  },
  GBPUSD: {
    symbol: "GBPUSD",
    name: "British Pound / USD",
    contractSize: 100000,
    dollarPerPointPerLot: 10.0,
    unitLabel: "Pips",
    note: "Standard Forex: 1 Lot = 100,000 Units ($10.00 per pip).",
  },
  BTCUSD: {
    symbol: "BTCUSD",
    name: "Bitcoin / USD",
    contractSize: 1,
    dollarPerPointPerLot: 1.0,
    unitLabel: "Dollars ($)",
    note: "Crypto: 1 Lot = 1 Bitcoin ($1.00 per $1.00 price move).",
  },
};

interface Props {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: CalculatorTab;
  accountSize?: number;
}

export default function TraderCalculatorModal({
  isOpen,
  onClose,
  defaultTab = "lotsize",
  accountSize = 100000,
}: Props) {
  const [tab, setTab] = useState<CalculatorTab>(defaultTab);

  // Margin Calculator State
  const [marginSymbol, setMarginSymbol] = useState("EURUSD");
  const [marginLots, setMarginLots] = useState("1.0");
  const [marginLeverage, setMarginLeverage] = useState("100");

  // Profit/Loss Calculator State
  const [pnlSymbol, setPnlSymbol] = useState("EURUSD");
  const [pnlAction, setPnlAction] = useState<"buy" | "sell">("buy");
  const [pnlLots, setPnlLots] = useState("1.0");
  const [pnlOpen, setPnlOpen] = useState("1.0850");
  const [pnlClose, setPnlClose] = useState("1.0920");

  // Lot Size Calculator State
  const [selectedInst, setSelectedInst] = useState("US30");
  const [riskBalance, setRiskBalance] = useState(String(accountSize));
  const [riskPct, setRiskPct] = useState("1.0"); // 1%
  const [riskPips, setRiskPips] = useState("50");

  const currentSpec = INSTRUMENT_SPECS[selectedInst] || INSTRUMENT_SPECS["US30"];

  // Swap Calculator State
  const [swapLots, setSwapLots] = useState("1.0");
  const [swapNights, setSwapNights] = useState("1");
  const [swapRate, setSwapRate] = useState("-5.20");

  // Calculations
  const calculatedMargin =
    (parseFloat(marginLots || "0") * 100000) / parseFloat(marginLeverage || "100");

  const pnlDiff =
    pnlAction === "buy"
      ? parseFloat(pnlClose || "0") - parseFloat(pnlOpen || "0")
      : parseFloat(pnlOpen || "0") - parseFloat(pnlClose || "0");
  const calculatedPnL = parseFloat(pnlLots || "0") * 100000 * pnlDiff;

  const riskCash = (parseFloat(riskBalance || "0") * parseFloat(riskPct || "0")) / 100;
  const stopPoints = parseFloat(riskPips || "0");
  const calculatedLots =
    stopPoints > 0
      ? (riskCash / (stopPoints * currentSpec.dollarPerPointPerLot)).toFixed(2)
      : "0.00";

  const calculatedSwap =
    parseFloat(swapLots || "0") * parseFloat(swapRate || "0") * parseFloat(swapNights || "0");

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="bg-[#0e1118] border border-white/15 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#ccff00]/10 border border-[#ccff00]/30 flex items-center justify-center text-[#ccff00]">
                <Calculator className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white">Trading Calculator</h3>
                <p className="text-[11px] text-neutral-400 font-mono">Institutional Risk & Pip Estimator</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tab Switcher (Margin, Profit/Loss, Lot Size, Swap) */}
          <div className="grid grid-cols-4 gap-1.5 p-1 rounded-xl bg-white/[0.04] border border-white/5 mb-6 text-xs font-bold font-mono">
            {[
              { id: "margin", label: "Margin" },
              { id: "profit", label: "Profit/Loss" },
              { id: "lotsize", label: "Lot Size" },
              { id: "swap", label: "Swap" },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id as any)}
                className={`py-2 px-1 text-center rounded-lg transition truncate ${
                  tab === t.id
                    ? "bg-[#ccff00] text-black shadow-sm font-black"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* TAB 1: MARGIN */}
          {tab === "margin" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-neutral-400 block mb-1">Instrument</label>
                  <select
                    value={marginSymbol}
                    onChange={(e) => setMarginSymbol(e.target.value)}
                    className="w-full bg-[#14161f] border border-white/10 rounded-xl px-3 py-2.5 text-white font-mono outline-none"
                  >
                    <option value="EURUSD">EUR/USD</option>
                    <option value="GBPUSD">GBP/USD</option>
                    <option value="USDJPY">USD/JPY</option>
                    <option value="XAUUSD">XAU/USD (Gold)</option>
                    <option value="US30">US30 (Dow)</option>
                  </select>
                </div>
                <div>
                  <label className="text-neutral-400 block mb-1">Leverage</label>
                  <select
                    value={marginLeverage}
                    onChange={(e) => setMarginLeverage(e.target.value)}
                    className="w-full bg-[#14161f] border border-white/10 rounded-xl px-3 py-2.5 text-white font-mono outline-none"
                  >
                    <option value="100">1:100 (Evaluation)</option>
                    <option value="50">1:50</option>
                    <option value="30">1:30</option>
                    <option value="20">1:20 (Indices/Gold)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs text-neutral-400 block mb-1">Lot Size</label>
                <input
                  type="number"
                  step="0.01"
                  value={marginLots}
                  onChange={(e) => setMarginLots(e.target.value)}
                  className="w-full bg-[#14161f] border border-white/10 rounded-xl px-3 py-2.5 text-white font-mono outline-none"
                />
              </div>

              <div className="p-4 rounded-2xl bg-[#ccff00]/10 border border-[#ccff00]/25 text-center mt-4">
                <span className="text-[10px] uppercase tracking-widest font-mono text-neutral-400 block">
                  Required Margin
                </span>
                <span className="text-3xl font-black text-[#ccff00] font-mono">
                  ${calculatedMargin.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          )}

          {/* TAB 2: PROFIT / LOSS */}
          {tab === "profit" && (
            <div className="space-y-4 text-xs font-mono">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-neutral-400 block mb-1">Direction</label>
                  <div className="grid grid-cols-2 gap-1 bg-[#14161f] p-1 rounded-xl border border-white/10">
                    <button
                      onClick={() => setPnlAction("buy")}
                      className={`py-1.5 rounded-lg font-bold ${pnlAction === "buy" ? "bg-emerald-500 text-white" : "text-neutral-400"}`}
                    >
                      BUY
                    </button>
                    <button
                      onClick={() => setPnlAction("sell")}
                      className={`py-1.5 rounded-lg font-bold ${pnlAction === "sell" ? "bg-rose-500 text-white" : "text-neutral-400"}`}
                    >
                      SELL
                    </button>
                  </div>
                </div>
                <div>
                  <label className="text-neutral-400 block mb-1">Lot Size</label>
                  <input
                    type="number"
                    step="0.01"
                    value={pnlLots}
                    onChange={(e) => setPnlLots(e.target.value)}
                    className="w-full bg-[#14161f] border border-white/10 rounded-xl px-3 py-2 text-white outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-neutral-400 block mb-1">Open Price</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={pnlOpen}
                    onChange={(e) => setPnlOpen(e.target.value)}
                    className="w-full bg-[#14161f] border border-white/10 rounded-xl px-3 py-2 text-white outline-none"
                  />
                </div>
                <div>
                  <label className="text-neutral-400 block mb-1">Close Price</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={pnlClose}
                    onChange={(e) => setPnlClose(e.target.value)}
                    className="w-full bg-[#14161f] border border-white/10 rounded-xl px-3 py-2 text-white outline-none"
                  />
                </div>
              </div>

              <div className={`p-4 rounded-2xl border text-center mt-4 ${calculatedPnL >= 0 ? "bg-emerald-500/10 border-emerald-500/30" : "bg-rose-500/10 border-rose-500/30"}`}>
                <span className="text-[10px] uppercase tracking-widest text-neutral-400 block">
                  Projected Net Profit
                </span>
                <span className={`text-3xl font-black ${calculatedPnL >= 0 ? "text-[#ccff00]" : "text-rose-400"}`}>
                  {calculatedPnL >= 0 ? "+" : ""}${calculatedPnL.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          )}

          {/* TAB 3: LOT SIZE */}
          {tab === "lotsize" && (
            <div className="space-y-4 text-xs font-mono">
              {/* Instrument Selector */}
              <div>
                <label className="text-neutral-400 block mb-1.5 font-bold flex items-center justify-between">
                  <span>Select Instrument / Asset</span>
                  <span className="text-[10px] text-[#ccff00] font-normal">
                    {currentSpec.note}
                  </span>
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {Object.keys(INSTRUMENT_SPECS).map((sym) => {
                    const isSelected = selectedInst === sym;
                    return (
                      <button
                        key={sym}
                        type="button"
                        onClick={() => setSelectedInst(sym)}
                        className={`py-1.5 px-2 rounded-xl text-center font-bold transition border ${
                          isSelected
                            ? "bg-[#ccff00] text-black border-[#ccff00] shadow-sm"
                            : "bg-white/[0.03] text-neutral-400 border-white/5 hover:border-white/20 hover:text-white"
                        }`}
                      >
                        {sym}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Retail vs Institutional Alert Box for US30/Indices */}
              {currentSpec.isIndex && (
                <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-[11px] text-amber-200">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>Contract Size Alert (Exness vs MaxFunded / FundedNext)</span>
                  </div>
                  <p className="text-[10px] text-amber-300/80 leading-relaxed font-sans">
                    On retail brokers like Exness, 1 lot = \$1/point. On institutional MT5, 1 lot = 10 contracts (\$10.00/point — 10x larger). Sizing by dollar risk protects your 5% daily limit.
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-neutral-400 block mb-1">Account Balance ($)</label>
                  <input
                    type="number"
                    value={riskBalance}
                    onChange={(e) => setRiskBalance(e.target.value)}
                    className="w-full bg-[#14161f] border border-white/10 rounded-xl px-3 py-2 text-white outline-none"
                  />
                </div>
                <div>
                  <label className="text-neutral-400 block mb-1">Risk Percentage (%)</label>
                  <input
                    type="number"
                    step="0.25"
                    value={riskPct}
                    onChange={(e) => setRiskPct(e.target.value)}
                    className="w-full bg-[#14161f] border border-white/10 rounded-xl px-3 py-2 text-white outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-neutral-400 block mb-1">
                  Stop Loss Distance ({currentSpec.unitLabel})
                </label>
                <input
                  type="number"
                  value={riskPips}
                  onChange={(e) => setRiskPips(e.target.value)}
                  className="w-full bg-[#14161f] border border-white/10 rounded-xl px-3 py-2 text-white outline-none"
                />
              </div>

              <div className="p-4 rounded-2xl bg-[#ccff00]/10 border border-[#ccff00]/25 text-center mt-3">
                <span className="text-[10px] uppercase tracking-widest text-neutral-400 block font-bold">
                  Recommended Lot Size for {selectedInst}
                </span>
                <span className="text-3xl font-black text-[#ccff00] my-0.5 block">
                  {calculatedLots} Lots
                </span>
                <div className="flex items-center justify-center gap-3 text-[11px] text-neutral-300 mt-1">
                  <span>Target Risk: <strong className="text-white">${riskCash.toFixed(2)}</strong></span>
                  <span>•</span>
                  <span>Point Value: <strong className="text-white">${currentSpec.dollarPerPointPerLot.toFixed(2)}/pt per lot</strong></span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SWAP */}
          {tab === "swap" && (
            <div className="space-y-4 text-xs font-mono">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-neutral-400 block mb-1">Lot Size</label>
                  <input
                    type="number"
                    value={swapLots}
                    onChange={(e) => setSwapLots(e.target.value)}
                    className="w-full bg-[#14161f] border border-white/10 rounded-xl px-3 py-2 text-white outline-none"
                  />
                </div>
                <div>
                  <label className="text-neutral-400 block mb-1">Number of Nights</label>
                  <input
                    type="number"
                    value={swapNights}
                    onChange={(e) => setSwapNights(e.target.value)}
                    className="w-full bg-[#14161f] border border-white/10 rounded-xl px-3 py-2 text-white outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-neutral-400 block mb-1">Swap Rate ($ / lot)</label>
                <input
                  type="number"
                  step="0.1"
                  value={swapRate}
                  onChange={(e) => setSwapRate(e.target.value)}
                  className="w-full bg-[#14161f] border border-white/10 rounded-xl px-3 py-2 text-white outline-none"
                />
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 text-center mt-4">
                <span className="text-[10px] uppercase tracking-widest text-neutral-400 block">
                  Total Estimated Swap Fee
                </span>
                <span className="text-3xl font-black text-white">
                  ${calculatedSwap.toFixed(2)}
                </span>
              </div>
            </div>
          )}

          <div className="mt-6 pt-4 border-t border-white/10 text-center">
            <button
              onClick={onClose}
              className="w-full py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider transition"
            >
              Close Calculator
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
