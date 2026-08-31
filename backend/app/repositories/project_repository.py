from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.project import Project


class ProjectRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_all(self) -> list[Project]:
        stmt = select(Project).order_by(Project.created_at)
        return list(self.db.execute(stmt).scalars().all())

    def get_by_id(self, project_id: int) -> Project | None:
        return self.db.get(Project, project_id)

    def create(self, data: dict) -> Project:
        project = Project(**data)
        self.db.add(project)
        self.db.commit()
        self.db.refresh(project)
        return project