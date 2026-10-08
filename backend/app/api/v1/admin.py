import json
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select, or_, func, desc
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.rbac import get_current_active_admin
from app.models.user import User
from app.models.challenge import Challenge, ChallengeRule, ChallengePurchase
from app.models.trading import MT5AccountPool
from app.models.audit import AuditLog
from app.schemas.challenge import (
    ChallengeCreate,
    ChallengeUpdate,
    ChallengeResponse,
    ChallengePurchaseResponse,
)
from app.schemas.trading import (
    MT5AccountPoolCreate,
    MT5AccountPoolBatchCreate,
    MT5AccountPoolResponse,
    MT5AccountPoolSummary,
    MT5TierAvailability,
)
from app.schemas.user import UserResponse, AdminUserUpdate
from app.services.email_service import email_service

router = APIRouter()


@router.get("/challenges", response_model=List[ChallengeResponse])
async def admin_list_challenges(
    admin: User = Depends(get_current_active_admin),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(Challenge).options(selectinload(Challenge.rules)).order_by(Challenge.starting_balance.asc())
    result = await db.execute(stmt)
    return result.scalars().all()


@router.post("/challenges", response_model=ChallengeResponse, status_code=status.HTTP_201_CREATED)
async def admin_create_challenge(
    challenge_in: ChallengeCreate,
    admin: User = Depends(get_current_active_admin),
    db: AsyncSession = Depends(get_db),
):
    # Verify slug uniqueness
    stmt = select(Challenge).where(Challenge.slug == challenge_in.slug)
    if (await db.execute(stmt)).scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Challenge slug '{challenge_in.slug}' already exists."
        )

    challenge = Challenge(
        name=challenge_in.name,
        slug=challenge_in.slug,
        starting_balance=challenge_in.starting_balance,
        price=challenge_in.price,
        currency=challenge_in.currency,
        description=challenge_in.description,
        is_active=challenge_in.is_active,
    )
    db.add(challenge)
    await db.flush()

    rules = ChallengeRule(
        challenge_id=challenge.id,
        profit_target_percentage=challenge_in.rules.profit_target_percentage,
        max_daily_loss_percentage=challenge_in.rules.max_daily_loss_percentage,
        max_drawdown_percentage=challenge_in.rules.max_drawdown_percentage,
        daily_loss_methodology=challenge_in.rules.daily_loss_methodology,
        drawdown_methodology=challenge_in.rules.drawdown_methodology,
        min_trading_days=challenge_in.rules.min_trading_days,
        max_trading_days=challenge_in.rules.max_trading_days,
        leverage=challenge_in.rules.leverage,
        profit_split_percentage=challenge_in.rules.profit_split_percentage,
        weekend_trading_allowed=challenge_in.rules.weekend_trading_allowed,
        news_trading_allowed=challenge_in.rules.news_trading_allowed,
        ea_trading_allowed=challenge_in.rules.ea_trading_allowed,
        copy_trading_allowed=challenge_in.rules.copy_trading_allowed,
        stop_loss_required=challenge_in.rules.stop_loss_required,
    )
    db.add(rules)

    # Immutable Audit Log
    audit = AuditLog(
        actor_id=admin.id,
        actor_email=admin.email,
        action="ADMIN_CREATE_CHALLENGE",
        target_type="CHALLENGE",
        target_id=challenge.id,
        new_value=json.dumps({"name": challenge.name, "price": str(challenge.price)}),
        reason="Admin created challenge tier"
    )
    db.add(audit)

    await db.commit()
    await db.refresh(challenge)
    
    # Reload with rules
    stmt_reload = select(Challenge).where(Challenge.id == challenge.id).options(selectinload(Challenge.rules))
    return (await db.execute(stmt_reload)).scalar_one()


