from app.repositories.project_repository import ProjectRepository


class ProjectService:
    def __init__(self, repository: ProjectRepository):
        self.repository = repository

    def get_all_projects(self):
        return self.repository.get_all()

    def get_project(self, project_id: int):
        return self.repository.get_by_id(project_id)

    def create_project(self, data: dict):
        return self.repository.create(data)