import { beforeEach, describe, expect, it } from 'vitest';
import * as repo from '@/fs/repo';

/** Minimal in-memory stand-in for the File System Access API. */
class FakeDir {
  files = new Map<string, string>();
  dirs = new Map<string, FakeDir>();

  async getDirectoryHandle(name: string, opts?: { create?: boolean }) {
    let dir = this.dirs.get(name);
    if (!dir) {
      if (!opts?.create) throw Object.assign(new Error(name), { name: 'NotFoundError' });
      dir = new FakeDir();
      this.dirs.set(name, dir);
    }
    return dir;
  }

  async getFileHandle(name: string, opts?: { create?: boolean }) {
    if (!this.files.has(name)) {
      if (!opts?.create) throw Object.assign(new Error(name), { name: 'NotFoundError' });
      this.files.set(name, '');
    }
    return {
      getFile: async () => ({ text: async () => this.files.get(name) ?? '' }),
      createWritable: async () => {
        let buf = '';
        return {
          write: async (t: string) => {
            buf += t;
          },
          close: async () => {
            this.files.set(name, buf);
          },
          abort: async () => {},
        };
      },
    };
  }

  async removeEntry(name: string) {
    if (!this.files.delete(name) && !this.dirs.delete(name)) {
      throw Object.assign(new Error(name), { name: 'NotFoundError' });
    }
  }
}

describe('deleteDocument moves files to .trash', () => {
  let root: FakeDir;
  let documents: FakeDir;

  beforeEach(async () => {
    root = new FakeDir();
    repo.setRoot(root as unknown as FileSystemDirectoryHandle);
    documents = (await root.getDirectoryHandle('documents', { create: true })) as FakeDir;
  });

  it('preserves the exact file bytes in .trash and removes the original', async () => {
    const bytes = '{\n  "number": "R-1",\n  "note": "hand-edited layout"\n}\n';
    documents.files.set('R-1.json', bytes);

    await repo.deleteDocument('R-1');

    expect(documents.files.has('R-1.json')).toBe(false);
    const trash = root.dirs.get('.trash')!;
    const entries = [...trash.files.entries()];
    expect(entries).toHaveLength(1);
    expect(entries[0][0]).toMatch(/^R-1\.\d+\.json$/);
    expect(entries[0][1]).toBe(bytes);
  });

  it('is a no-op for a number that has no file', async () => {
    await expect(repo.deleteDocument('R-does-not-exist')).resolves.toBeUndefined();
    expect(root.dirs.has('.trash')).toBe(false);
  });

  it('keeps both copies when the same number is deleted twice', async () => {
    documents.files.set('R-2.json', 'first');
    await repo.deleteDocument('R-2');
    documents.files.set('R-2.json', 'second');
    await repo.deleteDocument('R-2');

    const trash = root.dirs.get('.trash')!;
    expect(trash.files.size).toBe(2);
    expect([...trash.files.values()].sort()).toEqual(['first', 'second']);
  });
});
