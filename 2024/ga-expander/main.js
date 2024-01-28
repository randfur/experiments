import {tokenise} from './tokeniser.js';
import {astise} from './astiser.js';
import {inlineAssignments} from './inline-assignments.js';
import {flattenSum} from './flatten-sum.js';
import {groupBases} from './group-bases.js';
import {stringifyGroupedSum} from './stringify.js';

function main() {
  document.body.style = `
    font-family: monospace;
    font-size: 20px;
  `;

  const instructions = document.createElement('pre');
  instructions.textContent = `
    Identifiers on the left of an '=' assignment are aliases.
    Identifiers that start with a lower case are scalar constants.
    Identifiers that start with an upper case are basis vectors.
    The last expression gets expanded.
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
    instructions,
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
  // textarea.value = `
  //   v1 = a*X + b*Y + c*Z;
  //   v2 = d*X + e*Y + f*Z;
  //   rotor = v1 * v2;
  //   position = g*X + h*Y + i*Z;
  //   conjugate(rotor) * position * rotor
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
  const tokens = tokenise(input);
  const ast = astise(tokens);
  const inlinedSum = inlineAssignments(ast);
  const flatSum = flattenSum(inlinedSum);
  const groupedSum = groupBases(flatSum);
  const result = stringifyGroupedSum(groupedSum);
  return result;
}
