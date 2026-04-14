import type { Client, Document, Position, RepoSnapshot, Sender } from './types';

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

async function writeJson(dir: FileSystemDirectoryHandle, filename: string, data: unknown): Promise<void> {
  const fh = await dir.getFileHandle(filename, { create: true });
  const writable = await fh.createWritable();
  await writable.write(JSON.stringify(data, null, 2) + '\n');
  await writable.close();
}

async function listJson<T>(dir: FileSystemDirectoryHandle): Promise<T[]> {
  const out: T[] = [];
  for await (const [name, entry] of (dir as unknown as AsyncIterable<[string, FileSystemHandle]>)) {
    if (entry.kind !== 'file' || !name.endsWith('.json')) continue;
    const file = await (entry as FileSystemFileHandle).getFile();
    const text = await file.text();
    try {
      out.push(JSON.parse(text) as T);
    } catch {
      console.warn(`Skipping invalid JSON: ${name}`);
    }
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
  return listJson<Sender>(dir);
}

export async function writeSender(s: Sender): Promise<void> {
  if (!s.key) throw new Error('Sender.key required');
  const dir = await getDir('senders');
  await writeJson(dir, `${s.key}.json`, s);
}

export async function deleteSender(key: string): Promise<void> {
  const dir = await getDir('senders');
  await removeFile(dir, `${key}.json`);
}

// ---------- clients ----------

export async function listClients(): Promise<Client[]> {
  const dir = await getDir('clients');
  return listJson<Client>(dir);
}

export async function writeClient(c: Client): Promise<void> {
  if (!c.customerNumber) throw new Error('Client.customerNumber required');
  const dir = await getDir('clients');
  await writeJson(dir, `${c.customerNumber}.json`, c);
}

export async function deleteClient(customerNumber: string): Promise<void> {
  const dir = await getDir('clients');
  await removeFile(dir, `${customerNumber}.json`);
}

// ---------- positions (single flat file) ----------

export async function listPositions(): Promise<Position[]> {
  const data = await readJson<Position[]>(getRoot(), 'positions.json');
  return data ?? [];
}

export async function writePositions(list: Position[]): Promise<void> {
  await writeJson(getRoot(), 'positions.json', list);
}

// ---------- documents ----------

export async function listDocuments(): Promise<Document[]> {
  const dir = await getDir('documents');
  return listJson<Document>(dir);
}

export async function writeDocument(d: Document): Promise<void> {
  if (!d.number) throw new Error('Document.number required');
  const dir = await getDir('documents');
  await writeJson(dir, `${d.number}.json`, d);
}

export async function deleteDocument(number: string): Promise<void> {
  const dir = await getDir('documents');
  await removeFile(dir, `${number}.json`);
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
  for await (const _ of (root as unknown as AsyncIterable<[string, FileSystemHandle]>)) {
    return false;
  }
  return true;
}
