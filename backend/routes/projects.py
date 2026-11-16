"""Project CRUD routes."""

from typing import List, Optional

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, field_validator

from data import store
from auth import require_auth


class ProjectBase(BaseModel):
    title: str
    description: str
    technologies: str
    github_url: str = ""
    live_url: str = ""

    @field_validator("title", "description", "technologies")
    @classmethod
    def _require_non_empty(cls, value: str) -> str:
        if not value or not value.strip():
            raise ValueError("This field is required.")
        return value


class ProjectCreate(ProjectBase):
    pass


class ProjectUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    technologies: Optional[str] = None
    github_url: Optional[str] = None
    live_url: Optional[str] = None


class ProjectOut(ProjectBase):
    id: int


router = APIRouter(tags=["projects"])


@router.get("/api/projects", response_model=List[ProjectOut])
def list_projects():
    return store.get_projects()


@router.get("/api/projects/{project_id}", response_model=ProjectOut)
def get_project(project_id: int):
    project = store.get_project(project_id)
    if project is None:
        raise HTTPException(status_code=404, detail=f"Project with id {project_id} not found")
    return project


@router.post("/api/projects", response_model=ProjectOut, status_code=201)
def create_project(payload: ProjectCreate, user: dict = Depends(require_auth)):
    return store.add_project(payload.model_dump())


@router.put("/api/projects/{project_id}", response_model=ProjectOut)
def update_project(project_id: int, payload: ProjectUpdate, user: dict = Depends(require_auth)):
    updated = store.update_project(project_id, payload.model_dump(exclude_unset=True))
    if updated is None:
        raise HTTPException(status_code=404, detail=f"Project with id {project_id} not found")
    return updated


@router.delete("/api/projects/{project_id}")
def delete_project(project_id: int, user: dict = Depends(require_auth)):
    deleted = store.delete_project(project_id)
    if not deleted:
        raise HTTPException(status_code=404, detail=f"Project with id {project_id} not found")
    return {"message": f"Project with id {project_id} deleted", "deleted": True}