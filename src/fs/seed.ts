import { nanoid } from 'nanoid';
import * as repo from './repo';
import type { Client, ClientPosition, Document, Position, Sender, SenderSnapshot } from './types';
import { defaultUnitForType } from '@/lib/documents';

interface RawSender extends Sender {}

interface RawClient extends Omit<Client, 'positions'> {
  pricedPositions?: { description: string; price: number }[];
}

interface RawDocument {
  type: Document['type'];
  number: string;
  status: Document['status'];
  clientNumber: string;
  senderKey: string;
  subtitle: string;
  recipient: Document['recipient'];
  meta: Document['meta'];
  lineItems?: Document['lineItems'];
  notes?: string;
  stufe?: number;
  offenerBetrag?: number;
  mahngebuehr?: number;
  verzugszins?: number;
}

const bundledSenders = import.meta.glob('@/data/senders/*.json', {
  eager: true,
  import: 'default',
}) as Record<string, RawSender>;

const bundledClients = import.meta.glob('@/data/clients/*.json', {
  eager: true,
  import: 'default',
}) as Record<string, RawClient>;

const bundledDocuments = import.meta.glob('@/data/documents/*.json', {
  eager: true,
  import: 'default',
}) as Record<string, RawDocument>;

const globalPositionsCatalog: Omit<Position, 'id'>[] = [
  { description: 'Consulting', code: '6220', unit: 'h', defaultPrice: 29 },
  { description: 'Consulting', code: '6221', unit: 'h', defaultPrice: 29 },
  { description: 'Consulting', code: '6222', unit: 'h', defaultPrice: 29 },
  { description: 'Consulting', code: '6223', unit: 'h', defaultPrice: 29 },
  { description: 'Consulting', code: '6224', unit: 'h', defaultPrice: 29 },
  { description: 'Consulting', code: '6225', unit: 'h', defaultPrice: 29 },
  { description: 'Accessibility Testing', code: '6300', unit: 'h', defaultPrice: 1200 },
  { description: 'Website creation', code: '', unit: 'Stk', defaultPrice: 1500 },
  { description: 'Demo E2E Consulting', code: '', unit: 'h', defaultPrice: 40 },
];

function toSnapshot(s: Sender): SenderSnapshot {
  const { key: _, ...snap } = s;
  return snap;
}

export async function seedFromBundled(): Promise<void> {
  const now = new Date().toISOString();

  // 1. Senders
  const senders: Sender[] = Object.values(bundledSenders);
  const senderByKey = new Map<string, Sender>();
  for (const s of senders) {
    senderByKey.set(s.key, s);
    await repo.writeSender(s);
  }

  // 2. Positions catalog — assign nanoid
  const positions: Position[] = globalPositionsCatalog.map(p => ({ id: nanoid(8), ...p }));
  const positionIdByDescription = new Map<string, string>();
  positions.forEach(p => positionIdByDescription.set(p.description, p.id));
  await repo.writePositions(positions);

  // 3. Clients — resolve pricedPositions to position ids
  for (const raw of Object.values(bundledClients)) {
    const { pricedPositions, ...base } = raw;
    const clientPositions: ClientPosition[] | undefined = pricedPositions?.map(pp => {
      const positionId = positionIdByDescription.get(pp.description);
      if (!positionId) {
        throw new Error(`Unknown position description "${pp.description}" on client ${base.customerNumber}`);
      }
      return { positionId, price: pp.price };
    });
    const client: Client = clientPositions ? { ...base, positions: clientPositions } : base;
    await repo.writeClient(client);
  }

  // 4. Documents — inline sender snapshot, rename clientNumber → customerNumber
  for (const raw of Object.values(bundledDocuments)) {
    const sender = senderByKey.get(raw.senderKey);
    if (!sender) throw new Error(`Document ${raw.number}: unknown senderKey "${raw.senderKey}"`);
    const defaultUnit = defaultUnitForType(raw.type);
    const lineItems = raw.lineItems?.map(li => ({ ...li, unit: li.unit ?? defaultUnit }));
    const doc: Document = {
      number: raw.number,
      type: raw.type,
      status: raw.status,
      subtitle: raw.subtitle,
      customerNumber: raw.clientNumber,
      sender: toSnapshot(sender),
      recipient: raw.recipient,
      meta: raw.meta,
      lineItems,
      stufe: raw.stufe,
      offenerBetrag: raw.offenerBetrag,
      mahngebuehr: raw.mahngebuehr,
      verzugszins: raw.verzugszins,
      createdAt: now,
      updatedAt: now,
    };
    await repo.writeDocument(doc);
  }
}
