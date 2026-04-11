import { useEffect, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { api } from "../api/client";
import { StatusBadge } from "../components/StatusBadge";
import type { IssueType } from "../types/report";
import type { Report } from "../types/report";

const USER_REPORT_IDS_KEY = "civic.userReportIds";

type FormState = {
  type: IssueType;
  location: string;
  phoneNumber: string;
  state: string;
  district: string;
  city: string;
  description: string;
  imageUrl: string;
};

const defaultForm: FormState = {
  type: "garbage",
  location: "",
  phoneNumber: "",
  state: "",
  district: "",
  city: "",
  description: "",
  imageUrl: "",
};

export function ReportIssuePage() {
  const [form, setForm] = useState<FormState>(defaultForm);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [myReports, setMyReports] = useState<Report[]>([]);

  const loadMyReports = async () => {
    let ids: number[] = [];
    try {
      ids = JSON.parse(localStorage.getItem(USER_REPORT_IDS_KEY) || "[]") as number[];
    } catch {
      ids = [];
    }

    if (!ids.length) {
      setMyReports([]);
      return;
    }

    try {
      const res = await api.get<Report[]>("/reports");
      const byId = new Set(ids);
      const mine = res.data.filter((item) => byId.has(item.id));
      setMyReports(mine);
    } catch {
      setMyReports([]);
    }
  };

  useEffect(() => {
    void loadMyReports();

    const timer = window.setInterval(() => {
      void loadMyReports();
    }, 20000);

    return () => {
      window.clearInterval(timer);
    };
  }, []);

  const onFileUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setForm((prev) => ({ ...prev, imageUrl: String(reader.result || "") }));
    };
    reader.readAsDataURL(file);
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setMessage("");

    try {
      const res = await api.post<{ report: Report }>("/report", form);
      const reportId = res.data.report.id;

      let ids: number[] = [];
      try {
        ids = JSON.parse(localStorage.getItem(USER_REPORT_IDS_KEY) || "[]") as number[];
      } catch {
        ids = [];
      }

      const updatedIds = Array.from(new Set([reportId, ...ids])).slice(0, 20);
      localStorage.setItem(USER_REPORT_IDS_KEY, JSON.stringify(updatedIds));

      setMessage("Issue submitted successfully. Thank you for going green.");
      setForm(defaultForm);
      void loadMyReports();
    } catch {
      setMessage("Unable to submit issue. Please check backend service.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
      <form onSubmit={onSubmit} className="glass card-rise rounded-3xl p-8">
        <h2 className="headline text-3xl font-bold text-emerald-950">Report an Environmental Issue</h2>
        <p className="mt-2 text-sm text-emerald-900/80">Upload details so city teams can resolve the issue faster.</p>

        <div className="mt-6 grid gap-4">
          <label className="text-sm font-semibold text-emerald-900">
            Upload Image
            <input
              type="file"
              accept="image/*"
              onChange={onFileUpload}
              className="mt-2 block w-full rounded-2xl border border-white/80 bg-white/70 p-3 text-sm"
            />
          </label>

          <label className="text-sm font-semibold text-emerald-900">
            Select Issue Type
            <select
              value={form.type}
              onChange={(e) => setForm((prev) => ({ ...prev, type: e.target.value as IssueType }))}
              className="mt-2 block w-full rounded-2xl border border-white/80 bg-white/70 p-3 text-sm"
            >
              <option value="garbage">Garbage</option>
              <option value="road">Road</option>
              <option value="water">Water</option>
            </select>
          </label>

          <label className="text-sm font-semibold text-emerald-900">
            Location
            <input
              value={form.location}
              onChange={(e) => setForm((prev) => ({ ...prev, location: e.target.value }))}
              required
              placeholder="Street, ward, landmark"
              className="mt-2 block w-full rounded-2xl border border-white/80 bg-white/70 p-3 text-sm"
            />
          </label>

          <label className="text-sm font-semibold text-emerald-900">
            Contact Phone Number
            <input
              type="tel"
              value={form.phoneNumber}
              onChange={(e) => setForm((prev) => ({ ...prev, phoneNumber: e.target.value }))}
              required
              placeholder="+91 9876543210"
              className="mt-2 block w-full rounded-2xl border border-white/80 bg-white/70 p-3 text-sm"
            />
          </label>

          <div className="grid gap-3 sm:grid-cols-3">
            <label className="text-sm font-semibold text-emerald-900">
              State
              <input
                value={form.state}
                onChange={(e) => setForm((prev) => ({ ...prev, state: e.target.value }))}
                required
                placeholder="Kerala"
                className="mt-2 block w-full rounded-2xl border border-white/80 bg-white/70 p-3 text-sm"
              />
            </label>

            <label className="text-sm font-semibold text-emerald-900">
              District
              <input
                value={form.district}
                onChange={(e) => setForm((prev) => ({ ...prev, district: e.target.value }))}
                placeholder="Ernakulam"
                className="mt-2 block w-full rounded-2xl border border-white/80 bg-white/70 p-3 text-sm"
              />
            </label>

            <label className="text-sm font-semibold text-emerald-900">
              City / Ward
              <input
                value={form.city}
                onChange={(e) => setForm((prev) => ({ ...prev, city: e.target.value }))}
                placeholder="Kochi"
                className="mt-2 block w-full rounded-2xl border border-white/80 bg-white/70 p-3 text-sm"
              />
            </label>
          </div>

          <label className="text-sm font-semibold text-emerald-900">
            Description
            <textarea
              value={form.description}
              onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
              rows={4}
              placeholder="Add issue details"
              className="mt-2 block w-full rounded-2xl border border-white/80 bg-white/70 p-3 text-sm"
            />
          </label>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="mt-6 rounded-full bg-emerald-800 px-6 py-3 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-500"
        >
          {submitting ? "Submitting..." : "Submit Issue"}
        </button>

        {message ? <p className="mt-4 text-sm font-semibold text-emerald-900">{message}</p> : null}
      </form>

      <aside className="glass card-rise rounded-3xl p-8" style={{ animationDelay: "120ms" }}>
        <h3 className="headline text-2xl font-bold text-emerald-950">AI Insight</h3>
        <p className="mt-3 rounded-2xl bg-emerald-900/10 p-4 text-sm text-emerald-900">
          AI detected high garbage density in your area. Priority pickup windows are being recommended to sanitation teams.
        </p>
        <div className="mt-6 rounded-2xl bg-white/70 p-5">
          <p className="text-xs uppercase tracking-[0.22em] text-emerald-800/80">Citizen Mission</p>
          <p className="mt-2 text-lg font-bold text-emerald-950">Be The Reason The Planet Smiles.</p>
          <p className="mt-2 text-sm text-emerald-900/80">Snap it. Report it. Track it. Keep your locality clean.</p>
        </div>

        <div className="mt-6 rounded-2xl border border-white/80 bg-white/70 p-5">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-800/80">My Case Status</p>
            <button
              type="button"
              onClick={() => {
                void loadMyReports();
              }}
              className="rounded-full bg-emerald-900/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.1em] text-emerald-900 transition hover:bg-emerald-900/15"
            >
              Refresh
            </button>
          </div>

          <div className="mt-3 space-y-2">
            {myReports.map((item) => (
              <div key={item.id} className="rounded-xl border border-white/85 bg-white/85 p-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.1em] text-emerald-900">{item.type}</p>
                  <StatusBadge status={item.status} />
                </div>
                <p className="mt-1 text-xs text-emerald-900/80">{item.location}</p>
                <p className="mt-1 text-[11px] text-emerald-900/75">
                  {item.city ? `${item.city}, ` : ""}
                  {item.district ? `${item.district}, ` : ""}
                  {item.state}
                </p>
                <p className="mt-1 text-[11px] text-emerald-900/75">Contact: {item.phoneNumber || "Not provided"}</p>
              </div>
            ))}

            {myReports.length === 0 ? (
              <p className="text-xs text-emerald-900/75">No submitted cases yet. Submit one to track status here.</p>
            ) : null}
          </div>
        </div>
      </aside>
    </section>
  );
}
