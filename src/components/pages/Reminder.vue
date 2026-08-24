<template>
  <PageTemplate :page-index="pageIndex">
    <template #header>
      <header
        class="absolute top-0 left-0 right-0 pt-[10mm] pl-[var(--norm-ml)] pr-[var(--norm-mr)] max-h-[var(--norm-header-h)]"
      >
        <div class="flex justify-end">
          <div class="text-[9pt] text-right leading-relaxed">
            <div class="font-bold">{{ sender.company }}</div>
            <div>{{ sender.street }}</div>
            <div>
              <span class="font-mono">{{ sender.zip }}</span> {{ sender.city }},
              {{ sender.country }}
            </div>
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
          <DClientPicker
            :doc-number="doc.number"
            :has-client="!!recipient.company || !!recipient.name"
          />
          <address
            v-if="recipient.company || recipient.name"
            class="not-italic text-[9pt] leading-relaxed"
          >
            <DInline
              v-model="recipient.company"
              tag="div"
              @update:model-value="(v) => update({ 'recipient.company': v })"
            />
            <DInline
              v-model="recipient.name"
              tag="div"
              @update:model-value="(v) => update({ 'recipient.name': v })"
            />
            <DInline
              v-model="recipient.street"
              tag="div"
              @update:model-value="(v) => update({ 'recipient.street': v })"
            />
            <div>
              <DInline
                v-model="recipient.zip"
                tag="span"
                class="font-mono"
                @update:model-value="(v) => update({ 'recipient.zip': v })"
              />
              {{ ' ' }}
              <DInline
                v-model="recipient.city"
                tag="span"
                @update:model-value="(v) => update({ 'recipient.city': v })"
              />
            </div>
            <DInline
              v-if="recipient.country"
              v-model="recipient.country"
              tag="div"
              @update:model-value="(v) => update({ 'recipient.country': v })"
            />
            <DInline
              v-if="recipient.uid"
              v-model="recipient.uid"
              tag="div"
              class="text-gray-500 font-mono"
              @update:model-value="(v) => update({ 'recipient.uid': v })"
            />
          </address>
        </div>
      </div>

      <div class="pt-[12mm]">
        <div class="flex justify-between items-baseline">
          <h2 class="text-[14pt] font-bold">
            <DInline
              :model-value="String(currentLevel)"
              tag="span"
              @update:model-value="(v) => updateLevel(v)"
            />. {{ t('Reminder') }}
          </h2>
          <span class="text-[14pt] font-bold">{{ doc.number }}</span>
        </div>
        <DInline
          v-model="doc.subtitle"
          tag="p"
          class="font-bold text-[9pt]"
          @update:model-value="(v) => update({ subtitle: v })"
        />
      </div>

      <div class="mt-3 print:hidden">
        <DInvoicePicker :doc-number="doc.number" :has-invoice="!!relatedInvoiceNumber" />
        <div v-if="relatedInvoiceNumber" class="flex items-center gap-2 text-[9pt]">
          <span class="text-gray-600">{{ t('reminder to invoice') }}</span>
          <span class="font-mono font-medium">{{ relatedInvoiceNumber }}</span>
          <span
            class="px-2 py-0.5 rounded-sm text-[8pt] font-medium"
            :class="isResolved ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'"
            >{{ isResolved ? t('settled') : t('Open') }}</span
          >
          <button
            v-if="!isResolved"
            type="button"
            @click="markInvoicePaid"
            class="text-[8pt] underline text-gray-500 hover:text-gray-900"
          >
            {{ t('Mark invoice paid') }}
          </button>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-x-8 text-[9pt] border-y border-gray-300 py-2 mt-3">
        <div class="flex justify-between">
          <span class="text-gray-600">{{ t('Date') }}:</span>
          <DDate :value="meta.date" @update="(v) => update({ meta: { date: v } })" />
        </div>
        <div class="flex justify-between">
          <span class="text-gray-600">{{ t('Invoice date') }}:</span>
          <DDate :value="meta.invoiceDate" @update="(v) => update({ meta: { invoiceDate: v } })" />
        </div>
        <div class="flex justify-between">
          <span class="text-gray-600">{{ t('Overdue since') }}:</span>
          <DDate
            :value="meta.overdueSince"
            @update="(v) => update({ meta: { overdueSince: v } })"
          />
        </div>
        <div class="flex justify-between">
          <span class="text-gray-600">{{ t('Customer number') }}:</span>
          <DInline
            v-model="meta.customerNumber"
            tag="span"
            class="font-mono"
            @update:model-value="(v) => update({ meta: { customerNumber: v } })"
          />
        </div>
        <div class="flex justify-between">
          <span class="text-gray-600">{{ t('Due date') }}:</span>
          <DDate :value="meta.dueDate" @update="(v) => update({ meta: { dueDate: v } })" />
        </div>
        <div class="flex justify-between">
          <span class="text-gray-600">{{ t('Your contact') }}:</span>
          <DInline
            v-model="meta.contactPerson"
            tag="span"
            @update:model-value="(v) => update({ meta: { contactPerson: v } })"
          />
        </div>
      </div>

      <div class="text-[9pt] leading-relaxed mt-3">
        <p>{{ t('Greeting', { name: recipient.name }) }}</p>
        <p class="mt-2">{{ bodyText }}</p>
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
            <td class="py-1.5">
              {{ t('Outstanding amount') }} ({{ t('reminder to invoice') }}
              <span class="font-mono">{{ relatedInvoiceNumber || doc.number }}</span
              >)
            </td>
            <td class="py-1.5 text-right font-mono">
              <DInline
                :model-value="formatAmount(outstandingAmount)"
                tag="span"
                @update:model-value="(v) => update({ outstandingAmount: parseFloat(v) || 0 })"
              />
            </td>
          </tr>
          <tr class="border-b border-gray-200">
            <td class="py-1.5">{{ t('Reminder fee') }}</td>
            <td class="py-1.5 text-right font-mono">
              <DInline
                :model-value="formatAmount(reminderFee)"
                tag="span"
                @update:model-value="(v) => update({ reminderFee: parseFloat(v) || 0 })"
              />
            </td>
          </tr>
          <tr class="border-b border-gray-200">
            <td class="py-1.5">{{ t('Default interest') }}</td>
            <td class="py-1.5 text-right font-mono">
              <DInline
                :model-value="formatAmount(lateInterest)"
                tag="span"
                @update:model-value="(v) => update({ lateInterest: parseFloat(v) || 0 })"
              />
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

      <p class="text-[7pt] text-gray-400 mt-6">
        {{ t('Legal basis') }}: {{ countryDefaults.legalBasis }} · {{ t('Interest rate') }}:
        {{ (countryDefaults.interestRate * 100).toFixed(1) }}% p.a.
      </p>
    </section>
  </PageTemplate>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import type { Document, DocumentPatch, Sender } from '@/fs/types';
