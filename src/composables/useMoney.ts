import { dinero, add, multiply, toDecimal } from 'dinero.js';
import { CHF } from 'dinero.js';

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

  return { chf, lineTotal, sumLineItems, sumAmounts, formatChf, formatChfFromNumber };
}
