from datetime import datetime
from enum import Enum
from typing import TYPE_CHECKING

from sqlalchemy import String, DateTime, ForeignKey, Enum as SQLAlchemyEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base

if TYPE_CHECKING:
    from app.models.project import Project


class IssueStatus(str, Enum):
    backlog = "backlog"
    in_progress = "in_progress"
    blocked = "blocked"
    done = "done"


class IssuePriority(str, Enum):
    low = "low"
    medium = "medium"
    high = "high"


class Issue(Base):
    __tablename__ = "issues"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    project_id: Mapped[int] = mapped_column(ForeignKey("projects.id"), index=True, nullable=False)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str | None] = mapped_column(String(1000), nullable=True)
    status: Mapped[IssueStatus] = mapped_column(
        SQLAlchemyEnum(IssueStatus),
        default=IssueStatus.backlog,
        index=True,
        nullable=False
    )
    priority: Mapped[IssuePriority] = mapped_column(
        SQLAlchemyEnum(IssuePriority),
        default=IssuePriority.medium,
        nullable=False
    )
    assignee: Mapped[str | None] = mapped_column(String(100), nullable=True)
    due_date: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False
    )

    project: Mapped["Project"] = relationship(back_populates="issues")