import { Link } from 'react-router-dom';
import { useProjects } from '../hooks/useProjects';
import { useIssues } from '../hooks/useIssues';

export function DashboardPage() {
  const { data: projects = [], isLoading: projectsLoading } = useProjects();
  const { data: issues = [], isLoading: issuesLoading } = useIssues();

  const openIssues = issues.filter((i) => i.status !== 'done');
  const blockedIssues = issues.filter((i) => i.status === 'blocked');

  if (projectsLoading || issuesLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
        <p className="mt-2 text-slate-600">Welcome back! Here's your project overview.</p>
      </div>

      <div className="mb-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
          <p className="text-3xl font-bold text-slate-900">{projects.length}</p>
          <p className="mt-1 text-sm text-slate-500">Total Projects</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
          <p className="text-3xl font-bold text-slate-900">{issues.length}</p>
          <p className="mt-1 text-sm text-slate-500">Total Issues</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
          <p className="text-3xl font-bold text-blue-600">{openIssues.length}</p>
          <p className="mt-1 text-sm text-slate-500">Open Issues</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
          <p className="text-3xl font-bold text-red-600">{blockedIssues.length}</p>
          <p className="mt-1 text-sm text-slate-500">Blocked</p>
        </div>
      </div>

      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-semibold text-slate-900">Recent Projects</h2>
        <Link to="/projects" className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
          View all →
        </Link>
      </div>

      {projects.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.slice(0, 6).map((project) => (
            <Link
              key={project.id}
              to={`/projects/${project.id}/issues`}
              className="group rounded-2xl border border-slate-200 bg-white p-6 transition-all hover:border-indigo-300 hover:shadow-lg"
            >
              <h3 className="font-semibold text-slate-900 group-hover:text-indigo-700">{project.name}</h3>
              {project.description && (
                <p className="mt-2 text-sm text-slate-500 line-clamp-2">{project.description}</p>
              )}
            </Link>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center">
          <p className="text-5xl mb-4">📁</p>
          <p className="text-lg font-medium text-slate-700">No projects yet</p>
          <p className="mt-1 text-sm text-slate-500">Create your first project to get started</p>
          <Link
            to="/projects"
            className="mt-4 inline-block rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            Create Project
          </Link>
        </div>
      )}
    </div>
  );
}