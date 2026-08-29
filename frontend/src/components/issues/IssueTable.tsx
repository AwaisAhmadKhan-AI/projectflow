import { Link } from "react-router-dom";

import { PriorityBadge, StatusBadge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";
import type { Issue } from "@/types";

/**
 * "Density" reads from Redux (the one deliberately-shared preference —
 * see store/uiSlice.ts) since it's a client preference that both this
 * table and a settings toggle elsewhere in the app would need to agree
 * on, and it should persist as the user moves between projects.
 */
export function IssueTable({ issues, density }: { issues: Issue[]; density: "comfortable" | "compact" }) {
  const rowPadding = density === "compact" ? "py-2" : "py-3.5";

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50">
          <tr>
            <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-slate-500">
              Title
            </th>
            <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-slate-500">
              Status
            </th>
            <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-slate-500">
              Priority
            </th>
            <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-slate-500">
              Assignee
            </th>
            <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-slate-500">
              Due
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {issues.map((issue) => (
            <tr key={issue.id} className="hover:bg-slate-50">
              <td className={`px-4 ${rowPadding} text-sm font-medium text-slate-900`}>
                <Link
                  to={`/issues/${issue.id}`}
                  className="hover:text-brand-700 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600"
                >
                  {issue.title}
                </Link>
              </td>
              <td className={`px-4 ${rowPadding} text-sm`}>
                <StatusBadge status={issue.status} />
              </td>
              <td className={`px-4 ${rowPadding} text-sm`}>
                <PriorityBadge priority={issue.priority} />
              </td>
              <td className={`px-4 ${rowPadding} text-sm text-slate-600`}>
                {issue.assignee ?? <span className="text-slate-400">Unassigned</span>}
              </td>
              <td className={`px-4 ${rowPadding} text-sm text-slate-600`}>
                {formatDate(issue.due_date)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
