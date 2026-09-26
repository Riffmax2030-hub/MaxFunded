# RiffMax Funding — Master Project Plan

## Implementation Roadmap (Phases 0 through 12)

```
[Phase 0] Discovery & Architecture (COMPLETE)
   │
[Phase 1] Foundation: Next.js + FastAPI + Postgres + Auth + Challenge Core (IN PROGRESS)
   │
[Phase 2] Marketing Website & Complete Legal/Information Pages
   │
[Phase 3] Challenge Engine & State Machine Execution
   │
[Phase 4] Payments, Webhooks, Idempotency & Financial Ledger
   │
[Phase 5] MT5 Simulated Trading Provider & Mock Engine
   │
[Phase 6] Deterministic Server-Side Risk Engine
   │
[Phase 7] Target Evaluation, Pass/Review & Funded Stage Transitions
   │
[Phase 8] Payouts Service & Solvency Reserve Engine
   │
[Phase 9] Cryptographic Certificate Generation & Public QR Verification
   │
[Phase 10] Real-Trading Replication Engine & Position Sizer (A-Book / B-Book Bridge)
   │
[Phase 11] Affiliates, Coupons & Notification Center
   │
[Phase 12] Security Hardening, Audit Logs & Controlled Beta Deployment
```

---

## Detailed Milestones

### Phase 0: Discovery & Project Blueprint (Current)
- [x] Inspect existing workspace and environment.
- [x] Create `ARCHITECTURE.md` (Capital firewall, domain architecture, provider abstractions).
- [x] Create `PROJECT_PLAN.md` (Roadmap and phase gates).
- [x] Create `ENVIRONMENT.md` (Tooling, configuration, runtime prerequisites).

### Phase 1: Foundation (Current Target)
- [ ] Backend foundation: FastAPI project structure (`apps/backend`).
- [ ] Database models: `User`, `Role`, `Permission`, `UserRole`, `Challenge`, `ChallengeRule`, `AuditLog`.
- [ ] Alembic database migrations.
- [ ] JWT authentication with bcrypt/argon2, user registration & login.
- [ ] Role-Based Access Control (RBAC) middleware for `SUPER_ADMIN`, `TRADING_ADMIN`, `FINANCE_ADMIN`, etc.
- [ ] Frontend foundation: Next.js App Router (`apps/frontend`) with Tailwind CSS.
- [ ] Trader authentication UI: `/login`, `/register`.
- [ ] Challenge listing & selection UI: `/challenges`.
- [ ] Basic trader dashboard: `/dashboard`.
- [ ] Automated tests: Pytest for backend auth, RBAC, challenges, and models.
- [ ] Docker configuration: `docker-compose.yml` for PostgreSQL, Redis, backend, frontend.

### Phase 2: Website & Legal Compliance
- [ ] Marketing pages: Hero, Pricing, Rules, How It Works, FAQ, About, Contact.
- [ ] Legal compliance documents: Terms, Privacy, Risk Disclosure, Payout Policy, Restricted Countries.

### Phase 3: Challenge Engine
- [ ] Challenge configuration management.
- [ ] Challenge state transitions: `PENDING_PAYMENT` -> `ACTIVE` -> `TARGET_REACHED` -> `BREACHED` -> `PASSED`.

### Phase 4: Payments & Ledger
- [ ] `PaymentProvider` interface & `MockPaymentProvider`.
- [ ] Webhook receiver with HMAC signature verification and idempotency keys.
- [ ] Double-entry financial ledger.

### Phase 5: MT5 Simulated Account Integration
- [ ] `TradingAccountProvider` interface & `MockTradingAccountProvider`.
- [ ] Automated MT5 demo credential generation & trade synchronization worker.

### Phase 6: Server-Side Risk Engine
- [ ] Daily loss tracker (Equity-based & Balance-based methodologies).
- [ ] Trailing & Static Drawdown calculators.
- [ ] Minimum trading days validation & breach detection.

### Phase 7: Pass / Review Workflow
- [ ] Target reached lock.
- [ ] KYC requirement triggers & admin approval panel.

### Phase 8: Payouts & Solvency Engine
- [ ] Payout requests, calculation of eligible trader reward share (80/20, 90/10).
- [ ] Payout reserve validation against capital firewall.

### Phase 9: Certificate System
- [ ] Cryptographic certificate generation with SHA-256 hash.
- [ ] Public verification route `/verify/[certificateId]`.

### Phase 10: Real Trading & Trade Replication Layer
- [ ] `RealTradingProvider` abstraction & `MockRealTradingProvider`.
- [ ] Replication risk engine, position sizer, company P&L ledger.
- [ ] Admin Real-Trading control center (`/admin/real-trading`).

### Phase 11 & 12: Affiliates, Security & Launch
- [ ] Referral tracking, coupons, and comprehensive security testing.
