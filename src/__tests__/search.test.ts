import { describe, it, expect } from 'vitest';
import { documentHaystack } from '@/lib/search';
import type { Document, SenderSnapshot } from '@/fs/types';

const sender: SenderSnapshot = {
  company: 'Test',
  street: '',
  zip: '',
  city: '',
  country: '',
  email: '',
  website: '',
  uid: '',
  contact: '',
  contactEmail: '',
  accounts: [],
  invoiceDueDays: 14,
  quoteValidDays: 14,
};

function doc(overrides: Partial<Document> = {}): Document {
  return {
    type: 'invoice',
    status: 'draft',
    number: 'R-42',
    subtitle: 'Accessibility Testing',
    customerNumber: '0076',
    sender,
    recipient: {
      company: 'Example Corp',
      name: 'Jane Example',
      street: '',
      zip: '',
      city: '',
      country: '',
    },
    meta: { date: '', contactPerson: '', customerNumber: '0076' },
    createdAt: '',
    updatedAt: '',
    ...overrides,
  };
}

describe('documentHaystack', () => {
  it('includes number / subtitle / recipient fields lowercased', () => {
    const h = documentHaystack(doc());
    expect(h).toContain('r-42');
    expect(h).toContain('vpat testing');
    expect(h).toContain('example ag');
    expect(h).toContain('jane example');
    expect(h).toContain('0076');
  });

  it('is lowercased for case-insensitive matching', () => {
    const h = documentHaystack(doc({ subtitle: 'SHOUTY CAPS' }));
    expect(h).not.toContain('SHOUTY');
    expect(h).toContain('shouty caps');
  });
});
