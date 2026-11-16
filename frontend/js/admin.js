/**
 * admin.js
 * Logic for the admin dashboard: authentication, CRUD operations for projects, skills, and profile.
 */

document.addEventListener("DOMContentLoaded", () => {
    // Check authentication state
    if (isAuthenticated()) {
        showDashboard();
    } else {
        showAuthGate();
    }

    // Login form handler
    document.getElementById("loginForm").addEventListener("submit", handleLogin);

    // Logout handler
    document.getElementById("logoutBtn").addEventListener("click", handleLogout);

    // Tab navigation
    document.querySelectorAll(".sidebar-btn").forEach(btn => {
        btn.addEventListener("click", () => switchTab(btn.dataset.tab));
    });

    // Form handlers
    document.getElementById("projectForm").addEventListener("submit", handleProjectSubmit);
    document.getElementById("skillForm").addEventListener("submit", handleSkillSubmit);
    document.getElementById("profileForm").addEventListener("submit", handleProfileSubmit);

    // Modal close on backdrop click
    document.querySelectorAll(".modal-backdrop").forEach(modal => {
        modal.addEventListener("click", (e) => {
            if (e.target === modal) closeModal(modal.id);
        });
    });

    // Close modal on Escape key
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            document.querySelectorAll(".modal-backdrop.active").forEach(modal => {
                closeModal(modal.id);
            });
        }
    });
});

/**
 * Authentication Helpers
 */
function isAuthenticated() {
    return sessionStorage.getItem("adminAuthenticated") === "true";
}

function setAuthenticated(value) {
    if (value) {
        sessionStorage.setItem("adminAuthenticated", "true");
    } else {
        sessionStorage.removeItem("adminAuthenticated");
    }
}

function showAuthGate() {
    document.getElementById("authGate").style.display = "block";
    document.getElementById("adminDashboard").style.display = "none";
}

function showDashboard() {
    document.getElementById("authGate").style.display = "none";
    document.getElementById("adminDashboard").style.display = "flex";
    loadDashboardData();
}

async function handleLogin(e) {
    e.preventDefault();
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    const errorEl = document.getElementById("authError");

    try {
        const response = await fetch(CONFIG.API_BASE_URL + "/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include", // Important for cookie-based session
            body: JSON.stringify({ username, password })
        });

        if (response.ok) {
            setAuthenticated(true);
            showDashboard();
            errorEl.style.display = "none";
        } else {
            const error = await response.json().catch(() => ({ detail: "Login failed" }));
            errorEl.textContent = error.detail || "Invalid credentials. Please try again.";
            errorEl.style.display = "block";
        }
    } catch (err) {
        errorEl.textContent = "Connection error. Please ensure the backend is running.";
        errorEl.style.display = "block";
    }
}

async function handleLogout() {
    try {
        await fetch(CONFIG.API_BASE_URL + "/api/auth/logout", {
            method: "POST",
            credentials: "include"
        });
    } catch (err) {
        console.warn("Logout request failed:", err);
    }
    setAuthenticated(false);
    showAuthGate();
    document.getElementById("loginForm").reset();
}

/**
 * Tab Navigation
 */
function switchTab(tabName) {
    // Update sidebar buttons
    document.querySelectorAll(".sidebar-btn").forEach(btn => {
        btn.classList.toggle("active", btn.dataset.tab === tabName);
    });

    // Update tab content
    document.querySelectorAll(".tab-content").forEach(content => {
        content.classList.toggle("active", content.id === tabName);
    });

    // Load data for specific tabs
    if (tabName === "overview") loadOverviewStats();
    if (tabName === "projects") loadProjectsTable();
    if (tabName === "skills") loadSkillsTable();
    if (tabName === "profile") loadProfile();
}

/**
 * Toast Notifications
 */
