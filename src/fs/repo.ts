import { fileExists, listJson, readJson, removeFile, writeJson, writeText } from './json';
import type { ListResult } from './json';
import { normalizeLegacyDocument } from './normalize';
import type { Client, Document, FileProblem, Position, RepoSnapshot, Sender } from './types';
import { isClient, isDocument, isPosition, isSender } from './validate';

/**
 * Dispatches 'save-start' / 'save-end' around every repo write, plus
 * 'save-success' or 'save-error' (CustomEvent with the message as detail)
 * depending on the outcome, so the UI can distinguish failure from
 * completion.
 */
export const saveEvents = new EventTarget();

async function tracked<T>(fn: () => Promise<T>): Promise<T> {
  saveEvents.dispatchEvent(new Event('save-start'));
  try {
    const result = await fn();
    saveEvents.dispatchEvent(new Event('save-success'));
    return result;
  } catch (e) {
    const detail = e instanceof Error ? e.message : String(e);
    saveEvents.dispatchEvent(new CustomEvent('save-error', { detail }));
    throw e;
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

const TRASH_DIR = '.trash';

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
