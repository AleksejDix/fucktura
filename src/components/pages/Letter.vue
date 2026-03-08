<template>
  <PageTemplate :page-index="pageIndex">
    <!-- SN 010130: Logo links, Absender rechts, max 38mm Höhe -->
    <template #header>
      <header class="absolute top-0 left-0 right-0 pl-[26mm] pr-[15mm] pt-[10mm] max-h-[38mm]">
        <div class="flex items-start justify-between">
          <!-- Logo links -->
          <div class="h-[15mm] flex items-center">
            <div class="text-lg font-bold text-gray-400">[Logo]</div>
          </div>
          <!-- Absender rechts -->
          <div class="text-[9pt] text-right leading-relaxed">
            <div class="font-bold">{{ sender.name }}</div>
            <div>{{ sender.street }}</div>
            <div>{{ sender.zip }} {{ sender.city }}, Schweiz</div>
            <div>{{ sender.email }}</div>
            <div>{{ sender.website }}</div>
            <div class="text-gray-500">{{ sender.uid }}</div>
          </div>
        </div>
      </header>
    </template>

    <section>
      <!-- SN 010130: Address field at 52mm from page top, 26mm from left -->
      <!-- PageTemplate content starts at 38mm, so 52 - 38 = 14mm -->
      <div class="pt-[14mm]">
        <div class="w-[90mm]">
          <!-- Empfänger -->
          <address class="not-italic text-[10pt] leading-relaxed">
            <div v-if="recipient.company">{{ recipient.company }}</div>
            <div v-if="recipient.name">{{ recipient.name }}</div>
            <div>{{ recipient.street }}</div>
            <div>{{ recipient.zip }} {{ recipient.city }}</div>
            <div v-if="recipient.country">{{ recipient.country }}</div>
          </address>
        </div>
      </div>

      <!-- Rechnung Titel -->
      <div class="pt-[12mm]">
        <h2 class="text-lg font-bold">Rechnung {{ invoiceNumber }}</h2>
        <p class="font-bold text-sm">{{ invoiceSubtitle }}</p>
      </div>

      <!-- Meta -->
      <div class="grid grid-cols-2 gap-x-8 text-[9pt] border-y border-gray-300 py-2 mt-3">
        <div class="flex justify-between">
          <span class="text-gray-600">Datum:</span>
          <span>{{ meta.datum }}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-600">Ihr Ansprechpartner:</span>
          <span>{{ meta.ansprechpartner }}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-600">Zahlbar bis:</span>
          <span>{{ meta.zahlbarBis }}</span>
        </div>
        <div class="flex justify-between">
          <span class="text-gray-600">Kundennummer:</span>
          <span>{{ meta.kundennummer }}</span>
        </div>
      </div>

      <!-- Anrede -->
      <div class="text-[10pt] leading-relaxed mt-3">
        <p>Guten Tag {{ recipient.name }}</p>
        <p class="mt-2">Danke für Ihr Vertrauen. Ihre Rechnung setzt sich wie folgt zusammen:</p>
      </div>

      <!-- Positionen -->
      <table class="w-full text-[9pt] mt-3">
        <thead>
          <tr class="border-b border-gray-400 text-left">
            <th class="py-1.5 w-[35px] font-bold">Pos.</th>
            <th class="py-1.5 font-bold">Beschreibung</th>
            <th class="py-1.5 text-right font-bold">Menge</th>
            <th class="py-1.5 text-right font-bold">Einzelpreis</th>
            <th class="py-1.5 text-right font-bold">Preis in CHF</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in lineItems" :key="item.pos" class="border-b border-gray-200">
            <td class="py-1.5 align-top">{{ item.pos }}</td>
            <td class="py-1.5 align-top">
              <div class="font-bold">{{ item.description }}</div>
              <div class="text-gray-500">Produktcode: {{ item.code }}</div>
            </td>
            <td class="py-1.5 text-right align-top">{{ formatAmount(item.quantity) }} h</td>
            <td class="py-1.5 text-right align-top">{{ formatAmount(item.unitPrice) }}</td>
            <td class="py-1.5 text-right align-top">{{ formatChf(item.quantity * item.unitPrice) }}</td>
          </tr>
        </tbody>
        <tfoot>
          <tr class="border-t border-gray-400">
            <td></td>
            <td class="py-1.5 font-bold">Betrag (von Steuer befreit)</td>
            <td></td>
            <td></td>
            <td class="py-1.5 text-right font-bold">{{ formatChf(total) }}</td>
          </tr>
        </tfoot>
      </table>

      <!-- Abschluss -->
      <div class="text-[10pt] leading-relaxed mt-4">
        <p>Sie haben Fragen? Melden Sie sich bei uns.</p>
        <p class="mt-3">Freundliche Grüsse</p>
        <p>{{ meta.ansprechpartner }}</p>
      </div>
    </section>
  </PageTemplate>
</template>

<script setup lang="ts">
import { computed, reactive } from 'vue';
import PageTemplate from '../PageTemplate.vue';

defineProps({ pageIndex: { type: Number, default: 0 } });

const invoiceNumber = 'RE-00110';
const invoiceSubtitle = 'November 2025 - Automated Testing - Andrew Pichkur';

const sender = reactive({
  name: 'Dix Consulting',
  street: 'Glärnischstrasse 214',
  zip: '8708',
  city: 'Männedorf',
  email: 'invoice@dix.consulting',
  website: 'www.dix.consulting',
  uid: 'CHE-397.600.688',
});

const recipient = reactive({
  company: 'Property Captain Tech AG',
  name: 'Frau Ilic Manuela',
  street: 'Rüdigerstrasse 15',
  zip: '8045',
  city: 'Zürich',
  country: 'Schweiz',
});

const meta = reactive({
  datum: '04.12.2025',
  zahlbarBis: '19.12.2025',
  ansprechpartner: 'Dix Lidia',
  kundennummer: '000005',
});

const lineItems = reactive([
  { pos: 1, description: 'Cockpit Investoren / Parzellen Betrieb', code: '6220', quantity: 12, unitPrice: 29 },
  { pos: 2, description: 'Cockpit Investoren / Parzellen Entwicklung', code: '6221', quantity: 6, unitPrice: 29 },
  { pos: 3, description: 'Cockpit Makler Betrieb', code: '6222', quantity: 117, unitPrice: 29 },
  { pos: 4, description: 'Cockpit Makler Entwicklung', code: '6223', quantity: 8, unitPrice: 29 },
  { pos: 5, description: 'Portal Betrieb', code: '6224', quantity: 0, unitPrice: 29 },
  { pos: 6, description: 'Portal Entwicklung', code: '6225', quantity: 0, unitPrice: 29 },
]);

const total = computed(() => lineItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0));

function formatAmount(n: number): string {
  return n.toFixed(2);
}

function formatChf(n: number): string {
  return n.toLocaleString('de-CH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
</script>
