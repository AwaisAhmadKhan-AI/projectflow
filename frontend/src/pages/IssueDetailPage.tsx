import { Link, useParams, useNavigate } from 'react-router-dom';
import { useIssue, useDeleteIssue } from '../hooks/useIssues';

export function IssueDetailPage() {
  const { issueId } = useParams<{ issueId: string }>();
  const navigate = useNavigate();
  const { data: issue, isLoading, isError, error, refetch } = useIssue(Number(issueId));
  const deleteIssue = useDeleteIssue();

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this issue?')) return;
    await deleteIssue.mutateAsync(Number(issueId));
    navigate('/projects');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600"></div>
      </div>
    );
  }

  if (isError || !issue) {
    return (
      <div className="py-20 text-center">
        <p className="text-5xl mb-4">🔍</p>
        <h2 className="text-xl font-semibold text-slate-900 mb-2">Issue not found</h2>
        <p className="text-slate-500 mb-4">{(error as Error)?.message || 'This issue may have been deleted.'}</p>
        <button
          onClick={() => refetch()}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700"
        >
          Try Again
        </button>
        <Link to="/projects" className="mt-2 ml-4 text-indigo-600 text-sm">
          Back to projects
        </Link>
      </div>
    );
  }

  return (
    <div>
      <Link to={`/projects/${issue.project_id}/issues`} className="text-sm text-indigo-600 hover:text-indigo-700">
        ← Back to issues
      </Link>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-2xl font-bold text-slate-900">{issue.title}</h1>
          <span className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${
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
          <p className="mt-4 text-slate-600">{issue.description}</p>
        )}

        <div className="mt-8 grid grid-cols-2 gap-6 sm:grid-cols-4">
          <div>
            <p className="text-xs text-slate-500 uppercase">Priority</p>
            <p className="mt-1 font-medium text-slate-900 capitalize">{issue.priority}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase">Assignee</p>
            <p className="mt-1 font-medium text-slate-900">{issue.assignee || 'Unassigned'}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase">Due Date</p>
            <p className="mt-1 font-medium text-slate-900">
              {issue.due_date ? new Date(issue.due_date).toLocaleDateString() : 'No due date'}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase">Issue ID</p>
            <p className="mt-1 font-medium text-slate-900">#{issue.id}</p>
          </div>
        </div>

        <div className="mt-8 flex gap-3 border-t border-slate-100 pt-6">
          <Link
            to={`/issues/${issue.id}/edit`}
            className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
          >
            Edit Issue
          </Link>
          <button
            onClick={handleDelete}
            disabled={deleteIssue.isPending}
            className="rounded-lg border border-red-200 px-5 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
          >
            {deleteIssue.isPending ? 'Deleting...' : 'Delete Issue'}
          </button>
        </div>
      </div>
    </div>
  );
}