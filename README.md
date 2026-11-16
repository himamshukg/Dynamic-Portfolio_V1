# Dynamic Portfolio

A modern, responsive personal portfolio website with an interactive admin dashboard powered by FastAPI REST backend and vanilla JavaScript.

## Features

- **Public Portfolio**: Hero section, About Me, Skills (grouped by category), Projects, Contact sections
- **Admin Dashboard**: Secure authentication, project/skill/profile CRUD with modal forms
- **Persistent Storage**: JSON file-based persistence - data survives server restarts
- **Responsive Design**: Works on desktop and mobile
- **Secure Authentication**: Server-side authentication with HTTP-only cookies and bcrypt password hashing

## Tech Stack

- **Backend**: Python FastAPI
- **Frontend**: Vanilla JavaScript (ES6+), HTML5, CSS3
- **Storage**: Local JSON file (`backend/data/portfolio.json`)
- **Authentication**: bcrypt password hashing, HTTP-only session cookies

## Getting Started

### Prerequisites

- Python 3.8+
- pip

### Installation

```bash
cd backend
pip install fastapi uvicorn pydantic bcrypt python-dotenv
```

### Configuration

1. Copy the example environment file:
   ```bash
   cp backend/.env.example backend/.env
   ```

2. Edit `backend/.env` with your secure admin credentials:
   ```bash
   ADMIN_USERNAME=your_username
   ADMIN_PASSWORD_HASH=your_bcrypt_hashed_password
   ```

3. Generate a bcrypt password hash:
   ```bash
   python -c "import bcrypt; print(bcrypt.hashpw(b'your_password', bcrypt.gensalt()).decode())"
   ```
   Copy the output to `ADMIN_PASSWORD_HASH` in your `.env` file.

**Important**: Never commit `.env` to version control. It's already in `.gitignore`.

### Running the Backend

```bash
cd backend
uvicorn main:app --reload
```

The API will be available at:
- API: http://127.0.0.1:8000
- API Docs (Swagger): http://127.0.0.1:8000/docs
- Health Check: http://127.0.0.1:8000/api/health

### Accessing the Frontend

Open `frontend/index.html` in a browser, or serve it with a static server:

```bash
cd frontend
python -m http.server 3000
```

Then visit http://localhost:3000

### Admin Dashboard

1. Navigate to `admin.html` (or click "Admin" in the navigation)
2. Login with the credentials you configured in `backend/.env`
3. Manage projects, skills, and profile data

## JSON File Persistence

All portfolio data is stored in `backend/data/portfolio.json`:

```json
{
  "profile": { ... },
  "projects": [ ... ],
  "skills": [ ... ]
}
```

### How It Works

1. **On startup**: The backend loads data from `portfolio.json`
2. **On write operations** (create, update, delete): Changes are immediately saved to `portfolio.json`
3. **If file doesn't exist**: Created automatically with default seed data
4. **If file is corrupted**: Backed up as `portfolio.json.backup` and recreated with defaults

### Data Structure

- **profile**: name, headline, location, bio, email, github_url, linkedin_url, education, activities
- **projects**: array of objects with id, title, description, technologies, github_url, live_url
- **skills**: array of objects with id, name, category, proficiency

### Testing Persistence

1. Start the backend: `uvicorn main:app --reload`
2. Open admin dashboard and add a project/skill
3. Stop the backend (Ctrl+C)
4. Start the backend again
5. Verify the project/skill is still present in the admin dashboard

## Authentication

### Login Flow

1. User submits credentials to `POST /api/auth/login`
2. Server verifies credentials against `.env` (bcrypt hash comparison)
3. On success, server creates session and sets HTTP-only cookie
4. Subsequent requests include cookie automatically (credentials: "include")
5. Protected endpoints require valid session via `Depends(require_auth)`

### Security Features

- **No credentials in frontend**: Admin credentials only exist in backend `.env`
- **Bcrypt hashing**: Passwords stored as bcrypt hashes, never plain text
- **HTTP-only cookies**: Session tokens not accessible via JavaScript
- **Server-side protection**: All write endpoints require authentication
- **CORS with credentials**: Configured for cross-origin cookie support

### API Authentication Endpoints

- `POST /api/auth/login` - Login (returns session cookie)
- `POST /api/auth/logout` - Logout (clears session)
- `GET /api/auth/me` - Get current user info

### Protected Endpoints (require authentication)

All write operations:
- `POST /api/projects` - Create project
- `PUT /api/projects/{id}` - Update project
- `DELETE /api/projects/{id}` - Delete project
- `POST /api/skills` - Create skill
- `PUT /api/skills/{id}` - Update skill
- `DELETE /api/skills/{id}` - Delete skill
- `PUT /api/profile` - Update profile

