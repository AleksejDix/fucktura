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
          <h2 class="text-[14pt] font-bold">{{ t('Receipt') }}</h2>
          <span class="text-[14pt] font-bold">{{ doc.number }}</span>
        </div>
        <DInline v-model="doc.subtitle" tag="p" class="font-bold text-[9pt]" @update:model-value="v => update({ subtitle: v })" />
      </div>

      <div class="grid grid-cols-2 gap-x-8 text-[9pt] border-y border-gray-300 py-2 mt-3">
        <div class="flex justify-between">
          <span class="text-gray-600">{{ t('Date') }}:</span>
          <DDate :value="meta.date" @update="v => update({ meta: { date: v } })" />
        </div>
        <div class="flex justify-between">
          <span class="text-gray-600">{{ t('Your contact') }}:</span>
          <DInline v-model="meta.contactPerson" tag="span" @update:model-value="v => update({ meta: { contactPerson: v } })" />
        </div>
        <div class="flex justify-between">
          <span class="text-gray-600">{{ t('Payment method') }}:</span>
          <span class="font-bold">{{ t('Paid via Demo Booking') }}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-600">{{ t('Customer number') }}:</span>
          <DInline v-model="meta.customerNumber" tag="span" class="font-mono" @update:model-value="v => update({ meta: { customerNumber: v } })" />
        </div>
      </div>

      <div class="text-[9pt] leading-relaxed mt-3">
        <p>{{ t('Greeting', { name: recipient.name }) }}</p>
        <p class="mt-2">{{ t('Receipt intro') }}</p>
      </div>

      <DLineItemsTable :doc="doc" :sender="sender" />

      <div class="text-[9pt] leading-relaxed mt-4">
        <p>{{ t('Tax note') }}</p>
        <p class="mt-3">{{ t('Thank you') }}</p>
        <p class="mt-3">{{ t('Kind regards') }}</p>
        <p>{{ meta.contactPerson }}</p>
      </div>
    </section>
  </PageTemplate>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import type { Document, DocumentPatch, Sender } from '@/fs/types';
import { useDocumentsStore } from '@/stores/documents';
import PageTemplate from '../PageTemplate.vue';
import DClientPicker from '../DClientPicker.vue';
import DInline from '../DInline.vue';
import DDate from '../DDate.vue';
import DLineItemsTable from '../DLineItemsTable.vue';

const { t } = useI18n({ useScope: 'local' });
const store = useDocumentsStore();

const props = defineProps<{
  pageIndex?: number;
  doc: Document;
  sender: Sender;
}>();

const recipient = computed(() => props.doc.recipient);
const meta = computed(() => props.doc.meta);

function update(changes: DocumentPatch) {
  if (!props.doc.number) return;
  store.updateDocument(props.doc.number, changes);
}
</script>

<i18n lang="json">
{
  "de": {
    "Receipt": "Quittung",
    "Date": "Datum",
    "Your contact": "Ihr Ansprechpartner",
    "Payment method": "Zahlungsart",
    "Paid via Demo Booking": "Bezahlt über Demo Booking",
    "Customer number": "Buchungsnummer",
    "Greeting": "Guten Tag {name}",
    "Receipt intro": "Hiermit bestätigen wir den Erhalt folgender Zahlung:",
    "Pos": "Pos.",
    "Description": "Beschreibung",
    "Quantity": "Menge",
    "Unit price": "Einzelpreis",
    "Price in": "Betrag in",
    "Amount (tax exempt)": "Gesamtbetrag (von Steuer befreit)",
    "Tax note": "Gemäß § 19 UStG wird keine Umsatzsteuer berechnet (Kleinunternehmerregelung).",
    "Thank you": "Vielen Dank für Ihren Aufenthalt!",
    "Kind regards": "Freundliche Grüße",
    "Add line item": "Position hinzufügen"
  },
  "en": {
    "Receipt": "Receipt",
    "Date": "Date",
    "Your contact": "Your contact",
    "Payment method": "Payment method",
    "Paid via Demo Booking": "Paid via Demo Booking",
    "Customer number": "Booking number",
    "Greeting": "Dear {name}",
    "Receipt intro": "We hereby confirm receipt of the following payment:",
    "Pos": "Pos.",
    "Description": "Description",
    "Quantity": "Quantity",
    "Unit price": "Unit price",
    "Price in": "Amount in",
    "Amount (tax exempt)": "Total amount (tax exempt)",
    "Tax note": "No VAT charged pursuant to § 19 UStG (small business regulation).",
    "Thank you": "Thank you for your stay!",
    "Kind regards": "Kind regards",
    "Add line item": "Add line item"
  },
  "ru": {
    "Receipt": "Квитанция",
    "Date": "Дата",
    "Your contact": "Контактное лицо",
    "Payment method": "Способ оплаты",
    "Paid via Demo Booking": "Оплачено через Demo Booking",
    "Customer number": "Номер бронирования",
    "Greeting": "Здравствуйте, {name}",
    "Receipt intro": "Настоящим подтверждаем получение следующего платежа:",
    "Pos": "Поз.",
    "Description": "Описание",
    "Quantity": "Количество",
    "Unit price": "Цена за единицу",
    "Price in": "Сумма в",
    "Amount (tax exempt)": "Итого (без НДС)",
    "Tax note": "НДС не взимается в соответствии с § 19 UStG (режим малого предпринимательства).",
    "Thank you": "Спасибо за ваше пребывание!",
    "Kind regards": "С уважением",
    "Add line item": "Добавить позицию"
  }
}
</i18n>
