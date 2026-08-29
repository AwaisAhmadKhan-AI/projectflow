"""SQLAlchemy model for a Project."""
from datetime import datetime

from sqlalchemy import DateTime, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Project(Base):
    __tablename__ = "projects"

    id: Mapped[int] = mapped_column(primary_key=True)

    # Required, short-ish identifying name. VARCHAR(200) is generous
    # enough for any real project name while still bounding storage/index size.
    name: Mapped[str] = mapped_column(String(200), nullable=False)

    # Optional longer-form description of the project.
    description: Mapped[str | None] = mapped_column(Text, nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    # One Project has many Issues. cascade="all, delete-orphan" means
    # deleting a Project also deletes its Issues, so we never leave
    # orphaned issue rows pointing at a project_id that no longer exists.
    issues: Mapped[list["Issue"]] = relationship(
        back_populates="project",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )

    def __repr__(self) -> str:
        return f"<Project id={self.id} name={self.name!r}>"
