import { Link } from "react-router-dom";

import type { ProjectSummary } from "@/types";

export function ProjectCard({ project }: { project: ProjectSummary }) {
  return (
    <Link
      to={`/projects/${project.id}/issues`}
      className="block rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
    >
      <h3 className="text-base font-semibold text-slate-900">{project.name}</h3>
      <p className="mt-1 line-clamp-2 text-sm text-slate-500">
        {project.description || "No description provided."}
      </p>
      <p className="mt-4 text-xs font-medium text-slate-400">
        {project.issue_count} {project.issue_count === 1 ? "issue" : "issues"}
      </p>
    </Link>
  );
}
