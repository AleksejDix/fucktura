import { createI18n } from 'vue-i18n';
import de from './messages/de';
import en from './messages/en';
import fr from './messages/fr';
import it from './messages/it';

export const i18n = createI18n({
  legacy: false,
  locale: 'en',
  fallbackLocale: 'en',
  missingWarn: false,
  fallbackWarn: false,
  messages: { en, de, fr, it },
});
