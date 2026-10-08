import asyncio
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.core.database import AsyncSessionLocal
from app.db.init_db import init_db
from app.api.v1.api import api_router
from app.workers.daily_reset import daily_equity_reset_worker
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

limiter = Limiter(key_func=get_remote_address)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize DB tables and seeds on startup
    async with AsyncSessionLocal() as session:
        await init_db(session)

    # Start the midnight daily equity reset worker in the background
    reset_task = asyncio.create_task(daily_equity_reset_worker())

    yield

    # Graceful shutdown — cancel the worker when the server stops
    reset_task.cancel()
    try:
        await reset_task
    except asyncio.CancelledError:
        pass


app = FastAPI(
    title=settings.APP_NAME,
    description="Global Proprietary Trading Challenge & Evaluation API",
    version="1.0.0",
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url=f"{settings.API_V1_STR}/docs",
    redoc_url=f"{settings.API_V1_STR}/redoc",
    lifespan=lifespan,
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", tags=["Health"])
async def health_check():
    return {
        "status": "healthy",
        "app": settings.APP_NAME,
        "environment": settings.ENVIRONMENT,
        "version": "1.0.0"
    }


# Global Exception Handler (Never leak raw internal tracebacks to users)
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    # In production, log to Sentry / Structured JSON
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "An internal server error occurred. Please contact platform support."}
    )


# Include API v1 router
app.include_router(api_router, prefix=settings.API_V1_STR)
