from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.project import ProjectCreate, ProjectRead
from app.schemas.issue import IssueRead
from app.repositories.project_repository import ProjectRepository
from app.repositories.issue_repository import IssueRepository
from app.services.project_service import ProjectService

router = APIRouter(prefix="/projects", tags=["projects"])


def get_service(db: Session = Depends(get_db)):
    repository = ProjectRepository(db)
    return ProjectService(repository)


@router.get("/", response_model=list[ProjectRead])
def list_projects(service: ProjectService = Depends(get_service)):
    return service.get_all_projects()


@router.post("/", response_model=ProjectRead, status_code=201)
def create_project(project: ProjectCreate, service: ProjectService = Depends(get_service)):
    return service.create_project(project.model_dump())


@router.get("/{project_id}", response_model=ProjectRead)
def get_project(project_id: int, service: ProjectService = Depends(get_service)):
    project = service.get_project(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project


@router.get("/{project_id}/issues", response_model=list[IssueRead])
def get_project_issues(
    project_id: int,
    status: str | None = Query(None),
    priority: str | None = Query(None),
    search: str | None = Query(None),
    db: Session = Depends(get_db),
):
    issue_repo = IssueRepository(db)
    filters = {
        "status": status,
        "priority": priority,
        "search": search,
    }
    return issue_repo.get_by_project(project_id, filters)