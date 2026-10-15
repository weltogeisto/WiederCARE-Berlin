import assert from "node:assert/strict";
import test from "node:test";
import {
  MAX_DRAFT_BLOB_BYTES,
  MAX_DRAFTS,
  draftValidationError,
  isDraft,
  listDrafts,
  saveDraft,
} from "../lib/drafts.ts";
import type { Draft } from "../lib/drafts.ts";

function makeDraft(overrides: Partial<Draft> = {}): Draft {
  return {
    id: "draft-1",
    title: "Bridge",
    instruction: "Restore the facade",
    before: new Blob(["before"]),
    lat: 52.52,
    lng: 13.405,
    createdAt: "2026-10-15T10:00:00.000Z",
    ...overrides,
  };
}

test("draft validation accepts valid and location-free drafts", () => {
  assert.equal(draftValidationError(makeDraft()), null);
  assert.equal(isDraft(makeDraft({ lat: null, lng: null, after: new Blob(["after"]) })), true);
});

test("draft validation rejects malformed fields, coordinates, dates and non-Blob images", () => {
  assert.match(draftValidationError({}) ?? "", /ID/);
  assert.match(draftValidationError(makeDraft({ lat: 91 })) ?? "", /coordinates/);
  assert.match(draftValidationError(makeDraft({ lat: null, lng: 13 })) ?? "", /coordinates/);
  assert.match(draftValidationError(makeDraft({ createdAt: "not a date" })) ?? "", /date/);
  assert.match(draftValidationError(makeDraft({ before: "image" as unknown as Blob })) ?? "", /Blob/);
  assert.equal(isDraft(null), false);
});

test("each before and after image is capped at 3 MiB", () => {
  const oversized = new Blob([new Uint8Array(MAX_DRAFT_BLOB_BYTES + 1)]);
  assert.match(draftValidationError(makeDraft({ before: oversized })) ?? "", /before image exceeds/);
  assert.match(draftValidationError(makeDraft({ after: oversized })) ?? "", /after image exceeds/);
  assert.equal(MAX_DRAFTS, 12);
});

test("draft CRUD calls reject descriptively when IndexedDB is unavailable", async () => {
  await assert.rejects(listDrafts(), /IndexedDB is unavailable/i);
  await assert.rejects(saveDraft(makeDraft()), /IndexedDB is unavailable/i);
});