@router.put("/challenges/{challenge_id}", response_model=ChallengeResponse)
async def admin_update_challenge(
    challenge_id: str,
    challenge_in: ChallengeUpdate,
    admin: User = Depends(get_current_active_admin),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(Challenge).where(Challenge.id == challenge_id).options(selectinload(Challenge.rules))
    challenge = (await db.execute(stmt)).scalar_one_or_none()
    if not challenge:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Challenge not found")

    prev_state = {"price": str(challenge.price), "is_active": challenge.is_active}

    if challenge_in.name is not None:
        challenge.name = challenge_in.name
    if challenge_in.starting_balance is not None:
        challenge.starting_balance = challenge_in.starting_balance
    if challenge_in.price is not None:
        challenge.price = challenge_in.price
    if challenge_in.currency is not None:
        challenge.currency = challenge_in.currency
    if challenge_in.description is not None:
        challenge.description = challenge_in.description
    if challenge_in.is_active is not None:
        challenge.is_active = challenge_in.is_active

    if challenge_in.rules and challenge.rules:
        r = challenge_in.rules
        challenge.rules.profit_target_percentage = r.profit_target_percentage
        challenge.rules.max_daily_loss_percentage = r.max_daily_loss_percentage
        challenge.rules.max_drawdown_percentage = r.max_drawdown_percentage
        challenge.rules.daily_loss_methodology = r.daily_loss_methodology
        challenge.rules.drawdown_methodology = r.drawdown_methodology
        challenge.rules.min_trading_days = r.min_trading_days
        challenge.rules.max_trading_days = r.max_trading_days
        challenge.rules.leverage = r.leverage
        challenge.rules.profit_split_percentage = r.profit_split_percentage
        challenge.rules.weekend_trading_allowed = r.weekend_trading_allowed
        challenge.rules.news_trading_allowed = r.news_trading_allowed
        challenge.rules.ea_trading_allowed = r.ea_trading_allowed
        challenge.rules.copy_trading_allowed = r.copy_trading_allowed
        challenge.rules.stop_loss_required = r.stop_loss_required

    audit = AuditLog(
        actor_id=admin.id,
        actor_email=admin.email,
        action="ADMIN_UPDATE_CHALLENGE",
        target_type="CHALLENGE",
        target_id=challenge.id,
        previous_value=json.dumps(prev_state),
        new_value=json.dumps({"price": str(challenge.price), "is_active": challenge.is_active}),
        reason="Admin updated challenge parameters"
    )
    db.add(audit)

    await db.commit()
    await db.refresh(challenge)
    return challenge


@router.get("/users", response_model=List[UserResponse])
async def admin_list_users(
    admin: User = Depends(get_current_active_admin),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(User).order_by(User.created_at.desc())
    return (await db.execute(stmt)).scalars().all()


@router.get("/purchases", response_model=List[ChallengePurchaseResponse])
async def admin_list_purchases(
    admin: User = Depends(get_current_active_admin),
    db: AsyncSession = Depends(get_db),
):
    stmt = (
        select(ChallengePurchase)
        .options(selectinload(ChallengePurchase.challenge).selectinload(Challenge.rules))
        .order_by(ChallengePurchase.created_at.desc())
    )
    return (await db.execute(stmt)).scalars().all()


@router.post("/purchases/{purchase_id}/status")
async def admin_update_purchase_status(
    purchase_id: str,
    new_status: str,
    admin: User = Depends(get_current_active_admin),
    db: AsyncSession = Depends(get_db),
):
    valid_statuses = {
        "PENDING_PAYMENT", "PAYMENT_CONFIRMED", "PROVISIONING", "ACTIVE",
        "WARNING", "BREACHED", "TARGET_REACHED", "UNDER_REVIEW", "PASSED",
        "FUNDED", "SUSPENDED", "PAYOUT_PENDING", "PAYOUT_APPROVED", "PAYOUT_PAID", "CLOSED"
    }
    if new_status not in valid_statuses:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid lifecycle status: {new_status}"
        )

    stmt = select(ChallengePurchase).where(ChallengePurchase.id == purchase_id)
    purchase = (await db.execute(stmt)).scalar_one_or_none()
    if not purchase:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Purchase not found")

    old_status = purchase.status
    purchase.status = new_status
    
    # If set to ACTIVE, ensure simulated MT5 mock login is populated if not yet set
    if new_status == "ACTIVE" and not purchase.mt5_login:
        purchase.mt5_login = f"88{purchase_id[:6].upper()}"
        purchase.mt5_server = "RiffMax-Simulated-MT5"

    audit = AuditLog(
        actor_id=admin.id,
        actor_email=admin.email,
        action="ADMIN_UPDATE_PURCHASE_STATUS",
        target_type="CHALLENGE_PURCHASE",
        target_id=purchase.id,
        previous_value=old_status,
        new_value=new_status,
        reason=f"Status transitioned from {old_status} to {new_status}"
    )
    db.add(audit)
    await db.commit()
    return {"message": "Status updated successfully", "purchase_id": purchase_id, "new_status": new_status}


# ============================================================
# MT5 Account Pool Management (Option C)
# ============================================================

@router.get("/account-pool/summary", response_model=MT5AccountPoolSummary)
async def admin_get_account_pool_summary(
    admin: User = Depends(get_current_active_admin),
    db: AsyncSession = Depends(get_db),
):
    """
    Returns inventory summary of pre-loaded MT5 accounts grouped by balance tier.
    """
    stmt = select(MT5AccountPool)
    res = await db.execute(stmt)
    accounts = res.scalars().all()

    tier_map = {}
    for acc in accounts:
        t = float(acc.account_tier)
        if t not in tier_map:
            tier_map[t] = {"total": 0, "available": 0, "assigned": 0}
        tier_map[t]["total"] += 1
        if acc.status == "AVAILABLE":
            tier_map[t]["available"] += 1
        elif acc.status == "ASSIGNED":
            tier_map[t]["assigned"] += 1

    tiers = [
        MT5TierAvailability(
            tier=t,
            total=data["total"],
            available=data["available"],
            assigned=data["assigned"],
        )
        for t, data in sorted(tier_map.items())
    ]

    total = len(accounts)
    available = sum(1 for a in accounts if a.status == "AVAILABLE")
    assigned = sum(1 for a in accounts if a.status == "ASSIGNED")

    return MT5AccountPoolSummary(
        total_accounts=total,
        available_accounts=available,
        assigned_accounts=assigned,
        tiers=tiers,
    )


@router.get("/account-pool", response_model=List[MT5AccountPoolResponse])
async def admin_list_account_pool(
    status_filter: str = None,
    tier_filter: float = None,
    admin: User = Depends(get_current_active_admin),
    db: AsyncSession = Depends(get_db),
):
    """
    Lists accounts currently in the MT5 account pool with optional filtering.
    """
    stmt = select(MT5AccountPool)
    if status_filter:
        stmt = stmt.where(MT5AccountPool.status == status_filter.upper())
    if tier_filter:
        stmt = stmt.where(MT5AccountPool.account_tier == tier_filter)
    stmt = stmt.order_by(MT5AccountPool.account_tier.asc(), MT5AccountPool.created_at.desc())

    res = await db.execute(stmt)
    return res.scalars().all()


@router.post("/account-pool", response_model=MT5AccountPoolResponse, status_code=status.HTTP_201_CREATED)
async def admin_add_account_to_pool(
    account_in: MT5AccountPoolCreate,
    admin: User = Depends(get_current_active_admin),
    db: AsyncSession = Depends(get_db),
):
    """
    Adds a single pre-generated MT5 account (from RoboForex, IC Markets, etc.) into the pool.
    """
    existing = await db.execute(
        select(MT5AccountPool).where(MT5AccountPool.mt5_login == account_in.mt5_login)
    )
    if existing.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Account with login {account_in.mt5_login} already exists in the pool."
        )

    acc = MT5AccountPool(
        broker_name=account_in.broker_name,
        server_name=account_in.server_name,
        account_tier=account_in.account_tier,
        mt5_login=account_in.mt5_login,
        mt5_password=account_in.mt5_password,
        mt5_investor_password=account_in.mt5_investor_password,
        notes=account_in.notes,
        status="AVAILABLE",
    )
    db.add(acc)
    await db.commit()
    await db.refresh(acc)
    return acc


