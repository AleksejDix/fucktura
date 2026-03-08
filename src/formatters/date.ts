import { dateFormatter } from './settings';

export function formatDateShort(date: Date): string {
  if (!date) return '';
  const dateFormat = dateFormatter('short');
  return dateFormat.format(date);
}

export function formatDateLong(date: Date): string {
  if (!date) return '';
  const language = document.documentElement.lang || navigator.language;
  const dateFormat = dateFormatter('long', language);

  try {
    return dateFormat.format(date);
  } catch (e) {
    return 'Invalid date';
  }
}
