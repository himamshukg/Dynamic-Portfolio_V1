"""
data.py
Data access layer with JSON file-based persistence.
Data is loaded from / saved to a JSON file via storage.py.
"""

from typing import List, Dict, Optional

from .storage import load_data, save_data


# ---------------------------------------------------------------------------
# In-memory store (backed by JSON file)
# ---------------------------------------------------------------------------
class DataStore:
    """A data store backed by JSON file persistence."""

    def __init__(self) -> None:
        self._data = load_data()
        self.profile: Dict[str, str] = self._data["profile"]
        self.projects: List[Dict] = self._data["projects"]
        self.skills: List[Dict] = self._data["skills"]
        self._next_project_id = self._data["_next_project_id"]
        self._next_skill_id = self._data["_next_skill_id"]

    def _persist(self) -> None:
        """Save current state to JSON file."""
        self._data["profile"] = self.profile
        self._data["projects"] = self.projects
        self._data["skills"] = self.skills
        self._data["_next_project_id"] = self._next_project_id
        self._data["_next_skill_id"] = self._next_skill_id
        save_data(self._data)

    # -- profile ------------------------------------------------------------
    def get_profile(self) -> Dict[str, str]:
        return dict(self.profile)

    def update_profile(self, data: Dict[str, str]) -> Dict[str, str]:
        for key, val in data.items():
            if val is not None and val.strip():
                self.profile[key] = val.strip()
        self._persist()
        return dict(self.profile)

    # -- projects -----------------------------------------------------------
    def get_projects(self) -> List[Dict]:
        return list(self.projects)

    def get_project(self, project_id: int) -> Optional[Dict]:
        return next((p for p in self.projects if p["id"] == project_id), None)

    def add_project(self, data: Dict) -> Dict:
        new_project = {
            "id": self._next_project_id,
            "title": data.get("title", "").strip(),
            "description": data.get("description", "").strip(),
            "technologies": data.get("technologies", "").strip(),
            "github_url": data.get("github_url", "").strip(),
            "live_url": data.get("live_url", "").strip(),
        }
        self.projects.append(new_project)
        self._next_project_id += 1
        self._persist()
        return new_project

    def update_project(self, project_id: int, data: Dict) -> Optional[Dict]:
        project = self.get_project(project_id)
        if project is None:
            return None
        project["title"] = data.get("title", project["title"]).strip()
        project["description"] = data.get("description", project["description"]).strip()
        project["technologies"] = data.get("technologies", project["technologies"]).strip()
        project["github_url"] = data.get("github_url", project["github_url"]).strip()
        project["live_url"] = data.get("live_url", project["live_url"]).strip()
        self._persist()
        return project

    def delete_project(self, project_id: int) -> bool:
        for index, project in enumerate(self.projects):
            if project["id"] == project_id:
                del self.projects[index]
                self._persist()
                return True
        return False

    # -- skills -------------------------------------------------------------
    def get_skills(self) -> List[Dict]:
        return list(self.skills)

    def get_skill(self, skill_id: int) -> Optional[Dict]:
        return next((s for s in self.skills if s["id"] == skill_id), None)

    def add_skill(self, data: Dict) -> Dict:
        new_skill = {
            "id": self._next_skill_id,
            "name": data.get("name", "").strip(),
            "category": data.get("category", "").strip(),
            "proficiency": data.get("proficiency", "").strip(),
        }
        self.skills.append(new_skill)
        self._next_skill_id += 1
        self._persist()
        return new_skill

    def update_skill(self, skill_id: int, data: Dict) -> Optional[Dict]:
        skill = self.get_skill(skill_id)
        if skill is None:
            return None
        skill["name"] = data.get("name", skill["name"]).strip()
        skill["category"] = data.get("category", skill["category"]).strip()
        skill["proficiency"] = data.get("proficiency", skill["proficiency"]).strip()
        self._persist()
        return skill

    def delete_skill(self, skill_id: int) -> bool:
        for index, skill in enumerate(self.skills):
            if skill["id"] == skill_id:
                del self.skills[index]
                self._persist()
                return True
        return False


# A single shared store for the whole application.
store = DataStore()