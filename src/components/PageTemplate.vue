<template>
  <section
    class="page w-[210mm] h-[297mm] print:m-0 rounded-sm bg-white shadow-xl relative mx-auto border-none pl-[26mm] pr-[15mm]"
    :class="{ 'print:hidden': !pagesStore.pages[pageIndex].enabled }"
  >
    <DCheckbox
      v-model="pagesStore.pages[pageIndex].enabled"
      :id="pageIndex.toString()"
      class="absolute right-[-16px] top-[-16px]"
      :custom-icons="{ on: Eye, off: EyeOff }"
    />
    <slot name="side-controls" />
    <div :class="{ 'opacity-20': !pagesStore.pages[pageIndex].enabled }">
      <!-- SN 010130: Letterhead max 38mm height -->
      <slot name="header">
        <header class="absolute top-0 left-0 right-0 w-full pl-[26mm] pr-[15mm] pt-[10mm] max-h-[38mm]" notranslate>
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

      <!-- SN 010130: Content starts below letterhead (38mm) -->
      <div class="pt-[38mm] pb-[20mm] max-h-[257mm] overflow-hidden">
        <slot />
      </div>

      <slot name="footer">
        <footer class="absolute bottom-0 left-0 right-0 w-full pl-[26mm] pr-[15mm] pb-[10mm]">
          <div class="border-t border-gray-200 pt-[3mm] text-[8pt] text-gray-500 leading-relaxed grid grid-cols-3 gap-4">
            <div>
              <div class="font-bold text-gray-600">Acme Consulting</div>
              <div>Bahnhofstrasse 1</div>
              <div>8001 Zürich</div>
            </div>
            <div>
              <div class="font-bold text-gray-600">Alex Example</div>
              <div>alex@acme.example</div>
              <div>www.acme.example</div>
            </div>
            <div>
              <div class="font-bold text-gray-600 font-mono">CH00 0000 0000 0000 0000 0</div>
              <div>Demo Bank</div>
              <div class="font-mono">DEMOCHZZXXX</div>
            </div>
          </div>
        </footer>
      </slot>
    </div>
  </section>
</template>

<script setup lang="ts">
import { formatDateLong } from '@/formatters/date';
import { useGlobalStore } from '@/stores/global';
import { usePagesStore } from '@/stores/pages';
import Agency from '@/components/Agency.vue';
import AgencyLogo from '@/components/AgencyLogo.vue';
import Agent from '@/components/Agent.vue';
import PageNumber from '@/components/PageNumber.vue';
import { Eye, EyeOff } from 'lucide-vue-next';
import DCheckbox from './DCheckbox.vue';
import HeaderAddress from './HeaderAddress.vue';

const global = useGlobalStore();
const pagesStore = usePagesStore();

defineProps({
  showIcon: { type: Boolean, default: true },
  pageIndex: { type: Number, default: 0 },
});
</script>
