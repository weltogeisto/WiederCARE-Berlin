import { isValidPoint } from "./geo.ts";

export interface Draft {
  id: string;
  title: string;
  instruction: string;
  before: Blob;
  after?: Blob;
  lat: number | null;
  lng: number | null;
  createdAt: string;
}

export const MAX_DRAFTS = 12;
export const MAX_DRAFT_BLOB_BYTES = 3 * 1024 * 1024;
export const DRAFT_DATABASE_NAME = "wiedercare:v1:drafts";
const DRAFT_DATABASE_VERSION = 1;
const DRAFT_STORE_NAME = "drafts";

/** Returns a validation message, or null when the value can be stored as a Draft. */
export function draftValidationError(value: unknown): string | null {
  if (typeof value !== "object" || value === null) return "Draft must be an object.";
  const draft = value as Record<string, unknown>;
  if (typeof draft.id !== "string" || draft.id.trim().length === 0) return "Draft ID must be a non-empty string.";
  if (typeof draft.title !== "string") return "Draft title must be a string.";
  if (typeof draft.instruction !== "string") return "Draft instruction must be a string.";
  if (typeof Blob === "undefined" || !(draft.before instanceof Blob)) return "Draft before image must be a Blob.";
  if (draft.before.size > MAX_DRAFT_BLOB_BYTES) return "Draft before image exceeds the 3 MB limit.";
  if (draft.after !== undefined) {
    if (!(draft.after instanceof Blob)) return "Draft after image must be a Blob when present.";
    if (draft.after.size > MAX_DRAFT_BLOB_BYTES) return "Draft after image exceeds the 3 MB limit.";
  }

  const hasNoLocation = draft.lat === null && draft.lng === null;
  if (!hasNoLocation && !isValidPoint({ lat: draft.lat, lng: draft.lng })) {
    return "Draft coordinates must both be null or a valid latitude/longitude pair.";
  }
  if (typeof draft.createdAt !== "string" || !Number.isFinite(Date.parse(draft.createdAt))) {
    return "Draft creation time must be a valid date string.";
  }
  return null;
}

/** Type guard for the runtime validation used before persistence. */
export function isDraft(value: unknown): value is Draft {
  return draftValidationError(value) === null;
}

function toError(value: unknown, fallback: string): Error {
  return value instanceof Error ? value : new Error(fallback);
}

function openDraftDatabase(): Promise<IDBDatabase> {
  let factory: IDBFactory | undefined;
  try {
    factory = globalThis.indexedDB;
  } catch {
    return Promise.reject(new Error("IndexedDB is unavailable in this browser."));
  }
  if (!factory) return Promise.reject(new Error("IndexedDB is unavailable in this browser."));

  return new Promise((resolve, reject) => {
    let request: IDBOpenDBRequest;
    try {
      request = factory!.open(DRAFT_DATABASE_NAME, DRAFT_DATABASE_VERSION);
    } catch (error) {
      reject(toError(error, "Could not open the local draft database."));
      return;
    }

    let settled = false;
    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(DRAFT_STORE_NAME)) {
        database.createObjectStore(DRAFT_STORE_NAME, { keyPath: "id" });
      }
    };
    request.onerror = () => {
      if (settled) return;
      settled = true;
      reject(request.error ?? new Error("Could not open the local draft database."));
    };
    request.onblocked = () => {
      if (settled) return;
      settled = true;
      reject(new Error("Opening the local draft database was blocked by another tab."));
    };
    request.onsuccess = () => {
      const database = request.result;
      database.onversionchange = () => database.close();
      if (settled) {
        database.close();
        return;
      }
      settled = true;
      resolve(database);
    };
  });
}

function runTransaction<T>(
  mode: IDBTransactionMode,
  run: (store: IDBObjectStore, transaction: IDBTransaction, complete: (value: T) => void, fail: (error: Error) => void) => void,
): Promise<T> {
  return openDraftDatabase().then((database) => new Promise<T>((resolve, reject) => {
    let transaction: IDBTransaction;
    try {
      transaction = database.transaction(DRAFT_STORE_NAME, mode);
    } catch (error) {
      database.close();
      reject(toError(error, "Could not start a local draft transaction."));
      return;
    }

    let hasResult = false;
    let result: T;
    let expectedError: Error | undefined;
    let settled = false;
    const complete = (value: T) => {
      result = value;
      hasResult = true;
    };
    const fail = (error: Error) => {
      expectedError = error;
      try {
        transaction.abort();
      } catch {
        database.close();
        if (!settled) {
          settled = true;
          reject(error);
        }
      }
    };

    transaction.oncomplete = () => {
      database.close();
      if (settled) return;
      settled = true;
      if (!hasResult) {
        reject(new Error("Local draft transaction completed without a result."));
      } else {
        resolve(result!);
      }
    };
    transaction.onabort = () => {
      database.close();
      if (settled) return;
      settled = true;
      reject(expectedError ?? transaction.error ?? new Error("Local draft transaction was aborted."));
    };
    transaction.onerror = () => {
      // The transaction's abort event carries the underlying IndexedDB error.
    };

    try {
      run(transaction.objectStore(DRAFT_STORE_NAME), transaction, complete, fail);
    } catch (error) {
      fail(toError(error, "Local draft operation failed."));
    }
  }));
}

/** Lists validated drafts, newest first. Database failures reject the returned promise. */
export function listDrafts(): Promise<Draft[]> {
  return runTransaction<Draft[]>("readonly", (store, _transaction, complete, fail) => {
    const request = store.getAll();
    request.onsuccess = () => {
      const drafts: unknown[] = request.result;
      if (drafts.some((draft) => !isDraft(draft))) {
        fail(new Error("The local draft database contains an invalid draft."));
        return;
      }
      complete((drafts as Draft[]).sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt)));
    };
  });
}

/** Saves a draft atomically; updates do not consume an extra slot. */
export function saveDraft(draft: Draft): Promise<void> {
  const validationError = draftValidationError(draft);
  if (validationError) return Promise.reject(new TypeError(validationError));

  return runTransaction<void>("readwrite", (store, _transaction, complete, fail) => {
    const existingRequest = store.get(draft.id);
    existingRequest.onsuccess = () => {
      if (existingRequest.result !== undefined) {
        const request = store.put(draft);
        request.onsuccess = () => complete(undefined);
        return;
      }

      const countRequest = store.count();
      countRequest.onsuccess = () => {
        if (countRequest.result >= MAX_DRAFTS) {
          fail(new RangeError(`A maximum of ${MAX_DRAFTS} local drafts can be saved.`));
          return;
        }
        const request = store.add(draft);
        request.onsuccess = () => complete(undefined);
      };
    };
  });
}

/** Removes the draft with this ID; deleting a missing ID is a successful no-op. */
export function deleteDraft(id: string): Promise<void> {
  if (typeof id !== "string" || id.trim().length === 0) {
    return Promise.reject(new TypeError("Draft ID must be a non-empty string."));
  }
  return runTransaction<void>("readwrite", (store, _transaction, complete) => {
    const request = store.delete(id);
    request.onsuccess = () => complete(undefined);
  });
}
