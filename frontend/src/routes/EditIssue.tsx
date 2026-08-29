import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { IssueForm } from "@/components/issues/IssueForm";
import { Spinner } from "@/components/ui/Spinner";
import { useIssue, useUpdateIssue } from "@/hooks/useIssues";
import type { IssueFormValues } from "@/schemas/issueSchema";
import { NotFound } from "@/routes/NotFound";

export function EditIssue() {
  const params = useParams<{ issueId: string }>();
  const issueId = Number(params.issueId);
  const navigate = useNavigate();

  const { data: issue, isLoading, isError } = useIssue(issueId);
  const updateIssue = useUpdateIssue(issueId, issue?.project_id ?? 0);
  const [submitError, setSubmitError] = useState<string | null>(null);

  if (isLoading) return <Spinner label="Loading issue..." />;
  if (isError || !issue) return <NotFound />;

  const handleSubmit = async (values: IssueFormValues) => {
    setSubmitError(null);
    try {
      await updateIssue.mutateAsync({
        title: values.title,
        description: values.description || null,
        status: values.status,
        priority: values.priority,
        assignee: values.assignee || null,
        due_date: values.due_date || null,
      });
      navigate(`/issues/${issueId}`);
    } catch {
      setSubmitError("Could not save your changes. Please try again.");
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <Link to={`/issues/${issueId}`} className="text-sm text-brand-600 hover:underline">
        ← Back to issue
      </Link>
      <h1 className="mt-2 text-2xl font-bold text-slate-900">Edit Issue</h1>

      <div className="mt-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <IssueForm
          submitLabel="Save Changes"
          submitError={submitError}
          onCancel={() => navigate(`/issues/${issueId}`)}
          onSubmit={handleSubmit}
          defaultValues={{
            title: issue.title,
            description: issue.description ?? "",
            status: issue.status,
            priority: issue.priority,
            assignee: issue.assignee ?? "",
            due_date: issue.due_date ?? "",
          }}
        />
      </div>
    </div>
  );
}
