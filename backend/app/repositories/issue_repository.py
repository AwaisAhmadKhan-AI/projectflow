"""Repository for Issue persistence, including filtering/search queries."""
from sqlalchemy import Select, select
from sqlalchemy.orm import Session

from app.models.issue import Issue, IssuePriority, IssueStatus
from app.models.project import Project


class IssueRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def _base_query(self, project_id: int) -> Select:
        return select(Issue).where(Issue.project_id == project_id)

    def list_for_project(
        self,
        project_id: int,
        *,
        status: IssueStatus | None = None,
        priority: IssuePriority | None = None,
        search: str | None = None,
    ) -> list[Issue]:
        stmt = self._base_query(project_id)

        if status is not None:
            stmt = stmt.where(Issue.status == status)
        if priority is not None:
            stmt = stmt.where(Issue.priority == priority)
        if search:
            # Simple case-insensitive substring search across title and
            # description. ilike is sufficient at this scale; a
            # full-text index would only be worth adding if search
            # became a hot path over a much larger issue table.
            like_pattern = f"%{search}%"
            stmt = stmt.where(
                Issue.title.ilike(like_pattern) | Issue.description.ilike(like_pattern)
            )

        # Stable, predictable ordering: newest first, tie-broken by id.
        stmt = stmt.order_by(Issue.created_at.desc(), Issue.id.desc())
        return list(self.db.scalars(stmt).all())

    def get_by_id(self, issue_id: int) -> Issue | None:
        return self.db.get(Issue, issue_id)

    def create(self, *, project_id: int, **fields) -> Issue:
        issue = Issue(project_id=project_id, **fields)
        self.db.add(issue)
        self.db.flush()
        return issue

    def delete(self, issue: Issue) -> None:
        self.db.delete(issue)

    def list_non_completed_with_project(self) -> list[tuple[Issue, str]]:
        """
        The Section 5.2 query exercise, expressed with select(): every
        issue whose status isn't 'done', joined to its project, ordered
        by due date (nulls last so undated issues don't dominate the
        top of the list).
        """
        stmt = (
            select(Issue, Project.name)
            .join(Project, Issue.project_id == Project.id)
            .where(Issue.status != IssueStatus.DONE)
            .order_by(Issue.due_date.asc().nulls_last())
        )
        return [(row[0], row[1]) for row in self.db.execute(stmt).all()]
