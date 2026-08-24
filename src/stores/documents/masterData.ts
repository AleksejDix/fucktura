import * as repo from '@/fs/repo';
import type { Client, Position, RepoSnapshot, Sender } from '@/fs/types';
import { ref } from 'vue';

/**
 * Master data (senders, clients, positions): the sorted lists and their
 * CRUD against the repo. Composed into useDocumentsStore by spreading,
 * so call sites keep the single-store API.
 */
export function masterDataSlice() {
  const senders = ref<Sender[]>([]);
  const clients = ref<Client[]>([]);
  const positions = ref<Position[]>([]);

  function setFromSnapshot(snap: RepoSnapshot): void {
    senders.value = [...snap.senders].sort((a, b) => a.key.localeCompare(b.key));
    clients.value = [...snap.clients].sort((a, b) =>
      a.customerNumber.localeCompare(b.customerNumber),
    );
    positions.value = [...snap.positions].sort((a, b) =>
      a.description.localeCompare(b.description),
    );
  }

  function findClient(customerNumber?: string): Client | undefined {
    if (!customerNumber) return undefined;
    return clients.value.find((c) => c.customerNumber === customerNumber);
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

  return {
    senders,
    clients,
    positions,
    setFromSnapshot,
    findClient,
    saveSender,
    removeSender,
    saveClient,
    removeClient,
    savePositions,
  };
}
