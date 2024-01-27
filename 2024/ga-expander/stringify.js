/*
import {FlatSum, FlatProduct} from './flatten-sum.js';
import {GroupedSum, GroupedProduct} from './group-bases.js';

export function stringifyFlatSum(flatSum: FlatSum): string;
function stringifyFlatProduct(flatProduct: FlatProduct): string;

export function stringifyGroupedSum(groupedSum: GroupedSum): string;
function stringifyGroupedProduct(groupedProduct: GroupedProduct): string;
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

export function stringifyGroupedSum(groupedSum) {
  return groupedSum.map(stringifyGroupedProduct).join(' + ');
}

function stringifyGroupedProduct(groupedProduct) {
  console.assert(groupedProduct.scalarSum.length > 0);
  return [
    `(${
      groupedProduct.scalarSum.map(stringifyScalarProduct).join(' + ')
    })`,
    ...groupedProduct.bases,
  ].join('*');
}

function stringifyScalarProduct(scalarProduct) {
  return [
    ...(() => {
      if (scalarProduct.number === 1) {
        return '';
      }
      if (scalarProduct.number === -1) {
        return '-';
      }
      if (scalarProduct.number === -1) {
        return number;
      }
    })(),
    scalarProduct.constants.join('*'),
  ].join('');
}