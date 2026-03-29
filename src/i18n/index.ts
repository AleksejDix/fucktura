import { createI18n } from 'vue-i18n';
import de from './messages/de';
import en from './messages/en';
import es from './messages/es';
import fr from './messages/fr';
import it from './messages/it';
import nl from './messages/nl';
import ru from './messages/ru';

export const i18n = createI18n({
  legacy: false,
  locale: 'en',
  fallbackLocale: 'en',
  missingWarn: false,
  fallbackWarn: false,
  messages: { en, de, es, fr, it, nl, ru },
});
