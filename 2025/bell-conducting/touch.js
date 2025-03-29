export function renderTouch(model) {
  const input = document.createElement('input');
  input.type = 'text';
  input.value = model.selected.touch;
  input.disabled = true;
  return input;
}
