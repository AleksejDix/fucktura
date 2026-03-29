<template>
  <PageTemplate :page-index="pageIndex">
    <template #header>
      <header class="absolute top-0 left-0 right-0 pt-[10mm] pl-[var(--norm-ml)] pr-[var(--norm-mr)] max-h-[var(--norm-header-h)]">
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

    <section>
      <div class="pt-[var(--norm-addr-offset)]">
        <div class="w-[var(--norm-addr-w)]">
          <DClientPicker :doc-id="doc.id!" :has-client="!!recipient.company || !!recipient.name" />
          <address v-if="recipient.company || recipient.name" class="not-italic text-[9pt] leading-relaxed">
            <DInline v-model="recipient.company" tag="div" @update:model-value="v => update({ 'recipient.company': v })" />
            <DInline v-model="recipient.name" tag="div" @update:model-value="v => update({ 'recipient.name': v })" />
            <DInline v-model="recipient.street" tag="div" @update:model-value="v => update({ 'recipient.street': v })" />
            <div>
              <DInline v-model="recipient.zip" tag="span" class="font-mono" @update:model-value="v => update({ 'recipient.zip': v })" />
              {{ ' ' }}
              <DInline v-model="recipient.city" tag="span" @update:model-value="v => update({ 'recipient.city': v })" />
            </div>
            <DInline v-if="recipient.country" v-model="recipient.country" tag="div" @update:model-value="v => update({ 'recipient.country': v })" />
          </address>
        </div>
      </div>

      <div class="pt-[12mm]">
        <div class="flex justify-between items-baseline">
          <h2 class="text-[14pt] font-bold">
            <DInline :model-value="String(mahnungStufe)" tag="span" @update:model-value="v => updateStufe(v)" />. {{ t('Reminder') }}
          </h2>
          <span class="text-[14pt] font-bold">{{ doc.number }}</span>
        </div>
        <DInline v-model="doc.subtitle" tag="p" class="font-bold text-[9pt]" @update:model-value="v => update({ subtitle: v })" />
      </div>

      <div class="grid grid-cols-2 gap-x-8 text-[9pt] border-y border-gray-300 py-2 mt-3">
        <div class="flex justify-between">
          <span class="text-gray-600">{{ t('Date') }}:</span>
          <DDate :value="meta.date" @update="v => update({ 'meta.date': v })" />
        </div>
        <div class="flex justify-between">
          <span class="text-gray-600">{{ t('Invoice date') }}:</span>
          <DDate :value="meta.invoiceDate" @update="v => update({ 'meta.invoiceDate': v })" />
        </div>
        <div class="flex justify-between">
          <span class="text-gray-600">{{ t('Overdue since') }}:</span>
          <DDate :value="meta.overdueSince" @update="v => update({ 'meta.overdueSince': v })" />
        </div>
        <div class="flex justify-between">
          <span class="text-gray-600">{{ t('Customer number') }}:</span>
          <DInline v-model="meta.customerNumber" tag="span" class="font-mono" @update:model-value="v => update({ 'meta.customerNumber': v })" />
        </div>
        <div class="flex justify-between">
          <span class="text-gray-600">{{ t('Due date') }}:</span>
          <DDate :value="meta.dueDate" @update="v => update({ 'meta.dueDate': v })" />
        </div>
        <div class="flex justify-between">
          <span class="text-gray-600">{{ t('Your contact') }}:</span>
          <DInline v-model="meta.contactPerson" tag="span" @update:model-value="v => update({ 'meta.contactPerson': v })" />
        </div>
      </div>

      <div class="text-[9pt] leading-relaxed mt-3">
        <p>{{ t('Greeting', { name: recipient.name }) }}</p>
        <p class="mt-2">{{ t('Reminder intro') }}</p>
      </div>

      <table class="w-full text-[9pt] mt-3">
        <thead>
          <tr class="border-b border-gray-400 text-left">
            <th class="py-1.5 font-bold">{{ t('Description') }}</th>
            <th class="py-1.5 text-right font-bold">{{ t('Price in CHF') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr class="border-b border-gray-200">
            <td class="py-1.5">{{ t('Outstanding amount') }} ({{ t('reminder to invoice') }} <span class="font-mono">{{ doc.number }}</span>)</td>
            <td class="py-1.5 text-right font-mono">
              <DInline :model-value="formatAmount(offenerBetrag)" tag="span" @update:model-value="v => update({ offenerBetrag: parseFloat(v) || 0 })" />
            </td>
          </tr>
          <tr class="border-b border-gray-200">
            <td class="py-1.5">{{ t('Reminder fee') }}</td>
            <td class="py-1.5 text-right font-mono">
              <DInline :model-value="formatAmount(mahngebuehr)" tag="span" @update:model-value="v => update({ mahngebuehr: parseFloat(v) || 0 })" />
            </td>
          </tr>
          <tr class="border-b border-gray-200">
            <td class="py-1.5">{{ t('Default interest') }}</td>
            <td class="py-1.5 text-right font-mono">
              <DInline :model-value="formatAmount(verzugszins)" tag="span" @update:model-value="v => update({ verzugszins: parseFloat(v) || 0 })" />
            </td>
          </tr>
        </tbody>
        <tfoot>
          <tr class="border-t border-gray-400">
            <td class="py-1.5 font-bold">{{ t('Total amount due') }}</td>
            <td class="py-1.5 text-right font-bold font-mono">{{ formatChf(total) }}</td>
          </tr>
        </tfoot>
      </table>

      <div class="text-[9pt] leading-relaxed mt-4">
        <p>{{ t('Reminder crossing note') }}</p>
        <p class="mt-2">{{ t('Questions note') }}</p>
        <p class="mt-3">{{ t('Kind regards') }}</p>
        <p>{{ meta.contactPerson }}</p>
      </div>

      <p class="text-[7pt] text-gray-400 mt-6">{{ t('Legal basis') }}: {{ countryDefaults.legalBasis }} · {{ t('Interest rate') }}: {{ (countryDefaults.verzugszinsRate * 100).toFixed(1) }}% p.a.</p>
    </section>
  </PageTemplate>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import type { Document, Sender } from '@/db';
import { useDocumentsStore } from '@/stores/documents';
import { useMoney } from '@/composables/useMoney';
import { getMahnungDefaults } from '@/data/mahnung-defaults';
import PageTemplate from '../PageTemplate.vue';
import DClientPicker from '../DClientPicker.vue';
import DInline from '../DInline.vue';
import DDate from '../DDate.vue';

const { t } = useI18n({ useScope: 'local' });
const store = useDocumentsStore();
const { sumAmounts, formatChf } = useMoney();

const props = defineProps<{
  pageIndex?: number;
  doc: Document;
  sender: Sender;
}>();

const recipient = computed(() => props.doc.recipient);
const meta = computed(() => props.doc.meta);
const mahnungStufe = computed(() => props.doc.stufe ?? 1);
const offenerBetrag = computed(() => props.doc.offenerBetrag ?? 0);
const mahngebuehr = computed(() => props.doc.mahngebuehr ?? 0);
const verzugszins = computed(() => props.doc.verzugszins ?? 0);
const countryDefaults = computed(() => getMahnungDefaults(recipient.value.country || 'Schweiz'));

const total = computed(() => sumAmounts(offenerBetrag.value, mahngebuehr.value, verzugszins.value));

function update(changes: Record<string, unknown>) {
  if (!props.doc.id) return;
  store.updateDocument(props.doc.id, changes);
}

function updateStufe(value: string) {
  const stufe = Math.max(1, Math.min(3, parseInt(value) || 1));
  const fee = countryDefaults.value.mahngebuehr[stufe - 1] ?? 0;
  update({ stufe, mahngebuehr: fee });
}

function formatAmount(n: number): string {
  return n.toFixed(2);
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
    "Kind regards": "Freundliche Grüsse",
    "Legal basis": "Rechtsgrundlage",
    "Interest rate": "Verzugszins"
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
    "Kind regards": "Kind regards",
    "Legal basis": "Legal basis",
    "Interest rate": "Interest rate"
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
    "Kind regards": "Atentamente",
    "Legal basis": "Base legal",
    "Interest rate": "Tipo de interés"
  },
  "nl": {
    "Reminder": "Aanmaning",
    "Date": "Datum",
    "Invoice date": "Factuurdatum",
    "Overdue since": "Vervallen sinds",
    "Due date": "Vervaldatum",
    "Your contact": "Uw contactpersoon",
    "Customer number": "Klantnummer",
    "Greeting": "Geachte {name}",
    "Reminder intro": "Volgens onze administratie is bovengenoemde factuur nog niet voldaan. Wij verzoeken u het openstaande bedrag binnen de aangegeven termijn over te maken.",
    "Description": "Omschrijving",
    "Price in CHF": "Bedrag in CHF",
    "Outstanding amount": "Openstaand factuurbedrag",
    "reminder to invoice": "bij factuur",
    "Reminder fee": "Aanmaningskosten",
    "Default interest": "Wettelijke rente",
    "Total amount due": "Totaal verschuldigd bedrag",
    "Reminder crossing note": "Mocht uw betaling deze brief hebben gekruist, dan kunt u deze aanmaning als niet verzonden beschouwen.",
    "Questions note": "Heeft u vragen? Neem gerust contact met ons op.",
    "Kind regards": "Met vriendelijke groet",
    "Legal basis": "Rechtsgrond",
    "Interest rate": "Vertragingsrente"
  },
  "ru": {
    "Reminder": "Напоминание об оплате",
    "Date": "Дата",
    "Invoice date": "Дата счёта",
    "Overdue since": "Просрочено с",
    "Due date": "Срок оплаты",
    "Your contact": "Контактное лицо",
    "Customer number": "Номер клиента",
    "Greeting": "Здравствуйте, {name}",
    "Reminder intro": "Согласно нашим данным, указанный выше счёт до сих пор не оплачен. Просим произвести оплату в указанный срок.",
    "Description": "Описание",
    "Price in CHF": "Сумма в CHF",
    "Outstanding amount": "Сумма задолженности",
    "reminder to invoice": "к счёту",
    "Reminder fee": "Сбор за напоминание",
    "Default interest": "Пени за просрочку",
    "Total amount due": "Итого к оплате",
    "Reminder crossing note": "Если ваш платёж разминулся с данным письмом, просим не принимать его во внимание.",
    "Questions note": "При возникновении вопросов обращайтесь к нам.",
    "Kind regards": "С уважением",
    "Legal basis": "Правовое основание",
    "Interest rate": "Процент пени"
  }
}
</i18n>
