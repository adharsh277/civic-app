import type { ReactNode } from "react";
import { NavLink } from "react-router-dom";
import { EnvironmentBanner } from "./EnvironmentBanner";
import { LeafBackground } from "./LeafBackground";
import { LocationAqiPanel } from "./LocationAqiPanel";

type Props = {
  children: ReactNode;
};

const navItems = [
  { label: "Home", to: "/" },
  { label: "Report", to: "/report" },
  { label: "Dashboard", to: "/dashboard" },
  { label: "Admin", to: "/admin" },
];

export function AppLayout({ children }: Props) {
  return (
    <div className="app-shell">
      <LeafBackground />
      <EnvironmentBanner />
      <header className="relative z-10 px-4 py-4 sm:px-8 sm:py-6">
        <div className="glass flex flex-col gap-4 rounded-3xl px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[11px] font-semibold tracking-[0.3em] text-emerald-900/75">GO GREEN, WHERE IS GREEN</p>
            <h1 className="headline text-2xl font-bold text-emerald-950">Civic Issue Reporter</h1>
          </div>
          <div className="flex flex-col items-start gap-3 sm:items-end">
            <nav className="flex flex-wrap items-center gap-2 sm:justify-end">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `rounded-full px-4 py-2 text-sm font-semibold transition ${
                      isActive
                        ? "bg-emerald-800 text-white shadow-lg"
                        : "bg-white/70 text-emerald-900 hover:bg-white"
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
            <LocationAqiPanel />
          </div>
        </div>
      </header>
      <main className="relative z-10 mx-auto w-full max-w-7xl px-4 pb-12 sm:px-8">{children}</main>
    </div>
  );
}
