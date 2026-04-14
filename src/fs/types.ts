export interface Account {
  iban: string;
  bank: string;
  bic: string;
}

export interface Address {
  company: string;
  name?: string;
  street: string;
  zip: string;
  city: string;
  country: string;
  email?: string;
}

export interface Sender extends Address {
  /** Primary key — stable string id, also used as filename */
  key: string;
  website: string;
  uid: string;
  contact: string;
  contactEmail: string;
  accounts: Account[];
  invoiceDueDays: number;
  quoteValidDays: number;
  /** If false, invoices render "tax exempt" and no VAT column appears. */
  vatRegistered?: boolean;
}

export interface Position {
  /** 8-char nanoid */
  id: string;
  description: string;
  code: string;
  unit: string;
  defaultPrice: number;
  /** Percentage; if omitted, line item falls back to sender's standard rate. */
  defaultVatRate?: number;
}

export interface ClientPosition {
  positionId: string;
  price: number;
}

export interface Client extends Address {
  /** Primary key — also used as filename */
  customerNumber: string;
  positions?: ClientPosition[];
}

export interface LineItem {
  pos: number;
  description: string;
  code: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  /** VAT percentage applied at issue time. Missing = 0 (exempt, backward compat). */
  vatRate?: number;
}

export type Recipient = Address;

export interface DocumentMeta {
  date: string;
  contactPerson: string;
  customerNumber: string;
  dueDate?: string;
  validUntil?: string;
  invoiceDate?: string;
  overdueSince?: string;
}

export type SenderSnapshot = Omit<Sender, 'key'>;

export type OfferteStatus = 'draft' | 'sent' | 'accepted' | 'rejected';
export type InvoiceStatus = 'draft' | 'sent' | 'paid';
export type MahnungStatus = 'draft' | 'sent';
export type DocumentStatus = OfferteStatus | InvoiceStatus | MahnungStatus;
export type DocumentType = 'invoice' | 'offerte' | 'mahnung' | 'quittung';

export interface Document {
  /** Primary key — also used as filename */
  number: string;
  type: DocumentType;
  status: DocumentStatus;
  subtitle: string;
  /** Foreign key to Client.customerNumber (empty string if unassigned) */
  customerNumber: string;
  /** Foreign key to Sender.key; optional for backward compat with pre-filter docs. */
  senderKey?: string;
  sender: SenderSnapshot;
  recipient: Recipient;
  meta: DocumentMeta;
  lineItems?: LineItem[];
  stufe?: number;
  offenerBetrag?: number;
  mahngebuehr?: number;
  verzugszins?: number;
  createdAt: string;
  updatedAt: string;
}

export interface RepoSnapshot {
  senders: Sender[];
  clients: Client[];
  positions: Position[];
  documents: Document[];
}

/** Shallow patch for a document; nested meta fields merge into existing meta. */
export type DocumentPatch = Partial<Omit<Document, 'meta' | 'number' | 'createdAt' | 'updatedAt'>> & {
  meta?: Partial<DocumentMeta>;
};

/** Smart views exposed in the collections sidebar. */
export type ViewId =
  | 'all'
  | 'drafts'
  | 'overdue'
  | 'unpaid'
  | `type:${DocumentType}`
  | `sender:${string}`;
