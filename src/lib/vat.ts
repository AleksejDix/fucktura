export interface VatRateSet {
  from: string;
  to?: string;
  standard: number;
  reduced?: number;
  superReduced?: number;
  accommodation?: number;
}

const VAT_RATES: Record<string, VatRateSet[]> = {
  CH: [
    { from: '2018-01-01', to: '2023-12-31', standard: 7.7, reduced: 2.5, accommodation: 3.7 },
    { from: '2024-01-01', standard: 8.1, reduced: 2.6, accommodation: 3.8 },
  ],
  DE: [
    { from: '2020-07-01', to: '2020-12-31', standard: 16, reduced: 5 },
    { from: '2021-01-01', standard: 19, reduced: 7 },
  ],
  AT: [
    { from: '2016-01-01', standard: 20, reduced: 10, accommodation: 13 },
  ],
  NL: [
    { from: '2019-01-01', standard: 21, reduced: 9 },
  ],
  ES: [
    { from: '2012-09-01', standard: 21, reduced: 10, superReduced: 4 },
  ],
  IT: [
    { from: '2013-10-01', standard: 22, reduced: 10, superReduced: 4 },
  ],
  FR: [
    { from: '2014-01-01', standard: 20, reduced: 10, superReduced: 5.5 },
  ],
};

const COUNTRY_TO_ISO: Record<string, string> = {
  Schweiz: 'CH', Switzerland: 'CH', Suisse: 'CH', Svizzera: 'CH', Svizra: 'CH',
  Deutschland: 'DE', Germany: 'DE', Allemagne: 'DE',
  Österreich: 'AT', Austria: 'AT',
  Nederland: 'NL', Netherlands: 'NL', 'Pays-Bas': 'NL',
  España: 'ES', Spain: 'ES', Spanien: 'ES', Espagne: 'ES',
  Italia: 'IT', Italy: 'IT', Italien: 'IT', Italie: 'IT',
  France: 'FR', Frankreich: 'FR', Francia: 'FR',
};

export function countryToIso(country: string): string | null {
  if (!country) return null;
  const mapped = COUNTRY_TO_ISO[country.trim()];
  if (mapped) return mapped;
  if (country.length === 2) return country.toUpperCase();
  return null;
}

function isoDate(date: string | Date): string {
  return typeof date === 'string' ? date.slice(0, 10) : date.toISOString().slice(0, 10);
}

export function getVatRateSet(country: string, date: string | Date): VatRateSet | null {
  const iso = countryToIso(country);
  if (!iso) return null;
  const rates = VAT_RATES[iso];
  if (!rates) return null;
  const d = isoDate(date);
  for (const set of rates) {
    if (set.from <= d && (!set.to || d <= set.to)) return set;
  }
  return null;
}

/** Rates valid for a given country on a given date, ordered ascending, always includes 0 (exempt). */
export function availableRates(country: string, date: string | Date): number[] {
  const set = getVatRateSet(country, date);
  const rates = new Set<number>([0]);
  if (set) {
    for (const v of [set.standard, set.reduced, set.accommodation, set.superReduced]) {
      if (typeof v === 'number') rates.add(v);
    }
  }
  return [...rates].sort((a, b) => a - b);
}

export function defaultVatRate(country: string, date: string | Date): number {
  const set = getVatRateSet(country, date);
  return set?.standard ?? 0;
}
