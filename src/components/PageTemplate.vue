<template>
  <section
    class="page w-[210mm] h-[296.99999999mm] print:m-0 rounded-sm bg-white shadow-xl relative mx-auto border-b px-[1cm] border-none"
    :class="{ 'print:hidden': !pagesStore.pages[pageIndex].enabled }"
  >
    <DCheckbox
      v-model="pagesStore.pages[pageIndex].enabled"
      :id="pageIndex.toString()"
      class="absolute right-[-16px] top-[-16px]"
      :custom-icons="{ on: 'fa-solid fa-eye', off: 'fa-solid fa-eye-slash' }"
    />
    <slot name="side-controls" />
    <div :class="{ 'opacity-20': !pagesStore.pages[pageIndex].enabled }">
      <slot name="header">
        <header class="absolute top-0 left-0 right-0 w-full px-[1cm]" notranslate>
          <div class="flex py-[0.5cm]">
            <div class="w-1/2 grow h-[1.5cm] flex items-center">
              <HeaderAddress :address="global.data?.address"></HeaderAddress>
            </div>

            <div class="w-1/2 grow flex justify-end-end">
              <AgencyLogo />
            </div>
          </div>
        </header>
      </slot>

      <div class="pt-[2.5cm] max-w-[19cm] max-h-[26.5cm] overflow-hidden">
        <slot />
      </div>

      <slot name="footer">
        <footer class="absolute bottom-0 left-0 right-0 w-full max-h-[3.5cm] overflow-hidden">
          <div class="mx-[1cm] py-[0.5cm] pb-[0.75cm]">
            <div>
              <div class="flex items-center justify-between gap-4">
                <Agent />
                <Agency />
              </div>
            </div>
            <div class="flex justify-end pt-2 space-x-2 divide-x-2">
              <div notranslate>
                {{ formatDateLong(new Date(global.data?.created || Date.now())) }}
              </div>
              <PageNumber :page-index="pageIndex" />
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
import DCheckbox from './DCheckbox.vue';
import HeaderAddress from './HeaderAddress.vue';

const global = useGlobalStore();
const pagesStore = usePagesStore();

defineProps({
  showIcon: { type: Boolean, default: true },
  pageIndex: { type: Number, default: 0 },
});
</script>
