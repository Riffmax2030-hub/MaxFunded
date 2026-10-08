"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  createChart,
  IChartApi,
  ISeriesApi,
  CandlestickData,
  HistogramData,
  ColorType,
  CandlestickSeries,
  HistogramSeries,
} from "lightweight-charts";
import { CandlestickChart, Activity, RefreshCw } from "lucide-react";


interface TradingViewChartProps {
  defaultSymbol?: string;
}

const SYMBOLS = [
  { id: "EURUSD", name: "EUR/USD", basePrice: 1.0850, step: 0.0002 },
  { id: "GBPUSD", name: "GBP/USD", basePrice: 1.2980, step: 0.0003 },
  { id: "XAUUSD", name: "XAU/USD (Gold)", basePrice: 2650.0, step: 1.5 },
  { id: "BTCUSD", name: "BTC/USD", basePrice: 63500.0, step: 120.0 },
  { id: "US100",  name: "US100 (Nasdaq)", basePrice: 20150.0, step: 15.0 },
];

const TIMEFRAMES = ["1m", "5m", "15m", "1H", "4H", "1D"];

// Generate realistic simulated OHLC historical candle data
function generateCandles(basePrice: number, step: number, count: number = 80): { candles: CandlestickData[]; volumes: HistogramData[] } {
  const candles: CandlestickData[] = [];
  const volumes: HistogramData[] = [];

  let currentPrice = basePrice;
  const now = Math.floor(Date.now() / 1000);
  const intervalSeconds = 300; // 5 min interval

  for (let i = count; i >= 0; i--) {
    const time = (now - i * intervalSeconds) as any;
    const delta = (Math.random() - 0.49) * step * 3;
    const open = currentPrice;
    const close = open + delta;
    const high = Math.max(open, close) + Math.random() * step * 1.5;
    const low = Math.min(open, close) - Math.random() * step * 1.5;
    currentPrice = close;

    candles.push({
      time,
      open: Number(open.toFixed(basePrice < 10 ? 4 : 2)),
      high: Number(high.toFixed(basePrice < 10 ? 4 : 2)),
      low: Number(low.toFixed(basePrice < 10 ? 4 : 2)),
      close: Number(close.toFixed(basePrice < 10 ? 4 : 2)),
    });

    volumes.push({
      time,
      value: Math.floor(Math.random() * 500 + 100),
      color: close >= open ? "rgba(204, 255, 0, 0.3)" : "rgba(244, 63, 94, 0.3)",
    });
  }

  return { candles, volumes };
}

