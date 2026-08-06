import { describe, expect, it } from 'vitest';
import { normalizeLegacyDocument } from '@/fs/normalize';
import { isDocument } from '@/fs/validate';

const legacyReminder = {
  number: 'M-1700000000',
  type: 'mahnung',
  status: 'draft',
  subtitle: '1. Mahnung zur Rechnung R-1700000000',
  customerNumber: '0001',
  sender: {},
  recipient: {},
  meta: {},
  stufe: 1,
  offenerBetrag: 960,
  mahngebuehr: 20,
  verzugszins: 0,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};

describe('normalizeLegacyDocument', () => {
  it('maps legacy German type values to English ones', () => {
    for (const [legacy, current] of [
      ['offerte', 'quote'],
      ['mahnung', 'reminder'],
      ['quittung', 'receipt'],
      ['invoice', 'invoice'],
    ]) {
      const out = normalizeLegacyDocument({ type: legacy }) as { type: string };
      expect(out.type).toBe(current);
    }
  });

  it('renames legacy German reminder fields', () => {
    const out = normalizeLegacyDocument(legacyReminder) as Record<string, unknown>;
    expect(out.reminderLevel).toBe(1);
    expect(out.outstandingAmount).toBe(960);
    expect(out.reminderFee).toBe(20);
    expect(out.lateInterest).toBe(0);
    expect(out).not.toHaveProperty('stufe');
    expect(out).not.toHaveProperty('offenerBetrag');
    expect(out).not.toHaveProperty('mahngebuehr');
    expect(out).not.toHaveProperty('verzugszins');
  });

  it('produces a document that passes validation', () => {
    expect(isDocument(normalizeLegacyDocument(legacyReminder))).toBe(true);
  });

  it('prefers an already-migrated field over its legacy twin', () => {
    const out = normalizeLegacyDocument({ stufe: 1, reminderLevel: 2 }) as Record<string, unknown>;
    expect(out.reminderLevel).toBe(2);
    expect(out).not.toHaveProperty('stufe');
  });

  it('leaves current-schema documents untouched', () => {
    const doc = { ...legacyReminder, type: 'reminder' } as Record<string, unknown>;
    delete doc.stufe;
    delete doc.offenerBetrag;
    delete doc.mahngebuehr;
    delete doc.verzugszins;
    doc.reminderLevel = 1;
    expect(normalizeLegacyDocument(doc)).toEqual(doc);
  });

  it('passes through non-object values', () => {
    expect(normalizeLegacyDocument(null)).toBe(null);
    expect(normalizeLegacyDocument('x')).toBe('x');
  });
});
