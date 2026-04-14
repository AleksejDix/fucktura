import { describe, it, expect } from 'vitest';
import { useMoney } from '@/composables/useMoney';

describe('useMoney', () => {
  const { chf, lineTotal, sumLineItems, sumAmounts, formatChf, formatChfFromNumber, lineNet, lineVat, groupByVat, sumGross } = useMoney();

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

  describe('lineNet', () => {
    it('returns qty * price', () => {
      expect(lineNet(10, 29)).toBe(290);
    });

    it('rounds to 2 decimals', () => {
      expect(lineNet(3, 19.999)).toBe(60);
    });

    it('handles zero', () => {
      expect(lineNet(0, 100)).toBe(0);
      expect(lineNet(5, 0)).toBe(0);
    });
  });

  describe('lineVat', () => {
    it('applies VAT at given rate', () => {
      expect(lineVat(1, 1000, 8.1)).toBe(81);
      expect(lineVat(1, 1000, 19)).toBe(190);
      expect(lineVat(1, 1000, 0)).toBe(0);
    });

    it('rounds to cents', () => {
      expect(lineVat(1, 100, 2.6)).toBe(2.6);
    });
  });

  describe('groupByVat', () => {
    it('groups lines by rate', () => {
      const groups = groupByVat([
        { quantity: 1, unitPrice: 1000, vatRate: 8.1 },
        { quantity: 2, unitPrice: 500, vatRate: 8.1 },
        { quantity: 1, unitPrice: 200, vatRate: 2.6 },
      ]);
      expect(groups).toHaveLength(2);
      const standard = groups.find((g) => g.rate === 8.1)!;
      expect(standard.net).toBe(2000);
      expect(standard.vat).toBe(162);
      expect(standard.gross).toBe(2162);
      const reduced = groups.find((g) => g.rate === 2.6)!;
      expect(reduced.net).toBe(200);
      expect(reduced.vat).toBe(5.2);
      expect(reduced.gross).toBe(205.2);
    });

    it('orders groups by rate ascending', () => {
      const groups = groupByVat([
        { quantity: 1, unitPrice: 100, vatRate: 19 },
        { quantity: 1, unitPrice: 100, vatRate: 7 },
        { quantity: 1, unitPrice: 100, vatRate: 0 },
      ]);
      expect(groups.map((g) => g.rate)).toEqual([0, 7, 19]);
    });

    it('treats missing vatRate as 0', () => {
      const groups = groupByVat([{ quantity: 1, unitPrice: 100 }]);
      expect(groups).toHaveLength(1);
      expect(groups[0].rate).toBe(0);
      expect(groups[0].vat).toBe(0);
      expect(groups[0].gross).toBe(100);
    });

    it('returns empty array when no items', () => {
      expect(groupByVat([])).toEqual([]);
    });
  });

  describe('sumGross', () => {
    it('returns net + vat across all rates', () => {
      const total = sumGross([
        { quantity: 1, unitPrice: 1000, vatRate: 8.1 },
        { quantity: 1, unitPrice: 500, vatRate: 2.6 },
      ]);
      // 1000 * 1.081 + 500 * 1.026 = 1081 + 513 = 1594
      expect(total).toBe(1594);
    });

    it('equals net when no VAT', () => {
      expect(sumGross([{ quantity: 5, unitPrice: 100 }])).toBe(500);
    });

    it('returns 0 for empty', () => {
      expect(sumGross([])).toBe(0);
    });
  });
});
