import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import type { Document } from '@/fs/types';

vi.mock('@/fs/repo', () => ({
  writeDocument: vi.fn().mockResolvedValue(undefined),
}));

import { useDocumentsStore } from '@/stores/documents';

function newDoc(number: string): Omit<Document, 'createdAt' | 'updatedAt'> {
  return {
    number,
    type: 'invoice',
    status: 'draft',
    subtitle: '',
    customerNumber: '',
    sender: {} as Document['sender'],
    recipient: {} as Document['recipient'],
    meta: { date: '2026-01-01', contactPerson: '', customerNumber: '' },
  };
}

describe('document number collision guard', () => {
  beforeEach(() => setActivePinia(createPinia()));

  it('keeps the desired number when free', async () => {
    const store = useDocumentsStore();
    expect(await store.addDocument(newDoc('R-100'))).toBe('R-100');
  });

  it('bumps past an existing document instead of overwriting its file', async () => {
    const store = useDocumentsStore();
    await store.addDocument(newDoc('R-100'));
    expect(await store.addDocument(newDoc('R-100'))).toBe('R-101');
    expect(store.documents.map((d) => d.number).sort()).toEqual(['R-100', 'R-101']);
  });

  it('gives concurrent same-second creations distinct numbers', async () => {
    const store = useDocumentsStore();
    const numbers = await Promise.all([
      store.addDocument(newDoc('R-200')),
      store.addDocument(newDoc('R-200')),
      store.addDocument(newDoc('R-200')),
    ]);
    expect(new Set(numbers).size).toBe(3);
    expect(numbers).toContain('R-200');
  });

  it('falls back to a suffix when the number has no numeric tail', async () => {
    const store = useDocumentsStore();
    await store.addDocument(newDoc('R-draft'));
    expect(await store.addDocument(newDoc('R-draft'))).toBe('R-draft-2');
  });

  it('releases a claimed number when the write fails', async () => {
    const repo = await import('@/fs/repo');
    const store = useDocumentsStore();
    vi.mocked(repo.writeDocument).mockRejectedValueOnce(new Error('disk full'));
    await expect(store.addDocument(newDoc('R-300'))).rejects.toThrow('disk full');
    expect(await store.addDocument(newDoc('R-300'))).toBe('R-300');
  });
});
