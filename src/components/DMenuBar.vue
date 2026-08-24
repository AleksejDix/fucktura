<template>
  <nav
    class="h-8 bg-white border-b border-gray-200 flex items-stretch text-[13px] z-50 select-none"
  >
    <DMenu
      v-for="menu in menus"
      :key="menu.label"
      :menu="menu"
      :open="openMenu === menu.label"
      @toggle="toggleMenu(menu.label)"
      @hover="openMenu && (openMenu = menu.label)"
      @run="runAction"
    />

    <div class="flex-1" />

    <div class="flex items-center gap-2 px-3">
      <DModeToggle />
    </div>
    <DAboutDialog :open="showAbout" @close="showAbout = false" />
  </nav>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import DModeToggle from './DModeToggle.vue';
import DMenu, { type Menu, type MenuItem } from './DMenu.vue';
import DAboutDialog from './DAboutDialog.vue';
import { useDocumentsStore } from '@/stores/documents';
import { useFolderStore } from '@/stores/folder';
import { useModeStore } from '@/stores/mode';
import { usePaletteStore } from '@/stores/palette';
import { useConfirmStore } from '@/stores/confirm';
import { useLetterNormStore } from '@/stores/letterNorm';
import { useGlobalShortcuts } from '@/composables/useGlobalShortcuts';
import { emailMailtoUrl } from '@/emails';

const { t, locale } = useI18n();
const store = useDocumentsStore();
const folder = useFolderStore();
const modeStore = useModeStore();
const palette = usePaletteStore();
const confirmStore = useConfirmStore();
const normStore = useLetterNormStore();
const router = useRouter();

const emit = defineEmits<{ 'generate-pdf': [] }>();

const openMenu = ref<string | null>(null);
const showAbout = ref(false);

function toggleMenu(label: string) {
  openMenu.value = openMenu.value === label ? null : label;
}

async function runAction(item: MenuItem) {
  if (item.disabled || !item.action) return;
  openMenu.value = null;
  await item.action();
}

function closeMenus(e: MouseEvent) {
  if (!(e.target as HTMLElement).closest('nav')) {
    openMenu.value = null;
  }
}

useGlobalShortcuts();

onMounted(() => document.addEventListener('click', closeMenus));
onUnmounted(() => document.removeEventListener('click', closeMenus));

const hasActiveDoc = computed(() => !!store.activeDocument);
const isQuote = computed(() => store.activeDocument?.type === 'quote');
const activeDoc = computed(() => store.activeDocument);
const activeType = computed(() => activeDoc.value?.type);
const activeStatus = computed(() => activeDoc.value?.status);

const activeClient = computed(() => {
  const cn = activeDoc.value?.customerNumber;
  return cn ? store.clients.find((c) => c.customerNumber === cn) : undefined;
});

function setLocale(lang: string) {
  locale.value = lang;
  document.documentElement.setAttribute('lang', lang);
  localStorage.setItem('locale', lang);
}

function sendEmail() {
  const doc = activeDoc.value;
  if (!doc) return;
  const to = doc.recipient.email || activeClient.value?.email || '';
  const typeLabel =
    doc.type === 'invoice'
      ? t('Invoice')
      : doc.type === 'quote'
        ? t('Quote')
        : doc.type === 'receipt'
          ? t('Receipt')
          : t('Reminder');
  window.open(emailMailtoUrl(doc, typeLabel, locale.value, to));
}

function statusItems(): MenuItem[] {
  if (!activeDoc.value) return [];
  const num = activeDoc.value.number;
  const s = activeStatus.value;
  const items: MenuItem[] = [];

  if (activeType.value === 'quote') {
    for (const status of ['draft', 'sent', 'accepted', 'rejected'] as const) {
      items.push({
        label: t(status),
        action: () => store.setStatus(num, status),
        checked: s === status,
      });
    }
  } else if (activeType.value === 'invoice') {
    for (const status of ['draft', 'sent', 'paid'] as const) {
      items.push({
        label: t(status),
        action: () => store.setStatus(num, status),
        checked: s === status,
      });
    }
  } else if (activeType.value === 'reminder') {
    for (const status of ['draft', 'sent'] as const) {
      items.push({
        label: t(status),
        action: () => store.setStatus(num, status),
        checked: s === status,
      });
    }
    // 'Settled' is derived from the linked invoice being paid, not a status of
    // its own — so the menu item drives the invoice, not the reminder.
    const related = activeDoc.value?.relatedInvoice;
    if (related) {
      const resolved = store.isReminderResolved(activeDoc.value!);
      items.push({ separator: true });
      items.push({
        label: t('settled'),
        checked: resolved,
        disabled: resolved,
        action: () => store.setStatus(related, 'paid'),
      });
    }
  }
  return items;
}

