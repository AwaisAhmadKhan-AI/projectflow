# Assessment Notes

## Data Model & Relationship Decisions

### Entities
- **Project**: id, name, description, created_at
- **Issue**: id, project_id (FK), title, description, status, priority, assignee, due_date, created_at, updated_at

### Relationship
One Project has many Issues. Each Issue belongs to exactly one Project.

Implemented with `ForeignKey("projects.id")` and `relationship(back_populates="issues")`.

## Why Separate Router/Service/Repository/Model

- **Router**: HTTP concerns — paths, methods, status codes, dependencies
- **Schema**: API validation — request/response shape, Pydantic
- **Service**: Business rules — validation logic, use-case coordination
- **Repository**: Database queries — SQLAlchemy, persistence
- **Model**: Database structure — tables, columns, constraints

This separation makes code testable, maintainable, and gives each layer a single responsibility.

## Frontend State Management Decisions

1. **URL Search Parameters for Filters**: Issue filters (status, priority, search) are stored in URL search params. This makes filtered views shareable and refresh-safe.

2. **TanStack Query for Server Data**: All API data (projects, issues) is fetched through TanStack Query hooks. This provides automatic caching, loading states, error states, and cache invalidation after mutations. Server data is not duplicated in Redux or local state.

3. **Local State for Form UI**: Form modal open/close states use `useState`. These are temporary UI states that don't need to be shared across components.

## Index Decision

### Index on `issues.project_id`

**Query it supports:**

```sql
SELECT * FROM issues WHERE project_id = 1 ORDER BY due_date;
```

**Why:** Issues are always fetched by project. This index speeds up the foreign key lookup and join with projects table.

### Index on `issues.status`

**Query it supports:**

```sql
SELECT * FROM issues WHERE status = 'in_progress';
```

**Why:** Status filtering is a common operation. Indexing this column makes filtering by status fast.

## Alembic Migration

### upgrade() — Creates the schema

- Creates `projects` table
- Creates `issues` table with foreign key to projects
- Creates enum types for status and priority
- Creates indexes on `projects.id`, `issues.id`, `issues.project_id`, `issues.status`

### downgrade() — Drops the schema

- Drops indexes
- Drops `issues` table
- Drops `projects` table
- Drops enum types (`issuestatus`, `issuepriority`)

## SQL Query Exercise

### Required: List non-completed issues with project info, ordered by due date

**SQL:**

```sql
SELECT i.*, p.name AS project_name
FROM issues i
JOIN projects p ON i.project_id = p.id
WHERE i.status != 'done'
ORDER BY i.due_date;
```

**SQLAlchemy select() equivalent:**

```python
stmt = (
    select(Issue, Project.name)
    .join(Project, Issue.project_id == Project.id)
    .where(Issue.status != IssueStatus.done)
    .order_by(Issue.due_date)
)
```

## Implementation Problem & Diagnosis

**Problem:** Alembic autogenerate produced empty migration with `pass` in both `upgrade()` and `downgrade()`.

**Diagnosis:** Tables were already created manually via `Base.metadata.create_all()` before running Alembic. Autogenerate couldn't detect schema differences because tables already existed in database.

**Solution:** Dropped existing tables and enum types from database, removed `create_all` from `main.py`, wrote manual migration, then applied via `alembic upgrade head`. This made database reproducible from migrations alone.