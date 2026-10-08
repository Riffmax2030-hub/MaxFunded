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
      <main className="min-h-screen bg-slate-950 text-white pt-24 pb-20 px-4">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ccff00]/10 border border-[#ccff00]/30 text-[#ccff00] text-xs font-semibold uppercase tracking-wider mb-2">
                <Users size={14} /> Partner & Affiliate Network
              </div>
              <h1 className="text-3xl font-extrabold text-white">Affiliate Partner Dashboard</h1>
              <p className="text-slate-400 text-sm mt-1">
                Earn up to 20% recurring commission on all referred challenge purchases.
              </p>
            </div>
            {profile && Number(profile.commission_balance) >= 50 && (
              <button
                onClick={() => setShowPayoutModal(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm transition shadow-lg shadow-emerald-500/20"
              >
                <Wallet size={16} /> Request Commission Payout (${Number(profile.commission_balance).toFixed(2)})
              </button>
            )}
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center p-16 bg-slate-900 border border-slate-800 rounded-2xl">
              <Loader2 className="animate-spin text-[#ccff00] mb-4" size={40} />
              <p className="text-slate-400 text-sm">Loading your affiliate portal...</p>
            </div>
          ) : error ? (
            <div className="p-8 bg-slate-900 border border-red-500/30 rounded-2xl text-center">
              <AlertTriangle className="text-red-400 mx-auto mb-3" size={40} />
              <p className="text-slate-300 text-sm">{error}</p>
            </div>
          ) : !profile ? null : (
            <>
              {/* Referral Link & Tier Banner */}
              <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40 border border-slate-800 rounded-2xl p-6 sm:p-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
                  <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center gap-3">
                      <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">
                        Your Unique Referral Link
                      </span>
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#ccff00]/10 text-[#ccff00] border border-[#ccff00]/30 font-bold">
                        {profile.commission_rate}% Commission
                      </span>
                    </div>

                    <div className="flex items-center gap-2 bg-slate-950/80 border border-slate-700/80 rounded-xl p-2.5">
                      <div className="font-mono text-xs sm:text-sm text-slate-200 flex-1 truncate px-2 select-all">
                        {typeof window !== "undefined" ? window.location.origin : "https://maxfunded.com"}?ref={profile.referral_code}
                      </div>
                      <button
                        onClick={copyReferralUrl}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#ccff00] hover:bg-[#b3e600] text-black text-xs font-bold transition"
                      >
                        {copiedLink ? <CheckCircle2 size={14} /> : <Copy size={14} />}
                        {copiedLink ? "Copied!" : "Copy Link"}
                      </button>
                    </div>

                    <p className="text-xs text-slate-400">
                      Share this link on YouTube, Telegram, Discord, or X. Cookies last 60 days.
                    </p>
                  </div>

                  {/* Tier status */}
                  <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-5 text-center sm:text-left">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs uppercase font-semibold text-slate-400">Affiliate Tier</span>
                      <span className="text-xs font-black px-2.5 py-1 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                        {profile.tier}
                      </span>
                    </div>

                    {(() => {
                      const prog = getTierProgress(Number(profile.total_sales_volume), profile.tier);
                      return (
                        <div className="space-y-2 mt-3">
                          <div className="flex justify-between text-xs text-slate-400">
                            <span>Next: {prog.nextTier}</span>
                            <span>Target: {prog.nextTarget}</span>
                          </div>
                          <div className="w-full bg-slate-800 rounded-full h-2">
                            <div
                              className="h-2 rounded-full bg-gradient-to-r from-[#ccff00] to-amber-400 transition-all duration-500"
                              style={{ width: `${prog.percent}%` }}
                            />
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                  <div className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <DollarSign size={14} className="text-emerald-400" /> Available Balance
                  </div>
                  <div className="text-2xl font-black text-white">
                    ${Number(profile.commission_balance).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">Ready for withdrawal ($50 min)</div>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                  <div className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <TrendingUp size={14} className="text-[#ccff00]" /> Total Earned
                  </div>
                  <div className="text-2xl font-black text-white">
                    ${Number(profile.total_commission_earned).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    ${Number(profile.total_commission_paid).toLocaleString()} paid out
                  </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                  <div className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <Zap size={14} className="text-amber-400" /> Sales Volume
                  </div>
                  <div className="text-2xl font-black text-white">
                    ${Number(profile.total_sales_volume).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">From referred traders</div>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                  <div className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <Users size={14} className="text-cyan-400" /> Total Referred
                  </div>
                  <div className="text-2xl font-black text-white">
                    {profile.total_purchases_referred}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">Successful purchases</div>
                </div>
              </div>

              {/* Commission Ledger Table */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Award size={18} className="text-amber-400" /> Referral Commissions Ledger
                  </h3>
                  <span className="text-xs text-slate-400 font-mono">
                    {commissions.length} {commissions.length === 1 ? "entry" : "entries"}
                  </span>
                </div>

                {commissions.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 text-sm">
                    No referral commissions recorded yet. Share your referral link to earn your first commission!
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-950/60 text-slate-400 uppercase tracking-wider">
                        <tr>
                          <th className="p-3">Date</th>
                          <th className="p-3">Order Amount</th>
                          <th className="p-3">Commission Rate</th>
                          <th className="p-3">Commission Earned</th>
                          <th className="p-3">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/80">
                        {commissions.map((c) => (
                          <tr key={c.id} className="hover:bg-slate-800/30 transition">
                            <td className="p-3 text-slate-300 font-mono">
                              {new Date(c.created_at).toLocaleDateString()}
                            </td>
                            <td className="p-3 text-white font-medium">
                              ${Number(c.purchase_amount).toFixed(2)}
                            </td>
                            <td className="p-3 text-[#ccff00] font-semibold">{c.commission_rate}%</td>
                            <td className="p-3 text-emerald-400 font-bold text-sm">
                              +${Number(c.commission_amount).toFixed(2)}
                            </td>
                            <td className="p-3">
                              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-semibold">
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
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <Clock size={18} className="text-cyan-400" /> Payout Request History
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-950/60 text-slate-400 uppercase tracking-wider">
                        <tr>
                          <th className="p-3">Requested</th>
                          <th className="p-3">Amount</th>
                          <th className="p-3">Method</th>
                          <th className="p-3">Destination</th>
                          <th className="p-3">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/80">
                        {payouts.map((p) => (
                          <tr key={p.id} className="hover:bg-slate-800/30 transition">
                            <td className="p-3 text-slate-300 font-mono">
                              {new Date(p.created_at).toLocaleDateString()}
                            </td>
                            <td className="p-3 text-white font-bold">${Number(p.amount).toFixed(2)}</td>
                            <td className="p-3 text-slate-300">{p.method}</td>
                            <td className="p-3 text-slate-400 font-mono truncate max-w-xs">{p.destination}</td>
                            <td className="p-3">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                  p.status === "PAID"
                                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                                    : p.status === "REJECTED"
                                    ? "bg-red-500/10 text-red-400 border border-red-500/30"
                                    : "bg-amber-500/10 text-amber-400 border border-amber-500/30"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Wallet className="text-emerald-400" size={20} /> Request Commission Payout
              </h3>
              <button
                onClick={() => setShowPayoutModal(false)}
                className="text-slate-400 hover:text-white transition"
              >
                ✕
              </button>
            </div>

            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex justify-between items-center text-xs">
              <span className="text-slate-400">Available Balance:</span>
              <span className="text-emerald-400 font-bold text-sm">
                ${Number(profile.commission_balance).toFixed(2)} USD
              </span>
            </div>

            {payoutMessage && (
              <div
                className={`p-3 rounded-xl text-xs font-semibold ${
                  payoutMessage.type === "success"
                    ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400"
                    : "bg-red-500/10 border border-red-500/30 text-red-400"
                }`}
              >
                {payoutMessage.text}
              </div>
            )}

            <form onSubmit={handleRequestPayout} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Withdrawal Amount ($50 min)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-500">$</span>
                  <input
                    type="number"
                    min={50}
                    max={Number(profile.commission_balance)}
                    step="0.01"
                    value={payoutAmount}
                    onChange={(e) => setPayoutAmount(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-7 pr-3 py-2 text-white font-bold focus:border-[#ccff00] focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Payout Method</label>
                <select
                  value={payoutMethod}
                  onChange={(e) => setPayoutMethod(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:border-[#ccff00] focus:outline-none"
                >
                  <option value="CRYPTO_USDT">USDT (TRC-20 / ERC-20)</option>
                  <option value="BANK_WIRE">Bank Wire (SWIFT / IBAN)</option>
                  <option value="PAYPAL">PayPal</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Destination Address / Account
                </label>
                <input
                  type="text"
                  placeholder="e.g. USDT address or PayPal email"
                  value={payoutDestination}
                  onChange={(e) => setPayoutDestination(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:border-[#ccff00] focus:outline-none font-mono"
                  required
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPayoutModal(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={payoutSubmitting}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold transition disabled:opacity-50"
                >
                  {payoutSubmitting ? <Loader2 size={14} className="animate-spin" /> : "Confirm Payout"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
