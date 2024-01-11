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
}

main();

function parseAndExpand(input) {
  return 'dog';
}