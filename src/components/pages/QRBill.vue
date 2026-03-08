<template>
  <PageTemplate :page-index="pageIndex">
    <!-- Same header as Letter page -->
    <template #header>
      <header class="absolute top-0 left-0 right-0 pl-[26mm] pr-[15mm] pt-[10mm] max-h-[38mm]">
        <div class="flex justify-end">
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
  name: 'Dix Consulting',
  address: 'Glärnischstrasse 214',
  zip: '8708',
  city: 'Männedorf',
  country: 'CH',
  account: 'CH58 0070 0114 8057 5961 3',
};

const data = {
  currency: 'CHF' as const,
  amount: 4147.00,
  creditor,
  debtor: {
    name: 'Property Captain Tech AG',
    address: 'Rüdigerstrasse 15',
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
