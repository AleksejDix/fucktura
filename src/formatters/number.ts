import { isNumberWithZero } from '../validators/isNumberWithZero';
import { distanceFormatter, numberFormatter } from './settings';

export function formatDistance(value?: number): string {
  if (!isNumberWithZero(value) || value === null || value === undefined) return '';
  return distanceFormatter.format(value).toLowerCase();
}

export function formatNumber(value: number): string {
  if (!isNumberWithZero(value)) return '';
  return numberFormatter.format(value);
}
