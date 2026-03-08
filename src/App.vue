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
</script>
