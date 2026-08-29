"""Pydantic schemas for Issue input/output."""
from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, Field

from app.models.issue import IssuePriority, IssueStatus


class IssueCreate(BaseModel):
    title: str = Field(min_length=1, max_length=300)
    description: str | None = Field(default=None, max_length=10000)
    status: IssueStatus = IssueStatus.BACKLOG
    priority: IssuePriority = IssuePriority.MEDIUM
    assignee: str | None = Field(default=None, max_length=150)
    due_date: date | None = None


class IssueUpdate(BaseModel):
    """
    All fields optional: PATCH /issues/{id} updates only the fields the
    client actually sends, rather than requiring a full replacement
    representation (which would be more of a PUT semantic).
    """
    title: str | None = Field(default=None, min_length=1, max_length=300)
    description: str | None = Field(default=None, max_length=10000)
    status: IssueStatus | None = None
    priority: IssuePriority | None = None
    assignee: str | None = Field(default=None, max_length=150)
    due_date: date | None = None


class IssueRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    project_id: int
    title: str
    description: str | None
    status: IssueStatus
    priority: IssuePriority
    assignee: str | None
    due_date: date | None
    created_at: datetime
    updated_at: datetime


class IssueReadWithProject(IssueRead):
    """Used by the 'non-completed issues with project info' query in
    Section 5.2 — flattens the project name onto the issue row."""
    project_name: str
