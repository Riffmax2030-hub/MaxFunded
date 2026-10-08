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
    <div className="min-h-screen bg-[#08090b] text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Trader Profit Withdrawals</h1>
            <p className="text-sm text-slate-400 mt-1">
              Request profit split disbursements via Crypto USDT, SWIFT Wire, Nigerian Bank (NGN), or PayPal.
            </p>
          </div>
          <Link
            href="/dashboard"
            className="self-start sm:self-auto px-4 py-2 text-sm bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition"
          >
            ← Return to Dashboard
          </Link>
        </div>

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
            {error}
          </div>
        )}

        {successMsg && (
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-sm">
            {successMsg}
          </div>
        )}

        {/* KYC Verification Gate */}
        {eligibility && !eligibility.kyc_approved && (
          <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-5 flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl mt-0.5">⚠️</span>
              <div>
                <h3 className="font-bold text-amber-300 text-base">KYC Identity Verification Required</h3>
                <p className="text-amber-400/90 text-sm mt-1">
                  In compliance with global Anti-Money Laundering (AML) standards, identity verification must be approved before you can request profit withdrawals.
                </p>
              </div>
            </div>
            <Link
              href="/kyc"
              className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-lg shadow transition whitespace-nowrap"
            >
              Verify Identity Now →
            </Link>
          </div>
        )}

        {/* Account Selector & Live Calculator */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Account Selector Card */}
          <div className="md:col-span-1 rounded-xl border border-slate-800 bg-slate-900 p-5 space-y-4">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Trading Account</h3>
            
            {accounts.length === 0 ? (
              <p className="text-xs text-slate-500 italic">No trading accounts found.</p>
            ) : (
              <div className="space-y-2">
                {accounts.map((acc) => (
                  <button
                    key={acc.purchase_id}
                    onClick={() => handleAccountChange(acc.purchase_id)}
                    className={`w-full text-left p-3 rounded-lg border transition ${
                      selectedAccountId === acc.purchase_id
                        ? "bg-slate-800 border-[#ccff00]/60 ring-1 ring-[#ccff00]/30"
                        : "bg-slate-950 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    <div className="font-medium text-xs text-white">{acc.challenge_name}</div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1 font-mono">
                      <span>MT5: #{acc.mt5_login || "—"}</span>
                      <span className={acc.current_balance >= acc.starting_balance ? "text-emerald-400" : "text-red-400"}>
                        ${acc.current_balance.toLocaleString()}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Profit Split Breakdown Card */}
          <div className="md:col-span-2 rounded-xl border border-slate-800 bg-slate-900 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Profit Split Calculator (80/20)</h3>
              {eligibility?.is_eligible ? (
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Eligible for Payout
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-slate-800 text-slate-400 border border-slate-700">
                  Ineligible
                </span>
              )}
            </div>

            {eligibility ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                  <span className="text-[11px] text-slate-400">Starting Balance</span>
                  <p className="text-sm font-mono font-bold text-white mt-1">
                    ${eligibility.starting_balance.toLocaleString()}
                  </p>
                </div>
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                  <span className="text-[11px] text-slate-400">Current Balance</span>
                  <p className="text-sm font-mono font-bold text-white mt-1">
                    ${eligibility.current_balance.toLocaleString()}
                  </p>
                </div>
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                  <span className="text-[11px] text-slate-400">Net Profit</span>
                  <p className={`text-sm font-mono font-bold mt-1 ${eligibility.gross_profit > 0 ? "text-emerald-400" : "text-slate-400"}`}>
                    +${eligibility.gross_profit.toLocaleString()}
                  </p>
                </div>
                <div className="bg-emerald-950/40 p-3 rounded-lg border border-emerald-800/60">
                  <span className="text-[11px] text-emerald-400 font-bold">Trader Share ({Number(eligibility.profit_split_percentage)}%)</span>
                  <p className="text-base font-mono font-extrabold text-emerald-300 mt-0.5">
                    ${eligibility.eligible_trader_amount.toLocaleString()}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">Select an account to view eligibility.</p>
            )}

            {eligibility && !eligibility.is_eligible && (
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs text-slate-400 space-y-1">
                <span className="text-amber-400 font-semibold">Conditions Required:</span>
                <ul className="list-disc pl-4 space-y-0.5 text-[11px]">
                  {eligibility.ineligibility_reasons.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Withdrawal Request Form */}
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 space-y-6">
          <h2 className="text-lg font-bold text-white">Submit Withdrawal Request</h2>

          <form onSubmit={handleSubmitPayout} className="space-y-6">
            
            {/* Method Selector Tabs */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">Withdrawal Rail / Method *</label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {[
                  { id: "CRYPTO_USDT_TRC20", label: "USDT (TRC-20)", sub: "Tron Network" },
                  { id: "CRYPTO_USDT_ERC20", label: "USDT (ERC-20)", sub: "Ethereum Network" },
                  { id: "LOCAL_BANK_NGN", label: "Nigeria Bank (NGN)", sub: "Instant NIP Wire" },
                  { id: "BANK_WIRE_SWIFT", label: "SWIFT Wire", sub: "Global Wire Transfer" },
                  { id: "PAYPAL", label: "PayPal", sub: "Email Transfer" },
                ].map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setMethod(m.id)}
                    className={`p-3 rounded-lg border text-left transition ${
                      method === m.id
                        ? "bg-slate-800 border-[#ccff00] ring-1 ring-[#ccff00]"
                        : "bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-400"
                    }`}
                  >
                    <div className="text-xs font-bold text-white">{m.label}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">{m.sub}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Amount Field */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
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
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#ccff00] font-mono"
                  />
                  {eligibility && eligibility.gross_profit > 0 && (
                    <button
                      type="button"
                      onClick={() => setWithdrawAmount(String(eligibility.gross_profit))}
                      className="absolute right-2 top-2 text-[10px] bg-slate-700 hover:bg-slate-600 px-2 py-0.5 rounded text-[#ccff00] font-bold"
                    >
                      MAX (${eligibility.gross_profit.toLocaleString()})
                    </button>
                  )}
                </div>
              </div>

              {/* Dynamic Estimated Net Trader Receipt */}
              <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-400">Estimated Net Payout (80%)</span>
                  <p className="text-lg font-mono font-bold text-emerald-400 mt-0.5">
                    ${withdrawAmount ? (parseFloat(withdrawAmount) * 0.8).toFixed(2) : "0.00"}
                  </p>
                </div>
                <div className="text-right text-[10px] text-slate-500">
                  <span>Firm Fee (20%):</span>
                  <p className="font-mono text-slate-400">
                    ${withdrawAmount ? (parseFloat(withdrawAmount) * 0.2).toFixed(2) : "0.00"}
                  </p>
                </div>
              </div>
            </div>

            {/* Dynamic Method Input Fields */}
            {(method === "CRYPTO_USDT_TRC20" || method === "CRYPTO_USDT_ERC20") && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Recipient USDT Wallet Address ({method.replace("CRYPTO_USDT_", "")}) *
                </label>
                <input
                  type="text"
                  required
                  value={cryptoAddress}
                  onChange={(e) => setCryptoAddress(e.target.value)}
                  placeholder={method === "CRYPTO_USDT_TRC20" ? "e.g. TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t" : "e.g. 0xdAC17F958D2ee523a2206206994597C13D831ec7"}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#ccff00] font-mono"
                />
              </div>
            )}

            {method === "LOCAL_BANK_NGN" && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Nigerian Bank Name *</label>
                  <input
                    type="text"
                    required
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    placeholder="e.g. Zenith Bank, GTBank, Access"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#ccff00]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">10-Digit NUBAN Account *</label>
                  <input
                    type="text"
                    required
                    maxLength={10}
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    placeholder="e.g. 0123456789"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#ccff00] font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Account Holder Name *</label>
                  <input
                    type="text"
                    required
                    value={accountName}
                    onChange={(e) => setAccountName(e.target.value)}
                    placeholder="Must match KYC legal name"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#ccff00]"
                  />
                </div>
              </div>
            )}

            {method === "BANK_WIRE_SWIFT" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">IBAN / Account Number *</label>
                  <input
                    type="text"
                    required
                    value={iban}
                    onChange={(e) => setIban(e.target.value)}
                    placeholder="e.g. GB82WEST12345678901234"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#ccff00] font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">SWIFT / BIC Code *</label>
                  <input
                    type="text"
                    required
                    value={swift}
                    onChange={(e) => setSwift(e.target.value)}
                    placeholder="e.g. WESTGB2L"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#ccff00] font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Bank Name *</label>
                  <input
                    type="text"
                    required
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    placeholder="e.g. Barclays Bank UK"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#ccff00]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Beneficiary Full Name *</label>
                  <input
                    type="text"
                    required
                    value={accountName}
                    onChange={(e) => setAccountName(e.target.value)}
                    placeholder="Must match KYC legal name"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#ccff00]"
                  />
                </div>
              </div>
            )}

            {method === "PAYPAL" && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">PayPal Email Address *</label>
                <input
                  type="email"
                  required
                  value={paypalEmail}
                  onChange={(e) => setPaypalEmail(e.target.value)}
                  placeholder="e.g. trader@example.com"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#ccff00]"
                />
              </div>
            )}

            {/* Submit Action */}
            <div className="flex items-center justify-end">
              <button
                type="submit"
                disabled={actionLoading || !eligibility?.is_eligible}
                className="px-6 py-3 bg-[#ccff00] hover:bg-[#b3e600] text-black font-black rounded-xl shadow-lg shadow-[#ccff00]/10 transition disabled:opacity-40 flex items-center gap-2"
              >
                {actionLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    <span>Processing Request…</span>
                  </>
                ) : (
                  <span>Request Payout Disbursement →</span>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Historical Payouts Table */}
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 space-y-4">
          <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
            Disbursement History ({history.length})
          </h3>

          {history.length === 0 ? (
            <p className="text-xs text-slate-500 italic py-4">No historical payout requests found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-800/80 text-slate-400 uppercase tracking-wider font-mono">
                  <tr>
                    <th className="px-4 py-2.5">Date</th>
                    <th className="px-4 py-2.5">Method</th>
                    <th className="px-4 py-2.5">Gross Withdrawn</th>
                    <th className="px-4 py-2.5">Net Payout (80%)</th>
                    <th className="px-4 py-2.5">Status</th>
                    <th className="px-4 py-2.5">Tx Reference</th>
                    <th className="px-4 py-2.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300">
                  {history.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-800/50 transition">
                      <td className="px-4 py-3 font-mono text-slate-400">
                        {new Date(item.requested_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 font-semibold text-white">
                        {item.method.replace("CRYPTO_", "").replace("_", " ")}
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-300">
                        ${item.amount.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 font-mono font-bold text-emerald-400">
                        ${item.trader_amount.toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            item.status === "PAID"
                              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                              : item.status === "PROCESSING" || item.status === "APPROVED"
                              ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                              : item.status === "UNDER_REVIEW" || item.status === "REQUESTED"
                              ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                              : item.status === "REJECTED"
                              ? "bg-red-500/20 text-red-400 border border-red-500/30"
                              : "bg-slate-700 text-slate-400"
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-[11px] text-slate-400">
                        {item.tx_hash_or_reference ? (
                          <span className="text-primary-400">{item.tx_hash_or_reference.slice(0, 16)}…</span>
                        ) : (
                          item.rejection_reason || "—"
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {item.status === "REQUESTED" && (
                          <button
                            onClick={() => handleCancelPayout(item.id)}
                            className="px-2 py-1 bg-red-900/40 hover:bg-red-900/60 text-red-300 rounded border border-red-800 text-[10px]"
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
