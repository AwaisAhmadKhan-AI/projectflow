"""
Repository for Project persistence.

The repository is the only place that knows how to talk to SQLAlchemy
for this entity. Services call these methods instead of building
queries themselves — that keeps query construction in one place, and
means if we ever changed ORMs or added caching, only this file changes.
"""
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.issue import Issue
from app.models.project import Project


class ProjectRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def list_all(self) -> list[Project]:
        # Ordered by id so the list has a stable, predictable order
        # across requests (see API Quality Expectations, Section 4.3).
        stmt = select(Project).order_by(Project.id)
        return list(self.db.scalars(stmt).all())

    def list_with_issue_counts(self) -> list[tuple[Project, int]]:
        """Used for the dashboard summary: each project paired with how
        many issues it has, computed in the database rather than by
        pulling every issue row into Python and counting there."""
        stmt = (
            select(Project, func.count(Issue.id))
            .outerjoin(Issue, Issue.project_id == Project.id)
            .group_by(Project.id)
            .order_by(Project.id)
        )
        return [(row[0], row[1]) for row in self.db.execute(stmt).all()]

    def get_by_id(self, project_id: int) -> Project | None:
        return self.db.get(Project, project_id)

    def create(self, *, name: str, description: str | None) -> Project:
        project = Project(name=name, description=description)
        self.db.add(project)
        self.db.flush()  # assigns project.id without ending the transaction
        return project