@router.post("/account-pool/batch", status_code=status.HTTP_201_CREATED)
async def admin_add_batch_accounts_to_pool(
    batch_in: MT5AccountPoolBatchCreate,
    admin: User = Depends(get_current_active_admin),
    db: AsyncSession = Depends(get_db),
):
    """
    Bulk adds multiple pre-generated MT5 accounts into the pool.
    """
    added = 0
    skipped = 0
    for item in batch_in.accounts:
        existing = await db.execute(
            select(MT5AccountPool).where(MT5AccountPool.mt5_login == item.mt5_login)
        )
        if existing.scalar_one_or_none():
            skipped += 1
            continue

        acc = MT5AccountPool(
            broker_name=item.broker_name,
            server_name=item.server_name,
            account_tier=item.account_tier,
            mt5_login=item.mt5_login,
            mt5_password=item.mt5_password,
            mt5_investor_password=item.mt5_investor_password,
            notes=item.notes,
            status="AVAILABLE",
        )
        db.add(acc)
        added += 1

    await db.commit()
    return {"message": f"Successfully added {added} accounts to pool. Skipped {skipped} duplicates."}


@router.delete("/account-pool/{account_id}", status_code=status.HTTP_200_OK)
async def admin_delete_account_from_pool(
    account_id: str,
    admin: User = Depends(get_current_active_admin),
    db: AsyncSession = Depends(get_db),
):
    """
    Deletes an unassigned account from the pool. Assigned accounts cannot be deleted.
    """
    stmt = select(MT5AccountPool).where(MT5AccountPool.id == account_id)
    acc = (await db.execute(stmt)).scalar_one_or_none()
    if not acc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Account not found in pool.")

    if acc.status == "ASSIGNED":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete an account that has already been assigned to an active challenge."
        )

    await db.delete(acc)
    await db.commit()
    return {"message": f"Account {acc.mt5_login} deleted from pool."}


