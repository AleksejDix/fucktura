<template>
  <PageTemplate :page-index="pageIndex">
    <!-- Same header as Letter page -->
    <template #header>
      <header class="absolute top-0 left-0 right-0 pl-[26mm] pr-[15mm] pt-[10mm] max-h-[38mm]">
        <div class="flex items-start justify-between">
          <div class="h-[15mm] flex items-center">
            <div class="text-lg font-bold text-gray-400">[Logo]</div>
          </div>
          <div class="text-[8pt] text-right leading-relaxed">
            <div class="font-bold">{{ creditor.name }}</div>
            <div>{{ creditor.address }}</div>
            <div>{{ creditor.zip }} {{ creditor.city }}</div>
          </div>
        </div>
      </header>
    </template>

    <template #footer><span /></template>

    <!-- Thank you message -->
    <section class="pt-[20mm] text-[10pt] leading-relaxed">
      <p>Wir danken Ihnen herzlich für Ihr Vertrauen und die angenehme Zusammenarbeit.</p>
      <p class="mt-3">Bei Fragen zu dieser Rechnung stehen wir Ihnen jederzeit gerne zur Verfügung.</p>
      <p class="mt-6">Freundliche Grüsse</p>
      <p class="font-bold">{{ creditor.name }}</p>
    </section>

    <!-- Dashed separator above QR bill -->
    <div class="absolute bottom-[105mm] left-0 w-[210mm] border-t border-dashed border-gray-400"></div>

    <!-- QR Bill payment slip: 210x105mm at page bottom -->
    <div class="h-[105mm] w-[210mm] absolute bottom-0 left-0" v-html="qrBillSvg"></div>
  </PageTemplate>
</template>

<script setup lang="ts">
import { SwissQRBill } from 'swissqrbill/svg';
import PageTemplate from '../PageTemplate.vue';

defineProps({ pageIndex: { type: Number, default: 0 } });

const creditor = {
  name: 'Acme Consulting',
  address: 'Bahnhofstrasse 1',
  zip: '8001',
  city: 'Zürich',
  country: 'CH',
  account: 'CH00 0000 0000 0000 0000 0',
};

const data = {
  currency: 'CHF' as const,
  amount: 4147.00,
  creditor,
  debtor: {
    name: 'Sample AG',
    address: 'Beispielstrasse 1',
    zip: '8045',
    city: 'Zürich',
    country: 'CH',
  },
  message: 'Rechnung RE-00110',
};

const qrBill = new SwissQRBill(data, {
  language: 'DE',
});

const qrBillSvg = qrBill.toString();
</script>
