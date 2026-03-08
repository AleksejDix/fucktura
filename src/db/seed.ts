import { db } from './index';
import type { Sender, Client, Document } from './index';

import senderData from '@/data/sender.json';
import remotion from '@/data/clients/remotion.json';
import propertyCaptain from '@/data/clients/property-captain.json';
import deepcloud from '@/data/clients/deepcloud.json';
import lashandnails from '@/data/clients/lashandnails.json';
import whitebeard from '@/data/clients/whitebeard.json';
import invoiceDoc from '@/data/documents/RE-00110.json';
import offerteDoc from '@/data/documents/OF-00042.json';
import mahnungDoc from '@/data/documents/MH-00001.json';

const clients: Omit<Client, 'id'>[] = [
  remotion,
  propertyCaptain,
  deepcloud,
  lashandnails,
  whitebeard,
];

function now() {
  return new Date().toISOString();
}

export async function seed() {
  const count = await db.senders.count();
  if (count > 0) return; // already seeded

  await db.transaction('rw', [db.senders, db.clients, db.documents], async () => {
    await db.senders.add(senderData as Omit<Sender, 'id'>);

    const clientIds = await db.clients.bulkAdd(clients, { allKeys: true });

    const remotionId = clientIds[0]; // index 0 = remotion
    const pcId = clientIds[1]; // index 1 = propertyCaptain

    const senderSnapshot = senderData as Omit<import('./index').Sender, 'id'>;

    const documents: Omit<Document, 'id'>[] = [
      {
        type: 'invoice',
        status: 'sent',
        number: invoiceDoc.number,
        subtitle: invoiceDoc.subtitle,
        clientId: pcId as number,
        sender: { ...senderSnapshot },
        recipient: invoiceDoc.recipient,
        meta: invoiceDoc.meta,
        lineItems: invoiceDoc.lineItems,
        createdAt: now(),
        updatedAt: now(),
      },
      {
        type: 'offerte',
        status: 'sent',
        number: offerteDoc.number,
        subtitle: offerteDoc.subtitle,
        clientId: pcId as number,
        sender: { ...senderSnapshot },
        recipient: offerteDoc.recipient,
        meta: offerteDoc.meta,
        lineItems: offerteDoc.lineItems,
        createdAt: now(),
        updatedAt: now(),
      },
      {
        type: 'offerte',
        status: 'draft',
        number: 'OF-00043',
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
          { pos: 1, description: 'VPAT Testing on Windows with NVDA', code: '6300', quantity: 1, unitPrice: 1200 },
        ],
        createdAt: now(),
        updatedAt: now(),
      },
      {
        type: 'mahnung',
        status: 'sent',
        number: mahnungDoc.number,
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
