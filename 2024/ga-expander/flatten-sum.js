/*
import {Sum, Product, Term} from './astiser.js';

export type FlatSum = Array<FlatProduct>;
export type FlatProduct = Array<FlatTerm>;
export type FlatTerm = {number: number} | {ident: string} | {func: string, flatSum: FlatSum};

export function flattenSum(sum: Sum): FlatSum;
function flattenProduct(product: Product): FlatSum;
function flattenTerm(term: Term): FlatSum;
*/
export function flattenSum(sum) {
  return sum.flatMap(flattenProduct);
}

function flattenProduct(product) {
  return product.reduce((flatSum, term) => multiplyFlatSums(flatSum, flattenTerm(term)));
}

function flattenTerm(term) {
  if (term.func === '()') {
    return flattenSum(term.sum);
  }
  if (term.func) {
    return [[{
      func: term.func,
      flatSum: flattenSum(term.sum),
    }]];
  }
  return [[term]];
}

function multiplyFlatSums(lhsFlatSum, rhsFlatSum) {
  return lhsFlatSum.flatMap(
    lhsFlatProduct => rhsFlatSum.map(
      rhsFlatProduct => lhsFlatProduct.concat(rhsFlatProduct)
    )
  );
}