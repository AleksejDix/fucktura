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
            @click.stop="runAction(item)"
            :disabled="item.disabled"
            class="w-full flex items-center justify-between px-3 py-1.5 text-left text-[13px] transition-colors"
            :class="[
              item.disabled ? 'text-gray-300 cursor-default' : item.destructive ? 'text-red-500 hover:bg-gray-100' : 'text-gray-800 hover:bg-black hover:text-white',
              item.strikethrough ? 'line-through decoration-gray-400' : '',
            ]"
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
      <DSaveIndicator />
      <select
        v-if="store.senders.length > 1"
        :value="store.activeSenderKey"
        @change="store.activeSenderKey = ($event.target as HTMLSelectElement).value"
        class="bg-transparent text-[12px] text-gray-600 border-none focus:outline-none cursor-pointer"
      >
        <option v-for="s in store.senders" :key="s.key" :value="s.key">{{ s.company }}</option>
      </select>
      <span v-else-if="store.activeSender" class="text-[12px] text-gray-500">{{ store.activeSender.company }}</span>
    </div>
    <Teleport to="body">
      <div v-if="showAbout" class="fixed inset-0 z-[100] flex items-center justify-center bg-black/30" @click.self="showAbout = false">
        <div class="bg-white w-[300px] p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] text-center">
          <p class="text-[18pt] font-bold">Fucktura</p>
          <p class="text-[9pt] text-gray-500 mt-1">v1.0.0</p>
          <p class="text-[9pt] text-gray-600 mt-4">{{ t('About description') }}</p>
          <p class="text-[8pt] text-gray-400 mt-4">Made by Aleksej Dix</p>
          <button @click="showAbout = false" class="mt-4 px-4 py-1.5 text-[9pt] bg-black text-white hover:bg-gray-800">OK</button>
        </div>
      </div>
    </Teleport>
  </nav>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import DSaveIndicator from './DSaveIndicator.vue';
import { useDocumentsStore } from '@/stores/documents';
import { useFolderStore } from '@/stores/folder';
import { useModeStore } from '@/stores/mode';
import { useLetterNormStore } from '@/stores/letterNorm';
import { useMoney } from '@/composables/useMoney';
import { useDate } from '@/composables/useDate';

interface MenuItem {
  label?: string;
  shortcut?: string;
  action?: () => void | Promise<void>;
  disabled?: boolean;
  hidden?: boolean;
  destructive?: boolean;
  separator?: boolean;
  checked?: boolean;
  strikethrough?: boolean;
}

interface Menu {
  label: string;
  bold?: boolean;
  items: MenuItem[];
}

const { t, locale } = useI18n();
const store = useDocumentsStore();
const folder = useFolderStore();
const modeStore = useModeStore();
const normStore = useLetterNormStore();
const router = useRouter();
const { sumLineItems, formatChf, sumAmounts } = useMoney();
const { formatDate: fmtDate } = useDate();

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

function onKeydown(e: KeyboardEvent) {
  if ((e.metaKey || e.ctrlKey) && !e.shiftKey && !e.altKey && e.key.toLowerCase() === 'o') {
    e.preventDefault();
    folder.openFolder();
  }
}

onMounted(() => {
  document.addEventListener('click', closeMenus);
  document.addEventListener('keydown', onKeydown);
});
onUnmounted(() => {
  document.removeEventListener('click', closeMenus);
  document.removeEventListener('keydown', onKeydown);
});

const hasActiveDoc = computed(() => !!store.activeDocument);
const isOfferte = computed(() => store.activeDocument?.type === 'offerte');
const activeDoc = computed(() => store.activeDocument);
const activeType = computed(() => activeDoc.value?.type);
const activeStatus = computed(() => activeDoc.value?.status);

const activeClient = computed(() => {
  const cn = activeDoc.value?.customerNumber;
  return cn ? store.clients.find(c => c.customerNumber === cn) : undefined;
});

