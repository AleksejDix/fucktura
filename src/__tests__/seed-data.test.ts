import { describe, it, expect } from 'vitest';
import senderData from '@/data/senders/default.json';
import exampleCorp from '@/data/clients/example-corp.json';
import demoInc from '@/data/clients/demo-inc.json';
import invoiceDoc from '@/data/documents/R-1000000000.json';
import offerteDoc from '@/data/documents/O-1000000000.json';
import mahnungDoc from '@/data/documents/M-1000000000.json';

describe('sender data', () => {
  it('has required fields', () => {
    expect(senderData.company).toBeTruthy();
    expect(senderData.street).toBeTruthy();
    expect(senderData.zip).toBeTruthy();
    expect(senderData.city).toBeTruthy();
    expect(senderData.email).toBeTruthy();
    expect(senderData.uid).toBeTruthy();
  });

  it('has payment terms', () => {
    expect(senderData.invoiceDueDays).toBeGreaterThan(0);
    expect(senderData.quoteValidDays).toBeGreaterThan(0);
  });

  it('has at least one bank account', () => {
    expect(senderData.accounts.length).toBeGreaterThan(0);
    expect(senderData.accounts[0].iban).toBeTruthy();
    expect(senderData.accounts[0].bank).toBeTruthy();
  });
});

describe('client data', () => {
  const clients = [
    { name: 'Example Corp', data: exampleCorp, expectedKnr: '0001' },
    { name: 'Demo Inc', data: demoInc, expectedKnr: '0002' },
  ];

  for (const client of clients) {
    describe(client.name, () => {
      it('has required fields', () => {
        expect(client.data.company).toBeTruthy();
        expect(client.data.street).toBeTruthy();
        expect(client.data.zip).toBeTruthy();
        expect(client.data.city).toBeTruthy();
        expect(client.data.country).toBeTruthy();
      });

      it('has correct customerNumber', () => {
        expect(client.data.customerNumber).toBe(client.expectedKnr);
      });

      it('has email', () => {
        expect(client.data.email).toBeTruthy();
        expect(client.data.email).toContain('@');
      });
    });
  }
});

describe('document data', () => {
  it('R-1000000000 is an invoice', () => {
    expect(invoiceDoc.type).toBe('invoice');
    expect(invoiceDoc.number).toBe('R-1000000000');
    expect(invoiceDoc.lineItems.length).toBeGreaterThan(0);
  });

  it('O-1000000000 is an offerte', () => {
    expect(offerteDoc.type).toBe('offerte');
    expect(offerteDoc.number).toBe('O-1000000000');
    expect(offerteDoc.lineItems.length).toBeGreaterThan(0);
  });

  it('M-1000000000 is a mahnung', () => {
    expect(mahnungDoc.type).toBe('mahnung');
    expect(mahnungDoc.stufe).toBeGreaterThanOrEqual(1);
  });

  it('all documents have consistent contactPerson', () => {
    const contact = senderData.contact;
    expect(invoiceDoc.meta.contactPerson).toBe(contact);
    expect(offerteDoc.meta.contactPerson).toBe(contact);
    expect(mahnungDoc.meta.contactPerson).toBe(contact);
  });

  it('all document recipients have email', () => {
    expect(invoiceDoc.recipient.email).toBeTruthy();
    expect(offerteDoc.recipient.email).toBeTruthy();
    expect(mahnungDoc.recipient.email).toBeTruthy();
  });

  it('all documents have clientNumber and senderKey', () => {
    expect(invoiceDoc.clientNumber).toBeTruthy();
    expect(invoiceDoc.senderKey).toBeTruthy();
    expect(offerteDoc.clientNumber).toBeTruthy();
    expect(offerteDoc.senderKey).toBeTruthy();
    expect(mahnungDoc.clientNumber).toBeTruthy();
    expect(mahnungDoc.senderKey).toBeTruthy();
  });
});