function showToast(message, type) {
    type = type || "success";
    const container = document.getElementById("toastContainer");
    const toast = document.createElement("div");
    toast.className = "toast toast-" + type;
    toast.textContent = message;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = "slideIn 0.3s ease reverse forwards";
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

/**
 * Modal Helpers
 */
function openModal(modalId) {
    document.getElementById(modalId).classList.add("active");
    document.body.style.overflow = "hidden";
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove("active");
    document.body.style.overflow = "";
    // Reset forms
    if (modalId === "projectModal") {
        document.getElementById("projectForm").reset();
        document.getElementById("projectId").value = "";
        document.getElementById("projectModalTitle").textContent = "Add Project";
        document.getElementById("projectSubmitBtn").textContent = "Add Project";
    }
    if (modalId === "skillModal") {
        document.getElementById("skillForm").reset();
        document.getElementById("skillId").value = "";
        document.getElementById("skillModalTitle").textContent = "Add Skill";
        document.getElementById("skillSubmitBtn").textContent = "Add Skill";
    }
}

function openProjectModal(project) {
    if (project) {
        document.getElementById("projectModalTitle").textContent = "Edit Project";
        document.getElementById("projectSubmitBtn").textContent = "Update Project";
        document.getElementById("projectId").value = project.id;
        document.getElementById("projectTitle").value = project.title;
        document.getElementById("projectDescription").value = project.description;
        document.getElementById("projectTechnologies").value = project.technologies;
        document.getElementById("projectGithub").value = project.github_url || "";
        document.getElementById("projectLive").value = project.live_url || "";
    } else {
        document.getElementById("projectForm").reset();
        document.getElementById("projectId").value = "";
        document.getElementById("projectModalTitle").textContent = "Add Project";
        document.getElementById("projectSubmitBtn").textContent = "Add Project";
    }
    openModal("projectModal");
}

function openSkillModal(skill) {
    if (skill) {
        document.getElementById("skillModalTitle").textContent = "Edit Skill";
        document.getElementById("skillSubmitBtn").textContent = "Update Skill";
        document.getElementById("skillId").value = skill.id;
        document.getElementById("skillName").value = skill.name;
        document.getElementById("skillCategory").value = skill.category;
        document.getElementById("skillProficiency").value = skill.proficiency;
    } else {
        document.getElementById("skillForm").reset();
        document.getElementById("skillId").value = "";
        document.getElementById("skillModalTitle").textContent = "Add Skill";
        document.getElementById("skillSubmitBtn").textContent = "Add Skill";
    }
    openModal("skillModal");
}

/**
 * API Helper - includes credentials for cookie-based session
 */
async function apiRequest(endpoint, options) {
    options = options || {};
    const url = CONFIG.API_BASE_URL + endpoint;
    const defaultOptions = {
        credentials: "include", // Send cookies with every request
        headers: {
            "Content-Type": "application/json",
        },
    };
    const response = await fetch(url, Object.assign({}, defaultOptions, options));
    if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: "Request failed" }));
        // If 401, redirect to login
        if (response.status === 401) {
            setAuthenticated(false);
            showAuthGate();
        }
        throw new Error(error.detail || "HTTP " + response.status);
    }
    return response.json();
}

/**
 * Dashboard Data Loading
 */
async function loadDashboardData() {
    await Promise.all([
        loadOverviewStats(),
        loadProjectsTable(),
        loadSkillsTable(),
        loadProfile(),
    ]);
}

async function loadOverviewStats() {
    try {
        const results = await Promise.all([
            apiRequest("/api/projects"),
            apiRequest("/api/skills"),
        ]);
        const projects = results[0];
        const skills = results[1];

        document.getElementById("statProjects").textContent = projects.length;
        document.getElementById("statSkills").textContent = skills.length;

        const categories = new Set(skills.map(function(s) { return s.category; }));
        document.getElementById("statCategories").textContent = categories.size;
    } catch (error) {
        console.error("Error loading overview stats:", error);
    }
}

/**
 * Projects Management
 */
