import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import test from "node:test";

const manifest = JSON.parse(
  readFileSync(new URL("../research/approved-visions.json", import.meta.url), "utf8"),
);
const expectedStops = ["apotheke", "spreefront", "bauakademie"];

function webpDimensions(data: Buffer): [number, number] {
  assert.equal(data.toString("ascii", 0, 4), "RIFF", "asset has RIFF header");
  assert.equal(data.toString("ascii", 8, 12), "WEBP", "asset is WebP");

  for (let offset = 12; offset + 8 <= data.length;) {
    const chunk = data.toString("ascii", offset, offset + 4);
    const size = data.readUInt32LE(offset + 4);
    const start = offset + 8;
    if (chunk === "VP8X") {
      const width = 1 + data[start + 4] + (data[start + 5] << 8) + (data[start + 6] << 16);
      const height = 1 + data[start + 7] + (data[start + 8] << 8) + (data[start + 9] << 16);
      return [width, height];
    }
    if (chunk === "VP8 ") {
      return [data.readUInt16LE(start + 6) & 0x3fff, data.readUInt16LE(start + 8) & 0x3fff];
    }
    if (chunk === "VP8L") {
      const b1 = data[start + 1];
      const b2 = data[start + 2];
      const b3 = data[start + 3];
      const b4 = data[start + 4];
      const width = 1 + b1 + ((b2 & 0x3f) << 8);
      const height = 1 + ((b2 >> 6) & 0x03) + (b3 << 2) + ((b4 & 0x0f) << 10);
      return [width, height];
    }
    offset = start + size + (size & 1);
  }
  throw new Error("No WebP image chunk found");
}

test("approval limits the public presentation and disclaims geometric registration", () => {
  assert.equal(manifest.approval.status, "approved");
  const scope = manifest.approval.scope;
  assert.match(scope, /öffentliche App-Darstellung/);
  assert.match(scope, /experimenteller Links-rechts-Swipe/);
  assert.match(scope, /kein ausgerichteter Wipe/);
  assert.match(scope, /ausschließlich separat als Referenzen/);
  assert.match(scope, /keine heutigen Aufnahmen/);
  assert.match(scope, /Keine Vision ist eine Vermessung/);
  assert.doesNotMatch(scope, /registrierte (?:Ansicht|Überblendung|Wipe)/i);
});

test("three approved stops contain exactly 3 photos, 3 visions and 4 separate references", () => {
  assert.deepEqual(manifest.stops.map((stop: { id: string }) => stop.id), expectedStops);
  const counts: Record<string, number> = { photo: 0, ai_reconstruction: 0, archive_photo: 0 };
  const referenceCounts = [2, 1, 1];
  let assetCount = 0;

  for (const [index, stop] of manifest.stops.entries()) {
    assert.equal(stop.before.kind, "photo");
    assert.equal(stop.after.kind, "ai_reconstruction");
    assert.equal(stop.references.length, referenceCounts[index]);
    assert.ok(Array.isArray(stop.references));
    for (const reference of stop.references) assert.equal(reference.kind, "archive_photo");
    for (const image of [stop.before, stop.after, ...stop.references]) {
      counts[image.kind] += 1;
      assetCount += 1;
    }
  }

  assert.equal(assetCount, 10);
  assert.deepEqual(counts, { photo: 3, ai_reconstruction: 3, archive_photo: 4 });
});

test("all ten local WebP files match their checksums, dimensions, aspect ratios and attribution", () => {
  let assetCount = 0;
  for (const stop of manifest.stops) {
    for (const image of [stop.before, stop.after, ...stop.references]) {
      assert.ok(image.title.trim());
      assert.ok(image.author.trim());
      assert.ok(image.date.trim());
      assert.ok(image.dateNote.trim());
      assert.ok(image.license.trim());
      assert.ok(image.licenseUrl === null || image.licenseUrl.startsWith("https://"));
      assert.ok(image.sourceUrl.startsWith("https://commons.wikimedia.org/wiki/File:"));
      assert.match(image.sourceSha256, /^[a-f0-9]{64}$/);
      assert.match(image.sha256, /^[a-f0-9]{64}$/);
      assert.match(image.changes, /Converted to WebP/);
      assert.match(image.changes, /complete frame retained, no cropping or repainting/);
      assert.ok(image.originalFile && !image.originalFile.startsWith("/") && !image.originalFile.includes(".."));
      assert.match(image.localPath, /^public\/media\/approved\/[a-z0-9-]+\.webp$/);

      const data = readFileSync(new URL(`../${image.localPath}`, import.meta.url));
      assert.ok(data.length > 0 && data.length < 500_000, `${image.localPath} is under 500 KB`);
      assert.equal(createHash("sha256").update(data).digest("hex"), image.sha256);
      const [actualWidth, actualHeight] = webpDimensions(data);
      assert.deepEqual([actualWidth, actualHeight], [image.width, image.height]);
      assert.ok(image.width > 0 && image.height > 0);
      assert.ok(Math.max(image.width, image.height) <= 1536);
      assert.ok(image.originalWidth > 0 && image.originalHeight > 0);
      const sourceRatio = image.originalWidth / image.originalHeight;
      const derivativeRatio = image.width / image.height;
      assert.ok(Math.abs(sourceRatio - derivativeRatio) < 0.005, `${image.localPath} retains aspect ratio`);
      assetCount += 1;
    }
  }
  assert.equal(assetCount, 10);
});
