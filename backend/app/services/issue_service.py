from app.repositories.issue_repository import IssueRepository


class IssueService:
    def __init__(self, repository: IssueRepository):
        self.repository = repository

    def get_all_issues(self, filters: dict | None = None):
        return self.repository.get_all(filters)

    def get_issue(self, issue_id: int):
        return self.repository.get_by_id(issue_id)

    def create_issue(self, data: dict):
        return self.repository.create(data)

    def update_issue(self, issue_id: int, data: dict):
        return self.repository.update(issue_id, data)

    def delete_issue(self, issue_id: int):
        return self.repository.delete(issue_id)