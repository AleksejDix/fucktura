import { describe, it, expect } from 'vitest';
import senderData from '@/data/sender.json';
import example from '@/data/clients/example.json';
import propertyCaptain from '@/data/clients/sample-ag.json';
import demo from '@/data/clients/demo.json';
import demo-salon from '@/data/clients/demo-salon.json';
import demo-three from '@/data/clients/demo-three.json';
import invoiceDoc from '@/data/documents/RE-00110.json';
import offerteDoc from '@/data/documents/OF-00042.json';
import mahnungDoc from '@/data/documents/MH-00001.json';

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
    { name: 'Example', data: example, expectedKnr: '0076' },
    { name: 'Sample', data: propertyCaptain, expectedKnr: '0005' },
    { name: 'Demo', data: demo, expectedKnr: '0010' },
    { name: 'Demo Salon', data: demo-salon, expectedKnr: '0017' },
    { name: 'Demo Three', data: demo-three, expectedKnr: '0014' },
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

describe('document templates', () => {
  it('RE-00110 is an invoice', () => {
    expect(invoiceDoc.type).toBe('invoice');
    expect(invoiceDoc.number).toBe('RE-00110');
    expect(invoiceDoc.lineItems.length).toBeGreaterThan(0);
  });

  it('OF-00042 is an offerte', () => {
    expect(offerteDoc.type).toBe('offerte');
    expect(offerteDoc.number).toBe('OF-00042');
    expect(offerteDoc.lineItems.length).toBeGreaterThan(0);
  });

  it('MH-00001 is a mahnung', () => {
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
});
