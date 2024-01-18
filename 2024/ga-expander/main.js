import {tokenise} from './tokeniser.js';

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

  document.body.append(parseAndExpand(`
    abc = (4*def + ghi*X) * jkl*Y;
    barkbark = abc * conjugate(abc);
    barkbark
  `));
}

main();

function parseAndExpand(input) {
  const tokenTree = tokenise(input);
  console.log(tokenTree);
  const astiser = astise(tokenTree);
  console.log(ast);
  return JSON.stringify(ast);
}
