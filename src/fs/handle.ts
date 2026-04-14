const DB_NAME = 'erechnung-config';
const STORE = 'config';
const RECENTS_KEY = 'recents';
const MAX_RECENTS = 5;

export interface RecentFolder {
  name: string;
  handle: FileSystemDirectoryHandle;
  lastOpened: string;
}

function openConfigDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      req.result.createObjectStore(STORE);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function idbGet<T>(key: string): Promise<T | undefined> {
  const db = await openConfigDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly');
    const req = tx.objectStore(STORE).get(key);
    req.onsuccess = () => resolve(req.result as T | undefined);
    req.onerror = () => reject(req.error);
  });
}

async function idbSet(key: string, value: unknown): Promise<void> {
  const db = await openConfigDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).put(value, key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export function isFileSystemAccessSupported(): boolean {
  return typeof window !== 'undefined' && 'showDirectoryPicker' in window;
}

/**
 * Ask the browser not to evict our config IDB (which holds the folder
 * handle). Without this, long-idle users can lose the recents list. No-op
 * if the API is missing or permission was already granted.
 */
export async function ensurePersistentStorage(): Promise<boolean> {
  if (!navigator.storage?.persist) return false;
  try {
    if (await navigator.storage.persisted()) return true;
    return await navigator.storage.persist();
  } catch {
    return false;
  }
}

export async function loadRecents(): Promise<RecentFolder[]> {
  const stored = (await idbGet<RecentFolder[]>(RECENTS_KEY)) ?? [];
  return stored;
}

async function saveRecents(recents: RecentFolder[]): Promise<void> {
  await idbSet(RECENTS_KEY, recents.slice(0, MAX_RECENTS));
}

/** Add (or move to front) a folder in the recents list. Deduped via isSameEntry. */
export async function rememberFolder(handle: FileSystemDirectoryHandle): Promise<RecentFolder[]> {
  const recents = await loadRecents();
  const filtered: RecentFolder[] = [];
  for (const entry of recents) {
    const same = await entry.handle.isSameEntry(handle).catch(() => false);
    if (!same) filtered.push(entry);
  }
  const next: RecentFolder[] = [
    { name: handle.name, handle, lastOpened: new Date().toISOString() },
    ...filtered,
  ].slice(0, MAX_RECENTS);
  await saveRecents(next);
  return next;
}

export async function forgetFolder(handle: FileSystemDirectoryHandle): Promise<RecentFolder[]> {
  const recents = await loadRecents();
  const kept: RecentFolder[] = [];
  for (const entry of recents) {
    const same = await entry.handle.isSameEntry(handle).catch(() => false);
    if (!same) kept.push(entry);
  }
  await saveRecents(kept);
  return kept;
}

export async function pickDirectory(): Promise<FileSystemDirectoryHandle> {
  return await window.showDirectoryPicker({ mode: 'readwrite' });
}

const RW = { mode: 'readwrite' as const };

/** Read-only check — safe to call without user activation. */
export async function hasPermission(handle: FileSystemDirectoryHandle): Promise<boolean> {
  return (await handle.queryPermission(RW)) === 'granted';
}

/** Verify or prompt for rw permission. MUST be called from a user gesture. */
export async function ensurePermission(handle: FileSystemDirectoryHandle): Promise<boolean> {
  if (await hasPermission(handle)) return true;
  return (await handle.requestPermission(RW)) === 'granted';
}
