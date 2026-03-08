import { useI18n } from 'vue-i18n';

export function useI18N() {
  const { t, locale } = useI18n();

  function translate(msg: string) {
    if (!msg) return '';
    return t(msg);
  }

  function setLanguage(lang: string) {
    locale.value = lang;
  }

  return {
    translate,
    setLanguage,
  };
}
