/*
import {Token} from './tokeniser.js';

type AST = {
  assignments: Array<Assignment>,
  expression: Sum,
};

type Assignment {
  ident: string,
  expression: Sum,
};

type Sum = Array<Product>;

type Product = {
  number: number,
  unknownIdents: Set<string>,
  scalarIdents: Set<string>,
  basisVectorIdents: Set<string>,
};

export function astise(tokens: Array<Token>): AST;
*/

export function astise(tokens) {
  return null;
}

function splitBy(tokens, predicate) {
}

function isSymbol(symbol, token) {
  return 'symbol' in token && token.symbol === symbol;
}