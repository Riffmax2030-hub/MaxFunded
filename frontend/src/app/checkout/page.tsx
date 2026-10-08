"use client";

import React, { useEffect, useState, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import {
  fetchChallengeById,
  fetchPaymentMethods,
  initiatePayment,
  fetchPaymentStatus,
  Challenge,
  PaymentMethodItem,
  PaymentInitiateResponse,
} from "@/lib/api";
import {
  ShieldCheck,
  CreditCard,
  Bitcoin,
  Building2,
  Loader2,
  CheckCircle,
  Copy,
  AlertTriangle,
  ArrowLeft,
  ChevronRight,
  HelpCircle,
  Sparkles,
  Tag,
  Lock,
  Info,
} from "lucide-react";
import {
  VisaLogo,
  MastercardLogo,
  WalmartLogo,
  DiscoverLogo,
  PaypalLogo,
  BitcoinLogo,
  EthereumLogo,
  TetherLogo,
  BankWireLogo,
} from "@/components/PaymentLogos";

// ─── Rule Explanations & Tooltips ───────────────────────────────────────────
const RULE_DEFINITIONS: Record<string, { title: string; desc: string }> = {
  min_days: {
    title: "Minimum Trading Days: 0 Days",
    desc: "No minimum trading days required. If you hit your 8% profit target on day one while complying with daily loss rules, you pass immediately.",
  },
  profit_target: {
    title: "Profit Target: Phase 1 (8%) / Phase 2 (5%)",
    desc: "Achieve an 8% gain in Phase 1 and 5% in Phase 2. Once reached, your account qualifies for your official funded live credentials.",
  },
  daily_loss: {
    title: "Max Daily Loss: 5% Static",
    desc: "Calculated based on your balance at the start of the trading day (00:00 UTC). If daily equity or balance falls by 5%, the account breaches.",
  },
  max_drawdown: {
    title: "Max Overall Drawdown: 10% Static",
    desc: "Fixed at 10% from your starting balance. There are NO trailing drawdown traps or high-water marks — your maximum loss threshold never trails up.",
  },
  profit_split: {
    title: "Profit Split: 80% to 90%",
    desc: "You keep 80% of all profits from day one. Scale to 90% as you hit your first milestone. Payouts are paid on-demand directly via Crypto or Wire.",
  },
  refundable_fee: {
    title: "100% Refundable Evaluation Fee",
    desc: "Your entire evaluation challenge fee is refunded back to you 100% alongside your very first eligible profit split payment.",
  },
};

// ─── Copy Button ─────────────────────────────────────────────────────────────
function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <button
      onClick={copy}
      type="button"
      className="ml-2 p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-neutral-300 transition shrink-0"
      title="Copy to clipboard"
    >
      {copied ? <CheckCircle className="w-3.5 h-3.5 text-[#ccff00]" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  );
}

