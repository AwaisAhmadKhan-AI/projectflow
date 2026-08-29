"""SQLAlchemy model for an Issue, belonging to a Project."""
import enum
from datetime import date, datetime

from sqlalchemy import Date, DateTime, Enum, ForeignKey, Index, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class IssueStatus(str, enum.Enum):
    BACKLOG = "backlog"
    IN_PROGRESS = "in_progress"
    BLOCKED = "blocked"
    DONE = "done"


class IssuePriority(str, enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


class Issue(Base):
    __tablename__ = "issues"
    __table_args__ = (
        # Issues are almost always listed scoped to a project and often
        # filtered by status within that project (e.g. "open issues for
        # project X"). A composite index on (project_id, status) serves
        # that access pattern directly instead of forcing a full scan
        # of one project's issues to filter by status in memory.
        Index("ix_issues_project_id_status", "project_id", "status"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)

    # Foreign key to Project. ondelete="CASCADE" mirrors the ORM-level
    # cascade so the constraint holds even for raw SQL / bulk deletes
    # that bypass the ORM's cascade logic.
    project_id: Mapped[int] = mapped_column(
        ForeignKey("projects.id", ondelete="CASCADE"), nullable=False
    )

    title: Mapped[str] = mapped_column(String(300), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)

    # Stored as native PostgreSQL ENUM types (via SQLAlchemy Enum) so the
    # database itself rejects any value outside the controlled set —
    # validation isn't just an application-layer concern.
    status: Mapped[IssueStatus] = mapped_column(
        Enum(IssueStatus, name="issue_status", values_callable=lambda e: [m.value for m in e]),
        nullable=False,
        default=IssueStatus.BACKLOG,
        index=True,
    )
    priority: Mapped[IssuePriority] = mapped_column(
        Enum(IssuePriority, name="issue_priority", values_callable=lambda e: [m.value for m in e]),
        nullable=False,
        default=IssuePriority.MEDIUM,
        index=True,
    )

    # Nullable: an issue can exist before anyone is assigned to it. This
    # is a deliberate choice, not an oversight — see docs/assessment-notes.md.
    assignee: Mapped[str | None] = mapped_column(String(150), nullable=True)

    # Nullable: not every issue has a deadline.
    due_date: Mapped[date | None] = mapped_column(Date, nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    project: Mapped["Project"] = relationship(back_populates="issues")

    def __repr__(self) -> str:
        return f"<Issue id={self.id} title={self.title!r} status={self.status}>"
