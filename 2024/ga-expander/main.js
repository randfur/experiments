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
  button.addEventListener('click', () => {
    processInput();
    location.hash = encodeURIComponent(textarea.value);
  });

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

  function processHash() {
    textarea.value = decodeURIComponent(location.hash.slice(1));
    processInput();
  }

  window.addEventListener('hashchange', processHash);

  if (location.hash === '') {
    // textarea.value = trim(`\
    //   a = 1 + 2 + 3;
    //   b = 4 + 5 + 6;
    //
    //   a*b
    // `);
    // textarea.value = trim(`\
    //   a = (1+2+3)*(dog+pants);
    //   b = a*v + conjugate(a*r);
    //
    //   a*b
    // `);
    // textarea.value = trim(`\
    //   v1 = a*B0+b*B1+c*B2+d*B3;
    //   v2 = e*B0+f*B1+g*B2+h*B3;
    //
    //   v1*v2
    // `);
    // textarea.value = trim(`\
    //   v1 = a*B0 + b*B1 + c*B2;
    //   v2 = d*B0 + e*B1 + f*B2;
    //   rotor = v1 * v2;
    //   position = g*B0 + h*B1 + i*B2;
    //
    //   conjugate(rotor) * position * rotor
    // `);
    textarea.value = trim(`\
      v1 = a*B0 + b*B1 + c*B2 + d*B3;
      v2 = e*B0 + f*B1 + g*B2 + h*B3;
      rotor = v1 * v2;
      position = i*B0 + j*B1 + k*B2 + l*B3;

      conjugate(rotor) * position * rotor
    `);
    processInput();
  } else {
    processHash();
  }
}

main();

function parseAndExpand(input) {
  const tokens = tokenise(input);
  const ast = astise(tokens);
  const inlinedSum = inlineAssignments(ast);
  const flatSum = flattenSum(inlinedSum);
  const groupedSum = groupBases(flatSum);
  const result = stringifyGroupedSum(groupedSum);
  return result;
}

function trim(text) {
  return text.split('\n').map(line => line.trim()).join('\n');
}