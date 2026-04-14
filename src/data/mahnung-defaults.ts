/**
 * Country-based defaults for payment reminders (Mahnungen).
 *
 * Legal references:
 * - CH: OR Art. 104 — Verzugszins 5% p.a., no statutory Mahngebühr
 * - DE: BGB §286/§288 — Verzugszins 5% over base rate (~8.12%), §288(5) €40 Pauschale for B2B
 * - NL: WIK (Wet Incassokosten) — scaled fees by amount, statutory commercial interest ~8%
 * - ES: Ley 3/2004, Ley 15/2010 — €40 fixed fee, 8% interest for B2B
 * - AT: UGB §456 — Verzugszins 9.2% over base rate for B2B, no statutory Mahngebühr
 */

export interface MahnungDefaults {
  /** Reminder fee per level [1. Mahnung, 2. Mahnung, 3. Mahnung] */
  mahngebuehr: [number, number, number];
  /** Annual default interest rate as decimal (e.g. 0.05 = 5%) */
  verzugszinsRate: number;
  /** Payment deadline in days from reminder date */
  zahlungsfrist: number;
  /** Currency code */
  currency: string;
  /** Legal reference */
  legalBasis: string;
}

const defaults: Record<string, MahnungDefaults> = {
  // Switzerland
  Schweiz: {
    mahngebuehr: [20, 40, 60],
    verzugszinsRate: 0.05,
    zahlungsfrist: 14,
    currency: 'CHF',
    legalBasis: 'OR Art. 104',
  },
  // Germany
  Deutschland: {
    mahngebuehr: [5, 10, 20],
    verzugszinsRate: 0.05, // + Basiszinssatz (~3.12%), effectively ~8.12%
    zahlungsfrist: 14,
    currency: 'EUR',
    legalBasis: 'BGB §286/§288',
  },
  // Netherlands
  Niederlande: {
    mahngebuehr: [40, 40, 40],
    verzugszinsRate: 0.08,
    zahlungsfrist: 14,
    currency: 'EUR',
    legalBasis: 'WIK (Wet Incassokosten)',
  },
  Nederland: {
    mahngebuehr: [40, 40, 40],
    verzugszinsRate: 0.08,
    zahlungsfrist: 14,
    currency: 'EUR',
    legalBasis: 'WIK (Wet Incassokosten)',
  },
  // Spain
  Spanien: {
    mahngebuehr: [40, 40, 40],
    verzugszinsRate: 0.08,
    zahlungsfrist: 30,
    currency: 'EUR',
    legalBasis: 'Ley 3/2004',
  },
  España: {
    mahngebuehr: [40, 40, 40],
    verzugszinsRate: 0.08,
    zahlungsfrist: 30,
    currency: 'EUR',
    legalBasis: 'Ley 3/2004',
  },
  // Austria
  Österreich: {
    mahngebuehr: [20, 40, 60],
    verzugszinsRate: 0.0912,
    zahlungsfrist: 14,
    currency: 'EUR',
    legalBasis: 'UGB §456',
  },
};

const fallback: MahnungDefaults = defaults.Schweiz;

export function getMahnungDefaults(country: string): MahnungDefaults {
  return defaults[country] ?? fallback;
}

export function calculateVerzugszins(amount: number, rate: number, overdueDays: number): number {
  return Math.round(amount * rate * (overdueDays / 365) * 100) / 100;
}
