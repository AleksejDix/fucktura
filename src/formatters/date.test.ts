import { describe, expect, it } from 'vitest';
import { formatDateLong, formatDateShort } from './date';

const date = new Date('2.4.2022');

describe('date', () => {
  it('formats date with short year', () => {
    expect(formatDateShort(date)).toBe('04.02.22');
  });

  it('format date descriptive with long year', () => {
    expect(formatDateLong(date)).toBe('February 4, 2022');
  });
});
