function render(state, element) {
  if (!element) {
    element = document.createElement('div');
  }
  element.textContent = state.text;
  return element;
}

function rerenderDiff() {
  
}

function main() {
  const state = {
    text: 'dogs',
  };
  document.body.appendChild(render(state, null));
  state.text += ' are the best';
  rerenderDiff();
}
main();