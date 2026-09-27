from fastapi import APIRouter
from app.api.v1 import auth, users, challenges, admin, payments, trading, company_capital, kyc, payouts, dashboard, certificates, affiliates, notifications, system, ws

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(users.router, prefix="/users", tags=["Users"])
api_router.include_router(challenges.router, prefix="/challenges", tags=["Challenges"])
api_router.include_router(payments.router, prefix="/payments", tags=["Payments"])
api_router.include_router(trading.router, prefix="/trading", tags=["Trading & Risk Engine"])
api_router.include_router(admin.router, prefix="/admin", tags=["Admin Control"])
api_router.include_router(
    company_capital.router,
    prefix="/capital",
    tags=["Company Capital (Admin Only)"],
)
api_router.include_router(
    kyc.router,
    prefix="/kyc",
    tags=["KYC & AML Compliance"],
)
api_router.include_router(
    payouts.router,
    prefix="/payouts",
    tags=["Trader Profit Payouts"],
)
api_router.include_router(
    dashboard.router,
    tags=["Trader Dashboard"],
)
api_router.include_router(
    certificates.router,
    tags=["Certificates & Verification"],
)
api_router.include_router(
    affiliates.router,
    tags=["Affiliate & Referral Network"],
)
api_router.include_router(
    notifications.router,
    tags=["Notifications & Alerts"],
)
api_router.include_router(
    system.router,
    tags=["System Health & Audit Logs"],
)
api_router.include_router(
    ws.router,
    tags=["WebSocket Real-time"],
)
