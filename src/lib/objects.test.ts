import { describe, expect, test } from 'vitest';
import { pick } from './objects';

describe('pick', () => {
  test('returns new object with passed keys only', () => {
    const res1 = pick({ a: 1, b: 2, c: 3 }, ['a', 'c']);
    expect(res1).toEqual({ a: 1, c: 3 });

    const res2 = pick({ a: 1, b: 2, c: 3 }, ['b', 'c']);
    expect(res2).toEqual({ b: 2, c: 3 });

    const res3 = pick(['a', 'b'], [1]);
    expect(res3).toEqual({ 1: 'b' });
  });
});
