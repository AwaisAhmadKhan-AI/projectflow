import { Link } from "react-router-dom";

import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Spinner } from "@/components/ui/Spinner";
import { useProjects } from "@/hooks/useProjects";
import type { IssueStatus } from "@/types";

const STATUS_COLUMNS: { key: IssueStatus; label: string }[] = [
  { key: "backlog", label: "Backlog" },
  { key: "in_progress", label: "In Progress" },
  { key: "blocked", label: "Blocked" },
  { key: "done", label: "Done" },
];

export function Dashboard() {
  const { data: projects, isLoading, isError, refetch } = useProjects();

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">
          A quick summary across all your projects.
        </p>
      </div>

      {isLoading && <Spinner label="Loading dashboard..." />}

      {isError && (
        <ErrorState message="Couldn't load your projects." onRetry={() => refetch()} />
      )}

      {!isLoading && !isError && projects && projects.length === 0 && (
        <EmptyState
          title="No projects yet"
          description="Create your first project to start tracking issues."
          action={
            <Link to="/projects" className="text-sm font-semibold text-brand-600 hover:underline">
              Go to Projects →
            </Link>
          }
        />
      )}

      {!isLoading && !isError && projects && projects.length > 0 && (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Total projects
              </p>
              <p className="mt-2 text-3xl font-bold text-slate-900">{projects.length}</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Total issues
              </p>
              <p className="mt-2 text-3xl font-bold text-slate-900">
                {projects.reduce((sum, p) => sum + p.issue_count, 0)}
              </p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Quick action
              </p>
              <Link
                to="/projects"
                className="mt-2 inline-block text-sm font-semibold text-brand-600 hover:underline"
              >
                Browse projects →
              </Link>
            </div>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-slate-700">Your projects</h2>
            <ul className="mt-3 divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white shadow-sm">
              {projects.map((project) => (
                <li key={project.id}>
                  <Link
                    to={`/projects/${project.id}`}
                    className="flex items-center justify-between px-4 py-3 text-sm hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand-600"
                  >
                    <span className="font-medium text-slate-900">{project.name}</span>
                    <span className="text-slate-500">
                      {project.issue_count} {project.issue_count === 1 ? "issue" : "issues"}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <p className="text-xs text-slate-400">
            Status columns tracked per project: {STATUS_COLUMNS.map((c) => c.label).join(", ")}.
          </p>
        </>
      )}
    </div>
  );
}
