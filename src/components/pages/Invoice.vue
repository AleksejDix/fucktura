<template>
  <PageTemplate :page-index="pageIndex">
    <template #header>
      <header class="absolute top-0 left-0 right-0 pt-[10mm] pl-[var(--norm-ml)] pr-[var(--norm-mr)] max-h-[var(--norm-header-h)]">
        <div class="flex justify-end">
          <div class="text-[9pt] text-right leading-relaxed">
            <div class="font-bold">{{ sender.name }}</div>
            <div>{{ sender.street }}</div>
            <div><span class="font-mono">{{ sender.zip }}</span> {{ sender.city }}, Schweiz</div>
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
          <DClientPicker :doc-id="doc.id!" :has-client="!!recipient.company || !!recipient.name" />
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
          <h2 class="text-[14pt] font-bold">{{ t('Invoice') }}</h2>
          <span class="text-[14pt] font-bold">{{ doc.number }}</span>
        </div>
        <DInline v-model="doc.subtitle" tag="p" class="font-bold text-[9pt]" @update:model-value="v => update({ subtitle: v })" />
      </div>

      <div class="grid grid-cols-2 gap-x-8 text-[9pt] border-y border-gray-300 py-2 mt-3">
        <div class="flex justify-between">
          <span class="text-gray-600">{{ t('Date') }}:</span>
          <DInline v-model="meta.datum" tag="span" class="font-mono" @update:model-value="v => update({ 'meta.datum': v })" />
        </div>
        <div class="flex justify-between">
          <span class="text-gray-600">{{ t('Your contact') }}:</span>
          <DInline v-model="meta.ansprechpartner" tag="span" @update:model-value="v => update({ 'meta.ansprechpartner': v })" />
        </div>
        <div class="flex justify-between">
          <span class="text-gray-600">{{ t('Due date') }}:</span>
          <DInline v-model="meta.zahlbarBis!" tag="span" class="font-mono" @update:model-value="v => update({ 'meta.zahlbarBis': v })" />
        </div>
        <div class="flex justify-between">
          <span class="text-gray-600">{{ t('Customer number') }}:</span>
          <DInline v-model="meta.kundennummer" tag="span" class="font-mono" @update:model-value="v => update({ 'meta.kundennummer': v })" />
        </div>
      </div>

      <div class="text-[9pt] leading-relaxed mt-3">
        <p>{{ t('Greeting', { name: recipient.name }) }}</p>
        <p class="mt-2">{{ t('Invoice intro') }}</p>
      </div>

      <table class="w-full text-[9pt] mt-3">
        <thead>
          <tr class="border-b border-gray-400 text-left">
            <th class="py-1.5 w-[35px] font-bold">{{ t('Pos') }}</th>
            <th class="py-1.5 font-bold">{{ t('Description') }}</th>
            <th class="py-1.5 text-right font-bold">{{ t('Quantity') }}</th>
            <th class="py-1.5 text-right font-bold">{{ t('Unit price') }}</th>
            <th class="py-1.5 text-right font-bold">{{ t('Price in CHF') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, i) in lineItems" :key="item.pos" class="border-b border-gray-200 group">
            <td class="py-1.5 align-top font-mono">{{ item.pos }}</td>
            <td class="py-1.5 align-top">
              <DInline v-model="item.description" tag="div" class="font-bold" @update:model-value="v => updateLineItem(i, 'description', v)" />
              <DInline v-model="item.code" tag="div" class="text-gray-500" @update:model-value="v => updateLineItem(i, 'code', v)" />
            </td>
            <td class="py-1.5 text-right align-top font-mono">
              <DInline :model-value="formatAmount(item.quantity)" tag="span" @update:model-value="v => updateLineItem(i, 'quantity', parseFloat(v) || 0)" /> <DInline :model-value="item.unit || 'h'" tag="span" class="text-gray-500" @update:model-value="v => updateLineItem(i, 'unit', v)" />
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
          <tr class="border-t border-gray-400">
            <td></td>
            <td class="py-1.5 font-bold">{{ t('Amount (tax exempt)') }}</td>
            <td></td>
            <td></td>
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
        <p>{{ t('Questions note') }}</p>
        <p class="mt-3">{{ t('Kind regards') }}</p>
        <p>{{ meta.ansprechpartner }}</p>
      </div>
    </section>
  </PageTemplate>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import type { Document, Sender } from '@/db';
import { useDocumentsStore } from '@/stores/documents';
import { useModeStore } from '@/stores/mode';
import { useMoney } from '@/composables/useMoney';
import PageTemplate from '../PageTemplate.vue';
import DClientPicker from '../DClientPicker.vue';
import DInline from '../DInline.vue';

const { t } = useI18n({ useScope: 'local' });
const store = useDocumentsStore();
const modeStore = useModeStore();
const { lineTotal, sumLineItems, formatChf, formatChfFromNumber } = useMoney();
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

function update(changes: Record<string, unknown>) {
  if (!props.doc.id) return;
  store.updateDocument(props.doc.id, changes);
}

function updateLineItem(index: number, field: string, value: unknown) {
  if (!props.doc.id) return;
  const items = [...lineItems.value.map(item => ({ ...item }))];
  (items[index] as Record<string, unknown>)[field] = value;
  store.updateDocument(props.doc.id, { lineItems: items });
}

function addLineItem() {
  if (!props.doc.id) return;
  const items = [...lineItems.value.map(item => ({ ...item }))];
  items.push({ pos: items.length + 1, description: '', code: '', quantity: 0, unit: 'h', unitPrice: 0 });
  store.updateDocument(props.doc.id, { lineItems: items });
}

function removeLineItem(index: number) {
  if (!props.doc.id) return;
  const items = lineItems.value.filter((_, i) => i !== index).map((item, i) => ({ ...item, pos: i + 1 }));
  store.updateDocument(props.doc.id, { lineItems: items });
}

function formatAmount(n: number): string {
  return n.toFixed(2);
}
</script>

<i18n lang="json">
{
  "de": {
    "Invoice": "Rechnung",
    "Date": "Datum",
    "Due date": "Zahlbar bis",
    "Your contact": "Ihr Ansprechpartner",
    "Customer number": "Kundennummer",
    "Greeting": "Guten Tag {name}",
    "Invoice intro": "Danke für Ihr Vertrauen. Ihre Rechnung setzt sich wie folgt zusammen:",
    "Pos": "Pos.",
    "Description": "Beschreibung",
    "Quantity": "Menge",
    "Unit price": "Einzelpreis",
    "Price in CHF": "Preis in CHF",
    "Product code": "Produktcode",
    "Amount (tax exempt)": "Betrag (von Steuer befreit)",
    "Questions note": "Bei Fragen stehen wir Ihnen gerne zur Verfügung.",
    "Kind regards": "Freundliche Grüsse",
    "Add line item": "Position hinzufügen"
  },
  "en": {
    "Invoice": "Invoice",
    "Date": "Date",
    "Due date": "Due date",
    "Your contact": "Your contact",
    "Customer number": "Customer number",
    "Greeting": "Dear {name}",
    "Invoice intro": "Thank you for your trust. Your invoice is as follows:",
    "Pos": "Pos.",
    "Description": "Description",
    "Quantity": "Quantity",
    "Unit price": "Unit price",
    "Price in CHF": "Price in CHF",
    "Product code": "Product code",
    "Amount (tax exempt)": "Amount (tax exempt)",
    "Questions note": "If you have any questions, please contact us.",
    "Kind regards": "Kind regards",
    "Add line item": "Add line item"
  },
  "es": {
    "Invoice": "Factura",
    "Date": "Fecha",
    "Due date": "Fecha de vencimiento",
    "Your contact": "Su persona de contacto",
    "Customer number": "Número de cliente",
    "Greeting": "Estimado/a {name}",
    "Invoice intro": "Gracias por su confianza. Su factura se compone de la siguiente manera:",
    "Pos": "Pos.",
    "Description": "Descripción",
    "Quantity": "Cantidad",
    "Unit price": "Precio unitario",
    "Price in CHF": "Precio en CHF",
    "Product code": "Código de producto",
    "Amount (tax exempt)": "Importe (exento de impuestos)",
    "Questions note": "¿Tiene preguntas? No dude en contactarnos.",
    "Kind regards": "Atentamente",
    "Add line item": "Añadir posición"
  }
}
</i18n>
