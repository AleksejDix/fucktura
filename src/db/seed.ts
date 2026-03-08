import { db } from './index';
import type { Sender, Client, Document, Position } from './index';

import senderData from '@/data/sender.json';
import remotion from '@/data/clients/remotion.json';
import propertyCaptain from '@/data/clients/property-captain.json';
import deepcloud from '@/data/clients/deepcloud.json';
import lashandnails from '@/data/clients/lashandnails.json';
import whitebeard from '@/data/clients/whitebeard.json';
import invoiceDoc from '@/data/documents/RE-00110.json';
import offerteDoc from '@/data/documents/OF-00042.json';
import mahnungDoc from '@/data/documents/MH-00001.json';

function now() {
  return new Date().toISOString();
}

export async function seed() {
  const count = await db.senders.count();
  if (count > 0) return; // already seeded

  await db.transaction('rw', [db.senders, db.positions, db.clients, db.documents], async () => {
    await db.senders.add(senderData as Omit<Sender, 'id'>);

    // Global positions catalog
    const globalPositions: Omit<Position, 'id'>[] = [
      { description: 'Cockpit Investoren / Parzellen Betrieb', code: '6220', unit: 'h', defaultPrice: 29 },
      { description: 'Cockpit Investoren / Parzellen Entwicklung', code: '6221', unit: 'h', defaultPrice: 29 },
      { description: 'Cockpit Makler Betrieb', code: '6222', unit: 'h', defaultPrice: 29 },
      { description: 'Cockpit Makler Entwicklung', code: '6223', unit: 'h', defaultPrice: 29 },
      { description: 'Portal Betrieb', code: '6224', unit: 'h', defaultPrice: 29 },
      { description: 'Portal Entwicklung', code: '6225', unit: 'h', defaultPrice: 29 },
      { description: 'VPAT Testing on Windows with NVDA', code: '6300', unit: 'h', defaultPrice: 1200 },
      { description: 'Website creation', code: '', unit: 'Stk', defaultPrice: 1500 },
    ];
    const positionIds = await db.positions.bulkAdd(globalPositions, { allKeys: true });

    // Clients with per-client position pricing
    const clients: Omit<Client, 'id'>[] = [
      {
        ...remotion,
        positions: [
          { positionId: positionIds[6] as number, price: 1200 }, // VPAT Testing
        ],
      },
      propertyCaptain as Omit<Client, 'id'>,
      deepcloud as Omit<Client, 'id'>,
      {
        ...lashandnails,
        positions: [
          { positionId: positionIds[7] as number, price: 1500 }, // Website creation
        ],
      },
      whitebeard as Omit<Client, 'id'>,
    ];

    // Assign PC positions (indices 0-5, all at default 29)
    (clients[1] as Client).positions = positionIds.slice(0, 6).map(id => ({
      positionId: id as number,
      price: 29,
    }));

    const clientIds = await db.clients.bulkAdd(clients, { allKeys: true });

    const remotionId = clientIds[0];
    const pcId = clientIds[1];

    const senderSnapshot = senderData as Omit<import('./index').Sender, 'id'>;

    const documents: Omit<Document, 'id'>[] = [
      {
        type: 'invoice',
        status: 'sent',
        number: `R-${Math.floor(Date.now() / 1000) - 100}`,
        subtitle: invoiceDoc.subtitle,
        clientId: pcId as number,
        sender: { ...senderSnapshot },
        recipient: invoiceDoc.recipient,
        meta: invoiceDoc.meta,
        lineItems: invoiceDoc.lineItems.map(li => ({ ...li, unit: 'h' })),
        createdAt: now(),
        updatedAt: now(),
      },
      {
        type: 'offerte',
        status: 'sent',
        number: `O-${Math.floor(Date.now() / 1000) - 50}`,
        subtitle: offerteDoc.subtitle,
        clientId: pcId as number,
        sender: { ...senderSnapshot },
        recipient: offerteDoc.recipient,
        meta: offerteDoc.meta,
        lineItems: offerteDoc.lineItems.map(li => ({ ...li, unit: 'h' })),
        createdAt: now(),
        updatedAt: now(),
      },
      {
        type: 'offerte',
        status: 'draft',
        number: `O-${Math.floor(Date.now() / 1000)}`,
        subtitle: 'VPAT Testing on Windows with NVDA',
        clientId: remotionId as number,
        sender: { ...senderSnapshot },
        recipient: {
          company: remotion.company,
          name: '',
          street: remotion.street,
          zip: remotion.zip,
          city: remotion.city,
          country: remotion.country,
        },
        meta: {
          datum: '08.03.2026',
          gueltigBis: '07.04.2026',
          ansprechpartner: 'Dix Lidia',
          kundennummer: '000001',
        },
        lineItems: [
          { pos: 1, description: 'VPAT Testing on Windows with NVDA', code: '6300', quantity: 1, unit: 'h', unitPrice: 1200 },
        ],
        createdAt: now(),
        updatedAt: now(),
      },
      {
        type: 'mahnung',
        status: 'sent',
        number: `M-${Math.floor(Date.now() / 1000) - 200}`,
        subtitle: mahnungDoc.subtitle,
        clientId: pcId as number,
        sender: { ...senderSnapshot },
        recipient: mahnungDoc.recipient,
        meta: mahnungDoc.meta,
        stufe: mahnungDoc.stufe,
        offenerBetrag: mahnungDoc.offenerBetrag,
        mahngebuehr: mahnungDoc.mahngebuehr,
        verzugszins: mahnungDoc.verzugszins,
        createdAt: now(),
        updatedAt: now(),
      },
    ];

    await db.documents.bulkAdd(documents);
  });
}
