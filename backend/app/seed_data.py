from datetime import datetime, timedelta

from app.database import SessionLocal
from app.models.project import Project
from app.models.issue import Issue, IssueStatus, IssuePriority


def seed():
    db = SessionLocal()

    # Check if data exists
    if db.query(Project).count() > 0:
        print("Data already exists!")
        db.close()
        return

    # Create projects
    project1 = Project(
        name="Website Redesign",
        description="Complete overhaul of company website"
    )
    project2 = Project(
        name="Mobile App",
        description="iOS and Android application"
    )
    db.add_all([project1, project2])
    db.commit()
    db.refresh(project1)
    db.refresh(project2)

    # Create issues for project1
    issue1 = Issue(
        project_id=project1.id,
        title="Fix login page vulnerability",
        description="SQL injection in login form",
        status=IssueStatus.in_progress,
        priority=IssuePriority.high,
        assignee="Awais",
        due_date=datetime.now() + timedelta(days=3)
    )
    issue2 = Issue(
        project_id=project1.id,
        title="Update dashboard UI",
        description="Modern dashboard with charts",
        status=IssueStatus.backlog,
        priority=IssuePriority.medium,
        assignee="Bilal",
        due_date=datetime.now() + timedelta(days=7)
    )

    # Create issues for project2
    issue3 = Issue(
        project_id=project2.id,
        title="API rate limiting",
        description="Prevent brute force attacks",
        status=IssueStatus.blocked,
        priority=IssuePriority.high,
        assignee="Daniyal",
        due_date=datetime.now() + timedelta(days=2)
    )
    issue4 = Issue(
        project_id=project2.id,
        title="Write unit tests",
        description="Test coverage for auth module",
        status=IssueStatus.done,
        priority=IssuePriority.low,
        assignee="Eman",
        due_date=datetime.now() + timedelta(days=1)
    )

    db.add_all([issue1, issue2, issue3, issue4])
    db.commit()
    db.close()

    print("✅ Seed data created successfully!")


if __name__ == "__main__":
    seed()