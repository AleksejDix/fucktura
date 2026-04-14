import * as repo from './repo';
import type { Client, ClientPosition, Document, Position, Sender, SenderSnapshot } from './types';

const LEGACY_DB = 'Fucktura';
const STORES = ['senders', 'clients', 'positions', 'documents'] as const;

interface LegacySender {
  id: number;
  company: string;
  street: string;
  zip: string;
  city: string;
  country: string;
  email?: string;
  website: string;
  uid: string;
  contact: string;
  contactEmail: string;
  accounts: { iban: string; bank: string; bic: string }[];
  invoiceDueDays: number;
  quoteValidDays: number;
}

interface LegacyPosition {
  id: number;
  description: string;
  code: string;
  unit: string;
  defaultPrice: number;
}

interface LegacyClient {
  id: number;
  customerNumber: string;
  company: string;
  name?: string;
  street: string;
  zip: string;
  city: string;
  country: string;
  email?: string;
  positions?: { positionId: number; price: number }[];
}

interface LegacyDocument {
  id: number;
  type: Document['type'];
  status: Document['status'];
  number: string;
  subtitle: string;
  clientId?: number;
  sender: SenderSnapshot;
  recipient: Document['recipient'];
  meta: Document['meta'];
  lineItems?: Document['lineItems'];
  stufe?: number;
  offenerBetrag?: number;
  mahngebuehr?: number;
  verzugszins?: number;
  createdAt: string;
  updatedAt: string;
}

function openLegacy(): Promise<IDBDatabase | null> {
  return new Promise((resolve) => {
    const req = indexedDB.open(LEGACY_DB);
    req.onupgradeneeded = () => {
      // If the DB did not exist, upgrade will fire at version 1 with no stores — abort.
      req.transaction?.abort();
      resolve(null);
    };
    req.onsuccess = () => {
      const db = req.result;
      const allPresent = STORES.every((s) => db.objectStoreNames.contains(s));
      if (!allPresent) {
        db.close();
        resolve(null);
        return;
      }
      resolve(db);
    };
    req.onerror = () => resolve(null);
    req.onblocked = () => resolve(null);
  });
}

function readAll<T>(db: IDBDatabase, store: string): Promise<T[]> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, 'readonly');
    const req = tx.objectStore(store).getAll();
    req.onsuccess = () => resolve(req.result as T[]);
    req.onerror = () => reject(req.error);
  });
}

/** If a legacy Dexie DB exists with data, export everything into the picked folder. */
export async function tryMigrateFromLegacy(): Promise<boolean> {
  const db = await openLegacy();
  if (!db) return false;

  const [legacySenders, legacyPositions, legacyClients, legacyDocuments] = await Promise.all([
    readAll<LegacySender>(db, 'senders'),
    readAll<LegacyPosition>(db, 'positions'),
    readAll<LegacyClient>(db, 'clients'),
    readAll<LegacyDocument>(db, 'documents'),
  ]);
  db.close();

  if (
    legacySenders.length === 0 &&
    legacyPositions.length === 0 &&
    legacyClients.length === 0 &&
    legacyDocuments.length === 0
  ) {
    return false;
  }

  // Senders: numeric id → stable key. First sender becomes "default".
  const senderKeyById = new Map<number, string>();
  const senders: Sender[] = legacySenders.map((s, i) => {
    const key = i === 0 ? 'default' : `sender-${s.id}`;
    senderKeyById.set(s.id, key);
    const { id: _id, ...rest } = s;
    return { key, ...rest };
  });
  for (const s of senders) await repo.writeSender(s);

  // Positions: numeric id → nanoid (8-char uses its own package — but for migration
  // we can reuse the legacy numeric as a string to preserve stable ids across the
  // old client.positions[].positionId references). Simpler: keep id as string.
  const positionIdMap = new Map<number, string>();
  const positions: Position[] = legacyPositions.map((p) => {
    const id = `p${p.id}`;
    positionIdMap.set(p.id, id);
    const { id: _id, ...rest } = p;
    return { id, ...rest };
  });
  await repo.writePositions(positions);

  // Clients: numeric id → customerNumber (primary key). Remap positionId references.
  const clients: Client[] = legacyClients.map((c) => {
    const { id: _id, positions: legacyPositionsRef, ...rest } = c;
    const clientPositions: ClientPosition[] | undefined = legacyPositionsRef?.map((cp) => ({
      positionId: positionIdMap.get(cp.positionId) ?? `p${cp.positionId}`,
      price: cp.price,
    }));
    return clientPositions ? { ...rest, positions: clientPositions } : rest;
  });
  for (const c of clients) await repo.writeClient(c);

  // Documents: drop clientId; copy customerNumber from meta or look up.
  const clientByLegacyId = new Map<number, LegacyClient>();
  legacyClients.forEach((c) => clientByLegacyId.set(c.id, c));
  for (const d of legacyDocuments) {
    const { id: _id, clientId, ...rest } = d;
    const customerNumber =
      d.meta?.customerNumber ||
      (clientId !== undefined ? clientByLegacyId.get(clientId)?.customerNumber : '') ||
      '';
    const doc: Document = { ...rest, customerNumber };
    await repo.writeDocument(doc);
  }

  return true;
}
