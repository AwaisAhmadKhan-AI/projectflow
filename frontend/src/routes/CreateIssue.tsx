import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { IssueForm } from "@/components/issues/IssueForm";
import { useCreateIssue } from "@/hooks/useIssues";
import type { IssueFormValues } from "@/schemas/issueSchema";

export function CreateIssue() {
  const params = useParams<{ projectId: string }>();
  const projectId = Number(params.projectId);
  const navigate = useNavigate();
  const createIssue = useCreateIssue(projectId);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async (values: IssueFormValues) => {
    setSubmitError(null);
    try {
      const created = await createIssue.mutateAsync({
        title: values.title,
        description: values.description || null,
        status: values.status,
        priority: values.priority,
        assignee: values.assignee || null,
        due_date: values.due_date || null,
      });
      navigate(`/issues/${created.id}`);
    } catch {
      setSubmitError("Could not create the issue. Please check your input and try again.");
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <Link to={`/projects/${projectId}`} className="text-sm text-brand-600 hover:underline">
        ← Back to issues
      </Link>
      <h1 className="mt-2 text-2xl font-bold text-slate-900">New Issue</h1>

      <div className="mt-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <IssueForm
          submitLabel="Create Issue"
          submitError={submitError}
          onCancel={() => navigate(`/projects/${projectId}`)}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
}
