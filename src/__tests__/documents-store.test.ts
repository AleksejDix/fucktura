import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useDocumentsStore } from '@/stores/documents';
import type { Document, Sender, SenderSnapshot } from '@/fs/types';

const fakeSenderSnap: SenderSnapshot = {
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
  accounts: [],
  invoiceDueDays: 14,
  quoteValidDays: 14,
};

function makeSender(key: string, overrides: Partial<Sender> = {}): Sender {
  return { key, ...fakeSenderSnap, ...overrides };
}

function makeDoc(overrides: Partial<Document>): Document {
  return {
    type: 'invoice',
    status: 'draft',
    number: 'R-001',
    subtitle: '',
    customerNumber: '0001',
    sender: fakeSenderSnap,
    recipient: { company: 'Acme', name: 'John', street: 'St. 1', zip: '1000', city: 'Bern', country: 'Schweiz' },
    meta: { date: '2026-01-01T00:00:00.000Z', contactPerson: 'Test', customerNumber: '0001' },
    lineItems: [{ pos: 1, description: 'Work', code: '', quantity: 10, unit: 'h', unitPrice: 100 }],
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('useDocumentsStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  describe('grouped', () => {
    it('groups documents by type', () => {
      const store = useDocumentsStore();
      store.documents = [
        makeDoc({ number: 'R-1', type: 'invoice' }),
        makeDoc({ number: 'R-2', type: 'invoice' }),
        makeDoc({ number: 'O-1', type: 'offerte' }),
        makeDoc({ number: 'M-1', type: 'mahnung', offenerBetrag: 0, mahngebuehr: 0, verzugszins: 0 }),
      ];

      expect(store.grouped.invoice).toHaveLength(2);
      expect(store.grouped.offerte).toHaveLength(1);
      expect(store.grouped.mahnung).toHaveLength(1);
    });

    it('returns empty arrays when no documents', () => {
      const store = useDocumentsStore();
      expect(store.grouped.invoice).toHaveLength(0);
      expect(store.grouped.offerte).toHaveLength(0);
      expect(store.grouped.mahnung).toHaveLength(0);
    });
  });

  describe('activeDocument', () => {
    it('returns null when no active document', () => {
      const store = useDocumentsStore();
      expect(store.activeDocument).toBeNull();
    });

    it('returns the active document', () => {
      const store = useDocumentsStore();
      const doc = makeDoc({ number: 'R-42' });
      store.documents = [doc];
      store.activeDocumentNumber = 'R-42';
      expect(store.activeDocument).toEqual(doc);
    });

    it('returns null if active number does not match any document', () => {
      const store = useDocumentsStore();
      store.documents = [makeDoc({ number: 'R-1' })];
      store.activeDocumentNumber = 'R-999';
      expect(store.activeDocument).toBeNull();
    });
  });

  describe('visibleDocuments', () => {
    it('returns all documents when no active', () => {
      const store = useDocumentsStore();
      store.documents = [makeDoc({ number: 'R-1' }), makeDoc({ number: 'R-2' })];
      store.activeDocumentNumber = null;
      expect(store.visibleDocuments).toHaveLength(2);
    });

    it('returns only active document when one is selected', () => {
      const store = useDocumentsStore();
      store.documents = [makeDoc({ number: 'R-1' }), makeDoc({ number: 'R-2' })];
      store.activeDocumentNumber = 'R-2';
      expect(store.visibleDocuments).toHaveLength(1);
      expect(store.visibleDocuments[0].number).toBe('R-2');
    });
  });

  describe('setActive', () => {
    it('sets active document number', () => {
      const store = useDocumentsStore();
      store.setActive('R-5');
      expect(store.activeDocumentNumber).toBe('R-5');
    });

    it('clears active document number', () => {
      const store = useDocumentsStore();
      store.activeDocumentNumber = 'R-5';
      store.setActive(null);
      expect(store.activeDocumentNumber).toBeNull();
    });

    it('calls navigator when set', () => {
      const store = useDocumentsStore();
      const navigated: (string | null)[] = [];
      store.setNavigator((num) => navigated.push(num));
      store.setActive('R-1');
      store.setActive(null);
      expect(navigated).toEqual(['R-1', null]);
    });
  });

  describe('generateNumber', () => {
    it('generates number with prefix', () => {
      const store = useDocumentsStore();
      const num = store.generateNumber('R');
      expect(num).toMatch(/^R-\d+$/);
    });

    it('generates unique numbers', () => {
      const store = useDocumentsStore();
      const a = store.generateNumber('O');
      const b = store.generateNumber('O');
      expect(a).toMatch(/^O-\d+$/);
      expect(b).toMatch(/^O-\d+$/);
    });
  });

  describe('activeSender', () => {
    it('returns first sender when no activeSenderKey', () => {
      const store = useDocumentsStore();
      store.senders = [makeSender('a'), makeSender('b', { company: 'Other' })];
      store.activeSenderKey = null;
      expect(store.activeSender?.key).toBe('a');
    });

    it('returns selected sender', () => {
      const store = useDocumentsStore();
      store.senders = [makeSender('a'), makeSender('b', { company: 'Other' })];
      store.activeSenderKey = 'b';
      expect(store.activeSender?.company).toBe('Other');
    });

    it('returns null when no senders', () => {
      const store = useDocumentsStore();
      expect(store.activeSender).toBeNull();
    });
  });
});