Public read endpoints (no auth required):
- `GET /api/projects`
- `GET /api/projects/{id}`
- `GET /api/skills`
- `GET /api/skills/{id}`
- `GET /api/profile`
- `GET /api/health`

## API Endpoints

### Projects
- `GET /api/projects` - List all projects
- `GET /api/projects/{id}` - Get a project
- `POST /api/projects` - Create a project (auth required)
- `PUT /api/projects/{id}` - Update a project (auth required)
- `DELETE /api/projects/{id}` - Delete a project (auth required)

### Skills
- `GET /api/skills` - List all skills
- `GET /api/skills/{id}` - Get a skill
- `POST /api/skills` - Create a skill (auth required)
- `PUT /api/skills/{id}` - Update a skill (auth required)
- `DELETE /api/skills/{id}` - Delete a skill (auth required)

### Profile
- `GET /api/profile` - Get profile
- `PUT /api/profile` - Update profile (auth required)

### Authentication
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

### Health
- `GET /api/health` - Health check

## Project Structure

```
dynamic-portfolio/
├── backend/
│   ├── main.py              # FastAPI app entry point
│   ├── storage.py           # JSON file persistence layer
│   ├── data.py              # Data access layer
│   ├── auth.py              # Authentication module
│   ├── .env                 # Admin credentials (NOT in git)
│   ├── .env.example         # Example env file
│   ├── data/
│   │   └── portfolio.json   # Persistent data file
│   └── routes/
│       ├── projects.py      # Project CRUD endpoints
│       ├── skills.py        # Skill CRUD endpoints
│       └── profile.py       # Profile endpoints
└── frontend/
    ├── index.html           # Public portfolio
    ├── admin.html           # Admin dashboard
    ├── css/
    │   ├── style.css        # Main styles
    │   └── admin.css        # Admin styles
    └── js/
        ├── config.js        # Configuration (no credentials)
        ├── portfolio.js     # Public portfolio logic
        └── admin.js         # Admin dashboard logic
```

## License

MIT

## JSON File Persistence

All portfolio data is stored in `backend/data/portfolio.json`:

```json
{
  "profile": { ... },
  "projects": [ ... ],
  "skills": [ ... ]
}
```

### How It Works

1. **On startup**: The backend loads data from `portfolio.json`
2. **On write operations** (create, update, delete): Changes are immediately saved to `portfolio.json`
3. **If file doesn't exist**: Created automatically with default seed data
4. **If file is corrupted**: Backed up as `portfolio.json.backup` and recreated with defaults

### Data Structure

- **profile**: name, headline, location, bio, email, github_url, linkedin_url, education, activities
- **projects**: array of objects with id, title, description, technologies, github_url, live_url
- **skills**: array of objects with id, name, category, proficiency

### Testing Persistence

1. Start the backend: `uvicorn main:app --reload`
2. Open admin dashboard and add a project/skill
3. Stop the backend (Ctrl+C)
4. Start the backend again
5. Verify the project/skill is still present in the admin dashboard

## API Endpoints

### Projects
- `GET /api/projects` - List all projects
- `GET /api/projects/{id}` - Get a project
- `POST /api/projects` - Create a project
- `PUT /api/projects/{id}` - Update a project
- `DELETE /api/projects/{id}` - Delete a project

### Skills
- `GET /api/skills` - List all skills
- `GET /api/skills/{id}` - Get a skill
- `POST /api/skills` - Create a skill
- `PUT /api/skills/{id}` - Update a skill
- `DELETE /api/skills/{id}` - Delete a skill

### Profile
- `GET /api/profile` - Get profile
- `PUT /api/profile` - Update profile

### Health
- `GET /api/health` - Health check

## Project Structure

```
dynamic-portfolio/
├── backend/
│   ├── main.py              # FastAPI app entry point
│   ├── storage.py           # JSON file persistence layer
│   ├── data.py              # Data access layer
│   ├── data/
│   │   └── portfolio.json   # Persistent data file
│   └── routes/
│       ├── projects.py      # Project CRUD endpoints
│       ├── skills.py        # Skill CRUD endpoints
│       └── profile.py       # Profile endpoints
└── frontend/
    ├── index.html           # Public portfolio
    ├── admin.html           # Admin dashboard
    ├── css/
    │   ├── style.css        # Main styles
    │   └── admin.css        # Admin styles
    └── js/
        ├── config.js        # Configuration
        ├── portfolio.js     # Public portfolio logic
        └── admin.js         # Admin dashboard logic
```

## License

MIT