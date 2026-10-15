import { FIXES } from "@/data/fixes";
import { makePath, type LngLat, type Path } from "./geo";

export const DISCOVER_RADIUS_M = 35;
export const DEMO_SPEED = 14; // m/s, ten times a walking pace
export const TAP_SPEED = 9; // m/s

// Approximate start about 65 m west of the Liebknechtbrücke pin, on the Lustgarten side.
// Foot routing snaps it to the nearest footpath.
export const DEMO_START: LngLat = [13.40131, 52.51876];

// Start, then the pins in lap order.
export const DEMO_WAYPOINTS: LngLat[] = [DEMO_START, ...FIXES.map((f): LngLat => [f.lng, f.lat])];

// The OSM-DE foot server ignores the profile word in the path; "driving" is its documented form.
const FOOT = "https://routing.openstreetmap.de/routed-foot/route/v1/driving/";

export async function routeVia(points: LngLat[]): Promise<Path> {
  const key = "wiedercare:route:" + points.map((p) => p.join(",")).join(";");
  try {
    const cached = sessionStorage.getItem(key);
    if (cached) return makePath(JSON.parse(cached) as LngLat[]);
  } catch {}
  try {
    const ctl = new AbortController();
    const timer = setTimeout(() => ctl.abort(), 4000);
    const url = FOOT + points.map((p) => p.join(",")).join(";") + "?overview=full&geometries=geojson";
    const res = await fetch(url, { signal: ctl.signal });
    clearTimeout(timer);
    if (!res.ok) throw new Error(String(res.status));
    const json = await res.json();
    const coords = json?.routes?.[0]?.geometry?.coordinates as LngLat[] | undefined;
    if (!coords || coords.length < 2) throw new Error("empty route");
    try {
      sessionStorage.setItem(key, JSON.stringify(coords));
    } catch {}
    return makePath(coords);
  } catch {
    // Offline or blocked: walk straight between the points.
    return makePath(points);
  }
}
