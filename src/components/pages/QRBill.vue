<template>
  <PageTemplate :page-index="pageIndex">
    <template #header><span /></template>
    <template #footer><span /></template>

    <section class="absolute inset-0 flex flex-col">
      <!-- Top area: can be left empty or used for additional info -->
      <div class="flex-1"></div>

      <!-- QR Bill payment slip: 210x105mm at page bottom -->
      <div class="h-[105mm] w-[210mm] absolute bottom-0 left-0" v-html="qrBillSvg"></div>
    </section>
  </PageTemplate>
</template>

<script setup lang="ts">
import { SwissQRBill } from 'swissqrbill/svg';
import PageTemplate from '../PageTemplate.vue';

defineProps({ pageIndex: { type: Number, default: 0 } });

const data = {
  currency: 'CHF' as const,
  amount: 4147.00,
  creditor: {
    name: 'Acme Consulting',
    address: 'Bahnhofstrasse 1',
    zip: '8001',
    city: 'Zürich',
    country: 'CH',
    account: 'CH00 0000 0000 0000 0000 0',
  },
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
