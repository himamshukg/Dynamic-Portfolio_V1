"""Skill CRUD routes."""

from typing import List, Optional

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, field_validator

from ..data import store
from ..auth import require_auth


class SkillBase(BaseModel):
    name: str
    category: str
    proficiency: str

    @field_validator("name", "category", "proficiency")
    @classmethod
    def _require_non_empty(cls, value: str) -> str:
        if not value or not value.strip():
            raise ValueError("This field is required.")
        return value


class SkillCreate(SkillBase):
    pass


class SkillUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    proficiency: Optional[str] = None


class SkillOut(SkillBase):
    id: int


router = APIRouter(tags=["skills"])


@router.get("/api/skills", response_model=List[SkillOut])
def list_skills():
    return store.get_skills()


@router.get("/api/skills/{skill_id}", response_model=SkillOut)
def get_skill(skill_id: int):
    skill = store.get_skill(skill_id)
    if skill is None:
        raise HTTPException(status_code=404, detail=f"Skill with id {skill_id} not found")
    return skill


@router.post("/api/skills", response_model=SkillOut, status_code=201)
def create_skill(payload: SkillCreate, user: dict = Depends(require_auth)):
    return store.add_skill(payload.model_dump())


@router.put("/api/skills/{skill_id}", response_model=SkillOut)
def update_skill(skill_id: int, payload: SkillUpdate, user: dict = Depends(require_auth)):
    updated = store.update_skill(skill_id, payload.model_dump(exclude_unset=True))
    if updated is None:
        raise HTTPException(status_code=404, detail=f"Skill with id {skill_id} not found")
    return updated


@router.delete("/api/skills/{skill_id}")
def delete_skill(skill_id: int, user: dict = Depends(require_auth)):
    deleted = store.delete_skill(skill_id)
    if not deleted:
        raise HTTPException(status_code=404, detail=f"Skill with id {skill_id} not found")
    return {"message": f"Skill with id {skill_id} deleted", "deleted": True}