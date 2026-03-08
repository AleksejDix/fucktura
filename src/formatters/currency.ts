import { priceFormatter } from './settings';

export function formatPrice(price: number): string {
  if (!price) return '';
  return priceFormatter.format(price);
}
