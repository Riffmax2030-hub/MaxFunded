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




