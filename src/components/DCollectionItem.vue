<template>
  <button
    type="button"
    @click="store.setView(view.id)"
    class="w-full flex items-center justify-between gap-2 px-3 py-1 text-left text-[11px] transition-colors"
    :class="active ? 'bg-gray-900 text-white' : 'hover:bg-gray-200 text-gray-700'"
  >
    <span class="flex items-center gap-2 min-w-0">
      <span class="shrink-0 w-4 text-center">{{ view.icon }}</span>
      <span class="truncate">{{ view.label }}</span>
    </span>
    <span
      v-if="count > 0"
      class="shrink-0 text-[10px] font-mono"
      :class="active ? 'text-gray-400' : view.danger && count > 0 ? 'text-red-500' : 'text-gray-400'"
    >{{ count }}</span>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { ViewId } from '@/fs/types';
import { useDocumentsStore } from '@/stores/documents';

const store = useDocumentsStore();

const props = defineProps<{
  view: { id: ViewId; label: string; icon: string; danger?: boolean };
}>();

const active = computed(() => store.activeView === props.view.id);
const count = computed(() => store.viewCount(props.view.id));
</script>
