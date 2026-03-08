<template>
  <main
    v-if="global.loaded"
    class="bg-[#f1f4f8] print:bg-transparent space-y-[1cm] print:space-y-0 mt-4 print:mt-0 pagination"
  >
    <DControls @generate-pdf="generatePDF" />
    <Pages />
  </main>
  <main v-else>
    <h2>{{ $t('Loading') }}</h2>
  </main>
</template>

<script setup lang="ts">
import type { Theming } from '@/api/dossiers';
import { useLanguage } from '@/composables/language';
import { useGlobalStore } from '@/stores/global';
import Pages from '@/components/Pages.vue';
import DControls from './components/DControls.vue';

const global = useGlobalStore();

useLanguage();

async function generatePDF() {
  window.print();
}

const theming = computed(() => {
  if (global.data) {
    return global.data.theming;
  } else {
    return {} as Theming;
  }
});
</script>

<style lang="postcss">
main {
  --color-primary: v-bind('theming?.color1');
  --color-secondary: v-bind('theming?.color2');
  --color-tertiary: v-bind('theming?.color3');
}
</style>
