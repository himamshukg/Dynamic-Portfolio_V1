"""Profile retrieval and update endpoints."""

from typing import List, Optional

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, field_validator

from data import store
from auth import require_auth


class ProfileUpdate(BaseModel):
    name: Optional[str] = None
    headline: Optional[str] = None
    location: Optional[str] = None
    bio: Optional[str] = None
    email: Optional[str] = None
    github_url: Optional[str] = None
    linkedin_url: Optional[str] = None
    education: Optional[str] = None
    activities: Optional[str] = None

    @field_validator("name", "headline", "location", "bio", "email",
                     "github_url", "linkedin_url", "education", "activities")
    @classmethod
    def _no_empty_strings(cls, value: Optional[str]) -> Optional[str]:
        if value is not None and not value.strip():
            raise ValueError("Field cannot be empty.")
        return value


router = APIRouter(tags=["profile"])


@router.get("/api/profile")
def get_profile():
    return store.get_profile()


@router.put("/api/profile")
def update_profile(payload: ProfileUpdate, user: dict = Depends(require_auth)):
    return store.update_profile(payload.model_dump(exclude_unset=True))