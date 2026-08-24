import { describe, expect, it } from 'vitest';
import { numberClaims, writeQueue } from '@/stores/documents/persistence';

describe('numberClaims', () => {
  it('returns the desired number when free', () => {
    const numbers = numberClaims(() => false);
    expect(numbers.claim('R-100')).toBe('R-100');
  });

  it('bumps the numeric tail past taken numbers', () => {
    const taken = new Set(['R-100', 'R-101']);
    const numbers = numberClaims((n) => taken.has(n));
    expect(numbers.claim('R-100')).toBe('R-102');
  });

  it('treats in-flight claims as taken until released', () => {
    const numbers = numberClaims(() => false);
    expect(numbers.claim('R-100')).toBe('R-100');
    expect(numbers.claim('R-100')).toBe('R-101');
    numbers.release('R-100');
    expect(numbers.claim('R-100')).toBe('R-100');
  });

  it('appends -2 to a number without a numeric tail', () => {
    const numbers = numberClaims((n) => n === 'DRAFT');
    expect(numbers.claim('DRAFT')).toBe('DRAFT-2');
  });
});

describe('writeQueue', () => {
  it('runs writes to the same key strictly in order', async () => {
    const queue = writeQueue();
    const order: number[] = [];
    const slow = queue.enqueue('a', async () => {
      await new Promise((r) => setTimeout(r, 20));
      order.push(1);
    });
    const fast = queue.enqueue('a', async () => {
      order.push(2);
    });
    await Promise.all([slow, fast]);
    expect(order).toEqual([1, 2]);
  });

  it('keeps the queue alive after a failed write', async () => {
    const queue = writeQueue();
    await expect(queue.enqueue('a', () => Promise.reject(new Error('disk full')))).rejects.toThrow(
      'disk full',
    );
    const ran: string[] = [];
    await queue.enqueue('a', async () => {
      ran.push('next');
    });
    expect(ran).toEqual(['next']);
  });

  it('does not serialize writes across different keys', async () => {
    const queue = writeQueue();
    const order: string[] = [];
    const a = queue.enqueue('a', async () => {
      await new Promise((r) => setTimeout(r, 20));
      order.push('a');
    });
    const b = queue.enqueue('b', async () => {
      order.push('b');
    });
    await Promise.all([a, b]);
    expect(order).toEqual(['b', 'a']);
  });
});
