<template>
  <div v-if="!documentsStore.loading" class="h-screen print:h-auto grid grid-cols-[20rem_1fr] grid-rows-[2rem_1fr] print:grid-cols-1 print:grid-rows-1">
    <DMenuBar @generate-pdf="printPage" class="col-span-2 print:hidden" />
    <DSidebar class="print:hidden" />
    <main class="overflow-auto print:bg-transparent space-y-4 print:space-y-0 p-4 print:p-0 pagination">
      <router-view />
    </main>
  </div>
  <main v-else>
    <h2>{{ $t('Loading') }}</h2>
  </main>
</template>

<script setup lang="ts">
import { i18n } from '@/i18n';
import { useRouter } from 'vue-router';
import { useDocumentsStore } from '@/stores/documents';
import DSidebar from './components/DSidebar.vue';
import DMenuBar from './components/DMenuBar.vue';

const router = useRouter();
const documentsStore = useDocumentsStore();
documentsStore.load();

documentsStore.setNavigator((id) => {
  const target = id ? `/${id}` : '/';
  if (router.currentRoute.value.path !== target) {
    router.push(target);
  }
});

function printPage() {
  window.print();
}

document.documentElement.setAttribute('lang', 'de');
i18n.global.locale.value = 'de';
</script>
