import { useEffect, useState } from "react";
import type { AxiosError } from "axios";
import { api } from "../api/client";
import { StatusBadge } from "../components/StatusBadge";
import type { IssueStatus, Report } from "../types/report";

const statuses: IssueStatus[] = ["Pending", "In Progress", "Resolved"];
const ADMIN_AUTH_KEY = "civic.admin.auth";

type AdminAuth = {
  token: string;
  username: string;
  state: string;
  name: string;
};

export function AdminPanelPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [auth, setAuth] = useState<AdminAuth | null>(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loadingReports, setLoadingReports] = useState(false);
  const [loggingIn, setLoggingIn] = useState(false);
  const [error, setError] = useState("");

  const loadReports = async (session: AdminAuth) => {
    setLoadingReports(true);
    setError("");

    try {
      const res = await api.get<{ reports: Report[] }>("/admin/reports", {
        headers: {
          Authorization: `Bearer ${session.token}`,
        },
      });
      setReports(res.data.reports);
    } catch {
      setReports([]);
      setError("Session expired or unauthorized. Please login again.");
      localStorage.removeItem(ADMIN_AUTH_KEY);
      setAuth(null);
    } finally {
      setLoadingReports(false);
    }
  };

  useEffect(() => {
    const saved = localStorage.getItem(ADMIN_AUTH_KEY);
    if (!saved) return;

    try {
      const parsed = JSON.parse(saved) as AdminAuth;
      if (!parsed.token || !parsed.state || !parsed.username) return;
      setAuth(parsed);
      void loadReports(parsed);
    } catch {
      localStorage.removeItem(ADMIN_AUTH_KEY);
    }
  }, []);

  const onLogin = async () => {
    if (!username.trim() || !password.trim()) {
      setError("Enter admin username and password");
      return;
    }

    setLoggingIn(true);
    setError("");
    api
      .post<{ token: string; admin: { username: string; state: string; name: string } }>("/admin/login", {
        username,
        password,
      })
      .then((res) => {
        const session: AdminAuth = {
          token: res.data.token,
          username: res.data.admin.username,
          state: res.data.admin.state,
          name: res.data.admin.name,
        };
        setAuth(session);
        localStorage.setItem(ADMIN_AUTH_KEY, JSON.stringify(session));
        setPassword("");
        void loadReports(session);
      })
      .catch((error: unknown) => {
        const axiosError = error as AxiosError<{ message?: string }>;
        const status = axiosError.response?.status;

        if (!status) {
          setError("Backend server is not reachable. Start backend on http://backend:5000 (or set VITE_API_BASE_URL) and try again.");
          return;
        }

        if (status === 404) {
          setError("Admin login route not found. Restart backend with latest code and try again.");
          return;
        }

        if (status === 401) {
          setError("Invalid credentials. Try a valid admin account.");
          return;
        }

        setError(axiosError.response?.data?.message || "Unable to login right now. Please try again.");
      })
      .finally(() => {
        setLoggingIn(false);
      });
  };

  const onLogout = () => {
    localStorage.removeItem(ADMIN_AUTH_KEY);
    setAuth(null);
    setReports([]);
    setError("");
  };

  const updateStatus = async (id: number, status: IssueStatus) => {
    if (!auth) return;

    setSavingId(id);
    try {
      await api.patch(
        `/admin/reports/${id}/status`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${auth.token}`,
          },
        }
      );
      setReports((prev) => prev.map((report) => (report.id === id ? { ...report, status } : report)));
    } catch {
      setError("Unable to update this report. Ensure it belongs to your state jurisdiction.");
    } finally {
      setSavingId(null);
    }
  };

  if (!auth) {
    return (
      <section className="glass mx-auto max-w-lg rounded-3xl p-8">
        <h2 className="headline text-3xl font-bold text-emerald-950">Admin Access</h2>
        <p className="mt-2 text-sm text-emerald-900/80">Login to manage reports only for your assigned state.</p>

        <div className="mt-6 grid gap-4">
          <label className="text-sm font-semibold text-emerald-900">
            Username
            <input
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              className="mt-2 block w-full rounded-2xl border border-white/80 bg-white/75 p-3 text-sm"
              placeholder="kerala_admin"
            />
          </label>

          <label className="text-sm font-semibold text-emerald-900">
            Password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-2 block w-full rounded-2xl border border-white/80 bg-white/75 p-3 text-sm"
              placeholder="admin123"
            />
          </label>
        </div>

        <button
          type="button"
          onClick={onLogin}
          disabled={loggingIn}
          className="mt-6 rounded-full bg-emerald-800 px-6 py-3 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loggingIn ? "Signing in..." : "Login to Admin"}
        </button>

        {error ? <p className="mt-4 text-sm font-semibold text-rose-700">{error}</p> : null}

        <div className="mt-6 rounded-2xl bg-white/70 p-4 text-xs text-emerald-900/85">
          <p className="font-bold uppercase tracking-[0.14em] text-emerald-800/85">Demo Admin Accounts</p>
          <p className="mt-2">delhi_admin / admin123</p>
          <p>kerala_admin / admin123</p>
          <p>punjab_admin / admin123</p>
        </div>
      </section>
    );
  }

  return (
    <section className="glass rounded-3xl p-8">
      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          <h2 className="headline text-3xl font-bold text-emerald-950">Admin Panel</h2>
          <p className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-emerald-800/80">
            {auth.name} | State Scope: {auth.state}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              void loadReports(auth);
            }}
            className="rounded-full bg-white/80 px-4 py-2 text-xs font-bold text-emerald-900 transition hover:bg-white"
          >
            {loadingReports ? "Refreshing..." : "Refresh"}
          </button>
          <button
            onClick={onLogout}
            className="rounded-full bg-emerald-900 px-4 py-2 text-xs font-bold text-white transition hover:bg-emerald-800"
          >
            Logout
          </button>
        </div>
      </div>

      {error ? <p className="mb-4 text-sm font-semibold text-rose-700">{error}</p> : null}

      <div className="overflow-x-auto rounded-2xl border border-white/70 bg-white/55">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-emerald-900/8 text-emerald-900">
            <tr>
              <th className="px-4 py-3">Issue</th>
              <th className="px-4 py-3">Location</th>
              <th className="px-4 py-3">State</th>
              <th className="px-4 py-3">Current Status</th>
              <th className="px-4 py-3">Update Status</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((report) => (
              <tr key={report.id} className="border-t border-white/70">
                <td className="px-4 py-3 font-semibold capitalize text-emerald-950">{report.type}</td>
                <td className="px-4 py-3 text-emerald-900/85">
                  <button
                    type="button"
                    onClick={() => setSelectedReport(report)}
                    className="rounded-lg bg-emerald-900/10 px-2 py-1 text-left text-xs font-semibold text-emerald-900 transition hover:bg-emerald-900/20"
                  >
                    {report.location}
                  </button>
                </td>
                <td className="px-4 py-3 text-emerald-900/85">{report.state}</td>
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
                <td className="px-4 py-4 text-emerald-900/80" colSpan={5}>
                  No issues found for your state scope.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      {selectedReport ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-emerald-950/35 p-4">
          <div className="glass w-full max-w-lg rounded-3xl p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-800/85">Complaint Details</p>
                <h3 className="mt-2 text-lg font-bold capitalize text-emerald-950">{selectedReport.type} issue</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedReport(null)}
                className="rounded-full bg-white/80 px-3 py-1 text-xs font-bold text-emerald-900 hover:bg-white"
              >
                Close
              </button>
            </div>

            <div className="mt-4 space-y-3 text-sm text-emerald-900/90">
              <p>
                <span className="font-semibold">Location:</span> {selectedReport.location}
              </p>
              <p>
                <span className="font-semibold">Region:</span> {selectedReport.city ? `${selectedReport.city}, ` : ""}
                {selectedReport.district ? `${selectedReport.district}, ` : ""}
                {selectedReport.state}
              </p>
              <p>
                <span className="font-semibold">Contact:</span> {selectedReport.phoneNumber || "Not provided"}
              </p>
              <p>
                <span className="font-semibold">Description:</span> {selectedReport.description || "No description provided"}
              </p>
              <p>
                <span className="font-semibold">Reported At:</span> {new Date(selectedReport.createdAt).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
