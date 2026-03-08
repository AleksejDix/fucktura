import { db } from '@/db';
import type { Client, Document, DocumentStatus, Position, Sender, SenderSnapshot } from '@/db';
import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

export const useDocumentsStore = defineStore('documents', () => {
  const documents = ref<Document[]>([]);
  const clients = ref<Client[]>([]);
  const senders = ref<Sender[]>([]);
  const positions = ref<Position[]>([]);
  const activeSenderId = ref<number | null>(null);
  const loading = ref(true);
  const activeDocumentId = ref<number | null>(null);

  const activeDocument = computed(() =>
    activeDocumentId.value ? documents.value.find((d) => d.id === activeDocumentId.value) ?? null : null,
  );

  const visibleDocuments = computed(() =>
    activeDocumentId.value
      ? documents.value.filter((d) => d.id === activeDocumentId.value)
      : documents.value,
  );

  const grouped = computed(() => ({
    offerte: documents.value.filter((d) => d.type === 'offerte'),
    invoice: documents.value.filter((d) => d.type === 'invoice'),
    mahnung: documents.value.filter((d) => d.type === 'mahnung'),
  }));

  const activeSender = computed(() =>
    activeSenderId.value ? senders.value.find((s) => s.id === activeSenderId.value) ?? senders.value[0] ?? null : senders.value[0] ?? null,
  );

  async function load() {
    loading.value = true;
    senders.value = await db.senders.toArray();
    if (!activeSenderId.value && senders.value.length > 0) {
      activeSenderId.value = senders.value[0].id!;
    }
    clients.value = await db.clients.toArray();
    positions.value = await db.positions.toArray();
    documents.value = await db.documents.orderBy('createdAt').reverse().toArray();
    loading.value = false;
  }

  let navigate: ((id: number | null) => void) | null = null;

  function setNavigator(fn: (id: number | null) => void) {
    navigate = fn;
  }

  function setActive(id: number | null) {
    activeDocumentId.value = id;
    navigate?.(id);
  }

  async function addDocument(doc: Omit<Document, 'id' | 'createdAt' | 'updatedAt'>) {
    const now = new Date().toISOString();
    const raw = JSON.parse(JSON.stringify(doc));
    const id = await db.documents.add({
      ...raw,
      createdAt: now,
      updatedAt: now,
    } as Document);
    await load();
    setActive(id as number);
    return id;
  }

  async function deleteDocument(id: number) {
    await db.documents.delete(id);
    if (activeDocumentId.value === id) {
      setActive(null);
    }
    await load();
  }

  function generateNumber(prefix: string): string {
    return `${prefix}-${Math.floor(Date.now() / 1000)}`;
  }

  function formatDate(date: Date): string {
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const yyyy = date.getFullYear();
    return `${dd}.${mm}.${yyyy}`;
  }

  function senderSnapshot(s: Sender): SenderSnapshot {
    const { id: _, ...snapshot } = s;
    return snapshot;
  }

  async function createOfferte(clientId?: number, senderId?: number) {
    const s = senderId
      ? await db.senders.get(senderId)
      : activeSender.value;
    if (!s) return;

    const number = generateNumber('O');
    const client = clientId ? clients.value.find((c) => c.id === clientId) : undefined;
    const today = new Date();
    const validUntil = new Date(today);
    validUntil.setDate(validUntil.getDate() + 30);

    return addDocument({
      type: 'offerte',
      status: 'draft',
      number,
      subtitle: '',
      clientId,
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
        datum: formatDate(today),
        gueltigBis: formatDate(validUntil),
        ansprechpartner: s.contact ?? '',
        kundennummer: clientId ? String(clientId).padStart(6, '0') : '',
      },
      lineItems: [{ pos: 1, description: '', code: '', quantity: 1, unit: 'h', unitPrice: 0 }],
    });
  }

  async function convertToInvoice(offerteId: number) {
    const offerte = documents.value.find((d) => d.id === offerteId);
    if (!offerte || offerte.type !== 'offerte') return;

    const number = generateNumber('R');
    const today = new Date();
    const dueDate = new Date(today);
    dueDate.setDate(dueDate.getDate() + 15);

    return addDocument({
      type: 'invoice',
      status: 'draft',
      number,
      subtitle: offerte.subtitle,
      clientId: offerte.clientId,
      sender: { ...offerte.sender },
      recipient: { ...offerte.recipient },
      meta: {
        datum: formatDate(today),
        zahlbarBis: formatDate(dueDate),
        ansprechpartner: offerte.meta.ansprechpartner,
        kundennummer: offerte.meta.kundennummer,
      },
      lineItems: offerte.lineItems?.map((item) => ({ ...item })),
    });
  }

  function resolveClientPositions(client: Client) {
    return (client.positions ?? []).map((cp, i) => {
      const pos = positions.value.find(p => p.id === cp.positionId);
      return {
        pos: i + 1,
        description: pos?.description ?? '',
        code: pos?.code ?? '',
        quantity: 0,
        unit: pos?.unit ?? 'h',
        unitPrice: cp.price,
      };
    });
  }

  async function assignClient(docId: number, clientId: number) {
    const client = clients.value.find((c) => c.id === clientId);
    if (!client) return;

    const lineItems = resolveClientPositions(client);

    await db.documents.update(docId, {
      clientId,
      recipient: {
        company: client.company ?? '',
        name: client.name ?? '',
        street: client.street,
        zip: client.zip,
        city: client.city,
        country: client.country,
      },
      lineItems,
      'meta.kundennummer': String(clientId).padStart(6, '0'),
      updatedAt: new Date().toISOString(),
    });
    await load();
  }

  async function updateDocument(docId: number, changes: Record<string, unknown>) {
    await db.documents.update(docId, { ...changes, updatedAt: new Date().toISOString() });
    await load();
  }

  async function setStatus(docId: number, status: DocumentStatus) {
    await db.documents.update(docId, { status, updatedAt: new Date().toISOString() });
    await load();
  }

  return {
    documents,
    clients,
    senders,
    positions,
    activeSenderId,
    activeSender,
    loading,
    activeDocumentId,
    activeDocument,
    visibleDocuments,
    grouped,
    load,
    setActive,
    addDocument,
    deleteDocument,
    generateNumber,
    createOfferte,
    convertToInvoice,
    assignClient,
    updateDocument,
    setStatus,
    setNavigator,
  };
});
