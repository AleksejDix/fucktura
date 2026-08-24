<template>
  <div class="mt-3 print:hidden">
    <DInvoicePicker :doc-number="doc.number" :has-invoice="!!relatedInvoiceNumber" />
    <div v-if="relatedInvoiceNumber" class="flex items-center gap-2 text-[9pt]">
      <span class="text-gray-600">{{ t('reminder to invoice') }}</span>
      <span class="font-mono font-medium">{{ relatedInvoiceNumber }}</span>
      <span
        class="px-2 py-0.5 rounded-sm text-[8pt] font-medium"
        :class="isResolved ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'"
        >{{ isResolved ? t('settled') : t('Open') }}</span
      >
      <button
        v-if="!isResolved"
        type="button"
        @click="markInvoicePaid"
        class="text-[8pt] underline text-gray-500 hover:text-gray-900"
      >
        {{ t('Mark invoice paid') }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import type { Document } from '@/fs/types';
import { useDocumentsStore } from '@/stores/documents';
import DInvoicePicker from './DInvoicePicker.vue';

const props = defineProps<{ doc: Document }>();

const { t } = useI18n({ useScope: 'local' });
const store = useDocumentsStore();

const relatedInvoiceNumber = computed(() => props.doc.relatedInvoice ?? '');
const isResolved = computed(() => store.isReminderResolved(props.doc));

function markInvoicePaid() {
  if (relatedInvoiceNumber.value) store.setStatus(relatedInvoiceNumber.value, 'paid');
}
</script>

<i18n lang="json">
{
  "de": {
    "reminder to invoice": "zur Rechnung",
    "Open": "Offen",
    "settled": "Erledigt",
    "Mark invoice paid": "Rechnung als bezahlt markieren"
  },
  "en": {
    "reminder to invoice": "to invoice",
    "Open": "Open",
    "settled": "Settled",
    "Mark invoice paid": "Mark invoice as paid"
  },
  "es": {
    "reminder to invoice": "a la factura",
    "Open": "Pendiente",
    "settled": "Saldado",
    "Mark invoice paid": "Marcar factura como pagada"
  },
  "nl": {
    "reminder to invoice": "bij factuur",
    "Open": "Openstaand",
    "settled": "Afgehandeld",
    "Mark invoice paid": "Factuur als betaald markeren"
  },
  "ru": {
    "reminder to invoice": "к счёту",
    "Open": "Открыто",
    "settled": "Погашено",
    "Mark invoice paid": "Отметить счёт оплаченным"
  }
}
</i18n>
