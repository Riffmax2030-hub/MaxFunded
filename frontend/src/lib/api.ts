const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export interface ChallengeRule {
  profit_target_percentage: number;
  max_daily_loss_percentage: number;
  max_drawdown_percentage: number;
  daily_loss_methodology: string;
  drawdown_methodology: string;
  min_trading_days: number;
  max_trading_days: number | null;
  leverage: number;
  profit_split_percentage: number;
  weekend_trading_allowed: boolean;
  news_trading_allowed: boolean;
  ea_trading_allowed: boolean;
  copy_trading_allowed: boolean;
  stop_loss_required: boolean;
}

export interface Challenge {
  id: string;
  name: string;
  slug: string;
  starting_balance: string;
  price: string;
  currency: string;
  description: string;
  is_active: boolean;
  rules: ChallengeRule;
}

export interface ChallengePurchase {
  id: string;
  user_id: string;
  challenge_id: string;
  status: string;
  purchase_price: string;
  currency: string;
  mt5_login: string | null;
  mt5_server: string | null;
  current_balance: string;
  current_equity: string;
  trading_days_count: number;
  created_at: string;
  challenge?: Challenge;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  country: string;
  role: string;
  is_admin: boolean;
  is_active: boolean;
  kyc_status: string;
}

export async function fetchChallenges(): Promise<Challenge[]> {
  const res = await fetch(`${API_BASE}/challenges`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load evaluation challenges");
  return res.json();
}

export async function purchaseChallenge(challengeId: string, token: string): Promise<ChallengePurchase> {
  const res = await fetch(`${API_BASE}/challenges/purchase`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ challenge_id: challengeId }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Purchase failed" }));
    throw new Error(err.detail || "Failed to start challenge");
  }
  return res.json();
}

