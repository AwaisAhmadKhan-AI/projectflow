import type { IssuePriority, IssueStatus } from "@/types";

const STATUS_STYLES: Record<IssueStatus, string> = {
  backlog: "bg-slate-100 text-slate-700 ring-slate-300",
  in_progress: "bg-blue-100 text-blue-700 ring-blue-300",
  blocked: "bg-red-100 text-red-700 ring-red-300",
  done: "bg-emerald-100 text-emerald-700 ring-emerald-300",
};

const STATUS_LABELS: Record<IssueStatus, string> = {
  backlog: "Backlog",
  in_progress: "In Progress",
  blocked: "Blocked",
  done: "Done",
};

const PRIORITY_STYLES: Record<IssuePriority, string> = {
  low: "bg-slate-100 text-slate-600 ring-slate-300",
  medium: "bg-amber-100 text-amber-700 ring-amber-300",
  high: "bg-rose-100 text-rose-700 ring-rose-300",
};

export function StatusBadge({ status }: { status: IssueStatus }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${STATUS_STYLES[status]}`}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: IssuePriority }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ring-1 ring-inset ${PRIORITY_STYLES[priority]}`}
    >
      {priority}
    </span>
  );
}
