"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  fetchMyKYCStatus,
  fetchMyKYCDossier,
  submitKYCVerification,
  KYCSummaryData,
  KYCVerificationData,
  KYCSubmissionPayload,
} from "@/lib/api";

const COUNTRIES = [
  { code: "NG", name: "Nigeria" },
  { code: "US", name: "United States" },
  { code: "GB", name: "United Kingdom" },
  { code: "DE", name: "Germany" },
  { code: "FR", name: "France" },
  { code: "CA", name: "Canada" },
  { code: "AE", name: "United Arab Emirates" },
  { code: "ZA", name: "South Africa" },
  { code: "GH", name: "Ghana" },
  { code: "KE", name: "Kenya" },
  { code: "SG", name: "Singapore" },
  { code: "AU", name: "Australia" },
];

export default function KYCPage() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [summary, setSummary] = useState<KYCSummaryData | null>(null);
  const [dossier, setDossier] = useState<KYCVerificationData | null>(null);

  // Form State
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dob, setDob] = useState("");
  const [nationality, setNationality] = useState("NG");
  const [residenceCountry, setResidenceCountry] = useState("NG");
  const [addressLine, setAddressLine] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [isPep, setIsPep] = useState(false);

  // Document 1 (Primary ID)
  const [idType, setIdType] = useState("PASSPORT");
  const [idNumber, setIdNumber] = useState("");
  const [idFileName, setIdFileName] = useState("passport_scan.pdf");

  // Document 2 (Proof of Address)
  const [poaType, setPoaType] = useState("UTILITY_BILL");
  const [poaFileName, setPoaFileName] = useState("utility_statement.pdf");

  const [acceptedDeclarations, setAcceptedDeclarations] = useState(false);

  useEffect(() => {
    const t = localStorage.getItem("access_token");
    if (!t) {
      router.push("/login");
      return;
    }
    setToken(t);
    loadData(t);
  }, [router]);

  async function loadData(authToken: string) {
    setLoading(true);
    setError(null);
    try {
      const [sum, dos] = await Promise.all([
        fetchMyKYCStatus(authToken),
        fetchMyKYCDossier(authToken),
      ]);
      setSummary(sum);
      setDossier(dos);
      if (dos.first_name) setFirstName(dos.first_name);
      if (dos.last_name) setLastName(dos.last_name);
      if (dos.date_of_birth) setDob(dos.date_of_birth);
      if (dos.nationality) setNationality(dos.nationality);
      if (dos.residence_country) setResidenceCountry(dos.residence_country);
      if (dos.address_line) setAddressLine(dos.address_line);
      if (dos.city) setCity(dos.city);
      if (dos.postal_code) setPostalCode(dos.postal_code);
    } catch (err: any) {
      setError(err.message || "Failed to load verification status");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    if (!acceptedDeclarations) {
      setError("Please accept the compliance & truthfulness declarations.");
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccessMsg(null);

    const payload: KYCSubmissionPayload = {
      first_name: firstName,
      last_name: lastName,
      date_of_birth: dob,
      nationality: nationality.toUpperCase(),
      residence_country: residenceCountry.toUpperCase(),
      address_line: addressLine,
      city: city,
      postal_code: postalCode || undefined,
      is_politically_exposed: isPep,
      documents: [
        {
          document_type: idType,
          document_number: idNumber,
          issuing_country: nationality.toUpperCase(),
          file_name: idFileName,
          file_url: `/uploads/kyc/${idFileName}`,
          mime_type: "application/pdf",
          file_size_bytes: 1048576,
          is_front: true,
        },
        {
          document_type: poaType,
          document_number: "POA-" + Math.floor(100000 + Math.random() * 900000),
          issuing_country: residenceCountry.toUpperCase(),
          file_name: poaFileName,
          file_url: `/uploads/kyc/${poaFileName}`,
          mime_type: "application/pdf",
          file_size_bytes: 524288,
          is_front: true,
        },
      ],
    };

    try {
      const res = await submitKYCVerification(payload, token);
      setDossier(res);
      setSuccessMsg("Your identity documents were submitted successfully and are now under review.");
      await loadData(token);
    } catch (err: any) {
      setError(err.message || "Submission failed");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#08090b] flex items-center justify-center text-slate-400">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-[#ccff00] border-t-transparent rounded-full animate-spin" />
          <span>Loading identity compliance status…</span>
        </div>
      </div>
    );
  }

  const kycStatus = summary?.kyc_status || "NOT_SUBMITTED";

  return (
    <div className="min-h-screen bg-[#07080a] text-slate-100 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Ambient Glow */}
      <div className="glow-orb absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-b from-[#ccff00]/[0.05] to-transparent blur-3xl pointer-events-none -z-10 rounded-full" />

      <div className="max-w-4xl mx-auto space-y-8 relative z-10">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ccff00]/10 border border-[#ccff00]/25 text-xs text-[#ccff00] font-bold mb-2">
              Compliance &amp; Verification Shield
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight uppercase">Identity Verification (KYC / AML)</h1>
            <p className="text-sm text-neutral-400 mt-1">
              Required for funded trader contracts, MT5 account issuance, and instant profit disbursements.
            </p>
          </div>
          <Link
            href="/dashboard"
            className="self-start sm:self-auto px-5 py-2.5 text-xs font-bold bg-[#12141a] hover:bg-[#1a1e28] text-neutral-300 hover:text-white rounded-xl border border-white/[0.08] transition"
          >
            ← Return to Dashboard
          </Link>
        </div>

        {/* Status Callout Banner */}
        {kycStatus === "APPROVED" && (
          <div className="bento-card border border-[#ccff00]/40 bg-[#ccff00]/[0.05] p-6 flex items-start gap-4 shadow-[0_0_40px_rgba(204,255,0,0.1)]">
            <span className="text-3xl">✅</span>
            <div>
              <h3 className="font-black text-[#ccff00] text-lg">Identity Verified (Level 2 Certified)</h3>
              <p className="text-neutral-300 text-sm mt-1 leading-relaxed">
                Your dossier has been approved and passed full AML &amp; Sanctions screening.
                Your account is in full compliance for funded allocation and profit withdrawal requests.
              </p>
              {summary?.reviewed_at && (
                <p className="text-xs text-neutral-400 mt-2 font-mono">
                  Verified timestamp: {new Date(summary.reviewed_at).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
        )}

        {kycStatus === "PENDING_REVIEW" && (
          <div className="bento-card border border-sky-500/40 bg-sky-500/10 p-6 flex items-start gap-4">
            <span className="text-3xl">⏳</span>
            <div>
              <h3 className="font-black text-sky-400 text-lg">Verification Dossier Under Review</h3>
              <p className="text-sky-200/80 text-sm mt-1 leading-relaxed">
                Your submitted documents and AML screening are currently being reviewed by our Compliance &amp; Risk desk.
                Reviews are typically completed within 2 to 12 hours.
              </p>
              {summary?.submitted_at && (
                <p className="text-xs text-sky-400/80 mt-2 font-mono">
                  Submitted: {new Date(summary.submitted_at).toLocaleString()}
                </p>
              )}
            </div>
          </div>
        )}

        {kycStatus === "REQUIRES_RETRY" && (
          <div className="bento-card border border-amber-500/40 bg-amber-500/10 p-6 flex items-start gap-4">
            <span className="text-3xl">⚠️</span>
            <div>
              <h3 className="font-black text-amber-400 text-lg">Action Required: Document Resubmission</h3>
              <p className="text-amber-300/80 text-sm mt-1">
                Our compliance desk requested updated documents:
              </p>
              <div className="mt-3 p-3 bg-[#0d0f14] border border-amber-500/30 rounded-xl text-amber-200 text-sm font-medium">
                {summary?.rejection_reason || "Please provide clearer scans of your identification."}
              </div>
            </div>
          </div>
        )}

        {kycStatus === "REJECTED" && (
          <div className="bento-card border border-rose-500/40 bg-rose-500/10 p-6 flex items-start gap-4">
            <span className="text-3xl">🚫</span>
            <div>
              <h3 className="font-black text-rose-400 text-lg">Verification Rejected</h3>
              <p className="text-rose-300/80 text-sm mt-1">
                Your identity verification submission could not be approved due to compliance or sanctions policy:
              </p>
              <div className="mt-3 p-3 bg-[#0d0f14] border border-rose-500/30 rounded-xl text-rose-200 text-sm font-medium">
                {summary?.rejection_reason || "Verification requirements not met."}
              </div>
              <p className="text-xs text-neutral-400 mt-2">
                For appeals, please contact <a href="mailto:compliance@maxfunded.com" className="text-[#ccff00] underline">compliance@maxfunded.com</a>.
              </p>
            </div>
          </div>
        )}

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

        {/* Verification Form (only shown if not yet approved or if retry required) */}
        {kycStatus !== "APPROVED" && (
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Step 1: Personal Identity Details */}
            <div className="bento-card p-6 sm:p-8 space-y-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-xl bg-[#ccff00]/10 border border-[#ccff00]/30 text-[#ccff00] flex items-center justify-center text-xs font-black">1</span>
                Personal Information (Official Government Records)
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">First Name *</label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full bg-[#12141a] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#ccff00]/60 transition"
                    placeholder="e.g. Marcus"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">Last Name *</label>
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full bg-[#12141a] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#ccff00]/60 transition"
                    placeholder="e.g. Vance"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">Date of Birth *</label>
                  <input
                    type="date"
                    required
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="w-full bg-[#12141a] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#ccff00]/60 transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">Nationality *</label>
                  <select
                    value={nationality}
                    onChange={(e) => setNationality(e.target.value)}
                    className="w-full bg-[#12141a] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#ccff00]/60 transition"
                  >
                    {COUNTRIES.map((c) => (
                      <option key={c.code} value={c.code}>{c.name} ({c.code})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">Country of Residence *</label>
                  <select
                    value={residenceCountry}
                    onChange={(e) => setResidenceCountry(e.target.value)}
                    className="w-full bg-[#12141a] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#ccff00]/60 transition"
                  >
                    {COUNTRIES.map((c) => (
                      <option key={c.code} value={c.code}>{c.name} ({c.code})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">Residential Street Address *</label>
                  <input
                    type="text"
                    required
                    value={addressLine}
                    onChange={(e) => setAddressLine(e.target.value)}
                    className="w-full bg-[#12141a] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#ccff00]/60 transition"
                    placeholder="e.g. 100 Wall Street, Apt 4B"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">City *</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-[#12141a] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#ccff00]/60 transition"
                    placeholder="e.g. New York"
                  />
                </div>
              </div>
            </div>

            {/* Step 2: Identification Documents */}
            <div className="bento-card p-6 sm:p-8 space-y-5">
              <h2 className="text-lg font-bold text-white flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-xl bg-[#ccff00]/10 border border-[#ccff00]/30 text-[#ccff00] flex items-center justify-center text-xs font-black">2</span>
                Government Issued Photo ID &amp; Proof of Address
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">Primary ID Document Type *</label>
                  <select
                    value={idType}
                    onChange={(e) => setIdType(e.target.value)}
                    className="w-full bg-[#12141a] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#ccff00]/60 transition"
                  >
                    <option value="PASSPORT">International Passport</option>
                    <option value="NATIONAL_ID">National ID / Resident Card</option>
                    <option value="DRIVERS_LICENSE">Driver&apos;s License</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">Document Number *</label>
                  <input
                    type="text"
                    required
                    value={idNumber}
                    onChange={(e) => setIdNumber(e.target.value)}
                    className="w-full bg-[#12141a] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white font-mono focus:outline-none focus:border-[#ccff00]/60 transition"
                    placeholder="e.g. P12345678"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">ID Document Scan *</label>
                  <input
                    type="text"
                    required
                    value={idFileName}
                    onChange={(e) => setIdFileName(e.target.value)}
                    className="w-full bg-[#12141a] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white font-mono focus:outline-none focus:border-[#ccff00]/60 transition"
                  />
                  <span className="text-[10px] text-neutral-500 mt-1 block">PDF, JPG, or PNG (High Resolution, Max 15MB)</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-white/[0.06]">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">Proof of Address Type *</label>
                  <select
                    value={poaType}
                    onChange={(e) => setPoaType(e.target.value)}
                    className="w-full bg-[#12141a] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#ccff00]/60 transition"
                  >
                    <option value="UTILITY_BILL">Utility Bill (Electricity, Water, Gas)</option>
                    <option value="BANK_STATEMENT">Bank Account Statement</option>
                    <option value="PROOF_OF_ADDRESS">Government Tax Statement</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1.5">Proof of Address File *</label>
                  <input
                    type="text"
                    required
                    value={poaFileName}
                    onChange={(e) => setPoaFileName(e.target.value)}
                    className="w-full bg-[#12141a] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white font-mono focus:outline-none focus:border-[#ccff00]/60 transition"
                  />
                  <span className="text-[10px] text-neutral-500 mt-1 block">Must show full name &amp; address, dated within last 90 days</span>
                </div>
              </div>
            </div>

            {/* Step 3: AML, PEP & Sanctions Compliance Declaration */}
            <div className="bento-card p-6 sm:p-8 space-y-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-xl bg-[#ccff00]/10 border border-[#ccff00]/30 text-[#ccff00] flex items-center justify-center text-xs font-black">3</span>
                AML &amp; Politically Exposed Person (PEP) Declaration
              </h2>

              <div className="space-y-4 pt-1">
                <label className="flex items-start gap-3.5 cursor-pointer bg-white/[0.02] p-4 rounded-xl border border-white/[0.06] hover:border-white/[0.12] transition">
                  <input
                    type="checkbox"
                    checked={isPep}
                    onChange={(e) => setIsPep(e.target.checked)}
                    className="mt-1 rounded bg-[#12141a] border-white/20 text-[#ccff00] focus:ring-0 w-4 h-4"
                  />
                  <div className="text-xs text-neutral-300 leading-relaxed">
                    <span className="font-bold text-white block mb-0.5">Politically Exposed Person (PEP) Disclosure:</span>
                    Check this box only if you, or an immediate family member, hold or have held a prominent public function (e.g. Head of State, Minister, Senior Military Officer, Central Bank Executive).
                  </div>
                </label>

                <label className="flex items-start gap-3.5 cursor-pointer bg-white/[0.02] p-4 rounded-xl border border-white/[0.06] hover:border-[#ccff00]/30 transition">
                  <input
                    type="checkbox"
                    required
                    checked={acceptedDeclarations}
                    onChange={(e) => setAcceptedDeclarations(e.target.checked)}
                    className="mt-1 rounded bg-[#12141a] border-white/20 text-[#ccff00] focus:ring-0 w-4 h-4"
                  />
                  <div className="text-xs text-neutral-300 leading-relaxed">
                    <span className="font-bold text-white block mb-0.5">Compliance Attestation &amp; Integrity Declaration:</span>
                    I hereby certify that all documents submitted are genuine, unaltered, and belong directly to me. I acknowledge that MaxFunded processes verification in accordance with global Anti-Money Laundering (AML) standards.
                  </div>
                </label>
              </div>
            </div>

            {/* Submit Action */}
            <div className="flex items-center justify-end gap-4 pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="btn-neon px-8 py-4 bg-[#ccff00] hover:bg-[#b3e600] text-black font-black text-sm uppercase tracking-tight rounded-xl shadow-neon transition disabled:opacity-50 flex items-center gap-2"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    <span>Transmitting Dossier…</span>
                  </>
                ) : (
                  <span>Submit KYC Verification Dossier →</span>
                )}
              </button>
            </div>
          </form>
        )}

        {/* Existing Documents Dossier List */}
        {dossier && dossier.documents && dossier.documents.length > 0 && (
          <div className="bento-card p-6 sm:p-8 space-y-4">
            <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#ccff00]" />
              Cataloged Verification Documents ({dossier.documents.length})
            </h3>
            <div className="divide-y divide-white/[0.05] text-xs">
              {dossier.documents.map((doc, idx) => (
                <div key={idx} className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-[#ccff00] font-bold px-2 py-0.5 rounded bg-[#ccff00]/10 border border-[#ccff00]/20 text-[11px]">{doc.document_type}</span>
                    <span className="text-white font-medium">{doc.file_name}</span>
                    {doc.document_number && (
                      <span className="text-neutral-500 font-mono">#{doc.document_number}</span>
                    )}
                  </div>
                  <span className="text-neutral-400 font-mono">
                    {doc.created_at ? new Date(doc.created_at).toLocaleDateString() : "Cataloged"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
