/**
 * TanStack Query hooks for project data.
 *
 * Server data lives here, in Query's cache — not in Redux. Section 6.3
 * of the assessment is explicit that server/API data belongs in
 * TanStack Query rather than duplicated Redux state, since Query
 * already gives us caching, loading/error states and invalidation.
 */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "@/lib/api/client";
import type { CreateProjectInput } from "@/types";

export const projectKeys = {
  all: ["projects"] as const,
  detail: (id: number) => ["projects", id] as const,
};

export function useProjects() {
  return useQuery({
    queryKey: projectKeys.all,
    queryFn: () => api.listProjects(),
  });
}

export function useProject(id: number) {
  return useQuery({
    queryKey: projectKeys.detail(id),
    queryFn: () => api.getProject(id),
    enabled: Number.isFinite(id),
    retry: false,
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateProjectInput) => api.createProject(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.all });
    },
  });
}
