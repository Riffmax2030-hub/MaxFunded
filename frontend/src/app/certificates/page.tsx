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
  ShieldCheck,
  Loader2,
  ArrowRight,
  AlertTriangle,
  X,
} from "lucide-react";
import MaxFundedCertificate from "@/components/MaxFundedCertificate";

export default function TraderCertificatesPage() {
  const [certs, setCerts] = useState<CertificateItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [selectedCert, setSelectedCert] = useState<CertificateItem | null>(null);

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
    <div className="min-h-screen bg-[#07080a] text-white pt-8 pb-20 px-4 sm:px-6 relative overflow-hidden">
      {/* Ambient Glow */}
      <div className="glow-orb absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-b from-[#ccff00]/[0.05] to-transparent blur-3xl pointer-events-none -z-10 rounded-full" />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10 border-b border-white/[0.08] pb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ccff00]/10 border border-[#ccff00]/25 text-[#ccff00] text-xs font-bold uppercase tracking-wider mb-2">
              <Award size={14} /> Cryptographic Proof of Skill
            </div>
            <h1 className="text-3xl font-black text-white uppercase tracking-tight">Trader Certificates of Achievement</h1>
            <p className="text-neutral-400 text-sm mt-1">
              Cryptographically signed milestone credentials verifiable on public ledger.
            </p>
          </div>
          <Link
            href="/dashboard"
            className="self-start md:self-auto inline-flex items-center gap-2 text-xs font-bold px-5 py-2.5 rounded-xl bg-[#12141a] hover:bg-[#1a1e28] text-neutral-300 hover:text-white border border-white/[0.08] transition"
          >
            ← Return to Dashboard
          </Link>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center p-16 bento-card">
            <Loader2 className="animate-spin text-[#ccff00] mb-4" size={40} />
            <p className="text-neutral-400 text-sm font-mono uppercase tracking-wider">Retrieving your certificate portfolio...</p>
          </div>
        ) : error ? (
          <div className="p-8 bento-card border-rose-500/30 text-center">
            <AlertTriangle className="text-rose-400 mx-auto mb-3" size={40} />
            <p className="text-neutral-300 text-sm">{error}</p>
          </div>
        ) : certs.length === 0 ? (
          <div className="p-12 sm:p-16 bento-card text-center">
            <div className="w-16 h-16 rounded-2xl bg-[#ccff00]/10 border border-[#ccff00]/25 flex items-center justify-center mx-auto mb-4 text-[#ccff00]">
              <Award size={32} />
            </div>
            <h2 className="text-2xl font-black text-white mb-2 uppercase">No Certificates Issued Yet</h2>
            <p className="text-neutral-400 text-sm max-w-md mx-auto mb-8 leading-relaxed">
              Pass your Phase 1 evaluation, Phase 2 verification, or receive your first performance payout to automatically mint cryptographic achievement credentials.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/challenges"
                className="btn-neon inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#ccff00] hover:bg-[#b3e600] text-black font-black text-xs uppercase tracking-tight shadow-neon transition"
              >
                <span>Start Evaluation Challenge</span>
                <ArrowRight size={16} />
              </Link>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-white font-bold text-xs transition"
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
                  className="bento-card p-6 flex flex-col justify-between group transition-all duration-300 hover:border-[#ccff00]/40"
                >
                  <div>
                    {/* Top badge */}
                    <div className="flex items-center justify-between mb-4">
                      <span className={`text-[11px] font-bold px-3 py-1 rounded-full border ${meta.color}`}>
                        {meta.title}
                      </span>
                      {c.is_revoked ? (
                        <span className="text-[10px] font-bold text-rose-400 bg-rose-950/40 px-2 py-0.5 rounded border border-rose-500/30">
                          REVOKED
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-[#ccff00] flex items-center gap-1 font-mono">
                          <CheckCircle2 size={13} /> VERIFIED
                        </span>
                      )}
                    </div>

                    {/* Title & Details */}
                    <div className="mb-4">
                      <h3 className="text-base font-bold text-white mb-1 group-hover:text-[#ccff00] transition">
                        {c.challenge_name}
                      </h3>
                      <div className="text-2xl font-black font-mono text-white tracking-tight">
                        ${Number(c.account_size).toLocaleString()} USD
                      </div>
                      {c.payout_amount && (
                        <div className="text-xs text-[#ccff00] font-bold font-mono mt-1">
                          Profit Disbursed: ${Number(c.payout_amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                        </div>
                      )}
                    </div>

                    {/* Code & Date */}
                    <div className="space-y-1.5 text-xs text-neutral-400 pt-3 border-t border-white/[0.06] mb-6 font-mono">
                      <div className="flex items-center justify-between">
                        <span className="text-neutral-500 text-[11px]">LEDGER ID:</span>
                        <span className="text-neutral-200 font-bold">{c.certificate_code}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-neutral-500 text-[11px]">ISSUED:</span>
                        <span>{new Date(c.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-2">
                    <button
                      onClick={() => setSelectedCert(c)}
                      className="btn-neon flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#ccff00] hover:bg-[#b3e600] text-black font-black text-xs uppercase tracking-tight shadow-neon transition"
                    >
                      <ShieldCheck size={14} /> Preview Charter
                    </button>
                    <Link
                      href={`/verify/${c.certificate_code}`}
                      target="_blank"
                      title="Open Public Ledger Verification"
                      className="p-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-neutral-300 hover:text-white transition text-xs"
                    >
                      <ExternalLink size={16} />
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

        {/* Certificate Modal */}
        {selectedCert && (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
            <div className="relative w-full max-w-4xl bg-slate-950 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-2xl my-8">
              {/* Close Button & Actions Header */}
              <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2 text-sm text-slate-300">
                  <Award className="text-amber-400" size={18} />
                  <span className="font-bold text-white">Official Certificate Preview</span>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/verify/${selectedCert.certificate_code}`}
                    target="_blank"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition"
                  >
                    <ExternalLink size={14} /> Public Ledger
                  </Link>
                  <button
                    onClick={() => setSelectedCert(null)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* Premium Certificate Component — includes built-in PDF download */}
              <div className="overflow-x-auto p-2">
                <MaxFundedCertificate
                  cert={{
                    is_valid: !selectedCert.is_revoked,
                    certificate_code: selectedCert.certificate_code,
                    certificate_type: selectedCert.certificate_type,
                    trader_name: selectedCert.trader_name,
                    challenge_name: selectedCert.challenge_name,
                    account_size: selectedCert.account_size,
                    payout_amount: selectedCert.payout_amount,
                    issued_at: selectedCert.created_at,
                    sha256_signature: selectedCert.sha256_signature,
                    is_revoked: selectedCert.is_revoked,
                    revocation_reason: selectedCert.revocation_reason,
                    issuer: "MaxFunded",
                    verification_url:
                      typeof window !== "undefined"
                        ? `${window.location.origin}/verify/${selectedCert.certificate_code}`
                        : "",
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
  );
}
