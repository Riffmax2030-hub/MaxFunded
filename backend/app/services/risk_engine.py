import datetime
from decimal import Decimal
from typing import Dict, Any, Optional
from dataclasses import dataclass
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.challenge import Challenge, ChallengeRule, ChallengePurchase, PurchaseStatus
from app.models.trading import DailySnapshot, BreachLog
from app.models.audit import AuditLog


@dataclass
class EvaluationResult:
    status: str
    is_breached: bool
    is_passed: bool
    breach_rule: Optional[str] = None
    breach_message: Optional[str] = None
    current_equity: float = 0.0
    current_balance: float = 0.0
    daily_loss_remaining: float = 0.0
    max_drawdown_remaining: float = 0.0
    profit_target_distance: float = 0.0
    profit_target_reached: bool = False
    trading_days_completed: int = 0
    trading_days_required: int = 5


class DeterministicRiskEngine:
    """
    Deterministic Server-Side Risk Engine.
    Evaluates trading activity against mathematical evaluation rules:
    - Maximum Daily Loss limit
    - Maximum Total Drawdown (Static and Trailing HWM)
    - Profit Target achievement
    - Minimum Trading Days verification
    - Lifecycle State transitions
    """

    @classmethod
    async def evaluate_account(
        cls,
        purchase: ChallengePurchase,
        challenge: Challenge,
        rules: ChallengeRule,
        db: AsyncSession,
    ) -> EvaluationResult:
        """
        Runs a comprehensive risk evaluation tick on a trading account.
        Updates state and records breach or passing milestones if triggered.
        """
        current_eq = Decimal(str(purchase.current_equity))
        current_bal = Decimal(str(purchase.current_balance))
        starting_bal = Decimal(str(challenge.starting_balance))

        # Update High Water Mark
        if current_eq > purchase.high_water_mark:
            purchase.high_water_mark = current_eq

        # If already breached or in terminal state, don't re-evaluate
        if purchase.status in (PurchaseStatus.BREACHED.value, PurchaseStatus.CLOSED.value):
            return cls._build_result(purchase, challenge, rules, is_breached=True, is_passed=False)

        # -------------------------------------------------------------
        # 1. MAX DAILY LOSS EVALUATION
        # -------------------------------------------------------------
        daily_ref = Decimal(str(purchase.daily_starting_equity or starting_bal))
        if rules.daily_loss_methodology == "STARTING_BALANCE":
            daily_ref = Decimal(str(purchase.current_balance))

        daily_loss_pct = Decimal(str(rules.max_daily_loss_percentage)) / Decimal("100")
        max_daily_loss_amount = daily_ref * daily_loss_pct
        daily_loss_floor = daily_ref - max_daily_loss_amount

        if current_eq < daily_loss_floor:
            # Trigger MAX DAILY LOSS breach
            breach_msg = (
                f"Maximum Daily Loss breached. Account equity fell to ${current_eq:,.2f}, "
                f"below allowed daily floor of ${daily_loss_floor:,.2f}."
            )
            purchase.status = PurchaseStatus.BREACHED.value
            purchase.breached_reason = breach_msg
            purchase.breached_at = datetime.datetime.now(datetime.timezone.utc)

            breach_log = BreachLog(
                purchase_id=purchase.id,
                rule_name="MAX_DAILY_LOSS",
                breached_value=current_eq,
                threshold_value=daily_loss_floor,
                details=breach_msg,
                timestamp=datetime.datetime.now(datetime.timezone.utc),
            )
            db.add(breach_log)

            audit = AuditLog(
                action="RULE_BREACH_MAX_DAILY_LOSS",
                actor_id=purchase.user_id,
                target_type="CHALLENGE_PURCHASE",
                target_id=purchase.id,
                new_value=breach_msg,
            )
            db.add(audit)

            return cls._build_result(
                purchase,
                challenge,
                rules,
                is_breached=True,
                is_passed=False,
                breach_rule="MAX_DAILY_LOSS",
                breach_msg=breach_msg,
            )

        # -------------------------------------------------------------
        # 2. MAX DRAWDOWN EVALUATION
        # -------------------------------------------------------------
        max_dd_pct = Decimal(str(rules.max_drawdown_percentage)) / Decimal("100")

        if rules.drawdown_methodology == "TRAILING_EQUITY":
            hwm = Decimal(str(purchase.high_water_mark))
            max_dd_amount = hwm * max_dd_pct
            dd_floor = hwm - max_dd_amount
        else:
            # STATIC methodology: based on initial challenge starting balance
            max_dd_amount = starting_bal * max_dd_pct
            dd_floor = starting_bal - max_dd_amount

        if current_eq < dd_floor:
            # Trigger MAX DRAWDOWN breach
            breach_msg = (
                f"Maximum Total Drawdown breached. Account equity fell to ${current_eq:,.2f}, "
                f"below allowed drawdown floor of ${dd_floor:,.2f}."
            )
            purchase.status = PurchaseStatus.BREACHED.value
            purchase.breached_reason = breach_msg
            purchase.breached_at = datetime.datetime.now(datetime.timezone.utc)

            breach_log = BreachLog(
                purchase_id=purchase.id,
                rule_name="MAX_DRAWDOWN",
                breached_value=current_eq,
                threshold_value=dd_floor,
                details=breach_msg,
                timestamp=datetime.datetime.now(datetime.timezone.utc),
            )
            db.add(breach_log)

            audit = AuditLog(
                action="RULE_BREACH_MAX_DRAWDOWN",
                actor_id=purchase.user_id,
                target_type="CHALLENGE_PURCHASE",
                target_id=purchase.id,
                new_value=breach_msg,
            )
            db.add(audit)

            return cls._build_result(
                purchase,
                challenge,
                rules,
                is_breached=True,
                is_passed=False,
                breach_rule="MAX_DRAWDOWN",
                breach_msg=breach_msg,
            )

        # -------------------------------------------------------------
        # 3. PROFIT TARGET & PASSING EVALUATION
        # -------------------------------------------------------------
        target_pct = Decimal(str(rules.profit_target_percentage)) / Decimal("100")
        target_amount = starting_bal * (Decimal("1") + target_pct)
        target_reached = current_eq >= target_amount

        if target_reached:
            # Check minimum trading days requirement
            if purchase.trading_days_count >= rules.min_trading_days:
                if purchase.status != PurchaseStatus.TARGET_REACHED.value and purchase.status != PurchaseStatus.PASSED.value:
                    purchase.status = PurchaseStatus.TARGET_REACHED.value
                    purchase.passed_at = datetime.datetime.now(datetime.timezone.utc)

                    audit = AuditLog(
                        action="CHALLENGE_TARGET_REACHED",
                        actor_id=purchase.user_id,
                        target_type="CHALLENGE_PURCHASE",
                        target_id=purchase.id,
                        new_value=f"Target reached: Equity ${current_eq:,.2f} >= ${target_amount:,.2f} with {purchase.trading_days_count} trading days.",
                    )
                    db.add(audit)

                return cls._build_result(
                    purchase, challenge, rules, is_breached=False, is_passed=True
                )

        return cls._build_result(
            purchase,
            challenge,
            rules,
            is_breached=False,
            is_passed=False,
            profit_target_reached=target_reached,
        )

    @classmethod
    def _build_result(
        cls,
        purchase: ChallengePurchase,
        challenge: Challenge,
        rules: ChallengeRule,
        is_breached: bool = False,
        is_passed: bool = False,
        breach_rule: Optional[str] = None,
        breach_msg: Optional[str] = None,
        profit_target_reached: bool = False,
    ) -> EvaluationResult:
        current_eq = float(purchase.current_equity)
        current_bal = float(purchase.current_balance)
        starting_bal = float(challenge.starting_balance)
        daily_ref = float(purchase.daily_starting_equity or challenge.starting_balance)

        # Daily loss calculations
        daily_limit = daily_ref * (float(rules.max_daily_loss_percentage) / 100.0)
        daily_floor = daily_ref - daily_limit
        daily_loss_remaining = max(0.0, current_eq - daily_floor)

        # Drawdown calculations
        dd_limit = starting_bal * (float(rules.max_drawdown_percentage) / 100.0)
        if rules.drawdown_methodology == "TRAILING_EQUITY":
            hwm = float(purchase.high_water_mark)
            dd_floor = hwm - (hwm * (float(rules.max_drawdown_percentage) / 100.0))
        else:
            dd_floor = starting_bal - dd_limit
        max_dd_remaining = max(0.0, current_eq - dd_floor)

        # Target distance
        target_amount = starting_bal * (1.0 + float(rules.profit_target_percentage) / 100.0)
        target_distance = max(0.0, target_amount - current_eq)

        return EvaluationResult(
            status=purchase.status,
            is_breached=is_breached,
            is_passed=is_passed,
            breach_rule=breach_rule,
            breach_message=breach_msg,
            current_equity=current_eq,
            current_balance=current_bal,
            daily_loss_remaining=round(daily_loss_remaining, 2),
            max_drawdown_remaining=round(max_dd_remaining, 2),
            profit_target_distance=round(target_distance, 2),
            profit_target_reached=profit_target_reached,
            trading_days_completed=purchase.trading_days_count,
            trading_days_required=rules.min_trading_days,
        )


risk_engine = DeterministicRiskEngine()
