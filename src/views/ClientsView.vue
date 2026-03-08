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
              v-for="(pos, i) in (client.positions ?? [])"
              :key="i"
              class="grid grid-cols-[1fr_120px_80px_24px] gap-2 items-end text-[9pt]"
            >
              <div>
                <label v-if="i === 0" class="block text-[8pt] text-gray-500 mb-0.5">{{ $t('Description') }}</label>
                <input
                  v-model="pos.description"
                  @blur="saveClient(client)"
                  class="w-full border border-gray-300 px-2 py-1 text-gray-900 focus:outline-none focus:border-gray-900"
                />
              </div>
              <div>
                <label v-if="i === 0" class="block text-[8pt] text-gray-500 mb-0.5">{{ $t('Description') }}</label>
                <input
                  v-model="pos.code"
                  @blur="saveClient(client)"
                  class="w-full border border-gray-300 px-2 py-1 text-gray-900 font-mono focus:outline-none focus:border-gray-900"
                />
              </div>
              <div>
                <label v-if="i === 0" class="block text-[8pt] text-gray-500 mb-0.5">{{ $t('Unit price') }}</label>
                <input
                  :value="pos.unitPrice"
                  @blur="updatePositionPrice(client, i, ($event.target as HTMLInputElement).value)"
                  type="number"
                  step="0.01"
                  class="w-full border border-gray-300 px-2 py-1 text-gray-900 font-mono text-right focus:outline-none focus:border-gray-900"
                />
              </div>
              <button @click="removePosition(client, i)" class="text-gray-300 hover:text-red-500 pb-1">&times;</button>
            </div>
          </div>
          <button
            @click="addPosition(client)"
            class="mt-2 text-[8pt] text-gray-400 hover:text-black"
          >+ {{ $t('Add position') }}</button>
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
import { ref, onMounted } from 'vue';
import { db } from '@/db';
import type { Client, ClientPosition } from '@/db';
import { useDocumentsStore } from '@/stores/documents';

const documentsStore = useDocumentsStore();
const clients = ref<Client[]>([]);

async function loadClients() {
  clients.value = await db.clients.toArray();
}

onMounted(loadClients);

async function addClient() {
  await db.clients.add({
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

function addPosition(client: Client) {
  if (!client.positions) client.positions = [];
  client.positions.push({ description: '', code: '', unitPrice: 0 });
  saveClient(client);
}

function removePosition(client: Client, index: number) {
  client.positions?.splice(index, 1);
  saveClient(client);
}

function updatePositionPrice(client: Client, index: number, value: string) {
  if (!client.positions) return;
  client.positions[index].unitPrice = parseFloat(value) || 0;
  saveClient(client);
}
</script>
