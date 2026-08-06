import * as repo from '@/fs/repo';
import type {
  Client,
  Document,
  DocumentPatch,
  DocumentStatus,
  Position,
  Sender,
  ViewId,
} from '@/fs/types';
import { documentHaystack } from '@/lib/search';
import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import {
  buildBlankDocument,
  buildInvoiceFromOfferte,
  buildMahnung,
  clientLineItems,
  duplicateOf,
  generateNumber,
  mahnungLinkPatch,
  nextLineItem,
  recipientFromClient,
} from './factories';
import {
  isOverdue as docIsOverdue,
  viewMatches as docMatchesView,
  recipientLabel,
  statusPillsForView as pillsForView,
} from './views';

export const useDocumentsStore = defineStore('documents', () => {
  const documents = ref<Document[]>([]);
  const clients = ref<Client[]>([]);
  const senders = ref<Sender[]>([]);
  const positions = ref<Position[]>([]);
  /** Creation default: which sender a new doc should use. */
  const activeSenderKey = ref<string | null>(null);
  /** Mail-style smart view for the document list. */
  const activeView = ref<ViewId>('all');
  /** Status sub-filter applied within the current view. null = all. */
  const activeStatusPill = ref<DocumentStatus | null>(null);
  /** Quick-search text filtered against the current view. */
  const quickSearch = ref('');
  const loading = ref(true);
  const activeDocumentNumber = ref<string | null>(null);

  // --- Lookups ---

  const activeDocument = computed(() =>
    activeDocumentNumber.value
      ? (documents.value.find((d) => d.number === activeDocumentNumber.value) ?? null)
      : null,
  );

  const activeSender = computed(() =>
    activeSenderKey.value
      ? (senders.value.find((s) => s.key === activeSenderKey.value) ?? senders.value[0] ?? null)
      : (senders.value[0] ?? null),
  );

  function findSender(senderKey?: string): Sender | null {
    if (senderKey) return senders.value.find((s) => s.key === senderKey) ?? null;
    return activeSender.value;
  }

  function findClient(customerNumber?: string): Client | undefined {
    if (!customerNumber) return undefined;
    return clients.value.find((c) => c.customerNumber === customerNumber);
  }

  /** Resolves which sender owns a document; uses senderKey if set, else matches the snapshot. */
  function resolveSenderKey(doc: Document): string | null {
    if (doc.senderKey) return doc.senderKey;
    const match = senders.value.find(
      (s) => s.company === doc.sender.company && s.uid === doc.sender.uid,
    );
    return match?.key ?? null;
  }

  /** The invoice a mahnung refers to, resolved via its relatedInvoice FK. */
  function mahnungInvoice(doc: Document): Document | null {
    if (doc.type !== 'mahnung' || !doc.relatedInvoice) return null;
    return documents.value.find((d) => d.number === doc.relatedInvoice) ?? null;
  }

  /** A mahnung is settled once the invoice it duns is marked paid. */
  function isMahnungResolved(doc: Document): boolean {
    return mahnungInvoice(doc)?.status === 'paid';
  }

  // --- Views & filtering ---

  function isOverdue(doc: Document): boolean {
    return docIsOverdue(doc, isMahnungResolved);
  }

  const viewCtx = { isOverdue, senderKeyOf: resolveSenderKey };

  const viewFilteredDocuments = computed(() => {
    const v = activeView.value;
    return v === 'all'
      ? documents.value
      : documents.value.filter((d) => docMatchesView(d, v, viewCtx));
  });

  const recipientLabels = computed<string[]>(() => {
    const set = new Set<string>();
    for (const d of documents.value) {
      const label = recipientLabel(d);
      if (label) set.add(label);
    }
    return [...set].sort((a, b) => a.localeCompare(b));
  });

  const filteredDocuments = computed(() => {
    const pill = activeStatusPill.value;
    const q = quickSearch.value.trim().toLowerCase();
    return viewFilteredDocuments.value.filter((d) => {
      if (pill && d.status !== pill) return false;
      if (q && !documentHaystack(d).includes(q)) return false;
      return true;
    });
  });

  const visibleDocuments = computed(() =>
    activeDocumentNumber.value
      ? filteredDocuments.value.filter((d) => d.number === activeDocumentNumber.value)
      : filteredDocuments.value,
  );

  function viewCount(id: ViewId): number {
    return documents.value.filter((d) => docMatchesView(d, id, viewCtx)).length;
  }

  const statusPillsForView = computed<DocumentStatus[]>(() => pillsForView(activeView.value));

  /** Switch view and reset the status pill and active-sender context appropriately. */
  function setView(id: ViewId) {
    activeView.value = id;
    activeStatusPill.value = null;
    if (id.startsWith('sender:')) {
      activeSenderKey.value = id.slice(7);
    }
  }

  const grouped = computed(() => ({
    offerte: documents.value.filter((d) => d.type === 'offerte'),
    invoice: documents.value.filter((d) => d.type === 'invoice'),
    mahnung: documents.value.filter((d) => d.type === 'mahnung'),
    quittung: documents.value.filter((d) => d.type === 'quittung'),
  }));

  // --- Loading & navigation ---

  async function load() {
    const snap = await repo.loadAll();
    senders.value = [...snap.senders].sort((a, b) => a.key.localeCompare(b.key));
    clients.value = [...snap.clients].sort((a, b) =>
      a.customerNumber.localeCompare(b.customerNumber),
    );
    positions.value = [...snap.positions].sort((a, b) =>
      a.description.localeCompare(b.description),
    );
    documents.value = [...snap.documents].sort((a, b) => {
      const da = new Date(a.meta.date).getTime();
      const db = new Date(b.meta.date).getTime();
      if (db !== da) return db - da;
      return b.number.localeCompare(a.number);
    });
    loading.value = false;
  }

  let navigate: ((number: string | null) => void) | null = null;

  function setNavigator(fn: (number: string | null) => void) {
    navigate = fn;
  }

  function setActive(number: string | null) {
    activeDocumentNumber.value = number;
    navigate?.(number);
  }

  function adjacentDocument(delta: 1 | -1): Document | null {
    const docs = documents.value;
    if (docs.length === 0) return null;
    const current = activeDocumentNumber.value;
    if (!current) return docs[0];
    const i = docs.findIndex((d) => d.number === current);
    if (i === -1) return docs[0];
    const next = i + delta;
    if (next < 0 || next >= docs.length) return null;
    return docs[next];
  }

  function nextDocument() {
    const doc = adjacentDocument(1);
    if (doc) setActive(doc.number);
  }

  function previousDocument() {
    const doc = adjacentDocument(-1);
    if (doc) setActive(doc.number);
  }

  // --- Document persistence ---

  async function addDocument(doc: Omit<Document, 'createdAt' | 'updatedAt'>) {
    const now = new Date().toISOString();
    const full: Document = { ...doc, createdAt: now, updatedAt: now };
    await repo.writeDocument(full);
    documents.value = [full, ...documents.value];
    setActive(full.number);
    return full.number;
  }

  async function deleteDocument(number: string) {
    await repo.deleteDocument(number);
    documents.value = documents.value.filter((d) => d.number !== number);
    if (activeDocumentNumber.value === number) setActive(null);
  }

  async function writeDoc(doc: Document) {
    await repo.writeDocument(doc);
    const idx = documents.value.findIndex((d) => d.number === doc.number);
    if (idx >= 0) documents.value.splice(idx, 1, doc);
  }

  async function updateDocument(docNumber: string, patch: DocumentPatch) {
    const doc = documents.value.find((d) => d.number === docNumber);
    if (!doc) return;
    const { meta: metaPatch, ...rest } = patch;
    const next: Document = {
      ...doc,
      ...rest,
      meta: metaPatch ? { ...doc.meta, ...metaPatch } : doc.meta,
      updatedAt: new Date().toISOString(),
    };
    await writeDoc(next);
  }

  async function setStatus(docNumber: string, status: DocumentStatus) {
    await updateDocument(docNumber, { status });
  }

  // --- Document creation ---

  async function createOfferte(customerNumber?: string, senderKey?: string) {
    const s = findSender(senderKey);
    if (!s) return;
    return addDocument(
      buildBlankDocument('offerte', s, findClient(customerNumber), customerNumber),
    );
  }

  async function createInvoice(customerNumber?: string, senderKey?: string) {
    const s = findSender(senderKey);
    if (!s) return;
    return addDocument(
      buildBlankDocument('invoice', s, findClient(customerNumber), customerNumber),
    );
  }

  async function createQuittung(customerNumber?: string, senderKey?: string) {
    const s = findSender(senderKey);
    if (!s) return;
    return addDocument(
      buildBlankDocument('quittung', s, findClient(customerNumber), customerNumber),
    );
  }

  /**
   * Creates a reminder for an invoice. Created without an invoiceNumber
   * (e.g. from the menu) it starts unlinked and the invoice must be picked
   * before the reminder is complete.
   */
  async function createMahnung(invoiceNumber?: string, senderKey?: string) {
    const invoice = invoiceNumber
      ? (documents.value.find((d) => d.number === invoiceNumber && d.type === 'invoice') ?? null)
      : null;
    const s = findSender(invoice?.senderKey ?? senderKey);
    if (!s) return;
    return addDocument(buildMahnung(s, invoice));
  }

  /** Links a reminder to the invoice it duns; see mahnungLinkPatch. */
  async function linkMahnungInvoice(mahnungNumber: string, invoiceNumber: string) {
    const doc = documents.value.find((d) => d.number === mahnungNumber);
    const invoice = documents.value.find((d) => d.number === invoiceNumber && d.type === 'invoice');
    if (!doc || doc.type !== 'mahnung' || !invoice) return;
    await updateDocument(mahnungNumber, mahnungLinkPatch(doc, invoice));
  }

  async function convertToInvoice(offerteNumber: string) {
    const offerte = documents.value.find((d) => d.number === offerteNumber);
    if (!offerte || offerte.type !== 'offerte') return;
    return addDocument(buildInvoiceFromOfferte(offerte, activeSender.value));
  }

  async function duplicateDocument(docNumber: string) {
    const src = documents.value.find((d) => d.number === docNumber);
    if (!src) return;
    return addDocument(duplicateOf(src));
  }

  // --- Active-document edits ---

  async function assignClient(docNumber: string, customerNumber: string) {
    const client = findClient(customerNumber);
    if (!client) return;
    const doc = documents.value.find((d) => d.number === docNumber);
    if (!doc) return;
    const updated: Document = {
      ...doc,
      customerNumber,
      recipient: recipientFromClient(client),
      lineItems: clientLineItems(client, doc, positions.value),
      meta: { ...doc.meta, customerNumber: client.customerNumber ?? '' },
      updatedAt: new Date().toISOString(),
    };
    await writeDoc(updated);
  }

  async function addLineItemToActive() {
    const doc = activeDocument.value;
    if (!doc) return;
    await updateDocument(doc.number, { lineItems: [...(doc.lineItems ?? []), nextLineItem(doc)] });
  }

  async function clearLineItems() {
    const doc = activeDocument.value;
    if (!doc) return;
    await updateDocument(doc.number, { lineItems: [] });
  }

  async function resetRecipient() {
    const doc = activeDocument.value;
    if (!doc) return;
    await updateDocument(doc.number, {
      customerNumber: '',
      recipient: {
        company: '',
        name: '',
        street: '',
        zip: '',
        city: '',
        country: doc.recipient.country ?? '',
      },
      meta: { customerNumber: '' },
    });
  }

  // --- Senders, clients, positions ---

  async function saveSender(s: Sender) {
    await repo.writeSender(s);
    const idx = senders.value.findIndex((x) => x.key === s.key);
    if (idx >= 0) senders.value.splice(idx, 1, s);
    else {
      senders.value.push(s);
      senders.value.sort((a, b) => a.key.localeCompare(b.key));
    }
  }

  async function removeSender(key: string) {
    await repo.deleteSender(key);
    senders.value = senders.value.filter((s) => s.key !== key);
  }

  async function saveClient(c: Client) {
    await repo.writeClient(c);
    const idx = clients.value.findIndex((x) => x.customerNumber === c.customerNumber);
    if (idx >= 0) clients.value.splice(idx, 1, c);
    else {
      clients.value.push(c);
      clients.value.sort((a, b) => a.customerNumber.localeCompare(b.customerNumber));
    }
  }

  async function removeClient(customerNumber: string) {
    await repo.deleteClient(customerNumber);
    clients.value = clients.value.filter((c) => c.customerNumber !== customerNumber);
  }

  async function savePositions(list: Position[]) {
    await repo.writePositions(list);
    positions.value = [...list].sort((a, b) => a.description.localeCompare(b.description));
  }

  return {
    documents,
    clients,
    senders,
    positions,
    activeSenderKey,
    activeView,
    activeStatusPill,
    quickSearch,
    statusPillsForView,
    recipientLabels,
    setView,
    viewCount,
    isOverdue,
    mahnungInvoice,
    isMahnungResolved,
    activeSender,
    loading,
    activeDocumentNumber,
    activeDocument,
    filteredDocuments,
    visibleDocuments,
    grouped,
    resolveSenderKey,
    load,
    setActive,
    addDocument,
    deleteDocument,
    generateNumber,
    createOfferte,
    createInvoice,
    createMahnung,
    linkMahnungInvoice,
    createQuittung,
    convertToInvoice,
    assignClient,
    updateDocument,
    setStatus,
    duplicateDocument,
    addLineItemToActive,
    clearLineItems,
    resetRecipient,
    nextDocument,
    previousDocument,
    saveSender,
    removeSender,
    saveClient,
    removeClient,
    savePositions,
    setNavigator,
  };
});
