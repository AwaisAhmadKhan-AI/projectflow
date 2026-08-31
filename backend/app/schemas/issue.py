from datetime import datetime
from pydantic import BaseModel, Field
from app.models.issue import IssueStatus, IssuePriority


class IssueCreate(BaseModel):
    project_id: int
    title: str = Field(..., min_length=3, max_length=200)
    description: str | None = Field(None, max_length=1000)
    status: IssueStatus = IssueStatus.backlog
    priority: IssuePriority = IssuePriority.medium
    assignee: str | None = Field(None, max_length=100)
    due_date: datetime | None = None


class IssueUpdate(BaseModel):
    title: str | None = Field(None, min_length=3, max_length=200)
    description: str | None = Field(None, max_length=1000)
    status: IssueStatus | None = None
    priority: IssuePriority | None = None
    assignee: str | None = Field(None, max_length=100)
    due_date: datetime | None = None


class IssueRead(BaseModel):
    id: int
    project_id: int
    title: str
    description: str | None
    status: IssueStatus
    priority: IssuePriority
    assignee: str | None
    due_date: datetime | None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True