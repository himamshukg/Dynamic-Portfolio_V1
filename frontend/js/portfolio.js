/**
 * portfolio.js
 * Cybersecurity/Terminal-Inspired Portfolio Logic
 * Fetches data from FastAPI backend and renders dynamically
 */

document.addEventListener("DOMContentLoaded", () => {
    initNavbar();
    initScrollReveal();
    initActiveNavHighlight();
    initSmoothScroll();
    initCopyEmail();
    initScrollProgress();
    initCursorGlow();
    initTerminal();
    initFlipCards();
    initProjectCardInteractions();
    initMicroInteractions();
    fetchProfile();
    fetchSkills();
    fetchProjects();
    fetchTimeline();
});

/**
 * Mobile Navigation Menu
 */
function initNavbar() {
    const hamburger = document.getElementById("hamburger");
    const navLinks = document.getElementById("navLinks");

    if (hamburger && navLinks) {
        hamburger.addEventListener("click", () => {
            const isExpanded = hamburger.getAttribute("aria-expanded") === "true";
            hamburger.setAttribute("aria-expanded", !isExpanded);
            navLinks.classList.toggle("active");
        });

        document.querySelectorAll(".nav-links a").forEach((link) => {
            link.addEventListener("click", () => {
                navLinks.classList.remove("active");
                hamburger.setAttribute("aria-expanded", "false");
            });
        });

        // Close menu on escape key
        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape" && navLinks.classList.contains("active")) {
                navLinks.classList.remove("active");
                hamburger.setAttribute("aria-expanded", "false");
                hamburger.focus();
            }
        });
    }

    // Header scroll effect
    const header = document.querySelector(".header");
    if (header) {
        const handleScroll = () => {
            if (window.scrollY > 50) {
                header.classList.add("scrolled");
            } else {
                header.classList.remove("scrolled");
            }
        };
        window.addEventListener("scroll", handleScroll, { passive: true });
    }
}

/**
 * Scroll Reveal Animations
 */
function initScrollReveal() {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
        document.querySelectorAll(".reveal").forEach(el => el.classList.add("active"));
        return;
    }

    const observerOptions = {
        root: null,
        rootMargin: "0px 0px -10% 0px",
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add("active");
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Add reveal classes to elements
    const revealElements = [
        ...document.querySelectorAll(".section-header"),
        ...document.querySelectorAll(".glass-card"),
        ...document.querySelectorAll(".skills-category-group"),
        ...document.querySelectorAll(".project-card"),
        ...document.querySelectorAll(".timeline-item"),
        ...document.querySelectorAll(".contact-card"),
        ...document.querySelectorAll(".hero-content > *"),
        ...document.querySelectorAll(".hero-actions > *")
    ];

    revealElements.forEach((el, index) => {
        el.classList.add("reveal");
        if (index % 4 === 1) el.classList.add("reveal-delay-1");
        else if (index % 4 === 2) el.classList.add("reveal-delay-2");
        else if (index % 4 === 3) el.classList.add("reveal-delay-3");
        observer.observe(el);
    });
}

/**
 * Active Navigation Highlighting
 */
function initActiveNavHighlight() {
    const sections = document.querySelectorAll("section[id]");
    const navLinks = document.querySelectorAll(".nav-link[data-section]");

    if (sections.length === 0 || navLinks.length === 0) return;

    const observerOptions = {
        root: null,
        rootMargin: "-50% 0px -50% 0px",
        threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute("id");
                navLinks.forEach((link) => {
                    link.classList.toggle("active", link.getAttribute("data-section") === id);
                });
            }
        });
    }, observerOptions);

    sections.forEach((section) => observer.observe(section));
}

/**
 * Smooth Scroll with Offset for Fixed Header
 */
function initSmoothScroll() {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const scrollBehavior = prefersReducedMotion ? "auto" : "smooth";

    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
        anchor.addEventListener("click", function (e) {
            const targetId = this.getAttribute("href");
            if (targetId === "#") return;

            const target = document.querySelector(targetId);
            if (target) {
                e.preventDefault();
                const headerHeight = document.querySelector(".header")?.offsetHeight || 72;
                const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;

                window.scrollTo({
                    top: targetPosition,
                    behavior: scrollBehavior
                });

                // Update URL without scrolling
                history.pushState(null, "", targetId);
            }
        });
    });
}

/**
 * Copy Email to Clipboard
 */
