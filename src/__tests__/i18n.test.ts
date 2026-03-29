import { describe, it, expect } from 'vitest';
import en from '@/i18n/messages/en';
import de from '@/i18n/messages/de';
import es from '@/i18n/messages/es';
import nl from '@/i18n/messages/nl';
import ru from '@/i18n/messages/ru';

const enKeys = Object.keys(en).sort();

describe('i18n completeness', () => {
  const languages: Record<string, Record<string, string>> = { de, es, nl, ru };

  for (const [lang, messages] of Object.entries(languages)) {
    it(`${lang} has all keys from en`, () => {
      const langKeys = Object.keys(messages).sort();
      const missing = enKeys.filter(k => !langKeys.includes(k));
      expect(missing, `${lang} is missing keys: ${missing.join(', ')}`).toEqual([]);
    });

    it(`${lang} has no extra keys beyond en`, () => {
      const langKeys = Object.keys(messages);
      const extra = langKeys.filter(k => !enKeys.includes(k));
      expect(extra, `${lang} has extra keys: ${extra.join(', ')}`).toEqual([]);
    });

    it(`${lang} has no empty values`, () => {
      const empty = Object.entries(messages).filter(([, v]) => v.trim() === '').map(([k]) => k);
      expect(empty, `${lang} has empty values: ${empty.join(', ')}`).toEqual([]);
    });
  }
});

describe('i18n value sanity', () => {
  it('en Loading contains ...', () => {
    expect(en.Loading).toContain('...');
  });

  it('status keys exist in all languages', () => {
    const statusKeys = ['draft', 'sent', 'paid', 'accepted', 'rejected'];
    const allLangs = { en, de, es, nl, ru };

    for (const key of statusKeys) {
      for (const [lang, msgs] of Object.entries(allLangs)) {
        expect(msgs, `${lang} missing status key '${key}'`).toHaveProperty(key);
      }
    }
  });
});
