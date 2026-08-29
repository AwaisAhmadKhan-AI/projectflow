# Assessment Notes — ProjectFlow

## 1. Data Model and Relationship Decisions

**Project** has `id`, `name` (required), `description` (nullable — a
project can exist before anyone writes a description), and
`created_at`.

**Issue** has `id`, `project_id` (foreign key), `title` (required),
`description` (nullable), `status` and `priority` (both constrained to
a fixed set of values), `assignee` (nullable), `due_date` (nullable),
`created_at`, and `updated_at`.

**Relationship:** one `Project` has many `Issue`s; each `Issue` belongs
to exactly one `Project`. This is implemented as:
- `Issue.project_id` — a non-nullable `ForeignKey("projects.id",
  ondelete="CASCADE")`, so the database itself refuses an issue that
  points at a project that doesn't exist, and automatically removes an
  issue's row if its project is deleted.
- `Project.issues` / `Issue.project` — a SQLAlchemy `relationship()`
  pair with `back_populates`, plus `cascade="all, delete-orphan"` on
  the `Project` side so deleting a project through the ORM also
  deletes its issues rather than leaving orphaned rows.

**Nullable vs non-nullable — deliberate choices:**
- `title` and `name` are non-nullable: an issue or project without a
  name is meaningless data, so we don't allow it to be created at all.
- `description` is nullable everywhere: it's genuinely optional context.
- `assignee` is nullable: an issue can exist in the backlog before
  anyone owns it. Forcing an assignee at creation time would make
  "create first, triage later" impossible.
