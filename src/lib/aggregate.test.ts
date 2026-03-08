import { describe, expect, test } from 'vitest';
import {
  inputConfig1,
  inputConfig2,
  inputConfig3,
  inputData,
} from './__fixtures__/aggregate/input';
import * as aggregateOutput from './__fixtures__/aggregate/output';
import { aggregatedPoiList } from './aggregate';

describe('aggregate', () => {
  test('aggregates poi list to categories', () => {
    const aggregate1 = aggregatedPoiList(inputData, inputConfig1, 4);
    expect(aggregate1).toEqual(aggregateOutput.output1);

    const aggregate2 = aggregatedPoiList(inputData, inputConfig2, 4);
    expect(aggregate2).toEqual(aggregateOutput.output2);

    const aggregate3 = aggregatedPoiList(inputData, inputConfig3, 1);
    expect(aggregate3).toEqual(aggregateOutput.output3);
  });
});
