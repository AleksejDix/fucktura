import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import type { Document } from '@/fs/types';

vi.mock('@/fs/repo', () => ({
  writeDocument: vi.fn().mockResolvedValue(undefined),
}));

import * as repo from '@/fs/repo';
import { useDocumentsStore } from '@/stores/documents';

function seedDoc(overrides: Partial<Document> = {}): Document {
  return {
    number: 'R-100',
    type: 'invoice',
    status: 'draft',
    subtitle: 'original',
    customerNumber: '0001',
    sender: {} as Document['sender'],
    recipient: {} as Document['recipient'],
    meta: { date: '2026-01-01', contactPerson: 'X', customerNumber: '0001', dueDate: '2026-02-01' },
    createdAt: '2026-01-01',
    updatedAt: '2026-01-01',
    ...overrides,
  };
}

describe('updateDocument write semantics', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.mocked(repo.writeDocument).mockReset().mockResolvedValue(undefined);
  });

  it('does not lose the first edit when a second lands while it is being written', async () => {
    // Simulate a slow disk so edit B lands while edit A's write is in flight.
    vi.mocked(repo.writeDocument).mockImplementation(
      () => new Promise<void>((resolve) => setTimeout(resolve, 5)),
    );
    const store = useDocumentsStore();
    store.documents = [seedDoc()];

    const first = store.updateDocument('R-100', { subtitle: 'edit A' });
    const second = store.updateDocument('R-100', { customerNumber: '0002' });
    await Promise.all([first, second]);

    const doc = store.documents[0];
    expect(doc.subtitle).toBe('edit A');
    expect(doc.customerNumber).toBe('0002');
    const lastWritten = vi.mocked(repo.writeDocument).mock.lastCall?.[0];
    expect(lastWritten?.subtitle).toBe('edit A');
    expect(lastWritten?.customerNumber).toBe('0002');
  });

  it('serializes disk writes per document', async () => {
    let inFlight = 0;
    let maxInFlight = 0;
    vi.mocked(repo.writeDocument).mockImplementation(async () => {
      inFlight++;
      maxInFlight = Math.max(maxInFlight, inFlight);
      await new Promise((r) => setTimeout(r, 1));
      inFlight--;
    });
    const store = useDocumentsStore();
    store.documents = [seedDoc()];
    await Promise.all([
      store.updateDocument('R-100', { subtitle: 'a' }),
      store.updateDocument('R-100', { subtitle: 'b' }),
      store.updateDocument('R-100', { subtitle: 'c' }),
    ]);
    expect(maxInFlight).toBe(1);
    expect(store.documents[0].subtitle).toBe('c');
  });

  it('merges meta patches instead of replacing meta', async () => {
    const store = useDocumentsStore();
    store.documents = [seedDoc()];
    await store.updateDocument('R-100', { meta: { customerNumber: '0009' } });
    expect(store.documents[0].meta.customerNumber).toBe('0009');
    expect(store.documents[0].meta.dueDate).toBe('2026-02-01');
    expect(store.documents[0].meta.date).toBe('2026-01-01');
  });

  it('clears an optional field when the patch sets it to undefined', async () => {
    const store = useDocumentsStore();
    store.documents = [seedDoc({ type: 'reminder', relatedInvoice: 'R-001' })];
    await store.updateDocument('R-100', { relatedInvoice: undefined });
    expect(store.documents[0].relatedInvoice).toBeUndefined();
    const written = vi.mocked(repo.writeDocument).mock.lastCall?.[0] as Document;
    expect(JSON.parse(JSON.stringify(written))).not.toHaveProperty('relatedInvoice');
  });

  it('keeps memory ahead of a failed write and reports the rejection', async () => {
    vi.mocked(repo.writeDocument).mockRejectedValueOnce(new Error('disk full'));
    const store = useDocumentsStore();
    store.documents = [seedDoc()];
    await expect(store.updateDocument('R-100', { subtitle: 'edit' })).rejects.toThrow('disk full');
    expect(store.documents[0].subtitle).toBe('edit');
  });
});
