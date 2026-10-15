import assert from "node:assert/strict";
import test from "node:test";
import { advanceWalk, distanceToRoute, findFirstEncounter, pathLength, positionAtDistance } from "../lib/walk.ts";
import { haversine } from "../lib/geo.ts";
import type { FixLocation, Point } from "../lib/geo.ts";

const start: Point = { lat: 52.520008, lng: 13.404954 };
const end: Point = { lat: 52.520008, lng: 13.414954 };
const route = [start, end];

 test("path length and positionAtDistance handle empty, single-point, endpoints and interpolation", () => {
  assert.equal(pathLength([]), 0);
  assert.throws(() => positionAtDistance([], 0), /empty route/i);
  assert.deepEqual(positionAtDistance([start], 100), start);
  const total = pathLength(route);
  assert.ok(total > 650 && total < 700);
  assert.deepEqual(positionAtDistance(route, 0), start);
  assert.deepEqual(positionAtDistance(route, total), end);
  assert.deepEqual(positionAtDistance(route, total + 100), end);
  assert.ok(Math.abs(positionAtDistance(route, total / 2).lng - (start.lng + end.lng) / 2) < 1e-9);
});

test("distanceToRoute finds the nearest segment and handles an empty route", () => {
  const onRoute = positionAtDistance(route, pathLength(route) / 2);
  const offsetPoint = { lat: onRoute.lat + 0.0002, lng: onRoute.lng };
  const distance = distanceToRoute(offsetPoint, route);
  assert.ok(distance > 20 && distance < 23);
  assert.ok(Math.abs(distanceToRoute(start, route)) < 0.01);
  assert.equal(distanceToRoute(start, []), Number.POSITIVE_INFINITY);
});

test("advanceWalk uses delta time, defaults to 14 m/s, and never overshoots", () => {
  const total = pathLength(route);
  const step = advanceWalk(route, 0, 2);
  assert.equal(step.distance, 28);
  assert.ok(Math.abs(haversine(start, step.position) - 28) < 0.02);
  assert.deepEqual(advanceWalk(route, total - 2, 1), { distance: total, position: end, done: true });
  assert.deepEqual(advanceWalk([start], 0, 1), { distance: 0, position: start, done: true });
  assert.throws(() => advanceWalk([], 0, 1), /empty route/i);
});

test("findFirstEncounter detects a 35m trigger crossed during a long frame", () => {
  const fix: FixLocation = { id: "fix-crossed", lat: start.lat, lng: start.lng + 0.005 };
  const total = pathLength(route);
  const encounter = findFirstEncounter(route, 0, total, [fix], new Set());
  if (encounter === null) throw new Error("Expected the crossed fix to be detected.");
  assert.equal(encounter.fix, fix);
  assert.ok(encounter.distance > total * 0.43 && encounter.distance < total * 0.5);
  assert.ok(haversine(encounter.position, fix) <= 35.001);
  assert.equal(findFirstEncounter(route, encounter.distance, total, [fix], new Set([fix.id])), null);
});

test("findFirstEncounter returns the earliest unrevealed fix and handles a stationary dot", () => {
  const earlier: FixLocation = { id: "early", lat: start.lat, lng: start.lng + 0.002 };
  const later: FixLocation = { id: "late", lat: start.lat, lng: start.lng + 0.007 };
  const encounter = findFirstEncounter(route, 0, pathLength(route), [later, earlier], new Set());
  assert.equal(encounter?.fix, earlier);
  const stationary = findFirstEncounter([start], 0, 0, [later, { ...earlier, id: "at-start", lat: start.lat, lng: start.lng }], new Set());
  assert.equal(stationary?.fix.id, "at-start");
  assert.deepEqual(stationary?.position, start);
  assert.throws(() => findFirstEncounter(route, 50, 49, [], new Set()), /less than current/i);
});
