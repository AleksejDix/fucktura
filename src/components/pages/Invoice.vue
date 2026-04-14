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
          <h2 class="text-[14pt] font-bold">{{ t('Invoice') }}</h2>
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
          <span class="text-gray-600">{{ t('Invoice date') }}:</span>
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
          <span class="text-gray-600">{{ t('Due date') }}:</span>
          <DDate :value="meta.dueDate" @update="(v) => update({ meta: { dueDate: v } })" />
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
        <p class="mt-2">{{ t('Invoice intro') }}</p>
      </div>

      <DLineItemsTable :doc="doc" :sender="sender" />

      <div class="text-[9pt] leading-relaxed mt-4">
        <p>{{ t('Questions note') }}</p>
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
    "Invoice": "Rechnung",
    "Invoice date": "Rechnungsdatum",
    "Due date": "Zahlbar bis",
    "Your contact": "Ihr Ansprechpartner",
    "Customer number": "Kundennummer",
    "Greeting": "Guten Tag {name}",
    "Invoice intro": "Danke für Ihr Vertrauen. Ihre Rechnung setzt sich wie folgt zusammen:",
    "Pos": "Pos.",
    "Description": "Beschreibung",
    "Quantity": "Menge",
    "Unit price": "Einzelpreis",
    "Price in": "Preis in",
    "Product code": "Produktcode",
    "Amount (tax exempt)": "Betrag (von Steuer befreit)",
    "VAT": "MwSt",
    "Subtotal (net)": "Zwischensumme (netto)",
    "Total": "Total",
    "on": "auf",
    "Exempt": "Steuerfrei",
    "Questions note": "Bei Fragen stehen wir Ihnen gerne zur Verfügung.",
    "Kind regards": "Freundliche Grüsse",
    "Add line item": "Position hinzufügen"
  },
  "en": {
    "Invoice": "Invoice",
    "Invoice date": "Invoice date",
    "Due date": "Due date",
    "Your contact": "Your contact",
    "Customer number": "Customer number",
    "Greeting": "Dear {name}",
    "Invoice intro": "Thank you for your trust. Your invoice is as follows:",
    "Pos": "Pos.",
    "Description": "Description",
    "Quantity": "Quantity",
    "Unit price": "Unit price",
    "Price in": "Price in",
    "Product code": "Product code",
    "Amount (tax exempt)": "Amount (tax exempt)",
    "VAT": "VAT",
    "Subtotal (net)": "Subtotal (net)",
    "Total": "Total",
    "on": "on",
    "Exempt": "Exempt",
    "Questions note": "If you have any questions, please contact us.",
    "Kind regards": "Kind regards",
    "Add line item": "Add line item"
  },
  "es": {
    "Invoice": "Factura",
    "Invoice date": "Fecha de factura",
    "Due date": "Fecha de vencimiento",
    "Your contact": "Su persona de contacto",
    "Customer number": "Número de cliente",
    "Greeting": "Estimado/a {name}",
    "Invoice intro": "Gracias por su confianza. Su factura se compone de la siguiente manera:",
    "Pos": "Pos.",
    "Description": "Descripción",
    "Quantity": "Cantidad",
    "Unit price": "Precio unitario",
    "Price in": "Precio en",
    "Product code": "Código de producto",
    "Amount (tax exempt)": "Importe (exento de impuestos)",
    "VAT": "IVA",
    "Subtotal (net)": "Subtotal (neto)",
    "Total": "Total",
    "on": "sobre",
    "Exempt": "Exento",
    "Questions note": "¿Tiene preguntas? No dude en contactarnos.",
    "Kind regards": "Atentamente",
    "Add line item": "Añadir posición"
  },
  "nl": {
    "Invoice": "Factuur",
    "Invoice date": "Factuurdatum",
    "Due date": "Vervaldatum",
    "Your contact": "Uw contactpersoon",
    "Customer number": "Klantnummer",
    "Greeting": "Geachte {name}",
    "Invoice intro": "Bedankt voor uw vertrouwen. Uw factuur is als volgt samengesteld:",
    "Pos": "Pos.",
    "Description": "Omschrijving",
    "Quantity": "Aantal",
    "Unit price": "Eenheidsprijs",
    "Price in": "Prijs in",
    "Product code": "Productcode",
    "Amount (tax exempt)": "Bedrag (vrijgesteld van BTW)",
    "VAT": "BTW",
    "Subtotal (net)": "Subtotaal (netto)",
    "Total": "Totaal",
    "on": "over",
    "Exempt": "Vrijgesteld",
    "Questions note": "Heeft u vragen? Neem gerust contact met ons op.",
    "Kind regards": "Met vriendelijke groet",
    "Add line item": "Positie toevoegen"
  },
  "ru": {
    "Invoice": "Счёт",
    "Invoice date": "Дата счёта",
    "Due date": "Срок оплаты",
    "Your contact": "Контактное лицо",
    "Customer number": "Номер клиента",
    "Greeting": "Здравствуйте, {name}",
    "Invoice intro": "Благодарим за доверие. Ваш счёт составлен следующим образом:",
    "Pos": "Поз.",
    "Description": "Описание",
    "Quantity": "Количество",
    "Unit price": "Цена за единицу",
    "Price in": "Цена в",
    "Product code": "Код продукта",
    "Amount (tax exempt)": "Сумма (без НДС)",
    "VAT": "НДС",
    "Subtotal (net)": "Промежуточный итог (нетто)",
    "Total": "Итого",
    "on": "на",
    "Exempt": "Без НДС",
    "Questions note": "При возникновении вопросов обращайтесь к нам.",
    "Kind regards": "С уважением",
    "Add line item": "Добавить позицию"
  }
}
</i18n>
