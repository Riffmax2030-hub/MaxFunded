"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { fetchPaymentStatus, PaymentStatusResponse } from "@/lib/api";
import {
  CheckCircle2,
  Clock,
  LayoutDashboard,
  ShieldCheck,
  AlertCircle,
  Copy,
  Loader2,
  ExternalLink,
} from "lucide-react";

function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const paymentId = searchParams.get("payment_id");

  const [payment, setPayment] = useState<PaymentStatusResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    const session = getSession();
    if (!session) {
      router.push("/login");
      return;
    }

    if (!paymentId) {
      setLoading(false);
      return;
    }

    async function checkStatus() {
      try {
        const res = await fetchPaymentStatus(paymentId!, session!.token);
        setPayment(res);
      } catch (err: any) {
        setError(err.message || "Failed to load payment status");
      } finally {
        setLoading(false);
      }
    }

    checkStatus();

    // Poll every 4 seconds if pending or processing
    const interval = setInterval(async () => {
      if (payment?.status === "PENDING" || payment?.status === "PROCESSING") {
        try {
          const res = await fetchPaymentStatus(paymentId!, session!.token);
          setPayment(res);
        } catch (_) {}
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [paymentId, router, payment?.status]);

  const copyRef = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="text-center space-y-4 py-20">
        <Loader2 className="w-10 h-10 text-[#ccff00] animate-spin mx-auto" />
        <p className="text-neutral-400 text-sm">Verifying transaction confirmation with payment gateway...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center space-y-4 w-full shadow-2xl">
        <AlertCircle className="w-12 h-12 text-rose-400 mx-auto" />
        <h2 className="text-xl font-bold text-white">Transaction Status Inquiry</h2>
        <p className="text-neutral-400 text-sm">{error}</p>
        <Link
          href="/dashboard"
          className="inline-block px-5 py-2.5 bg-[#ccff00] hover:bg-[#b3e600] text-black rounded-xl text-sm font-bold transition shadow-lg shadow-[#ccff00]/10"
        >
          Go to Dashboard
        </Link>
      </div>
    );
  }

  if (payment?.status === "AWAITING_CONFIRMATION") {
    return (
      /* Bank Wire Pending Screen */
      <div className="bg-slate-900 border border-amber-500/30 rounded-2xl p-8 text-center space-y-6 w-full shadow-2xl">
        <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
          <Clock className="w-8 h-8" />
        </div>

        <div>
          <span className="text-[11px] font-bold uppercase tracking-widest text-amber-400 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20">
            Wire Transfer Initiated
          </span>
          <h1 className="text-2xl font-extrabold text-white mt-3">
            Awaiting Bank Confirmation
          </h1>
          <p className="text-neutral-400 text-sm mt-2 max-w-md mx-auto leading-relaxed">
            Thank you! We have recorded your wire transfer intent. Our finance department will verify receipt in our bank account and activate your evaluation.
          </p>
        </div>

        {payment.payment_reference_code && (
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex items-center justify-between text-left">
            <div>
              <div className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider">
                Your Transfer Reference Code
              </div>
              <div className="font-mono text-base font-extrabold text-[#ccff00] mt-0.5">
                {payment.payment_reference_code}
              </div>
            </div>
            <button
              onClick={() => copyRef(payment.payment_reference_code!)}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-neutral-300 text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{copied ? "Copied" : "Copy"}</span>
            </button>
          </div>
        )}

        <div className="pt-2 flex flex-col sm:flex-row gap-3">
          <Link
            href="/dashboard"
            className="flex-1 py-3.5 px-4 rounded-xl bg-[#ccff00] hover:bg-[#b3e600] font-black text-sm text-black flex items-center justify-center gap-2 transition shadow-lg shadow-[#ccff00]/10"
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Open Dashboard</span>
          </Link>
          <Link
            href="/contact"
            className="py-3.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 font-semibold text-sm text-neutral-300 transition"
          >
            Contact Support
          </Link>
        </div>
      </div>
    );
  }

  return (
    /* Payment Completed Screen */
    <div className="bento-card border border-[#ccff00]/40 p-8 sm:p-10 text-center space-y-6 w-full shadow-[0_0_60px_rgba(204,255,0,0.12)] relative overflow-hidden">
      {/* Top ambient glow */}
      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#ccff00] to-transparent" />

      <div className="w-16 h-16 rounded-2xl bg-[#ccff00]/10 border border-[#ccff00]/30 flex items-center justify-center mx-auto text-[#ccff00] shadow-[0_0_25px_rgba(204,255,0,0.25)]">
        <CheckCircle2 className="w-9 h-9" />
      </div>

      <div>
        <span className="text-[11px] font-black uppercase tracking-widest text-[#ccff00] px-3.5 py-1 rounded-full bg-[#ccff00]/10 border border-[#ccff00]/25">
          Payment Confirmed · Instant Provisioning
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-white mt-3 uppercase tracking-tight">
          Evaluation Activated!
        </h1>
        <p className="text-neutral-300 text-sm mt-2 max-w-md mx-auto leading-relaxed">
          Your payment of <strong className="text-[#ccff00] font-mono">${payment?.amount ? payment.amount.toFixed(2) : "0.00"} {payment?.currency || "USD"}</strong> has been cleared. Your institutional MetaTrader 5 account is ready for trading.
        </p>
      </div>

      <div className="bg-[#101217] border border-white/[0.08] rounded-2xl p-5 text-left space-y-3 font-mono text-xs">
        <div className="flex items-center justify-between border-b border-white/[0.05] pb-2.5">
          <span className="text-neutral-400 font-sans">Trading Platform</span>
          <span className="font-bold text-white">MetaTrader 5 (MT5 Bridge)</span>
        </div>
        <div className="flex items-center justify-between border-b border-white/[0.05] pb-2.5">
          <span className="text-neutral-400 font-sans">Disbursement Rail</span>
          <span className="font-bold text-white uppercase">{payment?.provider || "Instant Rails"}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-neutral-400 font-sans">Account Status</span>
          <span className="font-black text-[#ccff00] uppercase">ACTIVE &amp; READY</span>
        </div>
      </div>

      <div className="bg-[#ccff00]/[0.04] border border-[#ccff00]/20 rounded-2xl p-4 text-xs text-neutral-300 text-left flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-[#ccff00] shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <span className="font-bold text-white block mb-0.5">MT5 Credentials Dispatched:</span>
          Your server, login ID, and master trading password have been emailed to your registered email and are available live on your dashboard.
        </div>
      </div>

      <div className="pt-2 flex flex-col sm:flex-row gap-3">
        <Link
          href="/dashboard"
          className="btn-neon flex-1 py-4 px-6 rounded-xl bg-[#ccff00] hover:bg-[#b3e600] font-black text-sm uppercase tracking-tight text-black flex items-center justify-center gap-2 transition shadow-neon"
        >
          <LayoutDashboard className="w-4 h-4 stroke-[2.5]" />
          <span>Open Trader Dashboard →</span>
        </Link>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <div className="min-h-screen bg-[#08090b] text-white flex flex-col justify-between">
      <main className="max-w-2xl mx-auto px-4 py-16 flex-grow w-full flex items-center justify-center">
        <Suspense
          fallback={
            <div className="text-center space-y-4 py-20">
              <Loader2 className="w-10 h-10 text-[#ccff00] animate-spin mx-auto" />
              <p className="text-neutral-400 text-sm">Loading checkout status...</p>
            </div>
          }
        >
          <SuccessContent />
        </Suspense>
      </main>
    </div>
  );
}
