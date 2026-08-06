/**
 * On-read migration for documents written by older versions, which used
 * German type values and field names. Files on disk are upgraded lazily:
 * reading normalizes in memory, and the next save writes the new schema.
 */

const LEGACY_TYPES: Record<string, string> = {
  offerte: 'quote',
  mahnung: 'reminder',
  quittung: 'receipt',
};

const LEGACY_FIELDS: Record<string, string> = {
  stufe: 'reminderLevel',
  offenerBetrag: 'outstandingAmount',
  mahngebuehr: 'reminderFee',
  verzugszins: 'lateInterest',
};

export function normalizeLegacyDocument(v: unknown): unknown {
  if (typeof v !== 'object' || v === null || Array.isArray(v)) return v;
  const doc = { ...(v as Record<string, unknown>) };
  if (typeof doc.type === 'string' && doc.type in LEGACY_TYPES) {
    doc.type = LEGACY_TYPES[doc.type];
  }
  for (const [legacy, current] of Object.entries(LEGACY_FIELDS)) {
    if (legacy in doc) {
      if (!(current in doc)) doc[current] = doc[legacy];
      delete doc[legacy];
    }
  }
  return doc;
}
