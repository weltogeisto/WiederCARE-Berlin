import { haversine, interpolate, isValidPoint } from "./geo.ts";
import type { FixLocation, Point } from "./geo.ts";

const EARTH_RADIUS_METRES = 6_371_008.8;
const DEGREES_TO_RADIANS = Math.PI / 180;

export interface WalkAdvance {
  distance: number;
  position: Point;
  done: boolean;
}

export interface WalkEncounter {
  fix: FixLocation;
  distance: number;
  position: Point;
}

function assertRoute(route: readonly Point[]): void {
  for (const point of route) {
    if (!isValidPoint(point)) {
      throw new RangeError("Route contains an invalid geographic point.");
    }
  }
}

function assertFiniteNonNegative(value: number, label: string): void {
  if (!Number.isFinite(value) || value < 0) {
    throw new RangeError(`${label} must be a finite, non-negative number.`);
  }
}

/** Total great-circle length of a polyline, in metres. */
export function pathLength(points: readonly Point[]): number {
  assertRoute(points);
  let total = 0;
  for (let index = 1; index < points.length; index += 1) {
    total += haversine(points[index - 1]!, points[index]!);
  }
  return total;
}

/** Position at a distance along a route, clamped to its endpoints. */
export function positionAtDistance(points: readonly Point[], metres: number): Point {
  if (points.length === 0) throw new RangeError("Cannot get a position on an empty route.");
  assertRoute(points);
  assertFiniteNonNegative(metres, "Distance");
  if (points.length === 1) return { ...points[0]! };

  const total = pathLength(points);
  if (total === 0 || metres <= 0) return { ...points[0]! };
  if (metres >= total) return { ...points[points.length - 1]! };

  let traversed = 0;
  for (let index = 1; index < points.length; index += 1) {
    const start = points[index - 1]!;
    const end = points[index]!;
    const segmentLength = haversine(start, end);
    if (segmentLength === 0) continue;
    if (metres <= traversed + segmentLength) {
      return interpolate(start, end, (metres - traversed) / segmentLength);
    }
    traversed += segmentLength;
  }
  return { ...points[points.length - 1]! };
}

function localCoordinates(origin: Point, point: Point): { x: number; y: number } {
  const deltaLng = ((point.lng - origin.lng + 540) % 360) - 180;
  return {
    x: EARTH_RADIUS_METRES * Math.cos(origin.lat * DEGREES_TO_RADIANS) * deltaLng * DEGREES_TO_RADIANS,
    y: EARTH_RADIUS_METRES * (point.lat - origin.lat) * DEGREES_TO_RADIANS,
  };
}

function nearestSegmentFraction(origin: Point, start: Point, end: Point): number {
  const a = localCoordinates(origin, start);
  const b = localCoordinates(origin, end);
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const lengthSquared = dx * dx + dy * dy;
  if (lengthSquared === 0) return 0;
  return Math.min(1, Math.max(0, -(a.x * dx + a.y * dy) / lengthSquared));
}

/** Nearest distance from a point to any route segment, in metres. Empty route returns Infinity. */
export function distanceToRoute(point: Point, route: readonly Point[]): number {
  if (!isValidPoint(point)) throw new RangeError("Expected a valid geographic point.");
  assertRoute(route);
  if (route.length === 0) return Number.POSITIVE_INFINITY;
  if (route.length === 1) return haversine(point, route[0]!);

  let minimum = Number.POSITIVE_INFINITY;
  for (let index = 1; index < route.length; index += 1) {
    const start = route[index - 1]!;
    const end = route[index]!;
    const fraction = nearestSegmentFraction(point, start, end);
    minimum = Math.min(minimum, haversine(point, interpolate(start, end, fraction)));
  }
  return minimum;
}

