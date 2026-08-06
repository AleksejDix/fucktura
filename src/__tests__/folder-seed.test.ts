import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';

vi.mock('@/fs/repo', () => ({
  isEmpty: vi.fn(),
  setRoot: vi.fn(),
  loadAll: vi.fn().mockResolvedValue({ senders: [], clients: [], positions: [], documents: [] }),
}));
vi.mock('@/fs/seed', () => ({ seedFromBundled: vi.fn().mockResolvedValue(undefined) }));
vi.mock('@/fs/migrate', () => ({ tryMigrateFromLegacy: vi.fn().mockResolvedValue(false) }));
vi.mock('@/fs/handle', () => ({
  ensurePermission: vi.fn(),
  ensurePersistentStorage: vi.fn(),
  forgetFolder: vi.fn(),
  hasPermission: vi.fn(),
  isFileSystemAccessSupported: vi.fn().mockReturnValue(true),
  loadRecents: vi.fn().mockResolvedValue([]),
  pickDirectory: vi.fn(),
  rememberFolder: vi.fn().mockResolvedValue([]),
}));

import { isEmpty } from '@/fs/repo';
import { seedFromBundled } from '@/fs/seed';
import { tryMigrateFromLegacy } from '@/fs/migrate';
import { pickDirectory } from '@/fs/handle';
import { useConfirmStore } from '@/stores/confirm';
import { useFolderStore } from '@/stores/folder';

const handle = { name: 'test-folder' } as FileSystemDirectoryHandle;

/** Runs openFolder and answers the (optional) seed dialog. */
async function openWithAnswer(answer: boolean | null): Promise<void> {
  const folder = useFolderStore();
  const confirm = useConfirmStore();
  const done = folder.openFolder();
  // Let activate() reach the dialog, then answer it.
  await vi.waitFor(() => {
    if (answer !== null && !confirm.open) throw new Error('dialog not open yet');
  });
  if (answer !== null) confirm.resolve(answer);
  await done;
}

describe('demo seeding asks instead of inferring', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.mocked(pickDirectory).mockResolvedValue(handle);
    vi.mocked(seedFromBundled).mockClear();
    vi.mocked(tryMigrateFromLegacy).mockResolvedValue(false);
  });

  it('seeds an empty folder only after the user confirms', async () => {
    vi.mocked(isEmpty).mockResolvedValue(true);
    await openWithAnswer(true);
    expect(seedFromBundled).toHaveBeenCalledOnce();
    expect(useFolderStore().state).toBe('ready');
  });

  it('leaves an empty folder empty when the user declines', async () => {
    vi.mocked(isEmpty).mockResolvedValue(true);
    await openWithAnswer(false);
    expect(seedFromBundled).not.toHaveBeenCalled();
    expect(useFolderStore().state).toBe('ready');
  });

  it('never asks for a non-empty folder', async () => {
    vi.mocked(isEmpty).mockResolvedValue(false);
    await openWithAnswer(null);
    expect(useConfirmStore().open).toBe(false);
    expect(seedFromBundled).not.toHaveBeenCalled();
  });

  it('skips the question when legacy data was migrated', async () => {
    vi.mocked(isEmpty).mockResolvedValue(true);
    vi.mocked(tryMigrateFromLegacy).mockResolvedValue(true);
    await openWithAnswer(null);
    expect(useConfirmStore().open).toBe(false);
    expect(seedFromBundled).not.toHaveBeenCalled();
  });
});
