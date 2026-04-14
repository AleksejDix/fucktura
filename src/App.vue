<template>
  <BootGate>
    <div v-if="!documentsStore.loading" class="h-screen print:h-auto grid grid-cols-[11rem_20rem_1fr] grid-rows-[2rem_1fr_1.5rem] print:grid-cols-1 print:grid-rows-1">
      <DMenuBar @generate-pdf="printPage" class="col-span-3 print:hidden" />
      <DCollectionsSidebar class="print:hidden" />
      <DSidebar class="print:hidden" />
      <main class="overflow-auto print:bg-transparent space-y-4 print:space-y-0 p-4 print:p-0 pagination">
        <DErrorBoundary>
          <router-view />
        </DErrorBoundary>
      </main>
      <DStatusBar class="col-span-3" />
    </div>
    <main v-else>
      <h2>{{ $t('Loading') }}</h2>
    </main>
    <DCommandPalette v-model:open="palette.open" />
  </BootGate>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
import { i18n } from '@/i18n';
import { useRouter } from 'vue-router';
import { useDocumentsStore } from '@/stores/documents';
import { usePaletteStore } from '@/stores/palette';
import DSidebar from './components/DSidebar.vue';
import DMenuBar from './components/DMenuBar.vue';
import BootGate from './components/BootGate.vue';
import DCommandPalette from './components/DCommandPalette.vue';
import DStatusBar from './components/DStatusBar.vue';
import DErrorBoundary from './components/DErrorBoundary.vue';
import DCollectionsSidebar from './components/DCollectionsSidebar.vue';

const router = useRouter();
const documentsStore = useDocumentsStore();
const palette = usePaletteStore();

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
