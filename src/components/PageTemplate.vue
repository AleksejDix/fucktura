<template>
  <section
    class="page w-[210mm] h-[297mm] print:m-0 rounded-sm bg-white shadow-xl relative mx-auto border-none pl-[var(--norm-ml)] pr-[var(--norm-mr)]"
    :class="[letterNorm.normClass, { 'print:hidden': !pagesStore.pages[pageIndex].enabled }]"
  >
    <DCheckbox
      v-model="pagesStore.pages[pageIndex].enabled"
      :id="pageIndex.toString()"
      class="absolute right-[-16px] top-[-16px]"
      :custom-icons="{ on: Eye, off: EyeOff }"
    />
    <slot name="side-controls" />
    <div :class="{ 'opacity-20': !pagesStore.pages[pageIndex].enabled }">
      <slot name="header">
        <header
          class="absolute top-0 left-0 right-0 w-full pt-[10mm] pl-[var(--norm-ml)] pr-[var(--norm-mr)] max-h-[var(--norm-header-h)]"
          notranslate
        >
          <div class="flex items-start justify-between">
            <div class="h-[15mm] flex items-center">
              <HeaderAddress :address="global.data?.address" />
            </div>
            <div class="flex justify-end">
              <AgencyLogo />
            </div>
          </div>
        </header>
      </slot>

      <div class="pt-[var(--norm-header-h)] pb-[20mm] max-h-[var(--norm-content-h)] overflow-hidden">
        <slot />
      </div>

      <slot name="footer">
        <footer class="absolute bottom-0 left-0 right-0 w-full pb-[10mm] pl-[var(--norm-ml)] pr-[var(--norm-mr)]">
          <div class="border-t border-gray-200 pt-[3mm] text-[8pt] text-gray-500 leading-relaxed grid grid-cols-3 gap-4">
            <div>
              <div class="font-bold text-gray-600">Dix Consulting</div>
              <div>Glärnischstrasse 214</div>
              <div>8708 Männedorf</div>
            </div>
            <div>
              <div class="font-bold text-gray-600">Lidia Dix</div>
              <div>lidia@dix.consulting</div>
              <div>www.dix.consulting</div>
            </div>
            <div>
              <div class="font-bold text-gray-600 font-mono">CH58 0070 0114 8057 5961 3</div>
              <div>Zürcher Kantonalbank</div>
              <div class="font-mono">ZKBKCHZZ80A</div>
            </div>
          </div>
        </footer>
      </slot>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useGlobalStore } from '@/stores/global';
import { usePagesStore } from '@/stores/pages';
import { useLetterNormStore } from '@/stores/letterNorm';
import AgencyLogo from '@/components/AgencyLogo.vue';
import { Eye, EyeOff } from 'lucide-vue-next';
import DCheckbox from './DCheckbox.vue';
import HeaderAddress from './HeaderAddress.vue';

const global = useGlobalStore();
const pagesStore = usePagesStore();
const letterNorm = useLetterNormStore();

defineProps({
  showIcon: { type: Boolean, default: true },
  pageIndex: { type: Number, default: 0 },
});
</script>
