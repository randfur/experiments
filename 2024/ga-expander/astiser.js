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

export type Sum = Array<Product>;
export type Product = Array<Term>;
export type Term = {number: number} | {ident: string} | {func: string, sum: Sum};

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
    throw 'Not 1 =';
  }

  const [identTokens, sumTokens] = tokenss;
  if (identTokens.length !== 1 || !identTokens[0].ident) {
    throw 'Bad assignment ident';
  }
  const ident = identTokens[0].ident;

  return {
    ident,
    sum: parseSum(sumTokens),
  };
}

function parseSum(tokens) {
  return splitBySymbol(tokens, '+').map(parseProduct);
}

function parseProduct(tokens) {
  return splitBySymbol(tokens, '*').map(tokens => {
    if (tokens.length !== 1) {
      throw 'Bad product';
    }
    const token = tokens[0];
    if (token.symbol) {
      throw 'Unexpected symbol';
    }
    if (token.func) {
      return {
        func: token.func,
        sum: parseSum(token.children),
      };
    }
    return token;
  });
}

function splitBySymbol(tokens, symbol) {
  const result = [];
  let current = [];
  for (const token of tokens) {
    if (token.symbol === symbol) {
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