function initCopyEmail() {
    const emailLink = document.getElementById("contactEmail");
    if (!emailLink) return;

    emailLink.addEventListener("click", async (e) => {
        const email = emailLink.querySelector(".contact-value")?.textContent || "himamshukg@gmail.com";

        // Only prevent default for copy action, allow mailto to work
        if (e.ctrlKey || e.metaKey || e.shiftKey) {
            return; // Allow default behavior for modifier keys
        }

        e.preventDefault();

        try {
            await navigator.clipboard.writeText(email);
            showToast("Email copied to clipboard");
        } catch (err) {
            // Fallback for older browsers
            const textArea = document.createElement("textarea");
            textArea.value = email;
            textArea.style.position = "fixed";
            textArea.style.opacity = "0";
            document.body.appendChild(textArea);
            textArea.select();
            try {
                document.execCommand("copy");
                showToast("Email copied to clipboard");
            } catch {
                showToast("Failed to copy email", true);
            }
            document.body.removeChild(textArea);
        }
    });
}

/**
 * Toast Notification System
 */
let toastHideTimer = null;
let toastHiddenTimer = null;

function showToast(message, isError = false) {
    const toast = document.getElementById("toast");
    const toastMessage = document.getElementById("toastMessage");
    if (!toast || !toastMessage) return;

    // Clear any existing timers to reset them
    if (toastHideTimer) {
        clearTimeout(toastHideTimer);
        toastHideTimer = null;
    }
    if (toastHiddenTimer) {
        clearTimeout(toastHiddenTimer);
        toastHiddenTimer = null;
    }

    toastMessage.textContent = message;
    toast.classList.toggle("error", isError);
    toast.hidden = false;

    // Force reflow for animation
    toast.offsetHeight;
    toast.classList.add("show");

    // Auto-hide after 2 seconds
    const hideDelay = 2000;
    toastHideTimer = setTimeout(() => {
        toast.classList.remove("show");
        toastHideTimer = null;

        // Hide completely after transition
        toastHiddenTimer = setTimeout(() => {
            toast.hidden = true;
            toast.classList.remove("error");
            toastHiddenTimer = null;
        }, 260); // Match CSS transition duration
    }, hideDelay);
}

/**
 * Fetch and Render Profile
 */
async function fetchProfile() {
    const elements = {
        heroName: document.getElementById("heroName"),
        heroHeadline: document.getElementById("heroHeadline"),
        heroSubline: document.getElementById("heroSubline"),
        heroFocus: document.getElementById("heroFocus"),
        aboutBio: document.getElementById("aboutBio"),
        educationDegree: document.getElementById("aboutEducationDegree"),
        educationInstitution: document.getElementById("aboutEducationInstitution"),
        educationStatus: document.getElementById("aboutEducationStatus"),
        educationDuration: document.getElementById("aboutEducationDuration"),
        activity1: document.getElementById("aboutActivity1"),
        activity2: document.getElementById("aboutActivity2"),
        activity3: document.getElementById("aboutActivity3"),
        footerName: document.getElementById("footerName"),
        contactEmail: document.getElementById("contactEmail"),
        contactGithub: document.getElementById("contactGithub"),
        contactLinkedin: document.getElementById("contactLinkedin"),
        statProjects: document.getElementById("statProjects"),
        statSkills: document.getElementById("statSkills")
    };

    try {
        const response = await fetch(`${CONFIG.API_BASE_URL}/api/profile`);
        if (!response.ok) {
            throw new Error(`Failed to fetch profile (Status: ${response.status})`);
        }

        const data = await response.json();

        // Hero section
        if (elements.heroName) elements.heroName.textContent = data.name || "HIMAMSHU K G";
        if (elements.heroHeadline) elements.heroHeadline.textContent = data.headline || "Computer Science Student";
        if (elements.heroSubline) elements.heroSubline.textContent = "Aspiring Software Developer";
        if (elements.heroFocus) elements.heroFocus.textContent = "Backend Engineering • Cybersecurity • AI Applications";

        // Stats in hero (will be updated after projects/skills load)
        if (elements.statProjects) elements.statProjects.textContent = "—";
        if (elements.statSkills) elements.statSkills.textContent = "—";

        // About section
        if (elements.aboutBio) elements.aboutBio.textContent = data.bio || "Computer Science student passionate about building practical software solutions...";

        // Education parsing
        const education = data.education || "";
        const eduLines = education.split("\n").map(line => line.trim()).filter(line => line);
        const eduLabels = ["Degree:", "Institution:", "Status:", "Duration:"];
        const eduElements = [elements.educationDegree, elements.educationInstitution, elements.educationStatus, elements.educationDuration];

        eduElements.forEach((el, index) => {
            if (el) {
                const line = eduLines[index] || "";
                const label = eduLabels[index];
                el.textContent = line.startsWith(label) ? line : `${label} ${line}` || `${label} Not specified`;
            }
        });

        // Activities parsing
        const activities = data.activities || "";
        const actLines = activities.split("\n\n").map(line => line.trim()).filter(line => line);
        const activityElements = [elements.activity1, elements.activity2, elements.activity3];
        activityElements.forEach((el, index) => {
            if (el) el.textContent = actLines[index] || (index === 0 ? "Cybersecurity & CTF Participant" : "");
        });

        // Footer
        if (elements.footerName) elements.footerName.textContent = data.name || "Himamshu K G";

        // Contact links
        if (elements.contactEmail && data.email) {
            const emailSpan = elements.contactEmail.querySelector(".contact-value");
            if (emailSpan) emailSpan.textContent = data.email;
            elements.contactEmail.href = `mailto:${data.email}`;
        }

        if (elements.contactGithub && data.github_url) {
            elements.contactGithub.href = data.github_url;
        }

        if (elements.contactLinkedin && data.linkedin_url) {
            elements.contactLinkedin.href = data.linkedin_url;
        }

    } catch (error) {
        console.error("Error fetching profile:", error);
        if (elements.aboutBio) {
            elements.aboutBio.innerHTML = `<span class="error-message">Unable to load profile data. Please ensure the backend is running.</span>`;
        }
    }
}

