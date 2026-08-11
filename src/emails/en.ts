import type { EmailTemplates } from './index';

export const en: EmailTemplates = {
  quote: ({ doc, name, currency, total, date, signature }) => `Dear ${name}

Please find attached our quote ${doc.number} dated ${date(doc.meta.date)}.

Quote amount: ${currency} ${total}
Valid until: ${date(doc.meta.validUntil)}

${doc.subtitle ? `Subject: ${doc.subtitle}\n\n` : ''}Please do not hesitate to contact us if you have any questions.

Kind regards
${signature}`,

  invoice: ({ doc, name, currency, total, date, signature }) => `Dear ${name}

Please find attached our invoice ${doc.number} dated ${date(doc.meta.date)}.

Invoice amount: ${currency} ${total}
Due date: ${date(doc.meta.dueDate)}

${doc.subtitle ? `Subject: ${doc.subtitle}\n\n` : ''}Please do not hesitate to contact us if you have any questions.

Kind regards
${signature}`,

  reminder: ({ doc, name, currency, total, date, invoiceRef, invoiceDate, signature }) =>
    `Dear ${name}

May we kindly remind you of the outstanding invoice ${invoiceRef} dated ${invoiceDate}. According to our records we have not yet received payment.

Outstanding amount incl. reminder fee and default interest: ${currency} ${total}
Overdue since: ${date(doc.meta.overdueSince)}
Due date: ${date(doc.meta.dueDate)}

Please find the reminder with all details and payment information attached. We kindly ask you to settle the outstanding amount within the stated deadline. Should your payment have crossed this message, please disregard this reminder.

Kind regards
${signature}`,

  receipt: ({ doc, name, currency, total, date, signature }) => `Dear ${name}

Please find attached our receipt ${doc.number} dated ${date(doc.meta.date)}.

Amount: ${currency} ${total} (already paid)

${doc.subtitle ? `Subject: ${doc.subtitle}\n\n` : ''}Please do not hesitate to contact us if you have any questions.

Kind regards
${signature}`,
};
