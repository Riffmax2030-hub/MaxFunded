# RiffMax Funding — System Architecture Documentation

## 1. Executive Summary & Core Paradigm

**RiffMax Funding** is a global proprietary trading evaluation platform and trading firm software architecture. The platform operates on a dual-engine architecture with an absolute **Capital Firewall**:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        CUSTOMER-FACING LAYER                           │
│   Next.js Trader Portal & Landing Pages • Public Challenge Catalog     │
└────────────────────────────────────┬───────────────────────────────────┘
                                     │
                                     ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   A. SIMULATED CHALLENGE PLATFORM                      │
│  • Customer Purchases & Challenges ($10k - $200k)                      │
│  • Simulated Trading Accounts (MT5 Demo / MockTradingProvider)         │
│  • Deterministic Server-Side Risk Engine (Daily Loss, Trailing DD)     │
│  • Challenge Evaluation State Machine (Passed, Breached, Review)       │
│  • Performance Reward Reserve & Solvency Engine                        │
│  • Payout Service (Admin Review & Approval Workflow)                   │
│  • Cryptographic Certificate Issuance & Public QR Verification         │
└────────────────────────────────────┬───────────────────────────────────┘
                                     │
                             CAPITAL FIREWALL
                      (Strict Data & Ledger Isolation)
                                     │
                                     ▼
┌────────────────────────────────────────────────────────────────────────┐
│             B. COMPANY REAL-TRADING & REPLICATION LAYER                │
│  • Trader Performance Profiling (Consistency, Volatility, Sharpe)      │
│  • Replication Eligibility State Machine (ELIGIBLE, SELECTED)          │
│  • Trade Replication Engine with Risk-Normalized Position Sizing       │
│  • RealTradingProvider Abstraction (Broker / Liquidity Bridge)         │
│  • Execution Safety: Slippage, Stale Data & Latency Circuit Breakers   │
│  • Company Real Trading P&L Ledger (Gross, Net, Trading Costs)         │
│  • Real-Trading Admin Control Station (/admin/real-trading)            │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Regulatory & Legal Jurisdictional Model

The operational entity is legally registered in Nigeria with an international service mandate. Under global financial regulations and Nigeria SEC guidelines regarding online forex/CFD activities, the platform is architected around configurable compliance controls rather than hardcoded assumptions:

- `SUPPORTED_COUNTRIES`: Countries where traders are permitted to register and purchase evaluation challenges.
- `RESTRICTED_COUNTRIES`: Strict blocklist where platform access, challenge purchases, or services are legally prohibited.
- `KYC_REQUIRED_COUNTRIES`: Jurisdictions requiring upfront identity verification prior to challenge activation.
- `PAYMENT_RESTRICTED_COUNTRIES`: Jurisdictions where payment acquiring methods are restricted or alternate gateways are used.
- `PAYOUT_RESTRICTED_COUNTRIES`: Jurisdictions where rewards payouts must pass elevated AML/sanctions screening.

---

## 3. The Capital Firewall & Immutable Financial Ledger

To guarantee institutional solvency and clean corporate governance:
1. **Zero Commingling**: Customer evaluation fee receipts are distinct from simulated trading capital and company real-trading capital.
2. **Double-Entry Financial Ledger**:
   - `CHALLENGE_PURCHASE`
   - `PAYMENT_FEE`
   - `REFUND`
   - `CHARGEBACK`
   - `AFFILIATE_COMMISSION`
   - `REWARD_ACCRUAL`
   - `PAYOUT`
   - `REAL_TRADING_PROFIT_ALLOCATION`
   - `ADJUSTMENT`
3. **No Floating Point Arithmetic**: All monetary values are represented using exact `Decimal(18, 4)` and integer minor units (cents) to avoid rounding drift.

---

## 4. Domain Driven Architecture (FastAPI Backend)

The backend is organized into decoupled domain modules:

| Module | Description |
|---|---|
| `core` | Database engine, Redis connection, configuration, security, base models |
| `auth` | JWT tokens, password hashing (Argon2/Bcrypt), 2FA, session security |
| `users` | User accounts, profiles, jurisdiction compliance, audit logs |
| `challenges` | Challenge tiers ($10k-$200k), rules, parameters, lifecycle state machine |
| `trading` | Simulated MT5 trading accounts, trade synchronization, metrics |
| `risk` | Deterministic Risk Engine (daily loss, max drawdown, minimum days) |
| `payments` | Payment providers, webhooks, idempotency keys, ledger recording |
| `payouts` | Reward eligibility, payout requests, admin approval, payouts ledger |
| `certificates`| Cryptographic certificate generation (UUIDs, QR code verification) |
| `real_trading`| Trader profiling, replication engine, position sizer, company P&L |
| `affiliates` | Referral tracking, commission accrual, payout management |
| `admin` | RBAC admin management, system health, business settings |

---

## 5. Provider Abstraction Layer

To ensure zero vendor lock-in, all external dependencies are built behind abstract interfaces:
- `PaymentProvider`: (`MockPaymentProvider`, Stripe, Flutterwave, Paystack, Crypto)
- `TradingAccountProvider`: (`MockTradingAccountProvider`, MT5 Manager API, MetaAPI)
- `RealTradingProvider`: (`MockRealTradingProvider`, FIX API, MT5 Bridge, Prime Broker)
- `PayoutProvider`: (`MockPayoutProvider`, Bank Wire, Crypto, Wise)
- `EmailProvider`: (`MockEmailProvider`, SendGrid, Postmark, SMTP)
- `KYCProvider`: (`MockKYCProvider`, Sumsub, Veriff)

---

## 6. Frontend Architecture (Next.js & Tailwind CSS)

Built using modern Next.js App Router:
- **Public Showcase**: Landing page, Challenge picker, Rules, How It Works, Pricing, FAQ, Legal Docs.
- **Trader Dashboard**: Live equity curve, daily loss gauge, drawdown meter, open positions, trade history.
- **Admin Control Station**: Challenge configuration, user audit, payout processing, replication engine switches.
- **Public Certificate Verification**: `/verify/[certificateId]` verifying authenticity and tamper-proofing.
