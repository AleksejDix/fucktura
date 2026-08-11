import { formatDateForLocale } from '@/composables/useDate';
import { useMoney } from '@/composables/useMoney';
import type { Document, DocumentType } from '@/fs/types';
import { i18n } from '@/i18n';

/**
 * Outgoing email texts. The letters themselves live in the i18n catalogs
 * (src/i18n/messages/*, "Outgoing emails" section) as single multiline
 * messages; this module computes the interpolation parameters and picks
 * the right message for the document type and locale.
 *
 * Parameters available to the messages:
 *   {name}         recipient display name (person, falling back to company)
 *   {number}       the document's own number
 *   {date}         issue date, formatted for the locale
 *   {dueDate}      payment deadline
 *   {validUntil}   quote validity date
 *   {invoiceRef}   number of the invoice a reminder duns
 *   {invoiceDate}  issue date of the dunned invoice
 *   {overdueSince} original due date of the dunned invoice
 *   {currency}     CHF for Swiss sender IBANs, EUR otherwise
 *   {total}        formatted amount (reminders include fee and interest)
 *   {subjectBlock} localized "Subject: …" line incl. trailing blank line, or empty
 *   {signature}    contact person, company, email
 */

const EMAIL_KEYS: Record<DocumentType, string> = {
  quote: 'Quote email',
  invoice: 'Invoice email',
  reminder: 'Reminder email',
  receipt: 'Receipt email',
};

const { sumLineItems, sumAmounts, formatChf } = useMoney();

export function emailBody(doc: Document, locale: string): string {
  const sender = doc.sender;
  const date = (iso: string | undefined | null) => formatDateForLocale(iso, locale);
  const tr = (key: string, named: Record<string, unknown> = {}) =>
    i18n.global.t(key, named, { locale });
  const total =
    doc.type === 'reminder'
      ? formatChf(
          sumAmounts(doc.outstandingAmount ?? 0, doc.reminderFee ?? 0, doc.lateInterest ?? 0),
        )
      : formatChf(sumLineItems(doc.lineItems ?? []));
  const subjectBlock = doc.subtitle ? `${tr('Email subject label')}: ${doc.subtitle}\n\n` : '';
  return tr(EMAIL_KEYS[doc.type] ?? EMAIL_KEYS.invoice, {
    name: doc.recipient.name || doc.recipient.company,
    number: doc.number,
    date: date(doc.meta.date),
    dueDate: date(doc.meta.dueDate),
    validUntil: date(doc.meta.validUntil),
    invoiceRef: doc.relatedInvoice ?? doc.number,
    invoiceDate: date(doc.meta.invoiceDate) || date(doc.meta.date),
    overdueSince: date(doc.meta.overdueSince),
    currency: sender.accounts?.[0]?.iban?.startsWith('CH') ? 'CHF' : 'EUR',
    total,
    subjectBlock,
    signature: `${sender.contact || sender.company}\n${sender.company}${sender.email ? `\n${sender.email}` : ''}`,
  });
}

/**
 * A reminder's subtitle already reads "1. Mahnung zur Rechnung R-…", so it
 * becomes the subject as-is; other types combine type label and number.
 */
export function emailSubject(doc: Document, typeLabel: string): string {
  if (doc.type === 'reminder' && doc.subtitle) return doc.subtitle;
  return doc.subtitle
    ? `${typeLabel} ${doc.number} – ${doc.subtitle}`
    : `${typeLabel} ${doc.number}`;
}
