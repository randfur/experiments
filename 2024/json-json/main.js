async function main() {
  let index = 0;
  let json = '{';
  document.body.style.fontFamily = 'monospace';
  while (true) {
    await new Promise(requestAnimationFrame);
    json += `"${index}": "${encode(json[index++])}", `;
    document.body.textContent = json;
  }
}

function encode(char) {
  return char === '"' || char === '\\' ? '\\' + char : char;
}

main();