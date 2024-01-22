/*
import {Sum, Product, Term} from './astiser.js';

export type FlatSum = {type: 'flatSum', flatProducts: Array<FlatProduct>};
export type FlatProduct = {type: 'flatProduct', flatTerms: Array<FlatTerm>};
export type FlatTerm =
  | {type: 'number', value: number}
  | {type: 'ident', value: string}
  | {type: 'flatFunc', ident: string, flatArg: FlatSum};
  | {type: 'flatParens', flatSum: FlatSum};

export function flattenSum(sum: Sum): FlatSum;
function joinFlatSums(flatSums: Array<FlatSum>): FlatSum;
function flattenProduct(product: Product): FlatSum;
function flattenTerm(term: Term): FlatSum;
function multiplyFlatSums(lhsFlatSum: FlatSum | null, rhsFlatSum: FlatSum): FlatSum;
*/
export function flattenSum(sum) {
  return joinFlatSums(sum.products.map(flattenProduct));
}

function joinFlatSums(flatSums) {
  return {
    type: 'flatSum',
    flatProducts: flatSums.flatMap(
      flatSum => flatSum.flatProducts
    ),
  };
}

function flattenProduct(product) {
  return product.terms.reduce(
    (flatSum, term) => multiplyFlatSums(
      flatSum,
      flattenTerm(term),
    ),
    null,
  );
}

function flattenTerm(term) {
  if (term.type === 'parens') {
    return flattenSum(term.sum);
  }
  return {
    type: 'flatSum',
    flatProducts: [{
      type: 'flatProduct',
      flatTerms: [(() => {
        switch (term.type) {
        case 'number':
        case 'ident':
          return term;
        case 'func':
          return {
            type: 'flatFunc',
            ident: term.ident,
            flatArg: flattenSum(term.arg),
          };
        case 'parens':
          break;
        }
        console.assert(false);
      })()],
    }],
  };
}

function multiplyFlatSums(lhsFlatSum, rhsFlatSum) {
  if (lhsFlatSum === null) {
    return rhsFlatSum;
  };
  return {
    type: 'flatSum',
    flatProducts: lhsFlatSum.flatProducts.flatMap(
      lhsFlatProduct => rhsFlatSum.flatProducts.map(
        rhsFlatProduct => ({
          type: 'flatProduct',
          flatTerms: lhsFlatProduct.flatTerms.concat(rhsFlatProduct.flatTerms),
        })
      )
    ),
  };
}