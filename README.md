# Incident Reporting & Resolution Management System

A full-stack web application for the **University of Sri Jayewardenepura** (Faculty of Management Studies and Commerce) to report campus incidents, verify reports, assign responsible officials, track progress, and close cases through a defined institutional workflow.

Students, administrators, the Dean, and university officials each use role-specific workspaces. Public users can browse verified incidents without an account.

## Features

- **Incident lifecycle** — Submitted → review → verification → Dean assignment → official progress → resolution → closure
- **Role-based access** — Student, Admin, Dean, and Official permissions enforced on the API
- **Student sign-in** — Accounts provisioned from a university roster (MC number + initial CPM password); optional password change after first login
- **Public incident register** — Search, filter, and view approved public reports; student upvoting on public listings
- **Evidence** — Image uploads via Cloudinary
- **Communications** — Incident-scoped messaging with channel rules by role and status
- **Notifications** — In-app notification support for operational events

## Architecture

```text
Browser (Next.js on Vercel)
        │  HTTPS / REST (JWT)
        ▼
Django REST API (Railway)
        │
        ├── PostgreSQL (Railway)
        └── Cloudinary (media)
```

| Layer      | Technology                          |
|-----------|--------------------------------------|
| Frontend  | Next.js, React, TypeScript, Tailwind |
| Backend   | Django, Django REST Framework, JWT   |
| Database  | PostgreSQL (SQLite optional locally) |
| Media     | Cloudinary                           |
| Deploy    | Vercel (frontend), Railway (API + DB)|

## Repository layout

```text
Incident_Management/
├── backend/          # Django API, models, tests, management commands
├── frontend/         # Next.js application
├── AGENTS.md         # Engineering rules and security requirements
├── DESIGN.md         # UI and visual specification
└── LICENSE           # MIT License
```

## Prerequisites

- **Python** 3.12+ (3.14 supported in local development)
- **Node.js** 20+ and npm
- **PostgreSQL** (production) or omit `DATABASE_URL` for local SQLite
- **Cloudinary** account (for incident images in non-trivial deployments)

## Local development

### Backend

```bash
cd backend
python -m venv venv
# Windows: venv\Scripts\activate
# macOS/Linux: source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # edit values as needed
python manage.py migrate
python manage.py runserver
```

API base URL: `http://localhost:8000/api`

**SQLite:** If `DATABASE_URL` is not set in `.env`, Django uses `backend/db.sqlite3`.

### Frontend

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

App URL: `http://localhost:3000`  
Set `NEXT_PUBLIC_API_URL=http://localhost:8000/api` in `.env.local`.

## Account provisioning

Students **cannot** self-register.

### Students (roster import)

1. Place a CSV at `backend/data/student_roster.csv` with columns `mc_number` and `cpm_number` (or `Mc Number` / `Cpm Number`).
2. Run:

```bash
cd backend
python manage.py import_student_roster
# Optional: python manage.py import_student_roster --file path/to/roster.csv
```

Existing student passwords are **not** overwritten on re-import; only new MC numbers are created.

### Admin and Dean (controlled setup)

```bash
python manage.py create_staff_user \
  --email dean@example.com \
  --name "Dean User" \
  --password "secure-password" \
  --role DEAN
```

Use `--role ADMIN` for an administrator. Officials are created by the Dean through the application, not this command.

## Environment variables

| Location | File | Purpose |
|----------|------|---------|
| Backend  | `backend/.env` | See `backend/.env.example` — secret key, database, CORS, JWT, Cloudinary, email |
| Frontend | `frontend/.env.local` | `NEXT_PUBLIC_API_URL` |

Never commit `.env` files or secrets to version control.

## Deployment (overview)

1. **Railway** — Deploy `backend/`, attach PostgreSQL, set environment variables, run migrations, then `import_student_roster` (and `create_staff_user` for initial Dean/Admin if needed).
2. **Vercel** — Deploy `frontend/`, set `NEXT_PUBLIC_API_URL` to the production API URL (include `/api`).
3. Configure **CORS** on Django with the Vercel production origin.

See `backend/railway.toml` and `frontend/vercel.json` for project-specific deployment hints.

## Tests

```bash
cd backend
python manage.py test
```

Permission and workflow tests cover authentication, incidents, voting, and role boundaries.

## Documentation for contributors

- **[AGENTS.md](./AGENTS.md)** — Architecture, roles, API rules, security, and definition of done
- **[DESIGN.md](./DESIGN.md)** — Institutional UI specification (colors, layout, responsive behavior)

Read both before making substantial changes.

## License

This project is licensed under the [MIT License](./LICENSE).

## Authors

Developed by [Oshadha Canchana](https://github.com/MHOC96) and [P.M.A Thevindu Nethmina Ariyathilaka](https://github.com/Thevindu23).

Built for the University of Sri Jayewardenepura — Incident Reporting & Resolution Management System.
