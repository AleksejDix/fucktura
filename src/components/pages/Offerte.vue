<template>
  <PageTemplate :page-index="pageIndex">
    <template #header>
      <header
        class="absolute top-0 left-0 right-0 pt-[10mm] pl-[var(--norm-ml)] pr-[var(--norm-mr)] max-h-[var(--norm-header-h)]"
      >
        <div class="flex justify-end">
          <div class="text-[9pt] text-right leading-relaxed">
            <div class="font-bold">{{ sender.company }}</div>
            <div>{{ sender.street }}</div>
            <div>
              <span class="font-mono">{{ sender.zip }}</span> {{ sender.city }},
              {{ sender.country }}
            </div>
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
          <DClientPicker
            :doc-number="doc.number"
            :has-client="!!recipient.company || !!recipient.name"
          />
          <address
            v-if="recipient.company || recipient.name"
            class="not-italic text-[9pt] leading-relaxed"
          >
            <DInline
              v-model="recipient.company"
              tag="div"
              @update:model-value="(v) => update({ 'recipient.company': v })"
            />
            <DInline
              v-model="recipient.name"
              tag="div"
              @update:model-value="(v) => update({ 'recipient.name': v })"
            />
            <DInline
              v-model="recipient.street"
              tag="div"
              @update:model-value="(v) => update({ 'recipient.street': v })"
            />
            <div>
              <DInline
                v-model="recipient.zip"
                tag="span"
                class="font-mono"
                @update:model-value="(v) => update({ 'recipient.zip': v })"
              />
              {{ ' ' }}
              <DInline
                v-model="recipient.city"
                tag="span"
                @update:model-value="(v) => update({ 'recipient.city': v })"
              />
            </div>
            <DInline
              v-if="recipient.country"
              v-model="recipient.country"
              tag="div"
              @update:model-value="(v) => update({ 'recipient.country': v })"
            />
          </address>
        </div>
      </div>

      <div class="pt-[12mm]">
        <div class="flex justify-between items-baseline">
          <h2 class="text-[14pt] font-bold">{{ t('Quote') }}</h2>
          <span class="text-[14pt] font-bold">{{ doc.number }}</span>
        </div>
        <DInline
          v-model="doc.subtitle"
          tag="p"
          class="font-bold text-[9pt]"
          @update:model-value="(v) => update({ subtitle: v })"
        />
      </div>

      <div class="grid grid-cols-2 gap-x-8 text-[9pt] border-y border-gray-300 py-2 mt-3">
        <div class="flex justify-between">
          <span class="text-gray-600">{{ t('Quote date') }}:</span>
          <DDate :value="meta.date" @update="(v) => update({ meta: { date: v } })" />
        </div>
        <div class="flex justify-between">
          <span class="text-gray-600">{{ t('Your contact') }}:</span>
          <DInline
            v-model="meta.contactPerson"
            tag="span"
            @update:model-value="(v) => update({ meta: { contactPerson: v } })"
          />
        </div>
        <div class="flex justify-between">
          <span class="text-gray-600">{{ t('Valid until') }}:</span>
          <DDate :value="meta.validUntil" @update="(v) => update({ meta: { validUntil: v } })" />
        </div>
        <div class="flex justify-between">
          <span class="text-gray-600">{{ t('Customer number') }}:</span>
          <DInline
            v-model="meta.customerNumber"
            tag="span"
            class="font-mono"
            @update:model-value="(v) => update({ meta: { customerNumber: v } })"
          />
        </div>
      </div>

      <div class="text-[9pt] leading-relaxed mt-3">
        <p>{{ t('Greeting', { name: recipient.name }) }}</p>
        <p class="mt-2">{{ t('Quote intro') }}</p>
      </div>

      <DLineItemsTable :doc="doc" :sender="sender" />

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
import type { Document, DocumentPatch, Sender } from '@/fs/types';
import { useDocumentsStore } from '@/stores/documents';
import PageTemplate from '../PageTemplate.vue';
import DClientPicker from '../DClientPicker.vue';
import DInline from '../DInline.vue';
import DDate from '../DDate.vue';
import DLineItemsTable from '../DLineItemsTable.vue';
import { useDate } from '@/composables/useDate';

const { t } = useI18n({ useScope: 'local' });
const { formatDate } = useDate();
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
