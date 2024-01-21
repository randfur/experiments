import {tokenise} from './tokeniser.js';
import {astise} from './astiser.js';
import {inlineAssignments} from './inline-assignments.js';
import {flattenSum} from './flatten-sum.js';

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
    output.textContent = parseAndExpand(textarea.value);
  });

  parseAndExpand(`
    a = 1 + 2 + 3;
    b = 4 + 5 + 6;
    a*b
  `);
}

main();

function parseAndExpand(input) {
  console.log(input);
  const tokens = tokenise(input);
  console.log(tokens);
  const ast = astise(tokens);
  console.log(ast);
  const inlinedSum = inlineAssignments(ast);
  console.log(inlinedSum);
  const flattenedSum = flattenSum(inlinedSum);
  console.log(flattenedSum);
}
