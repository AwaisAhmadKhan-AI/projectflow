import { useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { useProject } from '../hooks/useProjects';
import { useProjectIssues } from '../hooks/useIssues';
import type { IssueStatus, IssuePriority } from '../types';

const statusOptions: IssueStatus[] = ['backlog', 'in_progress', 'blocked', 'done'];
const priorityOptions: IssuePriority[] = ['low', 'medium', 'high'];

export function ProjectIssuesPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();

  const status = (searchParams.get('status') as IssueStatus) || undefined;
  const priority = (searchParams.get('priority') as IssuePriority) || undefined;

  // Search typing ke liye local state
  const [searchInput, setSearchInput] = useState('');

  const { data: project, isLoading: projectLoading, isError: projectError } = useProject(Number(projectId));
  const {
    data: issues = [],
    isFetching: issuesFetching,
    isError: issuesError,
    refetch,
  } = useProjectIssues(Number(projectId), { status, priority, search: searchInput || undefined });

  const updateFilter = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    setSearchParams(newParams, { replace: true });
  };

  // Sirf project load hone pe full page spinner — input unmount nahi hoga
  if (projectLoading || projectError || !project) {
    if (projectLoading) {
      return (
        <div className="flex items-center justify-center py-20">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600"></div>
        </div>
      );
    }
    return (
      <div className="py-20 text-center">
        <p className="text-5xl mb-4">🔍</p>
        <h2 className="text-xl font-semibold text-slate-900 mb-2">Project not found</h2>
        <Link to="/projects" className="text-indigo-600 hover:text-indigo-700 text-sm">
          ← Back to projects
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <Link to="/projects" className="text-sm text-indigo-600 hover:text-indigo-700">
          ← Back to projects
        </Link>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">{project.name}</h1>
        {project.description && (
          <p className="mt-2 text-slate-600">{project.description}</p>
        )}
      </div>

      <div className="mb-6">
        <Link
          to="/issues/new"
          state={{ projectId: project.id }}
          className="inline-block rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors shadow-sm"
        >
          + New Issue
        </Link>
      </div>

      <div className="mb-4">
        <input
          type="search"
          placeholder="Search issues..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="w-full sm:w-80 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
        {issuesFetching && (
          <p className="mt-1 text-xs text-slate-500">Loading issues...</p>
        )}
      </div>

      <div className="mb-8 flex flex-wrap gap-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-slate-700">Status:</span>
          {statusOptions.map((s) => (
            <button
              key={s}
              onClick={() => updateFilter('status', status === s ? '' : s)}
              className={`rounded-full px-3 py-1 text-xs font-medium capitalize transition-colors ${
                status === s
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {s.replace('_', ' ')}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-slate-700">Priority:</span>
          {priorityOptions.map((p) => (
            <button
              key={p}
              onClick={() => updateFilter('priority', priority === p ? '' : p)}
              className={`rounded-full px-3 py-1 text-xs font-medium capitalize transition-colors ${
                priority === p
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {issuesError ? (
        <div className="py-16 text-center">
          <p className="text-4xl mb-3">⚠️</p>
          <p className="text-slate-600 mb-3">Failed to load issues</p>
          <button
            onClick={() => refetch()}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700"
          >
            Try Again
          </button>
        </div>
      ) : issues.length > 0 ? (
        <div className="space-y-3">
          {issues.map((issue) => (
            <Link
              key={issue.id}
              to={`/issues/${issue.id}`}
              className="block rounded-2xl border border-slate-200 bg-white p-5 transition-all hover:border-indigo-300 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-semibold text-slate-900">{issue.title}</h3>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${
                  issue.status === 'done'
                    ? 'bg-emerald-100 text-emerald-700'
                    : issue.status === 'blocked'
                      ? 'bg-red-100 text-red-700'
                      : issue.status === 'in_progress'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-slate-100 text-slate-700'
                }`}>
                  {issue.status.replace('_', ' ')}
                </span>
              </div>
              {issue.description && (
                <p className="mt-2 text-sm text-slate-500 line-clamp-2">{issue.description}</p>
              )}
              <div className="mt-3 flex items-center gap-4 text-xs text-slate-400">
                <span className="capitalize">Priority: {issue.priority}</span>
                {issue.assignee && <span>Assignee: {issue.assignee}</span>}
                {issue.due_date && <span>Due: {new Date(issue.due_date).toLocaleDateString()}</span>}
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center">
          <p className="text-4xl mb-3">📋</p>
          <p className="text-lg font-medium text-slate-700">No issues found</p>
          <p className="text-sm mt-1 text-slate-500">Try adjusting filters or create a new issue</p>
        </div>
      )}
    </div>
  );
}