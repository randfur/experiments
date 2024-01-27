/*
import {Sum, Product, Term} from './astiser.js';

export type FlatSum = Array<FlatProduct>;
export type FlatProduct = {
  number: number,
  constants: Array<string>,
  bases: Array<string>,
};

export function flattenSum(sum: Sum): FlatSum;
function flattenProduct(product: Product): FlatSum;
function flattenTerm(term: Term): FlatSum;
function multiplyFlatSums(lhsFlatSum: FlatSum | null, rhsFlatSum: FlatSum): FlatSum;
function multiplyFlatProducts(lhsFlatProduct: FlatProduct, rhsFlatProduct: FlatProduct): FlatSum;
function isBasisIdent(ident: string): boolean;
function flattenBases(bases: Array<string>): {sign: number: bases: Array<string>};
*/

export function flattenSum(sum) {
  return sum.products.flatMap(flattenProduct);
}

function flattenProduct(product) {
  return product.terms.map(flattenTerm).reduce(multiplyFlatSums).map(
    flatProduct => ({
      number: flatProduct.number,
      constants: flatProduct.constants.sort(),
      bases: flatProduct.bases,
    })
  );
}

function flattenTerm(term) {
  switch (term.type) {
  case 'number':
    return [{
      number: term.value,
      constants: [],
      bases: [],
    }];
  case 'ident':
    if (isBasisIdent(term.value)) {
      return [{
        number: 1,
        constants: [],
        bases: [term.value],
      }];
    } else {
      return [{
        number: 1,
        constants: [term.value],
        bases: [],
      }];
    }
  case 'conjugate':
    return flattenSum(term.arg).map(flatProduct => {
      if (flatProduct.bases.length > 0) {
        flatProduct.number *= -1;
      }
      return flatProduct;
    });
  case 'parens':
    return flattenSum(term.sum);
  }
  throw `Unknown type: ${JSON.stringify(term)}`;
  return result;
}

function multiplyFlatSums(lhsFlatSum, rhsFlatSum) {
  return lhsFlatSum.flatMap(
    lhsFlatProduct => rhsFlatSum.map(
      rhsFlatProduct => multiplyFlatProducts(lhsFlatProduct, rhsFlatProduct)
    )
  );
}

function multiplyFlatProducts(lhsFlatProduct, rhsFlatProduct) {
  const {sign, bases} = flattenBases(lhsFlatProduct.bases.concat(rhsFlatProduct.bases));
  return {
    number: sign * lhsFlatProduct.number * rhsFlatProduct.number,
    constants: lhsFlatProduct.constants.concat(rhsFlatProduct.constants),
    bases,
  };
}

function isBasisIdent(ident) {
  return ident[0] === ident[0].toUpperCase();
}

function flattenBases(bases) {
  let sign = 1;
  const orderedBases = [];
  while (bases.length > 0) {
    let minIndex = 0;
    let minBasis = bases[0];
    for (let i = 1; i < bases.length; ++i) {
      if (bases[i] < minBasis) {
        minIndex = i;
        minBasis = bases[i];
      }
    }
    orderedBases.push(minBasis);
    sign *= (-1) ** minIndex;
    bases.splice(minIndex, 1);
  }
  return {
    sign,
    bases: orderedBases.filter(
      (basis, i, bases) => (i === 0 || basis != bases[i - 1]) && (i === bases.length - 1 || basis != bases[i + 1])
    ),
  };
}