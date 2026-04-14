<template>
  <PageTemplate :page-index="pageIndex">
    <template #header>
      <header class="absolute top-0 left-0 right-0 pt-[10mm] pl-[var(--norm-ml)] pr-[var(--norm-mr)] max-h-[var(--norm-header-h)]">
        <div class="flex justify-end">
          <div class="text-[9pt] text-right leading-relaxed">
            <div class="font-bold">{{ sender.company }}</div>
            <div>{{ sender.street }}</div>
            <div><span class="font-mono">{{ sender.zip }}</span> {{ sender.city }}, {{ sender.country }}</div>
            <div>{{ sender.email }}</div>
            <div>{{ sender.website }}</div>
            <div class="text-gray-500 font-mono">{{ sender.uid }}</div>
          </div>
        </div>
      </header>
    </template>

    <section>
      <div class="pt-[var(--norm-addr-offset)]">
        <div class="w-[var(--norm-addr-w)]">
          <DClientPicker :doc-number="doc.number" :has-client="!!recipient.company || !!recipient.name" />
          <address v-if="recipient.company || recipient.name" class="not-italic text-[9pt] leading-relaxed">
            <DInline v-model="recipient.company" tag="div" @update:model-value="v => update({ 'recipient.company': v })" />
            <DInline v-model="recipient.name" tag="div" @update:model-value="v => update({ 'recipient.name': v })" />
            <DInline v-model="recipient.street" tag="div" @update:model-value="v => update({ 'recipient.street': v })" />
            <div>
              <DInline v-model="recipient.zip" tag="span" class="font-mono" @update:model-value="v => update({ 'recipient.zip': v })" />
              {{ ' ' }}
              <DInline v-model="recipient.city" tag="span" @update:model-value="v => update({ 'recipient.city': v })" />
            </div>
            <DInline v-if="recipient.country" v-model="recipient.country" tag="div" @update:model-value="v => update({ 'recipient.country': v })" />
          </address>
        </div>
      </div>

      <div class="pt-[12mm]">
        <div class="flex justify-between items-baseline">
          <h2 class="text-[14pt] font-bold">{{ t('Quote') }}</h2>
          <span class="text-[14pt] font-bold">{{ doc.number }}</span>
        </div>
        <DInline v-model="doc.subtitle" tag="p" class="font-bold text-[9pt]" @update:model-value="v => update({ subtitle: v })" />
      </div>

      <div class="grid grid-cols-2 gap-x-8 text-[9pt] border-y border-gray-300 py-2 mt-3">
        <div class="flex justify-between">
          <span class="text-gray-600">{{ t('Quote date') }}:</span>
          <DDate :value="meta.date" @update="v => update({ 'meta.date': v })" />
        </div>
        <div class="flex justify-between">
          <span class="text-gray-600">{{ t('Your contact') }}:</span>
          <DInline v-model="meta.contactPerson" tag="span" @update:model-value="v => update({ 'meta.contactPerson': v })" />
        </div>
        <div class="flex justify-between">
          <span class="text-gray-600">{{ t('Valid until') }}:</span>
          <DDate :value="meta.validUntil" @update="v => update({ 'meta.validUntil': v })" />
        </div>
        <div class="flex justify-between">
          <span class="text-gray-600">{{ t('Customer number') }}:</span>
          <DInline v-model="meta.customerNumber" tag="span" class="font-mono" @update:model-value="v => update({ 'meta.customerNumber': v })" />
        </div>
      </div>

      <div class="text-[9pt] leading-relaxed mt-3">
        <p>{{ t('Greeting', { name: recipient.name }) }}</p>
        <p class="mt-2">{{ t('Quote intro') }}</p>
      </div>

      <table class="w-full text-[9pt] mt-3">
        <thead>
          <tr class="border-b border-gray-400 text-left">
            <th class="py-1.5 w-[35px] font-bold">{{ t('Pos') }}</th>
            <th class="py-1.5 font-bold">{{ t('Description') }}</th>
            <th class="py-1.5 text-right font-bold">{{ t('Quantity') }}</th>
            <th v-if="showVat" class="py-1.5 text-right font-bold">{{ t('VAT') }}</th>
            <th class="py-1.5 text-right font-bold">{{ t('Unit price') }}</th>
            <th class="py-1.5 text-right font-bold">{{ t('Price in CHF') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, i) in lineItems" :key="item.pos" class="border-b border-gray-200 group">
            <td class="py-1.5 align-top font-mono">{{ item.pos }}</td>
            <td class="py-1.5 align-top">
              <DInline v-model="item.description" tag="div" class="font-bold" @update:model-value="v => updateLineItem(i, 'description', v)" />
              <DInline v-if="item.code" v-model="item.code" tag="div" class="text-gray-500" @update:model-value="v => updateLineItem(i, 'code', v)" />
            </td>
            <td class="py-1.5 text-right align-top font-mono">
              <DInline :model-value="formatAmount(item.quantity)" tag="span" @update:model-value="v => updateLineItem(i, 'quantity', parseFloat(v) || 0)" /> <DInline :model-value="item.unit || 'h'" tag="span" class="text-gray-500" @update:model-value="v => updateLineItem(i, 'unit', v)" />
            </td>
            <td v-if="showVat" class="py-1.5 text-right align-top font-mono">
              <select
                v-if="isEdit"
                :value="item.vatRate ?? 0"
                @change="updateLineItem(i, 'vatRate', parseFloat(($event.target as HTMLSelectElement).value))"
                class="bg-transparent border-none focus:outline-none text-right"
              >
                <option v-for="r in vatRateOptions" :key="r" :value="r">{{ r }}%</option>
              </select>
              <span v-else>{{ item.vatRate ?? 0 }}%</span>
            </td>
            <td class="py-1.5 text-right align-top font-mono">
              <DInline :model-value="formatAmount(item.unitPrice)" tag="span" @update:model-value="v => updateLineItem(i, 'unitPrice', parseFloat(v) || 0)" />
            </td>
            <td class="py-1.5 text-right align-top font-mono whitespace-nowrap">
              {{ formatChf(lineTotal(item.quantity, item.unitPrice)) }}
              <button
                v-if="isEdit"
                @click="removeLineItem(i)"
                class="ml-1 text-gray-300 hover:text-red-500 print:hidden opacity-0 group-hover:opacity-100 transition-opacity"
              >&times;</button>
            </td>
          </tr>
        </tbody>
        <tfoot>
          <template v-if="showVat">
            <tr class="border-t border-gray-400">
              <td></td>
              <td class="py-1.5">{{ t('Subtotal (net)') }}</td>
              <td :colspan="3"></td>
              <td class="py-1.5 text-right font-mono">{{ formatChfFromNumber(vatBreakdown.reduce((s, g) => s + g.net, 0)) }}</td>
            </tr>
            <tr v-for="group in vatBreakdown" :key="group.rate">
              <td></td>
              <td class="py-1.5 text-gray-600">
                <template v-if="group.rate > 0">{{ t('VAT') }} {{ group.rate }}% {{ t('on') }} {{ formatChfFromNumber(group.net) }}</template>
                <template v-else>{{ t('Exempt') }}</template>
              </td>
              <td :colspan="3"></td>
              <td class="py-1.5 text-right font-mono text-gray-600">{{ formatChfFromNumber(group.vat) }}</td>
            </tr>
            <tr class="border-t border-gray-400">
              <td></td>
              <td class="py-1.5 font-bold">{{ t('Total') }}</td>
              <td :colspan="3"></td>
              <td class="py-1.5 text-right font-bold font-mono">{{ formatChfFromNumber(grossTotal) }}</td>
            </tr>
          </template>
          <tr v-else class="border-t border-gray-400">
            <td></td>
            <td class="py-1.5 font-bold">{{ t('Quote amount (tax exempt)') }}</td>
            <td :colspan="2"></td>
            <td class="py-1.5 text-right font-bold font-mono">{{ formatChf(total) }}</td>
          </tr>
        </tfoot>
      </table>

      <button
        v-if="isEdit"
        @click="addLineItem"
        class="text-[8pt] text-gray-400 hover:text-black mt-2 print:hidden"
      >+ {{ t('Add line item') }}</button>

      <div class="text-[9pt] leading-relaxed mt-4">
        <p>{{ t('Quote valid note', { date: formatDate(meta.validUntil) }) }}</p>
        <p class="mt-2">{{ t('Quote closing') }}</p>
        <p class="mt-3">{{ t('Kind regards') }}</p>
        <p>{{ meta.contactPerson }}</p>
      </div>
    </section>
  </PageTemplate>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import type { Document, Sender } from '@/fs/types';
import { useDocumentsStore } from '@/stores/documents';
import { useModeStore } from '@/stores/mode';
import { useMoney } from '@/composables/useMoney';
import PageTemplate from '../PageTemplate.vue';
import DClientPicker from '../DClientPicker.vue';
import DInline from '../DInline.vue';
import DDate from '../DDate.vue';
import { useDate } from '@/composables/useDate';
import { availableRates } from '@/lib/vat';

const { t } = useI18n({ useScope: 'local' });
const { formatDate } = useDate();
const store = useDocumentsStore();
const modeStore = useModeStore();
const { lineTotal, sumLineItems, formatChf, formatChfFromNumber, groupByVat, sumGross } = useMoney();
const isEdit = computed(() => modeStore.isEditMode);

const props = defineProps<{
  pageIndex?: number;
  doc: Document;
  sender: Sender;
}>();

const recipient = computed(() => props.doc.recipient);
const meta = computed(() => props.doc.meta);
const lineItems = computed(() => props.doc.lineItems ?? []);

const total = computed(() => sumLineItems(lineItems.value));

const showVat = computed(() => !!props.sender?.vatRegistered);
const vatRateOptions = computed(() => availableRates(props.sender?.country ?? '', meta.value.date));
const vatBreakdown = computed(() => groupByVat(lineItems.value));
const grossTotal = computed(() => sumGross(lineItems.value));

function update(changes: Record<string, unknown>) {
  if (!props.doc.number) return;
  store.updateDocument(props.doc.number, changes);
}

function updateLineItem(index: number, field: string, value: unknown) {
  if (!props.doc.number) return;
  const items = [...lineItems.value.map(item => ({ ...item }))];
  (items[index] as Record<string, unknown>)[field] = value;
  store.updateDocument(props.doc.number, { lineItems: items });
}

function addLineItem() {
  store.addLineItemToActive();
}

function removeLineItem(index: number) {
  if (!props.doc.number) return;
  const items = lineItems.value.filter((_, i) => i !== index).map((item, i) => ({ ...item, pos: i + 1 }));
  store.updateDocument(props.doc.number, { lineItems: items });
}

function formatAmount(n: number): string {
  return n.toFixed(2);
}
</script>

<i18n lang="json">
{
  "de": {
    "Quote": "Offerte",
    "Quote date": "Offertdatum",
    "Valid until": "Gültig bis",
    "Your contact": "Ihr Ansprechpartner",
    "Customer number": "Kundennummer",
    "Greeting": "Guten Tag {name}",
    "Quote intro": "Vielen Dank für Ihre Anfrage. Gerne unterbreiten wir Ihnen folgende Offerte:",
    "Pos": "Pos.",
    "Description": "Beschreibung",
    "Quantity": "Menge",
    "Unit price": "Einzelpreis",
    "Price in CHF": "Preis in CHF",
    "Product code": "Produktcode",
    "Quote amount (tax exempt)": "Offertbetrag (von Steuer befreit)",
    "Quote valid note": "Diese Offerte ist gültig bis {date}.",
    "Quote closing": "Wir freuen uns auf Ihre Rückmeldung.",
    "Kind regards": "Freundliche Grüsse",
    "Add line item": "Position hinzufügen"
  },
  "en": {
    "Quote": "Quote",
    "Quote date": "Quote date",
    "Valid until": "Valid until",
    "Your contact": "Your contact",
    "Customer number": "Customer number",
    "Greeting": "Dear {name}",
    "Quote intro": "Thank you for your inquiry. We are pleased to offer you the following:",
    "Pos": "Pos.",
    "Description": "Description",
    "Quantity": "Quantity",
    "Unit price": "Unit price",
    "Price in CHF": "Price in CHF",
    "Product code": "Product code",
    "Quote amount (tax exempt)": "Quote amount (tax exempt)",
    "Quote valid note": "This quote is valid until {date}.",
    "Quote closing": "We look forward to hearing from you.",
    "Kind regards": "Kind regards",
    "Add line item": "Add line item"
  },
  "es": {
    "Quote": "Presupuesto",
    "Quote date": "Fecha de presupuesto",
    "Valid until": "Válido hasta",
    "Your contact": "Su persona de contacto",
    "Customer number": "Número de cliente",
    "Greeting": "Estimado/a {name}",
    "Quote intro": "Gracias por su consulta. Nos complace presentarle el siguiente presupuesto:",
    "Pos": "Pos.",
    "Description": "Descripción",
    "Quantity": "Cantidad",
    "Unit price": "Precio unitario",
    "Price in CHF": "Precio en CHF",
    "Product code": "Código de producto",
    "Quote amount (tax exempt)": "Importe del presupuesto (exento de impuestos)",
    "Quote valid note": "Este presupuesto es válido hasta el {date}.",
    "Quote closing": "Esperamos su respuesta.",
    "Kind regards": "Atentamente",
    "Add line item": "Añadir posición"
  },
  "nl": {
    "Quote": "Offerte",
    "Quote date": "Offertedatum",
    "Valid until": "Geldig tot",
    "Your contact": "Uw contactpersoon",
    "Customer number": "Klantnummer",
    "Greeting": "Geachte {name}",
    "Quote intro": "Bedankt voor uw aanvraag. Graag bieden wij u de volgende offerte aan:",
    "Pos": "Pos.",
    "Description": "Omschrijving",
    "Quantity": "Aantal",
    "Unit price": "Eenheidsprijs",
    "Price in CHF": "Prijs in CHF",
    "Product code": "Productcode",
    "Quote amount (tax exempt)": "Offertebedrag (vrijgesteld van BTW)",
    "Quote valid note": "Deze offerte is geldig tot {date}.",
    "Quote closing": "Wij zien uw reactie met belangstelling tegemoet.",
    "Kind regards": "Met vriendelijke groet",
    "Add line item": "Positie toevoegen"
  },
  "ru": {
    "Quote": "Коммерческое предложение",
    "Quote date": "Дата предложения",
    "Valid until": "Действительно до",
    "Your contact": "Контактное лицо",
    "Customer number": "Номер клиента",
    "Greeting": "Здравствуйте, {name}",
    "Quote intro": "Благодарим за ваш запрос. Рады предложить вам следующее:",
    "Pos": "Поз.",
    "Description": "Описание",
    "Quantity": "Количество",
    "Unit price": "Цена за единицу",
    "Price in CHF": "Цена в CHF",
    "Product code": "Код продукта",
    "Quote amount (tax exempt)": "Сумма предложения (без НДС)",
    "Quote valid note": "Данное предложение действительно до {date}.",
    "Quote closing": "Ждём вашего ответа.",
    "Kind regards": "С уважением",
    "Add line item": "Добавить позицию"
  }
}
</i18n>
