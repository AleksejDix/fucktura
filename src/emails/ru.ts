import type { EmailTemplates } from './index';

export const ru: EmailTemplates = {
  quote: ({ doc, name, currency, total, date, signature }) => `Здравствуйте, ${name}

В приложении наше коммерческое предложение ${doc.number} от ${date(doc.meta.date)}.

Сумма предложения: ${currency} ${total}
Действительно до: ${date(doc.meta.validUntil)}

${doc.subtitle ? `Тема: ${doc.subtitle}\n\n` : ''}При возникновении вопросов обращайтесь к нам.

С уважением
${signature}`,

  invoice: ({ doc, name, currency, total, date, signature }) => `Здравствуйте, ${name}

В приложении наш счёт ${doc.number} от ${date(doc.meta.date)}.

Сумма счёта: ${currency} ${total}
Срок оплаты: ${date(doc.meta.dueDate)}

${doc.subtitle ? `Тема: ${doc.subtitle}\n\n` : ''}При возникновении вопросов обращайтесь к нам.

С уважением
${signature}`,

  reminder: ({ doc, name, currency, total, date, invoiceRef, invoiceDate, signature }) =>
    `Здравствуйте, ${name}

Позволим себе напомнить о неоплаченном счёте ${invoiceRef} от ${invoiceDate}. По нашим данным, оплата ещё не поступила.

Сумма задолженности с учётом сбора за напоминание и процентов за просрочку: ${currency} ${total}
Просрочено с: ${date(doc.meta.overdueSince)}
Срок оплаты: ${date(doc.meta.dueDate)}

Напоминание со всеми деталями и платёжной информацией во вложении. Просим произвести оплату в указанный срок. Если ваш платёж уже отправлен и разминулся с этим письмом, просто проигнорируйте это напоминание.

С уважением
${signature}`,

  receipt: ({ doc, name, currency, total, date, signature }) => `Здравствуйте, ${name}

В приложении квитанция ${doc.number} от ${date(doc.meta.date)}.

Сумма: ${currency} ${total} (уже оплачено)

${doc.subtitle ? `Тема: ${doc.subtitle}\n\n` : ''}При возникновении вопросов обращайтесь к нам.

С уважением
${signature}`,
};
