import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";

const STORAGE_KEY = "civic.location";

type Coordinates = {
  latitude: number;
  longitude: number;
};

type GeoResponse = {
  results?: Array<Coordinates>;
};

type AirQualityResponse = {
  hourly?: {
    us_aqi?: Array<number | null>;
  };
};

function fallbackAqi(location: string) {
  const seed = location
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return 45 + (seed % 90);
}

async function geocodeLocation(query: string): Promise<Coordinates | null> {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=1&language=en&format=json`;
  const response = await fetch(url);
  if (!response.ok) return null;
  const data = (await response.json()) as GeoResponse;
  return data.results?.[0] ?? null;
}

async function fetchLiveAqi(coords: Coordinates): Promise<number | null> {
  const url = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${coords.latitude}&longitude=${coords.longitude}&hourly=us_aqi&forecast_days=1`;
  const response = await fetch(url);
  if (!response.ok) return null;
  const data = (await response.json()) as AirQualityResponse;
  const values = data.hourly?.us_aqi ?? [];
  const current = values.find((value) => value !== null);
  return typeof current === "number" ? Math.round(current) : null;
}

async function hydrateFromCoords(coords: Coordinates): Promise<number | null> {
  const liveValue = await fetchLiveAqi(coords);
  return typeof liveValue === "number" ? liveValue : null;
}

function getAqiLabel(aqi: number) {
  if (aqi <= 50) return "Good";
  if (aqi <= 100) return "Moderate";
  if (aqi <= 150) return "Unhealthy for Sensitive";
  if (aqi <= 200) return "Unhealthy";
  return "Very Unhealthy";
}

export function LocationAqiPanel() {
  const [location, setLocation] = useState("Downtown Civic Ward");
  const [draftLocation, setDraftLocation] = useState(location);
  const [aqi, setAqi] = useState(68);
  const [isLive, setIsLive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [error, setError] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setLocation(saved);
      setDraftLocation(saved);
    }
  }, []);

  useEffect(() => {
    let isCancelled = false;

    const hydrateAqi = async () => {
      setIsLoading(true);
      setError("");

      try {
        const coords = await geocodeLocation(location);
        if (!coords) {
          throw new Error("Location not found");
        }
        const liveValue = await hydrateFromCoords(coords);
        if (typeof liveValue !== "number") {
          throw new Error("AQI unavailable");
        }

        if (!isCancelled) {
          setAqi(liveValue);
          setIsLive(true);
        }
      } catch {
        if (!isCancelled) {
          setAqi(fallbackAqi(location));
          setIsLive(false);
          setError("Live AQI unavailable, showing estimated value");
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    void hydrateAqi();

    const timer = window.setInterval(() => {
      void hydrateAqi();
    }, 300000);

    return () => {
      isCancelled = true;
      window.clearInterval(timer);
    };
  }, [location]);

  const label = useMemo(() => getAqiLabel(aqi), [aqi]);

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    const next = draftLocation.trim();
    if (!next) return;
    setLocation(next);
    localStorage.setItem(STORAGE_KEY, next);
    setIsOpen(false);
  };

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported in this browser");
      return;
    }

    setIsLocating(true);
    setError("");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const coords = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          const liveValue = await hydrateFromCoords(coords);

          if (typeof liveValue === "number") {
            setAqi(liveValue);
            setIsLive(true);
            const gpsName = `GPS (${coords.latitude.toFixed(3)}, ${coords.longitude.toFixed(3)})`;
            setLocation(gpsName);
            setDraftLocation(gpsName);
            localStorage.setItem(STORAGE_KEY, gpsName);
            setIsOpen(false);
          } else {
            setIsLive(false);
            setError("Live AQI unavailable for current coordinates");
          }
        } catch {
          setError("Could not fetch live AQI for current location");
        } finally {
          setIsLocating(false);
        }
      },
      () => {
        setError("Location permission denied or unavailable");
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="rounded-full bg-white/80 px-4 py-2 text-xs font-bold uppercase tracking-[0.15em] text-emerald-900 transition hover:bg-white"
      >
        Set Location
      </button>

      <div className="rounded-2xl border border-white/80 bg-emerald-900/85 px-3 py-2 text-white shadow-lg shadow-emerald-900/30">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-100/80">Live AQI</p>
        <div className="flex items-center gap-2">
          <span className="text-lg font-extrabold">{isLoading ? "..." : aqi}</span>
          <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-semibold">{label}</span>
        </div>
        <p className="mt-1 text-[10px] text-emerald-100/80">{isLive ? "Source: Live" : "Source: Estimated"}</p>
      </div>

      {isOpen ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-emerald-950/35 p-4">
          <div className="glass w-full max-w-md rounded-3xl p-5 sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-900/75">Location Settings</p>
                <p className="mt-2 text-xs text-emerald-900/80">Current: {location}</p>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-full bg-white/80 px-3 py-1 text-xs font-bold text-emerald-900 hover:bg-white"
              >
                Close
              </button>
            </div>

            {error ? <p className="mt-3 text-xs font-semibold text-amber-700">{error}</p> : null}

            <form onSubmit={onSubmit} className="mt-4 space-y-3">
              <input
                value={draftLocation}
                onChange={(event) => setDraftLocation(event.target.value)}
                placeholder="Enter city / area (example: Bengaluru)"
                className="block w-full rounded-xl border border-white/80 bg-white/70 px-3 py-2 text-sm"
              />
              <div className="flex flex-wrap gap-2">
                <button
                  type="submit"
                  className="rounded-full bg-emerald-800 px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] text-white transition hover:bg-emerald-700"
                >
                  Update Location
                </button>
                <button
                  type="button"
                  onClick={useCurrentLocation}
                  disabled={isLocating}
                  className="rounded-full bg-white/80 px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] text-emerald-900 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isLocating ? "Locating..." : "Use Current Location"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