# ============================================================
# Admin: Resend MT5 Credentials to Trader Email
# ============================================================

@router.post("/resend-credentials/{purchase_id}", status_code=status.HTTP_200_OK)
async def admin_resend_credentials(
    purchase_id: str,
    admin: User = Depends(get_current_active_admin),
    db: AsyncSession = Depends(get_db),
):
    """
    Allows administrators to resend MT5 login credentials to the trader's email address.
    """
    stmt = (
        select(ChallengePurchase)
        .options(
            selectinload(ChallengePurchase.challenge),
            selectinload(ChallengePurchase.user),
        )
        .where(ChallengePurchase.id == purchase_id)
    )
    res = await db.execute(stmt)
    purchase = res.scalar_one_or_none()

    if not purchase:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Purchase not found")

    if not purchase.mt5_login:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Account has not yet been provisioned with MT5 credentials."
        )

    trader = purchase.user
    challenge = purchase.challenge

    if not trader:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Trader user not found")

    ok = await email_service.send_credentials_email(
        to_email=trader.email,
        trader_name=trader.full_name or trader.email.split("@")[0],
        challenge_name=challenge.name if challenge else "Evaluation Challenge",
        starting_balance=float(challenge.starting_balance if challenge else purchase.current_balance),
        mt5_login=purchase.mt5_login,
        mt5_password=purchase.mt5_password or "Contact Support",
        mt5_investor_password=purchase.mt5_investor_password or "",
        mt5_server=purchase.mt5_server or "RoboForex-Demo",
    )

    audit = AuditLog(
        actor_id=admin.id,
        actor_email=admin.email,
        action="ADMIN_RESEND_CREDENTIALS",
        target_type="CHALLENGE_PURCHASE",
        target_id=purchase.id,
        new_value=f"Resent credentials to {trader.email} for MT5 Login {purchase.mt5_login}",
    )
    db.add(audit)
    await db.commit()

    return {
        "success": True,
        "message": f"Credentials successfully dispatched to {trader.email}",
        "mt5_login": purchase.mt5_login,
        "recipient": trader.email,
    }


