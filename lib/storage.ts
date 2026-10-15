export const STORAGE_NAMESPACE = "wiedercare:v1";
export const FOUND_IDS_KEY = `${STORAGE_NAMESPACE}:found`;
export const SOUND_ENABLED_KEY = `${STORAGE_NAMESPACE}:sound`;

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

function getStorage(storage?: StorageLike): StorageLike | null {
  if (storage) return storage;
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null;
  }
}

/** Parse and validate the persisted found-ID array without throwing on malformed data. */
export function parseFoundIds(value: string | null): Set<string> {
  if (value === null) return new Set();
  try {
    const parsed: unknown = JSON.parse(value);
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.filter((id): id is string => typeof id === "string" && id.trim().length > 0));
  } catch {
    return new Set();
  }
}

/** Reads found IDs; unavailable or blocked storage behaves like an empty set. */
export function readFoundIds(storage?: StorageLike): Set<string> {
  try {
    return parseFoundIds(getStorage(storage)?.getItem(FOUND_IDS_KEY) ?? null);
  } catch {
    return new Set();
  }
}

/** Persists found IDs, returning false when storage is unavailable or rejects the write. */
export function writeFoundIds(ids: Iterable<string>, storage?: StorageLike): boolean {
  try {
    const validIds = Array.from(ids).filter((id) => typeof id === "string" && id.trim().length > 0);
    const target = getStorage(storage);
    if (!target) return false;
    target.setItem(FOUND_IDS_KEY, JSON.stringify(Array.from(new Set(validIds))));
    return true;
  } catch {
    return false;
  }
}

/** Adds one found ID and persists the updated set. */
export function addFoundId(id: string, storage?: StorageLike): boolean {
  if (typeof id !== "string" || id.trim().length === 0) return false;
  const found = readFoundIds(storage);
  found.add(id);
  return writeFoundIds(found, storage);
}

/** Reads the sound preference; invalid, missing or inaccessible values use the supplied default. */
export function readSoundEnabled(storage?: StorageLike, defaultValue = true): boolean {
  try {
    const value = getStorage(storage)?.getItem(SOUND_ENABLED_KEY);
    if (value === "true") return true;
    if (value === "false") return false;
  } catch {
    // Storage can be disabled by the browser or privacy settings.
  }
  return defaultValue;
}

/** Persists the sound preference, returning false when storage is unavailable or rejects the write. */
export function writeSoundEnabled(enabled: boolean, storage?: StorageLike): boolean {
  try {
    const target = getStorage(storage);
    if (!target) return false;
    target.setItem(SOUND_ENABLED_KEY, String(enabled));
    return true;
  } catch {
    return false;
  }
}
