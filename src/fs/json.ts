import type { FileProblem } from './types';

/**
 * Generic JSON-file helpers over the File System Access API. No app
 * knowledge: directory handles come from the caller (fs/repo), which
 * owns the folder layout and entity semantics.
 */

export async function readJson<T>(
  dir: FileSystemDirectoryHandle,
  filename: string,
): Promise<T | null> {
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
 * Writes text atomically. createWritable + close() already commits via a
 * browser-internal temp file, but we abort explicitly on errors so a failed
 * serialization / write never leaves the stream dangling or the file in a
 * half-written state.
 */
export async function writeText(
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

export async function writeJson(
  dir: FileSystemDirectoryHandle,
  filename: string,
  data: unknown,
): Promise<void> {
  await writeText(dir, filename, JSON.stringify(data, null, 2) + '\n');
}

export interface ListResult<T> {
  items: T[];
  problems: FileProblem[];
}

/** Reads every *.json in a directory, skipping (and reporting) bad files. */
export async function listJson<T>(
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
      console.warn(`[fs/json] Unparseable JSON: ${dirName}/${name}`);
      problems.push({ file: `${dirName}/${name}`, reason: 'unparseable' });
      continue;
    }
    if (normalize) parsed = normalize(parsed);
    if (!guard(parsed)) {
      console.warn(`[fs/json] Invalid shape: ${dirName}/${name}`);
      problems.push({ file: `${dirName}/${name}`, reason: 'invalid' });
      continue;
    }
    items.push(parsed);
  }
  return { items, problems };
}

export async function removeFile(dir: FileSystemDirectoryHandle, filename: string): Promise<void> {
  try {
    await dir.removeEntry(filename);
  } catch (e) {
    if ((e as DOMException).name === 'NotFoundError') return;
    throw e;
  }
}

export async function fileExists(
  dir: FileSystemDirectoryHandle,
  filename: string,
): Promise<boolean> {
  try {
    await dir.getFileHandle(filename);
    return true;
  } catch (e) {
    if ((e as DOMException).name === 'NotFoundError') return false;
    throw e;
  }
}
