import type { EmailTemplates } from './index';

export const es: EmailTemplates = {
  quote: ({ doc, name, currency, total, date, signature }) => `Estimado/a ${name}

Adjunto le enviamos nuestro presupuesto ${doc.number} del ${date(doc.meta.date)}.

Importe: ${currency} ${total}
Válido hasta: ${date(doc.meta.validUntil)}

${doc.subtitle ? `Asunto: ${doc.subtitle}\n\n` : ''}Quedamos a su disposición para cualquier consulta.

Atentamente
${signature}`,

  invoice: ({ doc, name, currency, total, date, signature }) => `Estimado/a ${name}

Adjunto le enviamos nuestra factura ${doc.number} del ${date(doc.meta.date)}.

Importe: ${currency} ${total}
Fecha de vencimiento: ${date(doc.meta.dueDate)}

${doc.subtitle ? `Asunto: ${doc.subtitle}\n\n` : ''}Quedamos a su disposición para cualquier consulta.

Atentamente
${signature}`,

  reminder: ({ doc, name, currency, total, date, invoiceRef, invoiceDate, signature }) =>
    `Estimado/a ${name}

Nos permitimos recordarle la factura pendiente ${invoiceRef} del ${invoiceDate}. Según nuestros registros, aún no hemos recibido el pago.

Importe pendiente incl. gastos de recordatorio e intereses de demora: ${currency} ${total}
Vencido desde: ${date(doc.meta.overdueSince)}
Fecha límite de pago: ${date(doc.meta.dueDate)}

Adjunto encontrará el recordatorio con todos los detalles y la información de pago. Le rogamos que abone el importe pendiente dentro del plazo indicado. Si su pago se ha cruzado con este mensaje, ignore este recordatorio.

Atentamente
${signature}`,

  receipt: ({ doc, name, currency, total, date, signature }) => `Estimado/a ${name}

Adjunto le enviamos el recibo ${doc.number} del ${date(doc.meta.date)}.

Importe: ${currency} ${total} (ya pagado)

${doc.subtitle ? `Asunto: ${doc.subtitle}\n\n` : ''}Quedamos a su disposición para cualquier consulta.

Atentamente
${signature}`,
};
