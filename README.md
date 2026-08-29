# ProjectFlow — Team Project & Issue Tracker

Skill Assessment 01 submission for the 1ne.ai Full-Stack AI Engineering Program.
A small internal tool for organizing projects and the issues within them.

## Project Purpose

ProjectFlow lets a small team:
- View and create projects
- View, search and filter issues within a project
- Create, edit, and delete issues, with status/priority tracking
- Navigate directly to an issue by URL, with proper loading / empty / error / not-found states

## Technology Stack

**Frontend:** React 18, TypeScript, Vite, Tailwind CSS, React Router,
TanStack Query, React Hook Form + Zod, Redux Toolkit, Vitest + Testing Library

**Backend:** FastAPI, Pydantic v2, SQLAlchemy 2.x, Alembic, PostgreSQL, pytest

## Repository Structure

```
projectflow/
├── backend/
│   ├── app/
│   │   ├── core/        # config, database session
│   │   ├── models/      # SQLAlchemy ORM models
│   │   ├── schemas/     # Pydantic request/response schemas
│   │   ├── repositories/# SQLAlchemy queries / persistence
│   │   ├── services/    # use-case / business logic, transactions
│   │   ├── routers/     # FastAPI routes
│   │   └── main.py
│   ├── alembic/          # migrations
│   ├── tests/
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── routes/       # screen-level components
│   │   ├── components/   # reusable UI, issue & project components
│   │   ├── hooks/        # TanStack Query hooks
│   │   ├── lib/api/      # mock API + real HTTP client + facade
│   │   ├── schemas/      # Zod validation schemas
│   │   ├── store/        # Redux Toolkit (one deliberate slice)
│   │   └── types/
│   └── .env.example
└── docs/
    └── assessment-notes.md
```

## Backend Setup & Run

1. Install PostgreSQL locally and make sure it's running.
2. Create a database:
   ```bash
   psql -c "CREATE DATABASE projectflow;"
   ```
3. From `backend/`:
   ```bash
   python3 -m venv venv
   source venv/bin/activate        # Windows: venv\Scripts\activate
   pip install -r requirements.txt
   cp .env.example .env            # adjust DB credentials if needed
   ```
4. Run migrations:
   ```bash
   alembic upgrade head
   ```
5. Start the API:
   ```bash
   uvicorn app.main:app --reload
   ```
   API docs (OpenAPI/Swagger) are then available at `http://localhost:8000/docs`.

### Run backend tests

```bash
pytest
```

Tests run against the same PostgreSQL database, each wrapped in a transaction
that's rolled back afterward, so they don't leave data behind.

## Frontend Setup & Run

From `frontend/`:

```bash
npm install
cp .env.example .env
npm run dev
```

The app opens at `http://localhost:5173`.

By default the frontend runs against a **built-in mock REST layer**
(`VITE_USE_MOCK_API=true` in `.env`) that implements the exact same
Project/Issue contract as the FastAPI backend — no database or backend
process required to explore the UI. This is explicitly allowed by the
assessment brief (Section 7), since real CORS-based integration between
this frontend and FastAPI is covered later in the program.

To connect to the real backend instead (optional bonus work):
1. Make sure the backend is running (see above).
2. In `frontend/.env`, set `VITE_USE_MOCK_API=false`.
3. Restart `npm run dev`.

### Run frontend checks

```bash
npm run lint     # ESLint
npm run build    # tsc -b && vite build — type-checks and builds
npm test         # Vitest — runs the test suite
```

## PostgreSQL Configuration

The backend reads individual connection parameters (not a single URL)
from environment variables, assembled into a `postgresql+psycopg2://`
URL in `app/core/config.py`:

| Variable | Default | Purpose |
|---|---|---|
| `POSTGRES_USER` | `postgres` | DB user |
| `POSTGRES_PASSWORD` | `postgres` | DB password |
| `POSTGRES_HOST` | `localhost` | DB host |
| `POSTGRES_PORT` | `5432` | DB port |
| `POSTGRES_DB` | `projectflow` | Database name |

See `backend/.env.example` for the full list including CORS configuration.

## Migration Commands

```bash
# Apply all migrations
alembic upgrade head

# Roll back the most recent migration
alembic downgrade -1

# Re-apply
alembic upgrade head

# Generate a new migration after changing models
alembic revision --autogenerate -m "description of the change"
```

All three required commands (`upgrade head` → `downgrade -1` → `upgrade head`)
were run against a live local PostgreSQL database during development to
confirm the schema is fully reproducible from migrations alone — see
`docs/assessment-notes.md` for a note on a real bug this caught.

## How to Exercise the API

With the backend running:

```bash
curl http://localhost:8000/health

curl -X POST http://localhost:8000/projects \
  -H "Content-Type: application/json" \
  -d '{"name": "ProjectFlow Core", "description": "Internal tracker rebuild"}'

curl http://localhost:8000/projects

curl -X POST http://localhost:8000/projects/1/issues \
  -H "Content-Type: application/json" \
  -d '{"title": "Set up CI pipeline", "status": "in_progress", "priority": "high"}'

curl "http://localhost:8000/projects/1/issues?status=in_progress&search=CI"

curl -X PATCH http://localhost:8000/issues/1 \
  -H "Content-Type: application/json" \
  -d '{"status": "blocked"}'

curl -X DELETE http://localhost:8000/issues/1
```

Or use the interactive OpenAPI docs at `http://localhost:8000/docs`.

## Known Limitations

- The frontend defaults to a mock data layer; connecting it to the real
  FastAPI backend (CORS wiring) is optional bonus work per the assessment
  brief, not a required criterion.
- Pagination on the issue list is not implemented (explicitly optional
  bonus work per Section 4.2).
- No authentication/authorization — explicitly out of scope for this
  assessment (Section 1.2).
- Search is a simple case-insensitive `ILIKE` match; it would need a
  proper full-text index if the issue table grew much larger.
