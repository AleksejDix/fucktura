import { describe, expect, it } from 'vitest';
import { numberFormatter } from './chart';

describe('chart', () => {
  it('formats chart label value', () => {
    expect(numberFormatter(0)).toBe('0');
    expect(numberFormatter(1)).toBe('1');
    expect(numberFormatter(-1)).toBe('-1');
    expect(numberFormatter(1.5)).toBe('1.5');
    expect(numberFormatter(1.77)).toBe('1.8');
    expect(numberFormatter(1000)).toBe('1K');
    expect(numberFormatter(10000)).toBe('10K');
    expect(numberFormatter(100000)).toBe('100K');
    expect(numberFormatter(1000000)).toBe('1M');
    expect(numberFormatter(-1000000)).toBe('-1M');
  });
});
