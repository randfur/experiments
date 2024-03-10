function main() {
  const canvas = document.createElement('canvas');
  canvas.width = 1000;
  canvas.height = 500;
  const textarea = document.createElement('textarea');
  textarea.style.width = '1000px';
  textarea.style.height = '500px';
  document.body.append(canvas, document.createElement('br'), textarea);

  textarea.addEventListener('input', event => {
    console.log(textarea.value);
  });
}

main();