"use client";

import React, { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { PublicCertificateData } from "@/lib/api";

interface MaxFundedCertificateProps {
  cert: PublicCertificateData;
  /** If true, the component renders the certificate element only (no action buttons) */
  printMode?: boolean;
}

// ─── Certificate type config ──────────────────────────────────────────────────
function getCertConfig(type: string) {
  switch (type) {
    case "PHASE_1_PASSED":
      return {
        ribbon: "PHASE 1 EVALUATION",
        achievement: "Certificate of Completion",
        body: "has successfully completed and passed the Phase 1 Evaluation, demonstrating discipline, consistency, and adherence to all risk parameters.",
        accent: "#c9a227",
        accentLight: "#f0d070",
        badgeLabel: "PHASE I",
      };
    case "PHASE_2_PASSED":
      return {
        ribbon: "PHASE 2 VERIFICATION",
        achievement: "Certificate of Excellence",
        body: "has passed the Phase 2 Verification, confirming advanced trading proficiency and exceptional risk-adjusted performance across all evaluation criteria.",
        accent: "#1a9e6e",
        accentLight: "#34d399",
        badgeLabel: "PHASE II",
      };
    case "FUNDED_TRADER":
      return {
        ribbon: "CERTIFIED FUNDED TRADER",
        achievement: "Master Trader Charter",
        body: "has been officially inducted as a Certified Funded Trader by MaxFunded, granted a live capital allocation and full access to the MaxFunded proprietary trading infrastructure.",
        accent: "#c9a227",
        accentLight: "#f0d070",
        badgeLabel: "FUNDED",
      };
    case "PAYOUT_ACHIEVER":
      return {
        ribbon: "PERFORMANCE PAYOUT MERIT",
        achievement: "Certificate of Achievement",
        body: "has achieved a verified profit milestone and received an official performance-based payout, confirming sustained trading excellence on a live funded account.",
        accent: "#7c3aed",
        accentLight: "#a78bfa",
        badgeLabel: "PAYOUT",
      };
    default:
      return {
        ribbon: "MAXFUNDED RECOGNITION",
        achievement: "Certificate of Achievement",
        body: "has demonstrated exceptional trading discipline and met all requirements of the MaxFunded evaluation programme.",
        accent: "#c9a227",
        accentLight: "#f0d070",
        badgeLabel: "CERT",
      };
  }
}

// ─── SVG decorative border pattern ───────────────────────────────────────────
function OrnamentBorder({ color }: { color: string }) {
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="none"
    >
      {/* Outer rectangle */}
      <rect x="6" y="6" width="calc(100% - 12)" height="calc(100% - 12)"
        fill="none" stroke={color} strokeWidth="2.5" rx="2"
        style={{ width: "calc(100% - 12px)", height: "calc(100% - 12px)" }} />
      {/* Inner rectangle */}
      <rect x="14" y="14" width="calc(100% - 28)" height="calc(100% - 28)"
        fill="none" stroke={color} strokeWidth="0.75" rx="1" opacity="0.6"
        style={{ width: "calc(100% - 28px)", height: "calc(100% - 28px)" }} />

      {/* Corner ornament — top-left */}
      <g transform="translate(6,6)">
        <line x1="0" y1="0" x2="22" y2="0" stroke={color} strokeWidth="2.5" />
        <line x1="0" y1="0" x2="0" y2="22" stroke={color} strokeWidth="2.5" />
        <rect x="3" y="3" width="12" height="12" fill="none" stroke={color} strokeWidth="1" opacity="0.5" />
        <circle cx="9" cy="9" r="3" fill={color} opacity="0.4" />
      </g>
      {/* Corner ornament — top-right */}
      <g transform="translate(100%,6) scale(-1,1)" style={{ transformOrigin: "0 0" }}>
        <line x1="0" y1="0" x2="22" y2="0" stroke={color} strokeWidth="2.5" />
        <line x1="0" y1="0" x2="0" y2="22" stroke={color} strokeWidth="2.5" />
        <rect x="3" y="3" width="12" height="12" fill="none" stroke={color} strokeWidth="1" opacity="0.5" />
        <circle cx="9" cy="9" r="3" fill={color} opacity="0.4" />
      </g>
      {/* Corner ornament — bottom-left */}
      <g transform="translate(6,100%) scale(1,-1)" style={{ transformOrigin: "0 0" }}>
        <line x1="0" y1="0" x2="22" y2="0" stroke={color} strokeWidth="2.5" />
        <line x1="0" y1="0" x2="0" y2="22" stroke={color} strokeWidth="2.5" />
        <rect x="3" y="3" width="12" height="12" fill="none" stroke={color} strokeWidth="1" opacity="0.5" />
        <circle cx="9" cy="9" r="3" fill={color} opacity="0.4" />
      </g>
      {/* Corner ornament — bottom-right */}
      <g transform="translate(100%,100%) scale(-1,-1)" style={{ transformOrigin: "0 0" }}>
        <line x1="0" y1="0" x2="22" y2="0" stroke={color} strokeWidth="2.5" />
        <line x1="0" y1="0" x2="0" y2="22" stroke={color} strokeWidth="2.5" />
        <rect x="3" y="3" width="12" height="12" fill="none" stroke={color} strokeWidth="1" opacity="0.5" />
        <circle cx="9" cy="9" r="3" fill={color} opacity="0.4" />
      </g>
    </svg>
  );
}