# ============================================================
# Admin: User Management Endpoints
# ============================================================

@router.get("/users")
async def admin_list_users(
    search: str = "",
    page: int = 1,
    per_page: int = 20,
    admin: User = Depends(get_current_active_admin),
    db: AsyncSession = Depends(get_db),
):
    offset = (max(1, page) - 1) * per_page
    query = select(User)
    count_query = select(func.count(User.id))

    if search.strip():
        term = f"%{search.strip().lower()}%"
        query = query.where(
            or_(
                func.lower(User.email).like(term),
                func.lower(User.full_name).like(term),
            )
        )
        count_query = count_query.where(
            or_(
                func.lower(User.email).like(term),
                func.lower(User.full_name).like(term),
            )
        )

    total_res = await db.execute(count_query)
    total = total_res.scalar() or 0

    query = query.order_by(desc(User.created_at)).offset(offset).limit(per_page)
    res = await db.execute(query)
    users = res.scalars().all()

    active_count_res = await db.execute(select(func.count(User.id)).where(User.is_active == True))
    pending_kyc_res = await db.execute(select(func.count(User.id)).where(User.kyc_status == "PENDING"))
    suspended_count_res = await db.execute(select(func.count(User.id)).where(User.is_active == False))

    user_list = []
    for u in users:
        user_list.append({
            "id": u.id,
            "email": u.email,
            "full_name": u.full_name,
            "country": u.country,
            "phone": u.phone,
            "role": u.role,
            "is_active": u.is_active,
            "is_verified": u.is_verified,
            "is_admin": u.is_admin,
            "kyc_status": u.kyc_status,
            "created_at": u.created_at.isoformat() if u.created_at else None,
        })

    return {
        "total": total,
        "page": page,
        "per_page": per_page,
        "stats": {
            "total_users": total,
            "active_users": active_count_res.scalar() or 0,
            "pending_kyc": pending_kyc_res.scalar() or 0,
            "suspended": suspended_count_res.scalar() or 0,
        },
        "users": user_list,
    }


@router.post("/users/{user_id}/suspend")
async def admin_suspend_user(
    user_id: str,
    admin: User = Depends(get_current_active_admin),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(User).where(User.id == user_id)
    res = await db.execute(stmt)
    user = res.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.id == admin.id:
        raise HTTPException(status_code=400, detail="Cannot suspend yourself")

    user.is_active = False
    audit = AuditLog(
        actor_id=admin.id,
        actor_email=admin.email,
        action="ADMIN_SUSPEND_USER",
        target_type="USER",
        target_id=user.id,
        new_value=f"Suspended user {user.email}",
    )
    db.add(audit)
    await db.commit()
    return {"success": True, "message": f"User {user.email} suspended"}


@router.post("/users/{user_id}/activate")
async def admin_activate_user(
    user_id: str,
    admin: User = Depends(get_current_active_admin),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(User).where(User.id == user_id)
    res = await db.execute(stmt)
    user = res.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.is_active = True
    audit = AuditLog(
        actor_id=admin.id,
        actor_email=admin.email,
        action="ADMIN_ACTIVATE_USER",
        target_type="USER",
        target_id=user.id,
        new_value=f"Activated user {user.email}",
    )
    db.add(audit)
    await db.commit()
    return {"success": True, "message": f"User {user.email} activated"}


@router.post("/users/{user_id}/make-admin")
async def admin_make_admin(
    user_id: str,
    admin: User = Depends(get_current_active_admin),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(User).where(User.id == user_id)
    res = await db.execute(stmt)
    user = res.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.is_admin = True
    user.role = "SUPER_ADMIN"
    audit = AuditLog(
        actor_id=admin.id,
        actor_email=admin.email,
        action="ADMIN_PROMOTED_ADMIN",
        target_type="USER",
        target_id=user.id,
        new_value=f"Promoted {user.email} to Super Admin",
    )
    db.add(audit)
    await db.commit()
    return {"success": True, "message": f"User {user.email} promoted to Administrator"}
