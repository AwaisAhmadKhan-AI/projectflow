/**
 * Real HTTP client for the FastAPI backend. Implements the exact same
 * function signatures as mockApi (see mockData.ts) so lib/api/client.ts
 * can swap between them without any component knowing the difference.
 *
 * Connecting to the real backend is optional bonus work per the
 * assessment (Section 7) — toggle it with VITE_USE_MOCK_API=false.
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
import { NotFoundError, ValidationError } from "@/lib/api/mockData";

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });

  if (response.status === 404) {
    throw new NotFoundError("Resource");
  }
  if (response.status === 422) {
    throw new ValidationError("Invalid input");
  }
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }
  if (response.status === 204) {
    return undefined as T;
  }
  return response.json() as Promise<T>;
}

export const httpApi = {
  listProjects: () => request<ProjectSummary[]>("/projects"),

  getProject: (id: number) => request<Project>(`/projects/${id}`),

  createProject: (input: CreateProjectInput) =>
    request<Project>("/projects", { method: "POST", body: JSON.stringify(input) }),

  listIssues: (projectId: number, filters: IssueFilters = {}) => {
    const params = new URLSearchParams();
    if (filters.status) params.set("status", filters.status);
    if (filters.priority) params.set("priority", filters.priority);
    if (filters.search) params.set("search", filters.search);
    const qs = params.toString();
    return request<Issue[]>(`/projects/${projectId}/issues${qs ? `?${qs}` : ""}`);
  },

  getIssue: (id: number) => request<Issue>(`/issues/${id}`),

  createIssue: (projectId: number, input: CreateIssueInput) =>
    request<Issue>(`/projects/${projectId}/issues`, {
      method: "POST",
      body: JSON.stringify(input),
    }),

  updateIssue: (id: number, input: UpdateIssueInput) =>
    request<Issue>(`/issues/${id}`, { method: "PATCH", body: JSON.stringify(input) }),

  deleteIssue: (id: number) => request<void>(`/issues/${id}`, { method: "DELETE" }),
};
