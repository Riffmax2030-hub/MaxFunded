"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { verifyCertificatePublic, PublicCertificateData } from "@/lib/api";
import {
  Award,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  Share2,
  Copy,
  Printer,
  ExternalLink,
  Loader2,
  Hash,
  Calendar,
  DollarSign,
  TrendingUp,
} from "lucide-react";

export default function CertificateVerificationPage() {
  const params = useParams();
  const code = (params?.code as string) || "";

  const [cert, setCert] = useState<PublicCertificateData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!code) return;
    const loadCert = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await verifyCertificatePublic(code);
        setCert(data);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to verify certificate";
        setError(msg);
      } finally {
        setLoading(false);
      }
    };
    loadCert();
  }, [code]);

  const copyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const printCertificate = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  const shareOnX = () => {
    if (!cert) return;
    const text = `I just earned my official ${cert.certificate_type.replace(/_/g, " ")} certificate from @RiffmaxFunding on my $${Number(cert.account_size).toLocaleString()} account! 🚀 Verify my accomplishment here:`;
    const url = typeof window !== "undefined" ? window.location.href : "";
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      "_blank"
    );
  };

  const getBadgeTitle = (type: string) => {
    switch (type) {
      case "PHASE_1_PASSED":
        return "Phase 1 Evaluation Passed";
      case "PHASE_2_PASSED":
        return "Phase 2 Verification Passed";
      case "FUNDED_TRADER":
        return "Certified Funded Trader";
      case "PAYOUT_ACHIEVER":
        return "Performance Profit Payout";
      default:
        return "Certificate of Achievement";
    }
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-slate-950 text-white pt-24 pb-20 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-3">
              <ShieldCheck size={14} /> Public Verifiable Credential
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-slate-100">
              Certificate of Achievement
            </h1>
            <p className="mt-2 text-sm text-slate-400">
              Cryptographically verified record stored on the Riffmax Funding Ledger.
            </p>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center p-16 bg-slate-900/60 border border-slate-800 rounded-2xl">
              <Loader2 className="animate-spin text-emerald-400 mb-4" size={40} />
              <p className="text-slate-400 text-sm">Querying cryptographic registry for {code}...</p>
            </div>
          ) : error || !cert ? (
            <div className="p-8 bg-slate-900 border border-red-500/30 rounded-2xl text-center">
              <AlertTriangle className="text-red-400 mx-auto mb-3" size={44} />
              <h2 className="text-xl font-bold text-white mb-2">Certificate Not Found</h2>
              <p className="text-slate-400 text-sm max-w-md mx-auto mb-6">
                The identifier <code className="text-red-400 bg-red-950/40 px-2 py-0.5 rounded">{code}</code> could not be validated. It may have expired, been miscopied, or was never issued.
              </p>
              <Link
                href="/challenges"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-medium text-sm transition"
              >
                Explore Trading Challenges
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Certificate Canvas / Card */}
              <div
                id="certificate-print-area"
                className="relative bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-2 border-amber-500/40 rounded-3xl p-8 sm:p-12 shadow-2xl shadow-amber-500/5 overflow-hidden"
              >
                {/* Decorative background watermark and corners */}
                <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

                {/* Inner Border */}
                <div className="border border-amber-500/20 rounded-2xl p-6 sm:p-10 flex flex-col items-center text-center">
                  {/* Top Seal / Brand */}
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
                      <Award className="text-slate-950" size={28} />
                    </div>
                    <div className="text-left">
                      <div className="text-lg font-black tracking-wider text-amber-400 uppercase">
                        Riffmax Funding
                      </div>
                      <div className="text-xs text-slate-400 tracking-widest uppercase">
                        Official Proprietary Firm
                      </div>
                    </div>
                  </div>

                  {/* Verification Banner */}
                  {cert.is_revoked ? (
                    <div className="mb-6 px-4 py-2 rounded-xl bg-red-500/20 border border-red-500/40 text-red-300 text-xs font-semibold flex items-center gap-2">
                      <AlertTriangle size={16} className="text-red-400" />
                      CERTIFICATE REVOKED: {cert.revocation_reason || "Violation of rules"}
                    </div>
                  ) : (
                    <div className="mb-6 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-2">
                      <CheckCircle2 size={14} /> Officially Authenticated & Valid
                    </div>
                  )}

                  {/* Title */}
                  <h2 className="text-xs uppercase tracking-[0.25em] text-slate-400 font-semibold mb-2">
                    Certificate of Excellence
                  </h2>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-100 mb-6">
                    {getBadgeTitle(cert.certificate_type)}
                  </h3>

                  <p className="text-xs text-slate-400 uppercase tracking-widest mb-1">
                    This certifies that
                  </p>
                  <div className="text-3xl sm:text-4xl font-extrabold text-white mb-4 tracking-tight">
                    {cert.trader_name}
                  </div>

                  <p className="max-w-xl text-slate-300 text-sm leading-relaxed mb-8">
                    has proven exceptional discipline, risk management, and market proficiency by meeting all trading objectives for the{" "}
                    <span className="text-emerald-400 font-semibold">{cert.challenge_name}</span> with a simulated capital allocation of{" "}
                    <span className="text-amber-400 font-semibold">${Number(cert.account_size).toLocaleString()} USD</span>.
                  </p>

                  {cert.payout_amount && (
                    <div className="mb-8 px-6 py-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-center">
                      <div className="text-xs text-amber-300 uppercase tracking-wider font-semibold">
                        Realized Profit Share Paid
                      </div>
                      <div className="text-2xl font-bold text-amber-400">
                        ${Number(cert.payout_amount).toLocaleString("en-US", { minimumFractionDigits: 2 })} USD
                      </div>
                    </div>
                  )}

                  {/* Metadata Grid */}
                  <div className="w-full grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-slate-800 text-left">
                    <div>
                      <div className="text-[11px] uppercase tracking-wider text-slate-500 mb-1 flex items-center gap-1">
                        <Hash size={12} /> Certificate Code
                      </div>
                      <div className="font-mono text-xs text-slate-300 font-semibold break-all">
                        {cert.certificate_code}
                      </div>
                    </div>

                    <div>
                      <div className="text-[11px] uppercase tracking-wider text-slate-500 mb-1 flex items-center gap-1">
                        <Calendar size={12} /> Date Issued
                      </div>
                      <div className="text-xs text-slate-300 font-semibold">
                        {new Date(cert.issued_at).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </div>
                    </div>

                    <div>
                      <div className="text-[11px] uppercase tracking-wider text-slate-500 mb-1 flex items-center gap-1">
                        <ShieldCheck size={12} /> Issuing Entity
                      </div>
                      <div className="text-xs text-emerald-400 font-semibold">
                        {cert.issuer}
                      </div>
                    </div>
                  </div>

                  {/* Cryptographic SHA-256 fingerprint */}
                  <div className="w-full mt-6 pt-4 border-t border-slate-800/80 text-left">
                    <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-1 font-mono">
                      SHA-256 Integrity Signature
                    </div>
                    <div className="font-mono text-[11px] text-slate-400 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800 break-all select-all">
                      {cert.sha256_signature}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  onClick={copyLink}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-sm font-medium transition"
                >
                  <Copy size={16} /> {copied ? "Copied Link!" : "Copy Verification Link"}
                </button>
                <button
                  onClick={shareOnX}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition shadow-lg shadow-blue-500/20"
                >
                  <Share2 size={16} /> Share on X / Twitter
                </button>
                <button
                  onClick={printCertificate}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-sm font-medium transition"
                >
                  <Printer size={16} /> Print / Save as PDF
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
