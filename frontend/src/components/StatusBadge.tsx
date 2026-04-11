import type { IssueStatus } from "../types/report";

type Props = {
  status: IssueStatus;
};

const styleMap: Record<IssueStatus, string> = {
  Pending: "bg-amber-100 text-amber-900 border-amber-200",
  "In Progress": "bg-cyan-100 text-cyan-900 border-cyan-200",
  Resolved: "bg-emerald-100 text-emerald-900 border-emerald-200",
};

export function StatusBadge({ status }: Props) {
  const isResolved = status === "Resolved";

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${styleMap[status]}`}>
      {isResolved ? (
        <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-emerald-700 text-white" aria-hidden="true">
          <svg viewBox="0 0 12 12" className="h-2.5 w-2.5" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M2.4 6.2L4.8 8.6L9.6 3.8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      ) : null}
      <span>{status}</span>
    </span>
  );
}
