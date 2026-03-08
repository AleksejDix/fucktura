import { i18n } from '@/i18n';

export function setupLanguage(lang = 'de') {
  const root = document.documentElement;
  root.setAttribute('lang', lang);
  i18n.global.locale.value = lang;
}