import { useDocumentsStore } from '@/stores/documents';
import { addDays } from '@/stores/documents/factories';
import { useMoney } from '@/composables/useMoney';
import { useDate } from '@/composables/useDate';
import { getReminderDefaults } from '@/data/reminder-defaults';
import PageTemplate from '../PageTemplate.vue';
import DClientPicker from '../DClientPicker.vue';
import DInvoicePicker from '../DInvoicePicker.vue';
import DInline from '../DInline.vue';
import DDate from '../DDate.vue';

const { t } = useI18n({ useScope: 'local' });
const store = useDocumentsStore();
const { sumAmounts, formatChf } = useMoney();
const { formatDate } = useDate();

const props = defineProps<{
  pageIndex?: number;
  doc: Document;
  sender: Sender;
}>();

const recipient = computed(() => props.doc.recipient);
const meta = computed(() => props.doc.meta);
const relatedInvoiceNumber = computed(() => props.doc.relatedInvoice ?? '');
const isResolved = computed(() => store.isReminderResolved(props.doc));
const currentLevel = computed(() => props.doc.reminderLevel ?? 1);
const outstandingAmount = computed(() => props.doc.outstandingAmount ?? 0);
const reminderFee = computed(() => props.doc.reminderFee ?? 0);
const lateInterest = computed(() => props.doc.lateInterest ?? 0);
const countryDefaults = computed(() => getReminderDefaults(recipient.value.country || 'Schweiz'));

const total = computed(() =>
  sumAmounts(outstandingAmount.value, reminderFee.value, lateInterest.value),
);

/**
 * Letter body: the wording escalates with the reminder level — the 2nd
 * and 3rd levels announce debt collection
 * (Betreibung) and carry the shorter payment deadline.
 */
const bodyText = computed(() => {
  const key =
    currentLevel.value >= 3
      ? 'Reminder intro 3'
      : currentLevel.value === 2
        ? 'Reminder intro 2'
        : 'Reminder intro';
  return t(key, {
    days: countryDefaults.value.paymentDays[currentLevel.value - 1] ?? 14,
    dueDate: formatDate(meta.value.dueDate),
  });
});

function update(changes: DocumentPatch) {
  if (!props.doc.number) return;
  store.updateDocument(props.doc.number, changes);
}

function markInvoicePaid() {
  if (relatedInvoiceNumber.value) store.setStatus(relatedInvoiceNumber.value, 'paid');
}

