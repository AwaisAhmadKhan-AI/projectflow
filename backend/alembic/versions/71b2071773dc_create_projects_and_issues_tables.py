"""create projects and issues tables

Revision ID: 71b2071773dc
Revises: 
Create Date: 2026-08-30 21:46:14.356733

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '71b2071773dc'
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table(
        'projects',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=100), nullable=False),
        sa.Column('description', sa.String(length=500), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_projects_id', 'projects', ['id'])

    op.create_table(
        'issues',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('project_id', sa.Integer(), nullable=False),
        sa.Column('title', sa.String(length=200), nullable=False),
        sa.Column('description', sa.String(length=1000), nullable=True),
        sa.Column('status', sa.Enum('backlog', 'in_progress', 'blocked', 'done', name='issuestatus'), nullable=False),
        sa.Column('priority', sa.Enum('low', 'medium', 'high', name='issuepriority'), nullable=False),
        sa.Column('assignee', sa.String(length=100), nullable=True),
        sa.Column('due_date', sa.DateTime(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['project_id'], ['projects.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_issues_id', 'issues', ['id'])
    op.create_index('ix_issues_project_id', 'issues', ['project_id'])
    op.create_index('ix_issues_status', 'issues', ['status'])


def downgrade() -> None:
    """Downgrade schema."""
    # Pehle indexes drop karo
    op.drop_index('ix_issues_status', table_name='issues')
    op.drop_index('ix_issues_project_id', table_name='issues')
    op.drop_index('ix_issues_id', table_name='issues')
    op.drop_index('ix_projects_id', table_name='projects')

    # Phir tables drop karo
    op.drop_table('issues')
    op.drop_table('projects')

    # Aakhri mein enum types drop karo — warna upgrade pe duplicate hoga
    op.execute("DROP TYPE IF EXISTS issuestatus CASCADE")
    op.execute("DROP TYPE IF EXISTS issuepriority CASCADE")