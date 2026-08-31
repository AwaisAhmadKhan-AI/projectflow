from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.issue import Issue


class IssueRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_all(self, filters: dict | None = None) -> list[Issue]:
        stmt = select(Issue).order_by(Issue.due_date)

        if filters:
            if filters.get("status"):
                stmt = stmt.where(Issue.status == filters["status"])
            if filters.get("priority"):
                stmt = stmt.where(Issue.priority == filters["priority"])
            if filters.get("search"):
                stmt = stmt.where(Issue.title.ilike(f"%{filters['search']}%"))

        return list(self.db.execute(stmt).scalars().all())

    def get_by_project(self, project_id: int, filters: dict | None = None) -> list[Issue]:
        stmt = select(Issue).where(Issue.project_id == project_id).order_by(Issue.due_date)

        if filters:
            if filters.get("status"):
                stmt = stmt.where(Issue.status == filters["status"])
            if filters.get("priority"):
                stmt = stmt.where(Issue.priority == filters["priority"])
            if filters.get("search"):
                stmt = stmt.where(Issue.title.ilike(f"%{filters['search']}%"))

        return list(self.db.execute(stmt).scalars().all())

    def get_by_id(self, issue_id: int) -> Issue | None:
        return self.db.get(Issue, issue_id)

    def create(self, data: dict) -> Issue:
        issue = Issue(**data)
        self.db.add(issue)
        self.db.commit()
        self.db.refresh(issue)
        return issue

    def update(self, issue_id: int, data: dict) -> Issue | None:
        issue = self.get_by_id(issue_id)
        if not issue:
            return None
        for key, value in data.items():
            setattr(issue, key, value)
        self.db.commit()
        self.db.refresh(issue)
        return issue

    def delete(self, issue_id: int) -> Issue | None:
        issue = self.get_by_id(issue_id)
        if not issue:
            return None
        self.db.delete(issue)
        self.db.commit()
        return issue