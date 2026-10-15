import assert from "node:assert/strict";
import test from "node:test";
import { bearing, haversine, interpolate, isValidPoint, nearestUndiscovered, withinRadius } from "../lib/geo.ts";
import type { FixLocation, Point } from "../lib/geo.ts";

const berlin: Point = { lat: 52.520008, lng: 13.404954 };

 test("haversine returns zero for equal points and wraps the antimeridian", () => {
  assert.equal(haversine(berlin, berlin), 0);
  const acrossDateLine = haversine({ lat: 0, lng: 179.999 }, { lat: 0, lng: -179.999 });
  assert.ok(acrossDateLine > 200 && acrossDateLine < 225);
});

test("bearing is clockwise from north", () => {
  const origin = { lat: 0, lng: 0 };
  assert.equal(bearing(origin, { lat: 1, lng: 0 }), 0);
  assert.equal(bearing(origin, { lat: 0, lng: 1 }), 90);
  assert.equal(bearing(origin, { lat: -1, lng: 0 }), 180);
});

test("interpolate preserves endpoints, clamps t, and follows the short dateline crossing", () => {
  const a = { lat: 52, lng: 13 };
  const b = { lat: 53, lng: 14 };
  assert.deepEqual(interpolate(a, b, -2), a);
  assert.deepEqual(interpolate(a, b, 2), b);
  assert.deepEqual(interpolate(a, b, 0.5), { lat: 52.5, lng: 13.5 });
  assert.equal(Math.abs(interpolate({ lat: 0, lng: 179 }, { lat: 0, lng: -179 }, 0.5).lng), 180);
});

test("point and radius validation reject malformed values", () => {
  assert.equal(isValidPoint(berlin), true);
  assert.equal(isValidPoint({ lat: 91, lng: 0 }), false);
  assert.throws(() => haversine({ lat: Number.NaN, lng: 0 }, berlin), RangeError);
  assert.throws(() => withinRadius(berlin, berlin, -1), RangeError);
});

test("withinRadius is inclusive and nearestUndiscovered selects the closest un-found fix", () => {
  const east35m: FixLocation = { id: "edge", lat: berlin.lat, lng: berlin.lng + 35 / (111_320 * Math.cos(berlin.lat * Math.PI / 180)) };
  const nearer: FixLocation = { id: "near", lat: berlin.lat, lng: berlin.lng + 0.00005 };
  const farther: FixLocation = { id: "far", lat: berlin.lat, lng: berlin.lng + 0.00015 };
  assert.equal(withinRadius(berlin, east35m, 35), true);
  assert.equal(nearestUndiscovered(berlin, [farther, nearer], new Set()), nearer);
  assert.equal(nearestUndiscovered(berlin, [nearer, farther], new Set(["near"])), farther);
  assert.equal(nearestUndiscovered(berlin, [farther], new Set(), 1), null);
});
