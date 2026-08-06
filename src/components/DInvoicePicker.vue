<template>
  <div class="relative print:hidden" v-if="!hasInvoice">
    <button
      @click="open = !open"
      class="w-full border-2 border-dashed border-amber-300 bg-amber-50 text-[9pt] leading-relaxed text-amber-700 hover:border-amber-500 hover:text-amber-900 transition-colors cursor-pointer flex items-center justify-center gap-2 py-2"
    >
      <span class="text-[12pt] leading-none">+</span>
      <span>{{ t('Link invoice') }}</span>
    </button>
    <ul
      v-if="open"
      class="absolute top-full left-0 mt-1 w-80 bg-white border border-gray-200 shadow-lg z-20 max-h-72 overflow-y-auto"
    >
      <li
        v-for="inv in invoices"
        :key="inv.number"
        @click="select(inv)"
        class="px-3 py-2 text-[9pt] cursor-pointer hover:bg-gray-100 transition-colors border-b border-gray-50 last:border-0"
      >
        <div class="flex justify-between gap-2">
          <span class="font-medium text-gray-900 truncate">
            {{ inv.recipient.company || inv.recipient.name || t('No client') }}
          </span>
          <span class="font-mono text-gray-400 shrink-0">{{ inv.number }}</span>
        </div>
        <div class="flex justify-between gap-2 text-gray-400">
          <span class="truncate">{{ inv.subtitle || '—' }}</span>
          <span class="shrink-0">{{ t(inv.status) }}</span>
        </div>
      </li>
      <li v-if="invoices.length === 0" class="px-3 py-2 text-[9pt] text-gray-400 italic">
        {{ t('No invoices') }}
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';
import type { Document } from '@/fs/types';
import { useDocumentsStore } from '@/stores/documents';

const { t } = useI18n({ useScope: 'local' });
const store = useDocumentsStore();

const props = defineProps<{
  docNumber: string;
  hasInvoice: boolean;
}>();

const open = ref(false);

// Unpaid invoices first — those are the ones you actually dun — then the rest.
const invoices = computed<Document[]>(() =>
  store.documents
    .filter((d) => d.type === 'invoice')
    .sort((a, b) => {
      const ap = a.status === 'paid' ? 1 : 0;
      const bp = b.status === 'paid' ? 1 : 0;
      if (ap !== bp) return ap - bp;
      return b.number.localeCompare(a.number);
    }),
);

function select(invoice: Document) {
  open.value = false;
  store.linkMahnungInvoice(props.docNumber, invoice.number);
}

function onClickOutside(e: MouseEvent) {
  if (open.value && !(e.target as Element).closest('.relative')) {
    open.value = false;
  }
}

onMounted(() => document.addEventListener('click', onClickOutside, true));
onUnmounted(() => document.removeEventListener('click', onClickOutside, true));
</script>

<i18n lang="json">
{
  "de": {
    "Link invoice": "Rechnung verknüpfen",
    "No invoices": "Keine Rechnungen",
    "No client": "Kein Kunde",
    "draft": "Entwurf",
    "sent": "Versendet",
    "paid": "Bezahlt"
  },
  "en": {
    "Link invoice": "Link invoice",
    "No invoices": "No invoices",
    "No client": "No client",
    "draft": "Draft",
    "sent": "Sent",
    "paid": "Paid"
  },
  "es": {
    "Link invoice": "Vincular factura",
    "No invoices": "Sin facturas",
    "No client": "Sin cliente",
    "draft": "Borrador",
    "sent": "Enviado",
    "paid": "Pagado"
  },
  "nl": {
    "Link invoice": "Factuur koppelen",
    "No invoices": "Geen facturen",
    "No client": "Geen klant",
    "draft": "Concept",
    "sent": "Verzonden",
    "paid": "Betaald"
  },
  "ru": {
    "Link invoice": "Привязать счёт",
    "No invoices": "Нет счетов",
    "No client": "Нет клиента",
    "draft": "Черновик",
    "sent": "Отправлено",
    "paid": "Оплачено"
  }
}
</i18n>
