<template>
  <PageTemplate :page-index="pageIndex">
    <template #header>
      <header class="absolute top-0 left-0 right-0 pl-[var(--norm-ml)] pr-[var(--norm-mr)] pt-[10mm] max-h-[var(--norm-header-h)]">
        <div class="flex justify-end">
          <div class="text-[9pt] text-right leading-relaxed">
            <div class="font-bold">{{ sender.company }}</div>
            <div>{{ sender.street }}</div>
            <div><span class="font-mono">{{ sender.zip }}</span> {{ sender.city }}, {{ sender.country }}</div>
            <div>{{ sender.email }}</div>
            <div>{{ sender.website }}</div>
            <div class="text-gray-500 font-mono">{{ sender.uid }}</div>
          </div>
        </div>
      </header>
    </template>

    <template #footer><span /></template>

    <section class="pt-[20mm] text-[9pt] leading-relaxed">
      <p>{{ t('Thank you note') }}</p>
      <p class="mt-2">{{ t('Questions note') }}</p>
      <p class="mt-6">{{ t('Kind regards') }}</p>
      <p class="font-bold">{{ sender.contact || sender.company }}</p>
    </section>

    <div class="absolute bottom-[105mm] left-0 w-[210mm] border-t border-dashed border-gray-400"></div>
    <div class="h-[105mm] w-[210mm] absolute bottom-0 left-0" v-html="qrBillSvg"></div>
  </PageTemplate>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { SwissQRBill } from 'swissqrbill/svg';
import { toDecimal } from 'dinero.js';
import type { Document, SenderSnapshot } from '@/db';
import { useMoney } from '@/composables/useMoney';
import PageTemplate from '../PageTemplate.vue';

const { t, locale } = useI18n({ useScope: 'local' });
const { sumLineItems, sumAmounts } = useMoney();

const props = defineProps<{
  pageIndex?: number;
  doc: Document;
  sender: SenderSnapshot;
}>();

const qrBillSvg = ref('');

const qrLanguageMap: Record<string, 'DE' | 'FR' | 'IT' | 'EN'> = {
  de: 'DE', en: 'EN', fr: 'FR', it: 'IT', es: 'EN', ru: 'EN',
};

watch(
  () => JSON.stringify(props.doc) + locale.value,
  () => {
    let amount = 0;
    if (props.doc.type === 'mahnung') {
      amount = parseFloat(toDecimal(sumAmounts(props.doc.offenerBetrag ?? 0, props.doc.mahngebuehr ?? 0, props.doc.verzugszins ?? 0)));
    } else {
      const items = props.doc.lineItems ?? [];
      amount = items.length ? parseFloat(toDecimal(sumLineItems(items))) : 0;
    }

    const account = props.sender.accounts?.find(a => a.iban.startsWith('CH')) ?? props.sender.accounts?.[0];
    if (!account) { qrBillSvg.value = ''; return; }

    const data = {
      currency: 'CHF' as const,
      amount,
      creditor: {
        name: props.sender.company,
        address: props.sender.street,
        zip: props.sender.zip,
        city: props.sender.city,
        country: 'CH',
        account: account.iban,
      },
      debtor: {
        name: props.doc.recipient.company || props.doc.recipient.name,
        address: props.doc.recipient.street,
        zip: props.doc.recipient.zip,
        city: props.doc.recipient.city,
        country: props.doc.recipient.country === 'Schweiz' ? 'CH' : props.doc.recipient.country?.slice(0, 2).toUpperCase() || 'CH',
      },
      message: `${props.doc.number}`,
    };

    try {
      qrBillSvg.value = new SwissQRBill(data, { language: qrLanguageMap[locale.value] ?? 'DE' }).toString();
    } catch {
      qrBillSvg.value = '';
    }
  },
  { immediate: true },
);
</script>

<i18n lang="json">
{
  "de": {
    "Thank you note": "Wir danken Ihnen herzlich für Ihr Vertrauen und die angenehme Zusammenarbeit.",
    "Questions note": "Bei Fragen zu dieser Rechnung stehen wir Ihnen jederzeit gerne zur Verfügung.",
    "Kind regards": "Freundliche Grüsse"
  },
  "en": {
    "Thank you note": "Thank you for your trust and the pleasant cooperation.",
    "Questions note": "If you have any questions about this invoice, please do not hesitate to contact us.",
    "Kind regards": "Kind regards"
  },
  "es": {
    "Thank you note": "Le agradecemos su confianza y la agradable colaboración.",
    "Questions note": "Si tiene alguna pregunta sobre esta factura, no dude en contactarnos.",
    "Kind regards": "Atentamente"
  },
  "nl": {
    "Thank you note": "Wij danken u hartelijk voor uw vertrouwen en de prettige samenwerking.",
    "Questions note": "Heeft u vragen over deze factuur? Neem dan gerust contact met ons op.",
    "Kind regards": "Met vriendelijke groet"
  },
  "ru": {
    "Thank you note": "Благодарим вас за доверие и приятное сотрудничество.",
    "Questions note": "При возникновении вопросов по данному счёту обращайтесь к нам.",
    "Kind regards": "С уважением"
  }
}
</i18n>
