import assert from "node:assert/strict";
import test from "node:test";
import {
  FOUND_IDS_KEY,
  SOUND_ENABLED_KEY,
  STORAGE_NAMESPACE,
  addFoundId,
  parseFoundIds,
  readFoundIds,
  readSoundEnabled,
  writeFoundIds,
  writeSoundEnabled,
} from "../lib/storage.ts";
import type { StorageLike } from "../lib/storage.ts";

class MemoryStorage implements StorageLike {
  values = new Map<string, string>();
  getItem(key: string): string | null { return this.values.get(key) ?? null; }
  setItem(key: string, value: string): void { this.values.set(key, value); }
}

test("storage keys use the versioned Berlin namespace", () => {
  assert.equal(STORAGE_NAMESPACE, "wiedercare:v1");
  assert.equal(FOUND_IDS_KEY, "wiedercare:v1:found");
  assert.equal(SOUND_ENABLED_KEY, "wiedercare:v1:sound");
});

test("found ID parsing validates JSON and filters invalid entries without throwing", () => {
  assert.deepEqual([...parseFoundIds('["one", "one", "", 3, null, "two"]')], ["one", "two"]);
  assert.deepEqual([...parseFoundIds("not json")], []);
  assert.deepEqual([...parseFoundIds("{}")], []);
  assert.deepEqual([...parseFoundIds(null)], []);
});

test("found IDs read/write/add round-trip and deduplicate", () => {
  const storage = new MemoryStorage();
  assert.equal(writeFoundIds(["a", "a", "", "b"], storage), true);
  assert.deepEqual([...readFoundIds(storage)], ["a", "b"]);
  assert.equal(addFoundId("c", storage), true);
  assert.deepEqual([...readFoundIds(storage)], ["a", "b", "c"]);
});

test("storage failures degrade safely", () => {
  const unavailable: StorageLike = {
    getItem() { throw new Error("blocked"); },
    setItem() { throw new Error("blocked"); },
  };
  assert.deepEqual([...readFoundIds(unavailable)], []);
  assert.equal(writeFoundIds(["a"], unavailable), false);
  assert.equal(addFoundId("b", unavailable), false);
  assert.equal(readSoundEnabled(unavailable, false), false);
  assert.equal(writeSoundEnabled(true, unavailable), false);
  assert.deepEqual([...readFoundIds()], []);
});

test("sound preference round-trips and invalid values use the default", () => {
  const storage = new MemoryStorage();
  assert.equal(readSoundEnabled(storage), true);
  assert.equal(writeSoundEnabled(false, storage), true);
  assert.equal(readSoundEnabled(storage), false);
  storage.setItem(SOUND_ENABLED_KEY, "broken");
  assert.equal(readSoundEnabled(storage, false), false);
});
