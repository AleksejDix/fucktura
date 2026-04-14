<template>
  <BootGate>
    <div
      v-if="!documentsStore.loading"
      class="h-screen print:h-auto grid grid-cols-[11rem_20rem_1fr] grid-rows-[2rem_1fr_1.5rem] print:grid-cols-1 print:grid-rows-1"
    >
      <DMenuBar @generate-pdf="printPage" class="col-span-3 print:hidden" />
      <DCollectionsSidebar class="print:hidden" />
      <DSidebar class="print:hidden" />
      <main
        class="overflow-auto print:bg-transparent space-y-4 print:space-y-0 p-4 print:p-0 pagination"
      >
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
    <DConfirmDialog />
  </BootGate>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue';
import { i18n } from '@/i18n';
import { useRouter } from 'vue-router';
import { useDocumentsStore } from '@/stores/documents';
import { usePaletteStore } from '@/stores/palette';
import { isDocument } from '@/fs/validate';
import DSidebar from './components/DSidebar.vue';
import DMenuBar from './components/DMenuBar.vue';
import BootGate from './components/BootGate.vue';
import DCommandPalette from './components/DCommandPalette.vue';
import DStatusBar from './components/DStatusBar.vue';
import DErrorBoundary from './components/DErrorBoundary.vue';
import DCollectionsSidebar from './components/DCollectionsSidebar.vue';
import DConfirmDialog from './components/DConfirmDialog.vue';

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

// Sync the dock/taskbar badge with the overdue count (PWA only).
type BadgeNav = Navigator & {
  setAppBadge?: (count?: number) => Promise<void>;
  clearAppBadge?: () => Promise<void>;
};
watch(
  () => documentsStore.viewCount('overdue'),
  (n) => {
    const nav = navigator as BadgeNav;
    if (!nav.setAppBadge || !nav.clearAppBadge) return;
    if (n > 0) nav.setAppBadge(n).catch(() => {});
    else nav.clearAppBadge().catch(() => {});
  },
  { immediate: true },
);

// File Handling API: double-clicking a JSON in Finder launches Fucktura
// here. Read the file, validate, and queue navigation to that doc once
// the store has finished loading.
type LaunchParams = { files: FileSystemFileHandle[] };
type WindowWithLaunch = Window & {
  launchQueue?: { setConsumer: (cb: (p: LaunchParams) => void) => void };
};
const pendingOpen = ref<string | null>(null);
const winLaunch = window as WindowWithLaunch;
winLaunch.launchQueue?.setConsumer(async ({ files }) => {
  if (!files?.length) return;
  for (const handle of files) {
    try {
      const text = await (await handle.getFile()).text();
      const parsed: unknown = JSON.parse(text);
      if (isDocument(parsed)) {
        pendingOpen.value = parsed.number;
        return;
      }
    } catch (e) {
      console.warn('[file-handler] could not open', handle.name, e);
    }
  }
});
watch([() => documentsStore.documents.length, pendingOpen], ([count, target]) => {
  if (count > 0 && target) {
    documentsStore.setActive(target);
    pendingOpen.value = null;
  }
});

const supported = ['de', 'en', 'es', 'nl', 'ru'];
const saved = localStorage.getItem('locale');
const browserLang = navigator.language.split('-')[0];
const locale =
  saved && supported.includes(saved) ? saved : supported.includes(browserLang) ? browserLang : 'en';
document.documentElement.setAttribute('lang', locale);
i18n.global.locale.value = locale;
</script>
