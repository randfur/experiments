/*
export type Token =
  | { number: number }
  | { symbol: string }
  | { ident: string }
  | { func: string, children: Array<Token> }

export function tokenise(input: string): Token;
*/

export function tokenise(input) {
  const stack = [{
    func: '()',
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
      const ident = consume(isAlpha);
      if (next() === '(') {
        stack.push({
          func: ident,
          children: [],
        });
        ++index;
        continue;
      }

      stackFrame().children.push({
        ident,
      });
      continue;
    }

    if (next() === '(') {
      stack.push({
        func: '()',
        children: [],
      });
      ++index;
      continue;
    }

    if (isNumeric(next())) {
      stackFrame().children.push({
        number: parseFloat(consume(isNumeric)),
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
      symbol: next(),
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

function isNumeric(char) {
  return /[A-Za-z0-9\.]/.test(char);
}

function isWhitespace(char) {
  return /\s/.test(char);
}