// ─── Crypto Payment Display ──────────────────────────────────────────────────
function CryptoInstructions({
  payment,
  onCheckStatus,
  checking,
}: {
  payment: PaymentInitiateResponse;
  onCheckStatus: () => void;
  checking: boolean;
}) {
  return (
    <div className="bg-[#0e1117] border border-[#ccff00]/40 rounded-3xl p-6 sm:p-7 space-y-5 shadow-2xl">
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
          {payment.crypto_currency?.toUpperCase().includes("BTC") ? (
            <BitcoinLogo className="w-7 h-7" />
          ) : payment.crypto_currency?.toUpperCase().includes("ETH") ? (
            <EthereumLogo className="w-7 h-7" />
          ) : (
            <TetherLogo className="w-7 h-7" />
          )}
        </div>
        <div>
          <h3 className="font-extrabold text-white text-lg">Send Crypto Payment</h3>
          <p className="text-neutral-400 text-xs sm:text-sm">Send the exact amount below to receive automated activation</p>
        </div>
      </div>

      {payment.crypto_address && (
        <div className="bg-[#07080a] border border-white/10 rounded-2xl p-4">
          <p className="text-[11px] text-neutral-400 font-mono uppercase tracking-wider mb-2">Deposit Address</p>
          <div className="flex items-center justify-between gap-2">
            <p className="font-mono text-xs sm:text-sm text-white break-all">{payment.crypto_address}</p>
            <CopyBtn text={payment.crypto_address} />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {payment.crypto_amount && (
          <div className="bg-[#07080a] border border-white/10 rounded-2xl p-4">
            <p className="text-[11px] text-neutral-400 font-mono uppercase tracking-wider mb-1">Amount to Send</p>
            <div className="flex items-center justify-between">
              <p className="text-xl font-black text-[#ccff00] font-mono">
                {payment.crypto_amount} {payment.crypto_currency}
              </p>
              <CopyBtn text={String(payment.crypto_amount)} />
            </div>
          </div>
        )}

        <div className="bg-[#07080a] border border-white/10 rounded-2xl p-4 flex flex-col justify-center">
          <p className="text-[11px] text-neutral-400 font-mono uppercase tracking-wider mb-1">Blockchain Confirmation</p>
          <button
            onClick={onCheckStatus}
            disabled={checking}
            className="w-full mt-1 py-2 px-3 bg-[#ccff00] hover:bg-[#b3e600] text-black font-extrabold text-xs uppercase rounded-xl transition flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            {checking ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5" />}
            <span>Check Confirmation</span>
          </button>
        </div>
      </div>

      <div className="p-3 bg-amber-950/30 border border-amber-800/40 rounded-xl text-xs text-amber-200/90 leading-relaxed">
        ⚠️ Send only {payment.crypto_currency || "USDT"} to this address. MT5 credentials are automatically dispatched to your email upon on-chain verification.
      </div>
    </div>
  );
}

// ─── Bank Transfer Display ───────────────────────────────────────────────────
function BankTransferInstructions({ payment }: { payment: PaymentInitiateResponse }) {
  const b = payment.bank_details;
  if (!b) return null;

  return (
    <div className="bg-[#0e1117] border border-white/15 rounded-3xl p-6 sm:p-7 space-y-5 shadow-2xl">
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
          <BankWireLogo className="w-7 h-7" />
        </div>
        <div>
          <h3 className="font-extrabold text-white text-lg">Bank Wire Transfer</h3>
          <p className="text-neutral-400 text-xs sm:text-sm">Transfer using the details below. Include the required memo reference.</p>
        </div>
      </div>

      {payment.payment_reference_code && (
        <div className="bg-[#ccff00]/10 border border-[#ccff00]/30 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-black uppercase tracking-widest text-[#ccff00]">Required Wire Memo / Reference</div>
            <div className="font-mono text-xl font-black text-white mt-0.5">{payment.payment_reference_code}</div>
          </div>
          <CopyBtn text={payment.payment_reference_code} />
        </div>
      )}

      <div className="bg-[#07080a] border border-white/10 rounded-2xl divide-y divide-white/5 text-xs">
        {[
          { label: "Beneficiary Name", value: b.account_name },
          { label: "Bank Name", value: b.bank_name },
          { label: "Account Number / IBAN", value: b.account_number },
          { label: "SWIFT / BIC", value: b.swift_bic },
          { label: "Currency", value: b.currency },
          { label: "Amount Due", value: `$${b.amount_expected.toFixed(2)} USD` },
        ].map(({ label, value }) => (
          <div key={label} className="p-3.5 flex items-center justify-between">
            <span className="text-neutral-400">{label}</span>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-white font-mono">{value}</span>
              <CopyBtn text={value} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Payment Confirmed State ────────────────────────────────────────────────
function PaymentConfirmed() {
  return (
    <div className="text-center py-16 space-y-6 max-w-lg mx-auto">
      <div className="w-20 h-20 rounded-full bg-[#ccff00]/15 border-2 border-[#ccff00]/50 flex items-center justify-center mx-auto shadow-neon">
        <CheckCircle className="w-10 h-10 text-[#ccff00]" />
      </div>
      <div>
        <h2 className="text-3xl font-black uppercase tracking-tight text-white mb-2">Order Confirmed!</h2>
        <p className="text-neutral-400 text-sm leading-relaxed">
          Your challenge has been created. Your MetaTrader 5 login credentials and account instructions have been dispatched to your email address.
        </p>
      </div>
      <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
        <Link
          href="/dashboard"
          className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-[#ccff00] hover:bg-[#b3e600] text-black rounded-xl font-black text-sm uppercase tracking-tight shadow-neon transition"
        >
          <ShieldCheck className="w-4 h-4" /> Go to Dashboard
        </Link>
      </div>
    </div>
  );
}

// ─── Main Checkout Inner ────────────────────────────────────────────────────
function CheckoutInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const challengeId = searchParams.get("challenge") ?? "";

  const [token, setToken] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string>("");
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [methods, setMethods] = useState<PaymentMethodItem[]>([]);
  
  // Selected pathway: 'card' (unified Visa/Mastercard/Discover/Amex), 'paypal', 'crypto', 'bank_transfer'
  const [selectedPathway, setSelectedPathway] = useState<"card" | "paypal" | "crypto" | "bank_transfer">("card");
  
  // Coupon state: auto-applied MAX45 for new users
  const [couponCode, setCouponCode] = useState<string>("MAX45");
  const [couponApplied, setCouponApplied] = useState<boolean>(true);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [isExistingUserWithOrders, setIsExistingUserWithOrders] = useState<boolean>(false);

  // Active definition modal/tooltip
  const [activeRuleDef, setActiveRuleDef] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [initiating, setInitiating] = useState(false);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [payment, setPayment] = useState<PaymentInitiateResponse | null>(null);
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);

  // ── Auth & Data Loading ──────────────────────────────────────────────────
  useEffect(() => {
    const session = getSession();
    if (!session) {
      router.push(`/login?next=/checkout?challenge=${challengeId}`);
      return;
    }
    setToken(session.token);
    setUserEmail(session.email || "");

    // Check if user already has prior challenges to protect the new-user coupon
    try {
      const priorPurchases = localStorage.getItem(`has_purchased_${session.email}`);
      if (priorPurchases === "true") {
        setIsExistingUserWithOrders(true);
        setCouponApplied(false);
      }
    } catch {
      // ignore
    }
  }, [router, challengeId]);

  const loadData = useCallback(async () => {
    if (!token || !challengeId) return;
    setLoading(true);
    setError(null);
    try {
      const [ch, mths] = await Promise.all([
        fetchChallengeById(challengeId),
        fetchPaymentMethods(token),
      ]);
      setChallenge(ch);
      setMethods(mths.filter((m) => m.is_active));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load checkout details");
    } finally {
      setLoading(false);
    }
  }, [token, challengeId]);

  useEffect(() => {
    if (token) loadData();
  }, [token, loadData]);

  // Check if redirected back after payment
  useEffect(() => {
    const paid = searchParams.get("paid");
    if (paid === "true") setPaymentConfirmed(true);
  }, [searchParams]);

  // ── Price Calculation with 45% Discount ──────────────────────────────────
  const basePrice = challenge ? Number(challenge.price) : 0;
  // If base price is already on sale, normal fee is standard full price
  const fullOriginalPrice = challenge ? Math.round(basePrice / 0.55) : 0;
  const discountRate = couponApplied ? 0.45 : 0;
  const discountSavings = couponApplied ? Math.round(fullOriginalPrice * 0.45) : 0;
  const finalPrice = couponApplied ? (fullOriginalPrice - discountSavings) : basePrice;

  // ── Handle Coupon Application ───────────────────────────────────────────
  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (isExistingUserWithOrders) {
      setCouponError("Coupon only valid on first evaluation.");
      return;
    }
    if (couponCode.trim().toUpperCase() === "MAX45") {
      setCouponApplied(true);
      setCouponError(null);
    } else {
      setCouponApplied(false);
      setCouponError("Invalid coupon code.");
    }
  };

  // ── Payment Initiation ──────────────────────────────────────────────────
  const handlePay = async () => {
    if (!token || !challenge) return;
    setInitiating(true);
    setError(null);

    // Map high-level pathway to provider id
    let targetProvider = "stripe";
    if (selectedPathway === "paypal") targetProvider = "paypal";
    else if (selectedPathway === "crypto") targetProvider = "nowpayments";
    else if (selectedPathway === "bank_transfer") targetProvider = "bank_transfer";
    else targetProvider = "stripe";

    try {
      const result = await initiatePayment(
        {
          challenge_id: challenge.id,
          provider: targetProvider,
          currency: "USD",
          success_url: `${window.location.origin}/checkout?challenge=${challengeId}&paid=true`,
          cancel_url: `${window.location.origin}/checkout?challenge=${challengeId}`,
        },
        token
      );
      setPayment(result);

      // Track purchase locally to enforce single-use coupon
      try {
        if (userEmail) localStorage.setItem(`has_purchased_${userEmail}`, "true");
      } catch {}

      // If gateway redirects (Stripe / PayPal)
      if (result.redirect_url) {
        window.location.href = result.redirect_url;
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Payment initiation failed");
    } finally {
      setInitiating(false);
    }
  };

  // ── Check Payment Status ────────────────────────────────────────────────
  const handleCheckStatus = useCallback(async () => {
    if (!token || !payment) return;
    setChecking(true);
    try {
      const status = await fetchPaymentStatus(payment.payment_id, token);
      if (status.status === "COMPLETED" || status.status === "CONFIRMED") {
        setPaymentConfirmed(true);
      } else {
        setError(`Payment status: ${status.status}. Waiting for confirmation.`);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Status check failed");
    } finally {
      setChecking(false);
    }
  }, [token, payment]);

  if (!challengeId) {
    return (
      <div className="text-center py-24">
        <p className="text-neutral-400 mb-4">No challenge selected.</p>
        <Link href="/challenges" className="px-6 py-3 rounded-full bg-[#ccff00] text-black font-bold text-sm">
          Browse Challenges
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* ── Top Breadcrumb / Title ──────────────────────────────────────── */}
      <div className="flex items-center gap-4">
        <Link href="/challenges" className="p-2.5 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 text-neutral-300 hover:text-white transition">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ccff00]/10 border border-[#ccff00]/30 text-[#ccff00] text-xs font-mono font-bold uppercase tracking-wider mb-1">
            <Lock size={11} /> 256-Bit SSL Encrypted Checkout
          </div>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white">
            Complete Your Purchase
          </h1>
        </div>
      </div>

      {/* ── Confirmed View ──────────────────────────────────────────────── */}
      {paymentConfirmed && <PaymentConfirmed />}

      {/* ── Loading View ────────────────────────────────────────────────── */}
      {!paymentConfirmed && loading && (
        <div className="flex flex-col items-center gap-4 py-24">
          <Loader2 className="w-10 h-10 animate-spin text-[#ccff00]" />
          <p className="text-neutral-400 font-medium text-sm">Loading secure checkout...</p>
        </div>
      )}

      {/* ── Error Banner ────────────────────────────────────────────────── */}
      {error && (
        <div className="bg-red-950/40 border border-red-500/40 rounded-2xl p-4 text-red-300 text-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-red-400 hover:text-white font-bold px-2 py-1">
            ✕
          </button>
        </div>
      )}

      {/* ── Main Checkout Grid ──────────────────────────────────────────── */}
      {!paymentConfirmed && !loading && challenge && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* ── Left Column: Payment Pathways (7 cols) ────────────────────── */}
          <div className="lg:col-span-7 space-y-6">

            {/* Instruction Panels for Crypto / Bank Wire */}
            {payment && payment.crypto_address && !payment.redirect_url && (
              <CryptoInstructions payment={payment} onCheckStatus={handleCheckStatus} checking={checking} />
            )}

            {payment && payment.bank_details && !payment.redirect_url && (
              <BankTransferInstructions payment={payment} />
            )}

            {/* Pathway Selector */}
            {!payment && (
              <div className="bg-[#0e1117] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-5 shadow-2xl">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <h2 className="text-lg font-black uppercase tracking-tight text-white flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-[#ccff00]" />
                    Select Payment Method
                  </h2>
                  <span className="text-xs text-neutral-400 font-mono">1-Step Checkout</span>
                </div>

                <div className="space-y-3">
                  
                  {/* PATHWAY 1: Unified Credit / Debit Card (Visa, Mastercard, Discover, Amex) */}
                  <button
                    type="button"
                    onClick={() => setSelectedPathway("card")}
                    className={`w-full p-5 rounded-2xl border text-left transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                      selectedPathway === "card"
                        ? "bg-[#141822] border-[#ccff00] shadow-[0_0_25px_rgba(204,255,0,0.1)]"
                        : "bg-[#0a0c10] border-white/10 hover:border-white/20"
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center gap-2.5">
                        <span className="font-extrabold text-base text-white">Credit / Debit Card</span>
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-[#ccff00]/15 text-[#ccff00] border border-[#ccff00]/30">
                          Instant Activation
                        </span>
                      </div>
                      <p className="text-xs text-neutral-400">One secure card pathway for global debit &amp; credit cards.</p>
                      
                      {/* Unified Card Logos: Visa, Mastercard, Walmart, Discover only */}
                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        <div className="bg-white/10 border border-white/15 px-2.5 py-1 rounded-md flex items-center justify-center">
                          <VisaLogo className="h-3.5 w-auto" />
                        </div>
                        <div className="bg-white/10 border border-white/15 px-2.5 py-1 rounded-md flex items-center justify-center">
                          <MastercardLogo className="h-3.5 w-auto" />
                        </div>
                        <div className="bg-white/10 border border-white/15 px-2.5 py-1 rounded-md flex items-center justify-center">
                          <WalmartLogo className="h-3.5 w-auto" />
                        </div>
                        <div className="bg-white/10 border border-white/15 px-2.5 py-1 rounded-md flex items-center justify-center">
                          <DiscoverLogo className="h-3.5 w-auto" />
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        selectedPathway === "card" ? "border-[#ccff00] bg-[#ccff00]" : "border-neutral-600"
                      }`}>
                        {selectedPathway === "card" && <div className="w-2 h-2 rounded-full bg-black" />}
                      </div>
                    </div>
                  </button>

                  {/* PATHWAY 2: PayPal */}
                  <button
                    type="button"
                    onClick={() => setSelectedPathway("paypal")}
                    className={`w-full p-5 rounded-2xl border text-left transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                      selectedPathway === "paypal"
                        ? "bg-[#141822] border-[#ccff00] shadow-[0_0_25px_rgba(204,255,0,0.1)]"
                        : "bg-[#0a0c10] border-white/10 hover:border-white/20"
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center gap-2.5">
                        <span className="font-extrabold text-base text-white">PayPal</span>
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-sky-500/15 text-sky-400 border border-sky-500/30">
                          Buyer Protection
                        </span>
                      </div>
                      <p className="text-xs text-neutral-400">Checkout with your PayPal balance or linked bank account.</p>
                      <div className="pt-1">
                        <div className="bg-white/10 border border-white/15 px-3 py-1 rounded-md inline-flex items-center">
                          <PaypalLogo className="h-4 w-auto" />
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        selectedPathway === "paypal" ? "border-[#ccff00] bg-[#ccff00]" : "border-neutral-600"
                      }`}>
                        {selectedPathway === "paypal" && <div className="w-2 h-2 rounded-full bg-black" />}
                      </div>
                    </div>
                  </button>

                  {/* PATHWAY 3: Crypto (BTC, ETH, USDT) with Authentic Logos */}
                  <button
                    type="button"
                    onClick={() => setSelectedPathway("crypto")}
                    className={`w-full p-5 rounded-2xl border text-left transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                      selectedPathway === "crypto"
                        ? "bg-[#141822] border-[#ccff00] shadow-[0_0_25px_rgba(204,255,0,0.1)]"
                        : "bg-[#0a0c10] border-white/10 hover:border-white/20"
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center gap-2.5">
                        <span className="font-extrabold text-base text-white">Cryptocurrency</span>
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                          Zero Fees
                        </span>
                      </div>
                      <p className="text-xs text-neutral-400">Automated blockchain deposit via Bitcoin, Ethereum, or Tether USDT.</p>
                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        <div className="bg-white/10 border border-white/15 px-2.5 py-1 rounded-md flex items-center gap-1.5">
                          <BitcoinLogo className="h-4 w-4" />
                          <span className="text-xs font-bold text-white font-mono">BTC</span>
                        </div>
                        <div className="bg-white/10 border border-white/15 px-2.5 py-1 rounded-md flex items-center gap-1.5">
                          <EthereumLogo className="h-4 w-4" />
                          <span className="text-xs font-bold text-white font-mono">ETH</span>
                        </div>
                        <div className="bg-white/10 border border-white/15 px-2.5 py-1 rounded-md flex items-center gap-1.5">
                          <TetherLogo className="h-4 w-4" />
                          <span className="text-xs font-bold text-white font-mono">USDT</span>
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        selectedPathway === "crypto" ? "border-[#ccff00] bg-[#ccff00]" : "border-neutral-600"
                      }`}>
                        {selectedPathway === "crypto" && <div className="w-2 h-2 rounded-full bg-black" />}
                      </div>
                    </div>
                  </button>

                  {/* PATHWAY 4: Bank Transfer / Wire with Institutional Logo */}
                  <button
                    type="button"
                    onClick={() => setSelectedPathway("bank_transfer")}
                    className={`w-full p-5 rounded-2xl border text-left transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                      selectedPathway === "bank_transfer"
                        ? "bg-[#141822] border-[#ccff00] shadow-[0_0_25px_rgba(204,255,0,0.1)]"
                        : "bg-[#0a0c10] border-white/10 hover:border-white/20"
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center gap-2.5">
                        <span className="font-extrabold text-base text-white">Bank Transfer / Wire</span>
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-white/10 text-neutral-300 border border-white/15">
                          SEPA &amp; SWIFT
                        </span>
                      </div>
                      <p className="text-xs text-neutral-400">Direct wire transfer to institutional custodian accounts.</p>
                      <div className="pt-1">
                        <div className="bg-white/10 border border-white/15 px-2.5 py-1 rounded-md inline-flex items-center gap-2">
                          <BankWireLogo className="h-4 w-4" />
                          <span className="text-xs font-bold text-neutral-200 font-mono">SWIFT / SEPA / ACH</span>
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        selectedPathway === "bank_transfer" ? "border-[#ccff00] bg-[#ccff00]" : "border-neutral-600"
                      }`}>
                        {selectedPathway === "bank_transfer" && <div className="w-2 h-2 rounded-full bg-black" />}
                      </div>
                    </div>
                  </button>


                </div>

                {/* Pay Button */}
                <div className="pt-4">
                  <button
                    onClick={handlePay}
                    disabled={initiating}
                    className="w-full py-4 bg-[#ccff00] hover:bg-[#b3e600] disabled:opacity-50 text-black font-black text-sm uppercase tracking-tight rounded-2xl transition-all shadow-neon flex items-center justify-center gap-2"
                  >
                    {initiating ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Connecting to Gateway...</span>
                      </>
                    ) : (
                      <>
                        <span>Pay ${finalPrice.toFixed(2)} &amp; Activate MT5</span>
                        <ChevronRight className="w-4 h-4 stroke-[3]" />
                      </>
                    )}
                  </button>

                  <p className="text-center text-[11px] text-neutral-500 mt-3">
                    By confirming your order, you agree to MaxFunded Terms of Service and 100% Refundable Fee Policy.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* ── Right Column: Order Summary & Interactive Rules (5 cols) ── */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-[#0e1117] border border-white/10 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5 sticky top-24">
              
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <h2 className="text-base font-black uppercase tracking-tight text-white">Order Summary</h2>
                <span className="text-xs font-mono font-bold text-[#ccff00]">MetaTrader 5</span>
              </div>

              {/* Challenge Tier Card */}
              <div className="bg-[#131722] border border-[#ccff00]/25 rounded-2xl p-4.5 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-extrabold text-white">{challenge.name}</span>
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-[#ccff00]/15 text-[#ccff00] border border-[#ccff00]/30">
                    2-Phase Standard
                  </span>
                </div>
                <div className="text-3xl font-black text-white font-mono">
                  ${Number(challenge.starting_balance).toLocaleString()}
                </div>
                <p className="text-xs text-neutral-400">{challenge.description}</p>
              </div>

              {/* Interactive Challenge Rules with (?) Tooltips */}
              <div className="space-y-1 pt-1">
                <div className="flex items-center justify-between text-xs font-bold text-neutral-400 pb-2">
                  <span>Trading Rules &amp; Conditions</span>
                  <span className="text-[10px] text-neutral-500 font-normal">Click (?) for definitions</span>
                </div>

                <div className="divide-y divide-white/5 text-xs">
                  
                  {/* Min Days */}
                  <div className="py-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-neutral-300">
                      <span>Minimum Trading Days</span>
                      <button
                        type="button"
                        onClick={() => setActiveRuleDef(activeRuleDef === "min_days" ? null : "min_days")}
                        className="text-neutral-500 hover:text-[#ccff00] transition"
                        title="View definition"
                      >
                        <HelpCircle className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <span className="font-bold text-white font-mono">0 Days (No Min)</span>
                  </div>
                  {activeRuleDef === "min_days" && (
                    <div className="p-3 bg-black/60 rounded-xl text-neutral-300 text-[11px] leading-relaxed border border-[#ccff00]/20 my-1 animate-in fade-in">
                      <strong className="text-[#ccff00] block mb-0.5">{RULE_DEFINITIONS.min_days.title}</strong>
                      {RULE_DEFINITIONS.min_days.desc}
                    </div>
                  )}

                  {/* Profit Target */}
                  <div className="py-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-neutral-300">
                      <span>Profit Target</span>
                      <button
                        type="button"
                        onClick={() => setActiveRuleDef(activeRuleDef === "profit_target" ? null : "profit_target")}
                        className="text-neutral-500 hover:text-[#ccff00] transition"
                        title="View definition"
                      >
                        <HelpCircle className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <span className="font-bold text-white font-mono">8% / 5%</span>
                  </div>
                  {activeRuleDef === "profit_target" && (
                    <div className="p-3 bg-black/60 rounded-xl text-neutral-300 text-[11px] leading-relaxed border border-[#ccff00]/20 my-1 animate-in fade-in">
                      <strong className="text-[#ccff00] block mb-0.5">{RULE_DEFINITIONS.profit_target.title}</strong>
                      {RULE_DEFINITIONS.profit_target.desc}
                    </div>
                  )}

                  {/* Max Daily Loss */}
                  <div className="py-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-neutral-300">
                      <span>Max Daily Loss</span>
                      <button
                        type="button"
                        onClick={() => setActiveRuleDef(activeRuleDef === "daily_loss" ? null : "daily_loss")}
                        className="text-neutral-500 hover:text-[#ccff00] transition"
                        title="View definition"
                      >
                        <HelpCircle className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <span className="font-bold text-white font-mono">5% Static</span>
                  </div>
                  {activeRuleDef === "daily_loss" && (
                    <div className="p-3 bg-black/60 rounded-xl text-neutral-300 text-[11px] leading-relaxed border border-[#ccff00]/20 my-1 animate-in fade-in">
                      <strong className="text-[#ccff00] block mb-0.5">{RULE_DEFINITIONS.daily_loss.title}</strong>
                      {RULE_DEFINITIONS.daily_loss.desc}
                    </div>
                  )}

                  {/* Max Drawdown */}
                  <div className="py-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-neutral-300">
                      <span>Max Overall Drawdown</span>
                      <button
                        type="button"
                        onClick={() => setActiveRuleDef(activeRuleDef === "max_drawdown" ? null : "max_drawdown")}
                        className="text-neutral-500 hover:text-[#ccff00] transition"
                        title="View definition"
                      >
                        <HelpCircle className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <span className="font-bold text-white font-mono">10% Static</span>
                  </div>
                  {activeRuleDef === "max_drawdown" && (
                    <div className="p-3 bg-black/60 rounded-xl text-neutral-300 text-[11px] leading-relaxed border border-[#ccff00]/20 my-1 animate-in fade-in">
                      <strong className="text-[#ccff00] block mb-0.5">{RULE_DEFINITIONS.max_drawdown.title}</strong>
                      {RULE_DEFINITIONS.max_drawdown.desc}
                    </div>
                  )}

                  {/* Profit Split */}
                  <div className="py-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-neutral-300">
                      <span>Profit Split</span>
                      <button
                        type="button"
                        onClick={() => setActiveRuleDef(activeRuleDef === "profit_split" ? null : "profit_split")}
                        className="text-neutral-500 hover:text-[#ccff00] transition"
                        title="View definition"
                      >
                        <HelpCircle className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <span className="font-bold text-[#ccff00] font-mono">80% – 90%</span>
                  </div>
                  {activeRuleDef === "profit_split" && (
                    <div className="p-3 bg-black/60 rounded-xl text-neutral-300 text-[11px] leading-relaxed border border-[#ccff00]/20 my-1 animate-in fade-in">
                      <strong className="text-[#ccff00] block mb-0.5">{RULE_DEFINITIONS.profit_split.title}</strong>
                      {RULE_DEFINITIONS.profit_split.desc}
                    </div>
                  )}

                  {/* 100% Refundable Fee */}
                  <div className="py-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-neutral-300">
                      <span>Fee Refund</span>
                      <button
                        type="button"
                        onClick={() => setActiveRuleDef(activeRuleDef === "refundable_fee" ? null : "refundable_fee")}
                        className="text-neutral-500 hover:text-[#ccff00] transition"
                        title="View definition"
                      >
                        <HelpCircle className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <span className="font-bold text-emerald-400 font-mono">100% Refundable</span>
                  </div>
                  {activeRuleDef === "refundable_fee" && (
                    <div className="p-3 bg-black/60 rounded-xl text-neutral-300 text-[11px] leading-relaxed border border-[#ccff00]/20 my-1 animate-in fade-in">
                      <strong className="text-[#ccff00] block mb-0.5">{RULE_DEFINITIONS.refundable_fee.title}</strong>
                      {RULE_DEFINITIONS.refundable_fee.desc}
                    </div>
                  )}

                </div>
              </div>

              {/* ── Coupon Code Box ── */}
              <div className="pt-2 border-t border-white/10">
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      placeholder="Coupon Code"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#090b10] border border-white/15 text-white placeholder-neutral-500 font-mono text-xs uppercase focus:outline-none focus:border-[#ccff00]"
                    />
                    <Tag className="w-3.5 h-3.5 text-neutral-500 absolute right-3 top-1/2 -translate-y-1/2" />
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition"
                  >
                    Apply
                  </button>
                </form>

                {couponApplied && (
                  <div className="mt-2 flex items-center justify-between text-xs text-[#ccff00] bg-[#ccff00]/10 border border-[#ccff00]/20 px-3 py-1.5 rounded-xl">
                    <span className="font-bold flex items-center gap-1.5">
                      <Sparkles size={12} /> New User Promo: 45% OFF (MAX45)
                    </span>
                    <button
                      type="button"
                      onClick={() => setCouponApplied(false)}
                      className="text-neutral-400 hover:text-white text-xs underline ml-2"
                    >
                      Remove
                    </button>
                  </div>
                )}

                {couponError && (
                  <p className="text-[11px] text-rose-400 mt-2 leading-relaxed">
                    {couponError}
                  </p>
                )}
              </div>

              {/* ── Total Cost Breakdown ── */}
              <div className="border-t border-white/10 pt-4 space-y-2 text-xs">
                <div className="flex justify-between text-neutral-400">
                  <span>Standard Evaluation Fee</span>
                  <span className={`font-mono ${couponApplied ? "line-through text-neutral-500" : "text-white font-bold"}`}>
                    ${fullOriginalPrice.toFixed(2)} USD
                  </span>
                </div>

                {couponApplied && (
                  <div className="flex justify-between text-[#ccff00] font-bold">
                    <span>New Trader 45% Discount</span>
                    <span className="font-mono">-${discountSavings.toFixed(2)} USD</span>
                  </div>
                )}

                <div className="flex items-baseline justify-between pt-3 border-t border-white/10">
                  <span className="text-white font-extrabold text-sm">Total Due Today</span>
                  <div className="text-right">
                    <div className="text-2xl font-black text-[#ccff00] font-mono">
                      ${finalPrice.toFixed(2)}
                      <span className="text-xs text-neutral-400 font-normal ml-1">USD</span>
                    </div>
                    <span className="text-[10px] text-emerald-400 font-bold block mt-0.5">
                      ✓ 100% Refunded on 1st Payout
                    </span>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      )}
    </div>
  );
}

// ─── Outer Page Wrapper ─────────────────────────────────────────────────────
export default function CheckoutPage() {
  return (
    <main className="min-h-screen bg-[#060709] text-white pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <Suspense
        fallback={
          <div className="flex items-center justify-center py-40">
            <Loader2 className="w-10 h-10 animate-spin text-[#ccff00]" />
          </div>
        }
      >
        <CheckoutInner />
      </Suspense>
    </main>
  );
}