const menus = computed<Menu[]>(() => [
  {
    label: 'Fucktura',
    bold: true,
    brand: true,
    items: [
      {
        label: t('About Fucktura'),
        action: () => {
          showAbout.value = true;
        },
      },
      { separator: true },
      { label: t('Settings'), shortcut: '⌘,', action: () => router.push('/settings') },
      { label: t('Clients'), action: () => router.push('/clients') },
      { label: t('Positions'), action: () => router.push('/positions') },
    ],
  },
  {
    label: t('File'),
    items: [
      { label: t('Open Folder…'), shortcut: '⌘O', action: () => folder.openFolder() },
      ...(folder.recents.length > 1
        ? [
            { separator: true } as MenuItem,
            { label: t('Recent folders'), disabled: true } as MenuItem,
            ...folder.recents.slice(1).map(
              (r) =>
                ({
                  label: `📁 ${r.name}`,
                  action: () => folder.openRecent(r),
                }) as MenuItem,
            ),
            { label: t('Clear recent folders'), action: () => folder.clearRecents() } as MenuItem,
          ]
        : []),
      { separator: true },
      { label: t('New quote'), shortcut: '⌘N', action: () => store.createQuote() },
      { label: t('New invoice'), action: () => store.createInvoice() },
      {
        label: t('New reminder'),
        action: () =>
          store.createReminder(
            activeType.value === 'invoice' ? activeDoc.value?.number : undefined,
          ),
      },
      { label: t('New receipt'), action: () => store.createReceipt() },
      { separator: true },
      { label: t('Print / PDF'), shortcut: '⌘P', action: () => emit('generate-pdf') },
      {
        label: t('Send email'),
        shortcut: '⌘⇧E',
        action: sendEmail,
        disabled: !hasActiveDoc.value,
        hidden: !hasActiveDoc.value,
      },
    ],
  },
  {
    label: t('Edit'),
    items: [
      { label: t('Find document…'), shortcut: '⌘K', action: () => palette.toggle() },
      { separator: true },
      {
        label: t('Duplicate'),
        shortcut: '⌘D',
        action: () => store.activeDocument && store.duplicateDocument(store.activeDocument.number),
        disabled: !hasActiveDoc.value,
      },
      { separator: true },
      {
        label: t('Add line item'),
        shortcut: '⌘⇧L',
        action: () => store.addLineItemToActive(),
        disabled: !hasActiveDoc.value,
      },
      {
        label: t('Clear line items'),
        action: () => store.clearLineItems(),
        disabled: !hasActiveDoc.value,
      },
      { separator: true },
      {
        label: t('Reset recipient'),
        action: () => store.resetRecipient(),
        disabled: !hasActiveDoc.value,
      },
    ],
  },
  {
    label: t('Document'),
    items: [
      { label: t('All documents'), action: () => store.setActive(null) },
      {
        label: t('Next document'),
        shortcut: '⌘]',
        action: () => store.nextDocument(),
        disabled: store.documents.length < 2,
      },
      {
        label: t('Previous document'),
        shortcut: '⌘[',
        action: () => store.previousDocument(),
        disabled: store.documents.length < 2,
      },
      { separator: true },
      ...statusItems(),
      { separator: true, hidden: !hasActiveDoc.value },
      {
        label: t('Convert to invoice'),
        shortcut: '⌘⇧I',
        action: () => store.convertToInvoice(store.activeDocument!.number),
        disabled: !isQuote.value,
        hidden: !hasActiveDoc.value,
      },
      { separator: true, hidden: !isQuote.value || !hasActiveDoc.value },
      {
        label: t('Delete'),
        shortcut: '⌘⌫',
        action: async () => {
          const doc = store.activeDocument;
          if (!doc) return;
          const ok = await confirmStore.ask({
            message: t('Delete document confirm', { number: doc.number }),
            confirmLabel: t('Delete'),
            destructive: true,
          });
          if (ok) store.deleteDocument(doc.number);
        },
        disabled: !hasActiveDoc.value,
        destructive: true,
      },
    ],
  },
  {
    label: t('View'),
    items: [
      {
        label: 'SN 010130 (CH)',
        action: () => {
          normStore.norm = 'SN010130';
        },
        checked: normStore.norm === 'SN010130',
      },
      {
        label: 'DIN 5008 (DE)',
        action: () => {
          normStore.norm = 'DIN5008';
        },
        checked: normStore.norm === 'DIN5008',
      },
      {
        label: 'NEN 1026 (NL)',
        action: () => {
          normStore.norm = 'NEN1026';
        },
        checked: normStore.norm === 'NEN1026',
      },
      {
        label: 'UNE (ES)',
        action: () => {
          normStore.norm = 'UNE';
        },
        checked: normStore.norm === 'UNE',
      },
      { separator: true },
      { label: 'Deutsch', action: () => setLocale('de'), checked: locale.value === 'de' },
      { label: 'English', action: () => setLocale('en'), checked: locale.value === 'en' },
      { label: 'Español', action: () => setLocale('es'), checked: locale.value === 'es' },
      { label: 'Nederlands', action: () => setLocale('nl'), checked: locale.value === 'nl' },
      { label: 'Русский', action: () => setLocale('ru'), checked: locale.value === 'ru' },
    ],
  },
  {
    label: t('Help'),
    items: [
      {
        label: t('Fucktura Help'),
        action: () => {
          window.open('https://github.com/AleksejDix/fucktura', '_blank');
        },
      },
    ],
  },
]);
</script>
