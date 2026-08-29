"""Service layer for issues: create, update, delete, filter, and the
Section 5.2 cross-project query."""
from sqlalchemy.orm import Session

from app.models.issue import Issue, IssuePriority, IssueStatus
from app.repositories.issue_repository import IssueRepository
from app.repositories.project_repository import ProjectRepository
from app.schemas.issue import IssueCreate, IssueReadWithProject, IssueUpdate


class ProjectNotFoundError(Exception):
    pass


class IssueNotFoundError(Exception):
    pass


class IssueService:
    def __init__(self, db: Session) -> None:
        self.db = db
        self.issues = IssueRepository(db)
        self.projects = ProjectRepository(db)

    def list_issues(
        self,
        project_id: int,
        *,
        status: IssueStatus | None = None,
        priority: IssuePriority | None = None,
        search: str | None = None,
    ) -> list[Issue]:
        if self.projects.get_by_id(project_id) is None:
            raise ProjectNotFoundError(project_id)
        return self.issues.list_for_project(
            project_id, status=status, priority=priority, search=search
        )

    def get_issue(self, issue_id: int) -> Issue:
        issue = self.issues.get_by_id(issue_id)
        if issue is None:
            raise IssueNotFoundError(issue_id)
        return issue

    def create_issue(self, project_id: int, data: IssueCreate) -> Issue:
        if self.projects.get_by_id(project_id) is None:
            raise ProjectNotFoundError(project_id)

        issue = self.issues.create(project_id=project_id, **data.model_dump())
        self.db.commit()
        self.db.refresh(issue)
        return issue

    def update_issue(self, issue_id: int, data: IssueUpdate) -> Issue:
        issue = self.get_issue(issue_id)

        # Only apply fields the client actually sent (PATCH semantics).
        updates = data.model_dump(exclude_unset=True)
        for field, value in updates.items():
            setattr(issue, field, value)

        try:
            self.db.commit()
        except Exception:
            # If the commit fails (e.g. a constraint violation), roll
            # back so the session isn't left in a broken, half-applied
            # state for the next operation on it.
            self.db.rollback()
            raise
        self.db.refresh(issue)
        return issue

    def delete_issue(self, issue_id: int) -> None:
        issue = self.get_issue(issue_id)
        self.issues.delete(issue)
        self.db.commit()

    def list_non_completed_with_project(self) -> list[IssueReadWithProject]:
        rows = self.issues.list_non_completed_with_project()
        results = []
        for issue, project_name in rows:
            item = IssueReadWithProject.model_validate(issue).model_copy(
                update={"project_name": project_name}
            )
            results.append(item)
        return results