/**
 * Fetch and Render Skills as Flip Cards
 */
async function fetchSkills() {
    const container = document.getElementById("skillsContainer");
    if (!container) return;

    try {
        const response = await fetch(`${CONFIG.API_BASE_URL}/api/skills`);
        if (!response.ok) {
            throw new Error(`Failed to fetch skills (Status: ${response.status})`);
        }

        const skills = await response.json();

        if (!skills || skills.length === 0) {
            container.innerHTML = `<p class="section-subtitle">No skills available at the moment.</p>`;
            return;
        }

        // Group skills by category
        const grouped = skills.reduce((acc, skill) => {
            const cat = skill.category || "General";
            if (!acc[cat]) acc[cat] = [];
            acc[cat].push(skill);
            return acc;
        }, {});

        // Sort categories: prioritize common ones
        const categoryOrder = ["Backend", "Frontend", "Database", "Tools", "General"];
        const sortedCategories = Object.keys(grouped).sort((a, b) => {
            const aIndex = categoryOrder.indexOf(a);
            const bIndex = categoryOrder.indexOf(b);
            if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
            if (aIndex !== -1) return -1;
            if (bIndex !== -1) return 1;
            return a.localeCompare(b);
        });

        let html = "";
        sortedCategories.forEach((category, catIndex) => {
            const categorySkills = grouped[category];
            html += `
                <div class="skills-category-group" style="animation-delay: ${catIndex * 100}ms">
                    <h3 class="skills-category-title">${escapeHtml(category)}</h3>
                    <div class="skills-grid">
            `;

            categorySkills.forEach((skill, skillIndex) => {
                const skillDetails = getSkillDetails(skill.name, skill.category);
                html += `
                    <div class="flip-card" style="animation-delay: ${skillIndex * 50}ms" data-skill="${escapeHtml(skill.name)}">
                        <div class="flip-card-inner">
                            <!-- Front Side -->
                            <div class="flip-card-front">
                                <div class="flip-card-icon" aria-hidden="true">${getSkillIcon(skill.name, skill.category)}</div>
                                <h4 class="flip-card-title">${escapeHtml(skill.name)}</h4>
                                <span class="flip-card-category">${escapeHtml(skill.category)}</span>
                                <span class="flip-card-badge">${escapeHtml(skill.proficiency || "Intermediate")}</span>
                                <div class="flip-hint" aria-hidden="true">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M17 18a5 5 0 0 0-10 0"></path>
                                        <path d="M12 2v20"></path>
                                    </svg>
                                    <span>Click to flip</span>
                                </div>
                            </div>
                            <!-- Back Side -->
                            <div class="flip-card-back">
                                <h4 class="flip-card-title">${escapeHtml(skill.name)}</h4>
                                <p class="flip-card-description">${escapeHtml(skillDetails.description)}</p>
                                <div class="flip-card-technologies">
                                    ${skillDetails.technologies.map(t => `<span class="tech-tag">${escapeHtml(t)}</span>`).join("")}
                                </div>
                                <div class="flip-hint" aria-hidden="true">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M17 18a5 5 0 0 0-10 0"></path>
                                        <path d="M12 2v20"></path>
                                    </svg>
                                    <span>Click to flip back</span>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            });

            html += `
                    </div>
                </div>
            `;
        });

        container.innerHTML = html;

        // Update hero stats
        const statSkills = document.getElementById("statSkills");
        if (statSkills) statSkills.textContent = skills.length;

        // Trigger scroll reveal for new elements
        // Respect reduced-motion preference
        const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const newElements = container.querySelectorAll(".skills-category-group, .flip-card");
        newElements.forEach((el, index) => {
            if (prefersReducedMotion) {
                el.classList.add("reveal", "active");
            } else {
                el.classList.add("reveal");
                if (index % 4 === 1) el.classList.add("reveal-delay-1");
                else if (index % 4 === 2) el.classList.add("reveal-delay-2");
                else if (index % 4 === 3) el.classList.add("reveal-delay-3");
                requestAnimationFrame(() => el.classList.add("active"));
            }
        });

    } catch (error) {
        console.error("Error fetching skills:", error);
        container.innerHTML = `<div class="error-message">Unable to load skills from server.</div>`;
    }
}

/**
 * Get skill details for flip card back side
 * Uses actual portfolio data - no invented experience
 */
function getSkillDetails(skillName, category) {
    const details = {
        "Python": {
            description: "Used extensively for backend development, automation scripts, and building REST APIs with FastAPI. Core language for portfolio backend and expense tracker project.",
            technologies: ["FastAPI", "File I/O", "Exception Handling", "Data Structures"]
        },
        "FastAPI": {
            description: "Primary framework for building the portfolio's REST API. Handles routing, validation, and JSON serialization. Used for projects, skills, and profile endpoints.",
            technologies: ["REST APIs", "Pydantic", "Async/Await", "CORS"]
        },
        "JavaScript (ES6+)": {
            description: "Powers all frontend interactivity including dynamic data fetching, scroll animations, particle background, flip cards, and terminal interface. Vanilla ES6+ implementation.",
            technologies: ["DOM Manipulation", "Fetch API", "IntersectionObserver", "Canvas API"]
        },
        "HTML5 & CSS3": {
            description: "Semantic markup and modern styling for the entire portfolio. Glassmorphism design system with CSS custom properties, backdrop-filter, and responsive grid layouts.",
            technologies: ["CSS Grid", "Flexbox", "Custom Properties", "Animations"]
        },
        "REST APIs": {
            description: "Designed and implemented the portfolio's backend API with full CRUD operations for projects, skills, and profile data. Follows REST conventions with proper HTTP status codes.",
            technologies: ["HTTP Methods", "JSON", "Status Codes", "CORS"]
        },
        "Git & GitHub": {
            description: "Version control for all projects. Used for collaboration, branching strategies, and GitHub Pages deployment. Repository management for portfolio and personal projects.",
            technologies: ["Git Commands", "Branching", "Pull Requests", "GitHub Actions"]
        },
        "SQL & Databases": {
            description: "Fundamental understanding of relational databases. Used SQLite for local development and data persistence in learning projects. Familiar with queries, joins, and schema design.",
            technologies: ["SQLite", "SELECT/JOIN", "Schema Design", "CRUD Operations"]
        }
    };

    return details[skillName] || {
        description: `Experience with ${skillName} in ${category.toLowerCase()} development through coursework and personal projects.`,
        technologies: [category, "Learning", "Projects"]
    };
}

/**
 * Get skill icon based on name and category
 */
function getSkillIcon(skillName, category) {
    const icons = {
        "Python": "🐍",
        "FastAPI": "⚡",
        "JavaScript (ES6+)": "📜",
        "HTML5 & CSS3": "🌐",
        "REST APIs": "🔗",
        "Git & GitHub": "📦",
        "SQL & Databases": "🗄️"
    };
    return icons[skillName] || (category === "Backend" ? "⚙️" : category === "Frontend" ? "🎨" : category === "Tools" ? "🔧" : "💡");
}

/**
 * Fetch and Render Projects as Flip Cards
 */
async function fetchProjects() {
    const container = document.getElementById("projectsContainer");
    if (!container) return;

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

        let html = '<div class="projects-grid">';

        projects.forEach((proj, index) => {
            // Tech tags
            const techList = proj.technologies
                ? proj.technologies.split(",").map((t) => t.trim()).filter(Boolean)
                : [];
            const techHtml = techList
                .map((t) => `<span class="tech-tag">${escapeHtml(t)}</span>`)
                .join("");

            // Links
            let linksHtml = "";
            if (proj.github_url) {
                linksHtml += `
                    <a href="${escapeHtml(proj.github_url)}" target="_blank" rel="noopener noreferrer" class="project-link">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
                        </svg>
                        Source Code
                    </a>
                `;
            }
            if (proj.live_url) {
                linksHtml += `
                    <a href="${escapeHtml(proj.live_url)}" target="_blank" rel="noopener noreferrer" class="project-link">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                            <polyline points="15 3 21 3 21 9"></polyline>
                            <line x1="10" y1="14" x2="21" y2="3"></line>
                        </svg>
                        Live Demo
                    </a>
                `;
            }

            // Check for "under development" in title or description
            const isUnderDevelopment = /under development|work in progress|wip/i.test(proj.title + " " + proj.description);

            // Get project details for back side
            const projectDetails = getProjectDetails(proj);

            html += `
                <div class="flip-card project-flip-card" style="animation-delay: ${index * 100}ms" data-project="${escapeHtml(proj.title)}">
                    <div class="flip-card-inner">
                        <!-- Front Side -->
                        <div class="flip-card-front project-front">
                            <div class="project-header">
                                <h3 class="project-title">${escapeHtml(proj.title)}</h3>
                                ${isUnderDevelopment ? '<span class="project-status">Under Development</span>' : ''}
                            </div>
                            <p class="project-desc">${escapeHtml(proj.description)}</p>
                            <div class="project-tech">${techHtml}</div>
                            <div class="flip-hint" aria-hidden="true">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M17 18a5 5 0 0 0-10 0"></path>
                                    <path d="M12 2v20"></path>
                                </svg>
                                <span>Click to flip</span>
                            </div>
                        </div>
                        <!-- Back Side -->
                        <div class="flip-card-back project-back">
                            <h3 class="project-title">${escapeHtml(proj.title)}</h3>
                            <div class="project-tech">${techHtml}</div>
                            <div class="project-details">
                                <h4 class="flip-card-subtitle">Key Features</h4>
                                <ul class="project-features">
                                    ${projectDetails.features.map(f => `<li>${escapeHtml(f)}</li>`).join("")}
                                </ul>
                            </div>
                            <div class="project-links">${linksHtml}</div>
                            <div class="flip-hint" aria-hidden="true">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M17 18a5 5 0 0 0-10 0"></path>
                                    <path d="M12 2v20"></path>
                                </svg>
                                <span>Click to flip back</span>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });

        html += '</div>';
        container.innerHTML = html;

        // Update hero stats
        const statProjects = document.getElementById("statProjects");
        if (statProjects) statProjects.textContent = projects.length;

        // Trigger scroll reveal for new elements (but make them visible immediately)
        // Respect reduced-motion preference
        const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const newElements = container.querySelectorAll(".project-flip-card");
        newElements.forEach((el, index) => {
            if (prefersReducedMotion) {
                el.classList.add("reveal", "active");
            } else {
                el.classList.add("reveal");
                if (index % 4 === 1) el.classList.add("reveal-delay-1");
                else if (index % 4 === 2) el.classList.add("reveal-delay-2");
                else if (index % 4 === 3) el.classList.add("reveal-delay-3");
                requestAnimationFrame(() => el.classList.add("active"));
            }
        });

    } catch (error) {
        console.error("Error fetching projects:", error);
        container.innerHTML = `<div class="error-message">Unable to load projects from server.</div>`;
    }
}

/**
 * Get project details for flip card back side
 * Uses actual portfolio data
 */
function getProjectDetails(project) {
    const details = {
        "Dynamic Portfolio Website": {
            features: [
                "Interactive admin dashboard with authentication",
                "REST API with FastAPI backend",
                "Real-time data fetching with vanilla JavaScript",
                "Glassmorphism design with CSS backdrop-filter",
                "Responsive layout with CSS Grid/Flexbox"
            ]
        },
        "Expense Tracker": {
            features: [
                "Command-line interface for expense management",
                "Category-based expense tracking",
                "Data persistence with JSON file storage",
                "Error handling and input validation",
                "Summary reports with totals"
            ]
        },
        "Weather App": {
            features: [
                "OpenWeather API integration",
                "Multi-city weather lookup",
                "Real-time temperature and conditions",
                "City search with validation",
                "Cached responses for performance"
            ]
        }
    };

    return details[project.title] || {
        features: [
            "Built with modern web technologies",
            "Responsive and accessible design",
            "Clean, maintainable codebase",
            "Version controlled with Git"
        ]
    };
}

/**
 * Fetch and Render Education/Activities Timeline
 */
async function fetchTimeline() {
    const container = document.getElementById("timelineContainer");
    if (!container) return;

    try {
        const [profileRes, skillsRes] = await Promise.all([
            fetch(`${CONFIG.API_BASE_URL}/api/profile`),
            fetch(`${CONFIG.API_BASE_URL}/api/skills`)
        ]);

        if (!profileRes.ok) throw new Error("Failed to fetch profile");
        if (!skillsRes.ok) throw new Error("Failed to fetch skills");

        const profile = await profileRes.json();
        const skills = await skillsRes.json();

        // Build timeline items
        const timelineItems = [];

        // Education
        const education = profile.education || "";
        const eduLines = education.split("\n").map(line => line.trim()).filter(line => line);
        if (eduLines.length > 0) {
            timelineItems.push({
                period: "2026 – 2030",
                title: "B.E. Computer Science & Engineering",
                detail: "University Visvesvaraya College of Engineering (UVCE), Bengaluru — Currently Pursuing"
            });
        }

        // Activities from profile
        const activities = profile.activities || "";
        const actLines = activities.split("\n\n").map(line => line.trim()).filter(line => line);
        actLines.forEach((activity, index) => {
            timelineItems.push({
                period: "Ongoing",
                title: `Activity ${index + 1}`,
                detail: activity
            });
        });

        // Skills as timeline items (optional - show latest skills)
        if (skills && skills.length > 0) {
            const recentSkills = skills.slice(0, 3);
            recentSkills.forEach((skill, index) => {
                timelineItems.push({
                    period: "Current",
                    title: skill.name,
                    detail: `${skill.category} • ${skill.proficiency}`
                });
            });
        }

        if (timelineItems.length === 0) {
            container.innerHTML = `<p class="section-subtitle" style="text-align: center;">No timeline data available.</p>`;
            return;
        }

        let html = "";
        timelineItems.forEach((item, index) => {
            html += `
                <div class="timeline-item" style="animation-delay: ${index * 150}ms">
                    <div class="timeline-marker">
                        <div class="timeline-dot"></div>
                    </div>
                    <div class="timeline-content">
                        <div class="timeline-period">${escapeHtml(item.period)}</div>
                        <h3 class="timeline-title">${escapeHtml(item.title)}</h3>
                        <p class="timeline-detail">${escapeHtml(item.detail)}</p>
                    </div>
                </div>
            `;
        });

        container.innerHTML = html;

        // Trigger scroll reveal for new elements (but make them visible immediately)
        // Respect reduced-motion preference
        const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        const newElements = container.querySelectorAll(".timeline-item");
        newElements.forEach((el, index) => {
            if (prefersReducedMotion) {
                el.classList.add("reveal", "active");
            } else {
                el.classList.add("reveal");
                if (index % 4 === 1) el.classList.add("reveal-delay-1");
                else if (index % 4 === 2) el.classList.add("reveal-delay-2");
                else if (index % 4 === 3) el.classList.add("reveal-delay-3");
                requestAnimationFrame(() => el.classList.add("active"));
            }
        });

    } catch (error) {
        console.error("Error fetching timeline:", error);
        container.innerHTML = `<div class="error-message">Unable to load timeline data.</div>`;
    }
}

/**
 * Utility: Escape HTML
 */
function escapeHtml(str) {
    if (!str) return "";
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}/**
 * Scroll Progress Indicator
 */
function initScrollProgress() {
    const progressBar = document.getElementById("scrollProgressBar");
    if (!progressBar) return;

    const updateProgress = () => {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
        progressBar.style.width = `${Math.min(100, Math.max(0, progress))}%`;
    };

    // Use passive listener for performance
    window.addEventListener("scroll", updateProgress, { passive: true });
    // Initial update
    updateProgress();
}

/**
 * Interactive Cursor Glow
 */
function initCursorGlow() {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isTouchDevice = "ontouchstart" in window || navigator.maxTouchPoints > 0;

    // Disable on touch devices or if reduced motion is preferred
    if (prefersReducedMotion || isTouchDevice) return;

    const cursorGlow = document.getElementById("cursorGlow");
    if (!cursorGlow) return;

    let mouseX = 0;
    let mouseY = 0;
    let glowX = 0;
    let glowY = 0;
    let animationId = null;

    // Smooth follow animation
    const animate = () => {
        // Easing for smooth follow
        glowX += (mouseX - glowX) * 0.15;
        glowY += (mouseY - glowY) * 0.15;

        cursorGlow.style.transform = `translate(${glowX - 200}px, ${glowY - 200}px)`;
        animationId = requestAnimationFrame(animate);
    };

    const handleMouseMove = (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;

        // Activate glow on first move
        if (!cursorGlow.classList.contains("active")) {
            cursorGlow.classList.add("active");
            if (!animationId) animate();
        }
    };

    const handleMouseLeave = () => {
        cursorGlow.classList.remove("active");
    };

    document.addEventListener("mousemove", handleMouseMove, { passive: true });
    document.addEventListener("mouseleave", handleMouseLeave);
}

/**
 * Interactive Terminal with Clickable Commands
 */
function initTerminal() {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const terminalInput = document.getElementById("terminalInput");
    const panelBody = document.querySelector(".hero-panel-body");

    if (!terminalInput || !panelBody) return;

    // Terminal commands
    const commands = {
        about: { desc: "Navigate to About section", action: () => scrollToSection("about") },
        skills: { desc: "Navigate to Skills section", action: () => scrollToSection("skills") },
        projects: { desc: "Navigate to Projects section", action: () => scrollToSection("projects") },
        contact: { desc: "Navigate to Contact section", action: () => scrollToSection("contact") },
        education: { desc: "Navigate to Education section", action: () => scrollToSection("education") },
        help: { desc: "Show available commands", action: showHelp },
        clear: { desc: "Clear terminal output", action: clearTerminal },
        whoami: { desc: "Display identity", action: () => appendOutput("HIMAMSHU K G") },
        profile: { desc: "Display profile summary", action: showProfile }
    };

    // Available command names for help
    const commandNames = Object.keys(commands);

    function scrollToSection(sectionId) {
        const section = document.getElementById(sectionId);
        if (section) {
            const headerHeight = document.querySelector(".header")?.offsetHeight || 72;
            const targetPosition = section.getBoundingClientRect().top + window.pageYOffset - headerHeight;

            window.scrollTo({
                top: targetPosition,
                behavior: prefersReducedMotion ? "auto" : "smooth"
            });

            history.pushState(null, "", "#" + sectionId);
            appendOutput(`Navigating to ${sectionId}...`);
        }
    }

    function showHelp() {
        appendOutput("Available commands:");
        commandNames.forEach(cmd => {
            appendOutput(`  ${cmd.padEnd(12)} - ${commands[cmd].desc}`);
        });
    }

    function clearTerminal() {
        // Keep only the first 5 lines (header info) and help line
        const lines = panelBody.querySelectorAll(".hero-panel-line");
        lines.forEach((line, index) => {
            if (index >= 11) { // Remove lines after help
                line.remove();
            }
        });
        // Reset cursor
        terminalInput.textContent = "_";
        terminalInput.focus();
    }

    function showProfile() {
        appendOutput("Name: HIMAMSHU K G");
        appendOutput("Role: Computer Science Student");
        appendOutput("Focus: Backend Engineering • Cybersecurity • AI Applications");
        appendOutput("Location: Bengaluru, India");
        appendOutput("Status: Open to opportunities");
    }

    function appendOutput(text) {
        const line = document.createElement("div");
        line.className = "hero-panel-line output";
        line.innerHTML = `<span class="hero-panel-prompt">$</span><span class="hero-panel-output">${escapeHtml(text)}</span>`;
        panelBody.insertBefore(line, terminalInput.parentElement);
    }

    function appendCommand(cmd) {
        const line = document.createElement("div");
        line.className = "hero-panel-line";
        line.innerHTML = `<span class="hero-panel-prompt">$</span><span class="hero-panel-command">${escapeHtml(cmd)}</span>`;
        panelBody.insertBefore(line, terminalInput.parentElement);
    }

    // Handle keyboard input
    terminalInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            const input = terminalInput.textContent.trim().toLowerCase();

            if (input) {
                // Replace cursor with command
                terminalInput.parentElement.innerHTML = `<span class="hero-panel-prompt">$</span><span class="hero-panel-command">${escapeHtml(input)}</span>`;

                // Execute command
                if (commands[input]) {
                    commands[input].action();
                } else {
                    appendOutput(`Command not found: ${escapeHtml(input)}. Type 'help' for available commands.`);
                }

                // Create new cursor line
                const newLine = document.createElement("div");
                newLine.className = "hero-panel-line";
                newLine.innerHTML = `<span class="hero-panel-prompt">$</span><span class="hero-panel-command hero-panel-cursor" id="terminalInput" contenteditable="true" data-placeholder="Type a command...">_</span>`;
                panelBody.appendChild(newLine);

                // Re-attach event listener to new input
                const newInput = document.getElementById("terminalInput");
                if (newInput) {
                    newInput.focus();
                    // Move cursor to end
                    const range = document.createRange();
                    const sel = window.getSelection();
                    range.selectNodeContents(newInput);
                    range.collapse(false);
                    sel.removeAllRanges();
                    sel.addRange(range);
                }
            }
        } else if (e.key === "Backspace" && terminalInput.textContent === "_") {
            e.preventDefault();
        }
    });

    // Prevent placeholder from being submitted
    terminalInput.addEventListener("focus", () => {
        if (terminalInput.textContent === "_" || terminalInput.textContent === "Type a command...") {
            terminalInput.textContent = "";
        }
    });

    terminalInput.addEventListener("blur", () => {
        if (terminalInput.textContent === "") {
            terminalInput.textContent = "_";
        }
    });

    // Blinking cursor
    if (!prefersReducedMotion) {
        terminalInput.style.animation = "cursorBlink 1.2s ease-in-out infinite";
    }

    // Click on command lines to execute (for the help output)
    panelBody.addEventListener("click", (e) => {
        const commandElement = e.target.closest(".hero-panel-command:not(.hero-panel-cursor)");
        if (commandElement && !commandElement.isContentEditable) {
            const cmd = commandElement.textContent.trim().toLowerCase();
            if (commands[cmd]) {
                commands[cmd].action();
            }
        }
    });

    // Add visual indicator that commands are clickable
    panelBody.addEventListener("mouseover", (e) => {
        const commandElement = e.target.closest(".hero-panel-command:not(.hero-panel-cursor)");
        if (commandElement && !commandElement.isContentEditable) {
            commandElement.style.cursor = "pointer";
            commandElement.style.color = "var(--accent-secondary)";
        }
    });

    panelBody.addEventListener("mouseout", (e) => {
        const commandElement = e.target.closest(".hero-panel-command:not(.hero-panel-cursor)");
        if (commandElement && !commandElement.isContentEditable) {
            commandElement.style.cursor = "";
            commandElement.style.color = "";
        }
    });
}

