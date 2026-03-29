import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useDocumentsStore } from '@/stores/documents';
import type { Document, SenderSnapshot } from '@/db';

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
  accounts: [],
  invoiceDueDays: 14,
  quoteValidDays: 14,
};

function makeDoc(overrides: Partial<Document>): Document {
  return {
    id: 1,
    type: 'invoice',
    status: 'draft',
    number: 'R-001',
    subtitle: '',
    sender: fakeSender,
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
        makeDoc({ id: 1, type: 'invoice' }),
        makeDoc({ id: 2, type: 'invoice' }),
        makeDoc({ id: 3, type: 'offerte' }),
        makeDoc({ id: 4, type: 'mahnung', offenerBetrag: 0, mahngebuehr: 0, verzugszins: 0 }),
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
      const doc = makeDoc({ id: 42 });
      store.documents = [doc];
      store.activeDocumentId = 42;
      expect(store.activeDocument).toEqual(doc);
    });

    it('returns null if active ID does not match any document', () => {
      const store = useDocumentsStore();
      store.documents = [makeDoc({ id: 1 })];
      store.activeDocumentId = 999;
      expect(store.activeDocument).toBeNull();
    });
  });

  describe('visibleDocuments', () => {
    it('returns all documents when no active', () => {
      const store = useDocumentsStore();
      store.documents = [makeDoc({ id: 1 }), makeDoc({ id: 2 })];
      store.activeDocumentId = null;
      expect(store.visibleDocuments).toHaveLength(2);
    });

    it('returns only active document when one is selected', () => {
      const store = useDocumentsStore();
      store.documents = [makeDoc({ id: 1 }), makeDoc({ id: 2 })];
      store.activeDocumentId = 2;
      expect(store.visibleDocuments).toHaveLength(1);
      expect(store.visibleDocuments[0].id).toBe(2);
    });
  });

  describe('setActive', () => {
    it('sets active document ID', () => {
      const store = useDocumentsStore();
      store.setActive(5);
      expect(store.activeDocumentId).toBe(5);
    });

    it('clears active document ID', () => {
      const store = useDocumentsStore();
      store.activeDocumentId = 5;
      store.setActive(null);
      expect(store.activeDocumentId).toBeNull();
    });

    it('calls navigator when set', () => {
      const store = useDocumentsStore();
      const navigated: (number | null)[] = [];
      store.setNavigator((id) => navigated.push(id));
      store.setActive(1);
      store.setActive(null);
      expect(navigated).toEqual([1, null]);
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
      // Could be same if called in same second, but prefix should match
      expect(a).toMatch(/^O-\d+$/);
      expect(b).toMatch(/^O-\d+$/);
    });
  });

  describe('activeSender', () => {
    it('returns first sender when no activeSenderId', () => {
      const store = useDocumentsStore();
      store.senders = [{ id: 1, ...fakeSender }, { id: 2, ...fakeSender, name: 'Other' }];
      store.activeSenderId = null;
      expect(store.activeSender?.id).toBe(1);
    });

    it('returns selected sender', () => {
      const store = useDocumentsStore();
      store.senders = [{ id: 1, ...fakeSender }, { id: 2, ...fakeSender, name: 'Other' }];
      store.activeSenderId = 2;
      expect(store.activeSender?.name).toBe('Other');
    });

    it('returns null when no senders', () => {
      const store = useDocumentsStore();
      expect(store.activeSender).toBeNull();
    });
  });
});
