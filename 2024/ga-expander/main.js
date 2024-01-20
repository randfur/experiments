import {tokenise} from './tokeniser.js';
import {astise} from './astiser.js';

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

  parseAndExpand(`
    abc = (4*def + ghi*X) * jkl*Y;
    barkbark = abc * conjugate(abc);
    barkbark
  `);
}

main();

function parseAndExpand(input) {
  const tokens = tokenise(input);
  console.log(tokens);
  const ast = astise(tokens);
  console.log(ast);
}
