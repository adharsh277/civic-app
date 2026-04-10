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
  return <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${styleMap[status]}`}>{status}</span>;
}