// ─── Laurel wreath SVG ────────────────────────────────────────────────────────
function LaurelWreath({ color, size = 120 }: { color: string; size?: number }) {
  return (
    <svg width={size} height={size / 2.2} viewBox="0 0 200 90" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Left branch */}
      <path d="M60 45 Q50 35 40 28 Q48 30 55 38 Q45 25 35 20 Q44 24 52 34 Q42 18 30 15 Q40 21 48 33" stroke={color} strokeWidth="1.5" fill="none" opacity="0.9" />
      <path d="M60 45 Q52 55 42 60 Q49 54 56 44 Q48 62 36 65 Q44 57 53 43 Q44 65 30 70 Q40 60 50 42" stroke={color} strokeWidth="1.5" fill="none" opacity="0.9" />
      <ellipse cx="40" cy="28" rx="7" ry="4" transform="rotate(-30 40 28)" fill={color} opacity="0.6" />
      <ellipse cx="35" cy="20" rx="6" ry="3.5" transform="rotate(-40 35 20)" fill={color} opacity="0.5" />
      <ellipse cx="30" cy="15" rx="6" ry="3" transform="rotate(-50 30 15)" fill={color} opacity="0.45" />
      <ellipse cx="42" cy="60" rx="6" ry="3.5" transform="rotate(30 42 60)" fill={color} opacity="0.5" />
      <ellipse cx="36" cy="65" rx="6" ry="3" transform="rotate(40 36 65)" fill={color} opacity="0.45" />
      <ellipse cx="30" cy="70" rx="5.5" ry="3" transform="rotate(50 30 70)" fill={color} opacity="0.4" />

      {/* Right branch */}
      <path d="M140 45 Q150 35 160 28 Q152 30 145 38 Q155 25 165 20 Q156 24 148 34 Q158 18 170 15 Q160 21 152 33" stroke={color} strokeWidth="1.5" fill="none" opacity="0.9" />
      <path d="M140 45 Q148 55 158 60 Q151 54 144 44 Q152 62 164 65 Q156 57 147 43 Q156 65 170 70 Q160 60 150 42" stroke={color} strokeWidth="1.5" fill="none" opacity="0.9" />
      <ellipse cx="160" cy="28" rx="7" ry="4" transform="rotate(30 160 28)" fill={color} opacity="0.6" />
      <ellipse cx="165" cy="20" rx="6" ry="3.5" transform="rotate(40 165 20)" fill={color} opacity="0.5" />
      <ellipse cx="170" cy="15" rx="6" ry="3" transform="rotate(50 170 15)" fill={color} opacity="0.45" />
      <ellipse cx="158" cy="60" rx="6" ry="3.5" transform="rotate(-30 158 60)" fill={color} opacity="0.5" />
      <ellipse cx="164" cy="65" rx="6" ry="3" transform="rotate(-40 164 65)" fill={color} opacity="0.45" />
      <ellipse cx="170" cy="70" rx="5.5" ry="3" transform="rotate(-50 170 70)" fill={color} opacity="0.4" />

      {/* Center bow */}
      <path d="M90 78 Q100 72 110 78 Q105 85 100 84 Q95 85 90 78Z" fill={color} opacity="0.7" />
      <path d="M100 78 Q93 74 88 80" stroke={color} strokeWidth="1.2" fill="none" opacity="0.7" />
      <path d="M100 78 Q107 74 112 80" stroke={color} strokeWidth="1.2" fill="none" opacity="0.7" />
    </svg>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────
export default function MaxFundedCertificate({ cert, printMode = false }: MaxFundedCertificateProps) {
  const certRef = useRef<HTMLDivElement>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [downloading, setDownloading] = useState(false);

  const cfg = getCertConfig(cert.certificate_type);

  const verifyUrl =
    cert.verification_url ||
    (typeof window !== "undefined"
      ? `${window.location.origin}/verify/${cert.certificate_code}`
      : `https://maxfunded.com/verify/${cert.certificate_code}`);

  const issuedDate = new Date(cert.issued_at).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const accountSizeFormatted = `$${Number(cert.account_size).toLocaleString("en-US")}`;

  // Generate QR code
  useEffect(() => {
    QRCode.toDataURL(verifyUrl, {
      width: 140,
      margin: 1,
      color: { dark: "#0c1a2e", light: "#f7f3e8" },
    })
      .then(setQrDataUrl)
      .catch(console.error);
  }, [verifyUrl]);

  // ── PDF download ────────────────────────────────────────────────────────────
  const downloadPDF = async () => {
    if (!certRef.current) return;
    setDownloading(true);
    try {
      const html2canvas = (await import("html2canvas")).default;
      const jsPDF = (await import("jspdf")).default;

      const canvas = await html2canvas(certRef.current, {
        scale: 3,               // High-resolution (300 DPI equivalent)
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#0c1a2e",
        logging: false,
        windowWidth: 1200,
        windowHeight: 850,
      });

      const imgData = canvas.toDataURL("image/jpeg", 0.98);
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",            // A4 landscape = 297 × 210 mm
        compress: false,
      });

      // Set PDF metadata (Adobe standard)
      pdf.setProperties({
        title: `MaxFunded Certificate — ${cert.certificate_code}`,
        subject: cfg.achievement,
        author: "MaxFunded Proprietary Trading Firm",
        keywords: `MaxFunded, certificate, ${cert.certificate_type}, ${cert.trader_name}`,
        creator: "MaxFunded Platform v1.0",
      });

      const pdfW = pdf.internal.pageSize.getWidth();
      const pdfH = pdf.internal.pageSize.getHeight();

      pdf.addImage(imgData, "JPEG", 0, 0, pdfW, pdfH, "", "FAST");
      pdf.save(`MaxFunded-Certificate-${cert.certificate_code}.pdf`);
    } catch (err) {
      console.error("PDF generation failed:", err);
    } finally {
      setDownloading(false);
    }
  };

  // ── Certificate markup ──────────────────────────────────────────────────────
  const certificate = (
    <div
      ref={certRef}
      id="mxf-certificate"
      style={{
        width: "100%",
        maxWidth: "960px",
        aspectRatio: "1.414 / 1",       // A4 landscape ratio
        background: "linear-gradient(160deg, #0c1a2e 0%, #0f2342 50%, #0c1a2e 100%)",
        position: "relative",
        overflow: "hidden",
        fontFamily: "'Georgia', 'Times New Roman', serif",
        color: "#f7f3e8",
        boxSizing: "border-box",
        margin: "0 auto",
      }}
    >
      {/* ── Textured subtle grid overlay ── */}
      <div style={{
        position: "absolute", inset: 0, opacity: 0.04,
        backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 39px, #c9a227 39px, #c9a227 40px), repeating-linear-gradient(90deg, transparent, transparent 39px, #c9a227 39px, #c9a227 40px)",
      }} />

      {/* ── Radial glow behind seal ── */}
      <div style={{
        position: "absolute", top: "50%", left: "50%",
        transform: "translate(-50%, -50%)",
        width: "500px", height: "500px",
        background: `radial-gradient(circle, ${cfg.accent}18 0%, transparent 70%)`,
        pointerEvents: "none",
      }} />

      {/* ── Gold border layer ── */}
      <div style={{
        position: "absolute", inset: "10px",
        border: `2px solid ${cfg.accent}`,
        pointerEvents: "none",
        zIndex: 1,
      }} />
      <div style={{
        position: "absolute", inset: "16px",
        border: `0.5px solid ${cfg.accent}60`,
        pointerEvents: "none",
        zIndex: 1,
      }} />

      {/* ── Corner ornaments (SVG) ── */}
      {[
        { top: "10px", left: "10px", rotate: "0deg" },
        { top: "10px", right: "10px", rotate: "90deg" },
        { bottom: "10px", left: "10px", rotate: "270deg" },
        { bottom: "10px", right: "10px", rotate: "180deg" },
      ].map((pos, i) => (
        <svg key={i} width="38" height="38" viewBox="0 0 38 38"
          style={{ position: "absolute", ...pos, transform: `rotate(${pos.rotate})`, zIndex: 2 }}
        >
          <path d={`M2 2 L18 2 M2 2 L2 18`} stroke={cfg.accent} strokeWidth="2.5" fill="none" />
          <path d={`M6 6 L14 6 M6 6 L6 14`} stroke={cfg.accent} strokeWidth="1" fill="none" opacity="0.5" />
          <circle cx="6" cy="6" r="2" fill={cfg.accent} opacity="0.6" />
        </svg>
      ))}

      {/* ── Main content ── */}
      <div style={{
        position: "relative", zIndex: 3,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "36px 60px 28px",
        boxSizing: "border-box",
      }}>

        {/* ── Header: Brand + ribbon ── */}
        <div style={{ textAlign: "center", width: "100%" }}>
          {/* Brand wordmark */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", marginBottom: "8px",
          }}>
            {/* Hex logo mark */}
            <svg width="32" height="32" viewBox="0 0 32 32">
              <polygon points="16,2 30,9 30,23 16,30 2,23 2,9" fill="none" stroke={cfg.accent} strokeWidth="1.8" />
              <polygon points="16,7 26,12.5 26,23.5 16,29 6,23.5 6,12.5" fill={cfg.accent} opacity="0.15" />
              <text x="16" y="21" textAnchor="middle" fill={cfg.accent} fontSize="10" fontWeight="bold" fontFamily="Arial, sans-serif">MX</text>
            </svg>
            <span style={{
              fontSize: "22px", fontWeight: 900, letterSpacing: "6px", color: cfg.accent,
              fontFamily: "Georgia, serif", textTransform: "uppercase",
            }}>
              MAX<span style={{ color: "#f7f3e8" }}>FUNDED</span>
            </span>
            <svg width="32" height="32" viewBox="0 0 32 32">
              <polygon points="16,2 30,9 30,23 16,30 2,23 2,9" fill="none" stroke={cfg.accent} strokeWidth="1.8" />
              <polygon points="16,7 26,12.5 26,23.5 16,29 6,23.5 6,12.5" fill={cfg.accent} opacity="0.15" />
              <text x="16" y="21" textAnchor="middle" fill={cfg.accent} fontSize="10" fontWeight="bold" fontFamily="Arial, sans-serif">MX</text>
            </svg>
          </div>
          <div style={{
            fontSize: "9px", letterSpacing: "5px", color: `${cfg.accent}cc`,
            textTransform: "uppercase", fontFamily: "Arial, sans-serif", marginBottom: "12px",
          }}>
            Proprietary Trading Firm · Est. 2024
          </div>

          {/* Divider with stars */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", marginBottom: "10px" }}>
            <div style={{ height: "1px", flex: 1, background: `linear-gradient(to right, transparent, ${cfg.accent}80)` }} />
            <span style={{ color: cfg.accent, fontSize: "12px" }}>✦</span>
            <div style={{ height: "1px", flex: 1, background: `linear-gradient(to left, transparent, ${cfg.accent}80)` }} />
          </div>

          {/* Achievement ribbon */}
          <div style={{
            display: "inline-block",
            background: `${cfg.accent}22`,
            border: `1px solid ${cfg.accent}60`,
            borderRadius: "2px",
            padding: "4px 20px",
            fontSize: "9px",
            letterSpacing: "4px",
            color: cfg.accentLight,
            textTransform: "uppercase",
            fontFamily: "Arial, sans-serif",
            fontWeight: 700,
            marginBottom: "8px",
          }}>
            {cfg.ribbon}
          </div>

          {/* Certificate title */}
          <div style={{
            fontSize: "26px",
            fontWeight: 700,
            color: "#f7f3e8",
            letterSpacing: "2px",
            fontFamily: "Georgia, 'Times New Roman', serif",
            lineHeight: 1.2,
          }}>
            {cfg.achievement}
          </div>
        </div>

        {/* ── Middle: Recipient section ── */}
        <div style={{ textAlign: "center", width: "100%", flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "8px" }}>
          <p style={{ fontSize: "11px", letterSpacing: "3px", color: `${cfg.accent}cc`, textTransform: "uppercase", fontFamily: "Arial, sans-serif", margin: 0 }}>
            This is to certify that
          </p>

          {/* Trader name */}
          <div style={{
            fontSize: "38px",
            fontWeight: 700,
            color: cfg.accentLight,
            fontFamily: "Georgia, 'Times New Roman', serif",
            letterSpacing: "1px",
            lineHeight: 1.1,
            padding: "2px 0 6px",
            borderBottom: `1px solid ${cfg.accent}60`,
          }}>
            {cert.trader_name}
          </div>

          {/* Laurel */}
          <LaurelWreath color={cfg.accent} size={140} />

          {/* Body text */}
          <p style={{
            fontSize: "12px",
            color: "#c8d4e8",
            maxWidth: "560px",
            lineHeight: 1.8,
            fontFamily: "Georgia, serif",
            margin: 0,
            textAlign: "center",
          }}>
            {cfg.body}
          </p>

          {/* Challenge + Account size chips */}
          <div style={{ display: "flex", gap: "16px", alignItems: "center", marginTop: "6px" }}>
            <div style={{
              background: "#0c2044", border: `1px solid ${cfg.accent}50`,
              borderRadius: "4px", padding: "6px 16px", textAlign: "center",
            }}>
              <div style={{ fontSize: "8px", color: `${cfg.accent}99`, letterSpacing: "2px", textTransform: "uppercase", fontFamily: "Arial, sans-serif" }}>Challenge</div>
              <div style={{ fontSize: "12px", color: "#f7f3e8", fontWeight: 600, fontFamily: "Arial, sans-serif" }}>{cert.challenge_name}</div>
            </div>
            <div style={{
              background: "#0c2044", border: `1px solid ${cfg.accent}50`,
              borderRadius: "4px", padding: "6px 16px", textAlign: "center",
            }}>
              <div style={{ fontSize: "8px", color: `${cfg.accent}99`, letterSpacing: "2px", textTransform: "uppercase", fontFamily: "Arial, sans-serif" }}>Account Size</div>
              <div style={{ fontSize: "16px", color: cfg.accentLight, fontWeight: 700, fontFamily: "Arial, sans-serif" }}>{accountSizeFormatted} USD</div>
            </div>
            {cert.payout_amount && (
              <div style={{
                background: "#0c2044", border: `1px solid ${cfg.accent}50`,
                borderRadius: "4px", padding: "6px 16px", textAlign: "center",
              }}>
                <div style={{ fontSize: "8px", color: `${cfg.accent}99`, letterSpacing: "2px", textTransform: "uppercase", fontFamily: "Arial, sans-serif" }}>Payout</div>
                <div style={{ fontSize: "16px", color: cfg.accentLight, fontWeight: 700, fontFamily: "Arial, sans-serif" }}>${Number(cert.payout_amount).toLocaleString()} USD</div>
              </div>
            )}
          </div>
        </div>

        {/* ── Footer: Signatures + Seal + QR ── */}
        <div style={{
          width: "100%",
          display: "grid",
          gridTemplateColumns: "1fr auto 1fr",
          alignItems: "flex-end",
          gap: "20px",
          borderTop: `1px solid ${cfg.accent}40`,
          paddingTop: "16px",
        }}>
          {/* Left signature */}
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <svg width="130" height="40" viewBox="0 0 130 40">
              <path d="M10 28 C 25 10 40 35 60 18 C 75 5 90 30 120 15"
                fill="none" stroke={cfg.accentLight} strokeWidth="1.8" strokeLinecap="round" />
              <line x1="8" y1="34" x2="122" y2="34" stroke={`${cfg.accent}60`} strokeWidth="0.8" />
            </svg>
            <div style={{ fontSize: "10px", fontWeight: 700, color: "#f7f3e8", fontFamily: "Arial, sans-serif" }}>Julian Vance, CMT</div>
            <div style={{ fontSize: "8px", color: cfg.accentLight, letterSpacing: "1px", textTransform: "uppercase", fontFamily: "Arial, sans-serif" }}>Chief Trading Officer</div>
            <div style={{ fontSize: "7px", color: "#6b8aab", fontFamily: "Arial, sans-serif" }}>MaxFunded Allocation Committee</div>
          </div>

          {/* Center seal */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
            {/* Official seal circle */}
            <div style={{ position: "relative", width: "90px", height: "90px" }}>
              {/* Outer ring */}
              <svg width="90" height="90" viewBox="0 0 90 90" style={{ position: "absolute", inset: 0 }}>
                <circle cx="45" cy="45" r="42" fill="none" stroke={cfg.accent} strokeWidth="2" />
                <circle cx="45" cy="45" r="36" fill="none" stroke={cfg.accent} strokeWidth="0.8" opacity="0.5" />
                {/* Dots around */}
                {Array.from({ length: 24 }).map((_, i) => {
                  const angle = (i * 360) / 24;
                  const rad = (angle * Math.PI) / 180;
                  const r = 40;
                  const x = 45 + r * Math.cos(rad);
                  const y = 45 + r * Math.sin(rad);
                  return <circle key={i} cx={x} cy={y} r="1" fill={cfg.accent} opacity="0.6" />;
                })}
                {/* Inner fill */}
                <circle cx="45" cy="45" r="33" fill={`${cfg.accent}20`} />
                {/* Star */}
                <polygon
                  points="45,18 48.5,35 65,35 52,44.5 57,62 45,52 33,62 38,44.5 25,35 41.5,35"
                  fill={cfg.accent}
                  opacity="0.7"
                />
                {/* Text around circle */}
                <path id="circleText" d="M45,45 m-34,0 a34,34 0 1,1 68,0 a34,34 0 1,1 -68,0" fill="none" />
                <text fontSize="6" fill={`${cfg.accent}cc`} fontFamily="Arial, sans-serif" letterSpacing="2">
                  <textPath href="#circleText" startOffset="5%">OFFICIAL · MAXFUNDED · VERIFIED CREDENTIAL ·</textPath>
                </text>
              </svg>
              {/* Center text */}
              <div style={{
                position: "absolute", inset: 0,
                display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center",
                paddingTop: "8px",
              }}>
                <div style={{ fontSize: "7px", fontWeight: 900, color: cfg.accent, letterSpacing: "1px", fontFamily: "Arial, sans-serif", textTransform: "uppercase" }}>SEAL</div>
              </div>
            </div>
            <div style={{ fontSize: "7px", color: `${cfg.accent}99`, letterSpacing: "2px", textTransform: "uppercase", fontFamily: "Arial, sans-serif" }}>
              ISSUED: {issuedDate}
            </div>
          </div>

          {/* Right: QR + code */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "4px" }}>
            <svg width="130" height="40" viewBox="0 0 130 40">
              <path d="M10 15 C 40 30 55 5 80 22 C 95 30 110 10 120 28"
                fill="none" stroke={cfg.accentLight} strokeWidth="1.8" strokeLinecap="round" />
              <line x1="8" y1="34" x2="122" y2="34" stroke={`${cfg.accent}60`} strokeWidth="0.8" />
            </svg>
            <div style={{ fontSize: "10px", fontWeight: 700, color: "#f7f3e8", fontFamily: "Arial, sans-serif", textAlign: "right" }}>Sarah Sterling, FRM</div>
            <div style={{ fontSize: "8px", color: cfg.accentLight, letterSpacing: "1px", textTransform: "uppercase", fontFamily: "Arial, sans-serif", textAlign: "right" }}>Head of Risk Management</div>
            <div style={{ fontSize: "7px", color: "#6b8aab", fontFamily: "Arial, sans-serif", textAlign: "right" }}>Capital Protection Group</div>
          </div>
        </div>

        {/* ── Registry bar ── */}
        <div style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "12px",
          borderTop: `1px solid ${cfg.accent}25`,
          paddingTop: "10px",
          marginTop: "6px",
        }}>
          {/* QR code */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            {qrDataUrl && (
              <div style={{
                padding: "4px",
                background: "#f7f3e8",
                borderRadius: "4px",
                border: `1px solid ${cfg.accent}60`,
              }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={qrDataUrl} alt="Verify" width="52" height="52" style={{ display: "block" }} />
              </div>
            )}
            <div>
              <div style={{ fontSize: "7px", color: `${cfg.accent}99`, letterSpacing: "2px", textTransform: "uppercase", fontFamily: "Arial, sans-serif" }}>Verify at</div>
              <div style={{ fontSize: "8px", color: "#c8d4e8", fontFamily: "Arial, sans-serif" }}>maxfunded.com/verify</div>
            </div>
          </div>

          {/* Center: cert code + status */}
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "7px", color: `${cfg.accent}80`, letterSpacing: "3px", textTransform: "uppercase", fontFamily: "Arial, sans-serif" }}>Certificate Registry ID</div>
            <div style={{ fontSize: "11px", color: cfg.accentLight, fontWeight: 700, fontFamily: "'Courier New', monospace", letterSpacing: "2px" }}>{cert.certificate_code}</div>
            {cert.is_revoked ? (
              <div style={{ fontSize: "7px", color: "#ef4444", letterSpacing: "2px", textTransform: "uppercase", fontFamily: "Arial, sans-serif", marginTop: "2px" }}>⚠ REVOKED</div>
            ) : (
              <div style={{ fontSize: "7px", color: "#34d399", letterSpacing: "2px", textTransform: "uppercase", fontFamily: "Arial, sans-serif", marginTop: "2px" }}>✓ AUTHENTIC &amp; VALID</div>
            )}
          </div>

          {/* SHA signature */}
          <div style={{ textAlign: "right", maxWidth: "260px" }}>
            <div style={{ fontSize: "7px", color: `${cfg.accent}80`, letterSpacing: "2px", textTransform: "uppercase", fontFamily: "Arial, sans-serif", marginBottom: "3px" }}>SHA-256 Integrity Hash</div>
            <div style={{ fontSize: "6.5px", color: "#6b8aab", fontFamily: "'Courier New', monospace", wordBreak: "break-all", lineHeight: 1.5 }}>
              {cert.sha256_signature}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (printMode) return certificate;

  return (
    <div className="flex flex-col gap-4">
      {certificate}

      {/* Action bar */}
      <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
        {/* PDF Download */}
        <button
          onClick={downloadPDF}
          disabled={downloading}
          className="inline-flex items-center gap-2.5 px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-lg"
          style={{ background: downloading ? "#334155" : "#c9a227", color: downloading ? "#94a3b8" : "#0c1a2e" }}
        >
          {downloading ? (
            <>
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Generating PDF…
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 16v-8m0 8l-3-3m3 3l3-3M5 20h14a2 2 0 002-2V8l-6-6H5a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              Download PDF Certificate
            </>
          )}
        </button>

        {/* Copy link */}
        <button
          onClick={() => {
            if (typeof window !== "undefined") navigator.clipboard.writeText(verifyUrl);
          }}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-sm font-medium transition"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-4 4h6a2 2 0 012 2v6a2 2 0 01-2 2h-6a2 2 0 01-2-2v-6a2 2 0 012-2z" />
          </svg>
          Copy Verify Link
        </button>

        {/* Share on X */}
        <button
          onClick={() => {
            const text = `I just earned my ${cfg.achievement} from @MaxFunded on my ${accountSizeFormatted} account! 🚀`;
            window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(verifyUrl)}`, "_blank");
          }}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-sm font-medium transition shadow-lg shadow-sky-500/20"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.4 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.259 5.63 5.905-5.63zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
          Share on X
        </button>
      </div>

      {/* Verification note */}
      <p className="text-center text-xs text-slate-500">
        Cryptographically signed with HMAC-SHA256 · Verify anytime at{" "}
        <a href={verifyUrl} target="_blank" rel="noopener noreferrer" className="text-amber-400 hover:underline">
          {verifyUrl}
        </a>
      </p>
    </div>
  );
}
