/**
 * portfolio.js
 * Logic for fetching portfolio content from the FastAPI backend API
 * and rendering it dynamically on index.html.
 */

document.addEventListener("DOMContentLoaded", () => {
  initNavbar();
  fetchProfile();
  fetchSkills();
  fetchProjects();
});

/**
 * Mobile navigation menu setup
 */
function initNavbar() {
  const hamburger = document.getElementById("hamburger");
  const navLinks = document.getElementById("navLinks");

  if (hamburger && navLinks) {
    hamburger.addEventListener("click", () => {
      navLinks.classList.toggle("active");
    });

    document.querySelectorAll(".nav-links a").forEach((link) => {
      link.addEventListener("click", () => {
        navLinks.classList.remove("active");
      });
    });
  }
}

/**
 * Fetch and render Profile information
 */
async function fetchProfile() {
  const heroNameEl = document.getElementById("heroName");
  const heroHeadlineEl = document.getElementById("heroHeadline");
  const heroBioEl = document.getElementById("heroBio");
  const aboutBioEl = document.getElementById("aboutBio");
  const educationDegreeEl = document.getElementById("aboutEducationDegree");
  const educationInstitutionEl = document.getElementById("aboutEducationInstitution");
  const educationStatusEl = document.getElementById("aboutEducationStatus");
  const educationDurationEl = document.getElementById("aboutEducationDuration");
  const activity1El = document.getElementById("aboutActivity1");
  const activity2El = document.getElementById("aboutActivity2");
  const activity3El = document.getElementById("aboutActivity3");
  const contactEmailEl = document.getElementById("contactEmail");
  const contactGithubEl = document.getElementById("contactGithub");
  const contactLinkedinEl = document.getElementById("contactLinkedin");
  const footerNameEl = document.getElementById("footerName");

  try {
    const response = await fetch(`${CONFIG.API_BASE_URL}/api/profile`);
    if (!response.ok) {
      throw new Error(`Failed to fetch profile (Status: ${response.status})`);
    }

    const data = await response.json();

    if (heroNameEl) heroNameEl.textContent = data.name || "Himamshu K G";
    if (heroHeadlineEl) heroHeadlineEl.textContent = data.headline || "";
    if (heroBioEl) heroBioEl.textContent = data.bio || "";
    if (aboutBioEl) aboutBioEl.textContent = data.bio || "";

    // Parse education string into separate lines
    const education = data.education || "";
    const eduLines = education.split("\n").map(line => line.trim()).filter(line => line);
    if (educationDegreeEl) educationDegreeEl.textContent = eduLines[0] || "Degree: Not specified";
    if (educationInstitutionEl) educationInstitutionEl.textContent = eduLines[1] || "Institution: Not specified";
    if (educationStatusEl) educationStatusEl.textContent = eduLines[2] || "Status: Not specified";
    if (educationDurationEl) educationDurationEl.textContent = eduLines[3] || "Duration: Not specified";

    // Parse activities string into separate lines (separated by blank lines)
    const activities = data.activities || "";
    const actLines = activities.split("\n\n").map(line => line.trim()).filter(line => line);
    if (activity1El) activity1El.textContent = actLines[0] || "Not specified";
    if (activity2El) activity2El.textContent = actLines[1] || "";
    if (activity3El) activity3El.textContent = actLines[2] || "";

    if (footerNameEl) footerNameEl.textContent = data.name || "Himamshu K G";

    if (contactEmailEl && data.email) {
      contactEmailEl.textContent = data.email;
      contactEmailEl.href = `mailto:${data.email}`;
    }

    if (contactGithubEl && data.github_url) {
      contactGithubEl.href = data.github_url;
    }

    if (contactLinkedinEl && data.linkedin_url) {
      contactLinkedinEl.href = data.linkedin_url;
    }
  } catch (error) {
    console.error("Error fetching profile:", error);
    if (heroBioEl) {
      heroBioEl.innerHTML = `<span class="error-message">Could not load profile data from API. Please ensure the backend is running.</span>`;
    }
  }
}

/**
 * Fetch and render Skills grouped by category
 */
