"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import {
  fetchMyAffiliateProfile,
  fetchMyCommissions,
  fetchMyAffiliatePayouts,
  requestAffiliatePayout,
  AffiliateProfileData,
  ReferralCommissionItem,
  AffiliatePayoutItem,
} from "@/lib/api";
import {
  Users,
  DollarSign,
  TrendingUp,
  Share2,
  Copy,
  CheckCircle2,
  Award,
  Wallet,
  ArrowUpRight,
  Clock,
  AlertTriangle,
  Loader2,
  Zap,
} from "lucide-react";

export default function AffiliateDashboardPage() {
  const [profile, setProfile] = useState<AffiliateProfileData | null>(null);
  const [commissions, setCommissions] = useState<ReferralCommissionItem[]>([]);
  const [payouts, setPayouts] = useState<AffiliatePayoutItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Payout modal state
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState<number>(50);
  const [payoutMethod, setPayoutMethod] = useState("CRYPTO_USDT");
  const [payoutDestination, setPayoutDestination] = useState("");
  const [payoutSubmitting, setPayoutSubmitting] = useState(false);
  const [payoutMessage, setPayoutMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const loadData = async () => {
    const session = getSession();
    if (!session) {
      setError("Please sign in to view your affiliate partner dashboard.");
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const [profData, commsData, payoutsData] = await Promise.all([
        fetchMyAffiliateProfile(session.token),
        fetchMyCommissions(session.token),
        fetchMyAffiliatePayouts(session.token),
      ]);
      setProfile(profData);
      setCommissions(commsData);
      setPayouts(payoutsData);
      if (profData.payout_address) {
        setPayoutDestination(profData.payout_address);
      }
      if (profData.payout_method) {
        setPayoutMethod(profData.payout_method);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load affiliate data";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const copyReferralUrl = () => {
    if (!profile) return;
    const origin = typeof window !== "undefined" ? window.location.origin : "https://maxfunded.com";
    const url = `${origin}?ref=${profile.referral_code}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleRequestPayout = async (e: React.FormEvent) => {
    e.preventDefault();
    const session = getSession();
    if (!session || !profile) return;

    if (payoutAmount < 50) {
      setPayoutMessage({ type: "error", text: "Minimum payout request is $50.00." });
      return;
    }
    if (payoutAmount > Number(profile.commission_balance)) {
      setPayoutMessage({ type: "error", text: "Requested amount exceeds your available balance." });
      return;
    }
    if (!payoutDestination.trim()) {
      setPayoutMessage({ type: "error", text: "Please enter your wallet address or bank info." });
      return;
    }

    try {
      setPayoutSubmitting(true);
      setPayoutMessage(null);
      await requestAffiliatePayout(session.token, {
        amount: payoutAmount,
        method: payoutMethod,
        destination: payoutDestination.trim(),
      });
      setPayoutMessage({ type: "success", text: "Payout request submitted! Finance will process it shortly." });
      // Refresh data
      await loadData();
      setTimeout(() => {
        setShowPayoutModal(false);
        setPayoutMessage(null);
      }, 2000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to submit payout request";
      setPayoutMessage({ type: "error", text: msg });
    } finally {
      setPayoutSubmitting(false);
    }
  };

  const getTierProgress = (volume: number, tier: string) => {
    if (tier === "ELITE") return { percent: 100, nextTier: "MAX TIER", nextTarget: "$50,000+" };
    if (tier === "PRO") {
      const pct = Math.min(100, Math.max(0, ((volume - 10000) / 40000) * 100));
      return { percent: pct, nextTier: "ELITE (20%)", nextTarget: "$50,000" };
    }
    const pct = Math.min(100, Math.max(0, (volume / 10000) * 100));
    return { percent: pct, nextTier: "PRO (15%)", nextTarget: "$10,000" };
  };

  return (
    <>
      <main className="min-h-screen bg-[#07080a] text-white pt-24 pb-20 px-4 sm:px-6 relative overflow-hidden">
        {/* Ambient Glow */}
        <div className="glow-orb absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-b from-[#ccff00]/[0.05] to-transparent blur-3xl pointer-events-none -z-10 rounded-full" />

        <div className="max-w-6xl mx-auto space-y-8 relative z-10">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/[0.08] pb-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ccff00]/10 border border-[#ccff00]/25 text-[#ccff00] text-xs font-bold uppercase tracking-wider mb-2">
                <Users size={14} /> Partner &amp; Affiliate Network
              </div>
              <h1 className="text-3xl font-black text-white uppercase tracking-tight">Affiliate Partner Dashboard</h1>
              <p className="text-neutral-400 text-sm mt-1">
                Earn up to 20% recurring commission on all referred trader challenge purchases.
              </p>
            </div>
            {profile && Number(profile.commission_balance) >= 50 && (
              <button
                onClick={() => setShowPayoutModal(true)}
                className="btn-neon inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#ccff00] hover:bg-[#b3e600] text-black font-black text-xs uppercase tracking-tight transition shadow-neon"
              >
                <Wallet size={16} /> Request Commission Payout (${Number(profile.commission_balance).toFixed(2)})
              </button>
            )}
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center p-16 bento-card">
              <Loader2 className="animate-spin text-[#ccff00] mb-4" size={40} />
              <p className="text-neutral-400 text-sm font-mono uppercase tracking-wider">Loading your affiliate portal...</p>
            </div>
          ) : error ? (
            <div className="p-8 bento-card border-rose-500/30 text-center">
              <AlertTriangle className="text-rose-400 mx-auto mb-3" size={40} />
              <p className="text-neutral-300 text-sm">{error}</p>
            </div>
          ) : !profile ? null : (
            <>
              {/* Referral Link & Tier Banner */}
              <div className="bento-card p-6 sm:p-8 relative overflow-hidden">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
                  <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center gap-3">
                      <span className="text-xs uppercase tracking-wider font-bold text-neutral-400">
                        Your Unique Referral Link
                      </span>
                      <span className="text-xs px-3 py-1 rounded-full bg-[#ccff00]/15 text-[#ccff00] border border-[#ccff00]/30 font-black">
                        {profile.commission_rate}% Commission
                      </span>
                    </div>

                    <div className="flex items-center gap-2 bg-[#101217] border border-white/[0.08] rounded-xl p-2.5">
                      <div className="font-mono text-xs sm:text-sm text-neutral-200 flex-1 truncate px-2 select-all">
                        {typeof window !== "undefined" ? window.location.origin : "https://maxfunded.com"}?ref={profile.referral_code}
                      </div>
                      <button
                        onClick={copyReferralUrl}
                        className="btn-neon inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-[#ccff00] hover:bg-[#b3e600] text-black text-xs font-black uppercase tracking-tight transition"
                      >
                        {copiedLink ? <CheckCircle2 size={14} /> : <Copy size={14} />}
                        {copiedLink ? "Copied!" : "Copy Link"}
                      </button>
                    </div>

                    <p className="text-xs text-neutral-500">
                      Share this link on YouTube, Telegram, Discord, or X. Referral attribution cookies persist for 60 days.
                    </p>
                  </div>

                  {/* Tier status */}
                  <div className="metric-card p-5 text-center sm:text-left">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs uppercase font-bold text-neutral-400">Affiliate Tier</span>
                      <span className="text-xs font-black px-2.5 py-1 rounded-lg bg-[#ccff00]/10 text-[#ccff00] border border-[#ccff00]/25">
                        {profile.tier}
                      </span>
                    </div>

                    {(() => {
                      const prog = getTierProgress(Number(profile.total_sales_volume), profile.tier);
                      return (
                        <div className="space-y-2 mt-3">
                          <div className="flex justify-between text-xs text-neutral-400 font-mono">
                            <span>Next: {prog.nextTier}</span>
                            <span>Target: {prog.nextTarget}</span>
                          </div>
                          <div className="w-full bg-white/[0.06] rounded-full h-2 overflow-hidden">
                            <div
                              className="h-2 rounded-full bg-gradient-to-r from-[#ccff00] to-emerald-400 transition-all duration-500 shadow-[0_0_10px_rgba(204,255,0,0.5)]"
                              style={{ width: `${prog.percent}%` }}
                            />
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </div>

              {/* Metrics Grid with Metric Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="metric-card p-5">
                  <div className="text-neutral-400 text-xs font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <DollarSign size={14} className="text-[#ccff00]" /> Available Balance
                  </div>
                  <div className="text-2xl font-black font-mono text-[#ccff00]">
                    ${Number(profile.commission_balance).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </div>
                  <div className="text-xs text-neutral-500 mt-1">Ready for withdrawal ($50 min)</div>
                </div>

                <div className="metric-card p-5">
                  <div className="text-neutral-400 text-xs font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <TrendingUp size={14} className="text-emerald-400" /> Total Earned
                  </div>
                  <div className="text-2xl font-black font-mono text-white">
                    ${Number(profile.total_commission_earned).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </div>
                  <div className="text-xs text-neutral-500 mt-1 font-mono">
                    ${Number(profile.total_commission_paid).toLocaleString()} disbursed
                  </div>
                </div>

                <div className="metric-card p-5">
                  <div className="text-neutral-400 text-xs font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <Zap size={14} className="text-amber-400" /> Sales Volume
                  </div>
                  <div className="text-2xl font-black font-mono text-white">
                    ${Number(profile.total_sales_volume).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </div>
                  <div className="text-xs text-neutral-500 mt-1">From referred challenges</div>
                </div>

                <div className="metric-card p-5">
                  <div className="text-neutral-400 text-xs font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <Users size={14} className="text-cyan-400" /> Total Referred
                  </div>
                  <div className="text-2xl font-black font-mono text-white">
                    {profile.total_purchases_referred}
                  </div>
                  <div className="text-xs text-neutral-500 mt-1">Direct trader orders</div>
                </div>
              </div>

              {/* Commission Ledger Table */}
              <div className="bento-card overflow-hidden shadow-2xl p-0">
                <div className="px-6 py-4 border-b border-white/[0.07] flex items-center justify-between bg-white/[0.02]">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2 uppercase tracking-wider">
                    <Award size={16} className="text-[#ccff00]" /> Referral Commissions Ledger
                  </h3>
                  <span className="text-xs text-neutral-500 font-mono">
                    {commissions.length} {commissions.length === 1 ? "entry" : "entries"}
                  </span>
                </div>

                {commissions.length === 0 ? (
                  <div className="p-8 text-center text-neutral-500 text-xs font-mono">
                    No referral commissions recorded yet. Share your referral link to earn your first commission!
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-white/[0.06] text-neutral-500 uppercase tracking-wider text-[11px] font-bold bg-white/[0.01]">
                          <th className="px-6 py-3.5">Date</th>
                          <th className="px-4 py-3.5">Order Amount</th>
                          <th className="px-4 py-3.5">Commission Rate</th>
                          <th className="px-4 py-3.5">Commission Earned</th>
                          <th className="px-6 py-3.5">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/[0.03]">
                        {commissions.map((c) => (
                          <tr key={c.id} className="hover:bg-white/[0.02] transition">
                            <td className="px-6 py-4 text-neutral-400 font-mono">
                              {new Date(c.created_at).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-4 text-white font-mono font-medium">
                              ${Number(c.purchase_amount).toFixed(2)}
                            </td>
                            <td className="px-4 py-4 text-[#ccff00] font-black font-mono">{c.commission_rate}%</td>
                            <td className="px-4 py-4 text-[#ccff00] font-black font-mono text-sm">
                              +${Number(c.commission_amount).toFixed(2)}
                            </td>
                            <td className="px-6 py-4">
                              <span className="px-2.5 py-1 rounded-full bg-[#ccff00]/10 text-[#ccff00] border border-[#ccff00]/25 text-[10px] font-bold font-mono">
                                {c.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Payout Requests History */}
              {payouts.length > 0 && (
                <div className="bento-card overflow-hidden shadow-2xl p-0">
                  <div className="px-6 py-4 border-b border-white/[0.07] flex items-center justify-between bg-white/[0.02]">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2 uppercase tracking-wider">
                      <Clock size={16} className="text-[#ccff00]" /> Payout Request History
                    </h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-white/[0.06] text-neutral-500 uppercase tracking-wider text-[11px] font-bold bg-white/[0.01]">
                          <th className="px-6 py-3.5">Requested</th>
                          <th className="px-4 py-3.5">Amount</th>
                          <th className="px-4 py-3.5">Method</th>
                          <th className="px-4 py-3.5">Destination</th>
                          <th className="px-6 py-3.5">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/[0.03]">
                        {payouts.map((p) => (
                          <tr key={p.id} className="hover:bg-white/[0.02] transition">
                            <td className="px-6 py-4 text-neutral-400 font-mono">
                              {new Date(p.created_at).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-4 text-white font-black font-mono">${Number(p.amount).toFixed(2)}</td>
                            <td className="px-4 py-4 text-neutral-300 font-medium">{p.method}</td>
                            <td className="px-4 py-4 text-neutral-400 font-mono truncate max-w-xs">{p.destination}</td>
                            <td className="px-6 py-4">
                              <span
                                className={`px-2.5 py-1 rounded-full text-[10px] font-bold font-mono ${
                                  p.status === "PAID"
                                    ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                                    : p.status === "REJECTED"
                                    ? "bg-rose-500/15 text-rose-400 border border-rose-500/30"
                                    : "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                                }`}
                              >
                                {p.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* Payout Modal */}
      {showPayoutModal && profile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bento-card border border-[#ccff00]/40 max-w-md w-full p-6 sm:p-8 shadow-[0_0_60px_rgba(204,255,0,0.15)] space-y-5 relative overflow-hidden">
            {/* Top accent line */}
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#ccff00] to-transparent" />

            <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
              <h3 className="text-base font-black text-white uppercase tracking-wider flex items-center gap-2">
                <Wallet className="text-[#ccff00]" size={18} /> Request Commission Payout
              </h3>
              <button
                onClick={() => setShowPayoutModal(false)}
                className="text-neutral-500 hover:text-white transition p-1"
              >
                ✕
              </button>
            </div>

            <div className="metric-card p-4 flex justify-between items-center text-xs">
              <span className="text-neutral-400 font-bold uppercase tracking-wider">Available Balance:</span>
              <span className="text-[#ccff00] font-black font-mono text-base">
                ${Number(profile.commission_balance).toFixed(2)} USD
              </span>
            </div>

            {payoutMessage && (
              <div
                className={`p-3.5 rounded-xl text-xs font-semibold ${
                  payoutMessage.type === "success"
                    ? "bg-[#ccff00]/10 border border-[#ccff00]/30 text-[#ccff00]"
                    : "bg-rose-500/10 border border-rose-500/30 text-rose-400"
                }`}
              >
                {payoutMessage.text}
              </div>
            )}

            <form onSubmit={handleRequestPayout} className="space-y-4 text-xs">
              <div>
                <label className="block text-neutral-300 font-bold uppercase tracking-wider mb-1.5">
                  Withdrawal Amount ($50 min) *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-3 text-neutral-500 font-mono">$</span>
                  <input
                    type="number"
                    min={50}
                    max={Number(profile.commission_balance)}
                    step="0.01"
                    value={payoutAmount}
                    onChange={(e) => setPayoutAmount(parseFloat(e.target.value) || 0)}
                    className="w-full bg-[#12141a] border border-white/[0.08] rounded-xl pl-8 pr-3 py-2.5 text-white font-mono font-bold focus:border-[#ccff00] focus:outline-none transition"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-neutral-300 font-bold uppercase tracking-wider mb-1.5">Payout Method *</label>
                <select
                  value={payoutMethod}
                  onChange={(e) => setPayoutMethod(e.target.value)}
                  className="w-full bg-[#12141a] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-white focus:border-[#ccff00] focus:outline-none transition"
                >
                  <option value="CRYPTO_USDT">USDT (TRC-20 / ERC-20)</option>
                  <option value="BANK_WIRE">Bank Wire (SWIFT / IBAN)</option>
                  <option value="PAYPAL">PayPal</option>
                </select>
              </div>

              <div>
                <label className="block text-neutral-300 font-bold uppercase tracking-wider mb-1.5">
                  Destination Wallet / Account Details *
                </label>
                <input
                  type="text"
                  placeholder="e.g. USDT Tron address or PayPal email"
                  value={payoutDestination}
                  onChange={(e) => setPayoutDestination(e.target.value)}
                  className="w-full bg-[#12141a] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-white focus:border-[#ccff00] focus:outline-none font-mono transition"
                  required
                />
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPayoutModal(false)}
                  className="flex-1 px-4 py-3 rounded-xl bg-white/[0.05] hover:bg-white/[0.08] text-neutral-300 font-bold transition text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={payoutSubmitting}
                  className="btn-neon flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#ccff00] hover:bg-[#b3e600] text-black font-black text-xs uppercase tracking-tight transition disabled:opacity-50 shadow-neon"
                >
                  {payoutSubmitting ? <Loader2 size={14} className="animate-spin" /> : "Confirm Payout →"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
