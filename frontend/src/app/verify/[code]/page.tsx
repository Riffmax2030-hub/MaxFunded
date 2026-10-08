"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { verifyCertificatePublic, PublicCertificateData } from "@/lib/api";
import { ShieldCheck, AlertTriangle, Loader2 } from "lucide-react";
import MaxFundedCertificate from "@/components/MaxFundedCertificate";

export default function CertificateVerificationPage() {
  const params = useParams();
  const code = (params?.code as string) || "";

  const [cert, setCert] = useState<PublicCertificateData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!code) return;
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await verifyCertificatePublic(code);
        setCert(data);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Certificate not found or invalid");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [code]);

  return (
    <main className="min-h-screen bg-[#08090b] text-white pt-24 pb-20 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Page header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-4">
            <ShieldCheck size={13} /> Public Verifiable Credential Ledger
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-2">
            Certificate Verification Portal
          </h1>
          <p className="text-slate-400 text-sm max-w-lg mx-auto">
            Every MaxFunded certificate is cryptographically signed and permanently registered.
            This record cannot be forged or altered.
          </p>
        </div>

        {/* States */}
        {loading ? (
          <div className="flex flex-col items-center justify-center p-20 bg-slate-900/60 border border-slate-800 rounded-2xl">
            <Loader2 className="animate-spin text-amber-400 mb-4" size={44} />
            <p className="text-slate-400 text-sm">Querying cryptographic registry for <span className="font-mono text-amber-400">{code}</span>…</p>
          </div>
        ) : error || !cert ? (
          <div className="p-10 bg-slate-900 border border-red-500/30 rounded-2xl text-center">
            <AlertTriangle className="text-red-400 mx-auto mb-4" size={48} />
            <h2 className="text-xl font-bold text-white mb-2">Certificate Not Found</h2>
            <p className="text-slate-400 text-sm max-w-md mx-auto mb-6">
              The identifier{" "}
              <code className="text-red-400 bg-red-950/40 px-2 py-0.5 rounded font-mono">{code}</code>{" "}
              could not be validated. It may have been mistyped, revoked, or never issued.
            </p>
            <Link
              href="/challenges"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-sm transition"
            >
              Start a Challenge →
            </Link>
          </div>
        ) : (
          <MaxFundedCertificate cert={cert} />
        )}
      </div>
    </main>
  );
}
