"""
Service layer for projects.

Services hold use-case logic and own the transaction boundary (commit
or rollback). They call repositories to actually read/write rows;
they never build SQLAlchemy queries themselves. This is what keeps a
"use case" (e.g. "create a project") readable as a sequence of steps
instead of mixed in with query construction.
"""
from sqlalchemy.orm import Session

from app.models.project import Project
from app.repositories.project_repository import ProjectRepository
from app.schemas.project import ProjectCreate, ProjectSummary


class ProjectService:
    def __init__(self, db: Session) -> None:
        self.db = db
        self.repo = ProjectRepository(db)

    def list_projects(self) -> list[ProjectSummary]:
        rows = self.repo.list_with_issue_counts()
        return [
            ProjectSummary.model_validate(project).model_copy(update={"issue_count": count})
            for project, count in rows
        ]

    def get_project(self, project_id: int) -> Project | None:
        return self.repo.get_by_id(project_id)

    def create_project(self, data: ProjectCreate) -> Project:
        project = self.repo.create(name=data.name, description=data.description)
        # Commit here, not in the repository or router: the service
        # owns the "this use case either fully happens or fully doesn't"
        # boundary. If anything after repo.create() were to fail before
        # this point, we'd want the whole operation rolled back instead
        # of a half-applied change reaching the database.
        self.db.commit()
        self.db.refresh(project)
        return project
