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
          <!-- Empfänger -->
          <address class="not-italic text-[9pt] leading-relaxed">
            <div v-if="recipient.company">{{ recipient.company }}</div>
            <div v-if="recipient.name">{{ recipient.name }}</div>
            <div>{{ recipient.street }}</div>
            <div><span class="font-mono">{{ recipient.zip }}</span> {{ recipient.city }}</div>
            <div v-if="recipient.country">{{ recipient.country }}</div>
          </address>
        </div>
      </div>

      <!-- Mahnung Titel -->
      <div class="pt-[12mm]">
        <div class="flex justify-between items-baseline">
          <h2 class="text-[14pt] font-bold">{{ mahnungStufe }}. Mahnung</h2>
          <span class="text-[14pt] font-bold">{{ invoiceNumber }}</span>
        </div>
        <p class="font-bold text-[9pt]">{{ invoiceSubtitle }}</p>
      </div>

      <!-- Meta -->
      <div class="grid grid-cols-2 gap-x-8 text-[9pt] border-y border-gray-300 py-2 mt-3">
        <div class="flex justify-between">
          <span class="text-gray-600">Datum:</span>
          <span class="font-mono">{{ meta.datum }}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-600">Rechnungsdatum:</span>
          <span class="font-mono">{{ meta.rechnungsDatum }}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-600">Fällig seit:</span>
          <span class="font-mono">{{ meta.faelligSeit }}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-600">Kundennummer:</span>
          <span class="font-mono">{{ meta.kundennummer }}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-600">Zahlbar bis:</span>
          <span class="font-mono">{{ meta.zahlbarBis }}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-600">Ihr Ansprechpartner:</span>
          <span>{{ meta.ansprechpartner }}</span>
        </div>
      </div>

      <!-- Anrede -->
      <div class="text-[9pt] leading-relaxed mt-3">
        <p>Guten Tag {{ recipient.name }}</p>
        <p class="mt-2">
          Gemäss unseren Unterlagen ist die oben genannte Rechnung noch offen.
          Wir bitten Sie, den ausstehenden Betrag innert der angegebenen Frist zu überweisen.
        </p>
      </div>

      <!-- Positionen -->
      <table class="w-full text-[9pt] mt-3">
        <thead>
          <tr class="border-b border-gray-400 text-left">
            <th class="py-1.5 font-bold">Beschreibung</th>
            <th class="py-1.5 text-right font-bold">Betrag in CHF</th>
          </tr>
        </thead>
        <tbody>
          <tr class="border-b border-gray-200">
            <td class="py-1.5">Offener Rechnungsbetrag (Rechnung <span class="font-mono">{{ invoiceNumber }}</span>)</td>
            <td class="py-1.5 text-right font-mono">{{ formatChf(offenerBetrag) }}</td>
          </tr>
          <tr v-if="mahngebuehr > 0" class="border-b border-gray-200">
            <td class="py-1.5">Mahngebühr</td>
            <td class="py-1.5 text-right font-mono">{{ formatChf(mahngebuehr) }}</td>
          </tr>
          <tr v-if="verzugszins > 0" class="border-b border-gray-200">
            <td class="py-1.5">Verzugszins</td>
            <td class="py-1.5 text-right font-mono">{{ formatChf(verzugszins) }}</td>
          </tr>
        </tbody>
        <tfoot>
          <tr class="border-t border-gray-400">
            <td class="py-1.5 font-bold">Fälliger Gesamtbetrag</td>
            <td class="py-1.5 text-right font-bold font-mono">{{ formatChf(total) }}</td>
          </tr>
        </tfoot>
      </table>

      <!-- Abschluss -->
      <div class="text-[9pt] leading-relaxed mt-4">
        <p>
          Sollte sich Ihre Zahlung mit diesem Schreiben gekreuzt haben, betrachten Sie diese Mahnung bitte als gegenstandslos.
        </p>
        <p class="mt-2">Bei Fragen stehen wir Ihnen gerne zur Verfügung.</p>
        <p class="mt-3">Freundliche Grüsse</p>
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
