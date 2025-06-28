function main() {
  editor.style = `
    font-family: monospace;
  `;
  editor.contentEditable = true;
  
  window.addEventListener('keydown', event => {
    console.log(event);
    if (event.key == 'k' && event.ctrlKey) {
      const selection = window.getSelection();
      console.log(selection);
      if (selection.type == 'Range') {
        event.preventDefault();
      }
    }
  });
}
main();