import { useMoney } from '@/composables/useMoney';
import { getReminderDefaults } from '@/data/reminder-defaults';
import type {
  Client,
  Document,
  DocumentMeta,
  DocumentPatch,
  DocumentType,
  LineItem,
  Position,
  Recipient,
  Sender,
  SenderSnapshot,
} from '@/fs/types';
import { defaultUnitForType, numberPrefix } from '@/lib/documents';
import { defaultVatRate as countryDefaultVatRate } from '@/lib/vat';

/**
 * Pure builders for new documents and derived pieces (recipients, line
 * items, link patches). No store state: everything needed is passed in,
 * and the store stamps timestamps and persists the result.
 */

/** A document as handed to addDocument; timestamps are stamped on write. */
export type NewDocument = Omit<Document, 'createdAt' | 'updatedAt'>;

const { sumGross } = useMoney();

export function generateNumber(prefix: string): string {
  return `${prefix}-${Math.floor(Date.now() / 1000)}`;
}

export function addDays(date: Date, days: number): string {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result.toISOString();
}

export function senderSnapshot(s: Sender): SenderSnapshot {
  const { key: _, ...snap } = s;
  return snap;
}

/** VAT rate a new line item on this document should default to. */
export function senderDefaultVat(doc: Document): number {
  if (!doc.sender?.vatRegistered) return 0;
  return countryDefaultVatRate(doc.sender.country ?? '', doc.meta.date);
}

function draftRecipient(client?: Client): Recipient {
  return {
    company: client?.company ?? '',
    name: client?.name ?? '',
    street: client?.street ?? '',
    zip: client?.zip ?? '',
    city: client?.city ?? '',
    country: client?.country ?? '',
    uid: client?.uid,
  };
}

/** Recipient snapshot taken when a client is assigned to an existing document. */
export function recipientFromClient(client: Client): Recipient {
  return {
    company: client.company ?? '',
    name: client.name ?? '',
    street: client.street,
    zip: client.zip,
    city: client.city,
    country: client.country,
    email: client.email ?? '',
    uid: client.uid,
  };
}

function blankLineItem(type: DocumentType, s: Sender, dateIso: string): LineItem {
  return {
    pos: 1,
    description: '',
    code: '',
    quantity: 1,
    unit: defaultUnitForType(type),
    unitPrice: 0,
    vatRate: s.vatRegistered ? countryDefaultVatRate(s.country ?? '', dateIso) : 0,
  };
}

/** The blank row appended by "add line item" on an existing document. */
export function nextLineItem(doc: Document): LineItem {
  return {
    pos: (doc.lineItems?.length ?? 0) + 1,
    description: '',
    code: '',
    quantity: 1,
    unit: defaultUnitForType(doc.type),
    unitPrice: 0,
    vatRate: senderDefaultVat(doc),
  };
}

/** Line items for a client's agreed positions, priced from the client's list. */
export function clientLineItems(client: Client, doc: Document, positions: Position[]): LineItem[] {
  const fallbackVat = senderDefaultVat(doc);
  return (client.positions ?? []).map((cp, i) => {
    const pos = positions.find((p) => p.id === cp.positionId);
    return {
      pos: i + 1,
      description: pos?.description ?? '',
      code: pos?.code ?? '',
      quantity: 0,
      unit: pos?.unit ?? 'h',
      unitPrice: cp.price,
      vatRate: pos?.defaultVatRate ?? fallbackVat,
    };
  });
}

/**
 * A fresh quote, invoice or receipt for an optional client. Reminders
 * are built by buildReminder since they derive from an invoice instead.
 */
export function buildBlankDocument(
  type: 'quote' | 'invoice' | 'receipt',
  s: Sender,
  client: Client | undefined,
  customerNumber?: string,
): NewDocument {
  const today = new Date();
  const dateIso = today.toISOString();
  const meta: DocumentMeta = {
    date: dateIso,
    contactPerson: s.contact ?? '',
    customerNumber: client?.customerNumber ?? '',
  };
  if (type === 'quote') meta.validUntil = addDays(today, s.quoteValidDays ?? 14);
  if (type === 'invoice') meta.dueDate = addDays(today, s.invoiceDueDays ?? 14);
  return {
    type,
    status: type === 'receipt' ? 'paid' : 'draft',
    number: generateNumber(numberPrefix(type)),
    subtitle: '',
    customerNumber: customerNumber ?? '',
    senderKey: s.key,
    sender: senderSnapshot(s),
    recipient: draftRecipient(client),
    meta,
    lineItems: [blankLineItem(type, s, dateIso)],
  };
}

