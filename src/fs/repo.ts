import { normalizeLegacyDocument } from './normalize';
import type { Client, Document, Position, RepoSnapshot, Sender } from './types';
import { isClient, isDocument, isPosition, isSender } from './validate';

/** Dispatches 'save-start' and 'save-end' whenever the repo writes a file. */
export const saveEvents = new EventTarget();

async function tracked<T>(fn: () => Promise<T>): Promise<T> {
  saveEvents.dispatchEvent(new Event('save-start'));
  try {
    return await fn();
  } finally {
    saveEvents.dispatchEvent(new Event('save-end'));
  }
}

let rootHandle: FileSystemDirectoryHandle | null = null;

export function setRoot(handle: FileSystemDirectoryHandle): void {
  rootHandle = handle;
}

export function getRoot(): FileSystemDirectoryHandle {
  if (!rootHandle) throw new Error('FS root not set — call setRoot(handle) first');
  return rootHandle;
}

async function getDir(name: string): Promise<FileSystemDirectoryHandle> {
  return await getRoot().getDirectoryHandle(name, { create: true });
}

async function readJson<T>(dir: FileSystemDirectoryHandle, filename: string): Promise<T | null> {
  try {
    const fh = await dir.getFileHandle(filename);
    const file = await fh.getFile();
    const text = await file.text();
    return JSON.parse(text) as T;
  } catch (e) {
    if ((e as DOMException).name === 'NotFoundError') return null;
    throw e;
  }
}

/**
 * Writes JSON atomically. createWritable + close() already commits via a
 * browser-internal temp file, but we abort explicitly on errors so a failed
 * serialization / write never leaves the stream dangling or the file in a
 * half-written state.
 */
async function writeText(
  dir: FileSystemDirectoryHandle,
  filename: string,
  text: string,
): Promise<void> {
  const fh = await dir.getFileHandle(filename, { create: true });
  const writable = await fh.createWritable();
  try {
    await writable.write(text);
    await writable.close();
  } catch (e) {
    try {
      await writable.abort();
    } catch {
      /* stream may already be closed */
    }
    throw e;
  }
}

async function writeJson(
  dir: FileSystemDirectoryHandle,
  filename: string,
  data: unknown,
): Promise<void> {
  await writeText(dir, filename, JSON.stringify(data, null, 2) + '\n');
}

async function listJson<T>(
  dir: FileSystemDirectoryHandle,
  guard: (v: unknown) => v is T,
  normalize?: (v: unknown) => unknown,
): Promise<T[]> {
  const out: T[] = [];
  for await (const [name, entry] of dir as unknown as AsyncIterable<[string, FileSystemHandle]>) {
    if (entry.kind !== 'file' || !name.endsWith('.json')) continue;
    const file = await (entry as FileSystemFileHandle).getFile();
    const text = await file.text();
    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch {
      console.warn(`[fs/repo] Skipping unparseable JSON: ${name}`);
      continue;
    }
    if (normalize) parsed = normalize(parsed);
    if (!guard(parsed)) {
      console.warn(`[fs/repo] Skipping invalid shape: ${name}`);
      continue;
    }
    out.push(parsed);
  }
  return out;
}

async function removeFile(dir: FileSystemDirectoryHandle, filename: string): Promise<void> {
  try {
    await dir.removeEntry(filename);
  } catch (e) {
    if ((e as DOMException).name === 'NotFoundError') return;
    throw e;
  }
}

// ---------- senders ----------

export async function listSenders(): Promise<Sender[]> {
  const dir = await getDir('senders');
  return listJson(dir, isSender);
}

export async function writeSender(s: Sender): Promise<void> {
  if (!s.key) throw new Error('Sender.key required');
  await tracked(async () => {
    const dir = await getDir('senders');
    await writeJson(dir, `${s.key}.json`, s);
  });
}

export async function deleteSender(key: string): Promise<void> {
  await tracked(async () => {
    const dir = await getDir('senders');
    await removeFile(dir, `${key}.json`);
  });
}

// ---------- clients ----------

export async function listClients(): Promise<Client[]> {
  const dir = await getDir('clients');
  return listJson(dir, isClient);
}

export async function writeClient(c: Client): Promise<void> {
  if (!c.customerNumber) throw new Error('Client.customerNumber required');
  await tracked(async () => {
    const dir = await getDir('clients');
    await writeJson(dir, `${c.customerNumber}.json`, c);
  });
}

export async function deleteClient(customerNumber: string): Promise<void> {
  await tracked(async () => {
    const dir = await getDir('clients');
    await removeFile(dir, `${customerNumber}.json`);
  });
}

// ---------- positions (single flat file) ----------

export async function listPositions(): Promise<Position[]> {
  const data = await readJson<unknown>(getRoot(), 'positions.json');
  if (!Array.isArray(data)) return [];
  return data.filter((p): p is Position => {
    const ok = isPosition(p);
    if (!ok) console.warn(`[fs/repo] Skipping invalid position entry`, p);
    return ok;
  });
}

export async function writePositions(list: Position[]): Promise<void> {
  await tracked(() => writeJson(getRoot(), 'positions.json', list));
}

// ---------- documents ----------

export async function listDocuments(): Promise<Document[]> {
  const dir = await getDir('documents');
  return listJson(dir, isDocument, normalizeLegacyDocument);
}

export async function writeDocument(d: Document): Promise<void> {
  if (!d.number) throw new Error('Document.number required');
  await tracked(async () => {
    const dir = await getDir('documents');
    await writeJson(dir, `${d.number}.json`, d);
  });
}

const TRASH_DIR = '.trash';

async function fileExists(dir: FileSystemDirectoryHandle, filename: string): Promise<boolean> {
  try {
    await dir.getFileHandle(filename);
    return true;
  } catch (e) {
    if ((e as DOMException).name === 'NotFoundError') return false;
    throw e;
  }
}

/**
 * Deleting a document moves its file into .trash/ instead of destroying
 * it: removeEntry bypasses the OS trash, and one misclick past the
 * confirm dialog should never be able to lose a real invoice. Each
 * deletion gets a timestamped name so re-deleting a recreated number
 * never overwrites older trash.
 */
export async function deleteDocument(number: string): Promise<void> {
  await tracked(async () => {
    const dir = await getDir('documents');
    let text: string;
    try {
      const fh = await dir.getFileHandle(`${number}.json`);
      text = await (await fh.getFile()).text();
    } catch (e) {
      if ((e as DOMException).name === 'NotFoundError') return;
      throw e;
    }
    const trash = await getRoot().getDirectoryHandle(TRASH_DIR, { create: true });
    let stamp = Date.now();
    while (await fileExists(trash, `${number}.${stamp}.json`)) stamp++;
    await writeText(trash, `${number}.${stamp}.json`, text);
    await removeFile(dir, `${number}.json`);
  });
}

// ---------- snapshot ----------

export async function loadAll(): Promise<RepoSnapshot> {
  const [senders, clients, positions, documents] = await Promise.all([
    listSenders(),
    listClients(),
    listPositions(),
    listDocuments(),
  ]);
  return { senders, clients, positions, documents };
}

/** True if the chosen folder is empty (no known subdirs / files). */
export async function isEmpty(): Promise<boolean> {
  const root = getRoot();
  for await (const _ of root as unknown as AsyncIterable<[string, FileSystemHandle]>) {
    return false;
  }
  return true;
}
