import { Link } from "react-router-dom";

import { Button } from "@/components/ui/Button";

/**
 * Distinct from the route-level NotFound: this renders inside a route
 * that DID match (e.g. /issues/9999) once the API tells us the
 * resource itself doesn't exist. Same visual language, different
 * trigger — a missing route vs. a missing record.
 */
export function NotFoundResource({
  resource,
  backTo,
  backLabel,
}: {
  resource: string;
  backTo: string;
  backLabel: string;
}) {
  return (
    <div className="flex flex-col items-center gap-4 py-20 text-center">
      <h1 className="text-xl font-bold text-slate-900">{resource} not found</h1>
      <p className="max-w-sm text-sm text-slate-500">
        It may have been deleted, or the link might be incorrect.
      </p>
      <Link to={backTo}>
        <Button variant="secondary">{backLabel}</Button>
      </Link>
    </div>
  );
}
