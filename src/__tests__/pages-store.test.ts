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

  it('builds pages for an quote without QR bill', () => {
    const docsStore = useDocumentsStore();
    docsStore.documents = [makeDoc({ number: 'O-1', type: 'quote' })];
    docsStore.activeDocumentNumber = 'O-1';

    const pagesStore = usePagesStore();
    expect(pagesStore.pages).toHaveLength(1);
    expect(pagesStore.pages[0].name).toBe('Quote');
  });

  it('builds pages for a reminder with QR bill', () => {
    const docsStore = useDocumentsStore();
    docsStore.documents = [
      makeDoc({
        number: 'M-1',
        type: 'reminder',
        outstandingAmount: 100,
        reminderFee: 20,
        lateInterest: 5,
      }),
    ];
    docsStore.activeDocumentNumber = 'M-1';

    const pagesStore = usePagesStore();
    expect(pagesStore.pages).toHaveLength(2);
    expect(pagesStore.pages[0].name).toBe('Reminder');
    expect(pagesStore.pages[1].name).toBe('QRBill');
  });

  it('shows all documents when no active document', () => {
    const docsStore = useDocumentsStore();
    docsStore.documents = [
      makeDoc({ number: 'R-1', type: 'invoice' }),
      makeDoc({ number: 'O-1', type: 'quote' }),
      makeDoc({
        number: 'M-1',
        type: 'reminder',
        outstandingAmount: 0,
        reminderFee: 0,
        lateInterest: 0,
      }),
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
