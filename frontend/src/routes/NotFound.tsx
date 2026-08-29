import { Link } from "react-router-dom";

import { Button } from "@/components/ui/Button";

export function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
      <p className="text-sm font-semibold uppercase tracking-wide text-brand-600">404</p>
      <h1 className="text-2xl font-bold text-slate-900">Page not found</h1>
      <p className="max-w-sm text-sm text-slate-500">
        The page you're looking for doesn't exist or may have been moved.
      </p>
      <Link to="/" className="mt-2">
        <Button>Back to Dashboard</Button>
      </Link>
    </div>
  );
}
