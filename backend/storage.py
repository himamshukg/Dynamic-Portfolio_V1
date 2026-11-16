"""
storage.py
JSON file-based persistent storage for the portfolio.
Loads data on startup, saves on every write operation.
"""

import json
import os
from typing import Dict, List, Optional

# Path to the JSON data file
DATA_FILE = os.path.join(os.path.dirname(__file__), "data", "portfolio.json")

# Default seed data (used only if JSON file doesn't exist)
DEFAULT_PROFILE: Dict[str, str] = {
    "name": "Himamshu K G",
    "headline": "Software Engineer & Full-Stack Developer",
    "location": "Bengaluru, India",
    "bio": "Computer Science student passionate about building practical software solutions, AI-assisted applications, and secure, reliable systems. Interested in backend development, Python, FastAPI, REST APIs, and cybersecurity. Constantly exploring new technologies and strengthening my skills through hands-on projects, problem-solving, and continuous learning.",
    "email": "himamshukg@gmail.com",
    "github_url": "https://github.com/himamshukg",
    "linkedin_url": "https://linkedin.com/in/himamshukg",
    "education": "Degree: B.E. in Computer Science & Engineering\nInstitution: University Visvesvaraya College of Engineering (UVCE), Bengaluru\nStatus: Currently Pursuing\nDuration: 2026–2030",
    "activities": "Cybersecurity & CTF Participant: Participated in a hands-on CTF and cybersecurity programme at RV University, exploring Linux commands, challenge-solving and security fundamentals.\n\nSelf-Directed Learner: Learning Python, C programming, Linux, APIs, Git/GitHub and AI application development.\n\nTechnology Enthusiast: Interested in software development, cybersecurity and AI-assisted applications."
}

DEFAULT_PROJECTS: List[Dict] = [
    {
        "id": 1,
        "title": "Dynamic Portfolio Website",
        "description": "A modern, responsive personal portfolio with an interactive admin dashboard powered by FastAPI REST backend and vanilla JavaScript.",
        "technologies": "HTML5, CSS3, JavaScript (ES6+), FastAPI, Python",
        "github_url": "https://github.com/himamshukg/dynamic-portfolio",
        "live_url": "http://127.0.0.1:8000/docs",
    },
    {
        "id": 2,
        "title": "Task Management API",
        "description": "A RESTful API built for robust task tracking, authorization, filtering, and data export features.",
        "technologies": "Python, FastAPI, Pydantic, SQLite",
        "github_url": "https://github.com/himamshukg/task-manager-api",
        "live_url": "",
    },
    {
        "id": 3,
        "title": "Weather & Air Quality Dashboard",
        "description": "Interactive weather tracking platform featuring location search, multi-day forecast, and environmental metrics visualizer.",
        "technologies": "JavaScript, CSS Grid/Flexbox, OpenWeather API, HTML5",
        "github_url": "https://github.com/himamshukg/weather-dashboard",
        "live_url": "",
    },
]

DEFAULT_SKILLS: List[Dict] = [
    {"id": 1, "name": "Python", "category": "Backend", "proficiency": "Advanced"},
    {"id": 2, "name": "FastAPI", "category": "Backend", "proficiency": "Advanced"},
    {"id": 3, "name": "JavaScript (ES6+)", "category": "Frontend", "proficiency": "Advanced"},
    {"id": 4, "name": "HTML5 & CSS3", "category": "Frontend", "proficiency": "Advanced"},
    {"id": 5, "name": "REST APIs", "category": "Backend", "proficiency": "Advanced"},
    {"id": 6, "name": "Git & GitHub", "category": "Tools", "proficiency": "Advanced"},
    {"id": 7, "name": "SQL & Databases", "category": "Database", "proficiency": "Intermediate"},
]

DEFAULT_DATA = {
    "profile": DEFAULT_PROFILE,
    "projects": DEFAULT_PROJECTS,
    "skills": DEFAULT_SKILLS,
}


def _ensure_data_dir():
    """Ensure the data directory exists."""
    os.makedirs(os.path.dirname(DATA_FILE), exist_ok=True)


def _load_default_data() -> Dict:
    """Return a deep copy of default data with correct ID counters."""
    return {
        "profile": dict(DEFAULT_PROFILE),
        "projects": [dict(p) for p in DEFAULT_PROJECTS],
        "skills": [dict(s) for s in DEFAULT_SKILLS],
        "_next_project_id": max((p["id"] for p in DEFAULT_PROJECTS), default=0) + 1,
        "_next_skill_id": max((s["id"] for s in DEFAULT_SKILLS), default=0) + 1,
    }


def load_data() -> Dict:
    """
    Load portfolio data from JSON file.
    If file doesn't exist or is invalid, create it with default data.
    """
    _ensure_data_dir()

    if not os.path.exists(DATA_FILE):
        # File doesn't exist - create with default data
        data = _load_default_data()
        save_data(data)
        return data

    try:
        with open(DATA_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)

        # Validate structure and ensure all required fields exist
        if not isinstance(data, dict):
            raise ValueError("Invalid data format")

        # Ensure all required keys exist
        data.setdefault("profile", dict(DEFAULT_PROFILE))
        data.setdefault("projects", [])
        data.setdefault("skills", [])
        data.setdefault("_next_project_id", max((p["id"] for p in data["projects"]), default=0) + 1)
        data.setdefault("_next_skill_id", max((s["id"] for s in data["skills"]), default=0) + 1)

        # Ensure profile has all required fields
        for key, val in DEFAULT_PROFILE.items():
            data["profile"].setdefault(key, val)

        return data

    except (json.JSONDecodeError, ValueError, KeyError) as e:
        # Corrupted or invalid file - backup and recreate with defaults
        print(f"Warning: Failed to load {DATA_FILE}: {e}. Recreating with defaults.")
        if os.path.exists(DATA_FILE):
            backup_file = DATA_FILE + ".backup"
            os.rename(DATA_FILE, backup_file)
        data = _load_default_data()
        save_data(data)
        return data


def save_data(data: Dict) -> None:
    """Save portfolio data to JSON file atomically."""
    _ensure_data_dir()

    # Prepare data for saving (exclude internal counters from JSON)
    save_dict = {
        "profile": data.get("profile", {}),
        "projects": data.get("projects", []),
        "skills": data.get("skills", []),
    }

    # Write to temp file first, then rename (atomic on most systems)
    temp_file = DATA_FILE + ".tmp"
    try:
        with open(temp_file, "w", encoding="utf-8") as f:
            json.dump(save_dict, f, indent=2, ensure_ascii=False)
        os.replace(temp_file, DATA_FILE)
    except Exception as e:
        # Clean up temp file on failure
        if os.path.exists(temp_file):
            os.remove(temp_file)
        raise RuntimeError(f"Failed to save data to {DATA_FILE}: {e}")