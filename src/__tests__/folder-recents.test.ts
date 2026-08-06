import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import type { RecentFolder } from '@/fs/handle';

vi.mock('@/fs/repo', () => ({
  isEmpty: vi.fn().mockResolvedValue(false),
  setRoot: vi.fn(),
  loadAll: vi.fn(),
}));
vi.mock('@/fs/seed', () => ({ seedFromBundled: vi.fn() }));
vi.mock('@/fs/migrate', () => ({ tryMigrateFromLegacy: vi.fn().mockResolvedValue(false) }));
vi.mock('@/fs/handle', () => ({
  ensurePermission: vi.fn().mockResolvedValue(true),
  ensurePersistentStorage: vi.fn(),
  forgetFolder: vi.fn().mockResolvedValue([]),
  hasPermission: vi.fn().mockResolvedValue(true),
  isFileSystemAccessSupported: vi.fn().mockReturnValue(true),
  loadRecents: vi.fn(),
  pickDirectory: vi.fn(),
  rememberFolder: vi.fn().mockResolvedValue([]),
}));

import { loadAll } from '@/fs/repo';
import { forgetFolder, loadRecents } from '@/fs/handle';
import { useFolderStore } from '@/stores/folder';

const entry: RecentFolder = {
  name: 'rechnungen',
  handle: { name: 'rechnungen' } as FileSystemDirectoryHandle,
} as RecentFolder;

describe('recent folders survive transient errors', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.mocked(loadRecents).mockResolvedValue([entry]);
    vi.mocked(forgetFolder).mockClear();
  });

  it('keeps the recent entry when activation fails transiently', async () => {
    vi.mocked(loadAll).mockRejectedValue(new Error('one-off read hiccup'));
    const folder = useFolderStore();
    await folder.init();
    expect(forgetFolder).not.toHaveBeenCalled();
    expect(folder.state).toBe('needs-pick');
  });

  it('prunes the entry when the folder is gone', async () => {
    vi.mocked(loadAll).mockRejectedValue(
      Object.assign(new Error('gone'), { name: 'NotFoundError' }),
    );
    const folder = useFolderStore();
    await folder.init();
    expect(forgetFolder).toHaveBeenCalledWith(entry.handle);
  });

  it('prunes the entry when permission is permanently blocked', async () => {
    vi.mocked(loadAll).mockRejectedValue(
      Object.assign(new Error('blocked'), { name: 'NotAllowedError' }),
    );
    const folder = useFolderStore();
    await folder.init();
    expect(forgetFolder).toHaveBeenCalledWith(entry.handle);
  });

  it('openRecent keeps the entry on transient errors and leaves the picker usable', async () => {
    vi.mocked(loadAll).mockRejectedValue(new Error('hiccup'));
    const folder = useFolderStore();
    await folder.openRecent(entry);
    expect(forgetFolder).not.toHaveBeenCalled();
    expect(folder.error).toBe('hiccup');
    expect(folder.state).toBe('needs-pick');
  });
});