/**
 * Initialize Flip Cards
 */
function initFlipCards() {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Handle flip card clicks
    document.addEventListener("click", (e) => {
        const flipCard = e.target.closest(".flip-card");
        if (!flipCard) return;

        // Don't flip if clicking on links inside the card
        if (e.target.closest("a")) return;

        flipCard.classList.toggle("flipped");

        // Announce for accessibility
        const isFlipped = flipCard.classList.contains("flipped");
        flipCard.setAttribute("aria-label", isFlipped ? "Card flipped, showing details" : "Card showing front, click to flip");
    }, { passive: true });

    // Keyboard support for flip cards
    document.addEventListener("keydown", (e) => {
        const flipCard = e.target.closest(".flip-card");
        if (!flipCard) return;

        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            flipCard.classList.toggle("flipped");
        }
    });

    // Touch support for mobile - tap to flip
    let touchStartTime = 0;
    document.addEventListener("touchstart", (e) => {
        const flipCard = e.target.closest(".flip-card");
        if (flipCard) {
            touchStartTime = Date.now();
        }
    }, { passive: true });

    document.addEventListener("touchend", (e) => {
        const flipCard = e.target.closest(".flip-card");
        if (flipCard && !e.target.closest("a")) {
            const touchDuration = Date.now() - touchStartTime;
            // Only flip on tap (not scroll)
            if (touchDuration < 300) {
                flipCard.classList.toggle("flipped");
            }
        }
    }, { passive: true });

    // Hover effect for desktop
    if (!prefersReducedMotion) {
        document.addEventListener("mouseover", (e) => {
            const flipCard = e.target.closest(".flip-card");
            if (flipCard) {
                flipCard.classList.add("hovered");
            }
        }, { passive: true });

        document.addEventListener("mouseout", (e) => {
            const flipCard = e.target.closest(".flip-card");
            if (flipCard) {
                flipCard.classList.remove("hovered");
            }
        }, { passive: true });
    }
}

