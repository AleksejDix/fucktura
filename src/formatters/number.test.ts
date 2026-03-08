import { describe, expect, it } from 'vitest';
import { formatDistance, formatNumber } from './number';

describe('number', () => {
  it('formatDistance', () => {
    expect(formatDistance(0)).toBe('0m');
    expect(formatDistance(1)).toBe('1m');
    expect(formatDistance(999)).toBe('999m');
    expect(formatDistance(1337)).toBe('1.3km');
    expect(formatDistance(Number.MAX_SAFE_INTEGER)).toBe('9007tm');
  });

  it('formatNumber', () => {
    expect(formatNumber(-999999999)).toBe('-999’999’999');
    expect(formatNumber(0)).toBe('0');
    expect(formatNumber(999)).toBe('999');
    expect(formatNumber(1337)).toBe('1’337');
    expect(formatNumber(Number.MAX_SAFE_INTEGER)).toBe('9’007’199’254’740’991');
  });
});
