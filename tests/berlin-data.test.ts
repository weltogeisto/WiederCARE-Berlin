import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync, statSync } from "node:fs";
import { haversine } from "../lib/geo.ts";
import { distanceToRoute, findFirstEncounter, pathLength } from "../lib/walk.ts";
const geometry = JSON.parse(readFileSync(new URL("../research/berlin-route.json", import.meta.url), "utf8"));
const assets = JSON.parse(readFileSync(new URL("../research/berlin-assets.json", import.meta.url), "utf8"));
test("all three real stops lie on the walk and outside initial discovery range", () => {
 assert.deepEqual(geometry.stops.map((s: { id: string }) => s.id), ["apotheke", "spreefront", "bauakademie"]);
 for (const s of geometry.stops) { assert.ok(distanceToRoute(s, geometry.route) < 20); assert.ok(haversine(s, geometry.route[0]) > 35); }
 for (const p of [...geometry.route, ...geometry.stops]) { assert.ok(p.lat >= 52.513 && p.lat <= 52.521); assert.ok(p.lng >= 13.395 && p.lng <= 13.408); }
});
test("full route finds exactly three stops in order even with one huge frame per leg", () => {
 const found = new Set<string>(); const order: string[] = []; let distance = 0; const total = pathLength(geometry.route);
 for (let i = 0; i < 4; i++) { const hit = findFirstEncounter(geometry.route, distance, total, geometry.stops, found); if (!hit) break; found.add(hit.fix.id); order.push(hit.fix.id); distance = hit.distance; }
 assert.deepEqual(order, ["apotheke", "spreefront", "bauakademie"]); assert.ok(total > 1000 && total < 1300);
});
test("all six primary and three reference images are present with complete provenance", () => {
 let count = 0;
 for (const stop of assets.stops) for (const image of [stop.before, stop.after, ...stop.historicalReferences]) {
  assert.ok(image.author && image.date && image.license && image.sourceUrl.startsWith("https://commons.wikimedia.org/wiki/File:"));
  const stat = statSync(new URL(`../${image.localPath}`, import.meta.url)); assert.ok(stat.size > 1000 && stat.size < 500000); count++;
 }
 assert.equal(assets.stops.length, 3); assert.equal(count, 9);
});
