/**
 * Country-based defaults for payment reminders.
 *
 * Legal references:
 * - CH: OR Art. 104: default interest 5% p.a., no statutory reminder fee
 * - DE: BGB §286/§288: interest 5% over base rate (~8.12%), §288(5) €40 flat fee for B2B
 * - NL: WIK (Wet Incassokosten): scaled fees by amount, statutory commercial interest ~8%
 * - ES: Ley 3/2004, Ley 15/2010: €40 fixed fee, 8% interest for B2B
 * - AT: UGB §456: interest 9.2% over base rate for B2B, no statutory reminder fee
 *
 * Keys match recipient.country as users type it on their documents, so the
 * German-language country names are data, not code vocabulary.
 */

export interface ReminderDefaults {
  /** Reminder fee per escalation level [1st, 2nd, 3rd reminder] */
  fees: [number, number, number];
  /** Annual default interest rate as decimal (e.g. 0.05 = 5%) */
  interestRate: number;
  /** Payment deadline in days from reminder date */
  paymentDays: number;
  /** Currency code */
  currency: string;
  /** Legal reference */
  legalBasis: string;
}

const defaults: Record<string, ReminderDefaults> = {
  // Switzerland
  Schweiz: {
    fees: [20, 40, 60],
    interestRate: 0.05,
    paymentDays: 14,
    currency: 'CHF',
    legalBasis: 'OR Art. 104',
  },
  // Germany
  Deutschland: {
    fees: [5, 10, 20],
    interestRate: 0.05, // + base rate (~3.12%), effectively ~8.12%
    paymentDays: 14,
    currency: 'EUR',
    legalBasis: 'BGB §286/§288',
  },
  // Netherlands
  Niederlande: {
    fees: [40, 40, 40],
    interestRate: 0.08,
    paymentDays: 14,
    currency: 'EUR',
    legalBasis: 'WIK (Wet Incassokosten)',
  },
  Nederland: {
    fees: [40, 40, 40],
    interestRate: 0.08,
    paymentDays: 14,
    currency: 'EUR',
    legalBasis: 'WIK (Wet Incassokosten)',
  },
  // Spain
  Spanien: {
    fees: [40, 40, 40],
    interestRate: 0.08,
    paymentDays: 30,
    currency: 'EUR',
    legalBasis: 'Ley 3/2004',
  },
  España: {
    fees: [40, 40, 40],
    interestRate: 0.08,
    paymentDays: 30,
    currency: 'EUR',
    legalBasis: 'Ley 3/2004',
  },
  // Austria
  Österreich: {
    fees: [20, 40, 60],
    interestRate: 0.0912,
    paymentDays: 14,
    currency: 'EUR',
    legalBasis: 'UGB §456',
  },
};

const fallback: ReminderDefaults = defaults.Schweiz;

export function getReminderDefaults(country: string): ReminderDefaults {
  return defaults[country] ?? fallback;
}

export function calculateLateInterest(amount: number, rate: number, overdueDays: number): number {
  return Math.round(amount * rate * (overdueDays / 365) * 100) / 100;
}
