"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import {
  fetchChallengeById,
  fetchPaymentMethods,
  initiatePayment,
  Challenge,
  PaymentMethodItem,
  PaymentInitiateResponse,
} from "@/lib/api";
import {
  ShieldCheck,
  CreditCard,
  QrCode,
  Building2,
  CheckCircle2,
  Copy,
  ExternalLink,
  AlertCircle,
  Loader2,
  ArrowLeft,
  Lock,
} from "lucide-react";

export default function CheckoutPage() {
  const params = useParams();
  const router = useRouter();
  const challengeId = params.challengeId as string;

  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [methods, setMethods] = useState<PaymentMethodItem[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<string>("stripe");
  const [currency, setCurrency] = useState<string>("USD");
  const [loading, setLoading] = useState<boolean>(true);
  const [initiating, setInitiating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Active payment session result
  const [paymentResult, setPaymentResult] = useState<PaymentInitiateResponse | null>(null);

  useEffect(() => {
    const session = getSession();
    if (!session) {
      router.push(`/login?redirect=/checkout/${challengeId}`);
      return;
    }

    async function loadData() {
      try {
        setLoading(true);
        const [cData, mData] = await Promise.all([
          fetchChallengeById(challengeId),
          fetchPaymentMethods(session!.token),
        ]);
        setChallenge(cData);
        setMethods(mData);
        if (mData.length > 0) {
          setSelectedProvider(mData[0].id);
        }
      } catch (err: any) {
        setError(err.message || "Failed to load checkout details");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [challengeId, router]);

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleInitiate = async () => {
    const session = getSession();
    if (!session) {
      router.push("/login");
      return;
    }

    try {
      setInitiating(true);
      setError(null);

      const res = await initiatePayment(
        {
          challenge_id: challengeId,
          provider: selectedProvider,
          currency: currency,
          success_url: `${window.location.origin}/checkout/success`,
          cancel_url: `${window.location.origin}/challenges`,
        },
        session.token
      );

      setPaymentResult(res);

      // If provider gave a redirect URL (Stripe, PayPal, Flutterwave, Paystack)
      if (res.redirect_url) {
        window.location.href = res.redirect_url;
      }
    } catch (err: any) {
      setError(err.message || "Failed to initiate payment");
    } finally {
      setInitiating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#08090b] text-white flex flex-col justify-center items-center py-32 space-y-4">
        <Loader2 className="w-10 h-10 text-[#ccff00] animate-spin" />
        <p className="text-neutral-400 text-sm">Securing your checkout environment...</p>
      </div>
    );
  }

  if (error && !challenge) {
    return (
      <div className="min-h-screen bg-[#08090b] text-white flex flex-col justify-center items-center py-24 px-4 text-center">
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <h2 className="text-xl font-bold mb-2">Checkout Error</h2>
        <p className="text-neutral-400 text-sm mb-6">{error}</p>
        <Link
          href="/challenges"
          className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-full bg-white text-black text-xs font-black uppercase"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Challenges</span>
        </Link>
      </div>
    );
  }

  const selectedMethodObj = methods.find((m) => m.id === selectedProvider);

  return (
    <div className="min-h-screen bg-[#08090b] text-white py-12">

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-grow w-full">
        {/* Breadcrumb / Back */}
        <div className="mb-8">
          <Link
            href="/challenges"
            className="inline-flex items-center space-x-2 text-xs font-semibold text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Challenge Catalog</span>
          </Link>
          <h1 className="text-3xl font-extrabold tracking-tight mt-2">
            Secure <span className="text-brand-500">Checkout</span>
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Choose your preferred global payment gateway to activate your simulated evaluation account.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-950/40 border border-red-700/60 flex items-start space-x-3 text-red-200 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-400 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Payment Methods Selection */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-dark-900 border border-dark-700/60 rounded-2xl p-6 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                  <CreditCard className="w-5 h-5 text-brand-500" />
                  <span>Select Payment Method</span>
                </h2>
                <div className="flex items-center space-x-1.5 text-xs text-emerald-400 font-semibold bg-emerald-950/50 border border-emerald-800/40 px-2.5 py-1 rounded-full">
                  <Lock className="w-3.5 h-3.5" />
                  <span>256-Bit SSL Encrypted</span>
                </div>
              </div>

              {/* Methods List */}
              <div className="space-y-3">
                {methods.map((method) => {
                  const isSelected = selectedProvider === method.id;
                  return (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() => {
                        setSelectedProvider(method.id);
                        setPaymentResult(null);
                      }}
                      className={`w-full text-left p-4 rounded-xl border transition-all flex items-start justify-between ${
                        isSelected
                          ? "bg-dark-800/90 border-brand-500 shadow-md shadow-brand-500/10"
                          : "bg-dark-850/50 border-dark-750 hover:border-dark-600 hover:bg-dark-800/50"
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2.5">
                          <span className="font-bold text-sm text-white">{method.name}</span>
                          {method.badge && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-950 border border-brand-800/60 text-brand-300">
                              {method.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-400 leading-relaxed pr-4">
                          {method.description}
                        </p>
                      </div>

                      <div className="mt-1 flex-shrink-0">
                        <div
                          className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                            isSelected
                              ? "border-brand-500 bg-brand-500 text-white"
                              : "border-gray-600 bg-dark-900"
                          }`}
                        >
                          {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Dynamic Payment Action Details Panel */}
            <div className="bg-dark-900 border border-dark-700/60 rounded-2xl p-6 shadow-xl">
              {/* Crypto Details View (if initiated or active) */}
              {paymentResult && paymentResult.provider === "nowpayments" && paymentResult.crypto_address ? (
                <div className="space-y-6">
                  <div className="flex items-center space-x-2 text-brand-400">
                    <QrCode className="w-5 h-5" />
                    <h3 className="font-bold text-sm uppercase tracking-wide">
                      Deposit Instructions ({paymentResult.crypto_currency})
                    </h3>
                  </div>

                  <div className="bg-dark-950 border border-dark-700/80 rounded-xl p-5 flex flex-col md:flex-row items-center gap-6">
                    {paymentResult.qr_code_url && (
                      <div className="bg-white p-2 rounded-lg flex-shrink-0 shadow-lg">
                        <img
                          src={paymentResult.qr_code_url}
                          alt="Crypto Deposit QR"
                          className="w-36 h-36"
                        />
                      </div>
                    )}
                    <div className="space-y-3 w-full">
                      <div>
                        <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
                          Amount to Send
                        </div>
                        <div className="text-lg font-mono font-bold text-emerald-400 flex items-center justify-between bg-dark-900 px-3 py-1.5 rounded-lg border border-dark-700">
                          <span>{paymentResult.crypto_amount} {paymentResult.crypto_currency}</span>
                          <button
                            onClick={() => handleCopy(String(paymentResult.crypto_amount), "crypto_amount")}
                            className="text-xs text-gray-400 hover:text-white"
                          >
                            {copiedField === "crypto_amount" ? "Copied!" : <Copy className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
                          Deposit Address ({paymentResult.crypto_currency})
                        </div>
                        <div className="text-xs font-mono text-gray-200 flex items-center justify-between bg-dark-900 px-3 py-2 rounded-lg border border-dark-700 break-all">
                          <span className="truncate pr-2">{paymentResult.crypto_address}</span>
                          <button
                            onClick={() => handleCopy(paymentResult.crypto_address!, "crypto_address")}
                            className="text-xs text-brand-400 hover:text-brand-300 flex-shrink-0 font-bold"
                          >
                            {copiedField === "crypto_address" ? "Copied!" : <Copy className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-amber-950/30 border border-amber-800/40 rounded-lg text-xs text-amber-200/90 leading-relaxed">
                    ⚠️ Send only {paymentResult.crypto_currency} to this address. Sending any other currency may result in permanent loss. Your account will automatically activate once confirmed on the blockchain network.
                  </div>

                  <Link
                    href={`/checkout/success?payment_id=${paymentResult.payment_id}`}
                    className="w-full block text-center py-3 bg-brand-600 hover:bg-brand-500 text-white font-bold rounded-xl transition shadow-lg shadow-brand-600/30 text-sm"
                  >
                    I Have Sent Payment → Check Status
                  </Link>
                </div>
              ) : paymentResult && paymentResult.provider === "bank_transfer" && paymentResult.bank_details ? (
                /* Bank Wire Transfer Details View */
                <div className="space-y-6">
                  <div className="flex items-center space-x-2 text-brand-400">
                    <Building2 className="w-5 h-5" />
                    <h3 className="font-bold text-sm uppercase tracking-wide">
                      Direct Wire & Local Bank Details
                    </h3>
                  </div>

                  {/* Crucial Reference Code Highlight */}
                  <div className="bg-brand-950/40 border border-brand-700/60 rounded-xl p-4 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-widest text-brand-400">
                        Required Memo / Reference Code
                      </div>
                      <div className="font-mono text-lg font-extrabold text-white mt-0.5">
                        {paymentResult.payment_reference_code}
                      </div>
                      <p className="text-[11px] text-gray-400">
                        Include this exact code in your wire transfer note/description.
                      </p>
                    </div>
                    <button
                      onClick={() => handleCopy(paymentResult.payment_reference_code!, "ref_code")}
                      className="px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold flex items-center space-x-1.5 shadow"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>{copiedField === "ref_code" ? "Copied" : "Copy"}</span>
                    </button>
                  </div>

                  <div className="bg-dark-950 border border-dark-700/80 rounded-xl divide-y divide-dark-800 text-xs">
                    <div className="p-3 flex justify-between">
                      <span className="text-gray-400">Beneficiary Name</span>
                      <span className="font-semibold text-white">{paymentResult.bank_details.account_name}</span>
                    </div>
                    <div className="p-3 flex justify-between">
                      <span className="text-gray-400">Bank Name</span>
                      <span className="font-semibold text-white">{paymentResult.bank_details.bank_name}</span>
                    </div>
                    <div className="p-3 flex justify-between">
                      <span className="text-gray-400">Account Number</span>
                      <span className="font-mono font-bold text-emerald-400">{paymentResult.bank_details.account_number}</span>
                    </div>
                    <div className="p-3 flex justify-between">
                      <span className="text-gray-400">SWIFT / BIC</span>
                      <span className="font-mono font-bold text-white">{paymentResult.bank_details.swift_bic}</span>
                    </div>
                    <div className="p-3 flex justify-between">
                      <span className="text-gray-400">Currency</span>
                      <span className="font-bold text-white">{paymentResult.bank_details.currency}</span>
                    </div>
                    <div className="p-3 flex justify-between">
                      <span className="text-gray-400">Amount Due</span>
                      <span className="font-bold text-white">${paymentResult.bank_details.amount_expected.toFixed(2)} USD</span>
                    </div>
                  </div>

                  <Link
                    href={`/checkout/success?payment_id=${paymentResult.payment_id}`}
                    className="w-full block text-center py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition shadow-lg shadow-emerald-600/30 text-sm"
                  >
                    I Have Completed The Wire Transfer → View Order
                  </Link>
                </div>
              ) : (
                /* Default Initiate Button */
                <div className="space-y-4">
                  <div className="text-xs text-gray-400 leading-relaxed">
                    By clicking <strong className="text-white">Pay & Activate Evaluation</strong>, you will be securely redirected to complete payment with {selectedMethodObj?.name || "the chosen provider"}.
                  </div>
                  <button
                    onClick={handleInitiate}
                    disabled={initiating}
                    className="w-full py-4 bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white font-bold rounded-xl text-base transition-all flex items-center justify-center space-x-2 shadow-lg shadow-brand-600/30"
                  >
                    {initiating ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Connecting to Gateway...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-5 h-5" />
                        <span>Pay ${Number(challenge?.price).toFixed(2)} USD & Activate</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Order Summary Card */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-dark-900 border border-dark-700/60 rounded-2xl p-6 shadow-xl sticky top-24">
              <h2 className="text-lg font-bold text-white mb-4">Order Summary</h2>

              {challenge && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-dark-950 border border-dark-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-base">{challenge.name}</span>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-brand-900/60 text-brand-300">
                        Simulated MT5
                      </span>
                    </div>
                    <div className="text-2xl font-extrabold text-emerald-400">
                      ${Number(challenge.starting_balance).toLocaleString()}
                    </div>
                  </div>

                  {/* Key Rules Snapshot */}
                  {challenge.rules && (
                    <div className="space-y-2 text-xs divide-y divide-dark-800">
                      <div className="pt-2 flex justify-between text-gray-300">
                        <span>Profit Target</span>
                        <span className="font-bold text-white">{challenge.rules.profit_target_percentage}%</span>
                      </div>
                      <div className="pt-2 flex justify-between text-gray-300">
                        <span>Daily Loss Limit</span>
                        <span className="font-bold text-white">{challenge.rules.max_daily_loss_percentage}%</span>
                      </div>
                      <div className="pt-2 flex justify-between text-gray-300">
                        <span>Max Drawdown</span>
                        <span className="font-bold text-white">{challenge.rules.max_drawdown_percentage}%</span>
                      </div>
                      <div className="pt-2 flex justify-between text-gray-300">
                        <span>Profit Split Rate</span>
                        <span className="font-bold text-emerald-400">{challenge.rules.profit_split_percentage}% Trader</span>
                      </div>
                      <div className="pt-2 flex justify-between text-gray-300">
                        <span>Trading Platform</span>
                        <span className="font-bold text-white">MetaTrader 5</span>
                      </div>
                    </div>
                  )}

                  <div className="border-t border-dark-800 pt-4 flex items-center justify-between text-sm">
                    <span className="font-semibold text-gray-300">Evaluation Fee</span>
                    <span className="text-2xl font-extrabold text-white">
                      ${Number(challenge.price).toFixed(2)} <span className="text-xs text-gray-400 font-normal">USD</span>
                    </span>
                  </div>

                  <div className="rounded-xl p-3 bg-dark-950 border border-dark-800 text-[11px] text-gray-400 leading-relaxed">
                    🛡️ <strong className="text-gray-300">Non-Refundable Evaluation Fee</strong>. Grants simulated access to proprietary performance challenge. No deposit or retail investment product.
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
