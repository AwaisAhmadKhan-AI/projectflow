# ProjectFlow — Team Project & Issue Tracker

A full-stack application for organizing projects and tracking issues within them.

## Project Purpose

ProjectFlow helps small software teams manage projects and track issues. Users can create projects, view project details, create and manage issues, search/filter issues, and update issue status and priority.

## Technology Stack

### Backend
- FastAPI (Python web framework)
- PostgreSQL (Relational database)
- SQLAlchemy 2.x (ORM)
- Alembic (Database migrations)
- Pydantic (Data validation)

### Frontend
- React 18 + TypeScript
- Vite (Build tool)
- Tailwind CSS (Styling)
- React Router (Routing)
- TanStack Query (Server state)
- React Hook Form + Zod (Forms & validation)

## Backend Setup

### Prerequisites
- Python 3.10+
- PostgreSQL 14+
- Node.js 18+

### Setup Commands

```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
source venv/bin/activate  # Mac/Linux
pip install -r requirements.txt