async function fetchSkills() {
  const container = document.getElementById("skillsContainer");
  if (!container) return;

  container.innerHTML = `<div class="loading-spinner">Loading skills...</div>`;

  try {
    const response = await fetch(`${CONFIG.API_BASE_URL}/api/skills`);
    if (!response.ok) {
      throw new Error(`Failed to fetch skills (Status: ${response.status})`);
    }

    const skills = await response.json();

    if (!skills || skills.length === 0) {
      container.innerHTML = `<p class="section-subtitle">No skills added yet.</p>`;
      return;
    }

    // Group skills by category
    const grouped = skills.reduce((acc, skill) => {
      const cat = skill.category || "General";
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(skill);
      return acc;
    }, {});

    container.innerHTML = "";

    Object.keys(grouped).forEach((category) => {
      const groupEl = document.createElement("div");
      groupEl.className = "skills-category-group";

      const titleEl = document.createElement("h3");
      titleEl.className = "skills-category-title";
      titleEl.textContent = category;

      const gridEl = document.createElement("div");
      gridEl.className = "skills-grid";

      grouped[category].forEach((skill) => {
        const card = document.createElement("div");
        card.className = "skill-card";

        const nameSpan = document.createElement("span");
        nameSpan.className = "skill-name";
        nameSpan.textContent = skill.name;

        const badgeSpan = document.createElement("span");
        badgeSpan.className = "skill-badge";
        badgeSpan.textContent = skill.proficiency;

        card.appendChild(nameSpan);
        card.appendChild(badgeSpan);
        gridEl.appendChild(card);
      });

      groupEl.appendChild(titleEl);
      groupEl.appendChild(gridEl);
      container.appendChild(groupEl);
    });
  } catch (error) {
    console.error("Error fetching skills:", error);
    container.innerHTML = `<div class="error-message">Unable to load skills from server.</div>`;
  }
}

/**
 * Fetch and render Projects
 */
async function fetchProjects() {
  const container = document.getElementById("projectsContainer");
  if (!container) return;

  container.innerHTML = `<div class="loading-spinner">Loading projects...</div>`;

  try {
    const response = await fetch(`${CONFIG.API_BASE_URL}/api/projects`);
    if (!response.ok) {
      throw new Error(`Failed to fetch projects (Status: ${response.status})`);
    }

    const projects = await response.json();

    if (!projects || projects.length === 0) {
      container.innerHTML = `<p class="section-subtitle">No projects available at the moment.</p>`;
      return;
    }

    container.innerHTML = "";
    const grid = document.createElement("div");
    grid.className = "projects-grid";

    projects.forEach((proj) => {
      const card = document.createElement("div");
      card.className = "project-card";

      // Tech tags array
      const techList = proj.technologies
        ? proj.technologies.split(",").map((t) => t.trim())
        : [];
      const techHtml = techList
        .map((t) => `<span class="tech-tag">${escapeHtml(t)}</span>`)
        .join("");

      // Link tags
      let linksHtml = "";
      if (proj.github_url) {
        linksHtml += `<a href="${escapeHtml(proj.github_url)}" target="_blank" rel="noopener noreferrer" class="project-link">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
          Source Code
        </a>`;
      }
      if (proj.live_url) {
        linksHtml += `<a href="${escapeHtml(proj.live_url)}" target="_blank" rel="noopener noreferrer" class="project-link">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
          Live Demo
        </a>`;
      }

      card.innerHTML = `
        <div>
          <h3 class="project-title">${escapeHtml(proj.title)}</h3>
          <p class="project-desc">${escapeHtml(proj.description)}</p>
        </div>
        <div>
          <div class="project-tech">${techHtml}</div>
          <div class="project-links">${linksHtml}</div>
        </div>
      `;

      grid.appendChild(card);
    });

    container.appendChild(grid);
  } catch (error) {
    console.error("Error fetching projects:", error);
    container.innerHTML = `<div class="error-message">Unable to load projects from server.</div>`;
  }
}

/**
 * Utility function to sanitize HTML input text
 */
function escapeHtml(str) {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
