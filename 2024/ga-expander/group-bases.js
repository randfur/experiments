/*
import {FlatSum, FlatProduct} from './flatten-sum.js';

export type GroupedSum = Array<GroupedProduct>;
export type GroupedProduct = {
  scalarSum: Array<ScalarProduct>,
  bases: Array<string>,
};
export type ScalarProduct = {
  number: number,
  constants: Array<string>,
};

export function groupBases(flatSum: FlatSum): GroupedSum;
*/

export function groupBases(flatSum) {
  const basesMap = new Map();
  for (const flatProduct of flatSum) {
    const basesKey = flatProduct.bases.join('*');
    if (!basesMap.has(basesKey)) {
      basesMap.set(basesKey, []);
    }
    const scalarSum = basesMap.get(basesKey);
    scalarSum.push({
      number: flatProduct.number,
      constants: flatProduct.constants,
    });
  }

  return Array.from(basesMap.entries()).map(
    ([basesKey, scalarSum]) => ({
      scalarSum,
      bases: basesKey.split('*'),
    })
  );
}
