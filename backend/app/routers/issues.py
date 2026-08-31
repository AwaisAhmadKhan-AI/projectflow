from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.issue import IssueCreate, IssueUpdate, IssueRead
from app.repositories.issue_repository import IssueRepository
from app.services.issue_service import IssueService

router = APIRouter(prefix="/issues", tags=["issues"])


def get_service(db: Session = Depends(get_db)):
    repository = IssueRepository(db)
    return IssueService(repository)


@router.get("/", response_model=list[IssueRead])
def list_issues(
    status: str | None = Query(None),
    priority: str | None = Query(None),
    search: str | None = Query(None),
    service: IssueService = Depends(get_service),
):
    filters = {"status": status, "priority": priority, "search": search}
    return service.get_all_issues(filters)


@router.post("/", response_model=IssueRead, status_code=201)
def create_issue(issue: IssueCreate, service: IssueService = Depends(get_service)):
    return service.create_issue(issue.model_dump())


@router.get("/{issue_id}", response_model=IssueRead)
def get_issue(issue_id: int, service: IssueService = Depends(get_service)):
    issue = service.get_issue(issue_id)
    if not issue:
        raise HTTPException(status_code=404, detail="Issue not found")
    return issue


@router.patch("/{issue_id}", response_model=IssueRead)
def update_issue(issue_id: int, issue: IssueUpdate, service: IssueService = Depends(get_service)):
    updated = service.update_issue(issue_id, issue.model_dump(exclude_unset=True))
    if not updated:
        raise HTTPException(status_code=404, detail="Issue not found")
    return updated


@router.delete("/{issue_id}", status_code=204)
def delete_issue(issue_id: int, service: IssueService = Depends(get_service)):
    deleted = service.delete_issue(issue_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Issue not found")
    return None