function updateLevel(value: string) {
  const reminderLevel = Math.max(1, Math.min(3, parseInt(value) || 1));
  const md = countryDefaults.value;
  const fee = md.fees[reminderLevel - 1] ?? 0;
  const days = md.paymentDays[reminderLevel - 1] ?? 14;
  const base = meta.value.date ? new Date(meta.value.date) : new Date();
  update({ reminderLevel, reminderFee: fee, meta: { dueDate: addDays(base, days) } });
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
    "Reminder intro 2": "Trotz unserer ersten Mahnung haben wir bis heute keinen Zahlungseingang feststellen können. Wir bitten Sie, den offenen Betrag innerhalb von {days} Tagen, spätestens bis zum {dueDate}, zu begleichen. Sollte die Zahlung nicht innerhalb dieser Frist bei uns eintreffen, werden wir ohne weitere Ankündigung die Betreibung einleiten.",
    "Reminder intro 3": "Trotz zweimaliger Mahnung ist der offene Betrag bis heute nicht beglichen. Dies ist unsere letzte Mahnung: Sollte die Zahlung nicht innerhalb von {days} Tagen, spätestens bis zum {dueDate}, bei uns eintreffen, leiten wir ohne weitere Ankündigung die Betreibung ein.",
    "Description": "Beschreibung",
    "Price in CHF": "Betrag in CHF",
    "Outstanding amount": "Offener Rechnungsbetrag",
    "reminder to invoice": "zur Rechnung",
    "Open": "Offen",
    "settled": "Erledigt",
    "Mark invoice paid": "Rechnung als bezahlt markieren",
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
    "Reminder intro 2": "Despite our first reminder, we have not yet received your payment. Please settle the outstanding amount within {days} days, by {dueDate} at the latest. Should payment not reach us within this period, we will initiate debt collection proceedings without further notice.",
    "Reminder intro 3": "Despite two reminders, the outstanding amount remains unpaid. This is our final reminder: should payment not reach us within {days} days, by {dueDate} at the latest, we will initiate debt collection proceedings without further notice.",
    "Description": "Description",
    "Price in CHF": "Amount in CHF",
    "Outstanding amount": "Outstanding amount",
    "reminder to invoice": "to invoice",
    "Open": "Open",
    "settled": "Settled",
    "Mark invoice paid": "Mark invoice as paid",
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
    "Reminder intro 2": "A pesar de nuestro primer recordatorio, hasta la fecha no hemos recibido su pago. Le rogamos que abone el importe pendiente en un plazo de {days} días, a más tardar el {dueDate}. Si el pago no nos llega dentro de este plazo, iniciaremos el procedimiento de cobro por vía ejecutiva sin previo aviso.",
    "Reminder intro 3": "A pesar de dos recordatorios, el importe pendiente sigue sin abonarse. Este es nuestro último recordatorio: si el pago no nos llega en un plazo de {days} días, a más tardar el {dueDate}, iniciaremos el procedimiento de cobro por vía ejecutiva sin previo aviso.",
    "Description": "Descripción",
    "Price in CHF": "Importe en CHF",
    "Outstanding amount": "Importe pendiente de la factura",
    "reminder to invoice": "a la factura",
    "Open": "Pendiente",
    "settled": "Saldado",
    "Mark invoice paid": "Marcar factura como pagada",
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
    "Reminder intro 2": "Ondanks onze eerste aanmaning hebben wij tot op heden geen betaling ontvangen. Wij verzoeken u het openstaande bedrag binnen {days} dagen, uiterlijk op {dueDate}, te voldoen. Indien de betaling niet binnen deze termijn bij ons binnenkomt, starten wij zonder nadere aankondiging een incassoprocedure.",
    "Reminder intro 3": "Ondanks twee aanmaningen is het openstaande bedrag tot op heden niet voldaan. Dit is onze laatste aanmaning: indien de betaling niet binnen {days} dagen, uiterlijk op {dueDate}, bij ons binnenkomt, starten wij zonder nadere aankondiging een incassoprocedure.",
    "Description": "Omschrijving",
    "Price in CHF": "Bedrag in CHF",
    "Outstanding amount": "Openstaand factuurbedrag",
    "reminder to invoice": "bij factuur",
    "Open": "Openstaand",
    "settled": "Afgehandeld",
    "Mark invoice paid": "Factuur als betaald markeren",
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
    "Reminder intro 2": "Несмотря на наше первое напоминание, оплата до настоящего времени не поступила. Просим погасить задолженность в течение {days} дней, не позднее {dueDate}. Если оплата не поступит в указанный срок, мы без дополнительного уведомления начнём процедуру принудительного взыскания.",
    "Reminder intro 3": "Несмотря на два напоминания, задолженность до настоящего времени не погашена. Это последнее напоминание: если оплата не поступит в течение {days} дней, не позднее {dueDate}, мы без дополнительного уведомления начнём процедуру принудительного взыскания.",
    "Description": "Описание",
    "Price in CHF": "Сумма в CHF",
    "Outstanding amount": "Сумма задолженности",
    "reminder to invoice": "к счёту",
    "Open": "Открыто",
    "settled": "Погашено",
    "Mark invoice paid": "Отметить счёт оплаченным",
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
