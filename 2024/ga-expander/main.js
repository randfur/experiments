import {tokenise} from './tokeniser.js';
import {astise} from './astiser.js';
import {inlineAssignments} from './inline-assignments.js';
import {flattenSum} from './flatten-sum.js';
import {stringifyFlatSum} from './stringify.js';

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

  function processInput() {
    output.textContent = parseAndExpand(textarea.value);
  }
  button.addEventListener('click', processInput);

  // textarea.value = `
  //   a = 1 + 2 + 3;
  //   b = 4 + 5 + 6;
  //   a*b
  // `;
  // textarea.value = `
  //   a = (1+2+3)*(dog+pants);
  //   b = a*v + conjugate(a*r);
  //   a*b
  // `;
  textarea.value = `
    v1 = a*X+b*Y+c*Z+d*W;
    v2 = e*X+f*Y+g*Z+h*W;
    v1*v2
  `;
  processInput();
}

// DevTools attaches late.
setTimeout(main, 100);

function parseAndExpand(input) {
  console.log(input);
  const tokens = tokenise(input);
  console.log(tokens);
  const ast = astise(tokens);
  console.log(ast);
  const inlinedSum = inlineAssignments(ast);
  console.log(inlinedSum);
  const flatSum = flattenSum(inlinedSum);
  console.log(flatSum);
  const result = stringifyFlatSum(flatSum);
  console.log(result);
  return result;
}
