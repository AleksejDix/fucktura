import Dexie, { type EntityTable } from 'dexie';

export interface Account {
  iban: string;
  bank: string;
  bic: string;
}

export interface Sender {
  id?: number;
  name: string;
  street: string;
  zip: string;
  city: string;
  email: string;
  website: string;
  uid: string;
  contact: string;
  contactEmail: string;
  accounts: Account[];
}

export interface Position {
  id?: number;
  description: string;
  code: string;
  unit: string;
  defaultPrice: number;
}

export interface ClientPosition {
  positionId: number;
  price: number;
}

export interface Client {
  id?: number;
  company: string;
  name?: string;
  street: string;
  zip: string;
  city: string;
  country: string;
  email?: string;
  positions?: ClientPosition[];
}

export interface LineItem {
  pos: number;
  description: string;
  code: string;
  quantity: number;
  unit: string;
  unitPrice: number;
}

export interface Recipient {
  company: string;
  name: string;
  street: string;
  zip: string;
  city: string;
  country: string;
}

export interface DocumentMeta {
  datum: string;
  zahlbarBis?: string;
  gueltigBis?: string;
  rechnungsDatum?: string;
  faelligSeit?: string;
  ansprechpartner: string;
  kundennummer: string;
}

export type SenderSnapshot = Omit<Sender, 'id'>;

export type OfferteStatus = 'draft' | 'sent' | 'accepted' | 'rejected';
export type InvoiceStatus = 'draft' | 'sent' | 'paid';
export type MahnungStatus = 'draft' | 'sent';
export type DocumentStatus = OfferteStatus | InvoiceStatus | MahnungStatus;

export interface Document {
  id?: number;
  type: 'invoice' | 'offerte' | 'mahnung';
  status: DocumentStatus;
  number: string;
  subtitle: string;
  clientId?: number;
  sender: SenderSnapshot;
  recipient: Recipient;
  meta: DocumentMeta;
  lineItems?: LineItem[];
  // Mahnung-specific
  stufe?: number;
  offenerBetrag?: number;
  mahngebuehr?: number;
  verzugszins?: number;
  createdAt: string;
  updatedAt: string;
}

const db = new Dexie('Fucktura') as Dexie & {
  senders: EntityTable<Sender, 'id'>;
  positions: EntityTable<Position, 'id'>;
  clients: EntityTable<Client, 'id'>;
  documents: EntityTable<Document, 'id'>;
};

db.version(2).stores({
  senders: '++id, name',
  clients: '++id, company, zip',
  documents: '++id, type, number, clientId, createdAt',
}).upgrade(async (tx) => {
  await tx.table('senders').clear();
  await tx.table('clients').clear();
  await tx.table('documents').clear();
});

db.version(3).stores({
  senders: '++id, name',
  clients: '++id, company, zip',
  documents: '++id, type, number, clientId, createdAt',
}).upgrade(async (tx) => {
  const senders = await tx.table('senders').toArray();
  const sender = senders[0];
  if (!sender) return;
  const { id: _, ...snapshot } = sender;
  await tx.table('documents').toCollection().modify((doc: Record<string, unknown>) => {
    if (!doc.sender) {
      doc.sender = snapshot;
    }
  });
});

db.version(4).stores({
  senders: '++id, name',
  clients: '++id, company, zip',
  documents: '++id, type, status, number, clientId, createdAt',
}).upgrade(async (tx) => {
  await tx.table('documents').toCollection().modify((doc: Record<string, unknown>) => {
    if (!doc.status) {
      doc.status = 'draft';
    }
  });
});

db.version(5).stores({
  senders: '++id, name',
  positions: '++id, description, code',
  clients: '++id, company, zip',
  documents: '++id, type, status, number, clientId, createdAt',
});

export { db };
