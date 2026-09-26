"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { fetchMyCertificates, CertificateItem } from "@/lib/api";
import {
  Award,
  CheckCircle2,
  ExternalLink,
  Copy,
  Calendar,
  ShieldCheck,
  Loader2,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";

export default function TraderCertificatesPage() {
  const [certs, setCerts] = useState<CertificateItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      const session = getSession();
      if (!session) {
        setError("Please sign in to view your earned certificates.");
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setError(null);
        const data = await fetchMyCertificates(session.token);
        setCerts(data);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to load certificates";
        setError(msg);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const copyVerifyUrl = (code: string) => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const url = `${origin}/verify/${code}`;
    navigator.clipboard.writeText(url);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const getBadgeMeta = (type: string) => {
    switch (type) {
      case "PHASE_1_PASSED":
        return {
          title: "Phase 1 Evaluation Passed",
          color: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
          iconColor: "text-emerald-400",
        };
      case "PHASE_2_PASSED":
        return {
          title: "Phase 2 Verification Passed",
          color: "border-blue-500/30 bg-blue-500/10 text-blue-400",
          iconColor: "text-blue-400",
        };
      case "FUNDED_TRADER":
        return {
          title: "Funded Trader Certificate",
          color: "border-amber-500/30 bg-amber-500/10 text-amber-400",
          iconColor: "text-amber-400",
        };
      case "PAYOUT_ACHIEVER":
        return {
          title: "Performance Payout Achiever",
          color: "border-violet-500/30 bg-violet-500/10 text-violet-400",
          iconColor: "text-violet-400",
        };
      default:
        return {
          title: "Certificate of Achievement",
          color: "border-slate-500/30 bg-slate-500/10 text-slate-400",
          iconColor: "text-slate-400",
        };
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white pt-6 pb-20 px-4">
      <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-2">
                <Award size={14} /> Official Credentials
              </div>
              <h1 className="text-3xl font-extrabold text-white">My Certificates of Achievement</h1>
              <p className="text-slate-400 text-sm mt-1">
                Share your cryptographically verified milestones with your network.
              </p>
            </div>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 text-xs font-semibold px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            >
              ← Back to Trader Dashboard
            </Link>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center p-16 bg-slate-900 border border-slate-800 rounded-2xl">
              <Loader2 className="animate-spin text-amber-400 mb-4" size={40} />
              <p className="text-slate-400 text-sm">Retrieving your certificate portfolio...</p>
            </div>
          ) : error ? (
            <div className="p-8 bg-slate-900 border border-red-500/30 rounded-2xl text-center">
              <AlertTriangle className="text-red-400 mx-auto mb-3" size={40} />
              <p className="text-slate-300 text-sm">{error}</p>
            </div>
          ) : certs.length === 0 ? (
            <div className="p-12 bg-slate-900 border border-slate-800 rounded-2xl text-center">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-4">
                <Award className="text-amber-400" size={32} />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">No Certificates Issued Yet</h2>
              <p className="text-slate-400 text-sm max-w-md mx-auto mb-6">
                Pass your Phase 1 evaluation, Phase 2 verification, or request your first profit payout to automatically unlock cryptographic certificates.
              </p>
              <div className="flex items-center justify-center gap-3">
                <Link
                  href="/challenges"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-sm transition"
                >
                  Start a Challenge <ArrowRight size={16} />
                </Link>
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-sm transition"
                >
                  View Dashboard
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {certs.map((c) => {
                const meta = getBadgeMeta(c.certificate_type);
                return (
                  <div
                    key={c.id}
                    className="relative bg-slate-900 border border-slate-800 hover:border-amber-500/40 rounded-2xl p-6 transition flex flex-col justify-between shadow-lg hover:shadow-amber-500/5 group"
                  >
                    <div>
                      {/* Top badge */}
                      <div className="flex items-center justify-between mb-4">
                        <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${meta.color}`}>
                          {meta.title}
                        </span>
                        {c.is_revoked ? (
                          <span className="text-[10px] font-bold text-red-400 bg-red-950/40 px-2 py-0.5 rounded border border-red-500/30">
                            REVOKED
                          </span>
                        ) : (
                          <span className="text-[10px] font-medium text-emerald-400 flex items-center gap-1">
                            <CheckCircle2 size={12} /> Valid
                          </span>
                        )}
                      </div>

                      {/* Title & Details */}
                      <div className="mb-4">
                        <h3 className="text-lg font-bold text-white mb-1 group-hover:text-amber-400 transition">
                          {c.challenge_name}
                        </h3>
                        <div className="text-2xl font-black text-amber-300">
                          ${Number(c.account_size).toLocaleString()} USD
                        </div>
                        {c.payout_amount && (
                          <div className="text-xs text-emerald-400 font-medium mt-1">
                            Profit Payout: ${Number(c.payout_amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                          </div>
                        )}
                      </div>

                      {/* Code & Date */}
                      <div className="space-y-1.5 text-xs text-slate-400 pt-3 border-t border-slate-800/80 mb-6 font-mono">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 text-[11px]">CODE:</span>
                          <span className="text-slate-300 font-semibold">{c.certificate_code}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 text-[11px]">ISSUED:</span>
                          <span>{new Date(c.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-2">
                      <Link
                        href={`/verify/${c.certificate_code}`}
                        target="_blank"
                        className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs transition"
                      >
                        <ShieldCheck size={14} /> View Certificate <ExternalLink size={12} />
                      </Link>
                      <button
                        onClick={() => copyVerifyUrl(c.certificate_code)}
                        title="Copy Public Verification Link"
                        className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition text-xs"
                      >
                        <Copy size={16} />
                      </button>
                    </div>
                    {copiedCode === c.certificate_code && (
                      <div className="text-[10px] text-center text-emerald-400 mt-2 font-medium">
                        Verification URL copied!
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
  );
}
