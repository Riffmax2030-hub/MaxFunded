# RiffMax Funding — Environment Specification

## System & Host Environment (Inspected 2026-09-26)

- **Operating System**: Windows 11 / Windows Server
- **Python Runtime**: Python 3.13.14 (Path: Python Software Foundation distribution)
- **Node.js Runtime**: v24.15.0
- **Package Manager (NPM)**: 11.13.0
- **Git**: Initialized, Remote: `https://github.com/Riffmax-Technologies/PROP-FIRM.git`
- **Docker**: Optional / Containerization files provided (`Dockerfile`, `docker-compose.yml`)
- **Database Engine**: PostgreSQL 16 (Local/Docker), SQLite support available for zero-dependency local testing.
- **Cache / Message Broker**: Redis 7 (Local/Docker), in-memory fallback for local unit test runner.

---

## Required Environment Variables

```env
# Application Settings
ENVIRONMENT=development
APP_NAME="RiffMax Funding"
APP_URL=http://localhost:3000
API_URL=http://localhost:8000/api/v1
SECRET_KEY=riffmax-super-secret-dev-key-change-in-production-min-32-chars
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
REFRESH_TOKEN_EXPIRE_DAYS=7

# Database Connection
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/riffmax_prop
DATABASE_URL_SYNC=postgresql://postgres:postgres@localhost:5432/riffmax_prop
TEST_DATABASE_URL=sqlite+aiosqlite:///./test.db

# Redis Connection
REDIS_URL=redis://localhost:6379/0

# Capital & Currency Configuration
DEFAULT_CURRENCY=USD
SUPPORTED_CURRENCIES=["USD", "EUR", "GBP", "NGN", "AED"]

# Compliance & Country Restrictions (ISO 3166-1 alpha-2)
SUPPORTED_COUNTRIES=["US", "GB", "CA", "DE", "FR", "NG", "ZA", "AE", "SG", "AU"]
RESTRICTED_COUNTRIES=["IR", "KP", "SY", "CU", "RU", "BY"]
KYC_REQUIRED_COUNTRIES=["US", "NG", "GB"]

# Real Trading Safety Switch (Disabled by default until legal/compliance sign-off)
REAL_TRADING_ENABLED=false
REAL_TRADING_MAX_CAPITAL=100000.00
REAL_TRADING_CIRCUIT_BREAKER_MAX_DD=5.0
```
