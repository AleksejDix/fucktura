import { formatDateForLocale } from '@/composables/useDate';
import { useMoney } from '@/composables/useMoney';
import type { Document, DocumentType } from '@/fs/types';
import { de } from './de';
import { en } from './en';
import { es } from './es';
import { nl } from './nl';
import { ru } from './ru';

/**
 * Outgoing email texts, one module per language. Everything derived
 * (recipient name, currency, formatted total, dates, signature) is
 * computed here once so the language files stay pure text.
 */

export interface EmailContext {
  doc: Document;
  /** Recipient display name (person, falling back to company). */
  name: string;
  /** CHF for Swiss sender IBANs, EUR otherwise. */
  currency: string;
  /** Formatted amount for the document type (reminders include fee and interest). */
  total: string;
  /** Formats an ISO date in the email's locale. */
  date: (iso: string | undefined | null) => string;
  /** Number of the invoice a reminder duns (falls back to the document's own number). */
  invoiceRef: string;
  /** Issue date of the dunned invoice, for reminders. */
  invoiceDate: string;
  /** Sender block: contact person, company, email. */
  signature: string;
}

export type EmailTemplates = Record<DocumentType, (ctx: EmailContext) => string>;

const TEMPLATES: Record<string, EmailTemplates> = { de, en, es, nl, ru };

const { sumLineItems, sumAmounts, formatChf } = useMoney();

export function emailBody(doc: Document, locale: string): string {
  const sender = doc.sender;
  const date = (iso: string | undefined | null) => formatDateForLocale(iso, locale);
  const total =
    doc.type === 'reminder'
      ? formatChf(
          sumAmounts(doc.outstandingAmount ?? 0, doc.reminderFee ?? 0, doc.lateInterest ?? 0),
        )
      : formatChf(sumLineItems(doc.lineItems ?? []));
  const ctx: EmailContext = {
    doc,
    name: doc.recipient.name || doc.recipient.company,
    currency: sender.accounts?.[0]?.iban?.startsWith('CH') ? 'CHF' : 'EUR',
    total,
    date,
    invoiceRef: doc.relatedInvoice ?? doc.number,
    invoiceDate: date(doc.meta.invoiceDate) || date(doc.meta.date),
    signature: `${sender.contact || sender.company}\n${sender.company}${sender.email ? `\n${sender.email}` : ''}`,
  };
  const templates = TEMPLATES[locale] ?? TEMPLATES.de;
  const template = templates[doc.type] ?? templates.invoice;
  return template(ctx);
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
