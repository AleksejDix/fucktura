import { dinero, add, multiply, toDecimal } from 'dinero.js';
import { CHF } from 'dinero.js';

interface VatLine {
  quantity: number;
  unitPrice: number;
  vatRate?: number;
}

export function useMoney() {
  function chf(amount: number) {
    const cents = Math.round(amount * 100);
    return dinero({ amount: cents, currency: CHF });
  }

  function lineTotal(quantity: number, unitPrice: number) {
    const price = chf(unitPrice);
    const qtyScale = Math.round(quantity * 100);
    return multiply(price, { amount: qtyScale, scale: 2 });
  }

  function sumLineItems(items: { quantity: number; unitPrice: number }[]) {
    return items.reduce((sum, item) => add(sum, lineTotal(item.quantity, item.unitPrice)), chf(0));
  }

  function sumAmounts(...amounts: number[]) {
    return amounts.reduce((sum, n) => add(sum, chf(n)), chf(0));
  }

  function formatChf(d: ReturnType<typeof chf>): string {
    return toDecimal(d, ({ value }) => {
      const parts = value.split('.');
      const intPart = parts[0];
      const decPart = (parts[1] ?? '00').padEnd(2, '0').slice(0, 2);
      const formatted = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, '\u2019');
      return `${formatted}.${decPart}`;
    });
  }

  function formatChfFromNumber(n: number): string {
    return formatChf(chf(n));
  }

  /** Per-line net amount (quantity × unitPrice) as a plain number. */
  function lineNet(quantity: number, unitPrice: number): number {
    return Math.round(quantity * unitPrice * 100) / 100;
  }

  /** VAT amount for a single line. */
  function lineVat(quantity: number, unitPrice: number, vatRate: number): number {
    return Math.round(lineNet(quantity, unitPrice) * vatRate) / 100;
  }

  /** Group lines by VAT rate; for each rate return {net, vat, gross}. */
  function groupByVat(
    items: VatLine[],
  ): Array<{ rate: number; net: number; vat: number; gross: number }> {
    const byRate = new Map<number, { net: number; vat: number }>();
    for (const item of items) {
      const rate = item.vatRate ?? 0;
      const net = lineNet(item.quantity, item.unitPrice);
      const vat = rate > 0 ? Math.round(net * rate) / 100 : 0;
      const prev = byRate.get(rate) ?? { net: 0, vat: 0 };
      byRate.set(rate, { net: prev.net + net, vat: prev.vat + vat });
    }
    return [...byRate.entries()]
      .sort(([a], [b]) => a - b)
      .map(([rate, { net, vat }]) => ({
        rate,
        net: Math.round(net * 100) / 100,
        vat: Math.round(vat * 100) / 100,
        gross: Math.round((net + vat) * 100) / 100,
      }));
  }

  /** Grand gross = net sum + VAT sum for all items. */
  function sumGross(items: VatLine[]): number {
    return groupByVat(items).reduce((s, g) => s + g.gross, 0);
  }

  return {
    chf,
    lineTotal,
    sumLineItems,
    sumAmounts,
    formatChf,
    formatChfFromNumber,
    lineNet,
    lineVat,
    groupByVat,
    sumGross,
  };
}
