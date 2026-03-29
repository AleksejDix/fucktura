<template>
  <div class="w-[210mm] mx-auto py-8 px-[26mm] bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] print:shadow-none my-4">
    <p class="text-[14pt] font-bold text-gray-900 mb-6">{{ $t('Clients') }}</p>

    <div class="space-y-8">
      <div
        v-for="client in clients"
        :key="client.id"
        class="border border-gray-300 p-4"
      >
        <div class="flex items-start justify-between mb-3">
          <p class="text-[10pt] font-bold text-gray-900">{{ client.company || client.name || $t('New client') }}</p>
          <button @click="deleteClient(client.id!)" class="text-gray-300 hover:text-red-500 text-[9pt]">&times;</button>
        </div>
        <div class="grid grid-cols-2 gap-x-4 gap-y-3 text-[9pt]">
          <div class="col-span-2">
            <label class="block text-[8pt] text-gray-500 mb-0.5">{{ $t('Client number') }}</label>
            <input
              v-model="client.customerNumber"
              @blur="saveClient(client)"
              class="w-full border border-gray-300 px-2 py-1.5 text-gray-900 placeholder-gray-300 focus:outline-none focus:border-gray-900 font-mono"
            />
          </div>
          <div class="col-span-2">
            <label class="block text-[8pt] text-gray-500 mb-0.5">{{ $t('Company name') }}</label>
            <input
              v-model="client.company"
              @blur="saveClient(client)"
              class="w-full border border-gray-300 px-2 py-1.5 text-gray-900 placeholder-gray-300 focus:outline-none focus:border-gray-900"
            />
          </div>
          <div class="col-span-2">
            <label class="block text-[8pt] text-gray-500 mb-0.5">{{ $t('Name') }}</label>
            <input
              v-model="client.name"
              @blur="saveClient(client)"
              class="w-full border border-gray-300 px-2 py-1.5 text-gray-900 placeholder-gray-300 focus:outline-none focus:border-gray-900"
            />
          </div>
          <div class="col-span-2">
            <label class="block text-[8pt] text-gray-500 mb-0.5">{{ $t('Street') }}</label>
            <input
              v-model="client.street"
              @blur="saveClient(client)"
              class="w-full border border-gray-300 px-2 py-1.5 text-gray-900 placeholder-gray-300 focus:outline-none focus:border-gray-900"
            />
          </div>
          <div>
            <label class="block text-[8pt] text-gray-500 mb-0.5">{{ $t('ZIP') }}</label>
            <input
              v-model="client.zip"
              @blur="saveClient(client)"
              class="w-full border border-gray-300 px-2 py-1.5 text-gray-900 placeholder-gray-300 focus:outline-none focus:border-gray-900 font-mono"
            />
          </div>
          <div>
            <label class="block text-[8pt] text-gray-500 mb-0.5">{{ $t('City') }}</label>
            <input
              v-model="client.city"
              @blur="saveClient(client)"
              class="w-full border border-gray-300 px-2 py-1.5 text-gray-900 placeholder-gray-300 focus:outline-none focus:border-gray-900"
            />
          </div>
          <div class="col-span-2">
            <label class="block text-[8pt] text-gray-500 mb-0.5">{{ $t('Country') }}</label>
            <input
              v-model="client.country"
              @blur="saveClient(client)"
              class="w-full border border-gray-300 px-2 py-1.5 text-gray-900 placeholder-gray-300 focus:outline-none focus:border-gray-900"
            />
          </div>
          <div class="col-span-2">
            <label class="block text-[8pt] text-gray-500 mb-0.5">{{ $t('Email') }}</label>
            <input
              v-model="client.email"
              @blur="saveClient(client)"
              class="w-full border border-gray-300 px-2 py-1.5 text-gray-900 placeholder-gray-300 focus:outline-none focus:border-gray-900"
            />
          </div>
        </div>

        <div class="mt-4 border-t border-gray-200 pt-4">
          <p class="text-[9pt] font-bold text-gray-900 mb-2">{{ $t('Positions') }}</p>
          <div class="space-y-2">
            <div
              v-for="(cp, i) in (client.positions ?? [])"
              :key="i"
              class="grid grid-cols-[1fr_80px_24px] gap-2 items-end text-[9pt]"
            >
              <div>
                <label v-if="i === 0" class="block text-[8pt] text-gray-500 mb-0.5">{{ $t('Position') }}</label>
                <div class="border border-gray-300 px-2 py-1 text-gray-900">
                  {{ positionLabel(cp.positionId) }}
                </div>
              </div>
              <div>
                <label v-if="i === 0" class="block text-[8pt] text-gray-500 mb-0.5">{{ $t('Price') }}</label>
                <input
                  :value="cp.price"
                  @blur="updatePositionPrice(client, i, ($event.target as HTMLInputElement).value)"
                  type="number"
                  step="0.01"
                  class="w-full border border-gray-300 px-2 py-1 text-gray-900 font-mono text-right focus:outline-none focus:border-gray-900"
                />
              </div>
              <button @click="removePosition(client, i)" class="text-gray-300 hover:text-red-500 pb-1">&times;</button>
            </div>
          </div>
          <div class="relative mt-2">
            <button
              @click="togglePositionPicker(client.id!)"
              class="text-[8pt] text-gray-400 hover:text-black"
            >+ {{ $t('Add position') }}</button>
            <ul
              v-if="pickerOpenFor === client.id"
              class="absolute left-0 top-full mt-1 w-80 bg-white border border-gray-300 shadow-lg z-20 max-h-48 overflow-y-auto"
            >
              <li
                v-for="pos in availablePositions(client)"
                :key="pos.id"
                @click="assignPosition(client, pos)"
                class="px-3 py-2 text-[9pt] cursor-pointer hover:bg-gray-100 border-b border-gray-50 last:border-0 flex justify-between"
              >
                <span>{{ pos.description }} <span v-if="pos.code" class="text-gray-400">{{ pos.code }}</span></span>
                <span class="text-gray-400 font-mono">{{ pos.defaultPrice.toFixed(2) }}</span>
              </li>
              <li v-if="availablePositions(client).length === 0" class="px-3 py-2 text-[9pt] text-gray-400 italic">
                {{ $t('All positions assigned') }}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <button
      @click="addClient"
      class="mt-6 px-4 py-2 text-[9pt] bg-black text-white hover:bg-gray-800 transition-colors"
    >+ {{ $t('New client') }}</button>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { db } from '@/db';
