import type { LineItem } from '@/fs/types';

/**
 * Heuristic page split for the line-item table on A4 letters: page 1 has
 * the letterhead+recipient+meta+intro taking up about half the page, so
 * it fits ~18 items. Continuation pages use almost the full A4 — about
 * ~28 items. The last page reserves space for the totals + closing block
 * (~6 row equivalents).
 */
const ITEMS_FIRST = 18;
const ITEMS_CONT = 28;
const LAST_PAGE_RESERVE = 6;

export interface PageSlice {
  items: LineItem[];
  pageNum: number;
  isFirst: boolean;
  isLast: boolean;
}

export function paginateLineItems(all: LineItem[]): PageSlice[] {
  if (all.length === 0) {
    return [{ items: [], pageNum: 1, isFirst: true, isLast: true }];
  }
  const slices: PageSlice[] = [];
  let i = 0;
  let isFirst = true;
  let pageNum = 1;
  while (i < all.length) {
    const max = isFirst ? ITEMS_FIRST : ITEMS_CONT;
    const remaining = all.length - i;
    const fitsAsLast = remaining <= max - LAST_PAGE_RESERVE;
    if (fitsAsLast) {
      slices.push({ items: all.slice(i), pageNum, isFirst, isLast: true });
      return slices;
    }
    slices.push({ items: all.slice(i, i + max), pageNum, isFirst, isLast: false });
    i += max;
    isFirst = false;
    pageNum += 1;
  }
  // Edge case: items fit exactly without triggering fitsAsLast
  if (slices.length > 0) slices[slices.length - 1].isLast = true;
  return slices;
}
