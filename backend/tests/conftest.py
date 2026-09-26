import asyncio
import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession

from app.core.database import Base, get_db
from app.core.security import get_password_hash, create_access_token
from app.models.user import User
from app.db.init_db import init_db
from app.main import app

TEST_DB_URL = "sqlite+aiosqlite:///:memory:"

test_engine = create_async_engine(
    TEST_DB_URL,
    connect_args={"check_same_thread": False},
)
TestSessionLocal = async_sessionmaker(
    bind=test_engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False
)


@pytest.fixture(scope="session")
def event_loop():
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest_asyncio.fixture(scope="function")
async def db_session():
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with TestSessionLocal() as session:
        await init_db(session)
        yield session

    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


@pytest_asyncio.fixture(scope="function")
async def client(db_session: AsyncSession):
    async def override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = override_get_db

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac

    app.dependency_overrides.clear()


@pytest_asyncio.fixture(scope="function")
async def trader_token(db_session: AsyncSession):
    trader = User(
        email="trader@test.com",
        hashed_password=get_password_hash("TraderPass123!"),
        full_name="Pro Trader",
        country="US",
        phone="+1234567890",
        is_active=True,
        is_verified=True,
        is_admin=False,
        role="TRADER",
        kyc_status="NOT_REQUIRED",
        accepted_terms=True,
        accepted_privacy=True,
        accepted_risk_disclosure=True,
    )
    db_session.add(trader)
    await db_session.commit()
    await db_session.refresh(trader)
    token = create_access_token(subject=trader.id)
    return {"token": token, "user": trader}


@pytest_asyncio.fixture(scope="function")
async def admin_token(db_session: AsyncSession):
    # Admin is seeded during init_db: admin@riffmaxfunding.com
    from sqlalchemy import select
    stmt = select(User).where(User.email == "admin@riffmaxfunding.com")
    admin = (await db_session.execute(stmt)).scalar_one()
    token = create_access_token(subject=admin.id)
    return {"token": token, "user": admin}
