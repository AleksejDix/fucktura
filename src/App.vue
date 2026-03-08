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
import { computed } from 'vue';
import type { Theming } from '@/api/dossiers';
import { i18n } from '@/i18n';
import { useGlobalStore } from '@/stores/global';
import Pages from '@/components/Pages.vue';
import DControls from './components/DControls.vue';

const global = useGlobalStore();

document.documentElement.setAttribute('lang', 'de');
i18n.global.locale.value = 'de';

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
  --primary-rgb: v-bind('theming?.color1');
  --secondary-rgb: v-bind('theming?.color2');
  --tertiary-rgb: v-bind('theming?.color3');
}
</style>
