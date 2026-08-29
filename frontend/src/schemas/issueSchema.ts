/**
 * Zod schema paired with React Hook Form for the Create/Edit Issue
 * forms. This is where "form values/errors" state lives (see the
 * assessment's state-ownership table, Section 6.3) — React Hook Form
 * owns the values and validation-derived error messages; Zod defines
 * what "valid" means.
 */
import { z } from "zod";

export const issueFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title is required")
    .max(300, "Title must be 300 characters or fewer"),
  description: z.string().trim().max(10000).optional().or(z.literal("")),
  status: z.enum(["backlog", "in_progress", "blocked", "done"]),
  priority: z.enum(["low", "medium", "high"]),
  assignee: z.string().trim().max(150).optional().or(z.literal("")),
  due_date: z.string().optional().or(z.literal("")),
});

export type IssueFormValues = z.infer<typeof issueFormSchema>;
