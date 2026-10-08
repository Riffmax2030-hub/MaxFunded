import datetime
from decimal import Decimal
from typing import Optional, List
from fastapi import HTTPException, status
from sqlalchemy import select, desc
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.user import User
from app.models.challenge import ChallengePurchase, Challenge, ChallengeRule, PurchaseStatus
from app.models.payout import PayoutRequest, PayoutStatus, PayoutMethod
from app.models.audit import AuditLog
from app.schemas.payout import (
    PayoutEligibilityResponse,
    PayoutRequestCreate,
    AdminPayoutReviewRequest,
)
from app.services.kyc_service import kyc_service
from app.services.email_service import email_service

MIN_PAYOUT_AMOUNT = Decimal("50.00")


class PayoutProcessingService:
    """
    Trader Profit Payout & Withdrawal Processing Service.
    Enforces KYC verification, calculates profit split percentages,
    locks trading account balances, and provides financial audit logs.
    """

    @classmethod
    async def check_eligibility(
        cls,
        purchase_id: str,
        user: User,
        db: AsyncSession,
    ) -> PayoutEligibilityResponse:
        """
        Calculates profit share eligibility for a trading evaluation account.
        Enforces KYC approval, positive profit over starting balance, and no open pending payouts.
        """
        stmt = (
            select(ChallengePurchase)
            .options(
                selectinload(ChallengePurchase.challenge).selectinload(Challenge.rules),
            )
            .where(ChallengePurchase.id == purchase_id)
        )
        res = await db.execute(stmt)
        purchase = res.scalar_one_or_none()

        if not purchase:
            raise HTTPException(status_code=404, detail="Trading account not found")

        if purchase.user_id != user.id and not user.is_admin:
            raise HTTPException(status_code=403, detail="Forbidden")

        rules: ChallengeRule = purchase.challenge.rules
        starting_bal = purchase.challenge.starting_balance
        curr_bal = purchase.current_balance
        curr_eq = purchase.current_equity

        # Profit calculation
        gross_profit = max(Decimal("0.00"), curr_bal - starting_bal)
        profit_split_pct = rules.profit_split_percentage if rules else Decimal("80.00")
        trader_amount = gross_profit * (profit_split_pct / Decimal("100.00"))
        company_fee_amount = gross_profit - trader_amount

        kyc_approved = (user.kyc_status == "APPROVED")

        reasons = []
        if not kyc_approved:
            reasons.append("Identity verification (KYC) must be approved before requesting payouts.")
        if purchase.status not in (PurchaseStatus.ACTIVE, "ACTIVE", PurchaseStatus.PASSED, "PASSED"):
            reasons.append(f"Account is in '{purchase.status}' state and not eligible for payouts.")
        if gross_profit < MIN_PAYOUT_AMOUNT:
            reasons.append(f"Net account profit (${gross_profit:.2f}) is below minimum payout threshold (${MIN_PAYOUT_AMOUNT:.2f}).")

        # Check if an existing open payout request exists for this account
        open_payout_stmt = select(PayoutRequest).where(
            PayoutRequest.purchase_id == purchase_id,
            PayoutRequest.status.in_([PayoutStatus.REQUESTED, PayoutStatus.UNDER_REVIEW, PayoutStatus.APPROVED, PayoutStatus.PROCESSING]),
        )
        open_payout_res = await db.execute(open_payout_stmt)
        existing_payout = open_payout_res.scalars().first()
        if existing_payout:
            reasons.append(f"An existing payout request ({existing_payout.id[:8]}...) is currently {existing_payout.status.value}.")

        is_eligible = len(reasons) == 0

        return PayoutEligibilityResponse(
            purchase_id=purchase.id,
            challenge_name=purchase.challenge.name,
            starting_balance=starting_bal,
            current_balance=curr_bal,
            current_equity=curr_eq,
            gross_profit=gross_profit,
            profit_split_percentage=profit_split_pct,
            eligible_trader_amount=round(trader_amount, 2),
            company_fee_amount=round(company_fee_amount, 2),
            kyc_approved=kyc_approved,
            is_eligible=is_eligible,
            ineligibility_reasons=reasons,
        )

    @classmethod
    async def request_payout(
        cls,
        user: User,
        payload: PayoutRequestCreate,
        db: AsyncSession,
    ) -> PayoutRequest:
        """
        Creates a profit payout request:
        - Strictly enforces KYC approval
        - Verifies eligible account profit
        - Deducts gross profit from trading account to prevent double withdrawal
        - Logs audit record
        """
        # 1. Enforce KYC
        kyc_service.enforce_kyc_approved(user)

        # 2. Check eligibility
        eligibility = await cls.check_eligibility(payload.purchase_id, user, db)
        if not eligibility.is_eligible:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Ineligible for payout: {'; '.join(eligibility.ineligibility_reasons)}",
            )

        # 3. Fetch purchase
        p_stmt = (
            select(ChallengePurchase)
            .options(selectinload(ChallengePurchase.challenge).selectinload(Challenge.rules))
            .where(ChallengePurchase.id == payload.purchase_id)
        )
        purchase = (await db.execute(p_stmt)).scalar_one()

        gross_profit = eligibility.gross_profit
        requested_gross = payload.amount if payload.amount else gross_profit

        if requested_gross > gross_profit:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Requested withdrawal amount (${requested_gross:.2f}) exceeds eligible profit (${gross_profit:.2f})",
            )

        profit_split_pct = eligibility.profit_split_percentage
        trader_amount = round(requested_gross * (profit_split_pct / Decimal("100.00")), 2)
        company_fee = round(requested_gross - trader_amount, 2)

        # 4. Lock trading account balance by deducting the withdrawn gross profit
        purchase.current_balance -= requested_gross
        purchase.current_equity -= requested_gross

        now = datetime.datetime.now(datetime.timezone.utc)
        payout = PayoutRequest(
            user_id=user.id,
            purchase_id=purchase.id,
            amount=requested_gross,
            trader_amount=trader_amount,
            company_fee_amount=company_fee,
            profit_split_percentage=profit_split_pct,
            currency="USD",
            method=payload.method,
            payout_details=payload.payout_details,
            status=PayoutStatus.REQUESTED,
            requested_at=now,
        )
        db.add(payout)

        audit = AuditLog(
            action="PAYOUT_REQUESTED",
            actor_id=user.id,
            actor_email=user.email,
            target_type="PAYOUT_REQUEST",
            target_id=purchase.id,
            new_value=f"Requested payout: ${trader_amount} net via {payload.method.value}. Trading balance reduced by ${requested_gross}",
        )
        db.add(audit)

        await db.commit()
        await db.refresh(payout)
        return payout

    @classmethod
    async def review_payout(
        cls,
        payout_id: str,
        reviewer: User,
        payload: AdminPayoutReviewRequest,
        db: AsyncSession,
    ) -> PayoutRequest:
        """
        Finance Administrator review & processing workflow.
        Handles transition to UNDER_REVIEW, APPROVED, PROCESSING, PAID, or REJECTED.
        If REJECTED, automatically restores deducted funds to the trading account.
        """
        stmt = (
            select(PayoutRequest)
            .options(
                selectinload(PayoutRequest.purchase),
                selectinload(PayoutRequest.user),
            )
            .where(PayoutRequest.id == payout_id)
        )
        res = await db.execute(stmt)
        payout = res.scalar_one_or_none()

        if not payout:
            raise HTTPException(status_code=404, detail="Payout request not found")

        prev_status = payout.status
        now = datetime.datetime.now(datetime.timezone.utc)

        # Rejection: Restore funds to trading account
        if payload.status == PayoutStatus.REJECTED and prev_status != PayoutStatus.REJECTED:
            if payout.purchase:
                payout.purchase.current_balance += payout.amount
                payout.purchase.current_equity += payout.amount
            payout.rejection_reason = payload.rejection_reason or "Declined by finance operations"

        # Paid: Record completion reference
        if payload.status == PayoutStatus.PAID:
            payout.processed_at = now
            if payload.tx_hash_or_reference:
                payout.tx_hash_or_reference = payload.tx_hash_or_reference

        payout.status = payload.status
        payout.reviewer_id = reviewer.id
        payout.reviewed_at = now
        payout.admin_notes = payload.admin_notes

        audit = AuditLog(
            action=f"PAYOUT_{payload.status.value}",
            actor_id=reviewer.id,
            actor_email=reviewer.email,
            target_type="PAYOUT_REQUEST",
            target_id=payout.id,
            previous_value=prev_status.value,
            new_value=f"Status: {payload.status.value}, TxRef: {payload.tx_hash_or_reference}",
            reason=payload.rejection_reason,
        )
        db.add(audit)

        await db.commit()
        await db.refresh(payout)

        # Dispatches email notification to trader
        if payout.user:
            try:
                trader_name = payout.user.full_name or payout.user.email.split("@")[0]
                if payload.status in [PayoutStatus.APPROVED, PayoutStatus.PAID]:
                    await email_service.send_payout_approved_email(
                        to_email=payout.user.email,
                        trader_name=trader_name,
                        amount_usd=float(payout.trader_amount),
                        method=payout.method.value,
                        reference=payout.tx_hash_or_reference or str(payout.id)[:8],
                    )
                elif payload.status == PayoutStatus.REJECTED:
                    await email_service.send_payout_rejected_email(
                        to_email=payout.user.email,
                        trader_name=trader_name,
                        amount_usd=float(payout.amount),
                        reason=payout.rejection_reason or "Verification check failed",
                    )
            except Exception:
                pass

        return payout

    @classmethod
    async def cancel_payout(
        cls,
        payout_id: str,
        user: User,
        db: AsyncSession,
    ) -> PayoutRequest:
        """
        Allows trader to cancel an unreviewed payout request.
        Restores deducted funds back to the trading account.
        """
        stmt = (
            select(PayoutRequest)
            .options(selectinload(PayoutRequest.purchase))
            .where(PayoutRequest.id == payout_id)
        )
        res = await db.execute(stmt)
        payout = res.scalar_one_or_none()

        if not payout:
            raise HTTPException(status_code=404, detail="Payout request not found")

        if payout.user_id != user.id and not user.is_admin:
            raise HTTPException(status_code=403, detail="Forbidden")

        if payout.status != PayoutStatus.REQUESTED:
            raise HTTPException(
                status_code=400,
                detail=f"Cannot cancel payout in '{payout.status.value}' state. Contact support.",
            )

        # Restore funds to trading account
        if payout.purchase:
            payout.purchase.current_balance += payout.amount
            payout.purchase.current_equity += payout.amount

        payout.status = PayoutStatus.CANCELLED
        now = datetime.datetime.now(datetime.timezone.utc)
        payout.reviewed_at = now

        audit = AuditLog(
            action="PAYOUT_CANCELLED",
            actor_id=user.id,
            actor_email=user.email,
            target_type="PAYOUT_REQUEST",
            target_id=payout.id,
            new_value=f"Cancelled by user. Restored ${payout.amount} to trading balance.",
        )
        db.add(audit)

        await db.commit()
        await db.refresh(payout)
        return payout


payout_service = PayoutProcessingService()
