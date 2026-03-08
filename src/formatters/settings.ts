export const distanceFormatter = new Intl.NumberFormat('en', {
  notation: 'compact',
  style: 'unit',
  unit: 'meter',
  unitDisplay: 'narrow',
});

export const priceFormatter = new Intl.NumberFormat('de-CH', {
  style: 'currency',
  currency: 'CHF',
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

export const numberFormatter = new Intl.NumberFormat('de-CH', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

export const dateFormatter = (
  style: 'full' | 'long' | 'medium' | 'short' | undefined = 'long',
  language = 'de-CH',
) =>
  new Intl.DateTimeFormat(language, {
    dateStyle: style,
    timeZone: 'Europe/Zurich',
  });
