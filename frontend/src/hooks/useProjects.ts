import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';


export function useProjects() {
  return useQuery({ queryKey: ['projects'], queryFn: api.getProjects });
}

export function useProject(projectId: number) {
  return useQuery({
    queryKey: ['projects', projectId],
    queryFn: () => api.getProject(projectId),
    enabled: !!projectId,
  });
}

export function useCreateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; description?: string }) => api.createProject(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['projects'] }),
  });
}