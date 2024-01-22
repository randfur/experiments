/*
import {FlatSum, FlatProduct} from './flatten-sum.js';

export function stringifyFlatSum(flatSum: FlatSum): string;
export function stringifyFlatProduct(flatProduct: FlatProduct): string;
*/
export function stringifyFlatSum(flatSum) {
  return flatSum.map((flatProduct, i) => {
    return (
      i === 0
        ? (flatProduct.number < 0 ? '-' : '')
        : (flatProduct.number < 0 ? ' - ' : ' + ')
      ) + stringifyFlatProduct(flatProduct);
  }).join('');
}

function stringifyFlatProduct(flatProduct) {
  return [
    ...(Math.abs(flatProduct.number) !== 1 ? [Math.abs(flatProduct.number)] : []),
    ...flatProduct.constants,
    ...flatProduct.bases,
  ].join('*');
}
