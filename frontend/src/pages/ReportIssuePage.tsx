import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { api } from "../api/client";
import type { IssueType } from "../types/report";

type FormState = {
  type: IssueType;
  location: string;
  description: string;
  imageUrl: string;
};

const defaultForm: FormState = {
  type: "garbage",
  location: "",
  description: "",
  imageUrl: "",
};

export function ReportIssuePage() {
  const [form, setForm] = useState<FormState>(defaultForm);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

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
      await api.post("/report", form);
      setMessage("Issue submitted successfully. Thank you for going green.");
      setForm(defaultForm);
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
          <p className="mt-2 text-lg font-bold text-emerald-950">Go Green, Where Is Green.</p>
          <p className="mt-2 text-sm text-emerald-900/80">Snap it. Report it. Track it. Keep your locality clean.</p>
        </div>
      </aside>
    </section>
  );
}