function emailBody(): string {
  const doc = activeDoc.value;
  if (!doc) return '';
  const sender = doc.sender;
  const recipient = doc.recipient;
  const name = recipient.name || recipient.company;
  const lang = locale.value;

  const bodies: Record<string, Record<string, (d: typeof doc) => string>> = {
    de: {
      offerte: (d) => {
        const total = formatChf(sumLineItems(d.lineItems ?? []));
        return `Guten Tag ${name}

Anbei erhalten Sie unsere Offerte ${d.number} vom ${fmtDate(d.meta.date)}.

Offertbetrag: CHF ${total}
Gültig bis: ${fmtDate(d.meta.validUntil)}

${d.subtitle ? `Betreff: ${d.subtitle}\n\n` : ''}Bei Fragen stehen wir Ihnen gerne zur Verfügung.

Freundliche Grüsse
${sender.contact || sender.company}
${sender.company}${sender.email ? `\n${sender.email}` : ''}`;
      },
      invoice: (d) => {
        const total = formatChf(sumLineItems(d.lineItems ?? []));
        return `Guten Tag ${name}

Anbei erhalten Sie unsere Rechnung ${d.number} vom ${fmtDate(d.meta.date)}.

Rechnungsbetrag: CHF ${total}
Zahlbar bis: ${fmtDate(d.meta.dueDate)}

${d.subtitle ? `Betreff: ${d.subtitle}\n\n` : ''}Bei Fragen stehen wir Ihnen gerne zur Verfügung.

Freundliche Grüsse
${sender.contact || sender.company}
${sender.company}${sender.email ? `\n${sender.email}` : ''}`;
      },
      mahnung: (d) => {
        const total = formatChf(sumAmounts(d.offenerBetrag ?? 0, d.mahngebuehr ?? 0, d.verzugszins ?? 0));
        return `Guten Tag ${name}

Leider haben wir für die Rechnung ${d.number} vom ${fmtDate(d.meta.invoiceDate) || fmtDate(d.meta.date)} noch keinen Zahlungseingang feststellen können.

Offener Betrag: CHF ${total}
Fällig seit: ${fmtDate(d.meta.overdueSince)}
Zahlbar bis: ${fmtDate(d.meta.dueDate)}

Wir bitten Sie, den ausstehenden Betrag innert der genannten Frist zu überweisen.

Freundliche Grüsse
${sender.contact || sender.company}
${sender.company}${sender.email ? `\n${sender.email}` : ''}`;
      },
    },
    en: {
      offerte: (d) => {
        const total = formatChf(sumLineItems(d.lineItems ?? []));
        return `Dear ${name}

Please find attached our quote ${d.number} dated ${fmtDate(d.meta.date)}.

Quote amount: CHF ${total}
Valid until: ${fmtDate(d.meta.validUntil)}

${d.subtitle ? `Subject: ${d.subtitle}\n\n` : ''}Please do not hesitate to contact us if you have any questions.

Kind regards
${sender.contact || sender.company}
${sender.company}${sender.email ? `\n${sender.email}` : ''}`;
      },
      invoice: (d) => {
        const total = formatChf(sumLineItems(d.lineItems ?? []));
        return `Dear ${name}

Please find attached our invoice ${d.number} dated ${fmtDate(d.meta.date)}.

Invoice amount: CHF ${total}
Due date: ${fmtDate(d.meta.dueDate)}

${d.subtitle ? `Subject: ${d.subtitle}\n\n` : ''}Please do not hesitate to contact us if you have any questions.

Kind regards
${sender.contact || sender.company}
${sender.company}${sender.email ? `\n${sender.email}` : ''}`;
      },
      mahnung: (d) => {
        const total = formatChf(sumAmounts(d.offenerBetrag ?? 0, d.mahngebuehr ?? 0, d.verzugszins ?? 0));
        return `Dear ${name}

We have not yet received payment for invoice ${d.number} dated ${fmtDate(d.meta.invoiceDate) || fmtDate(d.meta.date)}.

Outstanding amount: CHF ${total}
Overdue since: ${fmtDate(d.meta.overdueSince)}
Due date: ${fmtDate(d.meta.dueDate)}

We kindly ask you to settle the outstanding amount within the stated deadline.

Kind regards
${sender.contact || sender.company}
${sender.company}${sender.email ? `\n${sender.email}` : ''}`;
      },
    },
    es: {
      offerte: (d) => {
        const total = formatChf(sumLineItems(d.lineItems ?? []));
        return `Estimado/a ${name}

Adjunto le enviamos nuestro presupuesto ${d.number} del ${fmtDate(d.meta.date)}.

Importe: CHF ${total}
Válido hasta: ${fmtDate(d.meta.validUntil)}

${d.subtitle ? `Asunto: ${d.subtitle}\n\n` : ''}Quedamos a su disposición para cualquier consulta.

Atentamente
${sender.contact || sender.company}
${sender.company}${sender.email ? `\n${sender.email}` : ''}`;
      },
      invoice: (d) => {
        const total = formatChf(sumLineItems(d.lineItems ?? []));
        return `Estimado/a ${name}

Adjunto le enviamos nuestra factura ${d.number} del ${fmtDate(d.meta.date)}.

Importe: CHF ${total}
Fecha de vencimiento: ${fmtDate(d.meta.dueDate)}

${d.subtitle ? `Asunto: ${d.subtitle}\n\n` : ''}Quedamos a su disposición para cualquier consulta.

Atentamente
${sender.contact || sender.company}
${sender.company}${sender.email ? `\n${sender.email}` : ''}`;
      },
      mahnung: (d) => {
        const total = formatChf(sumAmounts(d.offenerBetrag ?? 0, d.mahngebuehr ?? 0, d.verzugszins ?? 0));
        return `Estimado/a ${name}

Lamentablemente no hemos recibido el pago de la factura ${d.number} del ${fmtDate(d.meta.invoiceDate) || fmtDate(d.meta.date)}.

Importe pendiente: CHF ${total}
Vencido desde: ${fmtDate(d.meta.overdueSince)}
Fecha límite de pago: ${fmtDate(d.meta.dueDate)}

Le rogamos que realice la transferencia dentro del plazo indicado.

Atentamente
${sender.contact || sender.company}
${sender.company}${sender.email ? `\n${sender.email}` : ''}`;
      },
    },
    nl: {
      offerte: (d) => {
        const total = formatChf(sumLineItems(d.lineItems ?? []));
        return `Geachte ${name}

Hierbij ontvangt u onze offerte ${d.number} van ${fmtDate(d.meta.date)}.

Offertebedrag: CHF ${total}
Geldig tot: ${fmtDate(d.meta.validUntil)}

${d.subtitle ? `Betreft: ${d.subtitle}\n\n` : ''}Mocht u vragen hebben, neem dan gerust contact met ons op.

Met vriendelijke groet
${sender.contact || sender.company}
${sender.company}${sender.email ? `\n${sender.email}` : ''}`;
      },
      invoice: (d) => {
        const total = formatChf(sumLineItems(d.lineItems ?? []));
        return `Geachte ${name}

Hierbij ontvangt u onze factuur ${d.number} van ${fmtDate(d.meta.date)}.

Factuurbedrag: CHF ${total}
Betaalbaar tot: ${fmtDate(d.meta.dueDate)}

${d.subtitle ? `Betreft: ${d.subtitle}\n\n` : ''}Mocht u vragen hebben, neem dan gerust contact met ons op.

Met vriendelijke groet
${sender.contact || sender.company}
${sender.company}${sender.email ? `\n${sender.email}` : ''}`;
      },
      mahnung: (d) => {
        const total = formatChf(sumAmounts(d.offenerBetrag ?? 0, d.mahngebuehr ?? 0, d.verzugszins ?? 0));
        return `Geachte ${name}

Helaas hebben wij voor factuur ${d.number} van ${fmtDate(d.meta.invoiceDate) || fmtDate(d.meta.date)} nog geen betaling ontvangen.

Openstaand bedrag: CHF ${total}
Vervallen sinds: ${fmtDate(d.meta.overdueSince)}
Betaalbaar tot: ${fmtDate(d.meta.dueDate)}

Wij verzoeken u het openstaande bedrag binnen de genoemde termijn over te maken.

Met vriendelijke groet
${sender.contact || sender.company}
${sender.company}${sender.email ? `\n${sender.email}` : ''}`;
      },
    },
    ru: {
      offerte: (d) => {
        const total = formatChf(sumLineItems(d.lineItems ?? []));
        return `Здравствуйте, ${name}

В приложении наше коммерческое предложение ${d.number} от ${fmtDate(d.meta.date)}.

Сумма предложения: CHF ${total}
Действительно до: ${fmtDate(d.meta.validUntil)}

${d.subtitle ? `Тема: ${d.subtitle}\n\n` : ''}При возникновении вопросов обращайтесь к нам.

С уважением
${sender.contact || sender.company}
${sender.company}${sender.email ? `\n${sender.email}` : ''}`;
      },
      invoice: (d) => {
        const total = formatChf(sumLineItems(d.lineItems ?? []));
        return `Здравствуйте, ${name}

В приложении наш счёт ${d.number} от ${fmtDate(d.meta.date)}.

Сумма счёта: CHF ${total}
Срок оплаты: ${fmtDate(d.meta.dueDate)}

${d.subtitle ? `Тема: ${d.subtitle}\n\n` : ''}При возникновении вопросов обращайтесь к нам.

С уважением
${sender.contact || sender.company}
${sender.company}${sender.email ? `\n${sender.email}` : ''}`;
      },
      mahnung: (d) => {
        const total = formatChf(sumAmounts(d.offenerBetrag ?? 0, d.mahngebuehr ?? 0, d.verzugszins ?? 0));
        return `Здравствуйте, ${name}

К сожалению, мы ещё не получили оплату по счёту ${d.number} от ${fmtDate(d.meta.invoiceDate) || fmtDate(d.meta.date)}.

Сумма задолженности: CHF ${total}
Просрочено с: ${fmtDate(d.meta.overdueSince)}
Срок оплаты: ${fmtDate(d.meta.dueDate)}

Просим произвести оплату в указанный срок.

С уважением
${sender.contact || sender.company}
${sender.company}${sender.email ? `\n${sender.email}` : ''}`;
      },
    },
  };

  const templates = bodies[lang] ?? bodies.de;
  const template = templates[doc.type] ?? templates.invoice;
  return template(doc);
}

