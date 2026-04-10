import { Link } from "react-router-dom";

export function LandingPage() {
  return (
    <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="glass card-rise rounded-3xl p-8 sm:p-10">
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
      </div>

      <div className="glass card-rise rounded-3xl p-8" style={{ animationDelay: "120ms" }}>
        <h3 className="headline text-xl font-bold text-emerald-950">Smart City Environment Mesh</h3>
        <div className="mt-7 grid grid-cols-7 gap-2">
          {Array.from({ length: 21 }).map((_, idx) => (
            <span
              key={idx}
              className="h-9 rounded-xl"
              style={{
                background: idx % 3 === 0 ? "rgba(12, 97, 52, 0.35)" : "rgba(255, 255, 255, 0.65)",
                boxShadow: idx % 2 === 0 ? "inset 0 0 0 1px rgba(255,255,255,0.6)" : "none",
              }}
            />
          ))}
        </div>
        <div className="mt-6 rounded-2xl bg-white/65 p-4">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-800/80">Live Eco Index</p>
          <p className="mt-2 text-3xl font-extrabold text-emerald-950">92.4%</p>
          <p className="mt-1 text-sm text-emerald-900/75">Air quality and waste response are stable this week.</p>
        </div>
      </div>
    </section>
  );
}
