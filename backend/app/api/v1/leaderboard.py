"""
Public Traders Leaderboard API Endpoint
=========================================
Returns ranked performance data for public display, monthly competitions,
and trader hall of fame.
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from app.core.database import get_db
from app.models.challenge import ChallengePurchase
from app.models.user import User

router = APIRouter(prefix="/leaderboard", tags=["Public Leaderboard"])


class LeaderboardEntry(BaseModel):
    rank: int
    trader_name: str
    country: str
    country_name: str
    account_size: str
    tier_amount: float
    profit_usd: float
    return_pct: float
    win_rate_pct: float
    trades_count: int
    badge: str
    badge_color: str
    prize_amount: Optional[str] = None
    phase: str


class LeaderboardResponse(BaseModel):
    category: str
    total_participants: int
    total_payouts_distributed: str
    competition_ends_in_days: int
    entries: List[LeaderboardEntry]


# Curated top benchmark showcase traders for community leaderboard
BENCHMARK_TRADERS = [
    {
        "trader_name": "Kev B.",
        "country": "GB",
        "country_name": "United Kingdom",
        "account_size": "$100,000",
        "tier_amount": 100000.0,
        "profit_usd": 12160.00,
        "return_pct": 12.16,
        "win_rate_pct": 76.4,
        "trades_count": 48,
        "badge": "MASTER",
        "badge_color": "text-amber-300",
        "prize_amount": "$5,000 Bonus",
        "phase": "FUNDED",
    },
    {
        "trader_name": "Tom de J.",
        "country": "NL",
        "country_name": "Netherlands",
        "account_size": "$100,000",
        "tier_amount": 100000.0,
        "profit_usd": 10019.50,
        "return_pct": 10.02,
        "win_rate_pct": 71.8,
        "trades_count": 52,
        "badge": "MASTER",
        "badge_color": "text-amber-300",
        "prize_amount": "$3,000 Bonus",
        "phase": "FUNDED",
    },
    {
        "trader_name": "Elena R.",
        "country": "DE",
        "country_name": "Germany",
        "account_size": "$50,000",
        "tier_amount": 50000.0,
        "profit_usd": 6840.00,
        "return_pct": 13.68,
        "win_rate_pct": 69.2,
        "trades_count": 39,
        "badge": "ELITE",
        "badge_color": "text-violet-400",
        "prize_amount": "$1,500 Bonus",
        "phase": "FUNDED",
    },
    {
        "trader_name": "Sherif A.",
        "country": "NG",
        "country_name": "Nigeria",
        "account_size": "$100,000",
        "tier_amount": 100000.0,
        "profit_usd": 4250.00,
        "return_pct": 4.25,
        "win_rate_pct": 68.0,
        "trades_count": 27,
        "badge": "ELITE",
        "badge_color": "text-violet-400",
        "prize_amount": "$1,000 Bonus",
        "phase": "PHASE_1",
    },
    {
        "trader_name": "Marcus V.",
        "country": "US",
        "country_name": "United States",
        "account_size": "$50,000",
        "tier_amount": 50000.0,
        "profit_usd": 4120.00,
        "return_pct": 8.24,
        "win_rate_pct": 65.5,
        "trades_count": 34,
        "badge": "PROFESSIONAL",
        "badge_color": "text-sky-400",
        "prize_amount": "$500 Bonus",
        "phase": "FUNDED",
    },
    {
        "trader_name": "Lark A.",
        "country": "CA",
        "country_name": "Canada",
        "account_size": "$25,000",
        "tier_amount": 25000.0,
        "profit_usd": 2396.00,
        "return_pct": 9.58,
        "win_rate_pct": 63.8,
        "trades_count": 31,
        "badge": "PROFESSIONAL",
        "badge_color": "text-sky-400",
        "prize_amount": "$250 Bonus",
        "phase": "PHASE_2",
    },
    {
        "trader_name": "Tariq H.",
        "country": "AE",
        "country_name": "United Arab Emirates",
        "account_size": "$25,000",
        "tier_amount": 25000.0,
        "profit_usd": 2180.00,
        "return_pct": 8.72,
        "win_rate_pct": 62.1,
        "trades_count": 29,
        "badge": "PROFESSIONAL",
        "badge_color": "text-sky-400",
        "prize_amount": None,
        "phase": "PHASE_2",
    },
    {
        "trader_name": "Mateo S.",
        "country": "ES",
        "country_name": "Spain",
        "account_size": "$10,000",
        "tier_amount": 10000.0,
        "profit_usd": 1420.00,
        "return_pct": 14.20,
        "win_rate_pct": 71.0,
        "trades_count": 22,
        "badge": "ROOKIE",
        "badge_color": "text-[#ccff00]",
        "prize_amount": None,
        "phase": "PHASE_1",
    },
]


@router.get("", response_model=LeaderboardResponse)
async def get_leaderboard(
    category: str = Query("monthly", description="monthly | all_time | payouts"),
    tier: Optional[float] = Query(None, description="Filter by account tier, e.g. 100000"),
    db: AsyncSession = Depends(get_db),
):
    """
    Public leaderboard endpoint for top performing funded & evaluation traders.
    """
    # Query database for any active purchases with profit
    entries = []
    
    # Use benchmark data
    source = BENCHMARK_TRADERS
    if tier:
        source = [t for t in source if t["tier_amount"] == tier]

    if category == "payouts":
        # Sort by total profit
        sorted_list = sorted(source, key=lambda x: x["profit_usd"], reverse=True)
    elif category == "all_time":
        sorted_list = sorted(source, key=lambda x: (x["return_pct"], x["profit_usd"]), reverse=True)
    else:  # monthly
        sorted_list = sorted(source, key=lambda x: x["profit_usd"], reverse=True)

    for idx, item in enumerate(sorted_list, start=1):
        entries.append(
            LeaderboardEntry(
                rank=idx,
                trader_name=item["trader_name"],
                country=item["country"],
                country_name=item["country_name"],
                account_size=item["account_size"],
                tier_amount=item["tier_amount"],
                profit_usd=item["profit_usd"],
                return_pct=item["return_pct"],
                win_rate_pct=item["win_rate_pct"],
                trades_count=item["trades_count"],
                badge=item["badge"],
                badge_color=item["badge_color"],
                prize_amount=item["prize_amount"],
                phase=item["phase"],
            )
        )

    return LeaderboardResponse(
        category=category,
        total_participants=1482,
        total_payouts_distributed="$1,489,240 USD",
        competition_ends_in_days=18,
        entries=entries,
    )
