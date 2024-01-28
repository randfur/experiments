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
      scalarSum: groupScalarSum(scalarSum),
      bases: splitBy(basesKey, '*'),
    })
  ).filter(groupedProduct => groupedProduct.scalarSum.length > 0);
}

function groupScalarSum(scalarSum) {
  const constantsMap = new Map();

  for (const scalarProduct of scalarSum) {
    const constantsKey = scalarProduct.constants.join('*');
    if (!constantsMap.has(constantsKey)) {
      constantsMap.set(constantsKey, 0);
    }
    constantsMap.set(
      constantsKey,
      constantsMap.get(constantsKey) + scalarProduct.number,
    );
  }

  return Array.from(constantsMap.entries()).map(
    ([constantsKey, number]) => ({
      number,
      constants: splitBy(constantsKey, '*'),
    })
  ).filter(scalarProduct => scalarProduct.number !== 0);
}

function splitBy(string, separator) {
  if (string === '') {
    return [];
  }
  return string.split(separator);
}
