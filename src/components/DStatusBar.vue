<template>
  <footer
    class="bg-gray-50 border-t border-gray-200 text-[11px] text-gray-500 flex items-center justify-between px-3 gap-4 print:hidden select-none"
  >
    <div class="flex items-center gap-3 min-w-0">
      <span v-if="folder.currentName" class="flex items-center gap-1 shrink-0">
        <span>📁</span>
        <span class="font-mono text-gray-700 truncate">{{ folder.currentName }}</span>
      </span>
      <template v-if="doc">
        <span class="text-gray-300">·</span>
        <span class="flex items-center gap-1.5 min-w-0">
          <span class="shrink-0 w-1.5 h-1.5" :class="dotClass[doc.type]" />
          <span class="font-mono text-gray-700">{{ doc.number }}</span>
          <span v-if="doc.subtitle" class="truncate">{{ doc.subtitle }}</span>
        </span>
        <span v-if="total > 0" class="text-gray-300">·</span>
        <span v-if="total > 0" class="font-mono text-gray-700 shrink-0"
          >{{ currency }} {{ formatChf(total) }}</span
        >
      </template>
      <template v-else>
        <span class="text-gray-300">·</span>
        <span class="shrink-0">{{ store.filteredDocuments.length }} {{ $t('documents') }}</span>
      </template>
    </div>

    <div class="flex items-center gap-3 shrink-0">
      <DSaveIndicator />
    </div>
  </footer>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { DOC_TYPE_DOT_CLASS as dotClass } from '@/lib/documents';
import { useDocumentsStore } from '@/stores/documents';
import { useFolderStore } from '@/stores/folder';
import { useMoney } from '@/composables/useMoney';
import DSaveIndicator from './DSaveIndicator.vue';

const store = useDocumentsStore();
const folder = useFolderStore();
const { sumLineItems, sumAmounts, formatChf } = useMoney();

const doc = computed(() => store.activeDocument);
const total = computed(() => {
  if (!doc.value) return 0;
  if (doc.value.type === 'mahnung') {
    return sumAmounts(
      doc.value.offenerBetrag ?? 0,
      doc.value.mahngebuehr ?? 0,
      doc.value.verzugszins ?? 0,
    );
  }
  return sumLineItems(doc.value.lineItems ?? []);
});
const currency = computed(() => {
  const iban = doc.value?.sender?.accounts?.[0]?.iban ?? '';
  return iban.startsWith('CH') ? 'CHF' : 'EUR';
});
</script>
