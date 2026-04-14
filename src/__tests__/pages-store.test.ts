import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { usePagesStore } from '@/stores/pages';
import { useDocumentsStore } from '@/stores/documents';
import type { Document, SenderSnapshot } from '@/fs/types';

const fakeSender: SenderSnapshot = {
  company: 'Test GmbH',
  street: 'Teststr. 1',
  zip: '8000',
  city: 'Zürich',
  country: 'Schweiz',
  email: 'test@test.ch',
  website: 'test.ch',
  uid: 'CHE-123',
  contact: 'Test Person',
  contactEmail: 'test@test.ch',
  accounts: [{ iban: 'CH00 0000 0000 0000 0000 0', bank: 'ZKB', bic: 'DEMOCHZZXXX' }],
  invoiceDueDays: 14,
  quoteValidDays: 14,
};

function makeDoc(overrides: Partial<Document>): Document {
  return {
    type: 'invoice',
    status: 'draft',
    number: 'R-001',
    subtitle: '',
    customerNumber: '',
    sender: fakeSender,
    recipient: { company: '', name: '', street: '', zip: '', city: '', country: '' },
    meta: { date: '', contactPerson: '', customerNumber: '' },
    lineItems: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

describe('usePagesStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('builds pages for an invoice with QR bill', () => {
    const docsStore = useDocumentsStore();
    docsStore.documents = [makeDoc({ number: 'R-1', type: 'invoice' })];
    docsStore.activeDocumentNumber = 'R-1';

    const pagesStore = usePagesStore();
    expect(pagesStore.pages).toHaveLength(2);
    expect(pagesStore.pages[0].name).toBe('Invoice');
    expect(pagesStore.pages[1].name).toBe('QRBill');
  });

  it('builds pages for an offerte without QR bill', () => {
    const docsStore = useDocumentsStore();
    docsStore.documents = [makeDoc({ number: 'O-1', type: 'offerte' })];
    docsStore.activeDocumentNumber = 'O-1';

    const pagesStore = usePagesStore();
    expect(pagesStore.pages).toHaveLength(1);
    expect(pagesStore.pages[0].name).toBe('Offerte');
  });

  it('builds pages for a mahnung with QR bill', () => {
    const docsStore = useDocumentsStore();
    docsStore.documents = [
      makeDoc({
        number: 'M-1',
        type: 'mahnung',
        offenerBetrag: 100,
        mahngebuehr: 20,
        verzugszins: 5,
      }),
    ];
    docsStore.activeDocumentNumber = 'M-1';

    const pagesStore = usePagesStore();
    expect(pagesStore.pages).toHaveLength(2);
    expect(pagesStore.pages[0].name).toBe('Mahnung');
    expect(pagesStore.pages[1].name).toBe('QRBill');
  });

  it('shows all documents when no active document', () => {
    const docsStore = useDocumentsStore();
    docsStore.documents = [
      makeDoc({ number: 'R-1', type: 'invoice' }),
      makeDoc({ number: 'O-1', type: 'offerte' }),
      makeDoc({ number: 'M-1', type: 'mahnung', offenerBetrag: 0, mahngebuehr: 0, verzugszins: 0 }),
    ];
    docsStore.activeDocumentNumber = null;

    const pagesStore = usePagesStore();
    expect(pagesStore.pages).toHaveLength(5);
  });

  it('computes correct page numbers', () => {
    const docsStore = useDocumentsStore();
    docsStore.documents = [makeDoc({ number: 'R-1', type: 'invoice' })];
    docsStore.activeDocumentNumber = 'R-1';

    const pagesStore = usePagesStore();
    expect(pagesStore.pageNumbers).toEqual([1, 2]);
    expect(pagesStore.numberOfVisiblePages).toBe(2);
  });
});
