import { Link } from 'react-router-dom';
import type { Project } from '../types';

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Link
      to={`/projects/${project.id}/issues`}
      className="block rounded-xl border border-slate-200 bg-white p-5 transition-all hover:border-indigo-300 hover:shadow-md"
    >
      <h3 className="font-semibold text-slate-900">{project.name}</h3>
      {project.description && (
        <p className="mt-2 text-sm text-slate-500 line-clamp-2">{project.description}</p>
      )}
    </Link>
  );
}