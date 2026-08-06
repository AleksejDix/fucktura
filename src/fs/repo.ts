import { normalizeLegacyDocument } from './normalize';
import type { Client, Document, FileProblem, Position, RepoSnapshot, Sender } from './types';
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
async function writeJson(
  dir: FileSystemDirectoryHandle,
  filename: string,
  data: unknown,
): Promise<void> {
  const fh = await dir.getFileHandle(filename, { create: true });
  const writable = await fh.createWritable();
  try {
    await writable.write(JSON.stringify(data, null, 2) + '\n');
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

interface ListResult<T> {
  items: T[];
  problems: FileProblem[];
}

async function listJson<T>(
  dir: FileSystemDirectoryHandle,
  dirName: string,
  guard: (v: unknown) => v is T,
  normalize?: (v: unknown) => unknown,
): Promise<ListResult<T>> {
  const items: T[] = [];
  const problems: FileProblem[] = [];
  for await (const [name, entry] of dir as unknown as AsyncIterable<[string, FileSystemHandle]>) {
    if (entry.kind !== 'file' || !name.endsWith('.json')) continue;
    const file = await (entry as FileSystemFileHandle).getFile();
    const text = await file.text();
    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch {
      console.warn(`[fs/repo] Unparseable JSON: ${dirName}/${name}`);
      problems.push({ file: `${dirName}/${name}`, reason: 'unparseable' });
      continue;
    }
    if (normalize) parsed = normalize(parsed);
    if (!guard(parsed)) {
      console.warn(`[fs/repo] Invalid shape: ${dirName}/${name}`);
      problems.push({ file: `${dirName}/${name}`, reason: 'invalid' });
      continue;
    }
    items.push(parsed);
  }
  return { items, problems };
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

export async function listSenders(): Promise<ListResult<Sender>> {
  const dir = await getDir('senders');
  return listJson(dir, 'senders', isSender);
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

export async function listClients(): Promise<ListResult<Client>> {
  const dir = await getDir('clients');
  return listJson(dir, 'clients', isClient);
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

export async function listPositions(): Promise<ListResult<Position>> {
  let data: unknown;
  try {
    data = await readJson<unknown>(getRoot(), 'positions.json');
  } catch (e) {
    if (e instanceof SyntaxError) {
      console.warn('[fs/repo] Unparseable JSON: positions.json');
      return { items: [], problems: [{ file: 'positions.json', reason: 'unparseable' }] };
    }
    throw e;
  }
  if (data === null) return { items: [], problems: [] };
  if (!Array.isArray(data)) {
    return { items: [], problems: [{ file: 'positions.json', reason: 'invalid' }] };
  }
  const problems: FileProblem[] = [];
  const items = data.filter((p): p is Position => {
    const ok = isPosition(p);
    if (!ok) {
      console.warn(`[fs/repo] Skipping invalid position entry`, p);
      problems.push({ file: 'positions.json', reason: 'invalid' });
    }
    return ok;
  });
  return { items, problems };
}

export async function writePositions(list: Position[]): Promise<void> {
  await tracked(() => writeJson(getRoot(), 'positions.json', list));
}

// ---------- documents ----------

export async function listDocuments(): Promise<ListResult<Document>> {
  const dir = await getDir('documents');
  return listJson(dir, 'documents', isDocument, normalizeLegacyDocument);
}

export async function writeDocument(d: Document): Promise<void> {
  if (!d.number) throw new Error('Document.number required');
  await tracked(async () => {
    const dir = await getDir('documents');
    await writeJson(dir, `${d.number}.json`, d);
  });
}

export async function deleteDocument(number: string): Promise<void> {
  await tracked(async () => {
    const dir = await getDir('documents');
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
  return {
    senders: senders.items,
    clients: clients.items,
    positions: positions.items,
    documents: documents.items,
    problems: [
      ...senders.problems,
      ...clients.problems,
      ...positions.problems,
      ...documents.problems,
    ],
  };
}

/** True if the chosen folder is empty (no known subdirs / files). */
export async function isEmpty(): Promise<boolean> {
  const root = getRoot();
  for await (const _ of root as unknown as AsyncIterable<[string, FileSystemHandle]>) {
    return false;
  }
  return true;
}
