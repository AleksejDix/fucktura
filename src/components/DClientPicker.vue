<template>
  <div class="relative print:hidden" v-if="!hasClient">
    <button
      @click="open = !open"
      class="w-full h-[27mm] border-2 border-dashed border-gray-300 text-[9pt] leading-relaxed text-gray-400 hover:border-gray-900 hover:text-gray-900 transition-colors cursor-pointer flex items-center justify-center flex-col gap-1"
    >
      <span class="text-[20pt]">+</span>
      <span>{{ $t('Select client') }}</span>
    </button>
    <ul
      v-if="open"
      class="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-200 shadow-lg z-20 max-h-60 overflow-y-auto"
    >
      <li
        v-for="client in clients"
        :key="client.customerNumber"
        @click="select(client)"
        class="px-3 py-2 text-[9pt] cursor-pointer hover:bg-gray-100 transition-colors border-b border-gray-50 last:border-0"
      >
        <div class="font-medium text-gray-900">{{ client.company || client.name }}</div>
        <div class="text-gray-400">{{ client.zip }} {{ client.city }}</div>
      </li>
      <li v-if="clients.length === 0" class="px-3 py-2 text-[9pt] text-gray-400 italic">
        {{ $t('No documents') }}
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import type { Client } from '@/fs/types';
import { useDocumentsStore } from '@/stores/documents';

const props = defineProps<{
  docNumber: string;
  hasClient: boolean;
}>();

const store = useDocumentsStore();
const clients = computed(() => store.clients);
const open = ref(false);

function select(client: Client) {
  open.value = false;
  store.assignClient(props.docNumber, client.customerNumber);
}

function onClickOutside(e: MouseEvent) {
  if (open.value && !(e.target as Element).closest('.relative')) {
    open.value = false;
  }
}

onMounted(() => document.addEventListener('click', onClickOutside, true));
onUnmounted(() => document.removeEventListener('click', onClickOutside, true));
</script>
