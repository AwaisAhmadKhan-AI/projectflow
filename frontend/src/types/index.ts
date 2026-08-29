/**
 * Shared frontend types, matching the FastAPI Pydantic schemas exactly
 * (see backend/app/schemas). Keeping these in one file means the mock
 * API, the real API client, and every component agree on the same
 * shape of a Project or Issue.
 */

export type IssueStatus = "backlog" | "in_progress" | "blocked" | "done";
export type IssuePriority = "low" | "medium" | "high";

export const ISSUE_STATUSES: IssueStatus[] = [
  "backlog",
  "in_progress",
  "blocked",
  "done",
];

export const ISSUE_PRIORITIES: IssuePriority[] = ["low", "medium", "high"];

export interface Project {
  id: number;
  name: string;
  description: string | null;
  created_at: string;
}

export interface ProjectSummary extends Project {
  issue_count: number;
}

export interface Issue {
  id: number;
  project_id: number;
  title: string;
  description: string | null;
  status: IssueStatus;
  priority: IssuePriority;
  assignee: string | null;
  due_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateProjectInput {
  name: string;
  description?: string | null;
}

export interface CreateIssueInput {
  title: string;
  description?: string | null;
  status: IssueStatus;
  priority: IssuePriority;
  assignee?: string | null;
  due_date?: string | null;
}

export type UpdateIssueInput = Partial<CreateIssueInput>;

export interface IssueFilters {
  status?: IssueStatus;
  priority?: IssuePriority;
  search?: string;
}
