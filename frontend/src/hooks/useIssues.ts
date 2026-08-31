import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import type { Issue, IssueStatus, IssuePriority } from '../types';

export function useIssues(filters?: { status?: IssueStatus; priority?: IssuePriority; search?: string }) {
  return useQuery({
    queryKey: ['issues', filters],
    queryFn: () => api.getIssues(filters),
  });
}

export function useProjectIssues(
  projectId: number,
  filters?: { status?: IssueStatus; priority?: IssuePriority; search?: string }
) {
  return useQuery({
    queryKey: ['project-issues', projectId, filters],
    queryFn: () => api.getProjectIssues(projectId, filters),
    enabled: !!projectId,
  });
}

export function useIssue(issueId: number) {
  return useQuery({
    queryKey: ['issues', issueId],
    queryFn: () => api.getIssue(issueId),
    enabled: !!issueId,
  });
}

export function useCreateIssue() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Issue>) => api.createIssue(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['issues'] }),
  });
}

export function useUpdateIssue() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Issue> }) => api.updateIssue(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['issues'] }),
  });
}

export function useDeleteIssue() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.deleteIssue(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['issues'] }),
  });
}