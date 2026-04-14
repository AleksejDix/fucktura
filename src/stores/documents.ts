import * as repo from '@/fs/repo';
import type { Client, Document, DocumentPatch, DocumentStatus, Position, Sender, SenderSnapshot } from '@/fs/types';
import { defaultUnitForType, numberPrefix } from '@/lib/documents';
import { defaultVatRate as countryDefaultVatRate } from '@/lib/vat';
import { getMahnungDefaults } from '@/data/mahnung-defaults';
import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

export const useDocumentsStore = defineStore('documents', () => {
  const documents = ref<Document[]>([]);
  const clients = ref<Client[]>([]);
  const senders = ref<Sender[]>([]);
  const positions = ref<Position[]>([]);
  const activeSenderKey = ref<string | null>(null);
  const loading = ref(true);
  const activeDocumentNumber = ref<string | null>(null);

  const activeDocument = computed(() =>
    activeDocumentNumber.value
      ? documents.value.find((d) => d.number === activeDocumentNumber.value) ?? null
      : null,
  );

  const visibleDocuments = computed(() =>
    activeDocumentNumber.value
      ? documents.value.filter((d) => d.number === activeDocumentNumber.value)
      : documents.value,
  );

  const grouped = computed(() => ({
    offerte: documents.value.filter((d) => d.type === 'offerte'),
    invoice: documents.value.filter((d) => d.type === 'invoice'),
    mahnung: documents.value.filter((d) => d.type === 'mahnung'),
    quittung: documents.value.filter((d) => d.type === 'quittung'),
  }));

  const activeSender = computed(() =>
    activeSenderKey.value
      ? senders.value.find((s) => s.key === activeSenderKey.value) ?? senders.value[0] ?? null
      : senders.value[0] ?? null,
  );

  async function load() {
    const snap = await repo.loadAll();
    senders.value = [...snap.senders].sort((a, b) => a.key.localeCompare(b.key));
    clients.value = [...snap.clients].sort((a, b) => a.customerNumber.localeCompare(b.customerNumber));
    positions.value = [...snap.positions].sort((a, b) => a.description.localeCompare(b.description));
    documents.value = [...snap.documents].sort((a, b) => {
      const da = new Date(a.meta.date).getTime();
      const db = new Date(b.meta.date).getTime();
      if (db !== da) return db - da;
      return b.number.localeCompare(a.number);
    });
    if (!activeSenderKey.value && senders.value.length > 0) {
      activeSenderKey.value = senders.value[0].key;
    }
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

  function generateNumber(prefix: string): string {
    return `${prefix}-${Math.floor(Date.now() / 1000)}`;
  }

  function senderSnapshot(s: Sender): SenderSnapshot {
    const { key: _, ...snap } = s;
    return snap;
  }

  function addDays(date: Date, days: number): string {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result.toISOString();
  }

  function findSender(senderKey?: string): Sender | null {
    if (senderKey) return senders.value.find((s) => s.key === senderKey) ?? null;
    return activeSender.value;
  }

  function findClient(customerNumber?: string): Client | undefined {
    if (!customerNumber) return undefined;
    return clients.value.find((c) => c.customerNumber === customerNumber);
  }

  async function createOfferte(customerNumber?: string, senderKey?: string) {
    const s = findSender(senderKey);
    if (!s) return;
    const client = findClient(customerNumber);
    const today = new Date();
    return addDocument({
      type: 'offerte',
      status: 'draft',
      number: generateNumber('O'),
      subtitle: '',
      customerNumber: customerNumber ?? '',
      sender: senderSnapshot(s),
      recipient: {
        company: client?.company ?? '',
        name: client?.name ?? '',
        street: client?.street ?? '',
        zip: client?.zip ?? '',
        city: client?.city ?? '',
        country: client?.country ?? '',
      },
      meta: {
        date: today.toISOString(),
        validUntil: addDays(today, s.quoteValidDays ?? 14),
        contactPerson: s.contact ?? '',
        customerNumber: client?.customerNumber ?? '',
      },
      lineItems: [{ pos: 1, description: '', code: '', quantity: 1, unit: 'h', unitPrice: 0, vatRate: s.vatRegistered ? countryDefaultVatRate(s.country ?? '', today.toISOString()) : 0 }],
    });
  }

  async function createInvoice(customerNumber?: string, senderKey?: string) {
    const s = findSender(senderKey);
    if (!s) return;
    const client = findClient(customerNumber);
    const today = new Date();
    return addDocument({
      type: 'invoice',
      status: 'draft',
      number: generateNumber('R'),
      subtitle: '',
      customerNumber: customerNumber ?? '',
      sender: senderSnapshot(s),
      recipient: {
        company: client?.company ?? '',
        name: client?.name ?? '',
        street: client?.street ?? '',
        zip: client?.zip ?? '',
        city: client?.city ?? '',
        country: client?.country ?? '',
      },
      meta: {
        date: today.toISOString(),
        dueDate: addDays(today, s.invoiceDueDays ?? 14),
        contactPerson: s.contact ?? '',
        customerNumber: client?.customerNumber ?? '',
      },
      lineItems: [{ pos: 1, description: '', code: '', quantity: 1, unit: 'h', unitPrice: 0, vatRate: s.vatRegistered ? countryDefaultVatRate(s.country ?? '', today.toISOString()) : 0 }],
    });
  }

  async function createQuittung(customerNumber?: string, senderKey?: string) {
    const s = findSender(senderKey);
    if (!s) return;
    const client = findClient(customerNumber);
    const today = new Date();
    return addDocument({
      type: 'quittung',
      status: 'paid',
      number: generateNumber('Q'),
      subtitle: '',
      customerNumber: customerNumber ?? '',
      sender: senderSnapshot(s),
      recipient: {
        company: client?.company ?? '',
        name: client?.name ?? '',
        street: client?.street ?? '',
        zip: client?.zip ?? '',
        city: client?.city ?? '',
        country: client?.country ?? '',
      },
      meta: {
        date: today.toISOString(),
        contactPerson: s.contact ?? '',
        customerNumber: client?.customerNumber ?? '',
      },
      lineItems: [{ pos: 1, description: '', code: '', quantity: 1, unit: 'Pauschal', unitPrice: 0, vatRate: s.vatRegistered ? countryDefaultVatRate(s.country ?? '', today.toISOString()) : 0 }],
    });
  }

  async function createMahnung(customerNumber?: string, senderKey?: string) {
    const s = findSender(senderKey);
    if (!s) return;
    const client = findClient(customerNumber);
    const country = client?.country ?? 'Schweiz';
    const md = getMahnungDefaults(country);
    const today = new Date();
    return addDocument({
      type: 'mahnung',
      status: 'draft',
      number: generateNumber('M'),
      subtitle: '',
      customerNumber: customerNumber ?? '',
      sender: senderSnapshot(s),
      recipient: {
        company: client?.company ?? '',
        name: client?.name ?? '',
        street: client?.street ?? '',
        zip: client?.zip ?? '',
        city: client?.city ?? '',
        country,
      },
      meta: {
        date: today.toISOString(),
        dueDate: addDays(today, md.zahlungsfrist),
        invoiceDate: '',
        overdueSince: '',
        contactPerson: s.contact ?? '',
        customerNumber: client?.customerNumber ?? '',
      },
      stufe: 1,
      offenerBetrag: 0,
      mahngebuehr: md.mahngebuehr[0],
      verzugszins: 0,
    });
  }

  async function convertToInvoice(offerteNumber: string) {
    const offerte = documents.value.find((d) => d.number === offerteNumber);
    if (!offerte || offerte.type !== 'offerte') return;
    const s = activeSender.value;
    const today = new Date();
    return addDocument({
      type: 'invoice',
      status: 'draft',
      number: generateNumber('R'),
      subtitle: offerte.subtitle,
      customerNumber: offerte.customerNumber,
      sender: { ...offerte.sender },
      recipient: { ...offerte.recipient },
      meta: {
        date: today.toISOString(),
        dueDate: addDays(today, s?.invoiceDueDays ?? 14),
        contactPerson: offerte.meta.contactPerson,
        customerNumber: offerte.meta.customerNumber,
      },
      lineItems: offerte.lineItems?.map((item) => ({ ...item })),
    });
  }

  function resolveClientPositions(client: Client, doc: Document) {
    const fallbackVat = senderDefaultVat(doc);
    return (client.positions ?? []).map((cp, i) => {
      const pos = positions.value.find((p) => p.id === cp.positionId);
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

  async function writeDoc(doc: Document) {
    await repo.writeDocument(doc);
    const idx = documents.value.findIndex((d) => d.number === doc.number);
    if (idx >= 0) documents.value.splice(idx, 1, doc);
  }

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

  async function assignClient(docNumber: string, customerNumber: string) {
    const client = findClient(customerNumber);
    if (!client) return;
    const doc = documents.value.find((d) => d.number === docNumber);
    if (!doc) return;
    const updated: Document = {
      ...doc,
      customerNumber,
      recipient: {
        company: client.company ?? '',
        name: client.name ?? '',
        street: client.street,
        zip: client.zip,
        city: client.city,
        country: client.country,
        email: client.email ?? '',
      },
      lineItems: resolveClientPositions(client, doc),
      meta: { ...doc.meta, customerNumber: client.customerNumber ?? '' },
      updatedAt: new Date().toISOString(),
    };
    await writeDoc(updated);
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

  async function duplicateDocument(docNumber: string) {
    const src = documents.value.find((d) => d.number === docNumber);
    if (!src) return;
    const clone = structuredClone(src);
    clone.number = generateNumber(numberPrefix(src.type));
    clone.status = src.type === 'quittung' ? 'paid' : 'draft';
    const today = new Date();
    clone.meta = { ...clone.meta, date: today.toISOString() };
    if (src.type === 'invoice' && src.sender.invoiceDueDays)
      clone.meta.dueDate = addDays(today, src.sender.invoiceDueDays);
    if (src.type === 'offerte' && src.sender.quoteValidDays)
      clone.meta.validUntil = addDays(today, src.sender.quoteValidDays);
    const { createdAt: _c, updatedAt: _u, ...rest } = clone;
    return addDocument(rest);
  }

  function senderDefaultVat(doc: Document): number {
    if (!doc.sender?.vatRegistered) return 0;
    return countryDefaultVatRate(doc.sender.country ?? '', doc.meta.date);
  }

  async function addLineItemToActive() {
    const doc = activeDocument.value;
    if (!doc) return;
    const items = [...(doc.lineItems ?? [])];
    items.push({
      pos: items.length + 1,
      description: '',
      code: '',
      quantity: 1,
      unit: defaultUnitForType(doc.type),
      unitPrice: 0,
      vatRate: senderDefaultVat(doc),
    });
    await updateDocument(doc.number, { lineItems: items });
  }

  async function clearLineItems() {
    const doc = activeDocument.value;
    if (!doc) return;
    await updateDocument(doc.number, { lineItems: [] });
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

  async function resetRecipient() {
    const doc = activeDocument.value;
    if (!doc) return;
    await updateDocument(doc.number, {
      customerNumber: '',
      recipient: { company: '', name: '', street: '', zip: '', city: '', country: doc.recipient.country ?? '' },
      meta: { customerNumber: '' },
    });
  }

  return {
    documents,
    clients,
    senders,
    positions,
    activeSenderKey,
    activeSender,
    loading,
    activeDocumentNumber,
    activeDocument,
    visibleDocuments,
    grouped,
    load,
    setActive,
    addDocument,
    deleteDocument,
    generateNumber,
    createOfferte,
    createInvoice,
    createMahnung,
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