async function loadProjectsTable() {
    const tbody = document.getElementById("projectsTableBody");
    tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 3rem; color: var(--text-secondary);">Loading projects...</td></tr>';

    try {
        const projects = await apiRequest("/api/projects");

        if (projects.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 3rem; color: var(--text-secondary);">No projects yet. Click "Add Project" to create one.</td></tr>';
            return;
        }

        tbody.innerHTML = projects.map(function(project) {
            return '<tr>' +
                '<td>' + project.id + '</td>' +
                '<td style="font-weight: 600;">' + escapeHtml(project.title) + '</td>' +
                '<td>' + escapeHtml(project.technologies) + '</td>' +
                '<td>' +
                    (project.github_url ? '<a href="' + escapeHtml(project.github_url) + '" target="_blank" rel="noopener noreferrer" class="project-link"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg> GitHub</a>' : '') +
                    (project.live_url ? '<a href="' + escapeHtml(project.live_url) + '" target="_blank" rel="noopener noreferrer" class="project-link" style="margin-left: 0.5rem;"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg> Live</a>' : '') +
                '</td>' +
                '<td>' +
                    '<div class="table-actions">' +
                        '<button class="btn btn-secondary btn-sm" onclick="editProject(' + project.id + ')">' +
                            '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>' +
                        '</button>' +
                        '<button class="btn btn-danger btn-sm" onclick="deleteProject(' + project.id + ')">' +
                            '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>' +
                        '</button>' +
                    '</div>' +
                '</td>' +
            '</tr>';
        }).join("");
    } catch (error) {
        console.error("Error loading projects:", error);
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 3rem; color: var(--danger-color);">Failed to load projects. ' + error.message + '</td></tr>';
    }
}

async function handleProjectSubmit(e) {
    e.preventDefault();
    const id = document.getElementById("projectId").value;
    const projectData = {
        title: document.getElementById("projectTitle").value,
        description: document.getElementById("projectDescription").value,
        technologies: document.getElementById("projectTechnologies").value,
        github_url: document.getElementById("projectGithub").value,
        live_url: document.getElementById("projectLive").value,
    };

    try {
        if (id) {
            await apiRequest("/api/projects/" + id, {
                method: "PUT",
                body: JSON.stringify(projectData),
            });
            showToast("Project updated successfully!");
        } else {
            await apiRequest("/api/projects", {
                method: "POST",
                body: JSON.stringify(projectData),
            });
            showToast("Project added successfully!");
        }
        closeModal("projectModal");
        loadProjectsTable();
        loadOverviewStats();
    } catch (error) {
        console.error("Error saving project:", error);
        showToast("Error: " + error.message, "error");
    }
}

async function editProject(id) {
    try {
        const project = await apiRequest("/api/projects/" + id);
        openProjectModal(project);
    } catch (error) {
        console.error("Error loading project:", error);
        showToast("Error: " + error.message, "error");
    }
}

async function deleteProject(id) {
    if (!confirm("Are you sure you want to delete this project?")) return;

    try {
        await apiRequest("/api/projects/" + id, { method: "DELETE" });
        showToast("Project deleted successfully!");
        loadProjectsTable();
        loadOverviewStats();
    } catch (error) {
        console.error("Error deleting project:", error);
        showToast("Error: " + error.message, "error");
    }
}

/**
 * Skills Management
 */
async function loadSkillsTable() {
    const tbody = document.getElementById("skillsTableBody");
    tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 3rem; color: var(--text-secondary);">Loading skills...</td></tr>';

    try {
        const skills = await apiRequest("/api/skills");

        if (skills.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 3rem; color: var(--text-secondary);">No skills yet. Click "Add Skill" to create one.</td></tr>';
            return;
        }

        tbody.innerHTML = skills.map(function(skill) {
            return '<tr>' +
                '<td>' + skill.id + '</td>' +
                '<td style="font-weight: 600;">' + escapeHtml(skill.name) + '</td>' +
                '<td>' + escapeHtml(skill.category) + '</td>' +
                '<td><span class="skill-badge">' + escapeHtml(skill.proficiency) + '</span></td>' +
                '<td>' +
                    '<div class="table-actions">' +
                        '<button class="btn btn-secondary btn-sm" onclick="editSkill(' + skill.id + ')">' +
                            '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>' +
                        '</button>' +
                        '<button class="btn btn-danger btn-sm" onclick="deleteSkill(' + skill.id + ')">' +
                            '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>' +
                        '</button>' +
                    '</div>' +
                '</td>' +
            '</tr>';
        }).join("");
    } catch (error) {
        console.error("Error loading skills:", error);
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 3rem; color: var(--danger-color);">Failed to load skills. ' + error.message + '</td></tr>';
    }
}

