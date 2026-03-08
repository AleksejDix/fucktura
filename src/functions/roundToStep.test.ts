import { describe, expect, it } from 'vitest';
import { roundToStep } from './roundToStep';

describe('round with steps', () => {
  it('can round 1301234 to 1300000 with step 10000', () => {
    expect(roundToStep(1301234, 10000)).toBe(1300000);
  });

  it('will not round 1.9999 to 2.0 with default step (=1)', () => {
    expect(roundToStep(1.9999)).toBe(1.9999);
  });

  it('will round 10.1 to 10.0 with default step (=1)', () => {
    expect(roundToStep(10.1)).toBe(10);
  });

  it('will not round 19.99 to 100 with step 10', () => {
    expect(roundToStep(19.99, 10)).toBe(19.99);
  });

  it('will round 100.9999 to 100 with step 10', () => {
    expect(roundToStep(100.9999, 10)).toBe(100);
  });

  it('will not round 499.99999 to 500 with step 250', () => {
    expect(roundToStep(499.99999, 250)).toBe(499.99999);
  });

  it('will round 500.1 to 500 with step 250', () => {
    expect(roundToStep(500.1, 250)).toBe(500);
  });

  it('will round the value without excessive decimal points', () => {
    const values = [3.3, 2.9, 3.8, 3.3, 3.6];
    const sum = values.reduce((x, acc) => x + acc);
    const avg = sum / values.length;

    expect(roundToStep(avg, 0.5)).toBe(3.5);
  });
});
