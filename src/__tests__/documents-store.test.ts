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
    recipient: {
      company: 'Acme',
      name: 'John',
      street: 'St. 1',
      zip: '1000',
      city: 'Bern',
      country: 'Schweiz',
    },
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
        makeDoc({
          number: 'M-1',
          type: 'mahnung',
          offenerBetrag: 0,
          mahngebuehr: 0,
          verzugszins: 0,
        }),
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

  describe('nextDocument / previousDocument', () => {
    it('moves forward through the list', () => {
      const store = useDocumentsStore();
      store.documents = [
        makeDoc({ number: 'R-1' }),
        makeDoc({ number: 'R-2' }),
        makeDoc({ number: 'R-3' }),
      ];
      store.activeDocumentNumber = 'R-1';
      store.nextDocument();
      expect(store.activeDocumentNumber).toBe('R-2');
      store.nextDocument();
      expect(store.activeDocumentNumber).toBe('R-3');
    });

    it('does not wrap past the end', () => {
      const store = useDocumentsStore();
      store.documents = [makeDoc({ number: 'R-1' }), makeDoc({ number: 'R-2' })];
      store.activeDocumentNumber = 'R-2';
      store.nextDocument();
      expect(store.activeDocumentNumber).toBe('R-2');
    });

    it('moves backward through the list', () => {
      const store = useDocumentsStore();
      store.documents = [
        makeDoc({ number: 'R-1' }),
        makeDoc({ number: 'R-2' }),
        makeDoc({ number: 'R-3' }),
      ];
      store.activeDocumentNumber = 'R-3';
      store.previousDocument();
      expect(store.activeDocumentNumber).toBe('R-2');
    });

    it('does not wrap past the start', () => {
      const store = useDocumentsStore();
      store.documents = [makeDoc({ number: 'R-1' }), makeDoc({ number: 'R-2' })];
      store.activeDocumentNumber = 'R-1';
      store.previousDocument();
      expect(store.activeDocumentNumber).toBe('R-1');
    });

    it('jumps to first doc when none active', () => {
      const store = useDocumentsStore();
      store.documents = [makeDoc({ number: 'R-1' }), makeDoc({ number: 'R-2' })];
      store.activeDocumentNumber = null;
      store.nextDocument();
      expect(store.activeDocumentNumber).toBe('R-1');
    });

    it('is a no-op when no documents', () => {
      const store = useDocumentsStore();
      store.documents = [];
      store.nextDocument();
      store.previousDocument();
      expect(store.activeDocumentNumber).toBeNull();
    });
  });

  describe('isOverdue', () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today.getTime() - 86400000).toISOString();
    const tomorrow = new Date(today.getTime() + 86400000).toISOString();

    it('returns false for paid invoices regardless of date', () => {
      const store = useDocumentsStore();
      const doc = makeDoc({
        type: 'invoice',
        status: 'paid',
        meta: { date: yesterday, contactPerson: '', customerNumber: '', dueDate: yesterday },
      });
      expect(store.isOverdue(doc)).toBe(false);
    });

    it('returns true for unpaid invoice past its due date', () => {
      const store = useDocumentsStore();
      const doc = makeDoc({
        type: 'invoice',
        status: 'sent',
        meta: { date: yesterday, contactPerson: '', customerNumber: '', dueDate: yesterday },
      });
      expect(store.isOverdue(doc)).toBe(true);
    });

    it('returns false for unpaid invoice with future due date', () => {
      const store = useDocumentsStore();
      const doc = makeDoc({
        type: 'invoice',
        status: 'sent',
        meta: {
          date: today.toISOString(),
          contactPerson: '',
          customerNumber: '',
          dueDate: tomorrow,
        },
      });
      expect(store.isOverdue(doc)).toBe(false);
    });

    it('returns false for accepted offers past validUntil', () => {
      const store = useDocumentsStore();
      const doc = makeDoc({
        type: 'offerte',
        status: 'accepted',
        meta: { date: yesterday, contactPerson: '', customerNumber: '', validUntil: yesterday },
      });
      expect(store.isOverdue(doc)).toBe(false);
    });

    it('returns false for rejected offers past validUntil', () => {
      const store = useDocumentsStore();
      const doc = makeDoc({
        type: 'offerte',
        status: 'rejected',
        meta: { date: yesterday, contactPerson: '', customerNumber: '', validUntil: yesterday },
      });
      expect(store.isOverdue(doc)).toBe(false);
    });

    it('returns true for sent offer past validUntil', () => {
      const store = useDocumentsStore();
      const doc = makeDoc({
        type: 'offerte',
        status: 'sent',
        meta: { date: yesterday, contactPerson: '', customerNumber: '', validUntil: yesterday },
      });
      expect(store.isOverdue(doc)).toBe(true);
    });

    it('returns false for mahnung with no overdueSince', () => {
      const store = useDocumentsStore();
      const doc = makeDoc({
        type: 'mahnung',
        status: 'draft',
        meta: { date: yesterday, contactPerson: '', customerNumber: '' },
      });
      expect(store.isOverdue(doc)).toBe(false);
    });

    it('returns false when due date is malformed', () => {
      const store = useDocumentsStore();
      const doc = makeDoc({
        type: 'invoice',
        status: 'sent',
        meta: { date: '', contactPerson: '', customerNumber: '', dueDate: 'not-a-date' },
      });
      expect(store.isOverdue(doc)).toBe(false);
    });

    it('returns false for quittung (no due concept)', () => {
      const store = useDocumentsStore();
      const doc = makeDoc({ type: 'quittung', status: 'paid' });
      expect(store.isOverdue(doc)).toBe(false);
    });
  });

  describe('filtered views', () => {
    function seed(store: ReturnType<typeof useDocumentsStore>) {
      store.senders = [
        makeSender('dix', { company: 'Acme Consulting', uid: 'CHE-1' }),
        makeSender('gs', { company: 'Demo Studio', uid: 'DE-1' }),
      ];
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const yesterday = new Date(today.getTime() - 86400000).toISOString();
      const tomorrow = new Date(today.getTime() + 86400000).toISOString();
      store.documents = [
        makeDoc({ number: 'R-1', type: 'invoice', status: 'draft', senderKey: 'dix' }),
        makeDoc({
          number: 'R-2',
          type: 'invoice',
          status: 'sent',
          senderKey: 'dix',
          meta: { date: yesterday, contactPerson: '', customerNumber: '', dueDate: yesterday },
        }),
        makeDoc({
          number: 'R-3',
          type: 'invoice',
          status: 'paid',
          senderKey: 'gs',
          meta: { date: yesterday, contactPerson: '', customerNumber: '', dueDate: yesterday },
        }),
        makeDoc({
          number: 'O-1',
          type: 'offerte',
          status: 'draft',
          senderKey: 'gs',
          meta: {
            date: today.toISOString(),
            contactPerson: '',
            customerNumber: '',
            validUntil: tomorrow,
          },
        }),
        makeDoc({ number: 'Q-1', type: 'quittung', status: 'paid', senderKey: 'dix' }),
      ];
    }

    it('"all" view returns every document', () => {
      const store = useDocumentsStore();
      seed(store);
      store.setView('all');
      expect(store.filteredDocuments.map((d) => d.number)).toHaveLength(5);
    });

    it('"drafts" view returns only draft-status docs', () => {
      const store = useDocumentsStore();
      seed(store);
      store.setView('drafts');
      expect(store.filteredDocuments.map((d) => d.number).sort()).toEqual(['O-1', 'R-1']);
    });

    it('"overdue" view returns unpaid invoice past its due date', () => {
      const store = useDocumentsStore();
      seed(store);
      store.setView('overdue');
      expect(store.filteredDocuments.map((d) => d.number)).toEqual(['R-2']);
    });

    it('"unpaid" view returns non-paid invoices only', () => {
      const store = useDocumentsStore();
      seed(store);
      store.setView('unpaid');
      expect(store.filteredDocuments.map((d) => d.number).sort()).toEqual(['R-1', 'R-2']);
    });

    it('type view returns docs of that type', () => {
      const store = useDocumentsStore();
      seed(store);
      store.setView('type:offerte');
      expect(store.filteredDocuments.map((d) => d.number)).toEqual(['O-1']);
    });

    it('sender view returns docs for that sender key', () => {
      const store = useDocumentsStore();
      seed(store);
      store.setView('sender:gs');
      expect(store.filteredDocuments.map((d) => d.number).sort()).toEqual(['O-1', 'R-3']);
    });

    it('status pill narrows the view further', () => {
      const store = useDocumentsStore();
      seed(store);
      store.setView('type:invoice');
      store.activeStatusPill = 'paid';
      expect(store.filteredDocuments.map((d) => d.number)).toEqual(['R-3']);
    });

    it('quick search filters by subtitle / number / recipient', () => {
      const store = useDocumentsStore();
      seed(store);
      store.documents = store.documents.map((d) =>
        d.number === 'R-1' ? { ...d, subtitle: 'Accessibility Testing' } : d,
      );
      store.setView('all');
      store.quickSearch = 'vpat';
      expect(store.filteredDocuments.map((d) => d.number)).toEqual(['R-1']);
    });

    it('viewCount reports correct totals', () => {
      const store = useDocumentsStore();
      seed(store);
      expect(store.viewCount('all')).toBe(5);
      expect(store.viewCount('drafts')).toBe(2);
      expect(store.viewCount('unpaid')).toBe(2);
      expect(store.viewCount('overdue')).toBe(1);
      expect(store.viewCount('type:invoice')).toBe(3);
      expect(store.viewCount('sender:dix')).toBe(3);
    });
  });

  describe('setView', () => {
    it('selecting a sender view sets activeSenderKey', () => {
      const store = useDocumentsStore();
      store.senders = [makeSender('dix'), makeSender('gs')];
      store.setView('sender:gs');
      expect(store.activeSenderKey).toBe('gs');
    });

    it('selecting a non-sender view does not reset activeSenderKey', () => {
      const store = useDocumentsStore();
      store.activeSenderKey = 'dix';
      store.setView('drafts');
      expect(store.activeSenderKey).toBe('dix');
    });

    it('clears any active status pill', () => {
      const store = useDocumentsStore();
      store.activeStatusPill = 'paid';
      store.setView('type:invoice');
      expect(store.activeStatusPill).toBeNull();
    });
  });

  describe('resolveSenderKey', () => {
    it('returns stored senderKey when present', () => {
      const store = useDocumentsStore();
      store.senders = [makeSender('dix')];
      const doc = makeDoc({ senderKey: 'dix' });
      expect(store.resolveSenderKey(doc)).toBe('dix');
    });

    it('falls back to matching company + uid on legacy docs without senderKey', () => {
      const store = useDocumentsStore();
      store.senders = [
        makeSender('dix', { company: 'Acme Consulting', uid: 'CHE-1' }),
        makeSender('gs', { company: 'Demo Studio', uid: 'DE-1' }),
      ];
      const legacy = makeDoc({
        sender: { ...fakeSenderSnap, company: 'Demo Studio', uid: 'DE-1' },
      });
      delete (legacy as Partial<Document>).senderKey;
      expect(store.resolveSenderKey(legacy)).toBe('gs');
    });

    it('returns null when no sender matches', () => {
      const store = useDocumentsStore();
      store.senders = [makeSender('dix', { company: 'Dix', uid: 'A' })];
      const doc = makeDoc({ sender: { ...fakeSenderSnap, company: 'Unknown', uid: 'Z' } });
      delete (doc as Partial<Document>).senderKey;
      expect(store.resolveSenderKey(doc)).toBeNull();
    });
  });
});
