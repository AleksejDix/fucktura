import type { EmailTemplates } from './index';

export const de: EmailTemplates = {
  quote: ({ doc, name, currency, total, date, signature }) => `Guten Tag ${name}

Anbei erhalten Sie unsere Offerte ${doc.number} vom ${date(doc.meta.date)}.

Offertbetrag: ${currency} ${total}
Gültig bis: ${date(doc.meta.validUntil)}

${doc.subtitle ? `Betreff: ${doc.subtitle}\n\n` : ''}Bei Fragen stehen wir Ihnen gerne zur Verfügung.

Freundliche Grüsse
${signature}`,

  invoice: ({ doc, name, currency, total, date, signature }) => `Guten Tag ${name}

Anbei erhalten Sie unsere Rechnung ${doc.number} vom ${date(doc.meta.date)}.

Rechnungsbetrag: ${currency} ${total}
Zahlbar bis: ${date(doc.meta.dueDate)}

${doc.subtitle ? `Betreff: ${doc.subtitle}\n\n` : ''}Bei Fragen stehen wir Ihnen gerne zur Verfügung.

Freundliche Grüsse
${signature}`,

  reminder: ({ doc, name, currency, total, date, invoiceRef, invoiceDate, signature }) =>
    `Guten Tag ${name}

Gerne erlauben wir uns, Sie an die noch offene Rechnung ${invoiceRef} vom ${invoiceDate} zu erinnern. Gemäss unseren Unterlagen ist bisher kein Zahlungseingang erfolgt.

Offener Betrag inkl. Mahngebühr und Verzugszins: ${currency} ${total}
Fällig seit: ${date(doc.meta.overdueSince)}
Zahlbar bis: ${date(doc.meta.dueDate)}

Die Mahnung mit allen Details und Zahlungsinformationen finden Sie im Anhang. Wir bitten Sie, den ausstehenden Betrag innert der genannten Frist zu überweisen. Sollte sich Ihre Zahlung mit dieser Nachricht gekreuzt haben, betrachten Sie diese Erinnerung bitte als gegenstandslos.

Freundliche Grüsse
${signature}`,

  receipt: ({ doc, name, currency, total, date, signature }) => `Guten Tag ${name}

Anbei erhalten Sie die Quittung ${doc.number} vom ${date(doc.meta.date)}.

Betrag: ${currency} ${total} (bereits bezahlt)

${doc.subtitle ? `Betreff: ${doc.subtitle}\n\n` : ''}Bei Fragen stehen wir Ihnen gerne zur Verfügung.

Freundliche Grüsse
${signature}`,
};