- `due_date` is nullable: not every issue is time-boxed (e.g. "write
  onboarding docs" has no natural deadline). Making it required would
  force users to invent fake dates.
- `status` and `priority` are non-nullable with defaults (`backlog`,
  `medium`) — every issue is always in a knowable, well-defined state.

**Why a database constraint exists:** the foreign key on
`Issue.project_id` isn't just an application-level check — it's
enforced by PostgreSQL itself. Even a bug in application code, a manual
SQL script, or a future service that talks to this database directly
cannot insert an issue for a project that doesn't exist. Application
validation can be bypassed; a database constraint cannot.

## 2. Why Router / Service / Repository / Model Are Separated

Each layer has one job, and mixing them makes the code harder to reason
about and test:

- **Router** — parses the HTTP request, delegates to a service, and
  translates the result (or a domain exception) into an HTTP status
  code and response body. It knows nothing about SQL.
- **Pydantic Schema** — defines exactly what shape of data is
  acceptable coming in, and exactly what shape goes out. This is a
  separate concern from the database table: an API response can
  include a computed field (like `issue_count` on `ProjectSummary`)
  that isn't a column, and the API's public contract shouldn't change
  just because we refactor a table.
- **Service** — the use-case layer. "Create an issue" is a sequence of
  steps (check the project exists, insert the row, commit) — the
  service is where that sequence lives, and it owns the transaction
  boundary (`commit`/`rollback`).
- **Repository** — the only place that builds SQLAlchemy `select()`
  statements and touches the `Session` directly. If we ever needed to
  add caching, change how a query is built, or (hypothetically) swap
  ORMs, this is the only file that would need to change.
- **ORM Model** — the table definition itself: columns, types,
  constraints, relationships.

If a router queried the database directly, every route would duplicate
query logic, business rules would be scattered across HTTP handlers
instead of being testable independently of HTTP, and a schema change
would ripple through router code instead of being contained in one
place.

## 3. Two Frontend State-Management Decisions

1. **Issue filters (status, priority, search) live in the URL, not
   component state.** `ProjectIssues.tsx` reads and writes
   `useSearchParams` instead of `useState`. This makes a filtered view
   shareable as a link, survives a page refresh, and works correctly
   with the browser's back button — none of which a local `useState`
   filter would give us for free.

2. **Server data (projects, issues) lives in TanStack Query, not
   Redux.** Redux would require us to manually write loading/error
   state, manually invalidate/refetch after a mutation, and manually
   dedupe requests across components asking for the same data. Query
   already does all of that. Redux is reserved for exactly one thing
   in this app: `issueListDensity` in `store/uiSlice.ts` — a client-only
   display preference that multiple unrelated components need to agree
   on and that should persist as the user navigates. Everything else
   (form state → React Hook Form, one-off UI toggles like a dialog's
   open/closed state → `useState`) uses the smallest owner that fits,
   per the assessment's "don't put all state in Redux" rule.

## 4. Index Decision

Added a composite index `ix_issues_project_id_status` on
`(project_id, status)`. The dominant access pattern in this app is "get
the issues for project X, optionally filtered by status" (the
`GET /projects/{id}/issues?status=...` endpoint) — every issue list
view is scoped to a single project first. A composite index with
`project_id` leading lets PostgreSQL jump straight to that project's
rows and then narrow by status within them, instead of scanning the
whole `issues` table. Single-column indexes on `status` and `priority`
were also added (via SQLAlchemy's `index=True`) to support filtering
without a project scope, but the composite index is the one that
actually matches how the frontend queries data.

## 5. Alembic Upgrade / Downgrade

`upgrade()` creates the `projects` and `issues` tables (with the
foreign key, cascading delete, and both PostgreSQL enum types for
`status`/`priority`) and the three indexes described above.

`downgrade()` drops the indexes, then the `issues` table, then the
`projects` table, and — this took one round of debugging, see §7 below
— also explicitly drops the two PostgreSQL enum types
(`issue_status`, `issue_priority`). Enum types are separate database
objects from the columns that use them, so dropping a table does not
drop the enum type it referenced; without the explicit `DROP TYPE`,
running `downgrade` then `upgrade` again fails because the enum type
already exists.

## 6. Required SQL Query (Section 5.2)

All non-completed issues with their project information, ordered by
due date:

```sql
SELECT
    issues.*,
    projects.name AS project_name
FROM issues
JOIN projects ON issues.project_id = projects.id
WHERE issues.status != 'done'
ORDER BY issues.due_date ASC NULLS LAST;
```

The equivalent SQLAlchemy `select()`, from
`app/repositories/issue_repository.py`:

```python
stmt = (
    select(Issue, Project.name)
    .join(Project, Issue.project_id == Project.id)
    .where(Issue.status != IssueStatus.DONE)
    .order_by(Issue.due_date.asc().nulls_last())
)
```

`NULLS LAST` matters here: issues without a due date shouldn't crowd
the top of an "ordered by due date" list ahead of issues that actually
have a real deadline.

## 7. An Implementation Problem I Encountered and How I Diagnosed It

After running `alembic revision --autogenerate` and then
`alembic upgrade head`, I ran the required verification sequence from
Section 5.3: `upgrade head` → `downgrade -1` → `upgrade head`. The
second `upgrade head` failed with:

```
psycopg2.errors.DuplicateObject: type "issue_status" already exists
```

**Diagnosis:** I inspected the database directly with `\dT` in `psql`
after the downgrade step and confirmed the tables were gone but the
`issue_status` and `issue_priority` enum types were still present.
Alembic's autogenerated `downgrade()` only calls `op.drop_table()`,
which drops the table's columns but — for PostgreSQL specifically —
does not drop a custom `ENUM` type that a column happened to use,
because the type is a standalone database object that could in
principle be shared by other tables.

**Fix:** added explicit `sa.Enum(name=...).drop(op.get_bind(),
checkfirst=True)` calls at the end of `downgrade()` for both enum
types. I then re-ran the full `upgrade → downgrade → upgrade` cycle
against a real local database to confirm the fix actually worked,
rather than just assuming the change was correct.

## Session, Commit, Rollback, and Flush (Conceptual Summary)

- A **SQLAlchemy session** represents a single, in-progress unit of
  work against the database: it tracks which Python objects have been
  added, changed, or deleted since it was opened, and holds the
  transaction they'll be applied in. One session is created per HTTP
  request (`get_db` dependency) and closed at the end of it.
- **flush** sends pending SQL (INSERTs/UPDATEs) to the database inside
  the current transaction, without ending that transaction — used in
  the repository layer, e.g. right after `db.add(project)`, so the
  database assigns `project.id` before the function returns it, while
  still leaving the option to roll the whole thing back later.
- **commit** ends the transaction successfully, making all changes
  since the last commit permanent. This is called in the service
  layer, not the repository, because the service is what defines "one
  complete use case."
- **rollback** discards all changes made since the last commit,
  reverting the session (and the database, for that transaction) to
  its prior state — used in `IssueService.update_issue` if the commit
  itself raises, so a partial failure doesn't leave the session in an
  inconsistent state for whatever runs next.
