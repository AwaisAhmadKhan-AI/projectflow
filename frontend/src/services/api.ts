import type { Project, Issue, IssueStatus, IssuePriority } from '../types';

const BASE_URL = 'http://127.0.0.1:8000';

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${BASE_URL}${url}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }

  if (response.status === 204) return undefined as T;
  return response.json();
}

export const api = {
  // Projects
  getProjects: () => request<Project[]>('/projects/'),
  getProject: (id: number) => request<Project>(`/projects/${id}`),
  createProject: (data: { name: string; description?: string }) =>
    request<Project>('/projects/', { method: 'POST', body: JSON.stringify(data) }),

  // Issues — general
  getIssues: (filters?: { status?: IssueStatus; priority?: IssuePriority; search?: string }) => {
    const params = new URLSearchParams();
    if (filters?.status) params.set('status', filters.status);
    if (filters?.priority) params.set('priority', filters.priority);
    if (filters?.search) params.set('search', filters.search);
    const query = params.toString() ? `?${params.toString()}` : '';
    return request<Issue[]>(`/issues/${query}`);
  },

  // Issues — project specific
  getProjectIssues: (
    projectId: number,
    filters?: { status?: IssueStatus; priority?: IssuePriority; search?: string }
  ) => {
    const params = new URLSearchParams();
    if (filters?.status) params.set('status', filters.status);
    if (filters?.priority) params.set('priority', filters.priority);
    if (filters?.search) params.set('search', filters.search);
    const query = params.toString() ? `?${params.toString()}` : '';
    return request<Issue[]>(`/projects/${projectId}/issues/${query}`);
  },

  getIssue: (id: number) => request<Issue>(`/issues/${id}`),
  createIssue: (data: Partial<Issue>) =>
    request<Issue>('/issues/', { method: 'POST', body: JSON.stringify(data) }),
  updateIssue: (id: number, data: Partial<Issue>) =>
    request<Issue>(`/issues/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteIssue: (id: number) =>
    request<void>(`/issues/${id}`, { method: 'DELETE' }),
};