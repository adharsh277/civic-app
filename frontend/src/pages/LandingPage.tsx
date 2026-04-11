import { Link } from "react-router-dom";

export function LandingPage() {
  return (
    <section className="space-y-8 pb-6 sm:space-y-10 sm:pb-8">
      <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="glass card-rise overflow-hidden rounded-3xl p-8 sm:p-10">
          <p className="mb-3 inline-flex rounded-full bg-emerald-900/10 px-4 py-1 text-sm font-semibold text-emerald-900">
            AI + Civic Intelligence
          </p>
          <h2 className="headline text-4xl font-bold leading-tight text-emerald-950 sm:text-5xl">
            Smart Civic Monitoring System
          </h2>
          <p className="mt-4 max-w-xl text-base text-emerald-900/80 sm:text-lg">
            Report environmental issues and help build a cleaner future through a trusted public platform powered by smart-city analytics.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/report"
              className="rounded-full bg-emerald-800 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-900/25 transition hover:-translate-y-0.5 hover:bg-emerald-700"
            >
              Report Issue
            </Link>
            <Link
              to="/dashboard"
              className="rounded-full bg-white/80 px-6 py-3 text-sm font-bold text-emerald-900 transition hover:bg-white"
            >
              View Dashboard
            </Link>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {[
              { label: "Active Civic Zones", value: "148" },
              { label: "Average Response", value: "3.2 hrs" },
              { label: "Citizens Engaged", value: "12.7k" },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl border border-white/80 bg-white/60 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-emerald-800/80">{item.label}</p>
                <p className="mt-2 text-2xl font-extrabold text-emerald-950">{item.value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="glass card-rise rounded-3xl p-7 sm:p-8" style={{ animationDelay: "120ms" }}>
          <h3 className="headline text-xl font-bold text-emerald-950">Smart City Environment Mesh</h3>
          <p className="mt-2 text-sm text-emerald-900/80">Realtime map clusters surface risk pockets before they become public health emergencies.</p>
          <div className="mt-6 grid grid-cols-7 gap-2">
            {Array.from({ length: 21 }).map((_, idx) => (
              <span
                key={idx}
                className="h-9 rounded-xl"
                style={{
                  background: idx % 3 === 0 ? "rgba(12, 97, 52, 0.38)" : "rgba(255, 255, 255, 0.68)",
                  boxShadow: idx % 2 === 0 ? "inset 0 0 0 1px rgba(255,255,255,0.7)" : "none",
                }}
              />
            ))}
          </div>
          <div className="mt-6 space-y-3">
            <div className="rounded-2xl bg-white/70 p-4">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-800/80">Live Eco Index</p>
              <p className="mt-2 text-3xl font-extrabold text-emerald-950">92.4%</p>
              <p className="mt-1 text-sm text-emerald-900/75">Air quality and waste response are stable this week.</p>
            </div>
            <div className="rounded-2xl bg-emerald-900 px-4 py-3 text-emerald-50">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-200">Forecast</p>
              <p className="mt-1 text-sm">AQI may rise in industrial belts between 6 PM and 9 PM. Preventive crews are advised.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {[
          {
            title: "Signal Ingest",
            text: "Geo-tagged citizen reports, ward sensors, and sanitation logs merge into one verification stream.",
          },
          {
            title: "AI Prioritization",
            text: "Issue severity is scored using congestion, weather, and health-risk context for faster triage.",
          },
          {
            title: "Civic Execution",
            text: "Ward teams receive route-optimized assignments with evidence snapshots and closure tracking.",
          },
        ].map((item, index) => (
          <article key={item.title} className="glass card-rise rounded-3xl p-5" style={{ animationDelay: `${180 + index * 70}ms` }}>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-800/80">{item.title}</p>
            <p className="mt-3 text-sm text-emerald-900/85">{item.text}</p>
          </article>
        ))}
      </div>

      <div className="glass card-rise rounded-3xl p-6 sm:p-8" style={{ animationDelay: "320ms" }}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="headline text-2xl font-bold text-emerald-950">City Pulse Timeline</h3>
          <Link
            to="/dashboard"
            className="rounded-full bg-emerald-800 px-5 py-2 text-xs font-bold uppercase tracking-[0.14em] text-white transition hover:bg-emerald-700"
          >
            Open Live Dashboard
          </Link>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {[
            { zone: "North Industrial", update: "Waste overflow ticket auto-escalated", eta: "Team ETA: 24 min" },
            { zone: "Canal Road", update: "Air quality drift detected and verified", eta: "Alert confidence: 87%" },
            { zone: "Ward 11", update: "Roadside dumping hotspot cooled after cleanup", eta: "Resolved in 2.1 hrs" },
            { zone: "Rail Circle", update: "Citizen reports up 14% this week", eta: "Extra sweep scheduled" },
          ].map((item) => (
            <div key={item.zone} className="rounded-2xl border border-white/80 bg-white/65 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-emerald-800/80">{item.zone}</p>
              <p className="mt-2 text-sm font-semibold text-emerald-950">{item.update}</p>
              <p className="mt-1 text-xs text-emerald-900/75">{item.eta}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
