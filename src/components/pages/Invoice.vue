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
          <address class="not-italic text-[9pt] leading-relaxed">
            <div v-if="recipient.company">{{ recipient.company }}</div>
            <div v-if="recipient.name">{{ recipient.name }}</div>
            <div>{{ recipient.street }}</div>
            <div><span class="font-mono">{{ recipient.zip }}</span> {{ recipient.city }}</div>
            <div v-if="recipient.country">{{ recipient.country }}</div>
          </address>
        </div>
      </div>

      <div class="pt-[12mm]">
        <div class="flex justify-between items-baseline">
          <h2 class="text-[14pt] font-bold">{{ $t('Invoice') }}</h2>
          <span class="text-[14pt] font-bold">{{ invoiceNumber }}</span>
        </div>
        <p class="font-bold text-[9pt]">{{ invoiceSubtitle }}</p>
      </div>

      <div class="grid grid-cols-2 gap-x-8 text-[9pt] border-y border-gray-300 py-2 mt-3">
        <div class="flex justify-between">
          <span class="text-gray-600">{{ $t('Date') }}:</span>
          <span class="font-mono">{{ meta.datum }}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-600">{{ $t('Your contact') }}:</span>
          <span>{{ meta.contactPerson }}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-600">{{ $t('Due date') }}:</span>
          <span class="font-mono">{{ meta.zahlbarBis }}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-600">{{ $t('Customer number') }}:</span>
          <span class="font-mono">{{ meta.kundennummer }}</span>
        </div>
      </div>

      <div class="text-[9pt] leading-relaxed mt-3">
        <p>{{ $t('Greeting', { name: recipient.name }) }}</p>
        <p class="mt-2">{{ $t('Invoice intro') }}</p>
      </div>

      <table class="w-full text-[9pt] mt-3">
        <thead>
          <tr class="border-b border-gray-400 text-left">
            <th class="py-1.5 w-[35px] font-bold">{{ $t('Pos') }}</th>
            <th class="py-1.5 font-bold">{{ $t('Description') }}</th>
            <th class="py-1.5 text-right font-bold">{{ $t('Quantity') }}</th>
            <th class="py-1.5 text-right font-bold">{{ $t('Unit price') }}</th>
            <th class="py-1.5 text-right font-bold">{{ $t('Price in CHF') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in lineItems" :key="item.pos" class="border-b border-gray-200">
            <td class="py-1.5 align-top font-mono">{{ item.pos }}</td>
            <td class="py-1.5 align-top">
              <div class="font-bold">{{ item.description }}</div>
              <div class="text-gray-500">{{ $t('Product code') }}: <span class="font-mono">{{ item.code }}</span></div>
            </td>
            <td class="py-1.5 text-right align-top font-mono">{{ formatAmount(item.quantity) }} h</td>
            <td class="py-1.5 text-right align-top font-mono">{{ formatAmount(item.unitPrice) }}</td>
            <td class="py-1.5 text-right align-top font-mono">{{ formatChf(item.quantity * item.unitPrice) }}</td>
          </tr>
        </tbody>
        <tfoot>
          <tr class="border-t border-gray-400">
            <td></td>
            <td class="py-1.5 font-bold">{{ $t('Amount (tax exempt)') }}</td>
            <td></td>
            <td></td>
            <td class="py-1.5 text-right font-bold font-mono">{{ formatChf(total) }}</td>
          </tr>
        </tfoot>
      </table>

      <div class="text-[9pt] leading-relaxed mt-4">
        <p>{{ $t('Questions note') }}</p>
        <p class="mt-3">{{ $t('Kind regards') }}</p>
        <p>{{ meta.contactPerson }}</p>
      </div>
    </section>
  </PageTemplate>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import PageTemplate from '../PageTemplate.vue';
import sender from '@/data/sender.json';
import doc from '@/data/documents/RE-00110.json';

defineProps({ pageIndex: { type: Number, default: 0 } });

const { number: invoiceNumber, subtitle: invoiceSubtitle, recipient, meta, lineItems } = doc;

const total = computed(() => lineItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0));

function formatAmount(n: number): string {
  return n.toFixed(2);
}

function formatChf(n: number): string {
  return n.toLocaleString('de-CH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
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
    "Kind regards": "Freundliche Grüsse"
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
    "Kind regards": "Kind regards"
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
    "Kind regards": "Atentamente"
  }
}
</i18n>
