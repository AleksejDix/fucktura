import { describe, expect, it } from 'vitest';
import { paginateLineItems } from '@/lib/paginate';
import type { LineItem } from '@/fs/types';

function items(n: number): LineItem[] {
  return Array.from({ length: n }, (_, i) => ({
    pos: i + 1,
    description: `Item ${i + 1}`,
    code: '',
    quantity: 1,
    unit: 'h',
    unitPrice: 10,
  }));
}

describe('paginateLineItems', () => {
  it('returns one empty last page for no items', () => {
    expect(paginateLineItems([])).toEqual([{ items: [], pageNum: 1, isFirst: true, isLast: true }]);
  });

  it('keeps a short invoice on a single page', () => {
    const pages = paginateLineItems(items(10));
    expect(pages).toHaveLength(1);
    expect(pages[0]).toMatchObject({ pageNum: 1, isFirst: true, isLast: true });
    expect(pages[0].items).toHaveLength(10);
  });

  it('splits once the totals block no longer fits under the items', () => {
    const pages = paginateLineItems(items(20));
    expect(pages).toHaveLength(2);
    expect(pages[0].items).toHaveLength(18);
    expect(pages[0]).toMatchObject({ isFirst: true, isLast: false });
    expect(pages[1].items).toHaveLength(2);
    expect(pages[1]).toMatchObject({ pageNum: 2, isFirst: false, isLast: true });
  });

  it('marks the final slice as last when items fill pages exactly', () => {
    const pages = paginateLineItems(items(18 + 28));
    expect(pages).toHaveLength(2);
    expect(pages[1].isLast).toBe(true);
  });

  it('keeps every item exactly once across pages', () => {
    const all = items(75);
    const pages = paginateLineItems(all);
    const flattened = pages.flatMap((p) => p.items);
    expect(flattened).toEqual(all);
  });
});
