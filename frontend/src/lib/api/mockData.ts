/**
 * In-memory mock REST layer.
 *
 * The assessment (Section 7) explicitly allows the frontend to run
 * against a local/mock data source that follows the same Project/Issue
 * contract as the FastAPI backend, since real CORS integration is
 * covered later. This module simulates that contract — including
 * network latency and realistic error cases — so every screen behaves
 * the same way it would against the real API in lib/api/httpClient.ts.
 */
import type {
  CreateIssueInput,
  CreateProjectInput,
  Issue,
  IssueFilters,
  Project,
  ProjectSummary,
  UpdateIssueInput,
} from "@/types";

class NotFoundError extends Error {
  constructor(resource: string) {
    super(`${resource} not found`);
    this.name = "NotFoundError";
  }
}

class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

let projects: Project[] = [
  {
    id: 1,
    name: "ProjectFlow Core",
    description: "The internal tracker rebuild itself.",
    created_at: "2026-08-01T09:00:00Z",
  },
  {
    id: 2,
    name: "Mobile App Revamp",
    description: "Redesigning the companion mobile app.",
    created_at: "2026-08-10T09:00:00Z",
  },
];

let issues: Issue[] = [
  {
    id: 1,
    project_id: 1,
    title: "Set up CI pipeline",
    description: "Add GitHub Actions for lint, type-check and tests.",
    status: "in_progress",
    priority: "high",
    assignee: "Amina",
    due_date: "2026-09-05",
    created_at: "2026-08-01T10:00:00Z",
    updated_at: "2026-08-20T10:00:00Z",
  },
  {
    id: 2,
    project_id: 1,
    title: "Design issue detail page",
    description: "Wireframe and build the issue detail screen.",
    status: "backlog",
    priority: "medium",
    assignee: null,
    due_date: "2026-09-12",
    created_at: "2026-08-02T10:00:00Z",
    updated_at: "2026-08-02T10:00:00Z",
  },
  {
    id: 3,
    project_id: 1,
    title: "Fix login redirect bug",
    description: "Users land on a blank page after login in Safari.",
    status: "blocked",
    priority: "high",
    assignee: "Farhan",
    due_date: "2026-08-30",
    created_at: "2026-08-03T10:00:00Z",
    updated_at: "2026-08-25T10:00:00Z",
  },
  {
    id: 4,
    project_id: 1,
    title: "Write onboarding docs",
    description: "Short README for new team members.",
    status: "done",
    priority: "low",
    assignee: "Amina",
    due_date: null,
    created_at: "2026-07-28T10:00:00Z",
    updated_at: "2026-08-05T10:00:00Z",
  },
  {
    id: 5,
    project_id: 2,
    title: "Audit crash reports",
    description: "Review last month's crash analytics.",
    status: "in_progress",
    priority: "medium",
    assignee: "Zara",
    due_date: "2026-09-02",
    created_at: "2026-08-11T10:00:00Z",
    updated_at: "2026-08-18T10:00:00Z",
  },
];

let nextProjectId = 3;
let nextIssueId = 6;

const LATENCY_MS = 300;

function delay<T>(value: T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), LATENCY_MS));
}

export const mockApi = {
  async listProjects(): Promise<ProjectSummary[]> {
    const summaries = projects.map((p) => ({
      ...p,
      issue_count: issues.filter((i) => i.project_id === p.id).length,
    }));
    return delay(summaries.sort((a, b) => a.id - b.id));
  },

  async getProject(id: number): Promise<Project> {
    const project = projects.find((p) => p.id === id);
    if (!project) throw new NotFoundError("Project");
    return delay(project);
  },

  async createProject(input: CreateProjectInput): Promise<Project> {
    if (!input.name.trim()) throw new ValidationError("Project name is required");
    const project: Project = {
      id: nextProjectId++,
      name: input.name.trim(),
      description: input.description?.trim() || null,
      created_at: new Date().toISOString(),
    };
    projects = [...projects, project];
    return delay(project);
  },

  async listIssues(projectId: number, filters: IssueFilters = {}): Promise<Issue[]> {
    if (!projects.some((p) => p.id === projectId)) throw new NotFoundError("Project");

    let result = issues.filter((i) => i.project_id === projectId);
    if (filters.status) result = result.filter((i) => i.status === filters.status);
    if (filters.priority) result = result.filter((i) => i.priority === filters.priority);
    if (filters.search) {
      const term = filters.search.toLowerCase();
      result = result.filter(
        (i) =>
          i.title.toLowerCase().includes(term) ||
          (i.description ?? "").toLowerCase().includes(term)
      );
    }
    result = [...result].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    return delay(result);
  },

  async getIssue(id: number): Promise<Issue> {
    const issue = issues.find((i) => i.id === id);
    if (!issue) throw new NotFoundError("Issue");
    return delay(issue);
  },

  async createIssue(projectId: number, input: CreateIssueInput): Promise<Issue> {
    if (!projects.some((p) => p.id === projectId)) throw new NotFoundError("Project");
    if (!input.title.trim()) throw new ValidationError("Issue title is required");

    const now = new Date().toISOString();
    const issue: Issue = {
      id: nextIssueId++,
      project_id: projectId,
      title: input.title.trim(),
      description: input.description?.trim() || null,
      status: input.status,
      priority: input.priority,
      assignee: input.assignee?.trim() || null,
      due_date: input.due_date || null,
      created_at: now,
      updated_at: now,
    };
    issues = [...issues, issue];
    return delay(issue);
  },

  async updateIssue(id: number, input: UpdateIssueInput): Promise<Issue> {
    const index = issues.findIndex((i) => i.id === id);
    if (index === -1) throw new NotFoundError("Issue");

    const updated: Issue = {
      ...issues[index],
      ...input,
      updated_at: new Date().toISOString(),
    };
    issues = issues.map((i) => (i.id === id ? updated : i));
    return delay(updated);
  },

  async deleteIssue(id: number): Promise<void> {
    if (!issues.some((i) => i.id === id)) throw new NotFoundError("Issue");
    issues = issues.filter((i) => i.id !== id);
    return delay(undefined);
  },
};

export { NotFoundError, ValidationError };
