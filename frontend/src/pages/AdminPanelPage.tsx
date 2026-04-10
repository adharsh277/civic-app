import { useEffect, useState } from "react";
import { api } from "../api/client";
import { StatusBadge } from "../components/StatusBadge";
import type { IssueStatus, Report } from "../types/report";

const statuses: IssueStatus[] = ["Pending", "In Progress", "Resolved"];

export function AdminPanelPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [savingId, setSavingId] = useState<number | null>(null);

  const loadReports = () => {
    api
      .get<Report[]>("/reports")
      .then((res) => setReports(res.data))
      .catch(() => setReports([]));
  };

  useEffect(() => {
    loadReports();
  }, []);

  const updateStatus = async (id: number, status: IssueStatus) => {
    setSavingId(id);
    try {
      await api.patch(`/reports/${id}/status`, { status });
      setReports((prev) => prev.map((report) => (report.id === id ? { ...report, status } : report)));
    } finally {
      setSavingId(null);
    }
  };

  return (
    <section className="glass rounded-3xl p-8">
      <div className="mb-6 flex items-center justify-between gap-3">
        <h2 className="headline text-3xl font-bold text-emerald-950">Admin Panel</h2>
        <button
          onClick={loadReports}
          className="rounded-full bg-white/80 px-4 py-2 text-xs font-bold text-emerald-900 transition hover:bg-white"
        >
          Refresh
        </button>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-white/70 bg-white/55">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-emerald-900/8 text-emerald-900">
            <tr>
              <th className="px-4 py-3">Issue</th>
              <th className="px-4 py-3">Location</th>
              <th className="px-4 py-3">Current Status</th>
              <th className="px-4 py-3">Update Status</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((report) => (
              <tr key={report.id} className="border-t border-white/70">
                <td className="px-4 py-3 font-semibold capitalize text-emerald-950">{report.type}</td>
                <td className="px-4 py-3 text-emerald-900/85">{report.location}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={report.status} />
                </td>
                <td className="px-4 py-3">
                  <select
                    value={report.status}
                    disabled={savingId === report.id}
                    onChange={(e) => updateStatus(report.id, e.target.value as IssueStatus)}
                    className="rounded-xl border border-white/80 bg-white/80 px-3 py-2 text-xs font-semibold"
                  >
                    {statuses.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
            {reports.length === 0 ? (
              <tr>
                <td className="px-4 py-4 text-emerald-900/80" colSpan={4}>
                  No issues reported yet.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </section>
  );
}
