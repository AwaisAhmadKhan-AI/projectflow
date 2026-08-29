import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { PriorityBadge, StatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { useDeleteIssue, useIssue } from "@/hooks/useIssues";
import { formatDate, formatDateTime } from "@/lib/utils";
import { NotFound } from "@/routes/NotFound";

/**
 * A route-driven detail screen: the issue id comes from the URL param
 * (React Router), not from any client-side state that had to be passed
 * in — so this page also works correctly on a hard refresh or a direct
 * link (Section 6.1: "Open an issue by URL/route ID").
 */
export function IssueDetails() {
  const params = useParams<{ issueId: string }>();
  const issueId = Number(params.issueId);
  const navigate = useNavigate();

  const { data: issue, isLoading, isError } = useIssue(issueId);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const deleteIssue = useDeleteIssue(issue?.project_id ?? 0);

  if (isLoading) {
    return <Spinner label="Loading issue..." />;
  }

  if (isError || !issue) {
    return <NotFound />;
  }

  const handleDelete = async () => {
    try {
      await deleteIssue.mutateAsync(issue.id);
      navigate(`/projects/${issue.project_id}`, { replace: true });
    } catch {
      setConfirmingDelete(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <Link to={`/projects/${issue.project_id}`} className="text-sm text-brand-600 hover:underline">
        ← Back to issues
      </Link>

      <div className="mt-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-xl font-bold text-slate-900">{issue.title}</h1>
          <div className="flex shrink-0 gap-2">
            <Link to={`/issues/${issue.id}/edit`}>
              <Button variant="secondary">Edit</Button>
            </Link>
            <Button variant="danger" onClick={() => setConfirmingDelete(true)}>
              Delete
            </Button>
          </div>
        </div>

        <div className="mt-3 flex gap-2">
          <StatusBadge status={issue.status} />
          <PriorityBadge priority={issue.priority} />
        </div>

        {issue.description && (
          <p className="mt-4 whitespace-pre-wrap text-sm text-slate-700">{issue.description}</p>
        )}

        <dl className="mt-6 grid grid-cols-2 gap-4 border-t border-slate-100 pt-4 text-sm">
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Assignee
            </dt>
            <dd className="mt-1 text-slate-700">{issue.assignee ?? "Unassigned"}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Due date
            </dt>
            <dd className="mt-1 text-slate-700">{formatDate(issue.due_date)}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Created
            </dt>
            <dd className="mt-1 text-slate-700">{formatDateTime(issue.created_at)}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Last updated
            </dt>
            <dd className="mt-1 text-slate-700">{formatDateTime(issue.updated_at)}</dd>
          </div>
        </dl>
      </div>

      {confirmingDelete && (
        <div
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="confirm-delete-heading"
          className="fixed inset-0 z-10 flex items-center justify-center bg-slate-900/40 p-4"
        >
          <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-xl">
            <h2 id="confirm-delete-heading" className="text-base font-semibold text-slate-900">
              Delete this issue?
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              This action cannot be undone. "{issue.title}" will be permanently removed.
            </p>
            {deleteIssue.isError && (
              <p role="alert" className="mt-2 text-sm text-red-600">
                Could not delete the issue. Please try again.
              </p>
            )}
            <div className="mt-5 flex justify-end gap-2">
              <Button
                variant="secondary"
                onClick={() => setConfirmingDelete(false)}
                disabled={deleteIssue.isPending}
              >
                Cancel
              </Button>
              <Button variant="danger" onClick={handleDelete} disabled={deleteIssue.isPending}>
                {deleteIssue.isPending ? "Deleting..." : "Delete Issue"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