/**
 * Project Card Interactions (legacy support)
 */
function initProjectCardInteractions() {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    document.addEventListener("mouseover", (e) => {
        if (prefersReducedMotion) return;

        const card = e.target.closest(".project-card:not(.flip-card)");
        if (!card) return;

        // Add hover lift class
        card.classList.add("project-hover");
    }, { passive: true });

    document.addEventListener("mouseout", (e) => {
        const card = e.target.closest(".project-card:not(.flip-card)");
        if (!card) return;

        card.classList.remove("project-hover");
    }, { passive: true });
}

/**
 * Micro-interactions for buttons, cards, links
 */
function initMicroInteractions() {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Button ripple effect
    document.querySelectorAll(".btn").forEach((btn) => {
        btn.addEventListener("click", function(e) {
            if (prefersReducedMotion) return;

            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const ripple = document.createElement("span");
            ripple.className = "btn-ripple";
            ripple.style.left = `${x}px`;
            ripple.style.top = `${y}px`;

            this.appendChild(ripple);

            ripple.addEventListener("animationend", () => {
                ripple.remove();
            });
        });
    });

    // Nav link hover underline animation
    document.querySelectorAll(".nav-link").forEach((link) => {
        link.addEventListener("mouseenter", () => {
            if (prefersReducedMotion) return;
            link.style.setProperty("--underline-width", "100%");
        });

        link.addEventListener("mouseleave", () => {
            if (prefersReducedMotion) return;
            link.style.setProperty("--underline-width", "0%");
        });
    });

    // Skill card tilt effect on hover
    document.querySelectorAll(".skill-card").forEach((card) => {
        card.addEventListener("mousemove", (e) => {
            if (prefersReducedMotion) return;

            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = ((y - centerY) / centerY) * 3;
            const rotateY = ((centerX - x) / centerX) * 3;

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
        }, { passive: true });

        card.addEventListener("mouseleave", () => {
            if (prefersReducedMotion) return;
            card.style.transform = "";
        });
    });

    // Contact card pulse on hover
    document.querySelectorAll(".contact-card").forEach((card) => {
        card.addEventListener("mouseenter", () => {
            if (prefersReducedMotion) return;
            card.style.boxShadow = "var(--shadow-lg), var(--shadow-cyan-glow)";
        });

        card.addEventListener("mouseleave", () => {
            if (prefersReducedMotion) return;
            card.style.boxShadow = "";
        });
    });

    // Timeline marker pulse on hover
    document.querySelectorAll(".timeline-item").forEach((item) => {
        const marker = item.querySelector(".timeline-dot");
        if (!marker) return;

        item.addEventListener("mouseenter", () => {
            if (prefersReducedMotion) return;
            marker.style.transform = "scale(1.3)";
            marker.style.boxShadow = "0 0 20px var(--accent-glow)";
        });

        item.addEventListener("mouseleave", () => {
            if (prefersReducedMotion) return;
            marker.style.transform = "";
            marker.style.boxShadow = "";
        });
    });
}
