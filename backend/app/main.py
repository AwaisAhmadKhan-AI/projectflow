"""
FastAPI application entrypoint.

Wires together settings, CORS, and the routers. Nothing in here talks
to the database directly.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import get_settings
from app.routers.health import router as health_router
from app.routers.issues import issues_router, project_issues_router
from app.routers.projects import router as projects_router

settings = get_settings()

app = FastAPI(title=settings.api_title, version=settings.api_version)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router)
app.include_router(projects_router)
app.include_router(project_issues_router)
app.include_router(issues_router)
