import * as repo from '@/fs/repo';
import type {
  Document,
  DocumentPatch,
  DocumentStatus,
  FileProblem,
  Sender,
  ViewId,
} from '@/fs/types';
import { documentHaystack } from '@/lib/search';
import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import {
  buildBlankDocument,
  buildInvoiceFromQuote,
  buildReminder,
  clientLineItems,
  duplicateOf,
  generateNumber,
  reminderLinkPatch,
  nextLineItem,
  recipientFromClient,
} from './factories';
import {
  isOverdue as docIsOverdue,
  viewMatches as docMatchesView,
  recipientLabel,
  statusPillsForView as pillsForView,
} from './views';
import { masterDataSlice } from './masterData';
import { numberClaims, writeQueue } from './persistence';

export const useDocumentsStore = defineStore('documents', () => {
  const documents = ref<Document[]>([]);
  const md = masterDataSlice();
  const { senders, clients, positions, findClient } = md;
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
  /** Files skipped during load; shown as a banner until dismissed. */
  const loadProblems = ref<FileProblem[]>([]);
  const loadProblemsDismissed = ref(false);

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

  /** Resolves which sender owns a document; uses senderKey if set, else matches the snapshot. */
  function resolveSenderKey(doc: Document): string | null {
    if (doc.senderKey) return doc.senderKey;
    const match = senders.value.find(
      (s) => s.company === doc.sender.company && s.uid === doc.sender.uid,
    );
    return match?.key ?? null;
  }

  /** The invoice a reminder refers to, resolved via its relatedInvoice FK. */
  function reminderInvoice(doc: Document): Document | null {
    if (doc.type !== 'reminder' || !doc.relatedInvoice) return null;
    return documents.value.find((d) => d.number === doc.relatedInvoice) ?? null;
  }

  /** A reminder is settled once the invoice it duns is marked paid. */
  function isReminderResolved(doc: Document): boolean {
    return reminderInvoice(doc)?.status === 'paid';
  }

  // --- Views & filtering ---

  function isOverdue(doc: Document): boolean {
    return docIsOverdue(doc, isReminderResolved);
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
    quote: documents.value.filter((d) => d.type === 'quote'),
    invoice: documents.value.filter((d) => d.type === 'invoice'),
    reminder: documents.value.filter((d) => d.type === 'reminder'),
    receipt: documents.value.filter((d) => d.type === 'receipt'),
  }));

  // --- Loading & navigation ---

  async function load() {
    const snap = await repo.loadAll();
    const problems = snap.problems ?? [];
    const signature = (p: FileProblem[]) => p.map((x) => `${x.file}:${x.reason}`).join('|');
    if (signature(problems) !== signature(loadProblems.value)) {
      loadProblemsDismissed.value = false;
    }
    loadProblems.value = problems;
    md.setFromSnapshot(snap);
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

  const numbers = numberClaims((n) => documents.value.some((d) => d.number === n));

  async function addDocument(doc: Omit<Document, 'createdAt' | 'updatedAt'>) {
    const number = numbers.claim(doc.number);
    const now = new Date().toISOString();
    const full: Document = { ...doc, number, createdAt: now, updatedAt: now };
    try {
      await repo.writeDocument(full);
    } finally {
      numbers.release(number);
    }
    documents.value = [full, ...documents.value];
    setActive(full.number);
    return full.number;
  }

  async function deleteDocument(number: string) {
    await repo.deleteDocument(number);
    documents.value = documents.value.filter((d) => d.number !== number);
    if (activeDocumentNumber.value === number) setActive(null);
  }

  const queue = writeQueue();

  /**
   * Applies to memory first, then persists. Memory-first means a second
   * edit in the same tick reads the first edit's result instead of the
   * pre-edit document (lost update); the per-document queue keeps the
   * disk writes in the same order. On write failure memory is ahead of
   * disk; the save indicator reports it and the focus reload resyncs.
   */
  async function writeDoc(doc: Document) {
    const idx = documents.value.findIndex((d) => d.number === doc.number);
    if (idx >= 0) documents.value.splice(idx, 1, doc);
    await queue.enqueue(doc.number, () => repo.writeDocument(doc));
  }

  /**
   * Merges a shallow patch (meta merges one level deeper). Passing a key
   * explicitly set to undefined clears that field: the spread keeps the
   * key, and JSON serialization drops it from the file.
   */
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

  async function createQuote(customerNumber?: string, senderKey?: string) {
    const s = findSender(senderKey);
    if (!s) return;
    return addDocument(buildBlankDocument('quote', s, findClient(customerNumber), customerNumber));
  }

  async function createInvoice(customerNumber?: string, senderKey?: string) {
    const s = findSender(senderKey);
    if (!s) return;
    return addDocument(
      buildBlankDocument('invoice', s, findClient(customerNumber), customerNumber),
    );
  }

  async function createReceipt(customerNumber?: string, senderKey?: string) {
    const s = findSender(senderKey);
    if (!s) return;
    return addDocument(
      buildBlankDocument('receipt', s, findClient(customerNumber), customerNumber),
    );
  }

  /**
   * Creates a reminder for an invoice. Created without an invoiceNumber
   * (e.g. from the menu) it starts unlinked and the invoice must be picked
   * before the reminder is complete.
   */
  async function createReminder(invoiceNumber?: string, senderKey?: string) {
    const invoice = invoiceNumber
      ? (documents.value.find((d) => d.number === invoiceNumber && d.type === 'invoice') ?? null)
      : null;
    const s = findSender(invoice?.senderKey ?? senderKey);
    if (!s) return;
    return addDocument(buildReminder(s, invoice));
  }

  /** Links a reminder to the invoice it duns; see reminderLinkPatch. */
  async function linkReminderInvoice(reminderNumber: string, invoiceNumber: string) {
    const doc = documents.value.find((d) => d.number === reminderNumber);
    const invoice = documents.value.find((d) => d.number === invoiceNumber && d.type === 'invoice');
    if (!doc || doc.type !== 'reminder' || !invoice) return;
    await updateDocument(reminderNumber, reminderLinkPatch(doc, invoice));
  }

  async function convertToInvoice(quoteNumber: string) {
    const quote = documents.value.find((d) => d.number === quoteNumber);
    if (!quote || quote.type !== 'quote') return;
    return addDocument(buildInvoiceFromQuote(quote, activeSender.value));
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
    reminderInvoice,
    isReminderResolved,
    activeSender,
    loading,
    loadProblems,
    loadProblemsDismissed,
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
    createQuote,
    createInvoice,
    createReminder,
    linkReminderInvoice,
    createReceipt,
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
    saveSender: md.saveSender,
    removeSender: md.removeSender,
    saveClient: md.saveClient,
    removeClient: md.removeClient,
    savePositions: md.savePositions,
    setNavigator,
  };
});
