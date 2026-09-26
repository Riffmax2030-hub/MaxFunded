from datetime import datetime
from decimal import Decimal
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict


class ChallengeRuleBase(BaseModel):
    profit_target_percentage: Decimal = Field(default=Decimal("10.00"), ge=1, le=100)
    max_daily_loss_percentage: Decimal = Field(default=Decimal("5.00"), ge=1, le=50)
    max_drawdown_percentage: Decimal = Field(default=Decimal("10.00"), ge=1, le=50)
    daily_loss_methodology: str = "STARTING_EQUITY"
    drawdown_methodology: str = "STATIC"
    min_trading_days: int = Field(default=5, ge=0)
    max_trading_days: Optional[int] = None
    leverage: int = Field(default=100, ge=1, le=500)
    profit_split_percentage: Decimal = Field(default=Decimal("80.00"), ge=50, le=100)
    weekend_trading_allowed: bool = True
    news_trading_allowed: bool = True
    ea_trading_allowed: bool = True
    copy_trading_allowed: bool = False
    stop_loss_required: bool = False


class ChallengeRuleCreate(ChallengeRuleBase):
    pass


class ChallengeRuleResponse(ChallengeRuleBase):
    id: str
    challenge_id: str

    model_config = ConfigDict(from_attributes=True)


class ChallengeBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    slug: str = Field(..., min_length=2, max_length=100)
    starting_balance: Decimal = Field(..., gt=0)
    price: Decimal = Field(..., gt=0)
    currency: str = Field(default="USD", min_length=3, max_length=3)
    description: Optional[str] = None
    is_active: bool = True


class ChallengeCreate(ChallengeBase):
    rules: ChallengeRuleCreate


class ChallengeUpdate(BaseModel):
    name: Optional[str] = None
    starting_balance: Optional[Decimal] = None
    price: Optional[Decimal] = None
    currency: Optional[str] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None
    rules: Optional[ChallengeRuleCreate] = None


class ChallengeResponse(ChallengeBase):
    id: str
    created_at: datetime
    updated_at: datetime
    rules: Optional[ChallengeRuleResponse] = None

    model_config = ConfigDict(from_attributes=True)


class ChallengePurchaseCreate(BaseModel):
    challenge_id: str


class ChallengePurchaseResponse(BaseModel):
    id: str
    user_id: str
    challenge_id: str
    status: str
    purchase_price: Decimal
    currency: str
    mt5_login: Optional[str] = None
    mt5_server: Optional[str] = None
    current_balance: Decimal
    current_equity: Decimal
    trading_days_count: int
    created_at: datetime
    challenge: Optional[ChallengeResponse] = None

    model_config = ConfigDict(from_attributes=True)
