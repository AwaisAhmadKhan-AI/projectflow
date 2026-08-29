import { CreateProjectDialog } from "@/components/projects/CreateProjectDialog";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Spinner } from "@/components/ui/Spinner";
import { useProjects } from "@/hooks/useProjects";

export function Projects() {
  const { data: projects, isLoading, isError, refetch } = useProjects();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Projects</h1>
          <p className="mt-1 text-sm text-slate-500">
            Every project your team is currently tracking.
          </p>
        </div>
        <CreateProjectDialog />
      </div>

      {isLoading && <Spinner label="Loading projects..." />}
      {isError && <ErrorState message="Couldn't load projects." onRetry={() => refetch()} />}

      {!isLoading && !isError && projects && projects.length === 0 && (
        <EmptyState
          title="No projects yet"
          description='Click "New Project" above to create your first one.'
        />
      )}

      {!isLoading && !isError && projects && projects.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
}
