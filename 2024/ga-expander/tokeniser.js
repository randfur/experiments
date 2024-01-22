/*
export type Token =
  | { type: 'symbol', value: string }
  | { type: 'number', value: number }
  | { type: 'ident', value: string }
  | { type: 'func', ident: string, children: Array<Token> }
  | { type: 'parens', children: Array<Token> }

export function tokenise(input: string): Token;
*/

export function tokenise(input) {
  const stack = [{
    type: 'parens',
    children: [],
  }];

  let index = 0;

  function consume(predicate) {
    const start = index;
    while (true) {
      ++index;
      if (index >= input.length || !predicate(input[index])) {
        break;
      }
    }
    return input.slice(start, index);
  }
  function next() {
    return index < input.length ? input[index] : null;
  }
  function stackFrame() {
    return stack[stack.length - 1];
  }

  while (true) {
    if (index >= input.length) {
      break;
    }

    if (isWhitespace(next())) {
      consume(isWhitespace);
      continue;
    }

    if (isAlpha(next())) {
      const ident = consume(isAlphaNumeric);
      if (next() === '(') {
        stack.push({
          type: 'func',
          ident,
          children: [],
        });
        ++index;
        continue;
      }

      stackFrame().children.push({
        type: 'ident',
        value: ident,
      });
      continue;
    }

    if (next() === '(') {
      stack.push({
        type: 'parens',
        children: [],
      });
      ++index;
      continue;
    }

    if (isNumeric(next())) {
      stackFrame().children.push({
        type: 'number',
        value: parseFloat(consume(isNumeric)),
      });
      continue;
    }

    if (next() === ')') {
      const frame = stackFrame();
      stack.length -= 1;
      stackFrame().children.push(frame);
      ++index;
      continue;
    }

    stackFrame().children.push({
      type: 'symbol',
      value: next(),
    });
    ++index;
  }

  if (stack.length !== 1) {
    console.log(stack);
    throw 'Bad braces';
  }
  return stack[0].children;
}

function isAlpha(char) {
  return /[A-Za-z]/.test(char);
}

function isAlphaNumeric(char) {
  return /[A-Za-z0-9]/.test(char);
}

function isNumeric(char) {
  return /[0-9\.]/.test(char);
}

function isWhitespace(char) {
  return /\s/.test(char);
}