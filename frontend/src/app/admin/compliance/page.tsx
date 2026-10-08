"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { SkeletonRow } from "@/components/AdminSkeleton";
import { Loader2, RefreshCw } from "lucide-react";
import {
  fetchAdminKYCVerifications,
  reviewKYCVerification,
  rescreenKYCAML,
  KYCVerificationData,
  AdminKYCReviewPayload,
} from "@/lib/api";

export default function AdminCompliancePage() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [verifications, setVerifications] = useState<KYCVerificationData[]>([]);
  const [filter, setFilter] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Selected Dossier for Review Modal
  const [selectedDossier, setSelectedDossier] = useState<KYCVerificationData | null>(null);
  const [reviewAction, setReviewAction] = useState<"APPROVED" | "REJECTED" | "REQUIRES_RETRY">("APPROVED");
  const [reviewerNotes, setReviewerNotes] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const t = localStorage.getItem("access_token");
    if (!t) {
      router.push("/login");
      return;
    }
    setToken(t);
  }, [router]);

  const loadVerifications = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAdminKYCVerifications(token, filter || undefined);
      setVerifications(data);
    } catch (err: any) {
      setError(err.message || "Failed to load verification queue");
    } finally {
      setLoading(false);
    }
  }, [token, filter]);

  useEffect(() => {
    if (token) {
      loadVerifications();
    }
  }, [token, loadVerifications]);

  async function handleReviewSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token || !selectedDossier) return;

    if (reviewAction === "REJECTED" && !rejectionReason.trim()) {
      alert("A specific rejection reason is required for compliance audit logs.");
      return;
    }

    setActionLoading(true);
    setError(null);
    setSuccessMsg(null);

    const payload: AdminKYCReviewPayload = {
      status: reviewAction,
      reviewer_notes: reviewerNotes || undefined,
      rejection_reason: rejectionReason || undefined,
    };

    try {
      await reviewKYCVerification(selectedDossier.id, payload, token);
      setSuccessMsg(`Dossier ${selectedDossier.id.slice(0, 8)} marked as ${reviewAction}`);
      setSelectedDossier(null);
      setReviewerNotes("");
      setRejectionReason("");
      await loadVerifications();
    } catch (err: any) {
      setError(err.message || "Review submission failed");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleRescreen(id: string) {
    if (!token) return;
    try {
      const result = await rescreenKYCAML(id, token);
      alert(`AML Re-Screening Complete:\nStatus: ${result.aml_status}\nRisk Score: ${result.aml_risk_score}%\nFlags: ${result.flags.join(", ") || "None"}`);
      await loadVerifications();
    } catch (err: any) {
      alert("Failed to re-screen: " + err.message);
    }
  }

  const pendingCount = verifications.filter((v) => v.status === "PENDING_REVIEW").length;
  const approvedCount = verifications.filter((v) => v.status === "APPROVED").length;
  const flaggedCount = verifications.filter((v) => v.aml_status === "FLAGGED" || v.aml_status === "HIGH_RISK").length;

  return (
    <div className="pb-20 px-6 xl:px-10 pt-8 text-slate-100">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Compliance &amp; KYC Verification Console</h1>
            <p className="text-sm text-slate-400 mt-1">
              Global trader identity verification, OFAC/UN sanctions audit, and AML risk determination.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => loadVerifications()}
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
            <span className="text-xs text-slate-400">Total Dossiers</span>
            <p className="text-2xl font-bold text-white mt-1">{verifications.length}</p>
          </div>
          <div className="rounded-xl border border-blue-500/30 bg-blue-500/10 p-4">
            <span className="text-xs text-blue-400 font-medium">Pending Review</span>
            <p className="text-2xl font-bold text-blue-300 mt-1">{pendingCount}</p>
          </div>
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
            <span className="text-xs text-emerald-400 font-medium">Approved Traders</span>
            <p className="text-2xl font-bold text-emerald-300 mt-1">{approvedCount}</p>
          </div>
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
            <span className="text-xs text-amber-400 font-medium">Flagged / High Risk AML</span>
            <p className="text-2xl font-bold text-amber-300 mt-1">{flaggedCount}</p>
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
            { label: "All Dossiers", val: "" },
            { label: "Pending Review", val: "PENDING_REVIEW" },
            { label: "Approved", val: "APPROVED" },
            { label: "Rejected", val: "REJECTED" },
            { label: "Requires Retry", val: "REQUIRES_RETRY" },
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

        {/* Verifications Table */}
        <div className="rounded-xl border border-slate-800 bg-slate-900 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-800/80 text-slate-400 uppercase tracking-wider font-mono">
                <tr>
                  <th className="px-4 py-3">Applicant Name</th>
                  <th className="px-4 py-3">Jurisdiction</th>
                  <th className="px-4 py-3">KYC Status</th>
                  <th className="px-4 py-3">AML &amp; PEP Risk</th>
                  <th className="px-4 py-3">Docs</th>
                  <th className="px-4 py-3">Submitted</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <SkeletonRow key={i} cols={7} />
                  ))
                ) : verifications.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                      No verification dossiers matching the selected filter.
                    </td>
                  </tr>
                ) : (
                  verifications.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-800/50 transition">
                      <td className="px-4 py-3.5">
                        <div className="font-semibold text-white">
                          {item.first_name || item.last_name
                            ? `${item.first_name || ""} ${item.last_name || ""}`
                            : "Draft Submission"}
                        </div>
                        <span className="font-mono text-[10px] text-slate-500">ID: {item.id.slice(0, 8)}</span>
                      </td>

                      <td className="px-4 py-3.5 font-mono">
                        <span>{item.nationality || "—"}</span>
                        {item.residence_country && item.residence_country !== item.nationality && (
                          <span className="text-slate-500"> (Res: {item.residence_country})</span>
                        )}
                      </td>

                      <td className="px-4 py-3.5">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            item.status === "APPROVED"
                              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                              : item.status === "PENDING_REVIEW"
                              ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                              : item.status === "REQUIRES_RETRY"
                              ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                              : item.status === "REJECTED"
                              ? "bg-red-500/20 text-red-400 border border-red-500/30"
                              : "bg-slate-700 text-slate-400"
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              item.aml_status === "CLEAR"
                                ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                                : item.aml_status === "FLAGGED"
                                ? "bg-amber-950 text-amber-400 border border-amber-800"
                                : "bg-red-950 text-red-400 border border-red-800"
                            }`}
                          >
                            {item.aml_status}
                          </span>
                          <span className="font-mono text-[10px] text-slate-400">
                            Risk: {item.aml_risk_score}%
                          </span>
                          {item.is_politically_exposed && (
                            <span className="text-[10px] bg-purple-900/60 text-purple-300 px-1 rounded">PEP</span>
                          )}
                        </div>
                      </td>

                      <td className="px-4 py-3.5 font-mono text-slate-400">
                        {item.documents ? item.documents.length : 0} docs
                      </td>

                      <td className="px-4 py-3.5 font-mono text-slate-500">
                        {item.submitted_at
                          ? new Date(item.submitted_at).toLocaleDateString()
                          : "Not submitted"}
                      </td>

                      <td className="px-4 py-3.5 text-right space-x-2">
                        <button
                          onClick={() => handleRescreen(item.id)}
                          className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 text-[10px]"
                        >
                          Re-screen
                        </button>
                        <button
                          onClick={() => {
                            setSelectedDossier(item);
                            setReviewAction(item.status === "APPROVED" ? "APPROVED" : "APPROVED");
                          }}
                          className="px-2.5 py-1 bg-primary-600 hover:bg-primary-500 text-white rounded text-[10px] font-semibold"
                        >
                          Review Dossier
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detailed Review Dossier Modal */}
        {selectedDossier && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
              
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-white">Compliance Dossier Review</h3>
                  <p className="text-xs text-slate-400 font-mono">Dossier ID: {selectedDossier.id}</p>
                </div>
                <button
                  onClick={() => setSelectedDossier(null)}
                  className="text-slate-400 hover:text-white text-lg font-bold"
                >
                  ✕
                </button>
              </div>

              {/* Applicant Info Summary */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs bg-slate-950 p-4 rounded-xl border border-slate-800">
                <div>
                  <span className="text-slate-500">Applicant:</span>
                  <p className="text-white font-semibold mt-0.5">{selectedDossier.first_name} {selectedDossier.last_name}</p>
                </div>
                <div>
                  <span className="text-slate-500">Date of Birth:</span>
                  <p className="text-white font-mono mt-0.5">{selectedDossier.date_of_birth || "—"}</p>
                </div>
                <div>
                  <span className="text-slate-500">Nationality:</span>
                  <p className="text-white font-mono mt-0.5">{selectedDossier.nationality || "—"}</p>
                </div>
                <div>
                  <span className="text-slate-500">Residence Country:</span>
                  <p className="text-white font-mono mt-0.5">{selectedDossier.residence_country || "—"}</p>
                </div>
                <div>
                  <span className="text-slate-500">City / Address:</span>
                  <p className="text-white mt-0.5">{selectedDossier.city}, {selectedDossier.address_line}</p>
                </div>
                <div>
                  <span className="text-slate-500">PEP Self-Declaration:</span>
                  <p className={`font-semibold mt-0.5 ${selectedDossier.is_politically_exposed ? "text-amber-400" : "text-emerald-400"}`}>
                    {selectedDossier.is_politically_exposed ? "YES (Exposed)" : "NO (Clean)"}
                  </p>
                </div>
              </div>

              {/* Attached Documents */}
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Submitted Verification Documents ({selectedDossier.documents.length})
                </h4>
                {selectedDossier.documents.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">No files attached to this submission.</p>
                ) : (
                  <div className="space-y-1.5 text-xs">
                    {selectedDossier.documents.map((doc, idx) => (
                      <div key={idx} className="p-3 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-between">
                        <div>
                          <span className="font-mono text-primary-400 font-bold">{doc.document_type}</span>
                          <span className="text-slate-300 ml-2">{doc.file_name}</span>
                          {doc.document_number && (
                            <span className="text-slate-500 ml-2 font-mono">#{doc.document_number}</span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">{doc.file_url}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Decision Action Form */}
              <form onSubmit={handleReviewSubmit} className="space-y-4 border-t border-slate-800 pt-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-2">Reviewer Determination *</label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { action: "APPROVED", label: "Approve Identity", color: "border-emerald-500 text-emerald-400" },
                      { action: "REQUIRES_RETRY", label: "Request Retry", color: "border-amber-500 text-amber-400" },
                      { action: "REJECTED", label: "Reject Submission", color: "border-red-500 text-red-400" },
                    ].map((btn) => (
                      <button
                        key={btn.action}
                        type="button"
                        onClick={() => setReviewAction(btn.action as any)}
                        className={`p-2.5 rounded-lg border text-xs font-bold transition text-center ${
                          reviewAction === btn.action
                            ? `bg-slate-800 ${btn.color} ring-1 ring-current`
                            : "border-slate-700 bg-slate-950 text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        {btn.label}
                      </button>
                    ))}
                  </div>
                </div>

                {reviewAction !== "APPROVED" && (
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Reason for Rejection / Retry Instructions (shown to trader) *
                    </label>
                    <textarea
                      required
                      rows={2}
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="e.g. Passport scan was blurry. Please provide high resolution scan with all 4 corners visible."
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-primary-500"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Internal Compliance Reviewer Notes</label>
                  <input
                    type="text"
                    value={reviewerNotes}
                    onChange={(e) => setReviewerNotes(e.target.value)}
                    placeholder="e.g. Checked against OFAC list; no adverse media matches."
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-primary-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedDossier(null)}
                    className="px-4 py-2 bg-slate-800 text-slate-300 text-xs rounded-lg hover:bg-slate-700 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="px-5 py-2 bg-primary-600 hover:bg-primary-500 text-white text-xs font-bold rounded-lg transition disabled:opacity-50"
                  >
                    {actionLoading ? "Applying Decision…" : `Confirm ${reviewAction}`}
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
