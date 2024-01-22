import {tokenise} from './tokeniser.js';
import {astise} from './astiser.js';
import {inlineAssignments} from './inline-assignments.js';
import {flattenSum} from './flatten-sum.js';
import {stringifyFlatSum} from './stringify.js';

function main() {
  document.body.style = `
    font-family: monospace;
    font-size: 20px;
  `;

  const textarea = document.createElement('textarea');
  textarea.style = `
    width: 80vw;
    height: 200px;
  `;

  const button = document.createElement('button');
  button.textContent = 'Expand';
  button.addEventListener('click', processInput);

  const output = document.createElement('div');

  document.body.append(
    textarea,
    document.createElement('br'),
    button,
    document.createElement('br'),
    output,
  );

  function processInput() {
    try {
      output.textContent = parseAndExpand(textarea.value);
    } catch (error) {
      output.textContent = error;
      throw error;
    }
  }

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
  // textarea.value = `
  //   v1 = a*X+b*Y+c*Z+d*W;
  //   v2 = e*X+f*Y+g*Z+h*W;
  //   v1*v2
  // `;
  textarea.value = `
    v1 = a*X + b*Y + c*Z + d*W;
    v2 = e*X + f*Y + g*Z + h*W;
    rotor = v1 * v2;
    position = i*X + j*Y + k*Z + l*W;
    conjugate(rotor) * position * rotor
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
