"""
Pydantic schemas for Project input/output.

These are deliberately separate classes from app.models.project.Project.
The ORM model describes a database table; these schemas describe what
the API accepts and returns over HTTP. Keeping them separate means we
can, for example, add a computed `issue_count` to a response without
touching the table, or accept an input field that never gets stored
as-is. Conflating the two would couple our API contract to our schema
migrations.
"""
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class ProjectCreate(BaseModel):
    name: str = Field(min_length=1, max_length=200)
    description: str | None = Field(default=None, max_length=5000)


class ProjectRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    description: str | None
    created_at: datetime


class ProjectSummary(ProjectRead):
    """Project plus a lightweight count, used on the dashboard/list views
    so the frontend doesn't have to fetch every issue just to show a count."""
    issue_count: int = 0
