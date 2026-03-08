import { describe, expect, it } from 'vitest';
import { formatPrice } from './currency';

describe('currency', () => {
  it('formats price to Swiss standard', () => {
    expect(formatPrice(0).replace(/\u00a0/g, ' ')).toBe('');
    expect(formatPrice(100).replace(/\u00a0/g, ' ')).toBe('CHF 100');
    expect(formatPrice(1000).replace(/\u00a0/g, ' ')).toBe('CHF 1’000');
    expect(formatPrice(10000).replace(/\u00a0/g, ' ')).toBe('CHF 10’000');
    expect(formatPrice(1000000).replace(/\u00a0/g, ' ')).toBe('CHF 1’000’000');
    expect(formatPrice(1000.93).replace(/\u00a0/g, ' ')).toBe('CHF 1’000.93');
    expect(formatPrice(1000.95445).replace(/\u00a0/g, ' ')).toBe('CHF 1’000.95');
    expect(formatPrice(-1000.95445).replace(/\u00a0/g, ' ')).toBe('CHF-1’000.95');
  });
});