/**
 * A reminder for an invoice. A reminder always duns an existing invoice,
 * so recipient, amount and dates are derived from it. Built without an
 * invoice (e.g. from the menu) it starts unlinked and the invoice must be
 * picked before the reminder is complete.
 */
export function buildReminder(s: Sender, invoice: Document | null): NewDocument {
  const md = getReminderDefaults(invoice?.recipient.country || 'Schweiz');
  const today = new Date();
  return {
    type: 'reminder',
    status: 'draft',
    number: generateNumber('M'),
    subtitle: invoice?.subtitle ?? '',
    customerNumber: invoice?.customerNumber ?? '',
    relatedInvoice: invoice?.number,
    senderKey: s.key,
    sender: senderSnapshot(s),
    recipient: invoice
      ? { ...invoice.recipient }
      : { company: '', name: '', street: '', zip: '', city: '', country: '' },
    meta: {
      date: today.toISOString(),
      dueDate: addDays(today, md.paymentDays[0]),
      invoiceDate: invoice?.meta.date ?? '',
      overdueSince: invoice?.meta.dueDate ?? '',
      contactPerson: s.contact ?? '',
      customerNumber: invoice?.customerNumber ?? '',
    },
    reminderLevel: 1,
    outstandingAmount: invoice ? sumGross(invoice.lineItems ?? []) : 0,
    reminderFee: md.fees[0],
    lateInterest: 0,
  };
}

/**
 * Patch that links a reminder to the invoice it duns, pulling recipient,
 * dates and (when still empty) the outstanding amount from that invoice.
 */
export function reminderLinkPatch(reminder: Document, invoice: Document): DocumentPatch {
  const md = getReminderDefaults(invoice.recipient.country || 'Schweiz');
  return {
    relatedInvoice: invoice.number,
    customerNumber: invoice.customerNumber,
    subtitle: reminder.subtitle || invoice.subtitle,
    recipient: { ...invoice.recipient },
    outstandingAmount: reminder.outstandingAmount || sumGross(invoice.lineItems ?? []),
    reminderFee: reminder.reminderFee || md.fees[0],
    meta: {
      customerNumber: invoice.customerNumber,
      invoiceDate: invoice.meta.date,
      overdueSince: invoice.meta.dueDate ?? '',
    },
  };
}

/** A draft invoice carrying over everything billable from an quote. */
export function buildInvoiceFromQuote(quote: Document, s: Sender | null): NewDocument {
  const today = new Date();
  return {
    type: 'invoice',
    status: 'draft',
    number: generateNumber('R'),
    subtitle: quote.subtitle,
    customerNumber: quote.customerNumber,
    senderKey: quote.senderKey ?? s?.key,
    sender: { ...quote.sender },
    recipient: { ...quote.recipient },
    meta: {
      date: today.toISOString(),
      dueDate: addDays(today, s?.invoiceDueDays ?? 14),
      contactPerson: quote.meta.contactPerson,
      customerNumber: quote.meta.customerNumber,
    },
    lineItems: quote.lineItems?.map((item) => ({ ...item })),
  };
}

/** A copy of a document with a fresh number, status and dates. */
export function duplicateOf(src: Document): NewDocument {
  const clone = structuredClone(src);
  clone.number = generateNumber(numberPrefix(src.type));
  clone.status = src.type === 'receipt' ? 'paid' : 'draft';
  const today = new Date();
  clone.meta = { ...clone.meta, date: today.toISOString() };
  if (src.type === 'invoice' && src.sender.invoiceDueDays)
    clone.meta.dueDate = addDays(today, src.sender.invoiceDueDays);
  if (src.type === 'quote' && src.sender.quoteValidDays)
    clone.meta.validUntil = addDays(today, src.sender.quoteValidDays);
  const { createdAt: _c, updatedAt: _u, ...rest } = clone;
  return rest;
}
