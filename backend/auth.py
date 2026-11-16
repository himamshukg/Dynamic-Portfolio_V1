"""
auth.py
Authentication module for the portfolio admin dashboard.
Uses HTTP-only cookies for session management and bcrypt for password hashing.
"""

import os
import secrets
from typing import Optional
from fastapi import APIRouter, HTTPException, Depends, Request, Response
from fastapi.security import HTTPBearer
from pydantic import BaseModel
import bcrypt
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Admin credentials from environment
ADMIN_USERNAME = os.getenv("ADMIN_USERNAME", "admin")
ADMIN_PASSWORD_HASH = os.getenv("ADMIN_PASSWORD_HASH")

# Session store (in production, use Redis or database)
sessions: dict[str, dict] = {}

router = APIRouter(tags=["auth"])
security = HTTPBearer(auto_error=False)


class LoginRequest(BaseModel):
    username: str
    password: str


class AuthResponse(BaseModel):
    authenticated: bool
    username: Optional[str] = None


def hash_password(password: str) -> str:
    """Hash a password using bcrypt."""
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(password: str, hashed: str) -> bool:
    """Verify a password against its bcrypt hash."""
    return bcrypt.checkpw(password.encode("utf-8"), hashed.encode("utf-8"))


def create_session(username: str) -> str:
    """Create a new session and return session token."""
    token = secrets.token_urlsafe(32)
    sessions[token] = {"username": username}
    return token


def get_session(token: str) -> Optional[dict]:
    """Get session data by token."""
    return sessions.get(token)


def delete_session(token: str) -> bool:
    """Delete a session."""
    if token in sessions:
        del sessions[token]
        return True
    return False


def get_current_user(request: Request) -> dict:
    """Dependency to get current authenticated user from session cookie."""
    token = request.cookies.get("session_token")
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")

    session = get_session(token)
    if not session:
        raise HTTPException(status_code=401, detail="Invalid or expired session")

    return session


@router.post("/api/auth/login", response_model=AuthResponse)
async def login(response: Response, payload: LoginRequest):
    """Authenticate admin user and set session cookie."""
    # Verify username
    if payload.username != ADMIN_USERNAME:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    # Verify password
    if ADMIN_PASSWORD_HASH:
        if not verify_password(payload.password, ADMIN_PASSWORD_HASH):
            raise HTTPException(status_code=401, detail="Invalid credentials")
    else:
        # Fallback for first run - hash the env password and compare
        # This allows migration from plain text to hashed
        env_password = os.getenv("ADMIN_PASSWORD", "")
        if payload.password != env_password:
            raise HTTPException(status_code=401, detail="Invalid credentials")

    # Create session
    token = create_session(payload.username)

    # Set HTTP-only cookie
    response.set_cookie(
        key="session_token",
        value=token,
        httponly=True,
        secure=False,  # Set to True in production with HTTPS
        samesite="lax",
        max_age=86400,  # 24 hours
        path="/"
    )

    return AuthResponse(authenticated=True, username=payload.username)


@router.post("/api/auth/logout")
async def logout(response: Response, request: Request):
    """Logout user and clear session."""
    token = request.cookies.get("session_token")
    if token:
        delete_session(token)

    response.delete_cookie(key="session_token", path="/")
    return {"message": "Logged out successfully"}


@router.get("/api/auth/me", response_model=AuthResponse)
async def get_current_user_info(user: dict = Depends(get_current_user)):
    """Get current authenticated user info."""
    return AuthResponse(authenticated=True, username=user["username"])


def require_auth(user: dict = Depends(get_current_user)):
    """Dependency to require authentication for admin endpoints."""
    return user