import type { Client, Position } from '@/db';
import { useDocumentsStore } from '@/stores/documents';

const documentsStore = useDocumentsStore();
const clients = ref<Client[]>([]);
const allPositions = ref<Position[]>([]);
const pickerOpenFor = ref<number | null>(null);

async function loadClients() {
  clients.value = await db.clients.toArray();
  allPositions.value = await db.positions.toArray();
}

onMounted(() => {
  loadClients();
  document.addEventListener('click', onClickOutside, true);
});
onUnmounted(() => document.removeEventListener('click', onClickOutside, true));

function onClickOutside(e: MouseEvent) {
  if (pickerOpenFor.value && !(e.target as Element).closest('.relative')) {
    pickerOpenFor.value = null;
  }
}

function positionLabel(positionId: number): string {
  const pos = allPositions.value.find(p => p.id === positionId);
  if (!pos) return '—';
  return pos.code ? `${pos.description} (${pos.code})` : pos.description;
}

function availablePositions(client: Client): Position[] {
  const assigned = new Set((client.positions ?? []).map(cp => cp.positionId));
  return allPositions.value.filter(p => !assigned.has(p.id!));
}

function togglePositionPicker(clientId: number) {
  pickerOpenFor.value = pickerOpenFor.value === clientId ? null : clientId;
}

function assignPosition(client: Client, pos: Position) {
  if (!client.positions) client.positions = [];
  client.positions.push({ positionId: pos.id!, price: pos.defaultPrice });
  pickerOpenFor.value = null;
  saveClient(client);
}

async function nextKundennummer(): Promise<string> {
  const all = await db.clients.toArray();
  const nums = all.map(c => parseInt(c.customerNumber, 10)).filter(n => !isNaN(n));
  const max = nums.length ? Math.max(...nums) : 0;
  return String(max + 1).padStart(4, '0');
}

async function addClient() {
  const customerNumber = await nextKundennummer();
  await db.clients.add({
    customerNumber,
    company: '',
    name: '',
    street: '',
    zip: '',
    city: '',
    country: '',
    email: '',
  });
  await loadClients();
  await documentsStore.load();
}

async function saveClient(client: Client) {
  if (!client.id) return;
  await db.clients.update(client.id, { ...client });
  await documentsStore.load();
}

async function deleteClient(id: number) {
  await db.clients.delete(id);
  await loadClients();
  await documentsStore.load();
}

function removePosition(client: Client, index: number) {
  client.positions?.splice(index, 1);
  saveClient(client);
}

function updatePositionPrice(client: Client, index: number, value: string) {
  if (!client.positions) return;
  client.positions[index].price = parseFloat(value) || 0;
  saveClient(client);
}
</script>
