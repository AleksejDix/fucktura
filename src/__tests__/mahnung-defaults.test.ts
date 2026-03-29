import { describe, it, expect } from 'vitest';
import { getMahnungDefaults, calculateVerzugszins } from '@/data/mahnung-defaults';

describe('getMahnungDefaults', () => {
  it('returns Swiss defaults for Schweiz', () => {
    const d = getMahnungDefaults('Schweiz');
    expect(d.currency).toBe('CHF');
    expect(d.verzugszinsRate).toBe(0.05);
    expect(d.zahlungsfrist).toBe(14);
    expect(d.legalBasis).toBe('OR Art. 104');
    expect(d.mahngebuehr).toEqual([20, 40, 60]);
  });

  it('returns German defaults for Deutschland', () => {
    const d = getMahnungDefaults('Deutschland');
    expect(d.currency).toBe('EUR');
    expect(d.legalBasis).toBe('BGB §286/§288');
    expect(d.mahngebuehr).toEqual([5, 10, 20]);
  });

  it('returns Dutch defaults for Niederlande', () => {
    const d = getMahnungDefaults('Niederlande');
    expect(d.currency).toBe('EUR');
    expect(d.verzugszinsRate).toBe(0.08);
    expect(d.legalBasis).toBe('WIK (Wet Incassokosten)');
  });

  it('returns same Dutch defaults for Nederland', () => {
    const nl = getMahnungDefaults('Nederland');
    const nld = getMahnungDefaults('Niederlande');
    expect(nl).toEqual(nld);
  });

  it('returns Spanish defaults for Spanien', () => {
    const d = getMahnungDefaults('Spanien');
    expect(d.zahlungsfrist).toBe(30);
    expect(d.currency).toBe('EUR');
  });

  it('returns same Spanish defaults for España', () => {
    const es = getMahnungDefaults('España');
    const sp = getMahnungDefaults('Spanien');
    expect(es).toEqual(sp);
  });

  it('returns Austrian defaults for Österreich', () => {
    const d = getMahnungDefaults('Österreich');
    expect(d.verzugszinsRate).toBe(0.0912);
    expect(d.legalBasis).toBe('UGB §456');
  });

  it('falls back to Swiss defaults for unknown country', () => {
    const d = getMahnungDefaults('Atlantis');
    expect(d).toEqual(getMahnungDefaults('Schweiz'));
  });

  it('falls back to Swiss defaults for empty string', () => {
    const d = getMahnungDefaults('');
    expect(d).toEqual(getMahnungDefaults('Schweiz'));
  });
});

describe('calculateVerzugszins', () => {
  it('calculates interest for 30 days at 5%', () => {
    // 1000 * 0.05 * (30/365) = 4.109... → 4.11
    const result = calculateVerzugszins(1000, 0.05, 30);
    expect(result).toBe(4.11);
  });

  it('calculates interest for a full year', () => {
    // 10000 * 0.05 * (365/365) = 500
    const result = calculateVerzugszins(10000, 0.05, 365);
    expect(result).toBe(500);
  });

  it('returns 0 for 0 days overdue', () => {
    expect(calculateVerzugszins(1000, 0.05, 0)).toBe(0);
  });

  it('returns 0 for 0 amount', () => {
    expect(calculateVerzugszins(0, 0.05, 30)).toBe(0);
  });

  it('returns 0 for 0 rate', () => {
    expect(calculateVerzugszins(1000, 0, 30)).toBe(0);
  });

  it('handles Austrian rate correctly', () => {
    // 5000 * 0.0912 * (90/365) = 112.438... → 112.44
    const result = calculateVerzugszins(5000, 0.0912, 90);
    expect(result).toBe(112.44);
  });
});
