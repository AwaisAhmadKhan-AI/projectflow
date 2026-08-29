/**
 * TanStack Query hooks for issue data, including filtering (status,
 * priority, search) which is encoded directly into the query key so
 * each distinct filter combination is cached separately.
 */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "@/lib/api/client";
import type { CreateIssueInput, IssueFilters, UpdateIssueInput } from "@/types";

export const issueKeys = {
  list: (projectId: number, filters: IssueFilters) =>
    ["projects", projectId, "issues", filters] as const,
  detail: (id: number) => ["issues", id] as const,
};

export function useIssues(projectId: number, filters: IssueFilters) {
  return useQuery({
    queryKey: issueKeys.list(projectId, filters),
    queryFn: () => api.listIssues(projectId, filters),
    enabled: Number.isFinite(projectId),
  });
}

export function useIssue(id: number) {
  return useQuery({
    queryKey: issueKeys.detail(id),
    queryFn: () => api.getIssue(id),
    enabled: Number.isFinite(id),
    retry: false,
  });
}

export function useCreateIssue(projectId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateIssueInput) => api.createIssue(projectId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects", projectId, "issues"] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}

export function useUpdateIssue(issueId: number, projectId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateIssueInput) => api.updateIssue(issueId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: issueKeys.detail(issueId) });
      queryClient.invalidateQueries({ queryKey: ["projects", projectId, "issues"] });
    },
  });
}

export function useDeleteIssue(projectId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (issueId: number) => api.deleteIssue(issueId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects", projectId, "issues"] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}
