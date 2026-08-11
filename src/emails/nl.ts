import type { EmailTemplates } from './index';

export const nl: EmailTemplates = {
  quote: ({ doc, name, currency, total, date, signature }) => `Geachte ${name}

Hierbij ontvangt u onze offerte ${doc.number} van ${date(doc.meta.date)}.

Offertebedrag: ${currency} ${total}
Geldig tot: ${date(doc.meta.validUntil)}

${doc.subtitle ? `Betreft: ${doc.subtitle}\n\n` : ''}Mocht u vragen hebben, neem dan gerust contact met ons op.

Met vriendelijke groet
${signature}`,

  invoice: ({ doc, name, currency, total, date, signature }) => `Geachte ${name}

Hierbij ontvangt u onze factuur ${doc.number} van ${date(doc.meta.date)}.

Factuurbedrag: ${currency} ${total}
Betaalbaar tot: ${date(doc.meta.dueDate)}

${doc.subtitle ? `Betreft: ${doc.subtitle}\n\n` : ''}Mocht u vragen hebben, neem dan gerust contact met ons op.

Met vriendelijke groet
${signature}`,

  reminder: ({ doc, name, currency, total, date, invoiceRef, invoiceDate, signature }) =>
    `Geachte ${name}

Graag herinneren wij u aan de nog openstaande factuur ${invoiceRef} van ${invoiceDate}. Volgens onze administratie hebben wij nog geen betaling ontvangen.

Openstaand bedrag incl. aanmaningskosten en vertragingsrente: ${currency} ${total}
Vervallen sinds: ${date(doc.meta.overdueSince)}
Betaalbaar tot: ${date(doc.meta.dueDate)}

In de bijlage vindt u de aanmaning met alle details en betalingsinformatie. Wij verzoeken u het openstaande bedrag binnen de genoemde termijn over te maken. Mocht uw betaling deze e-mail hebben gekruist, beschouw deze herinnering dan als niet verzonden.

Met vriendelijke groet
${signature}`,

  receipt: ({ doc, name, currency, total, date, signature }) => `Geachte ${name}

Hierbij ontvangt u onze kwitantie ${doc.number} van ${date(doc.meta.date)}.

Bedrag: ${currency} ${total} (reeds betaald)

${doc.subtitle ? `Betreft: ${doc.subtitle}\n\n` : ''}Mocht u vragen hebben, neem dan gerust contact met ons op.

Met vriendelijke groet
${signature}`,
};
