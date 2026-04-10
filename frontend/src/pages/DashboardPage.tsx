import { useEffect, useMemo, useState } from "react";
import { api } from "../api/client";
import { StatusBadge } from "../components/StatusBadge";
import type { IssueStatus, IssueType, Report } from "../types/report";

export function DashboardPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [statusFilter, setStatusFilter] = useState<IssueStatus | "All">("All");
  const [typeFilter, setTypeFilter] = useState<IssueType | "All">("All");

  useEffect(() => {
    api
      .get<Report[]>("/reports")
      .then((res) => setReports(res.data))
      .catch(() => setReports([]));
  }, []);

  const filtered = useMemo(() => {
    return reports.filter((report) => {
      const statusOk = statusFilter === "All" || report.status === statusFilter;
      const typeOk = typeFilter === "All" || report.type === typeFilter;
      return statusOk && typeOk;
    });
  }, [reports, statusFilter, typeFilter]);

  const garbageCount = reports.filter((r) => r.type === "garbage").length;
  const pendingCount = reports.filter((r) => r.status === "Pending").length;
  const resolvedCount = reports.filter((r) => r.status === "Resolved").length;

  return (
    <section className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="glass card-rise rounded-3xl p-8">
          <h2 className="headline text-3xl font-bold text-emerald-950">Environmental Issue Dashboard</h2>
          <div className="mt-5 flex flex-wrap gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as IssueStatus | "All")}
              className="rounded-2xl border border-white/80 bg-white/75 px-4 py-2 text-sm"
            >
              <option>All</option>
              <option>Pending</option>
              <option>In Progress</option>
              <option>Resolved</option>
            </select>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as IssueType | "All")}
              className="rounded-2xl border border-white/80 bg-white/75 px-4 py-2 text-sm"
            >
              <option>All</option>
              <option value="garbage">Garbage</option>
              <option value="road">Road</option>
              <option value="water">Water</option>
            </select>
          </div>
        </div>

        <aside className="glass card-rise rounded-3xl p-8" style={{ animationDelay: "120ms" }}>
          <h3 className="headline text-xl font-bold text-emerald-950">AI Insight</h3>
          <p className="mt-3 text-sm text-emerald-900/85">
            {garbageCount > 2
              ? "AI detected high garbage density in your area"
              : "AI indicates stable cleanliness with low garbage density"}
          </p>
          <div className="mt-5 space-y-3">
            {[{ label: "Pending", value: pendingCount }, { label: "Resolved", value: resolvedCount }].map((item) => (
              <div key={item.label}>
                <div className="mb-1 flex items-center justify-between text-xs font-semibold text-emerald-900/80">
                  <span>{item.label}</span>
                  <span>{item.value}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-white/70">
                  <div
                    className="h-full rounded-full bg-emerald-700 transition-all duration-700"
                    style={{ width: `${reports.length ? (item.value / reports.length) * 100 : 0}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </aside>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((issue, index) => (
          <article key={issue.id} className="glass card-rise rounded-3xl p-4" style={{ animationDelay: `${80 + index * 35}ms` }}>
            <img
              src={issue.imageUrl}
              alt={`${issue.type} report`}
              className="h-40 w-full rounded-2xl object-cover"
              onError={(e) => {
                e.currentTarget.src =
                  "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=900&q=80";
              }}
            />
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm font-semibold uppercase tracking-[0.1em] text-emerald-900">{issue.type}</p>
              <StatusBadge status={issue.status} />
            </div>
            <p className="mt-2 text-sm text-emerald-900/85">{issue.location}</p>
          </article>
        ))}
        {filtered.length === 0 ? (
          <div className="glass rounded-3xl p-6 text-sm font-semibold text-emerald-900/80">No issues found for selected filters.</div>
        ) : null}
      </div>
    </section>
  );
}
