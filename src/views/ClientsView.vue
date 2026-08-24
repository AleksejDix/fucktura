<template>
  <DSheet :title="$t('Clients')">
    <div class="space-y-8">
      <DClientCard v-for="client in clients" :key="client.customerNumber" :client="client" />
    </div>

    <button
      @click="addClient"
      class="mt-6 px-4 py-2 text-[9pt] bg-black text-white hover:bg-gray-800 transition-colors"
    >
      + {{ $t('New client') }}
    </button>
  </DSheet>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Client } from '@/fs/types';
import { useDocumentsStore } from '@/stores/documents';
import DSheet from '@/components/DSheet.vue';
import DClientCard from '@/components/DClientCard.vue';

const documentsStore = useDocumentsStore();
const clients = computed<Client[]>(() => documentsStore.clients);

function nextCustomerNumber(): string {
  const nums = clients.value.map((c) => parseInt(c.customerNumber, 10)).filter((n) => !isNaN(n));
  const max = nums.length ? Math.max(...nums) : 0;
  return String(max + 1).padStart(4, '0');
}

async function addClient() {
  await documentsStore.saveClient({
    customerNumber: nextCustomerNumber(),
    company: '',
    name: '',
    street: '',
    zip: '',
    city: '',
    country: '',
    email: '',
  });
}
</script>
