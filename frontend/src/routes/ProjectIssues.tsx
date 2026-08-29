import { Link, useParams, useSearchParams } from "react-router-dom";

import { IssueFiltersBar } from "@/components/issues/IssueFilters";
import { IssueTable } from "@/components/issues/IssueTable";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Spinner } from "@/components/ui/Spinner";
import { useAppSelector } from "@/store/hooks";
import { useProject } from "@/hooks/useProjects";
import { useIssues } from "@/hooks/useIssues";
import { NotFound } from "@/routes/NotFound";
import type { IssueFilters, IssuePriority, IssueStatus } from "@/types";

/**
 * Filters live in the URL (useSearchParams), not component state, so a
 * filtered/searched view is a shareable, bookmarkable, back-button-safe
 * link — the "Shareable search/filter values" row in Section 6.3.
 */
export function ProjectIssues() {
  const params = useParams<{ projectId: string }>();
  const projectId = Number(params.projectId);
  const [searchParams, setSearchParams] = useSearchParams();

  const density = useAppSelector((state) => state.ui.issueListDensity);

  const filters: IssueFilters = {
    status: (searchParams.get("status") as IssueStatus) || undefined,
    priority: (searchParams.get("priority") as IssuePriority) || undefined,
    search: searchParams.get("search") || undefined,
  };

  const project = useProject(projectId);
  const issues = useIssues(projectId, filters);

  if (project.isError) {
    return <NotFound />;
  }

  const handleFilterChange = (next: IssueFilters) => {
    const nextParams = new URLSearchParams();
    if (next.status) nextParams.set("status", next.status);
    if (next.priority) nextParams.set("priority", next.priority);
    if (next.search) nextParams.set("search", next.search);
    setSearchParams(nextParams, { replace: true });
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link to="/projects" className="text-sm text-brand-600 hover:underline">
          ← All projects
        </Link>
        <div className="mt-2 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              {project.data ? project.data.name : "Loading..."}
            </h1>
            {project.data?.description && (
              <p className="mt-1 text-sm text-slate-500">{project.data.description}</p>
            )}
          </div>
          <Link to={`/projects/${projectId}/issues/new`}>
            <Button>+ New Issue</Button>
          </Link>
        </div>
      </div>

      <IssueFiltersBar filters={filters} onChange={handleFilterChange} />

      {issues.isLoading && <Spinner label="Loading issues..." />}
      {issues.isError && (
        <ErrorState message="Couldn't load issues for this project." onRetry={() => issues.refetch()} />
      )}

      {!issues.isLoading && !issues.isError && issues.data && issues.data.length === 0 && (
        <EmptyState
          title={
            filters.status || filters.priority || filters.search
              ? "No issues match your filters"
              : "No issues yet"
          }
          description={
            filters.status || filters.priority || filters.search
              ? "Try adjusting or clearing your filters."
              : "Create the first issue for this project."
          }
          action={
            <Link
              to={`/projects/${projectId}/issues/new`}
              className="text-sm font-semibold text-brand-600 hover:underline"
            >
              + New Issue
            </Link>
          }
        />
      )}

      {!issues.isLoading && !issues.isError && issues.data && issues.data.length > 0 && (
        <IssueTable issues={issues.data} density={density} />
      )}
    </div>
  );
}
