import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { issueFormSchema, type IssueFormValues } from "@/schemas/issueSchema";
import { ISSUE_PRIORITIES, ISSUE_STATUSES } from "@/types";

interface IssueFormProps {
  defaultValues?: Partial<IssueFormValues>;
  submitLabel: string;
  onSubmit: (values: IssueFormValues) => Promise<void>;
  onCancel: () => void;
  submitError?: string | null;
}

/**
 * Shared by both the Create Issue and Edit Issue screens (Section 6.1:
 * "Edit Issue: reuse form structure appropriately"). The screens differ
 * only in defaultValues, submit label, and what the submit handler does
 * with the validated values — the form itself, and its validation
 * rules, are identical.
 */
export function IssueForm({
  defaultValues,
  submitLabel,
  onSubmit,
  onCancel,
  submitError,
}: IssueFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<IssueFormValues>({
    resolver: zodResolver(issueFormSchema),
    defaultValues: {
      title: "",
      description: "",
      status: "backlog",
      priority: "medium",
      assignee: "",
      due_date: "",
      ...defaultValues,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
      <FormField label="Title" htmlFor="issue-title" error={errors.title?.message} required>
        <input
          id="issue-title"
          type="text"
          className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand-600 focus:outline-none focus:ring-1 focus:ring-brand-600"
          {...register("title")}
        />
      </FormField>

      <FormField
        label="Description"
        htmlFor="issue-description"
        error={errors.description?.message}
      >
        <textarea
          id="issue-description"
          rows={4}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand-600 focus:outline-none focus:ring-1 focus:ring-brand-600"
          {...register("description")}
        />
      </FormField>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField label="Status" htmlFor="issue-status" error={errors.status?.message} required>
          <select
            id="issue-status"
            className="rounded-md border border-slate-300 px-3 py-2 text-sm capitalize focus:border-brand-600 focus:outline-none focus:ring-1 focus:ring-brand-600"
            {...register("status")}
          >
            {ISSUE_STATUSES.map((status) => (
              <option key={status} value={status} className="capitalize">
                {status.replace("_", " ")}
              </option>
            ))}
          </select>
        </FormField>

        <FormField
          label="Priority"
          htmlFor="issue-priority"
          error={errors.priority?.message}
          required
        >
          <select
            id="issue-priority"
            className="rounded-md border border-slate-300 px-3 py-2 text-sm capitalize focus:border-brand-600 focus:outline-none focus:ring-1 focus:ring-brand-600"
            {...register("priority")}
          >
            {ISSUE_PRIORITIES.map((priority) => (
              <option key={priority} value={priority}>
                {priority}
              </option>
            ))}
          </select>
        </FormField>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField label="Assignee" htmlFor="issue-assignee" error={errors.assignee?.message}>
          <input
            id="issue-assignee"
            type="text"
            placeholder="Unassigned"
            className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand-600 focus:outline-none focus:ring-1 focus:ring-brand-600"
            {...register("assignee")}
          />
        </FormField>

        <FormField label="Due date" htmlFor="issue-due-date" error={errors.due_date?.message}>
          <input
            id="issue-due-date"
            type="date"
            className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand-600 focus:outline-none focus:ring-1 focus:ring-brand-600"
            {...register("due_date")}
          />
        </FormField>
      </div>

      {submitError && (
        <p role="alert" className="text-sm text-red-600">
          {submitError}
        </p>
      )}

      <div className="mt-2 flex justify-end gap-2">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}
