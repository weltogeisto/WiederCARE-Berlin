export type Point = { lat: number; lng: number };

export interface FixLocation extends Point {
  id: string;
}

const EARTH_RADIUS_METRES = 6_371_008.8;
const DEGREES_TO_RADIANS = Math.PI / 180;

/** True when a value contains finite latitude/longitude coordinates. */
export function isValidPoint(value: unknown): value is Point {
  if (typeof value !== "object" || value === null) return false;
  const point = value as { lat?: unknown; lng?: unknown };
  return (
    typeof point.lat === "number" &&
    Number.isFinite(point.lat) &&
    point.lat >= -90 &&
    point.lat <= 90 &&
    typeof point.lng === "number" &&
    Number.isFinite(point.lng) &&
    point.lng >= -180 &&
    point.lng <= 180
  );
}

function assertPoint(value: Point): void {
  if (!isValidPoint(value)) {
    throw new RangeError("Expected a valid point with latitude in [-90, 90] and longitude in [-180, 180].");
  }
}

function assertRadius(radius: number): void {
  if (!Number.isFinite(radius) || radius < 0) {
    throw new RangeError("Radius must be a finite, non-negative number of metres.");
  }
}

function wrappedRadians(degrees: number): number {
  const wrappedDegrees = ((degrees + 180) % 360 + 360) % 360 - 180;
  return wrappedDegrees * DEGREES_TO_RADIANS;
}

/** Great-circle distance between two points, in metres. */
export function haversine(a: Point, b: Point): number {
  assertPoint(a);
  assertPoint(b);

  const lat1 = a.lat * DEGREES_TO_RADIANS;
  const lat2 = b.lat * DEGREES_TO_RADIANS;
  const deltaLat = (b.lat - a.lat) * DEGREES_TO_RADIANS;
  const deltaLng = wrappedRadians(b.lng - a.lng);
  const sinLat = Math.sin(deltaLat / 2);
  const sinLng = Math.sin(deltaLng / 2);
  const raw = sinLat * sinLat + Math.cos(lat1) * Math.cos(lat2) * sinLng * sinLng;
  const haversineValue = Math.min(1, Math.max(0, raw));
  return 2 * EARTH_RADIUS_METRES * Math.atan2(Math.sqrt(haversineValue), Math.sqrt(1 - haversineValue));
}

/** Initial bearing from a to b, in degrees clockwise from true north (0–360). */
export function bearing(a: Point, b: Point): number {
  assertPoint(a);
  assertPoint(b);

  const lat1 = a.lat * DEGREES_TO_RADIANS;
  const lat2 = b.lat * DEGREES_TO_RADIANS;
  const deltaLng = wrappedRadians(b.lng - a.lng);
  const y = Math.sin(deltaLng) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(deltaLng);
  return (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
}

/** Linear coordinate interpolation; t is clamped to [0, 1]. */
export function interpolate(a: Point, b: Point, t: number): Point {
  assertPoint(a);
  assertPoint(b);
  if (!Number.isFinite(t)) throw new RangeError("Interpolation factor must be finite.");
  const clamped = Math.min(1, Math.max(0, t));
  if (clamped === 0) return { lat: a.lat, lng: a.lng };
  if (clamped === 1) return { lat: b.lat, lng: b.lng };

  const deltaLng = ((b.lng - a.lng + 540) % 360) - 180;
  const lng = a.lng + deltaLng * clamped;
  return {
    lat: a.lat + (b.lat - a.lat) * clamped,
    lng: ((lng + 180) % 360 + 360) % 360 - 180,
  };
}

/** Whether point is at most radius metres from fix (inclusive). */
export function withinRadius(point: Point, fix: Point, radius = 35): boolean {
  assertRadius(radius);
  return haversine(point, fix) <= radius;
}

/** Nearest not-yet-found fix within radius, or null if none is in range. */
export function nearestUndiscovered(
  point: Point,
  fixes: readonly FixLocation[],
  found: Set<string>,
  radius = 35,
): FixLocation | null {
  assertPoint(point);
  assertRadius(radius);

  let nearest: FixLocation | null = null;
  let nearestDistance = radius;
  for (const fix of fixes) {
    assertPoint(fix);
    if (typeof fix.id !== "string" || fix.id.length === 0 || found.has(fix.id)) continue;
    const distance = haversine(point, fix);
    if (distance <= nearestDistance) {
      if (distance < nearestDistance || nearest === null) {
        nearest = fix;
        nearestDistance = distance;
      }
    }
  }
  return nearest;
}