/** Deterministically advance along a route; a large delta clamps at the endpoint. */
export function advanceWalk(
  route: readonly Point[],
  currentDistance: number,
  deltaSeconds: number,
  speed = 14,
): WalkAdvance {
  if (route.length === 0) throw new RangeError("Cannot advance along an empty route.");
  assertRoute(route);
  assertFiniteNonNegative(currentDistance, "Current distance");
  assertFiniteNonNegative(deltaSeconds, "Delta seconds");
  assertFiniteNonNegative(speed, "Speed");

  const total = pathLength(route);
  const distance = Math.min(total, currentDistance + deltaSeconds * speed);
  return {
    distance,
    position: positionAtDistance(route, distance),
    done: distance >= total,
  };
}

function firstEntryFraction(
  fix: Point,
  start: Point,
  end: Point,
  low: number,
  high: number,
  radius: number,
): number | null {
  const startPosition = interpolate(start, end, low);
  if (haversine(startPosition, fix) <= radius) return low;

  const projectedClosest = nearestSegmentFraction(fix, start, end);
  const closest = Math.min(high, Math.max(low, projectedClosest));
  if (haversine(interpolate(start, end, closest), fix) > radius) return null;

  let outside = low;
  let inside = closest;
  for (let iteration = 0; iteration < 48; iteration += 1) {
    const middle = (outside + inside) / 2;
    if (haversine(interpolate(start, end, middle), fix) <= radius) inside = middle;
    else outside = middle;
  }
  return inside;
}

/**
 * Finds the earliest undiscovered fix entered while moving forward between two route distances.
 * Analytic segment projection plus a short boundary search prevents long frames skipping a radius.
 */
export function findFirstEncounter(
  route: readonly Point[],
  currentDistance: number,
  nextDistance: number,
  fixes: readonly FixLocation[],
  found: Set<string>,
  radius = 35,
): WalkEncounter | null {
  if (route.length === 0) throw new RangeError("Cannot search an empty route.");
  assertRoute(route);
  assertFiniteNonNegative(currentDistance, "Current distance");
  assertFiniteNonNegative(nextDistance, "Next distance");
  assertFiniteNonNegative(radius, "Radius");
  if (nextDistance < currentDistance) {
    throw new RangeError("Next distance must not be less than current distance.");
  }
  for (const fix of fixes) {
    if (!isValidPoint(fix) || typeof fix.id !== "string" || fix.id.length === 0) {
      throw new RangeError("Encounter search received an invalid fix.");
    }
  }

  const total = pathLength(route);
  const from = Math.min(currentDistance, total);
  const to = Math.min(nextDistance, total);
  const startPosition = positionAtDistance(route, from);
  if (to === from) {
    const nearest = fixes
      .filter((fix) => !found.has(fix.id))
      .map((fix) => ({ fix, distance: haversine(startPosition, fix) }))
      .filter((item) => item.distance <= radius)
      .sort((a, b) => a.distance - b.distance)[0];
    return nearest ? { fix: nearest.fix, distance: from, position: startPosition } : null;
  }

  let traversed = 0;
  let earliest: WalkEncounter | null = null;
  for (let index = 1; index < route.length; index += 1) {
    const start = route[index - 1]!;
    const end = route[index]!;
    const segmentLength = haversine(start, end);
    const segmentStart = traversed;
    const segmentEnd = traversed + segmentLength;
    traversed = segmentEnd;
    if (segmentLength === 0 || segmentEnd < from || segmentStart > to) continue;

    const overlapStart = Math.max(from, segmentStart);
    const overlapEnd = Math.min(to, segmentEnd);
    if (overlapEnd < overlapStart) continue;
    const low = (overlapStart - segmentStart) / segmentLength;
    const high = (overlapEnd - segmentStart) / segmentLength;

    for (const fix of fixes) {
      if (found.has(fix.id)) continue;
      const fraction = firstEntryFraction(fix, start, end, low, high, radius);
      if (fraction === null) continue;
      const distance = segmentStart + fraction * segmentLength;
      if (earliest === null || distance < earliest.distance) {
        earliest = {
          fix,
          distance,
          position: positionAtDistance(route, distance),
        };
      }
    }
  }
  return earliest;
}
