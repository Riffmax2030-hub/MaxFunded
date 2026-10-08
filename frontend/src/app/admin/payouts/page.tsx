"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { SkeletonRow } from "@/components/AdminSkeleton";
import { Loader2, RefreshCw } from "lucide-react";
import {
  fetchAdminPayoutQueue,
  reviewAdminPayout,
  PayoutResponseData,
  AdminPayoutReviewPayload,
} from "@/lib/api";

export default function AdminPayoutsPage() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [queue, setQueue] = useState<PayoutResponseData[]>([]);
  const [filter, setFilter] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Review Modal State
  const [selectedPayout, setSelectedPayout] = useState<PayoutResponseData | null>(null);
  const [reviewStatus, setReviewStatus] = useState<string>("APPROVED");
  const [txRef, setTxRef] = useState<string>("");
  const [adminNotes, setAdminNotes] = useState<string>("");
  const [rejectionReason, setRejectionReason] = useState<string>("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const t = localStorage.getItem("access_token");
    if (!t) {
      router.push("/login");
      return;
    }
    setToken(t);
  }, [router]);

  const loadQueue = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAdminPayoutQueue(token, filter || undefined);
      setQueue(data);
    } catch (err: any) {
      setError(err.message || "Failed to load payout queue");
    } finally {
      setLoading(false);
    }
  }, [token, filter]);

  useEffect(() => {
    if (token) {
      loadQueue();
    }
  }, [token, loadQueue]);

  async function handleReviewSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token || !selectedPayout) return;

    if (reviewStatus === "REJECTED" && !rejectionReason.trim()) {
      alert("A specific rejection reason is required for audit compliance.");
      return;
    }

    if (reviewStatus === "PAID" && !txRef.trim()) {
      alert("Please provide the transaction hash or bank wire reference.");
      return;
    }

    setActionLoading(true);
    setError(null);
    setSuccessMsg(null);

    const payload: AdminPayoutReviewPayload = {
      status: reviewStatus,
      tx_hash_or_reference: txRef || undefined,
      admin_notes: adminNotes || undefined,
      rejection_reason: rejectionReason || undefined,
    };

    try {
      await reviewAdminPayout(selectedPayout.id, payload, token);
      setSuccessMsg(`Payout ${selectedPayout.id.slice(0, 8)} updated to ${reviewStatus}`);
      setSelectedPayout(null);
      setTxRef("");
      setAdminNotes("");
      setRejectionReason("");
      await loadQueue();
    } catch (err: any) {
      setError(err.message || "Review action failed");
    } finally {
      setActionLoading(false);
    }
  }

  const pendingCount = queue.filter((p) => p.status === "REQUESTED" || p.status === "UNDER_REVIEW").length;
  const paidTotal = queue
    .filter((p) => p.status === "PAID")
    .reduce((acc, curr) => acc + Number(curr.trader_amount), 0);
  const companyRetained = queue
    .filter((p) => p.status === "PAID")
    .reduce((acc, curr) => acc + Number(curr.company_fee_amount), 0);

  return (
    <div className="pb-20 px-6 xl:px-10 pt-8 text-slate-100">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Finance Payouts Operations Queue</h1>
            <p className="text-sm text-slate-400 mt-1">
              Trader profit withdrawal approval, treasury disbursement execution, and audit logging.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => loadQueue()}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition disabled:opacity-40"
            >
              {loading ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />}
              Refresh Queue
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
            <span className="text-xs text-slate-400">Total Requests</span>
            <p className="text-2xl font-bold text-white mt-1">{queue.length}</p>
          </div>
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
            <span className="text-xs text-amber-400 font-medium">Pending Review</span>
            <p className="text-2xl font-bold text-amber-300 mt-1">{pendingCount}</p>
          </div>
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
            <span className="text-xs text-emerald-400 font-medium">Total Paid to Traders</span>
            <p className="text-2xl font-bold text-emerald-300 mt-1">${paidTotal.toLocaleString()}</p>
          </div>
          <div className="rounded-xl border border-primary-500/30 bg-primary-500/10 p-4">
            <span className="text-xs text-primary-400 font-medium">Company Retained (20%)</span>
            <p className="text-2xl font-bold text-primary-300 mt-1">${companyRetained.toLocaleString()}</p>
          </div>
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

        {/* Filter Tabs */}
        <div className="flex gap-2 border-b border-slate-800 pb-2 overflow-x-auto text-xs font-medium">
          {[
            { label: "All Requests", val: "" },
            { label: "Requested", val: "REQUESTED" },
            { label: "Under Review", val: "UNDER_REVIEW" },
            { label: "Approved", val: "APPROVED" },
            { label: "Paid", val: "PAID" },
            { label: "Rejected", val: "REJECTED" },
          ].map((tab) => (
            <button
              key={tab.val}
              onClick={() => setFilter(tab.val)}
              className={`px-3 py-1.5 rounded-lg transition ${
                filter === tab.val
                  ? "bg-primary-600 text-white"
                  : "bg-slate-900 text-slate-400 hover:text-slate-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Payouts Table */}
        <div className="rounded-xl border border-slate-800 bg-slate-900 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-800/80 text-slate-400 uppercase tracking-wider font-mono">
                <tr>
                  <th className="px-4 py-3">Payout ID</th>
                  <th className="px-4 py-3">Method &amp; Destination</th>
                  <th className="px-4 py-3">Gross / Trader (80%)</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Reference / Tx</th>
                  <th className="px-4 py-3">Requested</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <SkeletonRow key={i} cols={7} />
                  ))
                ) : queue.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                      No payout records matching the selected filter.
                    </td>
                  </tr>
                ) : (
                  queue.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-800/50 transition">
                      <td className="px-4 py-3.5 font-mono text-slate-400">
                        <span className="font-semibold text-white">{item.id.slice(0, 8)}…</span>
                        <div className="text-[10px] text-slate-500 mt-0.5">Acc: {item.purchase_id.slice(0, 8)}</div>
                      </td>

                      <td className="px-4 py-3.5">
                        <span className="font-bold text-white">
                          {item.method.replace("CRYPTO_", "").replace("_", " ")}
                        </span>
                        <div className="font-mono text-[10px] text-slate-400 truncate max-w-xs mt-0.5">
                          {item.payout_details?.wallet_address ||
                            item.payout_details?.account_number ||
                            item.payout_details?.iban ||
                            item.payout_details?.paypal_email ||
                            JSON.stringify(item.payout_details)}
                        </div>
                      </td>

                      <td className="px-4 py-3.5 font-mono">
                        <div className="font-bold text-emerald-400">${item.trader_amount.toLocaleString()}</div>
                        <div className="text-[10px] text-slate-500">Gross: ${item.amount.toLocaleString()}</div>
                      </td>

                      <td className="px-4 py-3.5">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            item.status === "PAID"
                              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                              : item.status === "APPROVED" || item.status === "PROCESSING"
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

                      <td className="px-4 py-3.5 font-mono text-[11px] text-slate-400">
                        {item.tx_hash_or_reference ? (
                          <span className="text-primary-400">{item.tx_hash_or_reference.slice(0, 16)}…</span>
                        ) : (
                          item.rejection_reason || "—"
                        )}
                      </td>

                      <td className="px-4 py-3.5 font-mono text-slate-500">
                        {new Date(item.requested_at).toLocaleDateString()}
                      </td>

                      <td className="px-4 py-3.5 text-right">
                        <button
                          onClick={() => {
                            setSelectedPayout(item);
                            setReviewStatus(item.status === "REQUESTED" ? "UNDER_REVIEW" : item.status);
                            setTxRef(item.tx_hash_or_reference || "");
                            setAdminNotes(item.admin_notes || "");
                            setRejectionReason(item.rejection_reason || "");
                          }}
                          className="px-2.5 py-1 bg-primary-600 hover:bg-primary-500 text-white rounded text-[10px] font-semibold"
                        >
                          Review &amp; Execute
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Review & Execute Payout Modal */}
        {selectedPayout && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 space-y-6 shadow-2xl">
              
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-white">Disbursement Review &amp; Processing</h3>
                  <p className="text-xs text-slate-400 font-mono">Payout ID: {selectedPayout.id}</p>
                </div>
                <button
                  onClick={() => setSelectedPayout(null)}
                  className="text-slate-400 hover:text-white text-lg font-bold"
                >
                  ✕
                </button>
              </div>

              {/* Payout Details Summary */}
              <div className="grid grid-cols-2 gap-3 text-xs bg-slate-950 p-4 rounded-xl border border-slate-800">
                <div>
                  <span className="text-slate-500">Trader Payout Amount (80%):</span>
                  <p className="text-emerald-400 font-mono font-bold text-base mt-0.5">
                    ${selectedPayout.trader_amount.toLocaleString()}
                  </p>
                </div>
                <div>
                  <span className="text-slate-500">Company Fee Retained (20%):</span>
                  <p className="text-slate-300 font-mono font-semibold text-sm mt-0.5">
                    ${selectedPayout.company_fee_amount.toLocaleString()}
                  </p>
                </div>
                <div>
                  <span className="text-slate-500">Withdrawal Method:</span>
                  <p className="text-white font-semibold mt-0.5">{selectedPayout.method}</p>
                </div>
                <div>
                  <span className="text-slate-500">Current Status:</span>
                  <p className="text-amber-400 font-bold mt-0.5">{selectedPayout.status}</p>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-500">Destination Details:</span>
                  <pre className="mt-1 p-2 bg-slate-900 rounded font-mono text-[10px] text-slate-300 overflow-x-auto">
                    {JSON.stringify(selectedPayout.payout_details, null, 2)}
                  </pre>
                </div>
              </div>

              {/* Action Form */}
              <form onSubmit={handleReviewSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-2">Target Status *</label>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { status: "UNDER_REVIEW", label: "Under Review" },
                      { status: "APPROVED", label: "Approve" },
                      { status: "PAID", label: "Mark Paid" },
                      { status: "REJECTED", label: "Reject & Refund" },
                    ].map((b) => (
                      <button
                        key={b.status}
                        type="button"
                        onClick={() => setReviewStatus(b.status)}
                        className={`p-2 rounded-lg border text-xs font-bold transition text-center ${
                          reviewStatus === b.status
                            ? "bg-slate-800 border-primary-500 text-primary-400 ring-1 ring-primary-500"
                            : "border-slate-700 bg-slate-950 text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        {b.label}
                      </button>
                    ))}
                  </div>
                </div>

                {reviewStatus === "PAID" && (
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Transaction Hash / Bank Wire Reference *
                    </label>
                    <input
                      type="text"
                      required
                      value={txRef}
                      onChange={(e) => setTxRef(e.target.value)}
                      placeholder="e.g. 0x39a8f4c1b982ef78423bb09a28c41d7e or SWIFT-REF-90234"
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-primary-500 font-mono"
                    />
                  </div>
                )}

                {reviewStatus === "REJECTED" && (
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Rejection Reason (Funds will be restored to trading account) *
                    </label>
                    <textarea
                      required
                      rows={2}
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="e.g. Ineligible due to rule breach or copy trading violation."
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-primary-500"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Internal Finance Notes</label>
                  <input
                    type="text"
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="e.g. Processed via Fireblocks treasury wallet."
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-primary-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedPayout(null)}
                    className="px-4 py-2 bg-slate-800 text-slate-300 text-xs rounded-lg hover:bg-slate-700 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="px-5 py-2 bg-primary-600 hover:bg-primary-500 text-white text-xs font-bold rounded-lg transition disabled:opacity-50"
                  >
                    {actionLoading ? "Updating…" : `Confirm ${reviewStatus}`}
                  </button>
                </div>
              </form>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