export async function fetchUserMe(token: string): Promise<UserProfile> {
  const res = await fetch(`${API_BASE}/users/me`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Authentication failed or session expired");
  return res.json();
}

export async function fetchUserPurchases(token: string): Promise<ChallengePurchase[]> {
  const res = await fetch(`${API_BASE}/users/me/purchases`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to retrieve user challenges");
  return res.json();
}

export interface BankDetails {
  bank_name: string;
  account_name: string;
  account_number: string;
  swift_bic: string;
  iban?: string;
  routing_number?: string;
  currency: string;
  amount_expected: number;
  reference_code: string;
  instructions: string;
}

export interface PaymentMethodItem {
  id: string;
  name: string;
  description: string;
  category: string;
  badge: string;
  icons: string[];
  is_active: boolean;
  currencies: string[];
}

export interface PaymentInitiateResponse {
  payment_id: string;
  purchase_id: string;
  provider: string;
  status: string;
  amount: number;
  currency: string;
  redirect_url?: string | null;
  crypto_address?: string | null;
  crypto_amount?: number | null;
  crypto_currency?: string | null;
  qr_code_url?: string | null;
  payment_reference_code?: string | null;
  bank_details?: BankDetails | null;
}

export interface PaymentStatusResponse {
  id: string;
  purchase_id: string | null;
  provider: string;
  status: string;
  amount: number;
  currency: string;
  crypto_address?: string | null;
  crypto_amount?: number | null;
  crypto_currency?: string | null;
  payment_reference_code?: string | null;
  created_at: string;
  updated_at: string;
}

export async function fetchChallengeById(challengeId: string): Promise<Challenge> {
  const res = await fetch(`${API_BASE}/challenges/${challengeId}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load challenge details");
  return res.json();
}

export async function fetchPaymentMethods(token: string): Promise<PaymentMethodItem[]> {
  const res = await fetch(`${API_BASE}/payments/methods`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to load payment options");
  return res.json();
}

export async function initiatePayment(
  payload: {
    challenge_id: string;
    provider: string;
    currency?: string;
    success_url?: string;
    cancel_url?: string;
  },
  token: string
): Promise<PaymentInitiateResponse> {
  const res = await fetch(`${API_BASE}/payments/initiate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Payment initiation failed" }));
    throw new Error(err.detail || "Payment initiation failed");
  }
  return res.json();
}

export async function fetchPaymentStatus(paymentId: string, token: string): Promise<PaymentStatusResponse> {
  const res = await fetch(`${API_BASE}/payments/${paymentId}/status`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to fetch payment status");
  return res.json();
}

export interface AccountMetrics {
  purchase_id: string;
  challenge_id: string;
  challenge_name: string;
  starting_balance: number;
  current_balance: number;
  current_equity: number;
  high_water_mark: number;
  daily_starting_equity: number;
  status: string;
  mt5_login?: string | null;
  mt5_server?: string | null;
  mt5_password?: string | null;
  mt5_investor_password?: string | null;
  leverage: number;
  daily_loss_floor: number;
  daily_loss_remaining_usd: number;
  daily_loss_percent_remaining: number;
  max_drawdown_floor: number;
  max_drawdown_remaining_usd: number;
  max_drawdown_percent_remaining: number;
  profit_target_amount: number;
  profit_target_distance_usd: number;
  profit_target_progress_percent: number;
  trading_days_completed: number;
  trading_days_required: number;
  breached_reason?: string | null;
  breached_at?: string | null;
  passed_at?: string | null;
}

export interface TradeItem {
  id: string;
  ticket: string;
  symbol: string;
  trade_type: string;
  lots: number;
  open_price: number;
  close_price?: number | null;
  stop_loss?: number | null;
  take_profit?: number | null;
  open_time: string;
  close_time?: string | null;
  profit: number;
  commission: number;
  swap: number;
  status: string;
}

export interface DailySnapshotItem {
  id: string;
  snapshot_date: string;
  starting_balance: number;
  starting_equity: number;
  ending_balance: number;
  ending_equity: number;
  high_equity: number;
  low_equity: number;
  trades_count: number;
  daily_profit: number;
  is_trading_day: boolean;
}

export async function fetchTradingAccounts(token: string): Promise<AccountMetrics[]> {
  const res = await fetch(`${API_BASE}/trading/accounts`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to load trading accounts");
  return res.json();
}

export async function fetchAccountMetrics(purchaseId: string, token: string): Promise<AccountMetrics> {
  const res = await fetch(`${API_BASE}/trading/accounts/${purchaseId}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to load account metrics");
  return res.json();
}

export async function fetchAccountTrades(purchaseId: string, token: string): Promise<TradeItem[]> {
  const res = await fetch(`${API_BASE}/trading/accounts/${purchaseId}/trades`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to load trades");
  return res.json();
}

export async function fetchAccountSnapshots(purchaseId: string, token: string): Promise<DailySnapshotItem[]> {
  const res = await fetch(`${API_BASE}/trading/accounts/${purchaseId}/snapshots`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to load equity snapshots");
  return res.json();
}

export async function simulateTrade(
  purchaseId: string,
  payload: {
    symbol?: string;
    trade_type?: string;
    lots?: number;
    open_price?: number;
    close_price?: number;
    profit: number;
    is_closed?: boolean;
  },
  token: string
): Promise<AccountMetrics> {
  const res = await fetch(`${API_BASE}/trading/accounts/${purchaseId}/simulate-trade`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Simulation failed" }));
    throw new Error(err.detail || "Simulation failed");
  }
  return res.json();
}

// ─── KYC & AML Types & API Methods ───────────────────────────────────────────

export interface KYCDocumentItem {
  id?: string;
  document_type: string;
  document_number?: string;
  issuing_country?: string;
  file_name: string;
  file_url: string;
  mime_type: string;
  file_size_bytes?: number;
  is_front?: boolean;
  created_at?: string;
}

export interface KYCVerificationData {
  id: string;
  user_id: string;
  status: "NOT_SUBMITTED" | "PENDING_REVIEW" | "APPROVED" | "REJECTED" | "REQUIRES_RETRY";
  vendor: string;
  vendor_applicant_id?: string;
  aml_status: "CLEAR" | "FLAGGED" | "PENDING" | "HIGH_RISK";
  aml_risk_score: number;
  pep_check_passed: boolean;
  sanctions_check_passed: boolean;
  is_politically_exposed: boolean;
  first_name?: string;
  last_name?: string;
  date_of_birth?: string;
  nationality?: string;
  residence_country?: string;
  address_line?: string;
  city?: string;
  postal_code?: string;
  reviewer_id?: string;
  reviewer_notes?: string;
  rejection_reason?: string;
  reviewed_at?: string;
  submitted_at?: string;
  created_at: string;
  documents: KYCDocumentItem[];
}

export interface KYCSummaryData {
  user_id: string;
  kyc_status: string;
  aml_status: string;
  is_verified: boolean;
  verification_id?: string;
  documents_count: number;
  submitted_at?: string;
  reviewed_at?: string;
  reviewer_notes?: string;
  rejection_reason?: string;
  requires_action: boolean;
}

export interface KYCSubmissionPayload {
  first_name: string;
  last_name: string;
  date_of_birth: string;
  nationality: string;
  residence_country: string;
  address_line: string;
  city: string;
  postal_code?: string;
  is_politically_exposed: boolean;
  documents: Array<{
    document_type: string;
    document_number?: string;
    issuing_country?: string;
    file_name: string;
    file_url: string;
    mime_type: string;
    file_size_bytes?: number;
    is_front?: boolean;
  }>;
}

export interface AdminKYCReviewPayload {
  status: "APPROVED" | "REJECTED" | "REQUIRES_RETRY";
  reviewer_notes?: string;
  rejection_reason?: string;
}

export async function fetchMyKYCStatus(token: string): Promise<KYCSummaryData> {
  const res = await fetch(`${API_BASE}/kyc/status`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to load KYC status");
  return res.json();
}

export async function fetchMyKYCDossier(token: string): Promise<KYCVerificationData> {
  const res = await fetch(`${API_BASE}/kyc/dossier`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to load KYC dossier");
  return res.json();
}

export async function submitKYCVerification(
  payload: KYCSubmissionPayload,
  token: string
): Promise<KYCVerificationData> {
  const res = await fetch(`${API_BASE}/kyc/submit`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "KYC submission failed" }));
    throw new Error(err.detail || "KYC submission failed");
  }
  return res.json();
}

export async function fetchAdminKYCVerifications(
  token: string,
  statusFilter?: string
): Promise<KYCVerificationData[]> {
  const url = statusFilter
    ? `${API_BASE}/kyc/admin/verifications?status_filter=${statusFilter}`
    : `${API_BASE}/kyc/admin/verifications`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to load verification queue");
  return res.json();
}

export async function reviewKYCVerification(
  verificationId: string,
  payload: AdminKYCReviewPayload,
  token: string
): Promise<KYCVerificationData> {
  const res = await fetch(`${API_BASE}/kyc/admin/verifications/${verificationId}/review`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Review action failed" }));
    throw new Error(err.detail || "Review action failed");
  }
  return res.json();
}

export async function rescreenKYCAML(
  verificationId: string,
  token: string
): Promise<{ aml_status: string; aml_risk_score: number; flags: string[] }> {
  const res = await fetch(`${API_BASE}/kyc/admin/verifications/${verificationId}/screen-aml`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Re-screening failed");
  return res.json();
}

// ─── Payout & Profit Withdrawal Types & API Methods ───────────────────────────

export interface PayoutEligibilityData {
  purchase_id: string;
  challenge_name: string;
  starting_balance: number;
  current_balance: number;
  current_equity: number;
  gross_profit: number;
  profit_split_percentage: number;
  eligible_trader_amount: number;
  company_fee_amount: number;
  kyc_approved: boolean;
  is_eligible: boolean;
  ineligibility_reasons: string[];
}

export interface PayoutResponseData {
  id: string;
  user_id: string;
  purchase_id: string;
  amount: number;
  trader_amount: number;
  company_fee_amount: number;
  profit_split_percentage: number;
  currency: string;
  method: "CRYPTO_USDT_TRC20" | "CRYPTO_USDT_ERC20" | "BANK_WIRE_SWIFT" | "LOCAL_BANK_NGN" | "PAYPAL";
  payout_details: Record<string, any>;
  status: "REQUESTED" | "UNDER_REVIEW" | "APPROVED" | "PROCESSING" | "PAID" | "REJECTED" | "CANCELLED";
  tx_hash_or_reference?: string;
  rejection_reason?: string;
  admin_notes?: string;
  reviewer_id?: string;
  requested_at: string;
  reviewed_at?: string;
  processed_at?: string;
  created_at: string;
}

export interface PayoutRequestPayload {
  purchase_id: string;
  amount?: number;
  method: string;
  payout_details: Record<string, any>;
}

export interface AdminPayoutReviewPayload {
  status: string;
  tx_hash_or_reference?: string;
  admin_notes?: string;
  rejection_reason?: string;
}

export async function fetchPayoutEligibility(
  purchaseId: string,
  token: string
): Promise<PayoutEligibilityData> {
  const res = await fetch(`${API_BASE}/payouts/eligibility/${purchaseId}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to load payout eligibility");
  return res.json();
}

export async function requestTraderPayout(
  payload: PayoutRequestPayload,
  token: string
): Promise<PayoutResponseData> {
  const res = await fetch(`${API_BASE}/payouts/request`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Payout request failed" }));
    throw new Error(err.detail || "Payout request failed");
  }
  return res.json();
}

export async function fetchMyPayouts(token: string): Promise<PayoutResponseData[]> {
  const res = await fetch(`${API_BASE}/payouts/my-payouts`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to load payout history");
  return res.json();
}

export async function cancelTraderPayout(
  payoutId: string,
  token: string
): Promise<PayoutResponseData> {
  const res = await fetch(`${API_BASE}/payouts/${payoutId}/cancel`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Cancellation failed" }));
    throw new Error(err.detail || "Cancellation failed");
  }
  return res.json();
}

export async function fetchAdminPayoutQueue(
  token: string,
  statusFilter?: string
): Promise<PayoutResponseData[]> {
  const url = statusFilter
    ? `${API_BASE}/payouts/admin/queue?status_filter=${statusFilter}`
    : `${API_BASE}/payouts/admin/queue`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to load admin payout queue");
  return res.json();
}

export async function reviewAdminPayout(
  payoutId: string,
  payload: AdminPayoutReviewPayload,
  token: string
): Promise<PayoutResponseData> {
  const res = await fetch(`${API_BASE}/payouts/admin/${payoutId}/review`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Payout review failed" }));
    throw new Error(err.detail || "Payout review failed");
  }
  return res.json();
}



// ============================================================
// Phase 8 — Trader Dashboard
// ============================================================

export interface RuleComplianceItem {
  rule_name: string;
  description: string;
  current_value: string | null;
  limit_value: string | null;
  percentage_used: number | null;
  is_breached: boolean;
  is_achieved: boolean;
}

export interface DashboardSummaryData {
  purchase_id: number;
  challenge_name: string;
  account_size: string;
  phase: string;
  current_balance: string;
  current_equity: string;
  total_profit: string;
  total_profit_pct: number;
  open_positions: number;
  daily_drawdown_used_pct: number;
  daily_drawdown_limit_pct: number;
  max_drawdown_used_pct: number;
  max_drawdown_limit_pct: number;
  profit_target_pct: number;
  profit_target_reached_pct: number;
  profit_target_achieved: boolean;
  total_trades: number;
  winning_trades: number;
  losing_trades: number;
  win_rate_pct: number;
  avg_profit_per_trade: string;
  avg_loss_per_trade: string;
  profit_factor: number | null;
  account_status: string;
  days_remaining: number | null;
  challenge_start_date: string | null;
  kyc_status: string;
  has_pending_payout: boolean;
  rule_compliance: RuleComplianceItem[];
}

export interface EquityPoint {
  recorded_at: string;
  equity: string;
  balance: string;
  daily_pnl: string | null;
}

export interface DailyPerformance {
  trade_date: string;
  realized_pnl: string;
  trades_count: number;
  win_count: number;
}

export interface PerformanceReportData {
  purchase_id: number;
  daily_breakdown: DailyPerformance[];
  best_day_pnl: string | null;
  worst_day_pnl: string | null;
  avg_daily_pnl: string | null;
  trading_days: number;
}

export async function fetchDashboardSummary(token: string): Promise<DashboardSummaryData> {
  const res = await fetch(`${API_BASE}/dashboard/summary`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Dashboard unavailable" }));
    throw new Error(err.detail || "Dashboard unavailable");
  }
  return res.json();
}

export async function fetchEquityCurve(token: string, days = 30): Promise<EquityPoint[]> {
  const res = await fetch(`${API_BASE}/dashboard/equity-curve?days=${days}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return [];
  return res.json();
}

export async function fetchPerformanceReport(token: string): Promise<PerformanceReportData> {
  const res = await fetch(`${API_BASE}/dashboard/performance`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Performance report unavailable" }));
    throw new Error(err.detail || "Performance report unavailable");
  }
  return res.json();
}

// ============================================================
// Phase 9 — Cryptographic Certificates & Public Verification
// ============================================================

export interface CertificateItem {
  id: string;
  certificate_code: string;
  user_id: string;
  purchase_id: string;
  certificate_type: "PHASE_1_PASSED" | "PHASE_2_PASSED" | "FUNDED_TRADER" | "PAYOUT_ACHIEVER";
  trader_name: string;
  challenge_name: string;
  account_size: string;
  payout_amount: string | null;
  sha256_signature: string;
  is_revoked: boolean;
  revocation_reason: string | null;
  created_at: string;
}

export interface PublicCertificateData {
  is_valid: boolean;
  certificate_code: string;
  certificate_type: "PHASE_1_PASSED" | "PHASE_2_PASSED" | "FUNDED_TRADER" | "PAYOUT_ACHIEVER";
  trader_name: string;
  challenge_name: string;
  account_size: string;
  payout_amount: string | null;
  issued_at: string;
  sha256_signature: string;
  is_revoked: boolean;
  revocation_reason: string | null;
  issuer: string;
  verification_url: string;
}

export async function fetchMyCertificates(token: string): Promise<CertificateItem[]> {
  const res = await fetch(`${API_BASE}/certificates/my`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Failed to fetch certificates" }));
    throw new Error(err.detail || "Failed to fetch certificates");
  }
  return res.json();
}

export async function verifyCertificatePublic(code: string): Promise<PublicCertificateData> {
  const res = await fetch(`${API_BASE}/certificates/verify/${encodeURIComponent(code)}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Certificate not found or invalid" }));
    throw new Error(err.detail || "Certificate not found or invalid");
  }
  return res.json();
}

// ============================================================
// Phase 10 — Affiliate Partner Network & Coupons
// ============================================================

export interface AffiliateProfileData {
  id: string;
  user_id: string;
  referral_code: string;
  commission_rate: string;
  tier: "STANDARD" | "PRO" | "ELITE";
  total_referred_users: number;
  total_purchases_referred: number;
  total_sales_volume: string;
  total_commission_earned: string;
  commission_balance: string;
  total_commission_paid: string;
  payout_method: string | null;
  payout_address: string | null;
  is_active: boolean;
  created_at: string;
}

export interface ReferralCommissionItem {
  id: string;
  affiliate_id: string;
  purchase_id: string;
  purchase_amount: string;
  commission_rate: string;
  commission_amount: string;
  status: string;
  created_at: string;
}

export interface AffiliatePayoutItem {
  id: string;
  affiliate_id: string;
  amount: string;
  method: string;
  destination: string;
  status: string;
  admin_notes: string | null;
  processed_at: string | null;
  created_at: string;
}

export interface CouponValidateResult {
  valid: boolean;
  code: string;
  discount_percentage: string;
  discount_amount: string;
  final_price: string;
  message: string;
}

export async function fetchMyAffiliateProfile(token: string): Promise<AffiliateProfileData> {
  const res = await fetch(`${API_BASE}/affiliates/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Failed to fetch affiliate profile" }));
    throw new Error(err.detail || "Failed to fetch affiliate profile");
  }
  return res.json();
}

export async function registerAffiliate(
  token: string,
  payload: { referral_code?: string; payout_method?: string; payout_address?: string }
): Promise<AffiliateProfileData> {
  const res = await fetch(`${API_BASE}/affiliates/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Affiliate enrollment failed" }));
    throw new Error(err.detail || "Affiliate enrollment failed");
  }
  return res.json();
}

export async function fetchMyCommissions(token: string): Promise<ReferralCommissionItem[]> {
  const res = await fetch(`${API_BASE}/affiliates/commissions`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return [];
  return res.json();
}

export async function requestAffiliatePayout(
  token: string,
  payload: { amount: number; method: string; destination: string }
): Promise<AffiliatePayoutItem> {
  const res = await fetch(`${API_BASE}/affiliates/payout-request`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Payout request failed" }));
    throw new Error(err.detail || "Payout request failed");
  }
  return res.json();
}

export async function fetchMyAffiliatePayouts(token: string): Promise<AffiliatePayoutItem[]> {
  const res = await fetch(`${API_BASE}/affiliates/payouts`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return [];
  return res.json();
}

export async function validateCoupon(code: string, price: number): Promise<CouponValidateResult> {
  const res = await fetch(
    `${API_BASE}/affiliates/coupons/validate?code=${encodeURIComponent(code)}&price=${price}`
  );
  if (!res.ok) {
    return {
      valid: false,
      code,
      discount_percentage: "0",
      discount_amount: "0",
      final_price: price.toString(),
      message: "Coupon invalid or network error",
    };
  }
  return res.json();
}

// ============================================================
// Phase 11 — Notifications & Community Webhooks
// ============================================================

export interface NotificationItem {
  id: string;
  user_id: string;
  title: string;
  message: string;
  notification_type: string;
  is_read: boolean;
  action_url: string | null;
  created_at: string;
}

export interface NotificationFeedData {
  unread_count: number;
  notifications: NotificationItem[];
}

export interface WebhookConfigItem {
  id: string;
  name: string;
  target_service: "DISCORD" | "TELEGRAM" | "GENERIC";
  webhook_url: string;
  is_active: boolean;
  events_subscribed: string;
  created_at: string;
}

export async function fetchMyNotifications(token: string): Promise<NotificationFeedData> {
  const res = await fetch(`${API_BASE}/notifications/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return { unread_count: 0, notifications: [] };
  return res.json();
}

export async function markNotificationRead(token: string, id: string): Promise<NotificationItem> {
  const res = await fetch(`${API_BASE}/notifications/${id}/read`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to mark notification as read");
  return res.json();
}

export async function markAllNotificationsRead(token: string): Promise<{ marked_read: number }> {
  const res = await fetch(`${API_BASE}/notifications/read-all`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to mark all as read");
  return res.json();
}

export async function fetchAdminWebhooks(token: string): Promise<WebhookConfigItem[]> {
  const res = await fetch(`${API_BASE}/notifications/admin/webhooks`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return [];
  return res.json();
}

export async function createAdminWebhook(
  token: string,
  payload: { name: string; target_service: string; webhook_url: string; events_subscribed?: string }
): Promise<WebhookConfigItem> {
  const res = await fetch(`${API_BASE}/notifications/admin/webhooks`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Failed to register webhook" }));
    throw new Error(err.detail || "Failed to register webhook");
  }
  return res.json();
}

export async function testDispatchWebhook(
  token: string,
  payload: { target_service: string; webhook_url: string; event_type: string; custom_title?: string; custom_message?: string }
): Promise<{ dispatched: boolean }> {
  const res = await fetch(`${API_BASE}/notifications/admin/test-dispatch`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Webhook test dispatch failed");
  return res.json();
}
