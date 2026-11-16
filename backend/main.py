"""
main.py
FastAPI backend entry point for the dynamic portfolio.

Run with:
    uvicorn main:app --reload

API docs: http://localhost:8000/docs
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from data import store
from routes.projects import router as projects_router
from routes.skills import router as skills_router
from routes.profile import router as profile_router
from auth import router as auth_router

app = FastAPI(
    title="Dynamic Portfolio API",
    description="REST API for managing projects, skills and profile of a personal portfolio.",
    version="1.0.0",
)

# Allow the frontend (served from a different origin) to talk to this API.
# credentials=True allows cookies to be sent cross-origin
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:5500", "http://localhost:5500", "http://127.0.0.1:3000", "http://localhost:3000", "http://127.0.0.1:8000", "http://localhost:8000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(projects_router)
app.include_router(skills_router)
app.include_router(profile_router)


@app.get("/api/health", tags=["health"])
def health_check():
    return {
        "status": "ok",
        "message": "Portfolio API is running",
        "projects": len(store.projects),
        "skills": len(store.skills),
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)