export default function TradingViewChart({ defaultSymbol = "EURUSD" }: TradingViewChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<any>(null);
  const volumeSeriesRef = useRef<any>(null);


  const [selectedSymbol, setSelectedSymbol] = useState(defaultSymbol);
  const [selectedTf, setSelectedTf] = useState("5m");
  const [hoverData, setHoverData] = useState<{ open: number; high: number; low: number; close: number } | null>(null);

  const symbolConfig = SYMBOLS.find((s) => s.id === selectedSymbol) || SYMBOLS[0];

  useEffect(() => {
    if (!containerRef.current) return;

    // Clean up existing chart if any
    if (chartRef.current) {
      chartRef.current.remove();
      chartRef.current = null;
    }

    const chart = createChart(containerRef.current, {
      width: containerRef.current.clientWidth,
      height: 380,
      layout: {
        background: { type: ColorType.Solid, color: "#0d0e10" },
        textColor: "#787f91",
        fontSize: 11,
      },
      grid: {
        vertLines: { color: "rgba(255, 255, 255, 0.04)" },
        horzLines: { color: "rgba(255, 255, 255, 0.04)" },
      },
      crosshair: {
        vertLine: { color: "rgba(204, 255, 0, 0.5)", width: 1, style: 3 },
        horzLine: { color: "rgba(204, 255, 0, 0.5)", width: 1, style: 3 },
      },
      rightPriceScale: {
        borderColor: "rgba(255, 255, 255, 0.08)",
      },
      timeScale: {
        borderColor: "rgba(255, 255, 255, 0.08)",
        timeVisible: true,
        secondsVisible: false,
      },
    });

    chartRef.current = chart;

    // Candlestick Series
    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: "#ccff00",
      downColor: "#f43f5e",
      borderVisible: false,
      wickUpColor: "#ccff00",
      wickDownColor: "#f43f5e",
    });
    candleSeriesRef.current = candleSeries as any;

    // Volume Histogram
    const volumeSeries = chart.addSeries(HistogramSeries, {
      priceFormat: { type: "volume" },
      priceScaleId: "", // overlay on main scale
    });

    volumeSeries.priceScale().applyOptions({
      scaleMargins: { top: 0.8, bottom: 0 },
    });
    volumeSeriesRef.current = volumeSeries;

    // Populate data
    const { candles, volumes } = generateCandles(symbolConfig.basePrice, symbolConfig.step);
    candleSeries.setData(candles);
    volumeSeries.setData(volumes);

    if (candles.length > 0) {
      const last = candles[candles.length - 1];
      setHoverData({ open: last.open, high: last.high, low: last.low, close: last.close });
    }

    // Crosshair move handler
    chart.subscribeCrosshairMove((param) => {
      if (!param.time || !param.seriesData) return;
      const data = param.seriesData.get(candleSeries) as any;
      if (data) {
        setHoverData({ open: data.open, high: data.high, low: data.low, close: data.close });
      }
    });

    // Resize Observer
    const resizeObserver = new ResizeObserver((entries) => {
      if (!entries[0] || !chartRef.current) return;
      const { width } = entries[0].contentRect;
      chartRef.current.applyOptions({ width });
    });
    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
      }
    };
  }, [selectedSymbol, selectedTf, symbolConfig]);

  return (
    <div className="bg-[#0d0e10] border border-white/10 rounded-2xl p-5 shadow-2xl relative overflow-hidden">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 pb-3 border-b border-white/[0.06]">
        {/* Symbol Dropdown / Selector */}
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-[#ccff00]/10 text-[#ccff00]">
            <CandlestickChart size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <select
                value={selectedSymbol}
                onChange={(e) => setSelectedSymbol(e.target.value)}
                className="bg-[#14161a] border border-white/10 text-white font-black text-sm rounded-xl px-3 py-1.5 focus:outline-none focus:border-[#ccff00] cursor-pointer"
              >
                {SYMBOLS.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                ● Live Market Feed
              </span>
            </div>
            
            {/* Live OHLC Bar */}
            {hoverData && (
              <div className="flex items-center gap-3 text-[11px] font-mono text-neutral-400 mt-1">
                <span>O: <span className="text-white">{hoverData.open}</span></span>
                <span>H: <span className="text-white">{hoverData.high}</span></span>
                <span>L: <span className="text-white">{hoverData.low}</span></span>
                <span>
                  C: <span className={hoverData.close >= hoverData.open ? "text-[#ccff00] font-bold" : "text-rose-400 font-bold"}>
                    {hoverData.close}
                  </span>
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Timeframe Selector */}
        <div className="flex items-center gap-1.5 bg-[#14161a] border border-white/10 p-1 rounded-xl text-xs">
          {TIMEFRAMES.map((tf) => (
            <button
              key={tf}
              onClick={() => setSelectedTf(tf)}
              className={`px-2.5 py-1 rounded-lg transition font-mono ${
                selectedTf === tf
                  ? "bg-[#ccff00] text-black font-bold"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* Chart Canvas Mount Point */}
      <div ref={containerRef} className="w-full relative min-h-[380px]" />

      {/* Chart Footer Info */}
      <div className="flex items-center justify-between text-[11px] text-neutral-500 pt-3 border-t border-white/[0.06] mt-3">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ccff00]" />
            <span>Bullish Candle</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span>Bearish Candle</span>
          </span>
        </div>
        <span className="font-mono">TradingView Lightweight Charts v5</span>
      </div>
    </div>
  );
}
