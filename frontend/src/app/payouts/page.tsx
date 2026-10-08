"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  fetchTradingAccounts,
  fetchPayoutEligibility,
  requestTraderPayout,
  fetchMyPayouts,
  cancelTraderPayout,
  AccountMetrics,
  PayoutEligibilityData,
  PayoutResponseData,
  PayoutRequestPayload,
} from "@/lib/api";

export default function PayoutsPage() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [accounts, setAccounts] = useState<AccountMetrics[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<string>("");
  const [eligibility, setEligibility] = useState<PayoutEligibilityData | null>(null);
  const [history, setHistory] = useState<PayoutResponseData[]>([]);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form State
  const [method, setMethod] = useState<string>("CRYPTO_USDT_TRC20");
  const [withdrawAmount, setWithdrawAmount] = useState<string>("");
  
  // Method Details
  const [cryptoAddress, setCryptoAddress] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [iban, setIban] = useState("");
  const [swift, setSwift] = useState("");
  const [paypalEmail, setPaypalEmail] = useState("");

  useEffect(() => {
    const t = localStorage.getItem("access_token");
    if (!t) {
      router.push("/login");
      return;
    }
    setToken(t);
  }, [router]);

  const loadData = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const [accs, payouts] = await Promise.all([
        fetchTradingAccounts(token),
        fetchMyPayouts(token),
      ]);
      setAccounts(accs);
      setHistory(payouts);

      if (accs.length > 0) {
        const initialId = selectedAccountId || accs[0].purchase_id;
        setSelectedAccountId(initialId);
        const elig = await fetchPayoutEligibility(initialId, token);
        setEligibility(elig);
        if (elig.gross_profit > 0) {
          setWithdrawAmount(elig.gross_profit.toString());
        }
      }
    } catch (err: any) {
      setError(err.message || "Failed to load payout data");
    } finally {
      setLoading(false);
    }
  }, [token, selectedAccountId]);

  useEffect(() => {
    if (token) {
      loadData();
    }
  }, [token, loadData]);

  async function handleAccountChange(accId: string) {
    setSelectedAccountId(accId);
    if (!token) return;
    try {
      const elig = await fetchPayoutEligibility(accId, token);
      setEligibility(elig);
      if (elig.gross_profit > 0) {
        setWithdrawAmount(elig.gross_profit.toString());
      } else {
        setWithdrawAmount("");
      }
    } catch (err: any) {
      setError(err.message || "Failed to update eligibility");
    }
  }

  async function handleSubmitPayout(e: React.FormEvent) {
    e.preventDefault();
    if (!token || !selectedAccountId || !eligibility) return;

    setActionLoading(true);
    setError(null);
    setSuccessMsg(null);

    let details: Record<string, any> = {};
    if (method === "CRYPTO_USDT_TRC20" || method === "CRYPTO_USDT_ERC20") {
      if (!cryptoAddress) {
        setError("Please enter your destination wallet address.");
        setActionLoading(false);
        return;
      }
      details = { wallet_address: cryptoAddress, network: method.replace("CRYPTO_USDT_", "") };
    } else if (method === "LOCAL_BANK_NGN") {
      if (!accountNumber || !bankName || !accountName) {
        setError("Please complete all Nigerian bank details.");
        setActionLoading(false);
        return;
      }
      details = { account_number: accountNumber, bank_name: bankName, account_name: accountName };
    } else if (method === "BANK_WIRE_SWIFT") {
      if (!iban || !swift || !accountName) {
        setError("Please complete all international wire details.");
        setActionLoading(false);
        return;
      }
      details = { iban, swift, beneficiary_name: accountName, bank_name: bankName };
    } else if (method === "PAYPAL") {
      if (!paypalEmail) {
        setError("Please enter your PayPal email.");
        setActionLoading(false);
        return;
      }
      details = { paypal_email: paypalEmail };
    }

    const payload: PayoutRequestPayload = {
      purchase_id: selectedAccountId,
      amount: withdrawAmount ? parseFloat(withdrawAmount) : undefined,
      method,
      payout_details: details,
    };

    try {
      await requestTraderPayout(payload, token);
      setSuccessMsg("Payout request submitted successfully! Your funds are now queued for finance review.");
      await loadData();
    } catch (err: any) {
      setError(err.message || "Payout request failed");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleCancelPayout(payoutId: string) {
    if (!token) return;
    if (!confirm("Are you sure you want to cancel this payout request? Your trading account balance will be restored.")) return;

    try {
      await cancelTraderPayout(payoutId, token);
      setSuccessMsg("Payout request cancelled and balance restored.");
      await loadData();
    } catch (err: any) {
      alert("Cancellation failed: " + err.message);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#08090b] flex items-center justify-center text-slate-400">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-[#ccff00] border-t-transparent rounded-full animate-spin" />
          <span>Loading profit payouts portal…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07080a] text-slate-100 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Ambient Glow */}
      <div className="glow-orb absolute top-0 left-1/2 -translate-x-1/2 w-[750px] h-[350px] bg-gradient-to-b from-[#ccff00]/[0.05] to-transparent blur-3xl pointer-events-none -z-10 rounded-full" />

      <div className="max-w-5xl mx-auto space-y-8 relative z-10">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ccff00]/10 border border-[#ccff00]/25 text-xs text-[#ccff00] font-bold mb-2">
              Financial Disbursements Hub
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight uppercase">Trader Profit Withdrawals</h1>
            <p className="text-sm text-neutral-400 mt-1">
              Disburse realized profits on-demand via USDT (TRC-20 / ERC-20), SWIFT Wire, Nigerian Bank (NGN), or PayPal.
            </p>
          </div>
          <Link
            href="/dashboard"
            className="self-start sm:self-auto px-5 py-2.5 text-xs font-bold bg-[#12141a] hover:bg-[#1a1e28] text-neutral-300 hover:text-white rounded-xl border border-white/[0.08] transition"
          >
            ← Return to Dashboard
          </Link>
        </div>

        {error && (
          <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-rose-400 text-sm font-medium">
            {error}
          </div>
        )}

        {successMsg && (
          <div className="p-4 bg-[#ccff00]/10 border border-[#ccff00]/30 rounded-2xl text-[#ccff00] text-sm font-medium">
            {successMsg}
          </div>
        )}

        {/* KYC Verification Gate */}
        {eligibility && !eligibility.kyc_approved && (
          <div className="bento-card border border-amber-500/40 bg-amber-500/10 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <span className="text-2xl mt-0.5">⚠️</span>
              <div>
                <h3 className="font-bold text-amber-300 text-base">KYC Identity Verification Required</h3>
                <p className="text-amber-300/80 text-sm mt-1 leading-relaxed">
                  In compliance with global Anti-Money Laundering (AML) standards, your identity dossier must be approved before you can submit profit withdrawal requests.
                </p>
              </div>
            </div>
            <Link
              href="/kyc"
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-black text-xs font-black uppercase tracking-tight rounded-xl shadow transition whitespace-nowrap self-stretch sm:self-auto text-center"
            >
              Verify Identity Now →
            </Link>
          </div>
        )}

        {/* Account Selector & Live Calculator */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Account Selector Card */}
          <div className="md:col-span-1 bento-card p-6 space-y-4">
            <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#ccff00]" />
              Select Trading Account
            </h3>
            
            {accounts.length === 0 ? (
              <p className="text-xs text-neutral-500 italic">No trading accounts found.</p>
            ) : (
              <div className="space-y-2.5">
                {accounts.map((acc) => (
                  <button
                    key={acc.purchase_id}
                    onClick={() => handleAccountChange(acc.purchase_id)}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all ${
                      selectedAccountId === acc.purchase_id
                        ? "bg-[#161a22] border-[#ccff00] shadow-[0_0_20px_rgba(204,255,0,0.15)] ring-1 ring-[#ccff00]/40"
                        : "bg-[#101217] border-white/[0.06] hover:border-white/[0.15]"
                    }`}
                  >
                    <div className="font-bold text-xs text-white tracking-wide">{acc.challenge_name}</div>
                    <div className="flex items-center justify-between text-xs text-neutral-400 mt-1.5 font-mono">
                      <span>MT5 #{acc.mt5_login || "—"}</span>
                      <span className={acc.current_balance >= acc.starting_balance ? "text-[#ccff00] font-bold" : "text-rose-400 font-bold"}>
                        ${acc.current_balance.toLocaleString()}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Profit Split Breakdown Card */}
          <div className="md:col-span-2 bento-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                Profit Split Analytics (80% – 90%)
              </h3>
              {eligibility?.is_eligible ? (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#ccff00]/15 text-[#ccff00] border border-[#ccff00]/30 shadow-[0_0_15px_rgba(204,255,0,0.15)]">
                  ✓ Eligible for Payout
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/[0.04] text-neutral-400 border border-white/[0.08]">
                  Ineligible
                </span>
              )}
            </div>

            {eligibility ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="metric-card p-4">
                  <span className="text-[11px] text-neutral-400 font-bold uppercase tracking-wider">Starting</span>
                  <p className="text-base font-mono font-bold text-white mt-1">
                    ${eligibility.starting_balance.toLocaleString()}
                  </p>
                </div>
                <div className="metric-card p-4">
                  <span className="text-[11px] text-neutral-400 font-bold uppercase tracking-wider">Balance</span>
                  <p className="text-base font-mono font-bold text-white mt-1">
                    ${eligibility.current_balance.toLocaleString()}
                  </p>
                </div>
                <div className="metric-card p-4">
                  <span className="text-[11px] text-neutral-400 font-bold uppercase tracking-wider">Gross Profit</span>
                  <p className={`text-base font-mono font-black mt-1 ${eligibility.gross_profit > 0 ? "text-[#ccff00]" : "text-neutral-500"}`}>
                    +${eligibility.gross_profit.toLocaleString()}
                  </p>
                </div>
                <div className="metric-card p-4 border-[#ccff00]/40 bg-[#ccff00]/[0.05]">
                  <span className="text-[11px] text-[#ccff00] font-bold uppercase tracking-wider">Trader Share</span>
                  <p className="text-lg font-mono font-black text-[#ccff00] mt-0.5">
                    ${eligibility.eligible_trader_amount.toLocaleString()}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-xs text-neutral-500 italic">Select an account to view eligibility.</p>
            )}

            {eligibility && !eligibility.is_eligible && (
              <div className="p-4 bg-[#12141a] rounded-xl border border-white/[0.06] text-xs text-neutral-400 space-y-1.5">
                <span className="text-amber-400 font-bold uppercase tracking-wider text-[11px]">Milestones Pending for First Payout:</span>
                <ul className="list-disc pl-4 space-y-1 text-xs">
                  {eligibility.ineligibility_reasons.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Withdrawal Request Form */}
        <div className="bento-card p-6 sm:p-8 space-y-6">
          <h2 className="text-lg font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ccff00]" />
            Submit Withdrawal Request
          </h2>

          <form onSubmit={handleSubmitPayout} className="space-y-6">
            
            {/* Method Selector Tabs */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2.5">Select Disbursement Rail *</label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {[
                  { id: "CRYPTO_USDT_TRC20", label: "USDT (TRC-20)", sub: "Tron Rail (Zero Fee)" },
                  { id: "CRYPTO_USDT_ERC20", label: "USDT (ERC-20)", sub: "Ethereum Rail" },
                  { id: "LOCAL_BANK_NGN", label: "Nigeria Bank", sub: "Instant NIP Transfer" },
                  { id: "BANK_WIRE_SWIFT", label: "SWIFT Wire", sub: "Global Bank Transfer" },
                  { id: "PAYPAL", label: "PayPal", sub: "Direct Email Transfer" },
                ].map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setMethod(m.id)}
                    className={`p-3.5 rounded-xl border text-left transition-all ${
                      method === m.id
                        ? "bg-[#151922] border-[#ccff00] shadow-[0_0_20px_rgba(204,255,0,0.15)] ring-1 ring-[#ccff00]"
                        : "bg-[#101217] border-white/[0.06] hover:border-white/[0.15] text-neutral-400"
                    }`}
                  >
                    <div className="text-xs font-bold text-white tracking-wide">{m.label}</div>
                    <div className="text-[10px] text-neutral-500 mt-0.5">{m.sub}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Amount Field */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
                  Gross Withdrawal Amount (USD) *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    min="50"
                    max={eligibility?.gross_profit ? String(eligibility.gross_profit) : undefined}
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    placeholder="Min $50.00"
                    className="w-full bg-[#12141a] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#ccff00] font-mono transition"
                  />
                  {eligibility && eligibility.gross_profit > 0 && (
                    <button
                      type="button"
                      onClick={() => setWithdrawAmount(String(eligibility.gross_profit))}
                      className="absolute right-2.5 top-2.5 text-[11px] bg-[#1a1e28] hover:bg-[#252b3a] px-3 py-1 rounded-lg text-[#ccff00] font-black border border-white/[0.08] transition"
                    >
                      MAX (${eligibility.gross_profit.toLocaleString()})
                    </button>
                  )}
                </div>
              </div>

              {/* Dynamic Estimated Net Trader Receipt */}
              <div className="bg-[#101217] border border-white/[0.06] rounded-xl p-4 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-neutral-400 uppercase font-bold tracking-wider">Estimated Net Trader Receipt</span>
                  <p className="text-2xl font-mono font-black text-[#ccff00] mt-0.5">
                    ${withdrawAmount ? (parseFloat(withdrawAmount) * 0.8).toFixed(2) : "0.00"}
                  </p>
                </div>
                <div className="text-right text-[11px] text-neutral-500">
                  <span>Firm Performance Fee:</span>
                  <p className="font-mono text-neutral-400 font-bold">
                    ${withdrawAmount ? (parseFloat(withdrawAmount) * 0.2).toFixed(2) : "0.00"}
                  </p>
                </div>
              </div>
            </div>

            {/* Dynamic Method Input Fields */}
            {(method === "CRYPTO_USDT_TRC20" || method === "CRYPTO_USDT_ERC20") && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">
                  Recipient USDT Wallet Address ({method.replace("CRYPTO_USDT_", "")}) *
                </label>
                <input
                  type="text"
                  required
                  value={cryptoAddress}
                  onChange={(e) => setCryptoAddress(e.target.value)}
                  placeholder={method === "CRYPTO_USDT_TRC20" ? "e.g. TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t" : "e.g. 0xdAC17F958D2ee523a2206206994597C13D831ec7"}
                  className="w-full bg-[#12141a] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#ccff00] font-mono transition"
                />
              </div>
            )}

            {method === "LOCAL_BANK_NGN" && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">Nigerian Bank Name *</label>
                  <input
                    type="text"
                    required
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    placeholder="e.g. Zenith Bank, GTBank, Access"
                    className="w-full bg-[#12141a] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#ccff00] transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">10-Digit NUBAN Account *</label>
                  <input
                    type="text"
                    required
                    maxLength={10}
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    placeholder="e.g. 0123456789"
                    className="w-full bg-[#12141a] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#ccff00] font-mono transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">Account Holder Legal Name *</label>
                  <input
                    type="text"
                    required
                    value={accountName}
                    onChange={(e) => setAccountName(e.target.value)}
                    placeholder="Must match KYC legal name"
                    className="w-full bg-[#12141a] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#ccff00] transition"
                  />
                </div>
              </div>
            )}

            {method === "BANK_WIRE_SWIFT" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">IBAN / Account Number *</label>
                  <input
                    type="text"
                    required
                    value={iban}
                    onChange={(e) => setIban(e.target.value)}
                    placeholder="e.g. GB82WEST12345678901234"
                    className="w-full bg-[#12141a] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#ccff00] font-mono transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">SWIFT / BIC Code *</label>
                  <input
                    type="text"
                    required
                    value={swift}
                    onChange={(e) => setSwift(e.target.value)}
                    placeholder="e.g. WESTGB2L"
                    className="w-full bg-[#12141a] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#ccff00] font-mono transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">Bank Name *</label>
                  <input
                    type="text"
                    required
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    placeholder="e.g. Barclays Bank UK"
                    className="w-full bg-[#12141a] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#ccff00] transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">Beneficiary Full Name *</label>
                  <input
                    type="text"
                    required
                    value={accountName}
                    onChange={(e) => setAccountName(e.target.value)}
                    placeholder="Must match KYC legal name"
                    className="w-full bg-[#12141a] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#ccff00] transition"
                  />
                </div>
              </div>
            )}

            {method === "PAYPAL" && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">PayPal Account Email *</label>
                <input
                  type="email"
                  required
                  value={paypalEmail}
                  onChange={(e) => setPaypalEmail(e.target.value)}
                  placeholder="e.g. trader@example.com"
                  className="w-full bg-[#12141a] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#ccff00] transition"
                />
              </div>
            )}

            {/* Submit Action */}
            <div className="flex items-center justify-end pt-2">
              <button
                type="submit"
                disabled={actionLoading || !eligibility?.is_eligible}
                className="btn-neon px-8 py-4 bg-[#ccff00] hover:bg-[#b3e600] text-black font-black text-sm uppercase tracking-tight rounded-xl shadow-neon transition disabled:opacity-40 flex items-center gap-2"
              >
                {actionLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    <span>Transmitting Request…</span>
                  </>
                ) : (
                  <span>Request Payout Disbursement →</span>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Historical Payouts Table */}
        <div className="bento-card overflow-hidden shadow-2xl p-0">
          <div className="px-6 py-4 border-b border-white/[0.07] flex items-center justify-between bg-white/[0.02]">
            <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#ccff00]" />
              Disbursement History ({history.length})
            </h3>
            <span className="text-xs text-neutral-500 font-mono">Real-time status tracking</span>
          </div>

          {history.length === 0 ? (
            <p className="text-xs text-neutral-500 italic p-6 text-center">No historical payout requests found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/[0.06] text-neutral-500 text-[11px] font-bold uppercase tracking-wider bg-white/[0.01]">
                    <th className="px-6 py-3.5">Date</th>
                    <th className="px-4 py-3.5">Disbursement Rail</th>
                    <th className="px-4 py-3.5">Gross Withdrawn</th>
                    <th className="px-4 py-3.5">Net Payout</th>
                    <th className="px-4 py-3.5">Status</th>
                    <th className="px-4 py-3.5">Tx Reference</th>
                    <th className="px-6 py-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.03]">
                  {history.map((item) => (
                    <tr key={item.id} className="hover:bg-white/[0.02] transition">
                      <td className="px-6 py-4 font-mono text-neutral-400">
                        {new Date(item.requested_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-4 font-bold text-white">
                        {item.method.replace("CRYPTO_", "").replace("_", " ")}
                      </td>
                      <td className="px-4 py-4 font-mono text-neutral-300">
                        ${item.amount.toLocaleString()}
                      </td>
                      <td className="px-4 py-4 font-mono font-black text-[#ccff00]">
                        ${item.trader_amount.toLocaleString()}
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            item.status === "PAID"
                              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                              : item.status === "PROCESSING" || item.status === "APPROVED"
                              ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                              : item.status === "UNDER_REVIEW" || item.status === "REQUESTED"
                              ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                              : item.status === "REJECTED"
                              ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                              : "bg-white/[0.04] text-neutral-400"
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="px-4 py-4 font-mono text-[11px] text-neutral-400">
                        {item.tx_hash_or_reference ? (
                          <span className="text-[#ccff00] font-medium">{item.tx_hash_or_reference.slice(0, 16)}…</span>
                        ) : (
                          item.rejection_reason || "—"
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {item.status === "REQUESTED" && (
                          <button
                            onClick={() => handleCancelPayout(item.id)}
                            className="px-3 py-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg border border-rose-500/30 text-[11px] font-bold transition"
                          >
                            Cancel
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
