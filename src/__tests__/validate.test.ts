import { describe, it, expect } from 'vitest';
import { isClient, isDocument, isPosition, isSender } from '@/fs/validate';

const validSender = {
  key: 'default',
  company: 'Acme Consulting',
  street: 'Bahnhofstrasse 1',
  zip: '8001',
  city: 'Zürich',
  country: 'Schweiz',
  email: 'billing@acme.example',
  website: 'https://acme.example',
  uid: 'CHE-000.000.001',
  contact: 'Alex Example',
  contactEmail: 'alex@acme.example',
  accounts: [{ iban: 'CH58...', bank: 'ZKB', bic: 'DEMOCHZZXXX' }],
  invoiceDueDays: 14,
  quoteValidDays: 14,
};

const validClient = {
  customerNumber: '0076',
  company: 'Example Corp',
  name: 'Jane Example',
  street: 'Neunbrunnenstrasse 38',
  zip: '8050',
  city: 'Zürich',
  country: 'Schweiz',
};

const validPosition = {
  id: 'abc12345',
  description: 'Consulting',
  code: '6220',
  unit: 'h',
  defaultPrice: 29,
};

const validDoc = {
  number: 'R-1776124800',
  type: 'invoice',
  status: 'draft',
  subtitle: 'Accessibility',
  customerNumber: '0076',
  sender: {},
  recipient: {},
  meta: {},
  createdAt: '2026-04-14T00:00:00.000Z',
  updatedAt: '2026-04-14T00:00:00.000Z',
};

describe('isSender', () => {
  it('accepts valid sender', () => {
    expect(isSender(validSender)).toBe(true);
  });

  it('rejects missing key', () => {
    const { key: _, ...rest } = validSender;
    expect(isSender(rest)).toBe(false);
  });

  it('rejects empty key', () => {
    expect(isSender({ ...validSender, key: '' })).toBe(false);
  });

  it('rejects missing company', () => {
    const { company: _, ...rest } = validSender;
    expect(isSender(rest)).toBe(false);
  });

  it('rejects non-array accounts', () => {
    expect(isSender({ ...validSender, accounts: {} })).toBe(false);
  });

  it('rejects invalid account shape', () => {
    expect(isSender({ ...validSender, accounts: [{ iban: 'x' }] })).toBe(false);
  });

  it('rejects non-object', () => {
    expect(isSender(null)).toBe(false);
    expect(isSender('string')).toBe(false);
    expect(isSender([])).toBe(false);
  });
});

describe('isClient', () => {
  it('accepts valid client', () => {
    expect(isClient(validClient)).toBe(true);
  });

  it('accepts client with positions array', () => {
    expect(isClient({ ...validClient, positions: [{ positionId: 'p1', price: 100 }] })).toBe(true);
  });

  it('rejects missing customerNumber', () => {
    const { customerNumber: _, ...rest } = validClient;
    expect(isClient(rest)).toBe(false);
  });

  it('rejects empty customerNumber', () => {
    expect(isClient({ ...validClient, customerNumber: '' })).toBe(false);
  });

  it('rejects invalid position entry', () => {
    expect(isClient({ ...validClient, positions: [{ positionId: 'p1' }] })).toBe(false);
  });
});

describe('isPosition', () => {
  it('accepts valid position', () => {
    expect(isPosition(validPosition)).toBe(true);
  });

  it('rejects missing description', () => {
    const { description: _, ...rest } = validPosition;
    expect(isPosition(rest)).toBe(false);
  });

  it('rejects non-numeric defaultPrice', () => {
    expect(isPosition({ ...validPosition, defaultPrice: '29' })).toBe(false);
  });
});

describe('isDocument', () => {
  it('accepts valid document', () => {
    expect(isDocument(validDoc)).toBe(true);
  });

  it('rejects unknown type', () => {
    expect(isDocument({ ...validDoc, type: 'letter' })).toBe(false);
  });

  it('rejects missing number', () => {
    const { number: _, ...rest } = validDoc;
    expect(isDocument(rest)).toBe(false);
  });

  it('rejects non-array lineItems', () => {
    expect(isDocument({ ...validDoc, lineItems: {} })).toBe(false);
  });

  it('accepts valid lineItems', () => {
    expect(isDocument({
      ...validDoc,
      lineItems: [{ pos: 1, description: 'x', code: '', quantity: 1, unit: 'h', unitPrice: 100 }],
    })).toBe(true);
  });

  it('rejects invalid lineItem shape', () => {
    expect(isDocument({
      ...validDoc,
      lineItems: [{ pos: 1, description: 'x' }],
    })).toBe(false);
  });
});
