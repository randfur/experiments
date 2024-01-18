function main() {
  const textarea = document.createElement('textarea');
  textarea.style = `
    width: 80vw;
    height: 400px;
  `;

  const button = document.createElement('button');
  button.textContent = 'Expand';

  const br = document.createElement('br');

  const output = document.createElement('pre');

  document.body.append(
    textarea,
    button,
    br,
    output,
  );

  button.addEventListener('click', event => {
    output.textContent = parseAndExpand(textarea.textContent);
  });

  document.body.append(parseAndExpand('abc = (4*def + ghi*X) * jkl*Y'));
}

main();

function parseAndExpand(input) {
  const tokenTree = tokenise(input);
  return tokenTree.join('|');
}

function tokenise(input) {
  const stack = [{
    ident: '',
    children: [],
  }];

  let index = 0;

  function consume(predicate) {
    const start = index;
    while (true) {
      ++index;
      if (index >= input.length || !predicate(index)) {
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
  function popStack() {
    const frame = stackFrame();
    stack.length -= 1;
    return frame;
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
        const group = {
          ident,
          children: [],
        };
        stack.push(group);
        continue;
      }

      stackFrame.children.push({
        ident,
      });
      continue;
    }

    if (next() === '(') {
      const group = {
        ident: '',
        children: [],
      };
      stack.push(group);
      continue;
    }

    if (isNumeric(next())) {
      const number = consume(isNumeric);

  }

  if (stack.length !== 1) {
    return ['bad braces'];
  }
  return stack[0];
}

function isAlpha(char) {
  return /[A-Za-z]/.test(char);
}

function isNumeric(char) {
  return /[A-Za-z0-9]/.test(char);
}

function isWhitespace(char) {
  return /\s/.test(char);
}