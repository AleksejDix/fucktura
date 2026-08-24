<template>
  <PageTemplate :page-index="pageIndex">
    <template #header>
      <DLetterhead :sender="sender" />
    </template>

    <section>
      <DRecipientAddress :doc="doc" />

      <DDocTitle :doc="doc" :title="t('Quote')" />

      <div class="grid grid-cols-2 gap-x-8 text-[9pt] border-y border-gray-300 py-2 mt-3">
        <DMetaField :label="t('Quote date')">
          <DDate :value="meta.date" @update="(v) => update({ meta: { date: v } })" />
        </DMetaField>
        <DMetaField :label="t('Your contact')">
          <DInline
            v-model="meta.contactPerson"
            tag="span"
            @update:model-value="(v) => update({ meta: { contactPerson: v } })"
          />
        </DMetaField>
        <DMetaField :label="t('Valid until')">
          <DDate :value="meta.validUntil" @update="(v) => update({ meta: { validUntil: v } })" />
        </DMetaField>
        <DMetaField :label="t('Customer number')">
          <DInline
            v-model="meta.customerNumber"
            tag="span"
            class="font-mono"
            @update:model-value="(v) => update({ meta: { customerNumber: v } })"
          />
        </DMetaField>
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
import DLetterhead from '../DLetterhead.vue';
import DRecipientAddress from '../DRecipientAddress.vue';
import DDocTitle from '../DDocTitle.vue';
import DMetaField from '../DMetaField.vue';
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
    "Quote valid note": "Diese Offerte ist gültig bis {date}.",
    "Quote closing": "Wir freuen uns auf Ihre Rückmeldung.",
    "Kind regards": "Freundliche Grüsse"
  },
  "en": {
    "Quote": "Quote",
    "Quote date": "Quote date",
    "Valid until": "Valid until",
    "Your contact": "Your contact",
    "Customer number": "Customer number",
    "Greeting": "Dear {name}",
    "Quote intro": "Thank you for your inquiry. We are pleased to offer you the following:",
    "Quote valid note": "This quote is valid until {date}.",
    "Quote closing": "We look forward to hearing from you.",
    "Kind regards": "Kind regards"
  },
  "es": {
    "Quote": "Presupuesto",
    "Quote date": "Fecha de presupuesto",
    "Valid until": "Válido hasta",
    "Your contact": "Su persona de contacto",
    "Customer number": "Número de cliente",
    "Greeting": "Estimado/a {name}",
    "Quote intro": "Gracias por su consulta. Nos complace presentarle el siguiente presupuesto:",
    "Quote valid note": "Este presupuesto es válido hasta el {date}.",
    "Quote closing": "Esperamos su respuesta.",
    "Kind regards": "Atentamente"
  },
  "nl": {
    "Quote": "Offerte",
    "Quote date": "Offertedatum",
    "Valid until": "Geldig tot",
    "Your contact": "Uw contactpersoon",
    "Customer number": "Klantnummer",
    "Greeting": "Geachte {name}",
    "Quote intro": "Bedankt voor uw aanvraag. Graag bieden wij u de volgende quote aan:",
    "Quote valid note": "Deze quote is geldig tot {date}.",
    "Quote closing": "Wij zien uw reactie met belangstelling tegemoet.",
    "Kind regards": "Met vriendelijke groet"
  },
  "ru": {
    "Quote": "Коммерческое предложение",
    "Quote date": "Дата предложения",
    "Valid until": "Действительно до",
    "Your contact": "Контактное лицо",
    "Customer number": "Номер клиента",
    "Greeting": "Здравствуйте, {name}",
    "Quote intro": "Благодарим за ваш запрос. Рады предложить вам следующее:",
    "Quote valid note": "Данное предложение действительно до {date}.",
    "Quote closing": "Ждём вашего ответа.",
    "Kind regards": "С уважением"
  }
}
</i18n>
