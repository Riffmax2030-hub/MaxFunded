"use client";

import React, { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { Award, ShieldCheck, CheckCircle2, AlertTriangle, Hash, Calendar } from "lucide-react";
import { PublicCertificateData } from "@/lib/api";

interface StandardCertificateProps {
  cert: PublicCertificateData;
  showActions?: boolean;
}

export default function StandardCertificate({ cert }: StandardCertificateProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>("");

  useEffect(() => {
    const verifyUrl = cert.verification_url || (typeof window !== "undefined" ? `${window.location.origin}/verify/${cert.certificate_code}` : "");
    if (verifyUrl) {
      QRCode.toDataURL(verifyUrl, {
        width: 180,
        margin: 1,
        color: {
          dark: "#0b0f19",
          light: "#f59e0b", // Gold tone QR pattern on dark
        },
      })
        .then((url) => setQrDataUrl(url))
        .catch((err) => console.error("QR Code generation error:", err));
    }
  }, [cert]);

  const getTitleDetails = (type: string) => {
    switch (type) {
      case "PHASE_1_PASSED":
        return {
          superTitle: "EVALUATION PHASE 1",
          mainTitle: "Certificate of Achievement",
          badge: "Phase 1 Evaluation Passed",
          accentColor: "from-amber-300 via-amber-400 to-amber-200",
          ribbonColor: "border-amber-400/40 bg-amber-400/10 text-amber-300",
        };
      case "PHASE_2_PASSED":
        return {
          superTitle: "VERIFICATION PHASE 2",
          mainTitle: "Certificate of Excellence",
          badge: "Phase 2 Verification Passed",
          accentColor: "from-sky-300 via-emerald-400 to-sky-200",
          ribbonColor: "border-sky-400/40 bg-sky-400/10 text-sky-300",
        };
      case "FUNDED_TRADER":
        return {
          superTitle: "PROPRIETARY ALLOCATION",
          mainTitle: "Master Trader Charter",
          badge: "Certified Funded Trader",
          accentColor: "from-amber-200 via-yellow-400 to-amber-300",
          ribbonColor: "border-yellow-400/40 bg-yellow-400/10 text-yellow-300",
        };
      case "PAYOUT_ACHIEVER":
        return {
          superTitle: "CAPITAL DISTRIBUTION",
          mainTitle: "Profit Payout Merit",
          badge: "Performance Payout Achiever",
          accentColor: "from-emerald-300 via-teal-300 to-emerald-200",
          ribbonColor: "border-emerald-400/40 bg-emerald-400/10 text-emerald-300",
        };
      default:
        return {
          superTitle: "MAXFUNDED RECOGNITION",
          mainTitle: "Certificate of Achievement",
          badge: "Certified Prop Trader",
          accentColor: "from-amber-300 via-amber-400 to-amber-200",
          ribbonColor: "border-amber-400/40 bg-amber-400/10 text-amber-300",
        };
    }
  };

  const info = getTitleDetails(cert.certificate_type);

  return (
    <div
      id="maxfunded-standard-certificate"
      className="relative w-full max-w-[960px] mx-auto bg-[#07090e] text-slate-100 rounded-3xl p-4 sm:p-8 shadow-2xl border border-amber-500/30 overflow-hidden select-none print:m-0 print:p-6 print:border-none print:rounded-none print:shadow-none print:w-full print:max-w-none"
      style={{
        boxShadow: "0 0 60px rgba(245, 158, 11, 0.08), inset 0 0 40px rgba(0, 0, 0, 0.8)",
      }}
    >
      {/* Guilloche & Geometry background accents */}
      <div className="absolute inset-0 pointer-events-none opacity-25">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="guilloche-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path
                d="M 40 0 L 0 40 M 0 0 L 40 40"
                fill="none"
                stroke="rgba(245, 158, 11, 0.12)"
                strokeWidth="0.75"
              />
              <circle cx="20" cy="20" r="14" fill="none" stroke="rgba(245, 158, 11, 0.07)" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#guilloche-grid)" />
        </svg>
      </div>

      {/* Ambient Radial Highlights */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Outer Ornate Border */}
      <div className="relative border-2 border-amber-500/60 rounded-2xl p-4 sm:p-6 bg-[#0a0d14]/90 backdrop-blur-sm">
        {/* Inner Guilloche Border */}
        <div className="relative border border-amber-500/30 rounded-xl p-6 sm:p-10 flex flex-col items-center text-center">

          {/* Corner Flourishes */}
          <div className="absolute top-2 left-2 w-6 h-6 border-t-2 border-l-2 border-amber-400" />
          <div className="absolute top-2 right-2 w-6 h-6 border-t-2 border-r-2 border-amber-400" />
          <div className="absolute bottom-2 left-2 w-6 h-6 border-b-2 border-l-2 border-amber-400" />
          <div className="absolute bottom-2 right-2 w-6 h-6 border-b-2 border-r-2 border-amber-400" />

          {/* Certificate Header / Brand Emblem */}
          <div className="flex flex-col items-center mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/25 border border-amber-300">
                <Award className="text-slate-950" size={28} />
              </div>
              <div className="text-left">
                <div className="text-2xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-100 uppercase">
                  MAX<span className="text-white">FUNDED</span>
                </div>
                <div className="text-[10px] tracking-[0.25em] text-amber-400/80 uppercase font-semibold">
                  Proprietary Trading Firm
                </div>
              </div>
            </div>

            {/* Authenticity Badge */}
            <div className="mt-4 flex items-center gap-2">
              {cert.is_revoked ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/40 text-red-300 text-xs font-semibold">
                  <AlertTriangle size={14} className="text-red-400" /> REVOKED: {cert.revocation_reason || "Non-compliant"}
                </span>
              ) : (
                <span className={`inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full border text-xs font-semibold tracking-wider uppercase ${info.ribbonColor}`}>
                  <CheckCircle2 size={13} /> {info.badge}
                </span>
              )}
            </div>
          </div>

          {/* Super Title */}
          <p className="text-[11px] font-bold uppercase tracking-[0.35em] text-amber-400/90 mb-1">
            {info.superTitle}
          </p>

          {/* Main Title */}
          <h1
            className={`text-3xl sm:text-4xl lg:text-5xl font-extrabold uppercase tracking-tight text-transparent bg-clip-text bg-gradient-to-r ${info.accentColor} mb-6`}
            style={{ fontFamily: "'Cinzel', serif, Georgia, 'Times New Roman'" }}
          >
            {info.mainTitle}
          </h1>

          <p className="text-xs uppercase tracking-[0.25em] text-slate-400 font-medium mb-2">
            This certifies that the proprietary trading milestone has been awarded to
          </p>

          {/* Trader Name */}
          <div className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight mb-4 px-4 py-1.5 border-b-2 border-amber-400/40">
            {cert.trader_name}
          </div>

          {/* Description Body */}
          <p className="max-w-2xl text-slate-300 text-sm sm:text-base leading-relaxed mb-6">
            for successfully fulfilling all risk criteria, target proficiencies, and maximum drawdown limitations in the{" "}
            <span className="text-amber-300 font-bold">{cert.challenge_name}</span> with a simulated capital allocation of{" "}
            <span className="text-emerald-400 font-extrabold">${Number(cert.account_size).toLocaleString()} USD</span>.
          </p>

          {/* Payout Callout (If Applicable) */}
          {cert.payout_amount && (
            <div className="mb-6 px-6 py-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-3">
              <span className="text-xs uppercase tracking-wider text-amber-300 font-bold">
                Performance Profit Payout Disbursed:
              </span>
              <span className="text-xl sm:text-2xl font-black text-amber-400">
                ${Number(cert.payout_amount).toLocaleString("en-US", { minimumFractionDigits: 2 })} USD
              </span>
            </div>
          )}

          {/* Bottom Section: Dual Signatures + Medallion Seal + QR Verification */}
          <div className="w-full pt-8 mt-2 border-t border-amber-500/20 grid grid-cols-1 sm:grid-cols-4 gap-6 items-end">

            {/* Signature 1: Chief Trading Officer */}
            <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
              <div className="h-12 flex items-center justify-center sm:justify-start">
                {/* Stylized Executive Script SVG */}
                <svg className="w-36 h-10 text-amber-300" viewBox="0 0 160 40" fill="none" stroke="currentColor">
                  <path
                    d="M10 25 C 25 10, 35 35, 50 15 C 65 -5, 75 35, 95 20 C 110 8, 125 30, 150 15"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                  />
                  <path d="M40 28 L140 26" strokeWidth="1" strokeDasharray="3 3" />
                </svg>
              </div>
              <div className="w-full border-t border-slate-700 pt-1.5">
                <div className="text-xs font-bold text-slate-200">Julian Vance, CMT</div>
                <div className="text-[10px] text-amber-400/90 uppercase tracking-wider">Chief Trading Officer</div>
                <div className="text-[9px] text-slate-500">MaxFunded Allocation Committee</div>
              </div>
            </div>

            {/* Official Medallion Gold Seal */}
            <div className="flex flex-col items-center justify-center">
              <div className="relative w-24 h-24 rounded-full bg-gradient-to-tr from-amber-600 via-amber-400 to-yellow-300 p-1 shadow-xl shadow-amber-500/20 flex items-center justify-center">
                {/* Inner Ring */}
                <div className="w-full h-full rounded-full border-2 border-dashed border-slate-950 flex flex-col items-center justify-center bg-gradient-to-b from-amber-400 to-amber-600 text-slate-950 text-center px-1">
                  <Award size={20} className="mb-0.5" />
                  <div className="text-[8px] font-black uppercase tracking-tighter leading-none">
                    OFFICIAL
                  </div>
                  <div className="text-[9px] font-black uppercase tracking-wider leading-none mt-0.5">
                    SEAL
                  </div>
                  <div className="text-[7px] font-bold uppercase tracking-tighter opacity-80 mt-0.5">
                    MAXFUNDED
                  </div>
                </div>
              </div>
              <div className="text-[9px] uppercase tracking-widest text-amber-400/80 mt-2 font-semibold">
                Verified Charter
              </div>
            </div>

            {/* Signature 2: Head of Risk Management */}
            <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
              <div className="h-12 flex items-center justify-center sm:justify-start">
                {/* Stylized Executive Script SVG */}
                <svg className="w-36 h-10 text-amber-300" viewBox="0 0 160 40" fill="none" stroke="currentColor">
                  <path
                    d="M15 18 C 30 28, 45 5, 60 25 C 75 40, 85 10, 110 22 C 125 30, 135 12, 148 20"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                  />
                  <path d="M25 30 L135 27" strokeWidth="1" strokeDasharray="3 3" />
                </svg>
              </div>
              <div className="w-full border-t border-slate-700 pt-1.5">
                <div className="text-xs font-bold text-slate-200">Sarah Sterling, FRM</div>
                <div className="text-[10px] text-amber-400/90 uppercase tracking-wider">Head of Risk Management</div>
                <div className="text-[9px] text-slate-500">Capital Protection Group</div>
              </div>
            </div>

            {/* QR Code and Verification Seal */}
            <div className="flex flex-col items-center justify-center">
              {qrDataUrl ? (
                <div className="p-1 bg-[#0b0f19] border border-amber-500/40 rounded-xl shadow-lg">
                  <img
                    src={qrDataUrl}
                    alt={`QR Code verification for ${cert.certificate_code}`}
                    className="w-20 h-20 rounded-lg object-contain"
                  />
                </div>
              ) : (
                <div className="w-20 h-20 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-center text-[10px] text-slate-500">
                  QR Code
                </div>
              )}
              <div className="text-[9px] font-mono text-amber-300/80 mt-1 uppercase tracking-tight">
                Scan to Verify
              </div>
            </div>

          </div>

          {/* Certificate Ledger Audit Footer */}
          <div className="w-full mt-6 pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-[10px] text-slate-400 gap-3 font-mono">
            <div className="flex items-center gap-1.5">
              <Hash size={12} className="text-amber-400" />
              <span>REGISTRY ID:</span>
              <span className="text-slate-200 font-bold">{cert.certificate_code}</span>
            </div>

            <div className="flex items-center gap-1.5">
              <Calendar size={12} className="text-amber-400" />
              <span>ISSUED:</span>
              <span className="text-slate-200 font-bold">
                {new Date(cert.issued_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <ShieldCheck size={12} className="text-emerald-400" />
              <span>ISSUER:</span>
              <span className="text-emerald-400 font-bold">{cert.issuer}</span>
            </div>
          </div>

          {/* Cryptographic SHA-256 Signature */}
          <div className="w-full mt-3 pt-2 text-[9px] font-mono text-slate-500 text-center truncate">
            SHA-256 HMAC: <span className="text-slate-400 select-all">{cert.sha256_signature}</span>
          </div>

        </div>
      </div>
    </div>
  );
}
