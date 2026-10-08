# MaxFunded Prop Firm — Production & Deployment Specification

Comprehensive operational guide for running, configuring, and deploying MaxFunded Prop Firm.

---

## 1. Quick Architecture Overview

* **Frontend**: Next.js 14 (App Router, Tailwind CSS, Framer Motion, TypeScript)
* **Backend**: FastAPI (Python 3.11+, Pydantic v2, SQLAlchemy 2.0 Async, Uvicorn)
* **Trading Engine**:
  * **Option C (Account Pool)**: Auto-assigns pre-generated broker demo accounts (RoboForex, IC Markets, etc.) on payment confirmation.
  * **MT5 Bridge & EA**: Ingests real-time deal executions and floating equity ticks; automatically disables trading on MT5 upon breach.
* **Payment Gateways**:
  * **NowPayments**: Instant USDT / crypto payments with automated IPN webhooks.
  * **Bank Wire Transfer**: International SWIFT & local bank transfers with admin confirmation.
* **Transactional Email**: Async SMTP service with dark-mode neon HTML templates for credential delivery, breach alerts, and phase pass notifications.

---

## 2. Environment Configuration (`backend/.env`)

Copy `backend/.env.example` to `backend/.env` and configure:

```env
ENVIRONMENT=production
APP_NAME="MaxFunded Prop Firm"
SECRET_KEY=generate-a-random-64-character-secret-key-here!
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# Database (PostgreSQL for cloud, or SQLite for local)
DATABASE_URL=postgresql+asyncpg://postgres:yourpassword@postgres:5432/maxfunded_prop
DATABASE_URL_SYNC=postgresql://postgres:yourpassword@postgres:5432/maxfunded_prop
REDIS_URL=redis://redis:6379/0

# URLs
FRONTEND_URL=https://maxfunded.com
BACKEND_URL=https://api.maxfunded.com

# NowPayments (Crypto)
NOWPAYMENTS_API_KEY=your_live_nowpayments_api_key
NOWPAYMENTS_IPN_SECRET=your_live_nowpayments_ipn_secret
NOWPAYMENTS_SANDBOX=false

# Bank Wire Details
BANK_TRANSFER_ENABLED=true
BANK_NAME="Standard Chartered / Zenith Bank"
BANK_ACCOUNT_NAME="MaxFunded Technologies Ltd"
BANK_ACCOUNT_NUMBER="1018942351"
BANK_SWIFT_BIC="SCBLNGLA"
BANK_CURRENCY=USD

# Email / SMTP (Choose one free provider)
# Brevo (300/day free): smtp-relay.brevo.com:587
# Gmail (500/day free): smtp.gmail.com:587 with App Password
# Resend (3,000/mo free): smtp.resend.com:465
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_USER=your_smtp_login
SMTP_PASSWORD=your_smtp_password
SMTP_FROM_EMAIL=support@maxfunded.com
SMTP_FROM_NAME="MaxFunded Prop Firm"
SMTP_TLS=true

# MT5 Trading Engine
MT5_CHALLENGE_SERVER=MaxFunded-Server1
MT5_LIVE_SERVER=MaxFunded-Live1
MT5_BRIDGE_SECRET=generate-a-random-32-char-bridge-secret
```

---

## 3. Docker Compose Deployment

Run the complete stack with a single command:

```bash
# Build and start all 4 services (Postgres, Redis, Backend, Frontend)
docker compose up -d --build

# View logs
docker compose logs -f backend
docker compose logs -f frontend

# Stop all services
docker compose down
```

Services exposed:
* **Frontend**: `http://localhost:3000` (Reverse-proxy with Nginx/Cloudflare to your domain)
* **Backend API**: `http://localhost:8000` (API documentation at `/docs`)

---

## 4. Operational Runbook

### Seeding MT5 Pool Accounts
```bash
# Seed 9 starter accounts across 5 tiers ($10k, $25k, $50k, $100k, $200k)
python scripts/seed_account_pool.py
```

### Adding New Accounts via Admin UI
1. Navigate to `https://maxfunded.com/admin/pool`
2. Click **+ Add Account**
3. Enter broker (`RoboForex`), server (`RoboForex-Demo`), tier, login ID, and master password.
4. Accounts are claimed automatically as traders buy challenges.

### Running End-to-End QA Simulation
```bash
python scripts/simulate_trader_lifecycle.py
```
Tests:
* Challenge purchase $\rightarrow$ Pool claim $\rightarrow$ Email dispatch
* Trade executions $\rightarrow$ Profit target achieved $\rightarrow$ Phase passed notification
* Floating loss equity tick $\rightarrow$ Drawdown breach $\rightarrow$ Trading disabled & breach alert

---

## 5. Security & Risk Checklist Before Public Launch

- [ ] Change `SECRET_KEY` in `backend/.env` to a high-entropy 64-char key.
- [ ] Set `NOWPAYMENTS_SANDBOX=false` and insert production NowPayments API key and IPN secret.
- [ ] Connect transactional SMTP credentials (Brevo, Gmail, or Resend).
- [ ] Stock MT5 Account Pool with real demo accounts on `/admin/pool`.
- [ ] Attach MT5 Expert Advisor (`backend/docs/MaxFunded_Bridge_EA.mq5`) to terminal for trade reporting.
- [ ] Configure SSL certificates via Cloudflare or Certbot (Let's Encrypt).
