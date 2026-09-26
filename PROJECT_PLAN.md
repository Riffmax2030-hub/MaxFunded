# RiffMax Funding — Master Project Plan

## Implementation Roadmap (Phases 0 through 12)

```
[Phase 0] Discovery & Architecture (COMPLETE)
   │
[Phase 1] Foundation: Next.js + FastAPI + Postgres + Auth + Challenge Core (COMPLETE)
   │
[Phase 2] Marketing Website & Complete Legal/Information Pages (COMPLETE)
   │
[Phase 3] Challenge Engine & State Machine Execution (COMPLETE)
   │
[Phase 4] Payments, Webhooks, Idempotency & Financial Ledger (COMPLETE)
   │
[Phase 5] MT5 Simulated Trading Provider & Mock Engine (COMPLETE)
   │
[Phase 6] Deterministic Server-Side Risk Engine (COMPLETE)
   │
[Phase 7] KYC Verification, AML Screening & Compliance Gateway (COMPLETE)
   │
[Phase 8] Live Trader Dashboard, Equity Curve & Real-Time Performance (COMPLETE)
   │
[Phase 9] Cryptographic Certificate Generation & Public QR Verification (COMPLETE)
   │
[Phase 10] Real-Trading Capital Firewall & Copy-Trading Replication Engine (COMPLETE)
   │
[Phase 11] Affiliate Network, Coupons & Community Notification Webhooks (COMPLETE)
   │
[Phase 12] Security Hardening, Audit Logs & Controlled Beta Deployment (COMPLETE)
```

---

## Detailed Milestones

### Phase 0: Discovery & Project Blueprint (COMPLETE)
- [x] Inspect existing workspace and environment.
- [x] Create `ARCHITECTURE.md` (Capital firewall, domain architecture, provider abstractions).
- [x] Create `PROJECT_PLAN.md` (Roadmap and phase gates).
- [x] Create `ENVIRONMENT.md` (Tooling, configuration, runtime prerequisites).

### Phase 1: Foundation (COMPLETE)
- [x] Backend foundation: FastAPI project structure (`apps/backend`).
- [x] Database models: `User`, `Role`, `Permission`, `UserRole`, `Challenge`, `ChallengeRule`, `AuditLog`.
- [x] Alembic database migrations.
- [x] JWT authentication with bcrypt/argon2, user registration & login.
- [x] Role-Based Access Control (RBAC) middleware for `SUPER_ADMIN`, `TRADING_ADMIN`, `FINANCE_ADMIN`, etc.
- [x] Frontend foundation: Next.js App Router (`apps/frontend`) with Tailwind CSS.
- [x] Trader authentication UI: `/login`, `/register`.
- [x] Challenge listing & selection UI: `/challenges`.
- [x] Basic trader dashboard: `/dashboard`.
- [x] Automated tests: Pytest for backend auth, RBAC, challenges, and models.
- [x] Docker configuration: `docker-compose.yml` for PostgreSQL, Redis, backend, frontend.

### Phase 2: Website & Legal Compliance (COMPLETE)
- [x] Marketing pages: Hero, Pricing, Rules, How It Works, FAQ, About, Contact.
- [x] Legal compliance documents: Terms, Privacy, Risk Disclosure, Payout Policy, Restricted Countries, Refund Policy, Trading Conditions.

### Phase 3: Challenge Engine (COMPLETE)
- [x] Challenge configuration management.
- [x] Challenge state transitions: `PENDING_PAYMENT` -> `ACTIVE` -> `TARGET_REACHED` -> `BREACHED` -> `PASSED`.

### Phase 4: Payments & Ledger (COMPLETE)
- [x] `PaymentProvider` interface & `MockPaymentProvider` (Card, Crypto, Bank Transfer).
- [x] Webhook receiver with HMAC signature verification and idempotency keys.
- [x] Double-entry financial ledger and bank transfer admin confirmation.

### Phase 5: MT5 Simulated Account Integration (COMPLETE)
- [x] `TradingAccountProvider` interface & `MockTradingAccountProvider`.
- [x] Automated MT5 demo credential generation & trade synchronization worker.

### Phase 6: Server-Side Risk Engine (COMPLETE)
- [x] Daily loss tracker (Equity-based & Balance-based methodologies).
- [x] Trailing & Static Drawdown calculators.
- [x] Minimum trading days validation & breach detection.

### Phase 7: KYC Verification, AML Screening & Compliance Gateway (COMPLETE)
- [x] Sanctioned countries, PEP detection, AML screening.
- [x] Trader document upload UI & compliance admin review portal (`/admin/compliance`).

### Phase 8: Live Trader Dashboard, Equity Curve & Real-Time Performance (COMPLETE)
- [x] Real-time equity curve (SVG 30-day projection) & drawdown gauges.
- [x] Rule compliance checks and performance summary.

### Phase 9: Cryptographic Certificates & Public Verification (COMPLETE)
- [x] HMAC-SHA256 digital certificate generation (`RMF-P1-2026-XXXX`).
- [x] Public verification page (`/verify/[code]`) with certificate authenticity validation.
- [x] Trader certificate gallery (`/certificates`).

### Phase 10: Company Capital Firewall & Copy-Trading Engine (COMPLETE)
- [x] Complete isolation between trader challenge fees and company risk capital.
- [x] Trader signal profiling, performance scoring & leaderboard ranking.
- [x] Copy engine execution journal (`/admin/capital`).

### Phase 11: Affiliate Partner Network & Community Webhooks (COMPLETE)
- [x] Affiliate registration, custom referral links, coupons, 3-tier commission progression (Standard/Pro/Elite).
- [x] Discord rich embed & Telegram markdown event dispatchers (`/admin/notifications`).
- [x] In-app notification bell with live polling drawer.

### Phase 12: Security Hardening, Audit Logs & Controlled Beta Deployment (COMPLETE)
- [x] Public health check endpoint (`GET /api/v1/health`) with live DB ping and platform counters.
- [x] Immutable administrative audit logs (`GET /api/v1/admin/audit-logs`) with multi-attribute filtering and RBAC security guard.
- [x] Mission Control diagnostics dashboard (`/admin/system`).
- [x] Comprehensive test coverage: 86/86 passing tests in backend.
- [x] Full production build: 31/31 routes compiled in frontend.
