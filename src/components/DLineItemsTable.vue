<template>
  <table class="w-full text-[9pt] mt-3">
    <thead>
      <tr class="border-b border-gray-400 text-left">
        <th class="py-1.5 w-[35px] font-bold">{{ $t('Pos') }}</th>
        <th class="py-1.5 font-bold">{{ $t('Description') }}</th>
        <th class="py-1.5 text-right font-bold">{{ $t('Quantity') }}</th>
        <th v-if="showVat" class="py-1.5 text-right font-bold">{{ $t('VAT') }}</th>
        <th class="py-1.5 text-right font-bold">{{ $t('Unit price') }}</th>
        <th class="py-1.5 text-right font-bold">{{ $t('Price in') }} {{ currency }}</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="(item, i) in lineItems" :key="item.pos" class="border-b border-gray-200 group">
        <td class="py-1.5 align-top font-mono">{{ item.pos }}</td>
        <td class="py-1.5 align-top">
          <DInline v-model="item.description" tag="div" class="font-bold" @update:model-value="v => updateField(i, 'description', v)" />
          <DInline v-if="item.code" v-model="item.code" tag="div" class="text-gray-500" @update:model-value="v => updateField(i, 'code', v)" />
        </td>
        <td class="py-1.5 text-right align-top font-mono">
          <DInline :model-value="format(item.quantity)" tag="span" @update:model-value="v => updateField(i, 'quantity', parseFloat(v) || 0)" /> <DInline :model-value="item.unit || defaultUnit" tag="span" class="text-gray-500" @update:model-value="v => updateField(i, 'unit', v)" />
        </td>
        <td v-if="showVat" class="py-1.5 text-right align-top font-mono">
          <select
            v-if="isEdit"
            :value="item.vatRate ?? 0"
            @change="updateField(i, 'vatRate', parseFloat(($event.target as HTMLSelectElement).value))"
            class="bg-transparent border-none focus:outline-none text-right"
          >
            <option v-for="r in vatRateOptions" :key="r" :value="r">{{ r }}%</option>
          </select>
          <span v-else>{{ item.vatRate ?? 0 }}%</span>
        </td>
        <td class="py-1.5 text-right align-top font-mono">
          <DInline :model-value="format(item.unitPrice)" tag="span" @update:model-value="v => updateField(i, 'unitPrice', parseFloat(v) || 0)" />
        </td>
        <td class="py-1.5 text-right align-top font-mono whitespace-nowrap">
          {{ formatChf(lineTotal(item.quantity, item.unitPrice)) }}
          <button
            v-if="isEdit"
            @click="removeRow(i)"
            class="ml-1 text-gray-300 hover:text-red-500 print:hidden opacity-0 group-hover:opacity-100 transition-opacity"
          >&times;</button>
        </td>
      </tr>
    </tbody>
    <tfoot>
      <template v-if="showVat">
        <tr class="border-t border-gray-400">
          <td></td>
          <td class="py-1.5">{{ $t('Subtotal (net)') }}</td>
          <td :colspan="3"></td>
          <td class="py-1.5 text-right font-mono">{{ formatChfFromNumber(netTotal) }}</td>
        </tr>
        <tr v-for="group in vatBreakdown" :key="group.rate">
          <td></td>
          <td class="py-1.5 text-gray-600">
            <template v-if="group.rate > 0">{{ $t('VAT') }} {{ group.rate }}% {{ $t('on') }} {{ formatChfFromNumber(group.net) }}</template>
            <template v-else>{{ $t('Exempt') }}</template>
          </td>
          <td :colspan="3"></td>
          <td class="py-1.5 text-right font-mono text-gray-600">{{ formatChfFromNumber(group.vat) }}</td>
        </tr>
        <tr class="border-t border-gray-400">
          <td></td>
          <td class="py-1.5 font-bold">{{ $t('Total') }}</td>
          <td :colspan="3"></td>
          <td class="py-1.5 text-right font-bold font-mono">{{ formatChfFromNumber(grossTotal) }}</td>
        </tr>
      </template>
      <tr v-else class="border-t border-gray-400">
        <td></td>
        <td class="py-1.5 font-bold">{{ $t(exemptLabel) }}</td>
        <td :colspan="2"></td>
        <td class="py-1.5 text-right font-bold font-mono">{{ formatChf(netTotalDinero) }}</td>
      </tr>
    </tfoot>
  </table>

  <button
    v-if="isEdit"
    @click="addRow"
    class="text-[8pt] text-gray-400 hover:text-black mt-2 print:hidden"
  >+ {{ $t('Add line item') }}</button>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Document, Sender } from '@/fs/types';
import { useDocumentsStore } from '@/stores/documents';
import { useModeStore } from '@/stores/mode';
import { useMoney } from '@/composables/useMoney';
import { defaultUnitForType } from '@/lib/documents';
import { availableRates } from '@/lib/vat';
import DInline from './DInline.vue';

const props = defineProps<{
  doc: Document;
  sender: Sender;
}>();

const store = useDocumentsStore();
const modeStore = useModeStore();
const { lineTotal, sumLineItems, formatChf, formatChfFromNumber, groupByVat, sumGross } = useMoney();
const isEdit = computed(() => modeStore.isEditMode);

const lineItems = computed(() => props.doc.lineItems ?? []);
const defaultUnit = computed(() => defaultUnitForType(props.doc.type));
const currency = computed(() => {
  const iban = props.sender?.accounts?.[0]?.iban ?? '';
  return iban.startsWith('CH') ? 'CHF' : 'EUR';
});

const showVat = computed(() => !!props.sender?.vatRegistered);
const vatRateOptions = computed(() => availableRates(props.sender?.country ?? '', props.doc.meta.date));
const vatBreakdown = computed(() => groupByVat(lineItems.value));
const grossTotal = computed(() => sumGross(lineItems.value));
const netTotalDinero = computed(() => sumLineItems(lineItems.value));
const netTotal = computed(() => vatBreakdown.value.reduce((s, g) => s + g.net, 0));

const exemptLabel = computed(() =>
  props.doc.type === 'offerte' ? 'Quote amount (tax exempt)' : 'Amount (tax exempt)',
);

function format(n: number): string {
  return n.toFixed(2);
}

function updateField(index: number, field: string, value: unknown) {
  const items = [...lineItems.value.map(item => ({ ...item }))];
  (items[index] as Record<string, unknown>)[field] = value;
  store.updateDocument(props.doc.number, { lineItems: items });
}

function addRow() {
  store.addLineItemToActive();
}

function removeRow(index: number) {
  const items = lineItems.value.filter((_, i) => i !== index).map((item, i) => ({ ...item, pos: i + 1 }));
  store.updateDocument(props.doc.number, { lineItems: items });
}
</script>
