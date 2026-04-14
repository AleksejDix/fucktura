import { describe, it, expect } from 'vitest';
import { countryToIso, getVatRateSet, availableRates, defaultVatRate } from '@/lib/vat';

describe('countryToIso', () => {
  it('maps localized country names to ISO codes', () => {
    expect(countryToIso('Schweiz')).toBe('CH');
    expect(countryToIso('Switzerland')).toBe('CH');
    expect(countryToIso('Suisse')).toBe('CH');
    expect(countryToIso('Deutschland')).toBe('DE');
    expect(countryToIso('Germany')).toBe('DE');
    expect(countryToIso('Nederland')).toBe('NL');
    expect(countryToIso('España')).toBe('ES');
  });

  it('accepts 2-letter ISO codes directly', () => {
    expect(countryToIso('CH')).toBe('CH');
    expect(countryToIso('de')).toBe('DE');
  });

  it('trims whitespace', () => {
    expect(countryToIso(' Schweiz ')).toBe('CH');
  });

  it('returns null for unknown countries', () => {
    expect(countryToIso('Wakanda')).toBeNull();
    expect(countryToIso('')).toBeNull();
  });
});

describe('getVatRateSet', () => {
  it('returns CH rates for dates before 2024-01-01 (7.7% era)', () => {
    const set = getVatRateSet('Schweiz', '2023-12-31');
    expect(set?.standard).toBe(7.7);
    expect(set?.reduced).toBe(2.5);
    expect(set?.accommodation).toBe(3.7);
  });

  it('returns CH rates for 2024 and later (8.1% era)', () => {
    const set = getVatRateSet('Schweiz', '2024-01-01');
    expect(set?.standard).toBe(8.1);
    expect(set?.reduced).toBe(2.6);
    expect(set?.accommodation).toBe(3.8);
  });

  it('picks the DE COVID temporary rates (2020-07-01 to 2020-12-31)', () => {
    const set = getVatRateSet('Deutschland', '2020-09-15');
    expect(set?.standard).toBe(16);
    expect(set?.reduced).toBe(5);
  });

  it('picks the DE standard rate after 2021-01-01', () => {
    const set = getVatRateSet('Deutschland', '2021-01-01');
    expect(set?.standard).toBe(19);
    expect(set?.reduced).toBe(7);
  });

  it('returns null for unknown country', () => {
    expect(getVatRateSet('Wakanda', '2024-01-01')).toBeNull();
  });

  it('returns null for date before any defined range', () => {
    expect(getVatRateSet('Deutschland', '1999-01-01')).toBeNull();
  });

  it('accepts Date object', () => {
    const set = getVatRateSet('Schweiz', new Date('2024-06-15'));
    expect(set?.standard).toBe(8.1);
  });

  it('accepts ISO timestamp string', () => {
    const set = getVatRateSet('Schweiz', '2024-06-15T12:34:56.000Z');
    expect(set?.standard).toBe(8.1);
  });
});

describe('availableRates', () => {
  it('returns all CH rates in ascending order, always including 0', () => {
    const rates = availableRates('Schweiz', '2024-06-01');
    expect(rates).toEqual([0, 2.6, 3.8, 8.1]);
  });

  it('returns DE rates including 0', () => {
    const rates = availableRates('Deutschland', '2024-06-01');
    expect(rates).toEqual([0, 7, 19]);
  });

  it('returns ES rates including superReduced', () => {
    const rates = availableRates('España', '2024-06-01');
    expect(rates).toEqual([0, 4, 10, 21]);
  });

  it('returns just [0] for unknown country', () => {
    expect(availableRates('Wakanda', '2024-06-01')).toEqual([0]);
  });

  it('deduplicates overlapping rates', () => {
    const rates = availableRates('Schweiz', '2024-06-01');
    expect(new Set(rates).size).toBe(rates.length);
  });
});

describe('defaultVatRate', () => {
  it('returns the standard rate for a country', () => {
    expect(defaultVatRate('Schweiz', '2024-01-01')).toBe(8.1);
    expect(defaultVatRate('Schweiz', '2023-12-31')).toBe(7.7);
    expect(defaultVatRate('Deutschland', '2024-01-01')).toBe(19);
  });

  it('returns 0 for unknown country', () => {
    expect(defaultVatRate('Wakanda', '2024-06-01')).toBe(0);
  });
});