function setLocale(lang: string) {
  locale.value = lang;
  document.documentElement.setAttribute('lang', lang);
  localStorage.setItem('locale', lang);
}

function sendEmail() {
  const doc = activeDoc.value;
  if (!doc) return;
  const client = activeClient.value;
  const to = doc.recipient.email || client?.email || '';
  const typeLabel = doc.type === 'invoice' ? t('Rechnungen') : doc.type === 'offerte' ? t('Offerten') : t('Mahnungen');
  const subject = `${typeLabel} ${doc.number}`;
  const body = emailBody();
  window.open(`mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
}

function statusItems(): MenuItem[] {
  if (!activeDoc.value) return [];
  const num = activeDoc.value.number;
  const s = activeStatus.value;
  const items: MenuItem[] = [];

  if (activeType.value === 'offerte') {
    for (const status of ['draft', 'sent', 'accepted', 'rejected'] as const) {
      items.push({ label: t(status), action: () => store.setStatus(num, status), checked: s === status });
    }
  } else if (activeType.value === 'invoice') {
    for (const status of ['draft', 'sent', 'paid'] as const) {
      items.push({ label: t(status), action: () => store.setStatus(num, status), checked: s === status });
    }
  } else if (activeType.value === 'mahnung') {
    for (const status of ['draft', 'sent'] as const) {
      items.push({ label: t(status), action: () => store.setStatus(num, status), checked: s === status });
    }
  }
  return items;
}

const menus = computed<Menu[]>(() => [
  {
    label: 'Fucktura',
    bold: true,
    items: [
      { label: t('About Fucktura'), action: () => { showAbout.value = true; } },
      { separator: true },
      { label: t('Settings'), shortcut: '⌘,', action: () => router.push('/settings') },
    ],
  },
  {
    label: t('File'),
    items: [
      { label: t('Open Folder…'), shortcut: '⌘O', action: () => folder.openFolder() },
      ...(folder.recents.length > 1 ? [
        { separator: true } as MenuItem,
        { label: t('Recent folders'), disabled: true } as MenuItem,
        ...folder.recents.slice(1).map((r) => ({
          label: `📁 ${r.name}`,
          action: () => folder.openRecent(r),
        } as MenuItem)),
        { label: t('Clear recent folders'), action: () => folder.clearRecents() } as MenuItem,
      ] : []),
      { separator: true },
      { label: t('New Offerte'), shortcut: '⌘N', action: () => store.createOfferte() },
      { label: t('New invoice'), action: () => store.createInvoice() },
      { label: t('New reminder'), action: () => store.createMahnung() },
      { label: t('New receipt'), action: () => store.createQuittung() },
      { separator: true },
      { label: t('Convert to invoice'), shortcut: '⌘⇧I', action: () => store.convertToInvoice(store.activeDocument!.number), disabled: !isOfferte.value, hidden: !hasActiveDoc.value },
      { separator: true, hidden: !hasActiveDoc.value },
      { label: t('Clients'), action: () => router.push('/clients') },
      { label: t('Positions'), action: () => router.push('/positions') },
      { separator: true },
      { label: t('Print / PDF'), shortcut: '⌘P', action: () => emit('generate-pdf') },
      { label: t('Send email'), shortcut: '⌘⇧E', action: sendEmail, disabled: !hasActiveDoc.value, hidden: !hasActiveDoc.value },
    ],
  },
  {
    label: t('Edit'),
    items: [
      { label: t('Undo'), shortcut: '⌘Z', action: () => document.execCommand('undo'), strikethrough: true },
      { label: t('Redo'), shortcut: '⌘⇧Z', action: () => document.execCommand('redo'), strikethrough: true },
      { separator: true },
      { label: t('Cut'), shortcut: '⌘X', action: () => document.execCommand('cut'), strikethrough: true },
      { label: t('Copy'), shortcut: '⌘C', action: () => document.execCommand('copy'), strikethrough: true },
      { label: t('Paste'), shortcut: '⌘V', action: () => document.execCommand('paste'), strikethrough: true },
      { separator: true },
      { label: t('Select all'), shortcut: '⌘A', action: () => document.execCommand('selectAll'), strikethrough: true },
    ],
  },
  {
    label: t('Document'),
    items: [
      { label: t('All documents'), action: () => store.setActive(null) },
      { separator: true },
      ...statusItems(),
      { separator: true, hidden: !hasActiveDoc.value },
      { label: t('Delete'), shortcut: '⌘⌫', action: () => store.activeDocument && store.deleteDocument(store.activeDocument.number), disabled: !hasActiveDoc.value, destructive: true },
    ],
  },
  {
    label: t('View'),
    items: [
      { label: 'SN 010130 (CH)', action: () => { normStore.norm = 'SN010130'; }, checked: normStore.norm === 'SN010130' },
      { label: 'DIN 5008 (DE)', action: () => { normStore.norm = 'DIN5008'; }, checked: normStore.norm === 'DIN5008' },
      { label: 'NEN 1026 (NL)', action: () => { normStore.norm = 'NEN1026'; }, checked: normStore.norm === 'NEN1026' },
      { label: 'UNE (ES)', action: () => { normStore.norm = 'UNE'; }, checked: normStore.norm === 'UNE' },
      { separator: true },
      { label: 'Deutsch', action: () => setLocale('de'), checked: locale.value === 'de' },
      { label: 'English', action: () => setLocale('en'), checked: locale.value === 'en' },
      { label: 'Español', action: () => setLocale('es'), checked: locale.value === 'es' },
      { label: 'Nederlands', action: () => setLocale('nl'), checked: locale.value === 'nl' },
      { label: 'Русский', action: () => setLocale('ru'), checked: locale.value === 'ru' },
      { separator: true },
      { label: t('Edit mode'), action: () => { modeStore.mode = modeStore.mode === 'edit' ? 'read' : 'edit'; }, checked: modeStore.mode === 'edit' },
    ],
  },
  {
    label: t('Window'),
    items: [
      { label: t('Minimize'), shortcut: '⌘M', action: () => { window.blur(); }, strikethrough: true },
      { label: t('Full screen'), action: () => { document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen(); }, checked: !!document.fullscreenElement },
    ],
  },
  {
    label: t('Help'),
    items: [
      { label: t('Fucktura Help'), action: () => { window.open('https://github.com/AleksejDix/fucktura', '_blank'); } },
    ],
  },
]);
</script>
