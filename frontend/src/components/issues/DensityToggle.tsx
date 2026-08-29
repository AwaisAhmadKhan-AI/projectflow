import { setIssueListDensity } from "@/store/uiSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

/**
 * The one control that reads/writes the Redux slice — demonstrates why
 * that piece of state is genuinely shared: this toggle and the
 * IssueTable it affects are unrelated components with no natural
 * parent to lift local state into.
 */
export function DensityToggle() {
  const density = useAppSelector((state) => state.ui.issueListDensity);
  const dispatch = useAppDispatch();

  return (
    <div className="flex items-center gap-2 text-sm text-slate-600">
      <span id="density-label">Row density:</span>
      <div role="group" aria-labelledby="density-label" className="flex overflow-hidden rounded-md border border-slate-300">
        {(["comfortable", "compact"] as const).map((option) => (
          <button
            key={option}
            type="button"
            aria-pressed={density === option}
            onClick={() => dispatch(setIssueListDensity(option))}
            className={`px-3 py-1.5 text-xs font-medium capitalize focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 ${
              density === option ? "bg-brand-600 text-white" : "bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}
