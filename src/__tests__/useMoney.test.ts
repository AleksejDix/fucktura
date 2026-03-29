import { describe, it, expect } from 'vitest';
import { useMoney } from '@/composables/useMoney';

describe('useMoney', () => {
  const { chf, lineTotal, sumLineItems, sumAmounts, formatChf, formatChfFromNumber } = useMoney();

  describe('chf', () => {
    it('creates a dinero object from a number', () => {
      const d = chf(100);
      expect(formatChf(d)).toBe('100.00');
    });

    it('handles zero', () => {
      expect(formatChf(chf(0))).toBe('0.00');
    });

    it('handles decimals', () => {
      expect(formatChf(chf(29.50))).toBe('29.50');
    });
  });

  describe('lineTotal', () => {
    it('multiplies quantity by unit price', () => {
      const total = lineTotal(10, 29);
      expect(formatChf(total)).toBe('290.00');
    });

    it('handles fractional quantities', () => {
      const total = lineTotal(67.2, 40);
      expect(formatChf(total)).toBe("2\u2019688.00");
    });

    it('handles zero quantity', () => {
      const total = lineTotal(0, 29);
      expect(formatChf(total)).toBe('0.00');
    });

    it('handles zero price', () => {
      const total = lineTotal(10, 0);
      expect(formatChf(total)).toBe('0.00');
    });
  });

  describe('sumLineItems', () => {
    it('sums multiple line items', () => {
      const items = [
        { quantity: 12, unitPrice: 29 },
        { quantity: 6, unitPrice: 29 },
        { quantity: 117, unitPrice: 29 },
        { quantity: 8, unitPrice: 29 },
      ];
      const total = sumLineItems(items);
      // (12 + 6 + 117 + 8) * 29 = 143 * 29 = 4147
      expect(formatChf(total)).toBe("4\u2019147.00");
    });

    it('returns zero for empty array', () => {
      expect(formatChf(sumLineItems([]))).toBe('0.00');
    });

    it('handles single item', () => {
      const total = sumLineItems([{ quantity: 1, unitPrice: 1200 }]);
      expect(formatChf(total)).toBe("1\u2019200.00");
    });

    it('handles mixed prices and quantities', () => {
      const items = [
        { quantity: 50.5, unitPrice: 40 },
      ];
      const total = sumLineItems(items);
      expect(formatChf(total)).toBe("2\u2019020.00");
    });
  });

  describe('sumAmounts', () => {
    it('sums multiple amounts', () => {
      const total = sumAmounts(4147, 20, 5.50);
      expect(formatChf(total)).toBe("4\u2019172.50");
    });

    it('returns zero for no arguments', () => {
      expect(formatChf(sumAmounts())).toBe('0.00');
    });

    it('handles single amount', () => {
      expect(formatChf(sumAmounts(100))).toBe('100.00');
    });
  });

  describe('formatChf', () => {
    it('formats with thousands separator', () => {
      expect(formatChf(chf(1000))).toBe("1\u2019000.00");
    });

    it('formats large numbers', () => {
      expect(formatChf(chf(1234567.89))).toBe("1\u2019234\u2019567.89");
    });

    it('formats small numbers without separator', () => {
      expect(formatChf(chf(999.99))).toBe('999.99');
    });
  });

  describe('formatChfFromNumber', () => {
    it('formats a plain number as CHF', () => {
      expect(formatChfFromNumber(2688)).toBe("2\u2019688.00");
    });

    it('formats zero', () => {
      expect(formatChfFromNumber(0)).toBe('0.00');
    });
  });
});
