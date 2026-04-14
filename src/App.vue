<template>
  <BootGate>
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
  </BootGate>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
import { i18n } from '@/i18n';
import { useRouter } from 'vue-router';
import { useDocumentsStore } from '@/stores/documents';
import DSidebar from './components/DSidebar.vue';
import DMenuBar from './components/DMenuBar.vue';
import BootGate from './components/BootGate.vue';

const router = useRouter();
const documentsStore = useDocumentsStore();

documentsStore.setNavigator((number) => {
  const target = number ? `/${number}` : '/';
  if (router.currentRoute.value.path !== target) {
    router.push(target);
  }
});

function printPage() {
  const doc = documentsStore.activeDocument;
  const originalTitle = document.title;
  if (doc) {
    document.title = doc.number;
  }
  window.print();
  document.title = originalTitle;
}

function onFocus() {
  if (documentsStore.senders.length > 0) {
    documentsStore.load();
  }
}

onMounted(() => window.addEventListener('focus', onFocus));
onUnmounted(() => window.removeEventListener('focus', onFocus));

const supported = ['de', 'en', 'es', 'nl', 'ru'];
const saved = localStorage.getItem('locale');
const browserLang = navigator.language.split('-')[0];
const locale = (saved && supported.includes(saved)) ? saved : supported.includes(browserLang) ? browserLang : 'en';
document.documentElement.setAttribute('lang', locale);
i18n.global.locale.value = locale;
</script>
