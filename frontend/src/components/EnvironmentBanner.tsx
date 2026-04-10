const badgeMap: Record<string, string> = {
  DEV: "bg-emerald-200/80 text-emerald-900 border-emerald-300",
  STAGING: "bg-amber-200/85 text-amber-900 border-amber-300",
  PROD: "bg-cyan-200/80 text-cyan-900 border-cyan-300",
};

export function EnvironmentBanner() {
  const env = (import.meta.env.VITE_ENV_LABEL || "DEV").toUpperCase();
  const badgeClass = badgeMap[env] || badgeMap.DEV;

  return (
    <div className="relative z-10 px-4 pt-4 sm:px-8">
      <div className="glass flex items-center justify-between rounded-2xl border px-4 py-2 sm:px-5">
        <p className="text-xs font-semibold tracking-[0.24em] text-emerald-900/80">SMART CITY OPS STREAM</p>
        <span className={`rounded-full border px-3 py-1 text-xs font-bold ${badgeClass}`}>{env}</span>
      </div>
    </div>
  );
}
