import { useI18n } from 'vue-i18n';
import { computed } from 'vue';

const localeMap: Record<string, string> = {
  de: 'de-CH',
  en: 'en-GB',
  es: 'es-ES',
  nl: 'nl-NL',
  ru: 'ru-RU',
};

/** Pure date formatting for a given app locale; usable outside component setup. */
export function formatDateForLocale(iso: string | undefined | null, appLocale: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(localeMap[appLocale] ?? 'de-CH', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function useDate() {
  const { locale } = useI18n();

  const dateLocale = computed(() => localeMap[locale.value] ?? 'de-CH');

  function formatDate(iso: string | undefined | null): string {
    return formatDateForLocale(iso, locale.value);
  }

  function toISODate(date: Date): string {
    return date.toISOString();
  }

  return { formatDate, toISODate, dateLocale };
}
