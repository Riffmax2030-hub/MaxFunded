from fastapi import APIRouter
from app.api.v1 import auth, users, challenges, admin

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(users.router, prefix="/users", tags=["Users"])
api_router.include_router(challenges.router, prefix="/challenges", tags=["Challenges"])
api_router.include_router(admin.router, prefix="/admin", tags=["Admin Control"])
