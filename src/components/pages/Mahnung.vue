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
          <h2 class="text-[14pt] font-bold">{{ mahnungStufe }}. {{ $t('Reminder') }}</h2>
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
          <span class="text-gray-600">{{ $t('Invoice date') }}:</span>
          <span class="font-mono">{{ meta.rechnungsDatum }}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-600">{{ $t('Overdue since') }}:</span>
          <span class="font-mono">{{ meta.faelligSeit }}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-600">{{ $t('Customer number') }}:</span>
          <span class="font-mono">{{ meta.kundennummer }}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-600">{{ $t('Due date') }}:</span>
          <span class="font-mono">{{ meta.zahlbarBis }}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-600">{{ $t('Your contact') }}:</span>
          <span>{{ meta.ansprechpartner }}</span>
        </div>
      </div>

      <div class="text-[9pt] leading-relaxed mt-3">
        <p>{{ $t('Greeting', { name: recipient.name }) }}</p>
        <p class="mt-2">{{ $t('Reminder intro') }}</p>
      </div>

      <table class="w-full text-[9pt] mt-3">
        <thead>
          <tr class="border-b border-gray-400 text-left">
            <th class="py-1.5 font-bold">{{ $t('Description') }}</th>
            <th class="py-1.5 text-right font-bold">{{ $t('Price in CHF') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr class="border-b border-gray-200">
            <td class="py-1.5">{{ $t('Outstanding amount') }} ({{ $t('reminder to invoice') }} <span class="font-mono">{{ invoiceNumber }}</span>)</td>
            <td class="py-1.5 text-right font-mono">{{ formatChf(offenerBetrag) }}</td>
          </tr>
          <tr v-if="mahngebuehr > 0" class="border-b border-gray-200">
            <td class="py-1.5">{{ $t('Reminder fee') }}</td>
            <td class="py-1.5 text-right font-mono">{{ formatChf(mahngebuehr) }}</td>
          </tr>
          <tr v-if="verzugszins > 0" class="border-b border-gray-200">
            <td class="py-1.5">{{ $t('Default interest') }}</td>
            <td class="py-1.5 text-right font-mono">{{ formatChf(verzugszins) }}</td>
          </tr>
        </tbody>
        <tfoot>
          <tr class="border-t border-gray-400">
            <td class="py-1.5 font-bold">{{ $t('Total amount due') }}</td>
            <td class="py-1.5 text-right font-bold font-mono">{{ formatChf(total) }}</td>
          </tr>
        </tfoot>
      </table>

      <div class="text-[9pt] leading-relaxed mt-4">
        <p>{{ $t('Reminder crossing note') }}</p>
        <p class="mt-2">{{ $t('Questions note') }}</p>
        <p class="mt-3">{{ $t('Kind regards') }}</p>
        <p>{{ meta.ansprechpartner }}</p>
      </div>
    </section>
  </PageTemplate>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import PageTemplate from '../PageTemplate.vue';
import sender from '@/data/sender.json';
import doc from '@/data/documents/MH-00001.json';

defineProps({ pageIndex: { type: Number, default: 0 } });

const { number: invoiceNumber, subtitle: invoiceSubtitle, stufe: mahnungStufe, recipient, meta, offenerBetrag, mahngebuehr, verzugszins } = doc;

const total = computed(() => offenerBetrag + mahngebuehr + verzugszins);

function formatChf(n: number): string {
  return n.toLocaleString('de-CH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
</script>

<i18n lang="json">
{
  "de": {
    "Reminder": "Mahnung",
    "Date": "Datum",
    "Invoice date": "Rechnungsdatum",
    "Overdue since": "Fällig seit",
    "Due date": "Zahlbar bis",
    "Your contact": "Ihr Ansprechpartner",
    "Customer number": "Kundennummer",
    "Greeting": "Guten Tag {name}",
    "Reminder intro": "Gemäss unseren Unterlagen ist die oben genannte Rechnung noch offen. Wir bitten Sie, den ausstehenden Betrag innert der angegebenen Frist zu überweisen.",
    "Description": "Beschreibung",
    "Price in CHF": "Betrag in CHF",
    "Outstanding amount": "Offener Rechnungsbetrag",
    "reminder to invoice": "zur Rechnung",
    "Reminder fee": "Mahngebühr",
    "Default interest": "Verzugszins",
    "Total amount due": "Fälliger Gesamtbetrag",
    "Reminder crossing note": "Sollte sich Ihre Zahlung mit diesem Schreiben gekreuzt haben, betrachten Sie diese Mahnung bitte als gegenstandslos.",
    "Questions note": "Bei Fragen stehen wir Ihnen gerne zur Verfügung.",
    "Kind regards": "Freundliche Grüsse"
  },
  "en": {
    "Reminder": "Reminder",
    "Date": "Date",
    "Invoice date": "Invoice date",
    "Overdue since": "Overdue since",
    "Due date": "Due date",
    "Your contact": "Your contact",
    "Customer number": "Customer number",
    "Greeting": "Dear {name}",
    "Reminder intro": "According to our records, the above invoice is still outstanding. Please transfer the outstanding amount within the specified period.",
    "Description": "Description",
    "Price in CHF": "Amount in CHF",
    "Outstanding amount": "Outstanding amount",
    "reminder to invoice": "to invoice",
    "Reminder fee": "Reminder fee",
    "Default interest": "Default interest",
    "Total amount due": "Total amount due",
    "Reminder crossing note": "Should your payment have crossed with this letter, please disregard this reminder.",
    "Questions note": "If you have any questions, please contact us.",
    "Kind regards": "Kind regards"
  },
  "es": {
    "Reminder": "Recordatorio de pago",
    "Date": "Fecha",
    "Invoice date": "Fecha de factura",
    "Overdue since": "Vencida desde",
    "Due date": "Fecha de vencimiento",
    "Your contact": "Su persona de contacto",
    "Customer number": "Número de cliente",
    "Greeting": "Estimado/a {name}",
    "Reminder intro": "Según nuestros registros, la factura mencionada sigue pendiente de pago. Le rogamos que transfiera el importe adeudado dentro del plazo indicado.",
    "Description": "Descripción",
    "Price in CHF": "Importe en CHF",
    "Outstanding amount": "Importe pendiente de la factura",
    "reminder to invoice": "a la factura",
    "Reminder fee": "Gastos de recordatorio",
    "Default interest": "Intereses de demora",
    "Total amount due": "Importe total adeudado",
    "Reminder crossing note": "Si su pago se ha cruzado con esta carta, le rogamos que ignore este recordatorio.",
    "Questions note": "¿Tiene preguntas? No dude en contactarnos.",
    "Kind regards": "Atentamente"
  }
}
</i18n>
