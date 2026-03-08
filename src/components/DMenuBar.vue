<template>
  <nav class="h-8 bg-white border-b border-gray-200 flex items-stretch text-[13px] z-50 select-none">
    <div
      v-for="menu in menus"
      :key="menu.label"
      class="relative"
      @mouseenter="openMenu && (openMenu = menu.label)"
    >
      <button
        @click="toggleMenu(menu.label)"
        class="h-full px-3 flex items-center transition-colors"
        :class="[
          menu.bold ? 'font-bold' : '',
          openMenu === menu.label ? 'bg-black text-white' : 'text-gray-700 hover:bg-gray-100',
        ]"
      >{{ menu.label }}</button>

      <div
        v-if="openMenu === menu.label"
        class="absolute top-full left-0 min-w-[220px] bg-white shadow-xl border border-gray-200 py-1 z-50"
      >
        <template v-for="(item, i) in menu.items" :key="i">
          <div v-if="item.separator" class="border-t border-gray-200 my-1" />
          <button
            v-else-if="!item.hidden"
            @click="runAction(item)"
            :disabled="item.disabled"
            class="w-full flex items-center justify-between px-3 py-1.5 text-left text-[13px] transition-colors"
            :class="item.disabled ? 'text-gray-300 cursor-default' : item.destructive ? 'text-red-500 hover:bg-gray-100' : 'text-gray-800 hover:bg-black hover:text-white'"
          >
            <span class="flex items-center gap-2">
              <span class="w-4 text-center">{{ item.checked ? '✓' : '' }}</span>
              {{ item.label }}
            </span>
            <span v-if="item.shortcut" class="text-[11px] ml-4" :class="item.disabled ? 'text-gray-300' : 'text-gray-400'">{{ item.shortcut }}</span>
          </button>
        </template>
      </div>
    </div>

    <div class="flex-1" />

    <div class="flex items-center gap-2 px-3">
      <select
        v-if="store.senders.length > 1"
        :value="store.activeSenderId"
        @change="store.activeSenderId = Number(($event.target as HTMLSelectElement).value)"
        class="bg-transparent text-[12px] text-gray-600 border-none focus:outline-none cursor-pointer"
      >
        <option v-for="s in store.senders" :key="s.id" :value="s.id">{{ s.name }}</option>
      </select>
      <span v-else-if="store.activeSender" class="text-[12px] text-gray-500">{{ store.activeSender.name }}</span>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useDocumentsStore } from '@/stores/documents';
import { useModeStore } from '@/stores/mode';
import { useLetterNormStore } from '@/stores/letterNorm';

interface MenuItem {
  label?: string;
  shortcut?: string;
  action?: () => void;
  disabled?: boolean;
  hidden?: boolean;
  destructive?: boolean;
  separator?: boolean;
  checked?: boolean;
}

interface Menu {
  label: string;
  bold?: boolean;
  items: MenuItem[];
}

const { t, locale } = useI18n();
const store = useDocumentsStore();
const modeStore = useModeStore();
const normStore = useLetterNormStore();
const router = useRouter();

const emit = defineEmits<{ 'generate-pdf': [] }>();

const openMenu = ref<string | null>(null);

function toggleMenu(label: string) {
  openMenu.value = openMenu.value === label ? null : label;
}

function runAction(item: MenuItem) {
  if (item.disabled || !item.action) return;
  item.action();
  openMenu.value = null;
}

function closeMenus(e: MouseEvent) {
  if (!(e.target as HTMLElement).closest('nav')) {
    openMenu.value = null;
  }
}

onMounted(() => document.addEventListener('click', closeMenus));
onUnmounted(() => document.removeEventListener('click', closeMenus));

const hasActiveDoc = computed(() => !!store.activeDocument);
const isOfferte = computed(() => store.activeDocument?.type === 'offerte');
const activeDoc = computed(() => store.activeDocument);
const activeType = computed(() => activeDoc.value?.type);
const activeStatus = computed(() => activeDoc.value?.status);

function statusItems(): MenuItem[] {
  if (!activeDoc.value) return [];
  const id = activeDoc.value.id!;
  const s = activeStatus.value;
  const items: MenuItem[] = [];

  if (activeType.value === 'offerte') {
    for (const status of ['draft', 'sent', 'accepted', 'rejected'] as const) {
      items.push({ label: t(status), action: () => store.setStatus(id, status), checked: s === status });
    }
  } else if (activeType.value === 'invoice') {
    for (const status of ['draft', 'sent', 'paid'] as const) {
      items.push({ label: t(status), action: () => store.setStatus(id, status), checked: s === status });
    }
  } else if (activeType.value === 'mahnung') {
    for (const status of ['draft', 'sent'] as const) {
      items.push({ label: t(status), action: () => store.setStatus(id, status), checked: s === status });
    }
  }
  return items;
}

const menus = computed<Menu[]>(() => [
  {
    label: 'Fucktura',
    bold: true,
    items: [
      { label: t('About Fucktura'), action: () => {} },
      { separator: true },
      { label: t('Settings'), shortcut: '⌘,', action: () => router.push('/settings') },
    ],
  },
  {
    label: t('File'),
    items: [
      { label: t('New Offerte'), shortcut: '⌘N', action: () => store.createOfferte() },
      { separator: true },
      { label: t('Convert to invoice'), shortcut: '⌘⇧I', action: () => store.convertToInvoice(store.activeDocument!.id!), disabled: !isOfferte.value, hidden: !hasActiveDoc.value },
      { separator: true, hidden: !hasActiveDoc.value },
      { label: t('Clients'), action: () => router.push('/clients') },
      { separator: true },
      { label: t('Print / PDF'), shortcut: '⌘P', action: () => emit('generate-pdf') },
    ],
  },
  {
    label: t('Edit'),
    items: [
      { label: t('Undo'), shortcut: '⌘Z', action: () => document.execCommand('undo') },
      { label: t('Redo'), shortcut: '⌘⇧Z', action: () => document.execCommand('redo') },
      { separator: true },
      { label: t('Cut'), shortcut: '⌘X', action: () => document.execCommand('cut') },
      { label: t('Copy'), shortcut: '⌘C', action: () => document.execCommand('copy') },
      { label: t('Paste'), shortcut: '⌘V', action: () => document.execCommand('paste') },
      { separator: true },
      { label: t('Select all'), shortcut: '⌘A', action: () => document.execCommand('selectAll') },
    ],
  },
  {
    label: t('Document'),
    items: [
      { label: t('All documents'), action: () => store.setActive(null) },
      { separator: true },
      ...statusItems(),
      { separator: true, hidden: !hasActiveDoc.value },
      { label: t('Delete'), shortcut: '⌘⌫', action: () => store.activeDocument && store.deleteDocument(store.activeDocument.id!), disabled: !hasActiveDoc.value, destructive: true },
    ],
  },
  {
    label: t('View'),
    items: [
      { label: 'SN 010130 (CH)', action: () => { normStore.norm = 'SN010130'; }, checked: normStore.norm === 'SN010130' },
      { label: 'DIN 5008 (DE)', action: () => { normStore.norm = 'DIN5008'; }, checked: normStore.norm === 'DIN5008' },
      { separator: true },
      { label: 'Deutsch', action: () => { locale.value = 'de'; } },
      { label: 'English', action: () => { locale.value = 'en'; } },
      { label: 'Español', action: () => { locale.value = 'es'; } },
      { separator: true },
      { label: t('Edit mode'), action: () => { modeStore.mode = modeStore.mode === 'edit' ? 'read' : 'edit'; } },
    ],
  },
]);
</script>
