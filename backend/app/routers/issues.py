"""
Issue routes.

Two routers share this module: one nested under /projects/{project_id}
for listing/creating issues within a project, and a flat /issues one
for reading/updating/deleting a specific issue by its own id (an issue
URL doesn't need to carry its project id once you have the issue id).
"""
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.issue import IssuePriority, IssueStatus
from app.schemas.issue import IssueCreate, IssueRead, IssueUpdate
from app.services.issue_service import (
    IssueNotFoundError,
    IssueService,
    ProjectNotFoundError,
)

project_issues_router = APIRouter(prefix="/projects/{project_id}/issues", tags=["issues"])
issues_router = APIRouter(prefix="/issues", tags=["issues"])


@project_issues_router.get("", response_model=list[IssueRead])
def list_project_issues(
    project_id: int,
    status_filter: IssueStatus | None = Query(default=None, alias="status"),
    priority_filter: IssuePriority | None = Query(default=None, alias="priority"),
    search: str | None = Query(default=None, min_length=1, max_length=200),
    db: Session = Depends(get_db),
) -> list[IssueRead]:
    try:
        issues = IssueService(db).list_issues(
            project_id, status=status_filter, priority=priority_filter, search=search
        )
    except ProjectNotFoundError:
        raise HTTPException(status_code=404, detail="Project not found")
    return [IssueRead.model_validate(i) for i in issues]


@project_issues_router.post("", response_model=IssueRead, status_code=status.HTTP_201_CREATED)
def create_issue(
    project_id: int, payload: IssueCreate, db: Session = Depends(get_db)
) -> IssueRead:
    try:
        issue = IssueService(db).create_issue(project_id, payload)
    except ProjectNotFoundError:
        raise HTTPException(status_code=404, detail="Project not found")
    return IssueRead.model_validate(issue)


@issues_router.get("/{issue_id}", response_model=IssueRead)
def get_issue(issue_id: int, db: Session = Depends(get_db)) -> IssueRead:
    try:
        issue = IssueService(db).get_issue(issue_id)
    except IssueNotFoundError:
        raise HTTPException(status_code=404, detail="Issue not found")
    return IssueRead.model_validate(issue)


@issues_router.patch("/{issue_id}", response_model=IssueRead)
def update_issue(issue_id: int, payload: IssueUpdate, db: Session = Depends(get_db)) -> IssueRead:
    try:
        issue = IssueService(db).update_issue(issue_id, payload)
    except IssueNotFoundError:
        raise HTTPException(status_code=404, detail="Issue not found")
    return IssueRead.model_validate(issue)


@issues_router.delete("/{issue_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_issue(issue_id: int, db: Session = Depends(get_db)) -> None:
    try:
        IssueService(db).delete_issue(issue_id)
    except IssueNotFoundError:
        raise HTTPException(status_code=404, detail="Issue not found")
