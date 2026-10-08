import uuid
from decimal import Decimal
from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.config import settings
from app.core.database import get_db
from app.core.rbac import get_current_user, require_roles, RoleName
from app.models.audit import AuditLog
from app.models.challenge import Challenge, ChallengePurchase, PurchaseStatus
from app.models.payment import Payment, PaymentProvider, PaymentStatus
from app.models.user import User
from app.payments.base import PaymentInitResult
from app.payments.factory import payment_factory
from app.services.provisioning import provisioning_service
from app.services.email_service import email_service
from app.schemas.payment import (
    BankDetailsSchema,
    BankTransferConfirmRequest,
    PaymentInitiateRequest,
    PaymentInitiateResponse,
    PaymentStatusResponse,
)

router = APIRouter()


@router.get("/methods", response_model=List[dict])
async def get_payment_methods(
    current_user: User = Depends(get_current_user),
):
    """Returns available payment methods tailored to the current user's country."""
    return payment_factory.get_available_methods(country_code=current_user.country)


@router.post("/initiate", response_model=PaymentInitiateResponse)
async def initiate_payment(
    payload: PaymentInitiateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Creates a pending purchase and initiates payment with the selected global provider.
    Supports cards (Stripe, Flutterwave, Paystack), PayPal, Crypto (NowPayments), and Bank Transfer.
    """
    # 1. Fetch challenge
    stmt = select(Challenge).where(Challenge.id == payload.challenge_id, Challenge.is_active == True)
    res = await db.execute(stmt)
    challenge = res.scalar_one_or_none()
    if not challenge:
        raise HTTPException(status_code=404, detail="Challenge not found or inactive")

    # 2. Create pending challenge purchase
    purchase = ChallengePurchase(
        user_id=current_user.id,
        challenge_id=challenge.id,
        purchase_price=challenge.price,
        currency=payload.currency or challenge.currency,
        status=PurchaseStatus.PENDING_PAYMENT,
    )
    db.add(purchase)
    await db.flush()  # Generate purchase.id

    # 3. Create initial Payment attempt record
    payment_id = str(uuid.uuid4())
    payment = Payment(
        id=payment_id,
        user_id=current_user.id,
        purchase_id=purchase.id,
        provider=payload.provider,
        amount=challenge.price,
        currency=payload.currency or challenge.currency,
        status=PaymentStatus.PENDING,
        provider_metadata={},
    )
    db.add(payment)
    await db.flush()

    # 4. Resolve provider and initiate
    provider = payment_factory.get_provider(payload.provider.value)
    success_url = payload.success_url or f"{settings.FRONTEND_URL}/checkout/success"
    cancel_url = payload.cancel_url or f"{settings.FRONTEND_URL}/challenges"
    webhook_url = f"{settings.BACKEND_URL}{settings.API_V1_STR}/payments/webhook/{provider.name}"

    try:
        if provider.is_configured():
            init_res: PaymentInitResult = await provider.initiate_payment(
                amount=float(challenge.price),
                currency=payload.currency or challenge.currency,
                description=f"{settings.APP_NAME} - {challenge.name} (${float(challenge.starting_balance):,.0f})",
                customer_email=current_user.email,
                payment_id=payment_id,
                success_url=success_url,
                cancel_url=cancel_url,
                webhook_url=webhook_url,
            )
        else:
            # Fallback/Mock mode for development or unconfigured API keys
            if payload.provider == PaymentProvider.NOWPAYMENTS:
                init_res = PaymentInitResult(
                    provider_reference=f"MOCK-NP-{payment_id[:8].upper()}",
                    crypto_address="TX9bV3B8m7YxZ98pP1wG4X8xYzMockTRC20Addr",
                    crypto_amount=float(challenge.price),
                    crypto_currency="USDT (TRC-20)",
                    qr_code_url=f"https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=TX9bV3B8m7YxZ98pP1wG4X8xYzMockTRC20Addr",
                )
            elif payload.provider == PaymentProvider.BANK_TRANSFER:
                ref_code = f"RMF-W-{payment_id[:8].upper()}"
                init_res = PaymentInitResult(
                    provider_reference=ref_code,
                    payment_reference_code=ref_code,
                    bank_details={
                        "bank_name": settings.BANK_NAME,
                        "account_name": settings.BANK_ACCOUNT_NAME,
                        "account_number": settings.BANK_ACCOUNT_NUMBER,
                        "swift_bic": settings.BANK_SWIFT_BIC,
                        "iban": settings.BANK_IBAN or "N/A",
                        "routing_number": settings.BANK_ROUTING or "N/A",
                        "currency": settings.BANK_CURRENCY,
                        "amount_expected": float(challenge.price),
                        "reference_code": ref_code,
                        "instructions": f"{settings.BANK_INSTRUCTIONS} (Your Reference: {ref_code})",
                    },
                )
            else:
                # Mock redirect URL for card / paypal sandbox
                init_res = PaymentInitResult(
                    provider_reference=f"MOCK-{payload.provider.value.upper()}-{payment_id[:8]}",
                    redirect_url=f"{success_url}?payment_id={payment_id}&mock=true",
                )
    except Exception as exc:
        payment.status = PaymentStatus.FAILED
        payment.provider_metadata = {"error": str(exc)}
        await db.commit()
        raise HTTPException(
            status_code=502,
            detail=f"Payment provider '{payload.provider.value}' initialization error: {str(exc)}",
        )

    # 5. Update payment record with provider result
    payment.provider_reference = init_res.provider_reference
    payment.provider_metadata = init_res.extra

    if payload.provider == PaymentProvider.NOWPAYMENTS:
        payment.crypto_address = init_res.crypto_address
        payment.crypto_amount = Decimal(str(init_res.crypto_amount)) if init_res.crypto_amount else None
        payment.crypto_currency = init_res.crypto_currency
    elif payload.provider == PaymentProvider.BANK_TRANSFER:
        payment.payment_reference_code = init_res.payment_reference_code
        payment.status = PaymentStatus.AWAITING_CONFIRMATION

    audit = AuditLog(
        action="PAYMENT_INITIATED",
        actor_id=current_user.id,
        actor_email=current_user.email,
        target_type="PAYMENT",
        target_id=payment.id,
        new_value=f"Provider: {payload.provider.value}, Purchase: {purchase.id}, Amount: {float(challenge.price)}",
    )
    db.add(audit)
    await db.commit()

    bank_details_obj = None
    if init_res.bank_details:
        bank_details_obj = BankDetailsSchema(**init_res.bank_details)

    return PaymentInitiateResponse(
        payment_id=payment.id,
        purchase_id=purchase.id,
        provider=payment.provider,
        status=payment.status,
        amount=float(payment.amount),
        currency=payment.currency,
        redirect_url=init_res.redirect_url,
        crypto_address=init_res.crypto_address,
        crypto_amount=init_res.crypto_amount,
        crypto_currency=init_res.crypto_currency,
        qr_code_url=init_res.qr_code_url,
        payment_reference_code=init_res.payment_reference_code,
        bank_details=bank_details_obj,
    )


@router.get("/{payment_id}/status", response_model=PaymentStatusResponse)
async def get_payment_status(
    payment_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Returns the current status of a payment attempt."""
    stmt = select(Payment).where(Payment.id == payment_id)
    res = await db.execute(stmt)
    payment = res.scalar_one_or_none()

    if not payment:
        raise HTTPException(status_code=404, detail="Payment record not found")

    # Non-admin users can only check their own payments
    if payment.user_id != current_user.id and current_user.role != RoleName.SUPER_ADMIN:
        raise HTTPException(status_code=403, detail="Forbidden")

    return PaymentStatusResponse(
        id=payment.id,
        purchase_id=payment.purchase_id,
        provider=payment.provider,
        status=payment.status,
        amount=float(payment.amount),
        currency=payment.currency,
        crypto_address=payment.crypto_address,
        crypto_amount=float(payment.crypto_amount) if payment.crypto_amount else None,
        crypto_currency=payment.crypto_currency,
        payment_reference_code=payment.payment_reference_code,
        created_at=payment.created_at,
        updated_at=payment.updated_at,
    )


@router.post("/webhook/{provider_name}")
async def payment_webhook(
    provider_name: str,
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    """
    Public webhook receiver for payment gateways (Stripe, PayPal, Flutterwave, Paystack, NowPayments).
    Verifies signature and auto-activates the challenge on completion.
    """
    try:
        provider = payment_factory.get_provider(provider_name)
    except ValueError:
        raise HTTPException(status_code=400, detail="Unknown provider")

    body_bytes = await request.body()
    headers_dict = dict(request.headers)

    try:
        event = await provider.verify_webhook(payload=body_bytes, headers=headers_dict)
    except Exception as exc:
        raise HTTPException(status_code=400, detail=f"Webhook verification failed: {str(exc)}")

    # Locate payment by provider_reference
    stmt = (
        select(Payment)
        .options(selectinload(Payment.purchase))
        .where(Payment.provider_reference == event.provider_reference)
    )
    res = await db.execute(stmt)
    payment = res.scalar_one_or_none()

    if not payment:
        # Check if reference is in metadata
        stmt = (
            select(Payment)
            .options(selectinload(Payment.purchase))
            .where(Payment.id == event.provider_reference)
        )
        res = await db.execute(stmt)
        payment = res.scalar_one_or_none()

    if not payment:
        return {"status": "ignored", "reason": "payment_reference_not_found"}

    if event.status == "completed" and payment.status != PaymentStatus.COMPLETED:
        payment.status = PaymentStatus.COMPLETED
        payment.provider_metadata = {**payment.provider_metadata, "webhook": event.raw}

        if payment.purchase:
            ch_stmt = select(Challenge).where(Challenge.id == payment.purchase.challenge_id)
            ch_res = await db.execute(ch_stmt)
            challenge_obj = ch_res.scalar_one_or_none()
            if challenge_obj:
                await provisioning_service.provision_account(payment.purchase, challenge_obj, db)

                # Fetch trader info and dispatch credentials email
                user_stmt = select(User).where(User.id == payment.user_id)
                user_res = await db.execute(user_stmt)
                trader_user = user_res.scalar_one_or_none()
                if trader_user:
                    try:
                        await email_service.send_credentials_email(
                            to_email=trader_user.email,
                            trader_name=trader_user.full_name or trader_user.email.split("@")[0],
                            challenge_name=challenge_obj.name,
                            starting_balance=float(challenge_obj.starting_balance),
                            mt5_login=payment.purchase.mt5_login,
                            mt5_password=payment.purchase.mt5_password,
                            mt5_investor_password=payment.purchase.mt5_investor_password or "",
                            mt5_server=payment.purchase.mt5_server,
                        )
                    except Exception as err:
                        # Email failures should never roll back database transaction
                        pass
            else:
                payment.purchase.status = PurchaseStatus.ACTIVE

        audit = AuditLog(
            action="PAYMENT_COMPLETED_VIA_WEBHOOK",
            actor_id=payment.user_id,
            target_type="PAYMENT",
            target_id=payment.id,
            new_value=f"Provider: {provider_name}, Amount: {event.amount}, Currency: {event.currency}",
        )
        db.add(audit)
        await db.commit()

    elif event.status == "failed":
        payment.status = PaymentStatus.FAILED
        await db.commit()

    return {"status": "ok", "payment_status": payment.status.value}


@router.post("/admin/{payment_id}/confirm-bank-transfer", response_model=PaymentStatusResponse)
async def confirm_bank_transfer(
    payment_id: str,
    payload: BankTransferConfirmRequest,
    current_admin: User = Depends(require_roles([RoleName.SUPER_ADMIN, RoleName.FINANCE_ADMIN])),
    db: AsyncSession = Depends(get_db),
):
    """
    Administrative endpoint for Finance Admin / Super Admin to manually confirm
    incoming wire/bank transfer payments and instantly activate the trader's challenge.
    """
    stmt = (
        select(Payment)
        .options(selectinload(Payment.purchase))
        .where(Payment.id == payment_id)
    )
    res = await db.execute(stmt)
    payment = res.scalar_one_or_none()

    if not payment:
        raise HTTPException(status_code=404, detail="Payment record not found")

    if payment.provider != PaymentProvider.BANK_TRANSFER:
        raise HTTPException(status_code=400, detail="Only bank transfer payments can be manually confirmed")

    payment.status = PaymentStatus.COMPLETED
    payment.confirmed_by = current_admin.id
    payment.admin_notes = payload.admin_notes

    if payment.purchase:
        ch_stmt = select(Challenge).where(Challenge.id == payment.purchase.challenge_id)
        ch_res = await db.execute(ch_stmt)
        challenge_obj = ch_res.scalar_one_or_none()
        if challenge_obj:
            await provisioning_service.provision_account(payment.purchase, challenge_obj, db)

            # Fetch trader info and dispatch credentials email
            user_stmt = select(User).where(User.id == payment.user_id)
            user_res = await db.execute(user_stmt)
            trader_user = user_res.scalar_one_or_none()
            if trader_user:
                try:
                    await email_service.send_credentials_email(
                        to_email=trader_user.email,
                        trader_name=trader_user.full_name or trader_user.email.split("@")[0],
                        challenge_name=challenge_obj.name,
                        starting_balance=float(challenge_obj.starting_balance),
                        mt5_login=payment.purchase.mt5_login,
                        mt5_password=payment.purchase.mt5_password,
                        mt5_investor_password=payment.purchase.mt5_investor_password or "",
                        mt5_server=payment.purchase.mt5_server,
                    )
                except Exception as err:
                    pass
        else:
            payment.purchase.status = PurchaseStatus.ACTIVE

    audit = AuditLog(
        action="BANK_TRANSFER_CONFIRMED",
        actor_id=current_admin.id,
        actor_email=current_admin.email,
        target_type="PAYMENT",
        target_id=payment.id,
        reason=payload.admin_notes,
        new_value=f"Purchase: {payment.purchase_id}, Amount: {float(payment.amount)}",
    )
    db.add(audit)
    await db.commit()
    await db.refresh(payment)

    return PaymentStatusResponse(
        id=payment.id,
        purchase_id=payment.purchase_id,
        provider=payment.provider,
        status=payment.status,
        amount=float(payment.amount),
        currency=payment.currency,
        crypto_address=payment.crypto_address,
        crypto_amount=float(payment.crypto_amount) if payment.crypto_amount else None,
        crypto_currency=payment.crypto_currency,
        payment_reference_code=payment.payment_reference_code,
        created_at=payment.created_at,
        updated_at=payment.updated_at,
    )
