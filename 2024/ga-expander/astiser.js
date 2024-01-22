/*
import {Token} from './tokeniser.js';

export type AST = {
  assignments: Array<Assignment>,
  sum: Sum,
};

export type Assignment {
  ident: string,
  sum: Sum,
};

export type Sum = {type: 'sum', products: Array<Product>};
export type Product = {type: 'product', terms: Array<Term>};
export type Term =
  | {type: 'number', value: number}
  | {type: 'ident', value: string}
  | {type: 'func', ident: string, arg: Sum};
  | {type: 'parens', sum: Sum}

export function astise(tokens: Array<Token>): AST;
*/

export function astise(tokens) {
  const result = {
    assignments: [],
    sum: null,
  };
  const tokenss = splitBySymbol(tokens, ';');
  for (let i = 0; i < tokenss.length; ++i) {
    const tokens = tokenss[i];
    if (i < tokenss.length - 1) {
      result.assignments.push(parseAssignment(tokens));
    } else {
      result.sum = parseSum(tokens);
    }
  }
  return result;
}

function parseAssignment(tokens) {
  const tokenss = splitBySymbol(tokens, '=');
  if (tokenss.length !== 2) {
    throw `Wrong number of =: ${JSON.stringify(tokenss)}`;
  }

  const [identTokens, sumTokens] = tokenss;
  if (identTokens.length !== 1 || identTokens[0].type !== 'ident') {
    throw `Bad assignment ident: ${JSON.stringify(identTokens)}`;
  }
  const ident = identTokens[0].value;

  return {
    ident,
    sum: parseSum(sumTokens),
  };
}

function parseSum(tokens) {
  return {
    type: 'sum',
    products: splitBySymbol(tokens, '+').map(parseProduct),
  };
}

function parseProduct(tokens) {
  return {
    type: 'product',
    terms: splitBySymbol(tokens, '*').map(tokens => {
      if (tokens.length !== 1) {
        throw `Too many tokens in product term: ${JSON.stringify(tokens)}`;
      }
      const token = tokens[0];
      switch (token.type) {
      case 'symbol':
        throw `Unexpected symbol: ${JSON.stringify(token)}`;
      case 'number':
      case 'ident':
        return token;
      case 'func':
        return {
          type: 'func',
          ident: token.ident,
          arg: parseSum(token.children),
        };
      case 'parens':
        return {
          type: 'parens',
          sum: parseSum(token.children),
        };
      }
      throw `Unknown type: ${JSON.stringify(token)}`;
    }),
  };
}

function splitBySymbol(tokens, symbol) {
  const result = [];
  let current = [];
  for (const token of tokens) {
    if (token.type === 'symbol' && token.value === symbol) {
      result.push(current);
      current = [];
    } else {
      current.push(token);
    }
  }
  if (current.length > 0) {
    result.push(current);
  }
  return result;
}
