import { describe, expect, it } from 'vitest';
import { emailBody, emailSubject } from '@/emails';
import type { Document } from '@/fs/types';

const sender = {
  company: 'Dix Consulting',
  contact: 'Lidia Dix',
  email: 'invoice@dix.consulting',
  accounts: [{ iban: 'CH93 0076 2011 6238 5295 7', bank: '', bic: '' }],
} as unknown as Document['sender'];

function doc(overrides: Partial<Document>): Document {
  return {
    number: 'R-100',
    type: 'invoice',
    status: 'sent',
    subtitle: 'Juli 2026 - Testing',
    customerNumber: '0005',
    sender,
    recipient: {
      company: 'Acme AG',
      name: 'Frau Muster',
      street: '',
      zip: '',
      city: '',
      country: 'Schweiz',
    },
    meta: {
      date: '2026-08-08T00:00:00.000Z',
      dueDate: '2026-08-22T00:00:00.000Z',
      contactPerson: 'Lidia Dix',
      customerNumber: '0005',
    },
    lineItems: [{ pos: 1, description: 'Work', code: '', quantity: 10, unit: 'h', unitPrice: 29 }],
    createdAt: '2026-08-08',
    updatedAt: '2026-08-08',
    ...overrides,
  };
}

const reminder = doc({
  number: 'M-555',
  type: 'reminder',
  subtitle: '1. Mahnung zur Rechnung R-100',
  relatedInvoice: 'R-100',
  meta: {
    date: '2026-08-10T00:00:00.000Z',
    dueDate: '2026-08-24T00:00:00.000Z',
    invoiceDate: '2026-07-03T00:00:00.000Z',
    overdueSince: '2026-07-17T00:00:00.000Z',
    contactPerson: 'Lidia Dix',
    customerNumber: '0005',
  },
  lineItems: undefined,
  outstandingAmount: 4408,
  reminderFee: 20,
  lateInterest: 14.49,
});

const LOCALES = ['de', 'en', 'es', 'nl', 'ru'];

describe('emailBody', () => {
  it('reminders reference the dunned invoice, never their own number', () => {
    for (const locale of LOCALES) {
      const body = emailBody(reminder, locale);
      expect(body, locale).toContain('R-100');
      expect(body, locale).not.toContain('M-555');
    }
  });

  it('reminder total includes fee and interest', () => {
    const body = emailBody(reminder, 'de');
    expect(body).toContain('4’442.49');
    expect(body).toContain('17.07.2026');
  });

  it('invoice bodies carry number, line-item total and signature', () => {
    const body = emailBody(doc({}), 'de');
    expect(body).toContain('R-100');
    expect(body).toContain('CHF 290.00');
    expect(body).toContain('Lidia Dix\nDix Consulting\ninvoice@dix.consulting');
  });

  it('derives EUR from a non-Swiss IBAN', () => {
    const eurSender = {
      ...sender,
      accounts: [{ iban: 'DE89 3704 0044 0532 0130 00', bank: '', bic: '' }],
    };
    const body = emailBody(doc({ sender: eurSender as Document['sender'] }), 'de');
    expect(body).toContain('EUR 290.00');
  });

  it('renders every locale and type with the recipient name', () => {
    const types: Document['type'][] = ['quote', 'invoice', 'receipt'];
    for (const locale of LOCALES) {
      for (const type of types) {
        const body = emailBody(doc({ type }), locale);
        expect(body.length, `${locale}/${type}`).toBeGreaterThan(50);
        expect(body, `${locale}/${type}`).toContain('Frau Muster');
      }
      expect(emailBody(reminder, locale)).toContain('Frau Muster');
    }
  });

  it('falls back to English for locales without email messages', () => {
    // fr/it are stub catalogs; vue-i18n falls back to en per fallbackLocale.
    expect(emailBody(doc({}), 'fr')).toContain('Please find attached our invoice');
  });
});

describe('emailSubject', () => {
  it('uses the subtitle alone for reminders', () => {
    expect(emailSubject(reminder, 'Mahnung')).toBe('1. Mahnung zur Rechnung R-100');
  });

  it('combines label, number and subtitle for invoices', () => {
    expect(emailSubject(doc({}), 'Rechnung')).toBe('Rechnung R-100 – Juli 2026 - Testing');
  });

  it('omits the dash when there is no subtitle', () => {
    expect(emailSubject(doc({ subtitle: '' }), 'Rechnung')).toBe('Rechnung R-100');
  });
});