async function handleSkillSubmit(e) {
    e.preventDefault();
    const id = document.getElementById("skillId").value;
    const skillData = {
        name: document.getElementById("skillName").value,
        category: document.getElementById("skillCategory").value,
        proficiency: document.getElementById("skillProficiency").value,
    };

    try {
        if (id) {
            await apiRequest("/api/skills/" + id, {
                method: "PUT",
                body: JSON.stringify(skillData),
            });
            showToast("Skill updated successfully!");
        } else {
            await apiRequest("/api/skills", {
                method: "POST",
                body: JSON.stringify(skillData),
            });
            showToast("Skill added successfully!");
        }
        closeModal("skillModal");
        loadSkillsTable();
        loadOverviewStats();
    } catch (error) {
        console.error("Error saving skill:", error);
        showToast("Error: " + error.message, "error");
    }
}

async function editSkill(id) {
    try {
        const skill = await apiRequest("/api/skills/" + id);
        openSkillModal(skill);
    } catch (error) {
        console.error("Error loading skill:", error);
        showToast("Error: " + error.message, "error");
    }
}

async function deleteSkill(id) {
    if (!confirm("Are you sure you want to delete this skill?")) return;

    try {
        await apiRequest("/api/skills/" + id, { method: "DELETE" });
        showToast("Skill deleted successfully!");
        loadSkillsTable();
        loadOverviewStats();
    } catch (error) {
        console.error("Error deleting skill:", error);
        showToast("Error: " + error.message, "error");
    }
}

/**
 * Profile Management
 */
async function loadProfile() {
    try {
        const profile = await apiRequest("/api/profile");
        document.getElementById("profileName").value = profile.name || "";
        document.getElementById("profileHeadline").value = profile.headline || "";
        document.getElementById("profileLocation").value = profile.location || "";
        document.getElementById("profileEmail").value = profile.email || "";
        document.getElementById("profileGithub").value = profile.github_url || "";
        document.getElementById("profileLinkedin").value = profile.linkedin_url || "";
        document.getElementById("profileBio").value = profile.bio || "";
        document.getElementById("profileEducation").value = profile.education || "";
        document.getElementById("profileActivities").value = profile.activities || "";
    } catch (error) {
        console.error("Error loading profile:", error);
        showToast("Error loading profile: " + error.message, "error");
    }
}

async function handleProfileSubmit(e) {
    e.preventDefault();
    const profileData = {
        name: document.getElementById("profileName").value,
        headline: document.getElementById("profileHeadline").value,
        location: document.getElementById("profileLocation").value,
        email: document.getElementById("profileEmail").value,
        github_url: document.getElementById("profileGithub").value,
        linkedin_url: document.getElementById("profileLinkedin").value,
        bio: document.getElementById("profileBio").value,
        education: document.getElementById("profileEducation").value,
        activities: document.getElementById("profileActivities").value,
    };

    try {
        await apiRequest("/api/profile", {
            method: "PUT",
            body: JSON.stringify(profileData),
        });
        showToast("Profile updated successfully!");
    } catch (error) {
        console.error("Error updating profile:", error);
        showToast("Error: " + error.message, "error");
    }
}

/**
 * Utility function to sanitize HTML
 */
function escapeHtml(str) {
    if (!str) return "";
    return str
        .replace(/&/g, "\x26amp;")
        .replace(/</g, "\x26lt;")
        .replace(/>/g, "\x26gt;")
        .replace(/"/g, "\x26quot;")
        .replace(/'/g, "\x26#039;");
}