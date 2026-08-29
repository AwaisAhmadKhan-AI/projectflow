import type { ChangeEvent } from "react";

import type { IssueFilters as IssueFiltersType, IssuePriority, IssueStatus } from "@/types";
import { ISSUE_PRIORITIES, ISSUE_STATUSES } from "@/types";

interface IssueFiltersProps {
  filters: IssueFiltersType;
  onChange: (filters: IssueFiltersType) => void;
}

const STATUS_LABELS: Record<IssueStatus, string> = {
  backlog: "Backlog",
  in_progress: "In Progress",
  blocked: "Blocked",
  done: "Done",
};

/**
 * Filter values are owned by the URL (see ProjectIssues.tsx, which
 * reads/writes useSearchParams), not local state — Section 6.3 calls
 * out "shareable search/filter values" as belonging in URL search
 * params so a filtered view can be bookmarked or shared as a link.
 * This component is a pure controlled input; it holds no state of
 * its own.
 */
export function IssueFiltersBar({ filters, onChange }: IssueFiltersProps) {
  const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
    onChange({ ...filters, search: e.target.value || undefined });
  };

  const handleStatus = (e: ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as IssueStatus | "";
    onChange({ ...filters, status: value ? (value as IssueStatus) : undefined });
  };

  const handlePriority = (e: ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as IssuePriority | "";
    onChange({ ...filters, priority: value ? (value as IssuePriority) : undefined });
  };

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="flex-1">
        <label htmlFor="issue-search" className="sr-only">
          Search issues
        </label>
        <input
          id="issue-search"
          type="search"
          placeholder="Search issues by title or description..."
          value={filters.search ?? ""}
          onChange={handleSearch}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand-600 focus:outline-none focus:ring-1 focus:ring-brand-600"
        />
      </div>
      <div className="flex gap-2">
        <div>
          <label htmlFor="status-filter" className="sr-only">
            Filter by status
          </label>
          <select
            id="status-filter"
            value={filters.status ?? ""}
            onChange={handleStatus}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand-600 focus:outline-none focus:ring-1 focus:ring-brand-600"
          >
            <option value="">All statuses</option>
            {ISSUE_STATUSES.map((status) => (
              <option key={status} value={status}>
                {STATUS_LABELS[status]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="priority-filter" className="sr-only">
            Filter by priority
          </label>
          <select
            id="priority-filter"
            value={filters.priority ?? ""}
            onChange={handlePriority}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm capitalize focus:border-brand-600 focus:outline-none focus:ring-1 focus:ring-brand-600"
          >
            <option value="">All priorities</option>
            {ISSUE_PRIORITIES.map((priority) => (
              <option key={priority} value={priority} className="capitalize">
                {priority}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
