<template>
  <section
    class="page w-[210mm] h-[297mm] print:m-0 bg-white relative mx-auto pl-[var(--norm-ml)] pr-[var(--norm-mr)] shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] print:shadow-none"
    :class="[letterNorm.normClass, { 'print:hidden': !pagesStore.pages[pageIndex].enabled }]"
  >
    <div class="absolute -right-10 top-0 flex flex-col gap-1 print:hidden">
      <button
        @click="pagesStore.pages[pageIndex].enabled = !pagesStore.pages[pageIndex].enabled"
        class="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-black transition-colors"
        :class="{ 'text-black': pagesStore.pages[pageIndex].enabled, 'text-gray-300': !pagesStore.pages[pageIndex].enabled }"
      >
        <component :is="pagesStore.pages[pageIndex].enabled ? Eye : EyeOff" :size="16" />
      </button>
    </div>
    <slot name="side-controls" />
    <div :class="{ 'opacity-20': !pagesStore.pages[pageIndex].enabled }">
      <slot name="header" />

      <div class="pt-[var(--norm-header-h)] pb-[20mm] max-h-[var(--norm-content-h)] overflow-hidden">
        <slot />
      </div>

      <slot name="footer">
        <footer class="absolute bottom-0 left-0 right-0 w-full pb-[10mm] pl-[var(--norm-ml)] pr-[var(--norm-mr)]">
          <div class="border-t border-gray-200 pt-[3mm] text-[8pt] text-gray-500 leading-relaxed grid grid-cols-3 gap-4">
            <div>
              <div class="font-bold text-gray-600">{{ sender?.contact || sender?.company }}</div>
              <div>{{ sender?.street }}</div>
              <div>{{ sender?.zip }} {{ sender?.city }}</div>
            </div>
            <div v-for="account in sender?.accounts" :key="account.iban">
              <div class="font-bold text-gray-600">{{ account.iban }}</div>
              <div>{{ account.bank }}</div>
              <div>{{ account.bic }}</div>
            </div>
          </div>
        </footer>
      </slot>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { usePagesStore } from '@/stores/pages';
import { useLetterNormStore } from '@/stores/letterNorm';
import { Eye, EyeOff } from 'lucide-vue-next';
import type { SenderSnapshot } from '@/db';

const pagesStore = usePagesStore();
const letterNorm = useLetterNormStore();

const props = defineProps({
  showIcon: { type: Boolean, default: true },
  pageIndex: { type: Number, default: 0 },
});

const sender = computed(() => pagesStore.pages[props.pageIndex]?.metadata?.sender as SenderSnapshot | undefined);
</script>
