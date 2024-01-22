/*
import {FlatSum, FlatProduct, FlatTerm} from './flatten-sum.js';

export function stringifyFlatSum(flatSum: FlatSum): string;
export function stringifyFlatProduct(flatProduct: FlatProduct): string;
export function stringifyFlatTerm(flatProduct: FlatProduct): string;
*/
export function stringifyFlatSum(flatSum) {
  return flatSum.flatProducts.map(stringifyFlatProduct).join(' + ');
}

function stringifyFlatProduct(flatProduct) {
  return flatProduct.flatTerms.map(stringifyFlatTerm).join('*');
}

function stringifyFlatTerm(flatTerm) {
  switch (flatTerm.type) {
  case 'number':
  case 'ident':
    return flatTerm.value.toString();
  case 'flatFunc':
    return `${flatTerm.ident}(${stringifyFlatSum(flatTerm.flatArg)})`;
  case 'flatParens':
    return `(${stringifyFlatSum(flatTerm.flatSum)})`;
  }
  console.assert(false);
}

