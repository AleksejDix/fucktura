import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import type { FileProblem, RepoSnapshot } from '@/fs/types';

vi.mock('@/fs/repo', () => ({
  loadAll: vi.fn(),
}));

import * as repo from '@/fs/repo';
import { useDocumentsStore } from '@/stores/documents';

function snapshot(problems: FileProblem[]): RepoSnapshot {
  return { senders: [], clients: [], positions: [], documents: [], problems };
}

const broken: FileProblem = { file: 'documents/R-123.json', reason: 'unparseable' };
const invalid: FileProblem = { file: 'documents/R-456.json', reason: 'invalid' };

describe('load problems surfacing', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.mocked(repo.loadAll).mockReset();
  });

  it('exposes skipped files from loadAll', async () => {
    vi.mocked(repo.loadAll).mockResolvedValue(snapshot([broken, invalid]));
    const store = useDocumentsStore();
    await store.load();
    expect(store.loadProblems).toEqual([broken, invalid]);
    expect(store.loadProblemsDismissed).toBe(false);
    expect(store.loading).toBe(false);
  });

  it('keeps the dismissal when a reload finds the same problems', async () => {
    vi.mocked(repo.loadAll).mockResolvedValue(snapshot([broken]));
    const store = useDocumentsStore();
    await store.load();
    store.loadProblemsDismissed = true;
    await store.load();
    expect(store.loadProblemsDismissed).toBe(true);
  });

  it('re-raises the banner when the problem set changes', async () => {
    vi.mocked(repo.loadAll).mockResolvedValue(snapshot([broken]));
    const store = useDocumentsStore();
    await store.load();
    store.loadProblemsDismissed = true;
    vi.mocked(repo.loadAll).mockResolvedValue(snapshot([broken, invalid]));
    await store.load();
    expect(store.loadProblemsDismissed).toBe(false);
    expect(store.loadProblems).toEqual([broken, invalid]);
  });

  it('clears problems when a reload finds none', async () => {
    vi.mocked(repo.loadAll).mockResolvedValue(snapshot([broken]));
    const store = useDocumentsStore();
    await store.load();
    vi.mocked(repo.loadAll).mockResolvedValue(snapshot([]));
    await store.load();
    expect(store.loadProblems).toEqual([]);
  });
});
