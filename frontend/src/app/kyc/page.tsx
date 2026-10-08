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
    <div className="min-h-screen bg-[#08090b] text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Identity Verification (KYC / AML)</h1>
            <p className="text-sm text-slate-400 mt-1">
              Global compliance requirements for evaluation certificates, funded allocations, and profit payouts.
            </p>
          </div>
          <Link
            href="/dashboard"
            className="self-start sm:self-auto px-4 py-2 text-sm bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition"
          >
            ← Return to Dashboard
          </Link>
        </div>

        {/* Status Callout Banner */}
        {kycStatus === "APPROVED" && (
          <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-5 flex items-start gap-4">
            <span className="text-2xl">✅</span>
            <div>
              <h3 className="font-bold text-emerald-400 text-base">Identity Verified (Level 2 Approved)</h3>
              <p className="text-emerald-300/80 text-sm mt-1">
                Your identity has been fully verified and passed AML / Sanctions screening.
                Your account is eligible for funded contracts and profit withdrawal processing.
              </p>
              {summary?.reviewed_at && (
                <p className="text-xs text-emerald-500/80 mt-2 font-mono">
                  Verified on: {new Date(summary.reviewed_at).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
        )}

        {kycStatus === "PENDING_REVIEW" && (
          <div className="rounded-xl border border-blue-500/40 bg-blue-500/10 p-5 flex items-start gap-4">
            <span className="text-2xl">⏳</span>
            <div>
              <h3 className="font-bold text-blue-400 text-base">Verification Dossier Under Review</h3>
              <p className="text-blue-300/80 text-sm mt-1">
                Your submitted documents and AML screening are currently being reviewed by our Compliance &amp; Risk team.
                Reviews are typically completed within 2 to 12 hours.
              </p>
              {summary?.submitted_at && (
                <p className="text-xs text-blue-400/80 mt-2 font-mono">
                  Submitted: {new Date(summary.submitted_at).toLocaleString()}
                </p>
              )}
            </div>
          </div>
        )}

        {kycStatus === "REQUIRES_RETRY" && (
          <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-5 flex items-start gap-4">
            <span className="text-2xl">⚠️</span>
            <div>
              <h3 className="font-bold text-amber-400 text-base">Action Required: Document Resubmission</h3>
              <p className="text-amber-300/80 text-sm mt-1">
                Our compliance reviewer requested updated documents:
              </p>
              <div className="mt-2 p-3 bg-slate-900/80 border border-amber-500/30 rounded text-amber-200 text-sm font-medium">
                {summary?.rejection_reason || "Please provide clearer scans of your identification."}
              </div>
            </div>
          </div>
        )}

        {kycStatus === "REJECTED" && (
          <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-5 flex items-start gap-4">
            <span className="text-2xl">🚫</span>
            <div>
              <h3 className="font-bold text-red-400 text-base">Verification Rejected</h3>
              <p className="text-red-300/80 text-sm mt-1">
                Your identity verification submission could not be approved due to compliance or sanctions policy:
              </p>
              <div className="mt-2 p-3 bg-slate-900/80 border border-red-500/30 rounded text-red-200 text-sm font-medium">
                {summary?.rejection_reason || "Verification requirements not met."}
              </div>
              <p className="text-xs text-slate-400 mt-2">
                For appeals, please contact <a href="mailto:compliance@maxfunded.com" className="text-[#ccff00] underline">compliance@maxfunded.com</a>.
              </p>
            </div>
          </div>
        )}

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

        {/* Verification Form (only shown if not yet approved or if retry required) */}
        {kycStatus !== "APPROVED" && (
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Step 1: Personal Identity Details */}
            <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 space-y-4">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#ccff00]/10 border border-[#ccff00]/30 text-[#ccff00] flex items-center justify-center text-xs font-bold">1</span>
                Personal Information (as shown on official government ID)
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">First Name *</label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#ccff00]"
                    placeholder="e.g. Adebayo"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Last Name *</label>
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#ccff00]"
                    placeholder="e.g. Adeleke"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Date of Birth *</label>
                  <input
                    type="date"
                    required
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#ccff00]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Nationality *</label>
                  <select
                    value={nationality}
                    onChange={(e) => setNationality(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#ccff00]"
                  >
                    {COUNTRIES.map((c) => (
                      <option key={c.code} value={c.code}>{c.name} ({c.code})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Country of Residence *</label>
                  <select
                    value={residenceCountry}
                    onChange={(e) => setResidenceCountry(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#ccff00]"
                  >
                    {COUNTRIES.map((c) => (
                      <option key={c.code} value={c.code}>{c.name} ({c.code})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-slate-400 mb-1">Residential Address *</label>
                  <input
                    type="text"
                    required
                    value={addressLine}
                    onChange={(e) => setAddressLine(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#ccff00]"
                    placeholder="e.g. 14 Victoria Island Way"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">City *</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#ccff00]"
                    placeholder="e.g. Lagos"
                  />
                </div>
              </div>
            </div>

            {/* Step 2: Identification Documents */}
            <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 space-y-4">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#ccff00]/10 border border-[#ccff00]/30 text-[#ccff00] flex items-center justify-center text-xs font-bold">2</span>
                Government Issued Photo ID &amp; Proof of Address
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">ID Document Type *</label>
                  <select
                    value={idType}
                    onChange={(e) => setIdType(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#ccff00]"
                  >
                    <option value="PASSPORT">International Passport</option>
                    <option value="NATIONAL_ID">National ID / NIN Slip</option>
                    <option value="DRIVERS_LICENSE">Driver&apos;s License</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Document Number *</label>
                  <input
                    type="text"
                    required
                    value={idNumber}
                    onChange={(e) => setIdNumber(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#ccff00]"
                    placeholder="e.g. A01234567"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Select ID Document File *</label>
                  <input
                    type="text"
                    required
                    value={idFileName}
                    onChange={(e) => setIdFileName(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono"
                  />
                  <span className="text-[10px] text-slate-500">PDF, JPG, or PNG (Max 15MB)</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-800">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Proof of Address Type *</label>
                  <select
                    value={poaType}
                    onChange={(e) => setPoaType(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#ccff00]"
                  >
                    <option value="UTILITY_BILL">Utility Bill (Electric, Water, Gas)</option>
                    <option value="BANK_STATEMENT">Bank Account Statement</option>
                    <option value="PROOF_OF_ADDRESS">Government Tax Document</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Select Proof of Address File *</label>
                  <input
                    type="text"
                    required
                    value={poaFileName}
                    onChange={(e) => setPoaFileName(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono"
                  />
                  <span className="text-[10px] text-slate-500">Must be dated within the last 90 days</span>
                </div>
              </div>
            </div>

            {/* Step 3: AML, PEP & Sanctions Compliance Declaration */}
            <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 space-y-4">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#ccff00]/10 border border-[#ccff00]/30 text-[#ccff00] flex items-center justify-center text-xs font-bold">3</span>
                AML &amp; Politically Exposed Person (PEP) Declaration
              </h2>

              <div className="space-y-3">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isPep}
                    onChange={(e) => setIsPep(e.target.checked)}
                    className="mt-1 rounded bg-slate-800 border-slate-700 text-[#ccff00] focus:ring-0"
                  />
                  <div className="text-xs text-slate-300">
                    <span className="font-semibold text-white">Politically Exposed Person (PEP) Disclosure:</span> Check this box if you, or an immediate family member, hold or have held a prominent public function (e.g. Head of State, Minister, Senior Military Officer, Central Bank Executive).
                  </div>
                </label>

                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    required
                    checked={acceptedDeclarations}
                    onChange={(e) => setAcceptedDeclarations(e.target.checked)}
                    className="mt-1 rounded bg-slate-800 border-slate-700 text-[#ccff00] focus:ring-0"
                  />
                  <div className="text-xs text-slate-300">
                    <span className="font-semibold text-white">Compliance Attestation:</span> I hereby certify that the information and documents provided are genuine, valid, and belong to me. I acknowledge that MaxFunded Global Ltd. Ltd verifies identities in accordance with global Anti-Money Laundering (AML) and Counter-Terrorist Financing (CTF) standards.
                  </div>
                </label>
              </div>
            </div>

            {/* Submit Action */}
            <div className="flex items-center justify-end gap-4">
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-3 bg-[#ccff00] hover:bg-[#b3e600] text-black font-black rounded-xl shadow-lg shadow-[#ccff00]/10 transition disabled:opacity-50 flex items-center gap-2"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    <span>Processing Submission…</span>
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
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 space-y-3">
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
              Cataloged Verification Documents ({dossier.documents.length})
            </h3>
            <div className="divide-y divide-slate-800 text-xs">
              {dossier.documents.map((doc, idx) => (
                <div key={idx} className="py-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-[#ccff00] font-bold">{doc.document_type}</span>
                    <span className="text-slate-300">{doc.file_name}</span>
                    {doc.document_number && (
                      <span className="text-slate-500">#{doc.document_number}</span>
                    )}
                  </div>
                  <span className="text-slate-500 font-mono">
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
